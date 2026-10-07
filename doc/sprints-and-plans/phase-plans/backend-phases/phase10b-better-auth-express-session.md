# Phase 10B — Better Auth Express Handler & Session Verification

## 1. Objective & Overview

Phase 10B integrates Better Auth's HTTP request handler with the Express application pipeline and establishes the complete basic authentication lifecycle (`/api/auth/*` endpoints and server-side session resolution).

---

## 2. Express Integration & Middleware Order

In [src/server.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/server.ts), the Better Auth handler is mounted using `toNodeHandler(auth)` before `express.json()` to preserve raw request body access for Better Auth endpoints:

```ts
// 1. CORS
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// 2. Better Auth Node Handler (BEFORE express.json)
app.all("/api/auth/*path", (req, res) => {
  authHandler(req, res);
});

// 3. Body Parser
app.use(express.json({ limit: "1mb" }));

// 4. API Routes (/api/health, /api/health/ready)
app.use("/api", healthRouter);

// 5. Error & 404 Handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

> **Express v5 Path Note**: In Express v5 / `path-to-regexp` v8, wildcard paths are specified as `/api/auth/*path` instead of `/api/auth/*`.

---

## 3. Endpoints & Authentication Operations

Better Auth natively owns all authentication operations mounted automatically under `/api/auth/*path`:
- **Sign Up**: `POST /api/auth/sign-up/email`
- **Sign In**: `POST /api/auth/sign-in/email`
- **Sign Out**: `POST /api/auth/sign-out`
- **Session**: `GET /api/auth/get-session`

No custom controllers or services were created; Better Auth remains the single authentication authority.

---

## 4. Server-Side Session Verification

Session resolution is verified using Better Auth's server-side API helper `auth.api.getSession`:

```ts
import { auth } from "@/core/auth";
import { fromNodeHeaders } from "better-auth/node";

const session = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});
```

- **Unauthenticated**: Returns `{ authenticated: false, user: null, session: null }`.
- **Authenticated**: Returns `{ authenticated: true, user: { id: "...", email: "...", role: "candidate" }, session: { id: "...", expiresAt: "..." } }`.

---

## 5. MongoDB Persistence & Collection Discovery

Better Auth's official MongoDB adapter (`mongodbAdapter`) manages the following collections in the database:

| Collection Name | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`users`** | Logical authenticated user identity | `_id` (string), `email`, `emailVerified`, `name`, `image`, `role`, `accountStatus`, `createdAt`, `updatedAt` |
| **`sessions`** | Active user sessions & cookie tokens | `_id`, `userId` (string), `token`, `expiresAt`, `ipAddress`, `userAgent` |
| **`accounts`** | OAuth & credential account metadata | `_id`, `userId` (string), `accountId`, `providerId`, `password` (hashed by Better Auth) |
| **`verifications`** | Verification tokens (email/reset) | `_id`, `identifier`, `value`, `expiresAt` |

---

## 6. User ID Architecture Verification

- **Logical User ID Type**: `string` (`typeof user.id === "string"`).
- **Domain Identity Alignment**: All SKILLEZO domain models (`Profile.userId`, `Resume.userId`, `Company.createdBy`, `CompanyMember.userId`, `Job.createdBy`, `CareerPlan.userId`, `Application.userId`) accept and store this string `user.id`.
- **Zero Duplicate Identity**: SKILLEZO does not maintain a second user table or custom ID mapping; `UserModel` functions as a lightweight domain projection over the same `users` collection.

---

## 7. Protected Metadata & Role Security

- **Server-Owned Fields**: `role`, `accountStatus`, `lastLoginAt`.
- **Security Control**: Configured with `input: false` in `auth.ts` `additionalFields`, preventing unauthenticated clients from passing or mutating `role` or `accountStatus` via public signup requests. Default role evaluates to `"candidate"`.

---

## 8. Temporary Verification Endpoint

A temporary, test-only route was mounted at `GET /api/auth-test/session` in [src/routes/testAuth.routes.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/routes/testAuth.routes.ts) to verify server-side `auth.api.getSession` functionality without introducing business authorization logic.

---

## 9. Verification & Build Summary

| Test / Check | Command / URI | Result |
| :--- | :--- | :---: |
| **TypeScript Type Check** | `npm run type-check` | ✅ **0 Errors** |
| **Build Compilation** | `npm run build` | ✅ **PASSED (`tsc && tsc-alias`)** |
| **Compiled Module Verification** | `node -e "require('./dist/core/auth')"` | ✅ **Auth Initialized Successfully** |
| **Health Endpoints** | `GET /api/health`, `GET /api/health/ready` | ✅ **Functional** |

---

## 10. Security Audit

- ✅ **No `passwordHash` exposed** in application layer.
- ✅ **No raw passwords logged**.
- ✅ **No secrets or tokens hardcoded**; `BETTER_AUTH_SECRET` loaded via environment configuration.
- ❌ **No business controllers, services, or business authorization created** (scoped for Phase 10C & later).

---

**NEXT PHASE**: **PHASE 10C — Authentication Middleware & Protected Route Foundation**
