# SKILLEZO AI — Backend Authentication Architecture & Testing Guide

This document details the authentication architecture, security boundaries, and endpoint testing workflows implemented across **Phase 10A**, **Phase 10B**, and **Phase 10C**.

---

## 1. Authentication Architecture Overview

SKILLEZO follows an **Option A Identity Architecture**:
- **Better Auth Framework**: Serves as the single authentication authority for account credentials, password hashing, sessions, OAuth, and identity validation.
- **SKILLEZO Backend**: Manages domain business data (`Profile`, `Company`, `Job`, `Resume`, `CareerPlan`, `Application`). User references are stored as `string` (`userId`, `createdBy`, `invitedBy`).

```text
                        CLIENT REQUEST
                              │
                              ▼
                     EXPRESS APPLICATION
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       /api/auth/*path              Protected API Routes
               │                             │
               ▼                             ▼
      Better Auth Handler           requireAuth Middleware
     (Sign-Up, Sign-In,             (Validates Session API)
      Sign-Out, Session)                     │
               │                    ┌────────┴────────┐
               ▼                    │                 │
        MongoDB Adapter        No Session       Valid Session
       (users, sessions,            │                 │
        accounts)                   ▼                 ▼
                                HTTP 401          req.user
                                                      │
                                                      ▼
                                              Future Controllers
```

---

## 2. Authentication Boundary & Middleware (`requireAuth`)

### User Context Type (`AuthenticatedUserContext`)
Defined in [src/core/auth/auth.types.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/core/auth/auth.types.ts):
```ts
export interface AuthenticatedUserContext {
  id: string; // Better Auth user ID strictly preserved as string
  email: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
}
```

### Express Request Type Extension
Defined in [src/types/express.d.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/types/express.d.ts):
```ts
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
    }
  }
}
```

### Account Status Guard Logic
In [src/core/auth/middleware/requireAuth.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/core/auth/middleware/requireAuth.ts):
- `UNAUTHENTICATED`: Returns `401 Unauthorized`.
- `SUSPENDED`: Returns `403 Forbidden` (`ACCOUNT_SUSPENDED`).
- `DEACTIVATED`: Returns `403 Forbidden` (`ACCOUNT_DEACTIVATED`).
- `ACTIVE`: Attaches `req.user` and calls `next()`.

---

## 3. How to Test Authentication Endpoints

### Step 1: Start the Backend Server
Make sure MongoDB is running locally or configured via `.env` `MONGODB_URI`:
```bash
cd server
npm run dev
```

---

### Step 2: Unauthenticated Test (`401 Unauthorized`)
Try calling the protected test endpoint without a session:

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth-test/protected`

**Response (`401 Unauthorized`)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required to access this resource"
  }
}
```

---

### Step 3: Register a User (Better Auth Sign-Up)
Create a new user via Better Auth's native sign-up endpoint:

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/sign-up/email`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "user@skillezo.ai",
  "password": "Password123!",
  "name": "Test User"
}
```

**Response (`200 OK`)**:
```json
{
  "user": {
    "id": "better_auth_user_id_string",
    "email": "user@skillezo.ai",
    "name": "Test User",
    "role": "candidate",
    "accountStatus": "active"
  },
  "session": { ... }
}
```

---

### Step 4: Login (Better Auth Sign-In)
Authenticate to obtain an active session cookie:

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/sign-in/email`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "user@skillezo.ai",
  "password": "Password123!"
}
```

---

### Step 5: Access Protected Route (`200 OK`)
With the session cookie attached, request the protected endpoint:

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth-test/protected`

**Response (`200 OK`)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "better_auth_user_id_string",
    "email": "user@skillezo.ai",
    "role": "candidate",
    "emailVerified": false,
    "accountStatus": "active"
  }
}
```

---

### Step 6: Logout (Sign-Out)
Terminate the session:

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/sign-out`

Subsequent requests to `/api/auth-test/protected` will return `401 Unauthorized`.

---

## 4. Verification Summary

| Check | Command | Result |
| :--- | :--- | :---: |
| **TypeScript Type Check** | `npm run type-check` | ✅ **0 Errors** |
| **Build Compilation** | `npm run build` | ✅ **PASSED (`tsc && tsc-alias`)** |
| **Health Liveness** | `GET /api/health` | ✅ **200 OK** |
| **Health Readiness** | `GET /api/health/ready` | ✅ **200 OK** |
