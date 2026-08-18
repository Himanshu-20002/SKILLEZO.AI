# PHASE 12 — COMPANY MODULE + COMPANY OWNERSHIP FOUNDATION

Continue from the completed SKILLEZO backend implementation.

IMPORTANT:
Phases 1–11 are already implemented and verified.

The current architecture is:

Better Auth
    ↓
requireAuth
    ↓
Route
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Mongoose Model
    ↓
MongoDB

Phase 11 established the first complete business module:
Candidate Profile.

Now implement the second complete business module:

COMPANY MODULE

This phase introduces:

1. Company CRUD
2. Company ownership
3. Company membership foundation
4. Basic company-level authorization
5. CompanyMember persistence operations

DO NOT redesign the existing architecture.

DO NOT replace Better Auth.

DO NOT create custom authentication.

DO NOT create JWT authentication.

DO NOT modify the existing authentication flow.

DO NOT create a generic RBAC framework.

DO NOT implement job posting.

DO NOT implement applications.

DO NOT implement resume processing.

DO NOT implement AI logic.

DO NOT implement email invitations.

Keep this phase focused.

==================================================
OBJECTIVE
==================================================

Implement the Company module end-to-end.

An authenticated user must be able to:

1. Create a company
2. View a company
3. View companies they belong to
4. Update a company they are authorized to manage

When a user creates a company:

    Company
        ↓
    createdBy = req.user.id

AND

    CompanyMember
        ↓
    userId = req.user.id
    companyId = newly created company
    role = owner
    status = active

The creator automatically becomes the company owner.

==================================================
ARCHITECTURE
==================================================

The final architecture must be:

CLIENT
   ↓
Company Route
   ↓
requireAuth
   ↓
Company Controller
   ↓
Company Service
   ├── CompanyRepository
   └── CompanyMemberRepository
   ↓
Mongoose Models
   ↓
MongoDB


Authentication answers:

"Who is the user?"

Better Auth
    ↓
req.user.id


Company authorization answers:

"Can this user perform this operation on this company?"

CompanyMember
    ↓
membership
    ↓
role
    ↓
permission decision

==================================================
STEP 1 — INSPECT EXISTING IMPLEMENTATION
==================================================

Before writing code, inspect the current repository.

Inspect:

DATABASE_SCHEMA.md

src/database/models/Company.model.ts

src/database/models/CompanyMember.model.ts

src/database/repositories/company/CompanyRepository.ts

src/database/repositories/

src/core/auth/

src/core/auth/middleware/requireAuth.ts

src/core/auth/auth.types.ts

src/types/express.d.ts

src/core/validators/

src/core/constants/

src/modules/profile/

src/utils/

src/middleware/

src/server.ts

Also inspect Phase 11 implementation.

The Company module should follow the same architectural conventions established by Profile.

DO NOT duplicate existing infrastructure.

Reuse existing:

- AppError
- repository errors
- asyncHandler
- successResponse
- errorResponse
- validation middleware
- objectIdSchema
- requireAuth
- existing constants
- existing repository base class

First determine the exact current paths because the project has previously been reorganized.

==================================================
STEP 2 — DATABASE CONTRACT
==================================================

DATABASE_SCHEMA.md remains the source of truth.

Use the existing Company model.

Company contains domain data such as:

name
slug
description
industry
website
logoUrl
location
companySize
verificationStatus
createdBy

IMPORTANT ID DISTINCTION:

createdBy
    → Better Auth user ID
    → string

companyId
    → MongoDB domain entity ID
    → ObjectId

Do not change this distinction.

CompanyMember contains:

userId
    → string

companyId
    → ObjectId

invitedBy
    → string | null

role
    → CompanyMemberRole

status
    → CompanyMemberStatus

Do not change the database schema unless a genuine implementation mismatch is discovered.

==================================================
STEP 3 — MODULE STRUCTURE
==================================================

Create:

src/modules/company/

Recommended structure:

src/modules/company/
│
├── company.dto.ts
├── company.validator.ts
├── company.controller.ts
├── company.service.ts
├── company.routes.ts
└── index.ts

Do NOT create:

company.repository.ts

if the existing database repository layer is the canonical repository location.

Use:

src/database/repositories/company/CompanyRepository.ts

and:

src/database/repositories/companyMember/CompanyMemberRepository.ts

or the actual existing CompanyMember repository path if already present.

Do not create duplicate repositories.

==================================================
STEP 4 — COMPANY DTOs
==================================================

Create strict API DTOs.

At minimum:

CreateCompanyDTO

UpdateCompanyDTO

CompanyResponseDTO
if appropriate according to the existing API response conventions.

CreateCompanyDTO should contain only client-editable company fields.

Do NOT accept:

createdBy
verificationStatus
createdAt
updatedAt

from the client.

The server controls:

createdBy
verificationStatus
timestamps

The creator identity must always come from:

req.user.id

Example conceptual DTO:

CreateCompanyDTO

{
    name,
    slug?,
    description?,
    industry?,
    website?,
    logoUrl?,
    location?,
    companySize?
}

UpdateCompanyDTO

{
    name?,
    description?,
    industry?,
    website?,
    logoUrl?,
    location?,
    companySize?
}

Do not allow arbitrary fields.

Do not use any.

==================================================
STEP 5 — ZOD VALIDATION
==================================================

Create:

src/modules/company/company.validator.ts

Use Zod.

Validate:

name
slug
description
industry
website
logoUrl
location
companySize

Use the existing centralized enum definitions.

Use strict validation.

Use existing schemas wherever possible.

For company IDs:

companyId
    ↓
objectIdSchema

For authenticated user IDs:

userId
    ↓
req.user.id

Do NOT validate authenticated user IDs using objectIdSchema.

Remember:

Better Auth user IDs are strings.

MongoDB domain IDs are ObjectIds.

==================================================
STEP 6 — COMPANY REPOSITORY
==================================================

Inspect the existing CompanyRepository.

Do not blindly rewrite it.

Ensure the repository exposes only the database operations required by Phase 12.

Expected capabilities:

create()
findById()
findBySlug()
findCreatedBy()
findVerifiedCompanies()
findCompaniesByIndustry()
updateById()

Only implement methods that are actually required.

Repository responsibilities:

- MongoDB access
- Mongoose queries
- database error handling
- typed results

Repository MUST NOT:

- inspect req.user
- know about Better Auth
- make authorization decisions
- contain HTTP logic
- return HTTP responses
- contain business rules

==================================================
STEP 7 — COMPANY MEMBER REPOSITORY
==================================================

Inspect whether CompanyMemberRepository already exists.

If it does not exist, create it in the existing repository architecture.

Recommended:

src/database/repositories/companyMember/

with:

CompanyMemberRepository.ts
index.ts

Required capabilities should include only what Phase 12 actually needs.

At minimum:

findByUserAndCompany(userId, companyId)

findActiveMembership(userId, companyId)

findMembershipsByUser(userId)

findMembersByCompany(companyId)

createMembership(data)

Potentially:

updateMembershipRole()

updateMembershipStatus()

ONLY if required by Phase 12.

Repository must not decide whether a user is allowed to perform an action.

==================================================
STEP 8 — COMPANY SERVICE
==================================================

Create:

src/modules/company/company.service.ts

Implement:

createCompany(userId, data)

getCompany(companyId, userId?)

getMyCompanies(userId)

updateCompany(userId, companyId, data)

The service owns business rules.

==================================================
CREATE COMPANY BUSINESS FLOW
==================================================

When:

createCompany(userId, data)

is called:

1. Validate company data.

2. Determine slug.

3. Check whether slug already exists.

4. If slug already exists:
       throw 409 conflict.

5. Create Company:

   createdBy = userId

6. Create CompanyMember:

   userId = userId
   companyId = createdCompany._id
   role = owner
   status = active
   invitedBy = null

7. Return the created company.

IMPORTANT:

Company creation and owner membership creation represent one logical operation.

Prefer using a MongoDB transaction/session if the existing MongoDB setup supports it cleanly.

If transactions are not currently configured or appropriate for the project's local MongoDB environment, document the limitation rather than introducing unnecessary infrastructure.

Do not silently leave a company without its owner membership.

==================================================
STEP 9 — COMPANY OWNERSHIP / AUTHORIZATION
==================================================

This phase introduces basic authorization.

Authentication:

requireAuth
    ↓
req.user.id

Authorization:

CompanyMember
    ↓
find membership
    ↓
check role/status

For company management operations:

OWNER
    → allowed

ADMIN
    → allowed if the operation is defined as admin-manageable

RECRUITER
    → do not automatically grant company-management access

VIEWER
    → denied

NO MEMBERSHIP
    → denied

Do not build a generic permissions engine.

Use a small reusable service/helper abstraction only if needed.

For example:

ensureCompanyMember()

ensureCompanyManager()

The exact implementation should fit the existing architecture.

==================================================
STEP 10 — COMPANY ACCESS RULES
==================================================

Define clearly:

CREATE COMPANY

Authenticated user:
    allowed

VIEW COMPANY

Decide based on the existing product contract.

If company information is intended to be publicly viewable:
    allow public viewing.

If company viewing is intended to be private:
    require membership.

Do not invent complicated privacy rules.

Document the decision.

GET MY COMPANIES

Authenticated user:
    return companies where an active CompanyMember record exists.

UPDATE COMPANY

Authenticated user:
    must have appropriate company membership.

Minimum:

owner
    → allowed

viewer
    → denied

non-member
    → denied

Suspended/removed membership
    → denied

Use standardized 403 errors.

==================================================
STEP 11 — SLUG HANDLING
==================================================

Company.slug is unique.

Implement safe slug behavior.

If client supplies slug:

    validate it.

If slug is omitted:

    generate one from company name.

Before creation:

    check uniqueness.

If duplicate:

    return standardized 409 error.

Do not expose raw MongoDB E11000 errors.

Use the existing DuplicateEntityError/repository error architecture.

When updating the company name:

DO NOT automatically change the slug unless the API contract explicitly requires this.

Treat slug as a stable identifier.

==================================================
STEP 12 — COMPANY CONTROLLER
==================================================

Create:

src/modules/company/company.controller.ts

Methods:

createCompany
getCompany
getMyCompanies
updateCompany

Controller responsibilities:

- read req.user.id
- read params
- receive validated request body
- call CompanyService
- return standardized API response

Controller MUST NOT:

- query CompanyModel
- query CompanyMemberModel
- perform authorization
- implement business rules
- generate MongoDB queries
- manually verify Better Auth sessions

Example conceptual flow:

createCompany:

const userId = req.user!.id;

const company = await companyService.createCompany(
    userId,
    req.body
);

return successResponse(...);

Keep controllers thin.

==================================================
STEP 13 — COMPANY ROUTES
==================================================

Create:

src/modules/company/company.routes.ts

Expected routes:

POST   /api/companies

GET    /api/companies/me

GET    /api/companies/:companyId

PATCH  /api/companies/:companyId

All private management routes must use:

requireAuth

Example:

router.post(
    "/",
    requireAuth,
    validate({ body: createCompanySchema }),
    asyncHandler(controller.createCompany)
);

router.get(
    "/me",
    requireAuth,
    asyncHandler(controller.getMyCompanies)
);

router.get(
    "/:companyId",
    ...
);

router.patch(
    "/:companyId",
    requireAuth,
    validate({
        params: companyIdSchema,
        body: updateCompanySchema
    }),
    asyncHandler(controller.updateCompany)
);

IMPORTANT ROUTE ORDER:

If using:

/me

and:

/:companyId

register:

/me

BEFORE:

/:companyId

so "me" is not interpreted as a company ObjectId.

==================================================
STEP 14 — RESPONSE DESIGN
==================================================

Reuse existing:

successResponse()

errorResponse()

AppError

errorMiddleware

Do not create another response structure.

Expected conceptual responses:

CREATE:

201 Created

GET:

200 OK

UPDATE:

200 OK

VALIDATION:

400 Bad Request

UNAUTHENTICATED:

401 Unauthorized

NOT AUTHORIZED:

403 Forbidden

NOT FOUND:

404 Not Found

DUPLICATE SLUG:

409 Conflict

Use existing error-code conventions.

Add new error codes only if necessary.

Possible codes:

COMPANY_NOT_FOUND
COMPANY_SLUG_EXISTS
COMPANY_ACCESS_DENIED
COMPANY_MEMBERSHIP_REQUIRED

Inspect existing error codes first.

Do not duplicate existing codes.

==================================================
STEP 15 — SECURITY / OWNERSHIP TESTS
==================================================

This is one of the most important parts of Phase 12.

Test:

CASE 1

User A creates Company X.

Expected:

Company.createdBy = User A ID

CompanyMember:

userId = User A
companyId = Company X
role = owner
status = active

CASE 2

User A updates Company X.

Expected:

200

CASE 3

User B is authenticated but is NOT a member of Company X.

User B attempts:

PATCH /api/companies/X

Expected:

403

CASE 4

User B is a viewer of Company X.

User B attempts update.

Expected:

403

CASE 5

User B is an owner/admin according to the implemented rules.

Expected:

200

CASE 6

Unauthenticated user attempts company creation.

Expected:

401

CASE 7

Invalid company ObjectId.

Expected:

400

CASE 8

Duplicate company slug.

Expected:

409

CASE 9

GET /api/companies/me

Expected:

Only companies where the authenticated user has appropriate active membership.

Never return another user's private company memberships.

==================================================
STEP 16 — COMPANY MEMBER CREATION
==================================================

When a company is created:

CompanyMember must automatically be created.

Do NOT expose:

POST /api/company-members

in Phase 12 unless there is an actual requirement.

Do not implement invitations yet.

Do not implement email invitations.

Do not implement membership invitation tokens.

Do not implement recruiter onboarding workflows.

Only establish the membership foundation.

==================================================
STEP 17 — DATABASE INTEGRITY
==================================================

Preserve existing indexes:

Company:

slug unique

CompanyMember:

{
    userId: 1,
    companyId: 1
}

unique

Do not remove existing indexes.

Do not introduce duplicate indexes.

Verify the CompanyMember unique constraint prevents duplicate membership.

==================================================
STEP 18 — ROUTE REGISTRATION
==================================================

Register:

/api/companies

in the existing server/application routing architecture.

Do not disturb:

/api/health
/api/health/ready
/api/auth/*
/api/profile/*

Verify all previous modules continue working.

==================================================
STEP 19 — PHASE 11 REGRESSION
==================================================

After Phase 12 implementation, verify Profile still works.

At minimum:

GET /api/profile/me

must still work for an authenticated user.

Verify:

Better Auth
Profile
Company

all continue functioning.

==================================================
STEP 20 — TESTING
==================================================

Perform real API/integration testing.

Minimum flow:

1. Register User A.

2. Login User A.

3. Create Company.

4. Verify Company.createdBy = User A ID.

5. Verify CompanyMember owner record exists.

6. GET /api/companies/me.

7. GET /api/companies/:companyId.

8. PATCH /api/companies/:companyId as owner.

9. Register User B.

10. Login User B.

11. Attempt to update User A's company.

12. Verify 403.

13. Add User B as a membership only if the current phase has a supported mechanism.

14. Verify membership-based access rules.

15. Test duplicate slug.

16. Test invalid ObjectId.

17. Test unauthenticated requests.

==================================================
STEP 21 — TYPE CHECK & BUILD
==================================================

Run:

npm run type-check

npm run build

Both must pass.

No TypeScript errors.

==================================================
STEP 22 — HEALTH CHECK
==================================================

Verify:

GET /api/health

GET /api/health/ready

Both must remain functional.

==================================================
STEP 23 — BETTER AUTH REGRESSION
==================================================

Verify:

/api/auth/*

still works.

Verify:

requireAuth

still resolves:

req.user.id

as:

string

Do not modify Better Auth unless a genuine integration issue is discovered.

==================================================
STEP 24 — DOCUMENTATION
==================================================

Create:

server/doc/phase12-company-module.md

Documentation must include:

1. Purpose

2. Company architecture

3. Company model relationship

4. CompanyMember relationship

5. Authentication vs authorization

6. Company creation flow

7. Owner membership creation flow

8. DTO structure

9. Validation rules

10. Repository responsibilities

11. Service responsibilities

12. Controller responsibilities

13. API routes

14. Authorization rules

15. Ownership rules

16. Error handling

17. Database/index behavior

18. Example request/response flows

19. Security test results

20. Phase 11 regression results

21. Better Auth regression results

22. Type-check/build results

23. Health endpoint results

24. Known limitations

25. Next recommended phase

==================================================
STRICT LAYERING RULES
==================================================

FOLLOW:

Route
  ↓
Middleware
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

DO NOT:

- query MongoDB from controllers
- query MongoDB from services
- put business rules in repositories
- put HTTP logic in repositories
- put authorization rules in models
- put authentication logic in services
- access Better Auth directly from controllers
- accept createdBy from clients
- accept userId from clients for ownership
- use any
- duplicate repositories
- duplicate validators
- duplicate error systems
- create generic RBAC framework
- create generic permission engine
- create custom JWT
- create custom sessions
- modify authentication unnecessarily

==================================================
FINAL FILE STRUCTURE
==================================================

Expected architecture should remain similar to:

src/
│
├── core/
│   ├── auth/
│   ├── config/
│   ├── constants/
│   └── validators/
│
├── database/
│   ├── models/
│   └── repositories/
│       ├── base/
│       ├── company/
│       ├── companyMember/
│       ├── profile/
│       └── ...
│
├── modules/
│   ├── profile/
│   │   ├── profile.controller.ts
│   │   ├── profile.dto.ts
│   │   ├── profile.routes.ts
│   │   ├── profile.service.ts
│   │   ├── profile.validator.ts
│   │   └── index.ts
│   │
│   └── company/
│       ├── company.controller.ts
│       ├── company.dto.ts
│       ├── company.routes.ts
│       ├── company.service.ts
│       ├── company.validator.ts
│       └── index.ts
│
└── types/

Do not reorganize the entire project during this phase.

Follow the current structure if paths differ.

==================================================
COMPLETION CRITERIA
==================================================

Phase 12 is complete only when:

✅ Company DTOs implemented
✅ Company Zod validators implemented
✅ CompanyRepository reviewed/completed
✅ CompanyMemberRepository implemented/reviewed
✅ CompanyService implemented
✅ CompanyController implemented
✅ Company routes implemented
✅ requireAuth integrated
✅ Company creation works
✅ createdBy comes from req.user.id
✅ Owner CompanyMember automatically created
✅ Company retrieval works
✅ My companies works
✅ Company update works
✅ Company ownership enforced
✅ Non-member cannot manage company
✅ Viewer cannot manage company
✅ Appropriate company manager can manage company
✅ Duplicate slug handled
✅ Duplicate membership prevented by database constraint
✅ Standardized errors working
✅ API responses standardized
✅ Phase 11 Profile still works
✅ Better Auth still works
✅ Health endpoints still work
✅ TypeScript passes
✅ Build passes
✅ Integration/API testing completed
✅ phase12-company-module.md created

==================================================
FINAL REPORT
==================================================

Return a detailed implementation walkthrough.

Include:

- Files created
- Files modified
- Company data flow
- CompanyMember data flow
- Authentication flow
- Authorization flow
- DTO design
- Validation design
- Repository methods
- Service methods
- Controller methods
- API endpoint table
- Ownership rules
- Membership rules
- Error handling
- Database/index behavior
- Security test results
- Phase 11 regression test
- Better Auth regression test
- TypeScript result
- Build result
- Health result
- Known limitations

The final report must conclude with:

✅ PHASE 12 — COMPANY MODULE COMPLETE

✅ COMPANY CRUD COMPLETE

✅ COMPANY OWNERSHIP COMPLETE

✅ COMPANY MEMBER FOUNDATION COMPLETE

✅ BASIC COMPANY AUTHORIZATION COMPLETE

✅ PHASE 11 REGRESSION PASSED

✅ BETTER AUTH REGRESSION PASSED

✅ TYPESCRIPT PASSED

✅ BUILD PASSED

Ready for:

PHASE 13 — COMPANY MEMBER MANAGEMENT / RECRUITER ACCESS