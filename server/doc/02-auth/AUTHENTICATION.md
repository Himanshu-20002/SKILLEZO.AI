# SKILLEZO Backend — Authentication Guide

This document details the authentication architecture and integration rules for frontend applications.

---

## 1. Authentication Architecture

SKILLEZO uses **Better Auth** for identity management, user registration, login, and session persistence.

```
Frontend Application
   │
   ├── (1) HTTP Request with Credentials (`credentials: "include"`)
   ▼
Better Auth Handler (`/api/auth/*`)
   │
   ├── (2) Validates credentials / issues HTTP-Only Session Cookie
   ▼
Protected Express Routes (`/api/profile/*`, `/api/companies/*`)
   │
   ├── (3) Executed `requireAuth` Middleware
   │      └── Calls `auth.api.getSession({ headers: req.headers })`
   │
   ├── (4) Populates `req.user` object
   ▼
Express Controller & Service Layer
```

---

## 2. The `req.user` Identity Object

When `requireAuth` passes successfully, the backend populates `req.user` on the Express Request object:

```typescript
export interface AuthUser {
  id: string;              // Better Auth User ID string
  email: string;           // User email address
  name?: string;           // Optional display name
  role: string;            // User system role (e.g. "user", "admin")
  emailVerified: boolean;  // Whether email address is verified
  accountStatus: string;   // Account status ("active", "suspended", "deactivated")
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Protected API Requests

Every API call to protected endpoints must include browser credentials so that session cookies are automatically attached.

### Axios Integration Example
```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // MANDATORY: Sends HTTP-only session cookies
});
```

### Fetch Integration Example
```typescript
const response = await fetch("http://localhost:5000/api/profile/me", {
  method: "GET",
  credentials: "include", // MANDATORY: Sends HTTP-only session cookies
  headers: {
    "Accept": "application/json",
  },
});
```

---

## 4. Unauthenticated Requests (`401 Unauthorized`)

If a request reaches a protected route without a valid session cookie:
- `requireAuth` rejects the request immediately.
- Returns HTTP Status `401 Unauthorized`.

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please log in.",
    "details": null
  }
}
```

---

## 5. Strict Security Anti-Patterns (What Frontend Must NOT Do)

> [!CAUTION]
> 1. **Do NOT construct custom JWTs or session tokens**: Authentication is 100% cookie-driven via Better Auth.
> 2. **Do NOT pass `userId` in client request bodies**: The backend automatically extracts `req.user.id` from the verified session. Client-supplied `userId` inputs are ignored or rejected.
> 3. **Do NOT store auth state in `localStorage` as an authorization authority**: Rely on backend `/api/auth/get-session` responses.
