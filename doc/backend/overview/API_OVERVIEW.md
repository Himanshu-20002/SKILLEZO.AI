# SKILLEZO Backend — API Overview

## 📍 Quick Navigation
[Authentication](../02-auth/AUTHENTICATION.md) | 
[Authorization](../02-auth/AUTHORIZATION.md) | 
[Error Handling](../02-auth/ERROR_HANDLING.md) | 
[Profile API](../03-api/profile/PROFILE_API.md) | 
[Company API](../03-api/company/COMPANY_API.md) | 
[Frontend Integration](../04-integration/FRONTEND_INTEGRATION.md) | 
[API Flows](../04-integration/API_FLOWS.md)

---

## API Base URL

* **Development Environment**: `http://localhost:5000/api`
* **Production Environment**: Defined via deployment environment variable (`API_URL`)

All endpoint paths documented in this system are relative to the `/api` base URL unless explicitly stated otherwise.

---

## Authentication Mechanism

Authentication across the application is managed via **Better Auth** using **HTTP-Only Session Cookies**. 
* Requests requiring authentication must include credentials (`credentials: "include"` in `fetch` or `withCredentials: true` in `axios`).
* The backend inspects incoming cookies via the `requireAuth` Express middleware and populates `req.user`.

---

## API Module Map

| Module | Base Path | Status | Authentication | Authorization |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `/auth` | Implemented | Better Auth | Public / Guest |
| **Candidate Profile** | `/profile` | Implemented | Required | Candidate (Self) |
| **Companies** | `/companies` | Implemented | Required for Mutation | Owner / Admin |
| **Company Members** | `/companies/:companyId/members` | Not Implemented | — | — |
| **Resume Processing** | `/resumes` | Not Implemented | — | — |
| **Jobs** | `/jobs` | Not Implemented | — | — |
| **Career Plan** | `/career-plan` | Not Implemented | — | — |
| **Applications** | `/applications` | Not Implemented | — | — |

---

## Standard Request Format

All `POST` and `PATCH` requests must send JSON data with the following HTTP request headers:

```http
Content-Type: application/json
Accept: application/json
```

---

## Standard Response Structure

The backend standardizes all HTTP API responses using consistent JSON wrappers (`successResponse` and `errorResponse`).

### 1. Success Response Structure (`200 OK`, `201 Created`)

```json
{
  "success": true,
  "data": {
    /* Returned entity, object, or array payload */
  }
}
```

### 2. Error Response Structure (`400`, `401`, `403`, `404`, `409`, `500`)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_CONSTANT",
    "message": "Human-readable error explanation",
    "details": null
  }
}
```

*When Zod validation fails (`400 Bad Request`), `details` contains array of field-level validation errors:*

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "name",
        "message": "Company name is required"
      }
    ]
  }
}
```

---

## Architectural Request Flow

```
Frontend Client
   │ (Cookie Header: credentials: true)
   ▼
Express Web Server
   │
   ├── RequireAuth Middleware (`requireAuth.ts`)
   │      └── Better Auth Session Check (`auth.api.getSession`)
   │
   ├── Input Validation Middleware (`validate.middleware.ts`)
   │      └── Zod Schema Parsing (`*.validator.ts`)
   │
   ├── Controller Handler (`*.controller.ts`)
   │      └── Formats API Response (`successResponse`)
   │
   ├── Service Layer (`*.service.ts`)
   │      └── Domain & Authorization Logic
   │
   └── Repository Layer (`*.repository.ts`)
          └── MongoDB / Mongoose Operations
```
