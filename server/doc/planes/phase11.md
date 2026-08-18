# PHASE 11 — Candidate Profile Module

Continue from the completed SKILLEZO backend implementation.

IMPORTANT:
Phases 1–10C are already implemented and verified.

The current architecture is:

Better Auth
    ↓
requireAuth
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

This phase must implement the first complete business module:
CANDIDATE PROFILE.

DO NOT redesign the existing architecture.

DO NOT replace Better Auth.

DO NOT create custom authentication.

DO NOT introduce JWT.

DO NOT modify the database architecture unless a real schema mismatch is discovered.

Use the existing Profile Mongoose model and ProfileRepository.

==================================================
OBJECTIVE
==================================================

Implement the Candidate Profile module end-to-end.

The module must allow an authenticated candidate to:

1. Create their profile
2. View their own profile
3. Update their profile
4. Update skills
5. Update education
6. Update experience
7. Update links
8. Update target role

The authenticated user's identity MUST always come from:

req.user.id

NEVER trust userId from req.body, query parameters, or route parameters for "my profile" operations.

==================================================
ARCHITECTURE
==================================================

Implement:

HTTP Request
    ↓
Profile Route
    ↓
requireAuth
    ↓
Profile Controller
    ↓
Profile Service
    ↓
Profile Repository
    ↓
Profile Model
    ↓
MongoDB

Responsibilities:

ROUTE
- HTTP endpoint definition
- middleware composition

AUTH MIDDLEWARE
- Verify Better Auth session
- Provide req.user

CONTROLLER
- Read HTTP request
- Read req.user
- Validate/use DTO input
- Call service
- Return standardized API response
- NO business logic
- NO direct MongoDB access

SERVICE
- Business rules
- Ownership rules
- Profile existence checks
- Duplicate profile handling
- Domain validation
- Calls repository
- NO direct Mongoose queries

REPOSITORY
- Database access only
- Uses ProfileModel
- No HTTP logic
- No authentication logic
- No business rules

MODEL
- Existing Mongoose persistence definition
- Do not redesign unless necessary

==================================================
STEP 1 — INSPECT EXISTING IMPLEMENTATION
==================================================

Before writing code, inspect:

src/database/models/Profile.model.ts

src/database/repositories/profile/ProfileRepository.ts

src/core/auth/requireAuth.ts
or the actual existing requireAuth location

src/core/auth/auth.types.ts

src/types/express.d.ts

src/core/constants/

src/core/validators/

src/utils/

src/middleware/

DATABASE_SCHEMA.md

Also inspect the existing API response/error architecture.

DO NOT duplicate existing utilities.

Reuse:

- AppError
- asyncHandler
- apiResponse
- validate middleware
- error middleware
- existing constants
- existing pagination/types where appropriate

First determine the exact current paths because the repository was previously refactored.

==================================================
STEP 2 — PROFILE DOMAIN CONTRACT
==================================================

Use DATABASE_SCHEMA.md as the source of truth.

Do not invent fields.

The Profile module must respect the existing Profile model structure.

Profile identity:

userId: string

This comes from:

req.user.id

Target role:

targetRoleId: MongoDB ObjectId

Do not treat targetRoleId as a Better Auth user ID.

Embedded profile data remains embedded according to the existing model:

skills
education
experience
links
location

==================================================
STEP 3 — CREATE PROFILE DTOs
==================================================

Create a module-local DTO structure.

Preferred location:

src/modules/profile/profile.dto.ts

Define appropriate TypeScript types for:

CreateProfileDTO
UpdateProfileDTO
UpdateSkillsDTO
UpdateEducationDTO
UpdateExperienceDTO
UpdateLinksDTO
UpdateTargetRoleDTO

DTOs must represent API input only.

Do not expose Mongoose document types as API contracts.

Do not use any.

Keep DTOs aligned with DATABASE_SCHEMA.md.

==================================================
STEP 4 — CREATE PROFILE VALIDATORS
==================================================

Create:

src/modules/profile/profile.validator.ts

Use Zod.

Implement validators for:

create profile
update profile
update skills
update education
update experience
update links
update target role

Important:

userId MUST NOT be accepted from the client for "my profile" operations.

targetRoleId MUST be validated as a MongoDB ObjectId.

Use the existing objectIdSchema instead of creating another ObjectId validator.

Example conceptual rule:

userId
→ never from request body

targetRoleId
→ ObjectId validation

skills / education / experience / links
→ strict structural validation

Reject unexpected fields where appropriate.

==================================================
STEP 5 — REVIEW / COMPLETE PROFILE REPOSITORY
==================================================

Use the existing ProfileRepository.

Do not create a second repository.

The repository should provide the persistence operations required by the service.

Expected capabilities:

findByUserId(userId)

create(profileData)

updateByUserId(userId, updateData)

updateSkills(userId, skills)

updateEducation(userId, education)

updateExperience(userId, experience)

updateLinks(userId, links)

updateTargetRole(userId, targetRoleId)

existsByUserId(userId)

Only implement methods that are actually required.

Do not blindly add unnecessary methods.

Repository methods must:

- use ProfileModel
- handle database errors through the existing repository error system
- return typed results
- not contain business rules
- not know about Express req/res
- not know about Better Auth

==================================================
STEP 6 — CREATE PROFILE SERVICE
==================================================

Create:

src/modules/profile/profile.service.ts

Implement:

createProfile(userId, data)

getMyProfile(userId)

updateProfile(userId, data)

updateSkills(userId, skills)

updateEducation(userId, education)

updateExperience(userId, experience)

updateLinks(userId, links)

updateTargetRole(userId, targetRoleId)

Business rules:

1. Profile belongs to authenticated user.

2. userId comes from req.user.id.

3. A user can have only one Profile.

4. Creating a second profile must return a meaningful conflict error.

5. Getting a profile that does not exist must return a standardized not-found error.

6. Updating a profile that does not exist must return a standardized not-found error.

7. Never allow the client to change profile ownership.

8. targetRoleId must remain a domain ObjectId.

9. Do not place database queries directly in the service.

10. Do not place HTTP status handling directly in the service unless it follows the existing AppError architecture.

11. Do not implement AI/skill-gap/career-plan logic here.

Those belong to future modules.

==================================================
STEP 7 — CREATE PROFILE CONTROLLER
==================================================

Create:

src/modules/profile/profile.controller.ts

Implement thin controller methods:

createProfile
getMyProfile
updateProfile
updateSkills
updateEducation
updateExperience
updateLinks
updateTargetRole

Controller flow:

req.user
    ↓
extract authenticated user ID
    ↓
request validated by middleware
    ↓
call ProfileService
    ↓
successResponse()
    ↓
res.json()

The controller MUST NOT:

- query MongoDB
- use ProfileModel
- implement business rules
- calculate anything
- verify Better Auth sessions manually

Authentication has already been handled by requireAuth.

==================================================
STEP 8 — CREATE PROFILE ROUTES
==================================================

Create:

src/modules/profile/profile.routes.ts

Routes:

POST   /api/profile
GET    /api/profile/me
PATCH  /api/profile/me

PATCH  /api/profile/me/skills
PATCH  /api/profile/me/education
PATCH  /api/profile/me/experience
PATCH  /api/profile/me/links
PATCH  /api/profile/me/target-role

Every route must use:

requireAuth

and appropriate Zod validation.

Conceptual structure:

router.post(
  "/",
  requireAuth,
  validate(...),
  controller.createProfile
)

router.get(
  "/me",
  requireAuth,
  controller.getMyProfile
)

etc.

Use asyncHandler if required by the existing architecture.

Do not create public profile mutation endpoints.

==================================================
STEP 9 — MODULE STRUCTURE
==================================================

Use a feature/module-based structure.

Preferred:

src/modules/profile/
│
├── profile.controller.ts
├── profile.service.ts
├── profile.repository.ts   <-- ONLY if architecture requires module wrapper
├── profile.dto.ts
├── profile.validator.ts
├── profile.routes.ts
└── index.ts

IMPORTANT:

The project already has:

src/database/repositories/profile/ProfileRepository.ts

Do NOT create a duplicate repository if the existing repository layer is the canonical architecture.

Prefer:

Controller
    ↓
ProfileService
    ↓
database/repositories/profile/ProfileRepository

Keep the repository in the existing database layer.

==================================================
STEP 10 — ROUTE REGISTRATION
==================================================

Register the Profile router in the existing server/application routing architecture.

Expected final route namespace:

/api/profile

Do not disturb:

/api/health
/api/health/ready
/api/auth/*

Authentication routes must continue working.

==================================================
STEP 11 — API RESPONSE STANDARDIZATION
==================================================

Reuse the existing response architecture.

Successful responses must follow the project's existing:

successResponse()

Error responses must flow through:

AppError
    ↓
errorMiddleware

Do not create another response format.

Use meaningful error codes.

Examples where appropriate:

PROFILE_ALREADY_EXISTS
PROFILE_NOT_FOUND

Do not duplicate existing error codes.

Inspect the existing error-code system first.

==================================================
STEP 12 — OWNERSHIP SECURITY
==================================================

This is extremely important.

Correct:

GET /api/profile/me
        ↓
requireAuth
        ↓
req.user.id
        ↓
ProfileService.getMyProfile(req.user.id)

Incorrect:

GET /api/profile/me?userId=someone-else

Incorrect:

POST /api/profile

{
  "userId": "someone-else"
}

The authenticated identity is authoritative.

The client may provide profile data.

The client MUST NOT choose the owner.

==================================================
STEP 13 — ERROR CASES
==================================================

Implement and verify:

1. No authentication
   → 401

2. Suspended account
   → 403

3. Deactivated account
   → 403

4. Create profile successfully
   → 201

5. Create duplicate profile
   → 409

6. Get existing profile
   → 200

7. Get missing profile
   → 404

8. Update existing profile
   → 200

9. Update missing profile
   → 404

10. Invalid targetRoleId
    → 400

11. Invalid profile payload
    → 400

12. Unknown/unexpected fields
    → validation error according to existing validation policy

==================================================
STEP 14 — TESTING
==================================================

Do not stop at TypeScript compilation.

Test the actual API behavior.

At minimum verify:

AUTHENTICATION

Unauthenticated:
GET /api/profile/me
→ 401

Authenticated:
GET /api/profile/me
→ 200 or 404 depending on profile existence

PROFILE CREATION

POST /api/profile
→ creates profile

Repeat:
POST /api/profile
→ 409

PROFILE READ

GET /api/profile/me
→ returns current user's profile

PROFILE UPDATE

PATCH /api/profile/me
→ updates current user's profile

SKILLS

PATCH /api/profile/me/skills

EDUCATION

PATCH /api/profile/me/education

EXPERIENCE

PATCH /api/profile/me/experience

LINKS

PATCH /api/profile/me/links

TARGET ROLE

PATCH /api/profile/me/target-role

SECURITY

Attempt to send another user ID in request body.

Verify it cannot change ownership.

==================================================
STEP 15 — TYPE AND BUILD VERIFICATION
==================================================

Run:

npm run type-check

npm run build

Both must pass with zero errors.

==================================================
STEP 16 — HEALTH VERIFICATION
==================================================

Verify existing endpoints still work:

GET /api/health

GET /api/health/ready

Do not break Better Auth.

Verify:

/api/auth/*

continues working.

==================================================
STEP 17 — DOCUMENTATION
==================================================

Create:

server/doc/phase11-profile-module.md

Document:

1. Purpose

2. Architecture

3. Folder structure

4. Profile data flow

5. Authentication flow

6. Controller responsibilities

7. Service responsibilities

8. Repository responsibilities

9. DTO design

10. Validation rules

11. API endpoints

12. Request/response examples

13. Ownership/security model

14. Error handling

15. Database interaction

16. Testing results

17. Type-check/build results

18. Health endpoint results

19. What is intentionally NOT implemented

==================================================
FINAL ARCHITECTURE
==================================================

The completed module must follow:

                    CLIENT
                       │
                       ▼
                  EXPRESS
                       │
                       ▼
                PROFILE ROUTE
                       │
                       ▼
                 requireAuth
                       │
                       ▼
              Better Auth Session
                       │
                       ▼
                  req.user
                       │
                       ▼
              PROFILE CONTROLLER
                       │
                       ▼
                PROFILE SERVICE
                       │
                       ▼
             ProfileRepository
                       │
                       ▼
                ProfileModel
                       │
                       ▼
                    MongoDB

Authentication:
Better Auth

Authorization/ownership:
Service + future authorization layer

HTTP:
Controller

Business logic:
Service

Data access:
Repository

Persistence:
Mongoose Model

==================================================
STRICT ARCHITECTURAL RULES
==================================================

DO NOT:

- create custom JWT
- create custom authentication
- modify Better Auth architecture
- put MongoDB queries in controllers
- put MongoDB queries in services
- put business logic in repositories
- put business logic in models
- accept authenticated userId from request body
- use any
- duplicate ProfileRepository
- create unnecessary global utilities
- implement career-gap logic
- implement resume parsing
- implement job matching
- implement application logic
- implement recruiter authorization
- implement admin authorization
- implement AI logic

This phase is ONLY Candidate Profile.

==================================================
COMPLETION CRITERIA
==================================================

Phase 11 is complete only when:

✅ Profile DTOs implemented
✅ Profile Zod validators implemented
✅ ProfileRepository reviewed/completed
✅ ProfileService implemented
✅ ProfileController implemented
✅ Profile routes implemented
✅ requireAuth integrated
✅ req.user.id used as profile owner
✅ Profile CRUD/update operations working
✅ Duplicate profile prevented
✅ Ownership protected
✅ Standardized errors working
✅ API responses standardized
✅ TypeScript passes
✅ Build passes
✅ Health endpoints still work
✅ Better Auth still works
✅ Integration/API testing completed
✅ phase11-profile-module.md created

FINAL REPORT MUST INCLUDE:

- Files created
- Files modified
- API endpoints
- Architecture flow
- Business rules
- Security/ownership rules
- Repository methods
- Service methods
- Controller methods
- Validation rules
- Test results
- Type-check result
- Build result
- Health result
- Better Auth regression result
- Known limitations
- Next recommended phase

The final report should conclude:

✅ PHASE 11 — CANDIDATE PROFILE MODULE COMPLETE

Ready for:

PHASE 12 — COMPANY MODULE