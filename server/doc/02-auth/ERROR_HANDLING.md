# SKILLEZO Backend — Error Handling Guide

This guide details all HTTP status codes, application error codes, and frontend handling recommendations.

---

## 1. Error Mapping Reference Table

| HTTP Status | Application Error Code (`error.code`) | Meaning | Frontend Action |
| :---: | :--- | :--- | :--- |
| **`400`** | `VALIDATION_ERROR` | Request body or params failed Zod schema validation. | Highlight invalid input fields in the UI using `error.details`. |
| **`400`** | `BAD_REQUEST` | Malformed request or unparseable input. | Display toast notification with `error.message`. |
| **`401`** | `UNAUTHORIZED` | Unauthenticated request or expired session. | Redirect user to login page; clear local session state. |
| **`403`** | `FORBIDDEN` | Authenticated but lacks required role/membership. | Display "Access Denied" notice or disable restricted controls. |
| **`404`** | `NOT_FOUND` / `PROFILE_NOT_FOUND` / `COMPANY_NOT_FOUND` | Target resource does not exist in database. | Render empty/404 page state; offer creation CTA if applicable. |
| **`409`** | `CONFLICT` / `PROFILE_ALREADY_EXISTS` | Business conflict (e.g. duplicate slug or duplicate profile). | Prompt user with error message (e.g. "Company slug taken"). |
| **`500`** | `INTERNAL_SERVER_ERROR` | Unhandled exception in server execution pipeline. | Show generic error toast ("Something went wrong. Try again."). |

---

## 2. Validation Error Structure Example (`400 Bad Request`)

When Zod validation fails, `error.details` provides field-specific errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body parameters",
    "details": [
      {
        "field": "name",
        "message": "Company name is required"
      },
      {
        "field": "website",
        "message": "Invalid website URL"
      }
    ]
  }
}
```

---

## 3. Conflict Error Structure Example (`409 Conflict`)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Company slug 'acme-inc' already exists",
    "details": null
  }
}
```

---

## 4. Frontend Error Handling Pattern (TypeScript Example)

```typescript
export function handleApiError(error: any) {
  if (!error.response) {
    toast.error("Network error. Please check your internet connection.");
    return;
  }

  const { status, data } = error.response;
  const errorPayload = data?.error;

  switch (status) {
    case 401:
      toast.error("Session expired. Please log in again.");
      window.location.href = "/login";
      break;
    case 403:
      toast.error(errorPayload?.message || "You do not have permission for this action.");
      break;
    case 404:
      toast.error(errorPayload?.message || "Resource not found.");
      break;
    case 409:
      toast.error(errorPayload?.message || "Resource conflict.");
      break;
    case 400:
      if (errorPayload?.code === "VALIDATION_ERROR" && Array.isArray(errorPayload.details)) {
        // Map validation errors to form fields
        return errorPayload.details;
      }
      toast.error(errorPayload?.message || "Invalid input provided.");
      break;
    default:
      toast.error("An unexpected error occurred. Please try again later.");
  }
}
```
