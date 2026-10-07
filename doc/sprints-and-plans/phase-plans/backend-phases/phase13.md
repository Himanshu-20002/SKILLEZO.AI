# PHASE 13 — Company Member Management & Recruiter Authorization Foundation

Continue from the completed SKILLEZO backend through Phase 12.

IMPORTANT CURRENT STATE:

Phase 1–8
Database + Mongoose Model Layer
✅ Complete

Phase 9
Repository Layer
✅ Complete

Phase 9.5
Better Auth Identity Migration
✅ Complete

Phase 10A–10C
Better Auth + Express Handler + Authentication Middleware
✅ Complete

Phase 11
Candidate Profile Module
✅ Complete

Phase 12
Company Module + Company Ownership Foundation
✅ Complete

CURRENT POSITION:

PHASE 13

Do not implement Phase 14 yet.

Phase 14 will later implement:
External Job Ingestion
Jooble integration
Job normalization
Job deduplication

Do NOT implement those in this phase.

============================================================
1. PHASE 13 OBJECTIVE
============================================================

Implement the Company Member Management module.

The purpose is to establish:

User
  ↓
CompanyMember
  ↓
Company

and define:

OWNER
ADMIN
MEMBER

membership roles and permissions.

This phase establishes the authorization foundation required for future recruiter functionality.

The final architecture should support:

Company
   │
   ├── OWNER
   │
   ├── ADMIN
   │
   └── MEMBER

Example:

Acme Technologies
│
├── Himanshu       OWNER
├── Rahul          ADMIN
└── Priya          MEMBER

The module must determine:

- Which company a user belongs to
- Whether the user is an active member
- What membership role the user has
- Whether the user can perform company-level operations

============================================================
2. IMPORTANT AUTHORIZATION BOUNDARY
============================================================

Authentication is already implemented by Better Auth.

Do NOT implement authentication again.

Use:

requireAuth

as the source of authenticated identity.

The authenticated identity is:

req.user.id

and MUST remain:

string

Never accept userId from the client when the operation concerns the currently authenticated user.

Correct:

req.user.id

Incorrect:

req.body.userId

Incorrect:

req.params.userId

for "my membership" operations.

============================================================
3. EXISTING COMPANY MODEL
============================================================

Inspect the existing:

Company.model.ts

CompanyMember.model.ts

CompanyRepository.ts

CompanyMemberRepository.ts

company.service.ts

company.controller.ts

company.routes.ts

DATABASE_SCHEMA.md

before modifying anything.

Do NOT assume the existing implementation.

Use the actual current code as the source of truth.

============================================================
4. EXISTING COMPANY MEMBER MODEL
============================================================

The existing CompanyMember model contains concepts equivalent to:

userId
companyId
role
status
invitedBy

with centralized enums:

CompanyMemberRole

CompanyMemberStatus

The model relationship is:

User
  │
  │ userId
  ▼
CompanyMember
  │
  │ companyId
  ▼
Company

This is a normalized N:M relationship.

One user can belong to multiple companies.

One company can have multiple users.

Therefore:

User N:M Company

through:

CompanyMember

Do NOT duplicate company membership arrays inside User or Company.

============================================================
5. MEMBERSHIP ROLES
============================================================

Use the existing centralized enum:

CompanyMemberRole

Do NOT create duplicate string literals.

Expected conceptual roles:

OWNER
ADMIN
MEMBER

Inspect the actual enum values before implementation.

Do not assume casing if the existing enum differs.

============================================================
6. MEMBERSHIP STATUS
============================================================

Use:

CompanyMemberStatus

Inspect existing enum values.

Expected conceptual states may include:

ACTIVE
INVITED
SUSPENDED

but use the actual existing enum.

Do not introduce new status values unless DATABASE_SCHEMA.md requires them.

============================================================
7. REPOSITORY LAYER
============================================================

Inspect:

CompanyMemberRepository.ts

Extend it only where required.

Repository responsibilities:

Database access ONLY.

Possible methods:

findByUserAndCompany()

findActiveMembership()

findMembershipsByUser()

findMembershipsByCompany()

findMembershipById()

createMembership()

updateMembershipRole()

updateMembershipStatus()

deleteMembership()

existsByUserAndCompany()

Do not put authorization rules inside the repository.

Incorrect:

repository checks whether OWNER can remove ADMIN

Correct:

service determines permission

repository performs database operation.

============================================================
8. COMPANY MEMBER DTOs
============================================================

Create:

src/modules/company-member/company-member.dto.ts

Use strict TypeScript DTOs.

Possible DTOs:

InviteCompanyMemberDTO

UpdateCompanyMemberRoleDTO

UpdateCompanyMemberStatusDTO

Do NOT accept:

userId

from the request for operations where the target is the authenticated user.

For invitation operations, a target user identifier/email may be required.

Inspect the existing project conventions.

============================================================
9. VALIDATION
============================================================

Create:

src/modules/company-member/company-member.validator.ts

Use Zod.

Validate:

companyId

membership role

membership status

target member/user information

Do NOT use:

objectIdSchema

for Better Auth user IDs.

Remember:

Better Auth user ID = string

MongoDB domain ID = ObjectId

Therefore:

companyId → objectIdSchema

userId → userIdSchema

Do not mix these.

============================================================
10. SERVICE LAYER
============================================================

Create:

src/modules/company-member/company-member.service.ts

Business rules belong here.

The service must enforce:

1. Authenticated user identity

2. Company membership

3. Active membership

4. Membership role

5. Ownership rules

6. Duplicate membership prevention

7. Target member existence

8. Company existence where required

============================================================
11. AUTHORIZATION RULES
============================================================

Implement a clean permission matrix.

Conceptually:

                    OWNER    ADMIN    MEMBER
------------------------------------------------
View company members    ✅       ✅       ✅
Invite members          ✅       ✅       ❌
Change member role      ✅       ❌       ❌
Remove member           ✅       ✅       ❌
Change member status    ✅       ❌       ❌
Manage company          ✅       ✅       ❌

IMPORTANT:

Do not blindly implement this table if the existing product requirements or enums indicate otherwise.

First inspect Phase 12 implementation and DATABASE_SCHEMA.md.

If there is no existing formal permission matrix, use the above as the proposed Phase 13 baseline and document it.

============================================================
12. OWNER PROTECTION
============================================================

The OWNER is special.

Implement protection against accidental ownership destruction.

Examples:

An OWNER should not be removable by a MEMBER.

An OWNER should not be demoted by a MEMBER.

A company should not accidentally end up without an OWNER.

If ownership transfer is not part of the current requirements:

DO NOT implement ownership transfer.

Instead:

Return a clear business error such as:

CANNOT_MODIFY_OWNER

or use the project's existing error-code convention.

Document this limitation.

============================================================
13. SELF-MODIFICATION RULES
============================================================

Prevent dangerous operations.

Examples:

A member should not be able to modify another company's members.

A user should not be able to modify membership records by simply knowing a companyId.

Always verify:

req.user.id
        ↓
active CompanyMember
        ↓
companyId
        ↓
permission

Do not trust:

client-provided role

client-provided userId

client-provided company ownership.

============================================================
14. MEMBERSHIP CREATION / INVITATION
============================================================

Implement company member invitation/creation according to the existing domain model.

IMPORTANT:

Do not invent an email invitation delivery system in this phase.

This phase is about membership persistence and authorization.

If an invitation requires a target user:

- Resolve the target user identity appropriately
- Do not create fake users
- Do not bypass Better Auth identity

If the product does not yet have a user lookup mechanism:

implement the membership foundation without pretending that email invitation delivery exists.

Document the limitation.

============================================================
15. DUPLICATE MEMBERSHIP
============================================================

The model already has a unique relationship:

userId + companyId

Therefore:

One user cannot have two membership documents for the same company.

If duplicate membership is attempted:

return:

409 Conflict

using the existing duplicate/error conventions.

Do not silently create duplicates.

============================================================
16. MEMBER LISTING
============================================================

Implement:

GET company members

The endpoint must:

1. require authentication

2. verify authenticated user's membership

3. verify appropriate permission

4. query CompanyMemberRepository

5. return members belonging ONLY to that company

Never return members from another company.

============================================================
17. MY MEMBERSHIPS
============================================================

Implement an endpoint to retrieve the authenticated user's memberships.

Example:

GET /api/company-members/me

Response should show:

companyId
role
status
createdAt
updatedAt

Do not expose sensitive authentication information.

Do not expose password information.

Better Auth owns authentication credentials.

============================================================
18. MEMBER DETAIL
============================================================

If implemented:

GET /api/companies/:companyId/members/:memberId

Verify:

Authenticated user belongs to company.

Then verify authorization.

Never allow arbitrary member lookup across companies.

============================================================
19. ROLE UPDATE
============================================================

Implement role update only for authorized users.

Example:

PATCH /api/companies/:companyId/members/:memberId/role

Request:

{
  "role": "ADMIN"
}

The service must verify:

authenticated user
      ↓
company membership
      ↓
OWNER permission
      ↓
target member
      ↓
role transition
      ↓
update

Do not allow MEMBER to promote themselves.

Do not allow ADMIN to make themselves OWNER.

Do not allow arbitrary client-controlled ownership escalation.

============================================================
20. STATUS UPDATE
============================================================

If supported by the existing model:

PATCH /api/companies/:companyId/members/:memberId/status

Example:

{
  "status": "SUSPENDED"
}

Only authorized roles may perform this operation.

Do not allow unauthorized users to activate/suspend members.

============================================================
21. MEMBER REMOVAL
============================================================

If supported:

DELETE /api/companies/:companyId/members/:memberId

Rules:

- User must belong to the company
- User must have permission
- Cannot remove protected OWNER
- Cannot remove a member from another company
- Operation should be idempotent or return a clear 404 according to existing project conventions

Do not delete the user's Better Auth account.

Important distinction:

Removing membership:

CompanyMember deleted

does NOT mean:

Better Auth user deleted.

============================================================
22. COMPANY MEMBERSHIP SECURITY MODEL
============================================================

Use:

Authenticated User
        │
        ▼
req.user.id
        │
        ▼
CompanyMember lookup
        │
        ▼
Is membership ACTIVE?
        │
        ├── NO → 403
        │
        ▼
What role?
        │
        ├── OWNER
        ├── ADMIN
        └── MEMBER
        │
        ▼
Permission check
        │
        ▼
Business operation

This is the core security flow of Phase 13.

============================================================
23. AUTHENTICATION VS AUTHORIZATION
============================================================

Document clearly:

Authentication:

"Who are you?"

Better Auth

↓

req.user

Authorization:

"What are you allowed to do?"

SKILLEZO CompanyMember

↓

role

This distinction must remain clean.

============================================================
24. AUTHORIZATION MIDDLEWARE / HELPER
============================================================

If the project already has authorization utilities:

reuse them.

Otherwise create a reusable authorization helper.

Possible concept:

requireCompanyMembership()

requireCompanyRole()

Do NOT create dozens of duplicated checks inside controllers.

Example:

requireCompanyRole(
  OWNER,
  ADMIN
)

But do not over-engineer.

Keep the implementation simple and reusable.

============================================================
25. ROUTES
============================================================

Create:

src/modules/company-member/company-member.routes.ts

Potential endpoints:

GET
/api/company-members/me

GET
/api/companies/:companyId/members

GET
/api/companies/:companyId/members/:memberId

POST
/api/companies/:companyId/members

PATCH
/api/companies/:companyId/members/:memberId/role

PATCH
/api/companies/:companyId/members/:memberId/status

DELETE
/api/companies/:companyId/members/:memberId

Only implement endpoints actually supported by the current requirements.

Every protected endpoint must use:

requireAuth

============================================================
26. CONTROLLER
============================================================

Create:

company-member.controller.ts

Controllers must remain thin.

Controller responsibilities:

- receive req
- receive validated body/params
- read req.user.id
- call service
- return successResponse()

Controllers must NOT:

- query MongoDB directly
- implement authorization rules
- calculate roles
- call Better Auth directly
- contain business logic

Correct:

Route
 ↓
requireAuth
 ↓
validate
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
MongoDB

============================================================
27. ERROR HANDLING
============================================================

Use the project's existing:

AppError
RepositoryError
error codes
successResponse
asyncHandler

Add new error codes only when required.

Possible codes:

COMPANY_MEMBER_NOT_FOUND

COMPANY_MEMBERSHIP_REQUIRED

COMPANY_MEMBERSHIP_INACTIVE

COMPANY_PERMISSION_DENIED

DUPLICATE_COMPANY_MEMBERSHIP

CANNOT_MODIFY_OWNER

COMPANY_NOT_FOUND

Do not duplicate existing codes.

First inspect:

src/core/constants/error-codes.ts

============================================================
28. API RESPONSE CONTRACT
============================================================

Use the existing standard response structure.

Example success:

{
  "success": true,
  "data": {
    ...
  }
}

Example error:

{
  "success": false,
  "error": {
    "code": "COMPANY_PERMISSION_DENIED",
    "message": "You do not have permission to perform this action"
  }
}

Do not invent a second response format.

============================================================
29. COMPANY OWNERSHIP FLOW
============================================================

Phase 12 already creates the OWNER membership when a company is created.

Verify that this still works.

Expected:

POST /api/companies

Authenticated user
      ↓
Create Company
      ↓
company.createdBy = req.user.id
      ↓
Create CompanyMember
      ↓
role = OWNER
      ↓
status = ACTIVE

Phase 13 must preserve this behavior.

Do NOT create a second OWNER membership.

============================================================
30. FUTURE JOB AUTHORIZATION
============================================================

This phase prepares the system for future native jobs.

Eventually:

Company
   ↓
CompanyMember
   ↓
Recruiter
   ↓
Job

The future Job Service will ask:

"Does this authenticated user have permission to create/manage jobs for this company?"

Phase 13 should provide the foundation for that check.

DO NOT implement Job creation in this phase.

============================================================
31. MULTI-COMPANY SUPPORT
============================================================

A user may belong to multiple companies.

Example:

User A

Company X → OWNER

Company Y → ADMIN

Company Z → MEMBER

The implementation must NOT assume:

one user = one company.

Company membership must always be resolved by:

userId + companyId

============================================================
32. DATA ISOLATION
============================================================

Critical security requirement:

Company X members must never be able to access Company Y's members through the API.

Every company-scoped operation must verify:

req.user.id
+
companyId

before accessing company membership data.

Test:

User from Company A
attempts:

GET /api/companies/companyB/members

Expected:

403 Forbidden

or 404 depending on the project's security convention.

Do not leak Company B membership information.

============================================================
33. DOCUMENTATION
============================================================

Create:

server/doc/phase13-company-member-management.md

The document must visually explain:

1. Purpose

2. Why CompanyMember exists

3. User ↔ Company relationship

4. N:M relationship

5. Database model

6. Membership roles

7. Membership status

8. Authentication vs authorization

9. Permission matrix

10. OWNER flow

11. ADMIN flow

12. MEMBER flow

13. Invite/member creation flow

14. Member listing flow

15. Role update flow

16. Status update flow

17. Removal flow

18. Multi-company example

19. Data isolation

20. API endpoints

21. Request/response examples

22. Error codes

23. Security rules

24. Future Job authorization

25. Phase 14 relationship

Include Mermaid diagrams.

Example:

User
 │
 ├── CompanyMember
 │       │
 │       └── Company
 │
 └── CompanyMember
         │
         └── Another Company

============================================================
34. API DOCUMENTATION FOR FRONTEND
============================================================

Also create or update the project's centralized frontend API documentation.

If the project already has:

server/doc/api/

use it.

If not, create:

server/doc/api/

and document:

company-member.md

Include for every endpoint:

METHOD

URL

Authentication

Authorization

Request params

Request body

Validation rules

Success response

Error responses

Example request

Example response

Frontend notes

Example:

PATCH
/api/companies/:companyId/members/:memberId/role

Auth:
Required

Role:
OWNER

Body:

{
  "role": "ADMIN"
}

Success:

{
  "success": true,
  "data": {...}
}

This documentation must be usable directly by the frontend developer.

============================================================
35. TESTING
============================================================

Implement comprehensive tests.

At minimum verify:

1. Unauthenticated user → 401

2. Authenticated user with no company membership → 403

3. MEMBER cannot invite

4. MEMBER cannot change role

5. MEMBER cannot suspend members

6. ADMIN can perform permitted operations

7. ADMIN cannot promote someone to OWNER

8. OWNER can manage members

9. OWNER cannot accidentally be removed

10. Duplicate membership → 409

11. Cross-company access denied

12. User can belong to multiple companies

13. Company creation still creates OWNER membership

14. Better Auth session remains functional

15. Profile module remains functional

16. Company module remains functional

============================================================
36. BUILD VERIFICATION
============================================================

Run:

npm run type-check

npm run build

Both must pass.

============================================================
37. HEALTH VERIFICATION
============================================================

Verify:

GET /api/health

GET /api/health/ready

Both must continue working.

============================================================
38. REGRESSION VERIFICATION
============================================================

Verify existing functionality:

Better Auth:

/api/auth/*

Authentication:

requireAuth

Profile:

/api/profile/*

Company:

/api/companies/*

Phase 13:

/api/company-members/*

No regression is acceptable.

============================================================
39. DATABASE VERIFICATION
============================================================

Verify:

CompanyMember documents correctly contain:

userId
companyId
role
status
invitedBy

Verify:

userId = Better Auth string ID

companyId = MongoDB ObjectId

This distinction is mandatory.

Example:

{
  "userId": "better-auth-user-id",
  "companyId": "66xxxxxxxxxxxxxxxxxxxxxx",
  "role": "OWNER",
  "status": "ACTIVE"
}

Do not convert userId back to ObjectId.

============================================================
40. ARCHITECTURE RULES
============================================================

Maintain:

Route
 ↓
Authentication
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Model
 ↓
MongoDB

Authentication:

Better Auth

Authorization:

CompanyMember

Database:

Mongoose

Validation:

Zod

Do not bypass layers.

============================================================
41. DO NOT IMPLEMENT
============================================================

This phase MUST NOT implement:

❌ Job creation

❌ Job editing

❌ Job publishing

❌ Job search

❌ Jooble

❌ External job ingestion

❌ Adzuna

❌ Greenhouse

❌ Lever

❌ Resume parsing

❌ AI matching

❌ Applications

❌ Notifications

❌ Email invitation delivery

❌ Ownership transfer

unless explicitly required by existing code and documentation.

These belong to future phases.

============================================================
42. FINAL COMPLETION REPORT
============================================================

Return a detailed Phase 13 report containing:

### Files created

### Files modified

### Repository changes

### DTO changes

### Validation changes

### Service business rules

### Authorization matrix

### Controller implementation

### Routes

### Error codes

### Authentication flow

### Authorization flow

### Multi-company behavior

### Data isolation

### Database verification

### API documentation

### Test results

### TypeScript result

### Build result

### Health endpoint result

### Regression result

### Known limitations

### Future Job authorization relationship

Final report MUST conclude with:

✅ CompanyMember Repository Complete

✅ Company Member Module Complete

✅ Membership Authorization Implemented

✅ OWNER / ADMIN / MEMBER Rules Implemented

✅ Multi-Company Support Verified

✅ Cross-Company Access Protected

✅ Better Auth Identity Preserved

✅ User IDs remain String

✅ Company IDs remain ObjectId

✅ TypeScript Passed

✅ Build Passed

✅ Health Endpoints Working

✅ Profile Module Working

✅ Company Module Working

Ready for:

PHASE 14 — External Job Ingestion Foundation + Jooble Integration