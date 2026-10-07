# SKILLEZO Backend — Phase 4

## Core Mongoose Models — User, Role, Company

Continue from the completed **Phase 1, Phase 2, and Phase 3 implementation inside `/server`**.

Do NOT rebuild, reorganize, or replace previous phases.

This phase begins implementation of the actual **Mongoose persistence/model layer**.

The database source of truth is:

```text
DATABASE_SCHEMA.md
```

You MUST inspect and follow `DATABASE_SCHEMA.md` before implementing anything.

If this prompt and `DATABASE_SCHEMA.md` ever appear to conflict regarding database structure:

```text
DATABASE_SCHEMA.md wins.
```

Do NOT invent fields, relationships, indexes, lifecycle states, or collections that are not defined there.

---

# 1. Architecture Is Locked

The backend architecture remains:

```text
Next.js Frontend
       ↓ HTTP
Express Routes
       ↓
Validation Middleware
       ↓
Controllers
       ↓
Services
       ↓
Repositories
       ↓
Mongoose Models
       ↓
MongoDB Atlas
```

Dependencies move downward only.

Forbidden:

```text
Route → Model
Controller → Model
Controller → Repository
Service → Model
Repository → Service
Model → Repository
```

Required future flow:

```text
Route
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
```

Phase 4 implements ONLY part of the final Model layer.

---

# 2. Current Completed Foundation

Existing backend approximately contains:

```text
server/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
│
├── doc/
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
│
└── src/
    ├── config/
    │   └── env.ts
    │
    ├── constants/
    │   ├── enums.ts
    │   ├── error-codes.ts
    │   ├── http-status.ts
    │   └── index.ts
    │
    ├── lib/
    │   └── db.ts
    │
    ├── middleware/
    │   ├── error.middleware.ts
    │   ├── notFound.middleware.ts
    │   └── validate.middleware.ts
    │
    ├── routes/
    │   └── health.routes.ts
    │
    ├── types/
    │   ├── api.types.ts
    │   └── pagination.types.ts
    │
    ├── utils/
    │   ├── AppError.ts
    │   ├── apiResponse.ts
    │   └── asyncHandler.ts
    │
    ├── validators/
    │   └── common.validators.ts
    │
    ├── models/
    ├── repositories/
    ├── services/
    ├── controllers/
    ├── dto/
    │
    └── server.ts
```

Preserve this architecture.

---

# 3. Phase 4 Goal

Implement ONLY the three root/core Mongoose models:

```text
User
Role
Company
```

Create:

```text
src/models/User.model.ts
src/models/Role.model.ts
src/models/Company.model.ts
```

These models form the foundation for dependent models implemented later.

Dependency direction:

```text
User
 ├── Profile
 ├── Resume
 ├── CareerPlan
 ├── CompanyMember
 └── Application

Role
 ├── Profile
 ├── Competency
 ├── CareerPlan
 └── Job

Company
 ├── CompanyMember
 └── Job
```

Do NOT implement those dependent models yet.

---

# 4. Inspect Before Implementing

Before modifying anything, inspect:

```text
DATABASE_SCHEMA.md

server/src/constants/enums.ts
server/src/constants/index.ts

server/src/lib/db.ts

server/src/middleware/error.middleware.ts

server/tsconfig.json
server/package.json
```

Especially verify that Phase 3 enums match the finalized database schema.

Do NOT duplicate enum definitions inside model files.

Models must reuse the centralized Phase 3 enums.

---

# 5. Global MongoDB Conventions

Follow the finalized database conventions.

## IDs

MongoDB ObjectIds are used internally.

Do NOT manually define `_id` unless there is a technical reason.

Let Mongoose generate ObjectIds.

---

## Timestamps

Every model in this phase MUST use:

```ts
{
  timestamps: true
}
```

producing:

```text
createdAt
updatedAt
```

Do NOT manually maintain these fields.

---

## Collection Naming

Collections must follow:

```text
lowercase plural
```

Phase 4 collections:

```text
users
roles
companies
```

Make collection names explicit if necessary to guarantee the database contract.

Do not accidentally create unexpected collection names.

---

## Field Naming

Use:

```text
camelCase
```

References use:

```text
<entity>Id
```

Example:

```text
createdBy
```

is intentionally defined by the database specification for Company and should remain as specified.

---

# 6. TypeScript + Mongoose Design

Each model must have a strongly typed TypeScript representation.

Use modern Mongoose TypeScript patterns.

Avoid:

```ts
any
```

unless absolutely unavoidable.

The model should provide correct types for:

```text
fields
timestamps
ObjectId references
nullable values
enum values
```

Do NOT create giant duplicate interfaces that easily drift away from the Mongoose schema.

Choose a clean Mongoose typing approach and apply it consistently across all three models.

---

# 7. Enum Reuse Rule

Do NOT write:

```ts
enum: ["candidate", "recruiter", "admin"]
```

if the same values already exist centrally.

Reuse:

```text
src/constants/enums.ts
```

The enum source must remain centralized so future:

```text
Zod validators
Mongoose models
Services
DTOs
```

share the same domain values.

If Phase 3 uses `as const` objects/arrays, derive the Mongoose enum values from those constants cleanly.

Do NOT maintain duplicate sources of truth.

---

# 8. USER MODEL

Create:

```text
src/models/User.model.ts
```

Purpose:

```text
Authentication
Authorization
Account-level information
```

Candidate professional information must NOT be stored here.

Do NOT add:

```text
firstName
lastName
skills
education
experience
targetRole
companyId
resume
```

Those belong elsewhere.

---

# 9. User Fields

Implement exactly:

```text
User
│
├── _id
├── email
├── passwordHash
├── role
├── emailVerified
├── accountStatus
├── lastLoginAt
├── createdAt
└── updatedAt
```

Schema requirements:

### email

```text
Type: String
Required: true
Unique: true
Trim: true
Lowercase: true
```

Do NOT rely only on application-level email normalization.

Mongoose should also normalize:

```text
trim
lowercase
```

Do not add complicated email regex validation to the persistence layer unless already required by the database specification.

Request-level email format validation belongs to Zod later.

---

### passwordHash

```text
Type: String
Required: true
```

IMPORTANT:

The field is:

```text
passwordHash
```

NOT:

```text
password
```

Never store plaintext passwords.

Do NOT implement password hashing in this model.

Do NOT add:

```text
pre("save")
```

bcrypt hooks.

Password hashing belongs to authentication/service infrastructure later.

---

### role

Use centralized:

```text
UserRole
```

Allowed values:

```text
candidate
recruiter
admin
```

Required:

```text
true
```

Default:

```text
candidate
```

Indexed:

```text
true
```

---

### emailVerified

```text
Type: Boolean
Required: true
Default: false
```

---

### accountStatus

Use centralized:

```text
AccountStatus
```

Allowed:

```text
active
suspended
deactivated
```

Required:

```text
true
```

Default:

```text
active
```

Indexed:

```text
true
```

---

### lastLoginAt

```text
Type: Date
Required: false
Default: null
```

TypeScript must correctly represent:

```text
Date | null
```

---

# 10. User Indexes

Final required indexes:

```text
{ email: 1 } UNIQUE

{ role: 1 }

{ accountStatus: 1 }
```

Be careful not to accidentally define duplicate equivalent indexes using both:

```ts
index: true
```

and:

```ts
schema.index(...)
```

unless intentional.

Choose one clear approach.

Verify the resulting Mongoose indexes.

---

# 11. Protect passwordHash

The database specification requires:

```text
passwordHash must never be included in normal API responses.
```

At model level, use a safe persistence default such as:

```ts
select: false
```

for `passwordHash`.

This means normal queries should not return it automatically.

Future authentication repositories can explicitly request it when credential verification requires it.

Example future concept:

```ts
.select("+passwordHash")
```

Do NOT implement the repository now.

Do NOT create authentication methods now.

---

# 12. USER MODEL MUST NOT CONTAIN

Do NOT implement:

```text
comparePassword()
generateAccessToken()
generateRefreshToken()
hashPassword()
register()
login()
permissions()
profile completeness
```

No business logic belongs in the model.

---

# 13. ROLE MODEL

Create:

```text
src/models/Role.model.ts
```

Purpose:

```text
Standardized career role definitions
```

Examples later:

```text
Frontend Developer
Backend Developer
Full Stack Developer
Product Designer
Data Analyst
```

---

# 14. Role Fields

Implement:

```text
Role
│
├── _id
├── name
├── slug
├── description
├── status
├── createdAt
└── updatedAt
```

---

### name

```text
Type: String
Required: true
Trim: true
```

Index:

```text
{ name: 1 }
```

Do NOT make `name` unique.

The approved schema only specifies a normal index.

---

### slug

```text
Type: String
Required: true
Trim: true
Lowercase: true
Unique: true
```

Index:

```text
{ slug: 1 } UNIQUE
```

Do NOT automatically generate the slug using Mongoose hooks.

Slug generation is application/service responsibility.

The model only stores and validates the resulting value.

---

### description

```text
Type: String
Required: true
Trim: true
```

Do not invent a default unless required by the database specification.

---

### status

Use centralized:

```text
RoleStatus
```

Allowed:

```text
active
inactive
```

Required:

```text
true
```

Use a sensible schema default only if the finalized database specification defines one.

If the source specification does NOT define a default:

```text
do not invent one.
```

Index:

```text
{ status: 1 }
```

---

# 15. Role Indexes

Required:

```text
{ name: 1 }

{ slug: 1 } UNIQUE

{ status: 1 }
```

Verify all three.

---

# 16. ROLE MODEL MUST NOT CONTAIN

Do NOT implement:

```text
slug generation
competency calculations
career readiness calculations
role recommendation
admin authorization
search ranking
```

These belong in later layers.

---

# 17. COMPANY MODEL

Create:

```text
src/models/Company.model.ts
```

Purpose:

```text
Employer / recruiting organization
```

---

# 18. Company Fields

Implement exactly:

```text
Company
│
├── _id
├── name
├── slug
├── description
├── industry
├── website
├── logoUrl
├── location
│   ├── city
│   ├── state
│   └── country
├── companySize
├── verificationStatus
├── createdBy
├── createdAt
└── updatedAt
```

Do NOT add:

```text
recruiters[]
members[]
jobs[]
ownerId
userId
```

Recruiter/company membership is intentionally handled later through:

```text
company_members
```

---

# 19. Company name

```text
Type: String
Required: true
Trim: true
```

Index:

```text
{ name: 1 }
```

Do NOT make company name unique.

Different organizations may potentially share similar names.

---

# 20. Company slug

```text
Type: String
Required: true
Trim: true
Lowercase: true
Unique: true
```

Required index:

```text
{ slug: 1 } UNIQUE
```

Do NOT generate the slug in the model.

Slug creation belongs to a future CompanyService/application workflow.

---

# 21. Company description

Follow `DATABASE_SCHEMA.md` exactly regarding required/optional behavior.

Do not infer business requirements not specified there.

Use:

```text
String
trim
```

where appropriate.

---

# 22. Company industry

Use:

```text
String
```

Normalize with:

```text
trim
```

if appropriate.

Required index:

```text
{ industry: 1 }
```

Do NOT create an industry enum.

The database specification currently defines industry as a string.

---

# 23. Company website

Use:

```text
String
```

Do NOT implement complex URL business validation inside the model unless explicitly required by the database specification.

Request-level URL validation belongs to Zod.

Basic normalization such as trim is acceptable.

---

# 24. Company logoUrl

Use:

```text
String
```

Do NOT implement:

```text
file upload
Cloudinary
S3
image processing
```

in Phase 4.

The model stores the URL only.

---

# 25. Company Location

Create an embedded location subdocument:

```text
location
├── city
├── state
└── country
```

Use:

```text
String
```

for each field.

Do NOT create a separate Location collection.

Disable unnecessary embedded `_id` generation for this single nested value object if using a dedicated sub-schema.

We do NOT need:

```text
location._id
```

---

# 26. Company Size

Use centralized:

```text
CompanySize
```

Allowed values:

```text
1-10
11-50
51-200
201-500
501-1000
1001-5000
5000+
```

Do not duplicate these values manually.

---

# 27. Company Verification Status

Use centralized:

```text
CompanyVerificationStatus
```

Allowed:

```text
pending
verified
rejected
```

Use a default ONLY if defined by the approved database specification.

Do not invent behavior.

Required index:

```text
{ verificationStatus: 1 }
```

---

# 28. Company createdBy

Implement:

```text
createdBy: ObjectId
```

Reference:

```text
User
```

Conceptually:

```ts
ref: "User"
```

This records which platform user created the company.

Do NOT enforce:

```text
user must be recruiter
user must be active
user must have company permission
```

inside the Mongoose model.

Those are Service Layer rules.

Mongoose only stores the reference.

---

# 29. Company Indexes

Required:

```text
{ slug: 1 } UNIQUE

{ name: 1 }

{ industry: 1 }

{ verificationStatus: 1 }

{ "location.city": 1 }
```

Implement exactly.

Do NOT add speculative indexes.

---

# 30. Company → Recruiter Relationship

IMPORTANT ARCHITECTURE RULE:

Do NOT add:

```ts
companyId
```

to User.

Do NOT add:

```ts
recruiterIds: []
```

to Company.

Do NOT add:

```ts
members: []
```

to Company.

The approved architecture intentionally uses:

```text
User
   ↓
CompanyMember
   ↓
Company
```

resulting in:

```text
User N:M Company
```

`CompanyMember.model.ts` comes in Phase 5.

---

# 31. Mongoose References

Phase 4 has only one application reference:

```text
Company.createdBy
       ↓
User
```

Use:

```text
Schema.Types.ObjectId
```

with:

```text
ref: "User"
```

Do NOT use:

```text
string
```

for stored MongoDB references.

TypeScript representation should use the appropriate Mongoose ObjectId type.

---

# 32. Reference Integrity

Remember:

MongoDB/Mongoose `ref` does NOT provide SQL-style foreign-key enforcement.

Do NOT attempt to build cross-document existence validation into the model.

For example:

```text
Does Company.createdBy actually exist?
```

will later be guaranteed by:

```text
CompanyService
       ↓
UserRepository
```

not by asynchronous Mongoose validators.

Do NOT create async database validators inside schemas.

---

# 33. Model Export Convention

Use a consistent export convention.

For example:

```text
UserModel
RoleModel
CompanyModel
```

or another existing project convention.

Apply the same pattern to all models.

Model names should be:

```text
User
Role
Company
```

Collection names:

```text
users
roles
companies
```

Avoid inconsistent naming like:

```text
UsersModel
RolesModel
CompaniesModel
```

unless the existing project convention explicitly requires it.

---

# 34. Model Recompilation Safety

If relevant to the development environment, safely avoid Mongoose model recompilation issues.

Use an appropriate pattern compatible with this standalone Express backend.

Do NOT copy Next.js-specific model caching patterns blindly.

This is a long-running Express server.

A normal one-time module export is usually sufficient.

Use the simplest correct implementation.

---

# 35. Do Not Add Plugins

Do NOT install or introduce:

```text
mongoose-paginate
mongoose-autopopulate
mongoose-delete
mongoose-unique-validator
slug plugins
timestamps plugins
```

Mongoose already provides what Phase 4 requires.

No additional package should be necessary.

---

# 36. No Automatic Populate

Do NOT use:

```text
autopopulate
```

or model middleware that automatically populates references.

Repositories later decide when population is necessary.

Persistence models should remain predictable.

---

# 37. No Model Hooks Unless Required

Avoid:

```text
pre("save")
post("save")
pre("find")
post("find")
```

during Phase 4.

Specifically do NOT use hooks for:

```text
password hashing
slug generation
authorization
company verification
timestamps
```

Mongoose already handles timestamps.

Business workflows belong in Services.

---

# 38. No Business Methods

Do NOT attach instance/static methods for business workflows.

Avoid:

```ts
user.comparePassword()

user.generateToken()

role.calculateReadiness()

company.canRecruit()

company.addMember()
```

Phase 4 models are persistence definitions.

---

# 39. Model Validation Boundary

Mongoose validation should enforce:

```text
types
required fields
enum values
min/max where defined
normalization
unique indexes
indexes
```

It should NOT enforce:

```text
authorization
ownership
role existence
membership permissions
business workflows
career calculations
authentication logic
```

Those belong later in Services.

---

# 40. Unique Is Not Validation

Remember:

```ts
unique: true
```

creates a unique MongoDB index.

It is NOT a Mongoose validator.

Do not write code assuming duplicate records produce a normal Mongoose validation error.

Our Phase 3 global error middleware already prepares handling for MongoDB duplicate-key error:

```text
11000
```

Future Services can convert generic duplicate errors into domain-specific errors.

---

# 41. Development Index Behavior

Inspect the current Mongoose configuration.

Do NOT manually call:

```ts
syncIndexes()
```

during every production startup.

Do NOT drop indexes.

Do NOT automatically destroy/rebuild collections.

For Phase 4 verification, index inspection/synchronization may be performed deliberately in development if needed.

Document what was done.

---

# 42. Model-Level Testing / Verification

Before completing Phase 4, verify the models against MongoDB/Mongoose.

At minimum verify schema definitions programmatically.

---

# 43. User Validation Tests

Verify a valid User can be instantiated/validated with:

```text
email
passwordHash
```

and receives correct defaults:

```text
role = candidate
emailVerified = false
accountStatus = active
lastLoginAt = null
```

Verify:

```text
email normalization
```

for:

```text
trim
lowercase
```

Verify invalid:

```text
role
accountStatus
```

fails Mongoose validation.

Verify missing:

```text
email
passwordHash
```

fails validation.

---

# 44. User passwordHash Safety

Verify schema configuration contains:

```text
select: false
```

for:

```text
passwordHash
```

Do NOT log actual password hashes during testing.

---

# 45. Role Validation Tests

Verify valid:

```text
name
slug
description
status
```

passes.

Verify invalid:

```text
status
```

fails.

Verify required fields behave according to `DATABASE_SCHEMA.md`.

Verify slug normalization if configured:

```text
trim
lowercase
```

---

# 46. Company Validation Tests

Verify valid Company data passes.

Verify invalid:

```text
companySize
verificationStatus
```

fails.

Verify:

```text
createdBy
```

accepts a valid ObjectId.

Verify invalid ObjectId values are rejected/cast appropriately by Mongoose.

Do NOT require a real User document merely to test schema validation.

---

# 47. Index Verification

Programmatically inspect:

```ts
UserSchema.indexes()

RoleSchema.indexes()

CompanySchema.indexes()
```

or equivalent.

Confirm required indexes.

Expected:

```text
User
├── email UNIQUE
├── role
└── accountStatus

Role
├── name
├── slug UNIQUE
└── status

Company
├── slug UNIQUE
├── name
├── industry
├── verificationStatus
└── location.city
```

Ensure duplicate equivalent indexes were not accidentally created.

---

# 48. Optional Database Smoke Test

If a configured development MongoDB database is safely available, perform a controlled smoke test.

Do NOT destroy existing data.

Do NOT run destructive commands.

Do NOT:

```text
dropDatabase()
dropCollection()
deleteMany({})
```

against an existing database.

Schema validation without persistence is acceptable for most Phase 4 verification.

If actual persistence is tested, use clearly temporary documents and clean up only those exact temporary records.

---

# 49. No Seed Data Yet

Do NOT seed:

```text
admin users
candidate users
recruiters
roles
companies
```

during Phase 4.

Role seeding will be handled separately when we define application initialization/seed strategy.

---

# 50. No API Routes

Do NOT create:

```text
/api/users
/api/roles
/api/companies
```

No model should be exposed directly through HTTP.

Routes come only after:

```text
Model
↓
Repository
↓
Service
↓
Controller
↓
Route
```

is implemented.

---

# 51. No Controllers

Do NOT create:

```text
UserController
RoleController
CompanyController
```

yet.

---

# 52. No Services

Do NOT create:

```text
UserService
RoleService
CompanyService
```

yet.

---

# 53. No Repositories

Do NOT create:

```text
BaseRepository
UserRepository
RoleRepository
CompanyRepository
```

yet.

Phase 4 must not bypass the implementation order.

---

# 54. No Authentication

Even though `User` now contains:

```text
email
passwordHash
role
```

do NOT implement authentication yet.

No:

```text
register
login
JWT
refresh tokens
bcrypt hashing
password comparison
auth middleware
RBAC
```

Those come later after repositories are available.

---

# 55. No Dependent Models

Do NOT implement:

```text
Profile.model.ts
Resume.model.ts
Competency.model.ts
CareerPlan.model.ts
CompanyMember.model.ts
Job.model.ts
Application.model.ts
```

during this phase.

---

# 56. Expected Structure

At completion:

```text
server/
└── src/
    ├── models/
    │   ├── User.model.ts
    │   ├── Role.model.ts
    │   └── Company.model.ts
    │
    ├── constants/
    ├── config/
    ├── lib/
    ├── middleware/
    ├── routes/
    ├── types/
    ├── utils/
    ├── validators/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── dto/
    │
    └── server.ts
```

Do not reorganize unrelated folders.

---

# 57. Optional Model Barrel Export

You MAY create:

```text
src/models/index.ts
```

containing only exports:

```text
UserModel
RoleModel
CompanyModel
```

ONLY if it improves the project's existing import convention.

Do not create it just for abstraction.

---

# 58. TypeScript Verification

Run:

```text
npm run type-check
```

Expected:

```text
0 TypeScript errors
```

Fix all Phase 4 errors.

---

# 59. Build Verification

Run:

```text
npm run build
```

Expected:

```text
successful compilation
```

Do not leave Phase 4 with warnings/errors introduced by these models.

---

# 60. Existing Infrastructure Regression Test

Start the backend using the existing development command.

Verify:

```text
GET /api/health
```

still works.

Verify:

```text
GET /api/health/ready
```

still works when MongoDB is connected.

Phase 4 must not break Phase 1–3.

---

# 61. Database Schema Drift Check

Before declaring completion, compare each implemented model line-by-line conceptually against:

```text
DATABASE_SCHEMA.md
```

Check:

```text
fields
types
required rules
defaults
enums
normalization
references
indexes
timestamps
collection names
```

Do NOT silently modify the approved database design.

If you find an ambiguity or contradiction in `DATABASE_SCHEMA.md`:

```text
STOP
```

and report it rather than inventing a schema decision.

---

# 62. Architecture Audit

Explicitly verify:

```text
User.model.ts
Role.model.ts
Company.model.ts
```

contain persistence concerns only.

There must be:

```text
NO controllers
NO services
NO repositories
NO routes
NO authentication
NO authorization
NO business workflows
NO dependent models
```

introduced by Phase 4.

---

# 63. Documentation

Create:

```text
server/doc/phase4.md
```

Document:

```text
Phase objective
Models created
Fields
Defaults
Enums
Indexes
References
Important persistence decisions
Validation performed
Architecture verification
```

Do not paste entire model source files into documentation.

---

# 64. Phase 4 Completion Report

After implementation provide:

## Packages

Confirm whether additional packages were required.

Expected:

```text
No additional packages required.
```

---

## Files Created

List every created file.

Expected approximately:

```text
src/models/User.model.ts
src/models/Role.model.ts
src/models/Company.model.ts
doc/phase4.md
```

---

## Files Modified

List any existing files modified.

Explain why.

Ideally unrelated Phase 1–3 files should not need modification.

---

## User Model

Report:

```text
fields
defaults
enums
normalization
indexes
passwordHash protection
timestamps
```

---

## Role Model

Report:

```text
fields
enum
normalization
indexes
timestamps
```

---

## Company Model

Report:

```text
fields
embedded location
enums
User reference
indexes
timestamps
```

---

## Index Verification

Show the resulting index definitions for:

```text
User
Role
Company
```

Confirm unique indexes separately.

---

## Validation Verification

Report results for:

```text
required fields
enum rejection
defaults
email normalization
slug normalization
ObjectId casting
```

---

## Build Verification

Report:

```text
npm run type-check
npm run build
```

---

## Regression Verification

Report:

```text
/api/health
/api/health/ready
MongoDB connection
```

---

## Architecture Verification

Explicitly confirm:

```text
No repositories created.

No services created.

No controllers created.

No new API routes created.

No authentication implemented.

No dependent models created.

No business logic added to models.
```

---

# 65. Stop After Phase 4

Do NOT begin Phase 5.

The next phase will follow the dependency order defined in `DATABASE_SCHEMA.md`.

Phase 5 will continue the model layer with dependent models.

Planned next models:

```text
Profile
Competency
CompanyMember
```

Then subsequent model work will cover:

```text
Resume
Job
CareerPlan
Application
```

Do NOT implement any of them during Phase 4.

STOP after Phase 4 is implemented, verified, documented, and reported.
