SKILLEZO Backend — Phase 10B
Better Auth Express Handler & Session Verification

Continue from the completed Phase 10A.

Phase 10A is verified:

- better-auth installed
- MongoDB adapter configured
- existing MongoDB infrastructure preserved
- Better Auth configuration created
- user.id is logically a string
- no custom JWT
- no authentication middleware
- no business controllers
- no business services
- type-check passed
- build passed
- health endpoints passed

==================================================
OBJECTIVE
==================================================

Integrate Better Auth with the existing Express application and verify
the complete basic authentication lifecycle.

This phase introduces:

1. Better Auth Express handler
2. Authentication endpoints
3. Session retrieval
4. Basic authentication verification

Do NOT implement SKILLEZO business modules yet.

==================================================
1. INSPECT CURRENT SERVER
==================================================

Before changing anything inspect:

src/server.ts

src/core/auth/auth.ts

src/core/auth/index.ts

src/core/config/env.ts

src/lib/db.ts

package.json

tsconfig.json

Review:

- Express version
- middleware order
- existing CORS
- express.json()
- health routes
- notFound middleware
- error middleware
- graceful shutdown

Do not change unrelated architecture.

==================================================
2. EXPRESS BETTER AUTH HANDLER
==================================================

Integrate the Better Auth handler using the official Express integration.

Mount authentication under:

/api/auth/*

Use the correct route pattern for the installed Express version.

Follow the official Better Auth Express integration requirements.

IMPORTANT:

Pay special attention to middleware ordering.

Do NOT put express.json() before the Better Auth handler if the official
Better Auth Express integration requires access to the original request
body.

Preserve:

CORS

health routes

404 middleware

error middleware

graceful shutdown

==================================================
3. AUTHENTICATION ENDPOINTS
==================================================

Do NOT create custom controllers for:

register
login
logout
session

Better Auth must own these operations.

Expose the Better Auth handler through:

/api/auth/*

Do not duplicate Better Auth endpoints.

==================================================
4. BASIC AUTHENTICATION FLOW
==================================================

Verify:

SIGN UP

POST appropriate Better Auth email/password signup endpoint.

Expected:

User created.

LOGIN

POST appropriate Better Auth email/password login endpoint.

Expected:

Authentication succeeds.

SESSION

Request the appropriate Better Auth session endpoint.

Expected:

Authenticated session returned.

LOGOUT

Request the appropriate Better Auth logout endpoint.

Expected:

Session terminated.

==================================================
5. DATABASE VERIFICATION
==================================================

After registration/login, inspect MongoDB.

Verify Better Auth persistence is functioning.

Confirm the relevant Better Auth records exist.

Verify:

User

Session

Account

Verification

where applicable to the tested flow.

IMPORTANT:

Do not assume exact collection names without inspecting the actual
adapter behavior.

Document the actual collection names discovered during testing.

Do NOT modify MongoDB manually.

Do NOT drop collections.

==================================================
6. USER ID VERIFICATION
==================================================

This is critical.

Register one test user.

Capture:

Better Auth session.user.id

Verify:

typeof session.user.id === "string"

Verify the same logical ID is what SKILLEZO will use for:

Profile.userId

Resume.userId

Company.createdBy

CompanyMember.userId

Job.createdBy

CareerPlan.userId

Application.userId

Do NOT create a duplicate SKILLEZO user record.

==================================================
7. SESSION VERIFICATION
==================================================

Verify:

1. No session
   → unauthenticated

2. Valid session
   → authenticated

3. Logout
   → session invalidated

4. Invalid/expired session
   → unauthenticated

Use Better Auth's server-side session API.

Do NOT manually decode cookies.

Do NOT manually verify JWT.

Do NOT create custom session storage.

==================================================
8. TEMPORARY SESSION TEST
==================================================

Create a minimal temporary/test-only endpoint if necessary to verify
server-side session retrieval.

Example conceptual behavior:

GET /api/auth-test/session

Response:

{
    "authenticated": true,
    "user": {
        "id": "...",
        "email": "...",
        "role": "candidate"
    }
}

IMPORTANT:

This endpoint is ONLY for verification.

Keep it clearly marked as temporary/test-only.

Do not mix it with business controllers.

Do not implement authorization here.

Remove it before declaring Phase 10 complete unless it is explicitly
needed by the final architecture.

==================================================
9. USER ROLE VERIFICATION
==================================================

Verify that Better Auth returns the SKILLEZO-specific user field:

role

Expected default:

candidate

Verify that clients cannot arbitrarily set:

role

accountStatus

lastLoginAt

through public signup input.

Do not implement role-based authorization yet.

Authentication:

"Who are you?"

Authorization:

"What are you allowed to do?"

Authorization belongs to a later phase.

==================================================
10. ERROR BEHAVIOR
==================================================

Verify:

Invalid email

Invalid password

Duplicate registration

Missing session

Invalid session

Logout without session

Return appropriate Better Auth responses.

Do not create a custom authentication error system over Better Auth.

Existing application-level errors may remain unchanged.

==================================================
11. SECURITY CHECK
==================================================

Verify:

No passwordHash is exposed in API responses.

No raw password is logged.

No session secret is logged.

No Better Auth secret is logged.

No authentication token is hardcoded.

No credentials are committed.

==================================================
12. HEALTH ENDPOINTS
==================================================

Verify:

GET /api/health

GET /api/health/ready

Both must continue working.

==================================================
13. BUILD VERIFICATION
==================================================

Run:

npm run type-check

npm run build

Both must pass.

==================================================
14. DO NOT IMPLEMENT
==================================================

Do NOT implement:

❌ requireAuth middleware for business routes
❌ role authorization
❌ recruiter authorization
❌ candidate authorization
❌ controllers
❌ services
❌ repositories for authentication
❌ JWT
❌ OAuth
❌ password reset
❌ business APIs
❌ Profile APIs
❌ Company APIs
❌ Job APIs
❌ Application APIs

Those belong to later phases.

==================================================
15. DOCUMENTATION
==================================================

Create:

server/doc/phase10b-better-auth-express-session.md

Include:

1. Express integration

2. Middleware order

3. Authentication endpoints

4. Registration flow

5. Login flow

6. Session flow

7. Logout flow

8. MongoDB collections discovered

9. Better Auth user ID verification

10. Session verification

11. Role field verification

12. Security verification

13. Error behavior

14. Health endpoint verification

15. Build verification

16. Temporary test endpoint

17. Known limitations

18. Next phase

==================================================
16. FINAL ARCHITECTURE
==================================================

The resulting architecture should be:

                    CLIENT
                      │
                      ▼
                   EXPRESS
                      │
                      ▼
              Better Auth Handler
                      │
            ┌─────────┼─────────┐
            ▼         ▼         ▼
          Signup    Login     Session
            │         │         │
            └─────────┼─────────┘
                      ▼
                   MongoDB
                      │
                      ▼
                 user.id:string
                      │
                      ▼
              Future Auth Middleware
                      │
                      ▼
                 Controllers
                      │
                      ▼
                   Services
                      │
                      ▼
                 Repositories
                      │
                      ▼
                 Domain Models

==================================================
17. COMPLETION CRITERIA
==================================================

Phase 10B is complete only when:

✅ Better Auth Express handler integrated

✅ /api/auth/* working

✅ Registration verified

✅ Login verified

✅ Session retrieval verified

✅ Logout verified

✅ MongoDB persistence verified

✅ Better Auth user ID confirmed as string

✅ No duplicate user identity

✅ Role field verified

✅ Client cannot set protected user metadata

✅ Passwords not exposed

✅ Secrets not exposed

✅ Health endpoints working

✅ TypeScript passes

✅ Build passes

✅ Documentation created

❌ No business authorization yet

❌ No business controllers yet

❌ No business services yet

==================================================
NEXT PHASE
==================================================

PHASE 10C — Authentication Middleware & Protected Route Foundation