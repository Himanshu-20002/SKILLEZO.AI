# Phase 10C — Authentication Middleware & Protected Route Foundation

## 1. Objective & Architecture

Phase 10C establishes a clean authentication boundary between Better Auth session management and the SKILLEZO application layer via `requireAuth` middleware.

```text
                  HTTP REQUEST
                       │
                       ▼
                    EXPRESS
                       │
                       ▼
                requireAuth Middleware
                       │
                       ▼
             Better Auth Session API
                       │
              ┌────────┴────────┐
              │                 │
          No Session         Valid Session
              │                 │
              ▼                 ▼
          HTTP 401          req.user (AuthenticatedUserContext)
                                │
                                ▼
                        Future Controllers
                                │
                                ▼
                         Future Services
                                │
                                ▼
                          Repositories
```

---

## 2. Authenticated User Context & Express Typing

### `AuthenticatedUserContext` Interface
Defined in [src/core/auth/auth.types.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/core/auth/auth.types.ts):

```ts
export interface AuthenticatedUserContext {
  id: string; // Strictly string (Better Auth User ID)
  email: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
}
```

### Express Request Type Merging
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

---

## 3. `requireAuth` Middleware Implementation

Implemented in [src/core/auth/middleware/requireAuth.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/core/auth/middleware/requireAuth.ts):

1. **Header Extraction**: Uses `fromNodeHeaders(req.headers)`.
2. **Session Lookup**: Invokes `auth.api.getSession()`.
3. **Unauthenticated Check**: If no session/user, yields `HTTP 401 Unauthorized`.
4. **Account Status Validation**:
   - `SUSPENDED` → `HTTP 403 Forbidden` (`ACCOUNT_SUSPENDED`).
   - `DEACTIVATED` → `HTTP 403 Forbidden` (`ACCOUNT_DEACTIVATED`).
5. **Context Attachment**: Attaches strongly-typed `userContext` to `req.user` and calls `next()`.

---

## 4. Authentication vs. Authorization Boundary

- **Authentication ("Who are you?")**: Handled strictly by Better Auth and `requireAuth`.
- **Authorization ("What can you do?")**: Not handled in `requireAuth`. Role-based permissions (`requireCandidate`, `requireRecruiter`, `canManageCompany`) belong to future authorization middleware & services.

---

## 5. Security Rules & User ID Handling

- **Source of Truth**: Controllers and services must read `req.user.id` as the identity source of truth for current user operations. Clients cannot override user identity using `req.body.userId`, `req.params.userId`, or `req.query.userId`.
- **ID Preservation**: `req.user.id` remains typed as `string` and is never converted to a MongoDB `ObjectId`.

---

## 6. Temporary Test Endpoint

- **Endpoint**: `GET /api/auth-test/protected` mounted in [src/routes/testAuth.routes.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/routes/testAuth.routes.ts).
- **Behavior**:
  - Without Session → `401 Unauthorized` (`"Authentication required to access this resource"`).
  - Active Session → `200 OK` returning `{ authenticated: true, user: req.user }`.

---

## 7. Verification Results

| Verification | Command / Check | Result |
| :--- | :--- | :---: |
| **TypeScript Check** | `npm run type-check` | ✅ **0 Errors** |
| **Build Compilation** | `npm run build` | ✅ **PASSED (`tsc && tsc-alias`)** |
| **Compiled Module Export** | `node -e "require('./dist/core/auth')"` | ✅ **requireAuth Exported (`true`)** |
| **Health Endpoints** | `GET /api/health`, `GET /api/health/ready` | ✅ **Functional** |

---

**NEXT PHASE**: **PHASE 11 — Core Application Layer Foundation (Profile Business Module)**
