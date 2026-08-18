# SKILLEZO Backend --- Authentication Architecture & Implementation

> **Authentication Owner:** Better Auth\
> **Application:** Express + TypeScript\
> **Database:** MongoDB\
> **Identity Contract:** `user.id` is a **string**\
> **Domain Entity IDs:** MongoDB `ObjectId`

------------------------------------------------------------------------

## 1. Authentication at a Glance

SKILLEZO uses **Better Auth as the single authentication authority**.

SKILLEZO does not implement its own password hashing, JWT
generation/verification, session storage, or cookie parsing.

``` text
                         ┌──────────────────┐
                         │      CLIENT      │
                         └────────┬─────────┘
                                  │
                                  │ Signup / Login
                                  ▼
                         ┌──────────────────┐
                         │     EXPRESS      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   BETTER AUTH    │
                         │ Authentication   │
                         │ Session Manager  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     MONGODB      │
                         │ Auth Collections │
                         └──────────────────┘
```

For protected application APIs:

``` text
Client
  │
  ▼
Express
  │
  ▼
requireAuth
  │
  ▼
Better Auth Session
  │
  ├── Invalid / Missing ──────► 401
  │
  └── Valid
        │
        ▼
     req.user
        │
        ▼
   Controller
        │
        ▼
     Service
        │
        ▼
   Repository
        │
        ▼
     MongoDB
```

------------------------------------------------------------------------

## 2. Authentication Responsibility

### Better Auth owns

-   Authentication identity
-   Email/password authentication
-   Sessions
-   Accounts
-   Verification
-   Authentication lifecycle

### SKILLEZO owns

-   Candidate profiles
-   Skills
-   Education
-   Experience
-   Companies
-   Company membership
-   Roles
-   Competencies
-   Resumes
-   Jobs
-   Career plans
-   Applications
-   Business rules

This separation prevents authentication concerns from leaking into
business services.

------------------------------------------------------------------------

## 3. Identity Architecture

### Authentication Identity

Better Auth owns:

``` text
user.id
```

Type:

``` text
string
```

Example:

``` text
"user_abc123"
```

The exact ID format belongs to Better Auth.

### Domain Entity Identity

SKILLEZO domain entities continue using MongoDB ObjectIds:

``` text
Company._id       → ObjectId
Role._id          → ObjectId
Profile._id       → ObjectId
Resume._id        → ObjectId
Job._id           → ObjectId
Application._id   → ObjectId
CareerPlan._id    → ObjectId
```

### Core Rule

``` text
Authentication ID
        ↓
      string

Domain Entity ID
        ↓
     ObjectId
```

Never blindly convert `req.user.id` into an ObjectId.

------------------------------------------------------------------------

## 4. User Reference Strategy

Authenticated-user references are stored as strings.

  -----------------------------------------------------------------------------------------
  Domain Field                              Type                    Meaning
  ----------------------------------------- ----------------------- -----------------------
  `Profile.userId`                          `string`                Candidate identity

  `Resume.userId`                           `string`                Resume owner

  `Company.createdBy`                       `string`                Company creator

  `CompanyMember.userId`                    `string`                Company member

  `CompanyMember.invitedBy`                 `string \| null`        Inviting user

  `Job.createdBy`                           `string`                Job creator

  `CareerPlan.userId`                       `string`                Candidate

  `Application.userId`                      `string`                Applicant

  `Application.statusHistory[].changedBy`   `string \| null`        Acting user
  -----------------------------------------------------------------------------------------

Example:

``` json
{
  "_id": "ObjectId(...)",
  "userId": "better-auth-user-123"
}
```

------------------------------------------------------------------------

## 5. Domain References Remain ObjectIds

References between SKILLEZO entities remain native MongoDB ObjectIds.

``` text
Profile.targetRoleId
        ↓
Role._id

Job.companyId
        ↓
Company._id

Job.roleId
        ↓
Role._id

Application.jobId
        ↓
Job._id

Application.resumeId
        ↓
Resume._id

CareerPlan.roleId
        ↓
Role._id

CareerPlan.sourceResumeId
        ↓
Resume._id
```

The rule is:

``` text
User reference
→ String

Domain entity reference
→ ObjectId
```

------------------------------------------------------------------------

## 6. Better Auth + MongoDB

Better Auth was installed with the MongoDB adapter and configured
against the existing MongoDB infrastructure.

``` text
src/core/auth/auth.ts
        │
        ▼
betterAuth(...)
        │
        ▼
mongodbAdapter(...)
        │
        ▼
Existing MongoDB infrastructure
```

The application avoids creating a separate database architecture just
for authentication.

------------------------------------------------------------------------

## 7. Express Authentication Handler

Better Auth is mounted into Express through its Node handler.

``` text
/api/auth/*
        │
        ▼
Better Auth Express Handler
        │
        ▼
Better Auth
```

The handler is mounted before `express.json()` so Better Auth receives
the request in the form expected by the integration.

------------------------------------------------------------------------

## 8. Authentication Endpoints

The `/api/auth/*` namespace belongs to Better Auth.

The application does not create custom login controllers.

Conceptually:

``` text
/api/auth/*
    │
    ├── Signup
    ├── Login
    ├── Session
    ├── Logout
    └── Other Better Auth operations
```

Better Auth owns the exact authentication endpoint behavior.

------------------------------------------------------------------------

## 9. Registration Flow

``` text
                  USER
                   │
                   │ Email + Password
                   ▼
             POST /api/auth/*
                   │
                   ▼
             Better Auth
                   │
          ┌────────┴─────────┐
          │                  │
       Validate          Create Identity
          │                  │
          └────────┬─────────┘
                   ▼
                MongoDB
                   │
                   ▼
              User Identity
```

SKILLEZO custom code does not directly perform password hashing or JWT
creation.

------------------------------------------------------------------------

## 10. Login Flow

``` text
USER
 │
 │ Email + Password
 ▼
Express
 │
 ▼
/api/auth/*
 │
 ▼
Better Auth
 │
 ├── Validate credentials
 ├── Authenticate identity
 └── Create/resolve session
 │
 ▼
MongoDB
 │
 ▼
Authenticated Session
```

The client then uses the Better Auth-managed session for authenticated
requests.

------------------------------------------------------------------------

## 11. Session Verification

For a protected application API:

``` text
GET /api/profile/me
        │
        ▼
Express
        │
        ▼
requireAuth
        │
        ▼
auth.api.getSession(...)
        │
        ▼
Better Auth
        │
        ├───────────────┐
        │               │
     No Session       Valid Session
        │               │
        ▼               ▼
      401           session.user
                        │
                        ▼
                     req.user
```

SKILLEZO does not manually decode JWTs or manually inspect
authentication cookies.

It asks Better Auth for the current session.

------------------------------------------------------------------------

## 12. `requireAuth` Middleware

Implemented at:

``` text
src/core/auth/middleware/requireAuth.ts
```

### Flow

``` text
HTTP Request
     │
     ▼
requireAuth
     │
     ▼
Read Request Headers
     │
     ▼
fromNodeHeaders(req.headers)
     │
     ▼
auth.api.getSession(...)
     │
     ▼
Session exists?
     │
 ┌───┴────┐
 │        │
NO       YES
 │        │
 ▼        ▼
401     session.user
          │
          ▼
    Account Status
          │
      ┌───┴────────┐
      │            │
    Active     Suspended /
                Deactivated
      │            │
      ▼            ▼
   req.user       403
      │
      ▼
    next()
```

------------------------------------------------------------------------

## 13. Authenticated User Context

The application exposes a minimal typed context instead of passing the
entire Better Auth user object through the business layer.

``` ts
interface AuthenticatedUserContext {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
}
```

This becomes:

``` text
req.user
```

Example:

``` json
{
  "id": "user_123",
  "email": "candidate@example.com",
  "role": "candidate",
  "emailVerified": true,
  "accountStatus": "active"
}
```

------------------------------------------------------------------------

## 14. Express Request Typing

Express is extended using TypeScript declaration merging.

``` text
Express Request
       │
       ├── params
       ├── query
       ├── body
       └── user ← AuthenticatedUserContext
```

This allows future controllers to access the authenticated identity
without `any` or unsafe request casting.

------------------------------------------------------------------------

## 15. Authentication States

### No Session

``` text
Request
  ↓
Better Auth
  ↓
No valid session
  ↓
401 Unauthorized
```

### Invalid Session

``` text
Request
  ↓
Better Auth
  ↓
Session invalid
  ↓
401 Unauthorized
```

### Active Account

``` text
Valid Session
     ↓
accountStatus = active
     ↓
req.user
     ↓
next()
```

### Suspended Account

``` text
Valid Session
     ↓
accountStatus = suspended
     ↓
403 Forbidden
     ↓
ACCOUNT_SUSPENDED
```

### Deactivated Account

``` text
Valid Session
     ↓
accountStatus = deactivated
     ↓
403 Forbidden
     ↓
ACCOUNT_DEACTIVATED
```

------------------------------------------------------------------------

## 16. Authentication vs Authorization

### Authentication

Question:

> Who is this user?

Handled by:

``` text
Better Auth
+
requireAuth
```

### Authorization

Question:

> What is this user allowed to do?

This is a separate future layer.

``` text
requireAuth
      ↓
Authorization
      ↓
Controller
```

Future examples:

``` text
requireRole("recruiter")
requireRole("admin")
canManageCompany()
canEditJob()
canViewApplication()
```

These are not part of `requireAuth`.

------------------------------------------------------------------------

## 17. Role Handling

The authenticated context contains:

``` text
req.user.role
```

Possible roles:

``` text
candidate
recruiter
admin
```

The middleware only exposes the role.

It does not decide whether the role is authorized for a particular
business operation.

For example:

``` text
req.user.role === "recruiter"
```

does not automatically mean the user can edit every company.

Ownership and permission checks belong to authorization/business logic.

------------------------------------------------------------------------

## 18. Critical Security Rule

For user-owned operations, never trust the client to identify the
current user.

### Bad

``` json
{
  "userId": "another-user"
}
```

or:

``` text
POST /api/profile/another-user
```

or:

``` text
?userId=another-user
```

### Correct

``` text
Authenticated Session
        ↓
req.user.id
        ↓
ProfileService
        ↓
ProfileRepository
        ↓
Profile.userId
```

The authenticated session is the source of truth for the current user.

------------------------------------------------------------------------

## 19. Future Profile Request Example

Eventually:

``` text
GET /api/profile/me
```

will work like this:

``` text
Client
  │
  ▼
GET /api/profile/me
  │
  ▼
requireAuth
  │
  ▼
Better Auth Session
  │
  ▼
req.user.id = "user_123"
  │
  ▼
ProfileController
  │
  ▼
ProfileService
  │
  ▼
ProfileRepository
  │
  ▼
findByUserId("user_123")
  │
  ▼
MongoDB
```

Database:

``` json
{
  "_id": "ObjectId(...)",
  "userId": "user_123",
  "targetRoleId": "ObjectId(...)"
}
```

------------------------------------------------------------------------

## 20. Authentication → Application Architecture

``` text
                    HTTP REQUEST
                         │
                         ▼
                      EXPRESS
                         │
                         ▼
                  requireAuth
                         │
                         ▼
               Better Auth Session
                         │
               ┌─────────┴─────────┐
               │                   │
          Invalid/Missing        Valid
               │                   │
               ▼                   ▼
             401              req.user
                                   │
                                   ▼
                              Controller
                                   │
                                   ▼
                                Service
                                   │
                                   ▼
                              Repository
                                   │
                                   ▼
                                Model
                                   │
                                   ▼
                               MongoDB
```

------------------------------------------------------------------------

## 21. Current Authentication Files

``` text
src/core/auth/
│
├── auth.ts
├── index.ts
├── auth.types.ts
│
└── middleware/
    └── requireAuth.ts
```

Supporting infrastructure:

``` text
src/types/
└── express.d.ts
```

Temporary verification route:

``` text
src/routes/
└── testAuth.routes.ts
```

------------------------------------------------------------------------

## 22. Authentication Responsibility Map

  Responsibility                    Owner
  --------------------------------- -------------------------------
  User authentication identity      Better Auth
  Password handling                 Better Auth
  Sessions                          Better Auth
  Authentication handler            Better Auth + Express
  Session verification              Better Auth
  Request authentication boundary   `requireAuth`
  `req.user` context                SKILLEZO middleware
  Account status rejection          SKILLEZO auth middleware
  Role authorization                Future authorization layer
  Business permissions              Future services/authorization
  Profile data                      SKILLEZO
  Resume data                       SKILLEZO
  Job data                          SKILLEZO
  Application data                  SKILLEZO

------------------------------------------------------------------------

## 23. Implementation Status

### Phase 9.5 --- Identity Migration

``` text
✓ Better Auth identity contract
✓ User ID changed to string
✓ User references changed ObjectId → string
✓ Domain ObjectIds preserved
✓ passwordHash removed
✓ User population dependency removed
```

### Phase 10A --- Better Auth Setup

``` text
✓ better-auth installed
✓ MongoDB adapter configured
✓ Better Auth secret configuration
✓ Better Auth URL configuration
✓ Existing MongoDB infrastructure reused
```

### Phase 10B --- Express Integration

``` text
✓ Better Auth Express handler
✓ /api/auth/* integration
✓ Email/password enabled
✓ Session API integration
✓ Temporary session verification
```

### Phase 10C --- Authentication Middleware

``` text
✓ requireAuth
✓ Express req.user typing
✓ AuthenticatedUserContext
✓ 401 unauthenticated handling
✓ 403 suspended handling
✓ 403 deactivated handling
✓ Protected test endpoint
```

------------------------------------------------------------------------

## 24. What Is Still Left?

The authentication foundation is established, but the following areas
remain before calling the entire authentication feature
production-complete.

### End-to-End Verification

Explicitly verify:

``` text
Signup
   ↓
Login
   ↓
Session
   ↓
Protected API
   ↓
Logout
   ↓
Protected API → 401
```

Also:

``` text
Active       → 200
Suspended    → 403
Deactivated  → 403
```

The implementation reports establish build/type/module verification and
middleware implementation, but they do not by themselves provide
complete HTTP lifecycle evidence for every scenario.

### Future Authorization

Still to implement:

``` text
Role-based access
Ownership checks
Company permissions
Recruiter permissions
Admin permissions
Application permissions
```

### Optional Authentication Features

Depending on product requirements:

``` text
Email verification
Password reset
Account recovery
Password change
OAuth/social login
Session policies
Rate limiting
Security hardening
Audit logging
```

------------------------------------------------------------------------

## 25. Current Backend Authentication Status

``` text
┌───────────────────────────────────────────────┐
│             SKILLEZO BACKEND                  │
├───────────────────────────────────────────────┤
│                                               │
│ Database Models                 ✅             │
│ Repository Layer               ✅             │
│ Better Auth Identity           ✅             │
│ Better Auth MongoDB            ✅             │
│ Express Auth Handler           ✅             │
│ Session Resolution             ✅             │
│ requireAuth Middleware         ✅             │
│ Express req.user typing        ✅             │
│ Account Status Checks           ✅             │
│                                               │
│ Authorization / RBAC           ⏳             │
│ Business Controllers            ⏳             │
│ Business Services              ⏳             │
│ Business APIs                  ⏳             │
│ End-to-End Auth Test Suite     ⏳             │
│ Production Hardening           ⏳             │
│                                               │
└───────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## 26. Mental Model

If you remember only one thing:

``` text
Better Auth proves WHO the user is.
requireAuth puts that identity into req.user.
Authorization / Services decide WHAT the user can do.
Repositories handle HOW the data is stored.
```

Or:

``` text
        WHO?
         │
    Better Auth
         │
         ▼
      req.user
         │
        WHAT?
         │
Authorization / Service
         │
        HOW?
         │
     Repository
         │
         ▼
      MongoDB
```

------------------------------------------------------------------------

# 27. Next Phase --- Candidate Profile

The authentication boundary is now ready for the first real business
module.

``` text
POST /api/profile
       │
       ▼
 requireAuth
       │
       ▼
   req.user.id
       │
       ▼
ProfileController
       │
       ▼
 ProfileService
       │
       ▼
ProfileRepository
       │
       ▼
  ProfileModel
       │
       ▼
   MongoDB
```

This will be the first place where the complete:

**Authentication → Controller → Service → Repository → Model**

architecture is exercised end-to-end.
