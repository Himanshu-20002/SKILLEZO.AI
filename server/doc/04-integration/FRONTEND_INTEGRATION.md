# SKILLEZO Backend — Frontend Integration Guide

This guide provides frontend engineers with actionable rules, state management patterns, and integration practices for interacting with the SKILLEZO backend API.

---

## 1. HTTP Client Configuration

To ensure seamless session cookie propagation across environments, configure your HTTP client with cross-origin credentials enabled.

### Axios Setup
```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});
```

---

## 2. Managing UI States (Loading, Empty, Error)

Frontend components fetching backend resources must cleanly handle three distinct UI states:

```tsx
function ProfileView() {
  const { data: profile, isLoading, error } = useProfile();

  // 1. Loading State
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // 2. Empty State (404 Profile Not Found)
  if (error?.response?.status === 404) {
    return <CreateProfilePromptCTA />;
  }

  // 3. Error State (500 or Network failure)
  if (error) {
    return <ErrorBanner message={error.response?.data?.error?.message || "Failed to load profile"} />;
  }

  // Success Rendering
  return <ProfileContent profile={profile} />;
}
```

---

## 3. Form Validation Synchronization

When the backend returns a `400 Bad Request` with `code: "VALIDATION_ERROR"`, parse `error.details` to populate form library errors (e.g. React Hook Form):

```typescript
if (error?.response?.status === 400 && error.response.data?.error?.code === "VALIDATION_ERROR") {
  const details = error.response.data.error.details;
  if (Array.isArray(details)) {
    details.forEach(({ field, message }) => {
      setError(field, { type: "server", message });
    });
  }
}
```

---

## 4. Identity Rule (Frontend Security)

> [!CAUTION]
> Frontend code should **NEVER** send `userId`, `createdBy`, or `changedBy` in request bodies for ownership-sensitive operations. The backend derives user identity strictly from the verified session (`req.user.id`).

---

## 5. Frontend Anti-Patterns Checklist

- ❌ **Do NOT rely on localStorage for authorization**: User role or company membership in `localStorage` can be modified by the user. Always handle HTTP `403 Forbidden` responses gracefully.
- ❌ **Do NOT auto-mutate company slugs on frontend name edits**: Slugs are stable entity identifiers. The backend ignores slug changes during `PATCH /api/companies/:companyId`.
- ❌ **Do NOT pass `createdBy` or `userId` in POST body payloads**: The server automatically extracts identity from the authenticated session.
