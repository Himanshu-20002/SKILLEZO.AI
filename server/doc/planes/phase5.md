# SKILLEZO Backend — Phase 5

## Dependent Mongoose Models — Profile, Competency, CompanyMember

Continue from the completed **Phase 1–4 backend implementation inside `/server`**.

Do NOT rebuild or reorganize previous phases.

Phase 5 continues the Mongoose persistence layer established in Phase 4.

The approved database source of truth remains:

```text
DATABASE_SCHEMA.md
```

You MUST inspect `DATABASE_SCHEMA.md` before implementing these models.

If this prompt conflicts with `DATABASE_SCHEMA.md` regarding:

* field names
* required/optional fields
* defaults
* enums
* indexes
* references
* embedded structures
* collection names
* lifecycle values

then:

```text
DATABASE_SCHEMA.md wins.
```

Do NOT invent missing database requirements.

If the schema contains a genuine ambiguity that materially affects implementation, report it rather than silently making a major schema decision.

---

# 1. Architecture Remains Locked

The application architecture is:

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

Phase 5 implements ONLY the persistence/model layer.

Do NOT create:

```text
Routes
Controllers
Services
Repositories
Authentication
Authorization
Business APIs
```

during this phase.

---

# 2. Current Model Foundation

Phase 4 already implemented:

```text
src/models/
├── User.model.ts
├── Role.model.ts
├── Company.model.ts
└── index.ts
```

These root models are now dependencies for Phase 5.

Relationship foundation:

```text
User
 ├── Profile
 └── CompanyMember

Role
 ├── Profile
 └── Competency

Company
 └── CompanyMember
```

Phase 5 implements:

```text
Profile
Competency
CompanyMember
```

Create:

```text
src/models/Profile.model.ts
src/models/Competency.model.ts
src/models/CompanyMember.model.ts
```

Update:

```text
src/models/index.ts
```

only if the existing barrel-export convention is already being used.

---

# 3. Inspect Before Implementing

Before writing code inspect:

```text
DATABASE_SCHEMA.md

server/src/models/User.model.ts
server/src/models/Role.model.ts
server/src/models/Company.model.ts
server/src/models/index.ts

server/src/constants/enums.ts
server/src/constants/index.ts

server/src/middleware/error.middleware.ts
server/src/lib/db.ts

server/package.json
server/tsconfig.json
```

Follow the TypeScript/Mongoose conventions established during Phase 4.

Do NOT introduce a second model coding style.

---

# 4. Phase 5 Goal

At completion the persistence dependency graph should become:

```text
User ────────────────┐
                     ↓
                  Profile
                     ↑
Role ─────────────────┘


Role
 ↓
Competency


User ────────────────┐
                     ↓
              CompanyMember
                     ↑
Company ─────────────┘

CompanyMember.invitedBy
          ↓
         User
```

The critical database relationships are:

```text
Profile.userId        → User
Profile.targetRoleId  → Role

Competency.roleId     → Role

CompanyMember.userId     → User
CompanyMember.companyId  → Company
CompanyMember.invitedBy  → User
```

Use MongoDB ObjectIds.

---

# 5. Global Model Rules

All three models must:

* use Mongoose
* use strict TypeScript
* use `{ timestamps: true }`
* use explicit lowercase plural collection names
* reuse centralized enums
* use `Schema.Types.ObjectId` for references
* contain persistence concerns only
* avoid business logic
* avoid service/repository imports
* avoid automatic population
* avoid unnecessary hooks

Do NOT install additional packages.

---

# 6. PROFILE MODEL

Create:

```text
src/models/Profile.model.ts
```

Purpose:

> Candidate professional identity and career information.

The User model contains account/authentication data.

The Profile model contains candidate-specific professional information.

Do NOT move candidate information into `User`.

---

# 7. Profile Top-Level Structure

Implement according to `DATABASE_SCHEMA.md`.

Expected structure:

```text
Profile
│
├── _id
├── userId
├── firstName
├── lastName
├── headline
├── summary
├── location
├── targetRoleId
├── skills[]
├── education[]
├── experience[]
├── links
├── createdAt
└── updatedAt
```

If the exact approved schema differs, follow `DATABASE_SCHEMA.md`.

---

# 8. Profile userId

Implement:

```text
userId: ObjectId
```

Reference:

```text
User
```

Conceptually:

```ts
{
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true
}
```

Required unique index:

```text
{ userId: 1 } UNIQUE
```

This enforces:

```text
User 1:1 Profile
```

One user can have at most one profile.

Do NOT store the profile ID inside the User document.

---

# 9. Profile Identity Fields

Implement the approved fields:

```text
firstName
lastName
headline
summary
location
```

Follow the exact required/optional rules in `DATABASE_SCHEMA.md`.

Use string normalization such as:

```text
trim: true
```

where appropriate.

Do NOT invent arbitrary max lengths unless specified.

Do NOT put complicated business validation inside Mongoose.

Request-level validation comes later through Zod.

---

# 10. Profile targetRoleId

Implement:

```text
targetRoleId: ObjectId
```

Reference:

```text
Role
```

This represents the candidate's current target career role.

Use:

```text
ref: "Role"
```

Do NOT validate Role existence inside the Mongoose schema.

That will later be handled by:

```text
ProfileService
      ↓
RoleRepository
```

Do NOT implement that service now.

Required index if specified by the approved schema:

```text
{ targetRoleId: 1 }
```

Follow `DATABASE_SCHEMA.md` exactly.

---

# 11. Candidate Skills — Embedded Documents

Candidate skills belong inside:

```text
Profile.skills[]
```

Do NOT create:

```text
CandidateSkill.model.ts
skills collection
candidate_skills collection
```

Candidate skill data is intentionally embedded.

Structure must follow the approved schema.

Expected conceptual shape:

```text
skills: [
  {
    name,
    level,
    yearsOfExperience,
    source,
    lastUsedAt
  }
]
```

Use the exact approved fields and types from `DATABASE_SCHEMA.md`.

Do not invent additional fields.

---

# 12. Skill Source

Reuse centralized:

```text
SkillSource
```

Allowed values:

```text
profile
resume
assessment
admin
```

Do NOT duplicate this enum inside the model.

If the schema defines a default source, use it.

Otherwise do not invent one.

---

# 13. Skill Embedded `_id`

Determine from `DATABASE_SCHEMA.md` whether candidate skill entries require independent MongoDB subdocument IDs.

If the schema does not use skill subdocument IDs as stable identifiers, prefer:

```text
_id: false
```

for the embedded skill schema.

Do NOT create meaningless ObjectIds for value objects unless they are useful.

However, follow the approved schema if it explicitly requires embedded IDs.

---

# 14. Skill Persistence Validation

Mongoose may enforce structural constraints defined by the schema, such as:

```text
required
enum
number type
min/max
```

only where defined by `DATABASE_SCHEMA.md`.

Do NOT implement:

```text
skill matching
duplicate skill merging
skill normalization engine
AI skill inference
competency comparison
career gap calculation
```

inside the model.

---

# 15. Education — Embedded Documents

Candidate education belongs inside:

```text
Profile.education[]
```

Do NOT create an Education collection.

Follow the approved structure exactly.

Expected conceptual structure may include fields such as:

```text
institution
degree
fieldOfStudy
startDate
endDate
currentlyStudying
description
```

BUT do not blindly use this example.

Inspect `DATABASE_SCHEMA.md` and implement the exact approved fields.

---

# 16. Education Rules

Persistence layer may enforce:

```text
field types
required fields
date types
boolean defaults
```

where specified.

Do NOT implement cross-field business rules such as:

```text
endDate must be after startDate
currentlyStudying means endDate must be null
```

unless the approved schema explicitly requires model-level validation.

These rules are better enforced later by Zod/service logic.

---

# 17. Experience — Embedded Documents

Candidate experience belongs inside:

```text
Profile.experience[]
```

Do NOT create:

```text
Experience.model.ts
experiences collection
employment_history collection
```

Follow the approved structure exactly.

Expected conceptual fields may include:

```text
company
title
employmentType
location
startDate
endDate
currentlyWorking
description
```

Again:

```text
DATABASE_SCHEMA.md wins.
```

---

# 18. Employment Type

Reuse centralized:

```text
EmploymentType
```

Candidate experience supports:

```text
full_time
part_time
internship
contract
freelance
self_employed
```

Do NOT use `JobEmploymentType` for candidate work history.

`JobEmploymentType` is reserved for job postings.

---

# 19. Experience Embedded IDs

Follow the same principle as education/skills.

If embedded records are treated purely as profile value objects and the schema doesn't require stable IDs:

```text
_id: false
```

may be used.

If `DATABASE_SCHEMA.md` expects embedded IDs, retain them.

Do not make this decision inconsistently across subdocuments without reason.

---

# 20. Profile Links

Implement the approved embedded links structure.

Expected conceptually:

```text
links
├── linkedin
├── github
├── portfolio
└── other
```

But follow `DATABASE_SCHEMA.md` exactly.

Do NOT create a separate links collection.

If links use a dedicated sub-schema and do not require their own ID:

```text
_id: false
```

should be used.

Do not perform network validation.

The model stores URLs/strings only.

---

# 21. Profile Indexes

Implement only indexes defined by the approved schema.

At minimum verify the important relationship constraint:

```text
{ userId: 1 } UNIQUE
```

Also inspect whether the schema requires:

```text
{ targetRoleId: 1 }
```

or other indexes.

Do NOT add speculative indexes on:

```text
skills.name
education.institution
experience.company
```

unless explicitly defined.

---

# 22. Profile Model Must NOT Contain

Do NOT implement:

```text
profile completeness calculation
candidate readiness score
skill gap calculation
resume synchronization
role recommendation
AI extraction
profile search ranking
authorization
```

The model stores candidate data only.

---

# 23. COMPETENCY MODEL

Create:

```text
src/models/Competency.model.ts
```

Purpose:

> Defines the skills required for a standardized Role.

Conceptual relationship:

```text
Role
 ↓ 1:N
Competency
```

This model defines role requirements.

It does NOT represent candidate skills.

Candidate skills remain embedded in:

```text
Profile.skills[]
```

---

# 24. Competency Structure

Implement exactly according to `DATABASE_SCHEMA.md`.

Expected structure:

```text
Competency
│
├── _id
├── roleId
├── skillName
├── requiredLevel
├── importance
├── description
├── createdAt
└── updatedAt
```

If the approved schema contains additional/different fields, follow it exactly.

---

# 25. Competency roleId

Implement:

```text
roleId: ObjectId
```

Reference:

```text
Role
```

Required:

```text
true
```

Use:

```text
ref: "Role"
```

Do NOT validate Role existence through asynchronous schema validators.

---

# 26. Competency skillName

Use the exact type/normalization defined by the approved schema.

Generally:

```text
String
required
trim
```

Do NOT create a global Skill collection.

The current database design intentionally does not require one.

---

# 27. Competency requiredLevel

Follow the exact database type and constraints from `DATABASE_SCHEMA.md`.

If it is numeric:

* use Number
* apply defined min/max only if the schema specifies them

Do NOT invent proficiency scales.

The approved schema is authoritative.

---

# 28. Competency Importance

Reuse:

```text
CompetencyImportance
```

Allowed values:

```text
low
medium
high
critical
```

Do not duplicate the enum values.

Use defaults only if explicitly defined.

---

# 29. Competency Description

Follow `DATABASE_SCHEMA.md` regarding:

```text
required
optional
default
trim
```

Do not invent requirements.

---

# 30. Competency Composite Uniqueness

The same skill must not be defined twice for the same role.

Implement the approved compound unique index:

```text
{
  roleId: 1,
  skillName: 1
}
UNIQUE
```

This represents:

```text
one competency definition
per skill
per role
```

Example:

```text
Frontend Developer + React
```

must not appear twice.

But:

```text
Frontend Developer + React
Backend Developer + React
```

is valid because the Role differs.

---

# 31. Competency Indexes

Implement exactly the indexes defined by `DATABASE_SCHEMA.md`.

At minimum verify:

```text
{ roleId: 1, skillName: 1 } UNIQUE
```

If a separate:

```text
{ roleId: 1 }
```

index is defined by the schema, implement it.

Do NOT assume the compound index automatically satisfies every future query requirement without checking the approved index plan.

---

# 32. Competency Model Must NOT Contain

Do NOT implement:

```text
candidate matching
readiness calculation
gap calculation
recommendation engine
role scoring
AI skill normalization
```

Those are Service-layer concerns later.

---

# 33. COMPANY MEMBER MODEL

Create:

```text
src/models/CompanyMember.model.ts
```

This model is extremely important.

Purpose:

> Membership and authorization relationship between platform Users and Companies.

Relationship:

```text
User
  ↓
CompanyMember
  ↓
Company
```

This creates:

```text
User N:M Company
```

A User may belong to multiple Companies.

A Company may contain multiple Users.

---

# 34. Why CompanyMember Exists

Do NOT simplify this relationship.

Forbidden designs:

```text
User.companyId
Company.recruiterIds[]
Company.members[]
```

The relationship must remain normalized through:

```text
company_members
```

This is the authorization boundary for future recruiter/company features.

---

# 35. CompanyMember Structure

Implement exactly according to `DATABASE_SCHEMA.md`.

Expected structure:

```text
CompanyMember
│
├── _id
├── companyId
├── userId
├── role
├── status
├── invitedBy
├── joinedAt
├── createdAt
└── updatedAt
```

If `DATABASE_SCHEMA.md` differs, follow it.

---

# 36. CompanyMember companyId

Implement:

```text
companyId: ObjectId
```

Reference:

```text
Company
```

Required:

```text
true
```

Do NOT embed Company data.

---

# 37. CompanyMember userId

Implement:

```text
userId: ObjectId
```

Reference:

```text
User
```

Required:

```text
true
```

Do NOT embed User data.

---

# 38. Company Member Role

Reuse:

```text
CompanyMemberRole
```

Allowed:

```text
owner
admin
recruiter
viewer
```

Do NOT confuse this with:

```text
UserRole
```

These represent different authorization scopes.

Example:

```text
User.role = recruiter
```

is a platform-level role.

Whereas:

```text
CompanyMember.role = admin
```

is the user's role inside a particular company.

Keep these concepts separate.

---

# 39. Company Member Status

Reuse:

```text
CompanyMemberStatus
```

Allowed:

```text
invited
active
suspended
removed
```

Use the approved default if one exists.

Do NOT invent lifecycle transitions inside the model.

---

# 40. invitedBy

Implement according to the approved schema:

```text
invitedBy: ObjectId
```

Reference:

```text
User
```

Follow required/optional/nullability rules exactly.

Do NOT check:

```text
invitedBy user belongs to company
invitedBy user has admin role
invitedBy user has permission
```

inside Mongoose.

Those are future Service-layer authorization rules.

---

# 41. joinedAt

Follow `DATABASE_SCHEMA.md` exactly.

Potential representation:

```text
Date | null
```

if membership may initially be:

```text
invited
```

and not yet joined.

Do NOT automatically set `joinedAt` based on status using hooks.

Future membership services will control lifecycle transitions.

---

# 42. CompanyMember Unique Constraint

A user must not have duplicate memberships for the same company.

Implement:

```text
{
  userId: 1,
  companyId: 1
}
UNIQUE
```

This allows:

```text
User A → Company X
User A → Company Y
```

but prevents:

```text
User A → Company X
User A → Company X
```

from existing twice.

---

# 43. CompanyMember Indexes

Implement exactly the approved index plan.

Verify whether the schema requires:

```text
{ userId: 1, companyId: 1 } UNIQUE

{ companyId: 1, status: 1 }

{ userId: 1, status: 1 }
```

or other combinations.

Do NOT invent indexes.

Follow `DATABASE_SCHEMA.md`.

---

# 44. CompanyMember Authorization Boundary

Do NOT implement authorization yet.

But preserve the data needed for later authorization.

Future flow:

```text
Authenticated User
       ↓
CompanyService
       ↓
CompanyMemberRepository
       ↓
Find membership
       ↓
Check:
companyId
role
status
       ↓
Allow / Reject
```

The model only persists:

```text
membership
role
status
```

It does NOT decide access.

---

# 45. Reference Rules

Phase 5 references should now be:

```text
Profile.userId
      → User

Profile.targetRoleId
      → Role


Competency.roleId
      → Role


CompanyMember.companyId
      → Company

CompanyMember.userId
      → User

CompanyMember.invitedBy
      → User
```

Use:

```text
Schema.Types.ObjectId
```

with correct:

```text
ref
```

values.

Do NOT store references as strings.

---

# 46. No Foreign-Key Validators

Do NOT add async Mongoose validators that query other collections.

Bad:

```text
validate whether userId exists
validate whether roleId exists
validate whether companyId exists
```

MongoDB references are not SQL foreign keys.

Existence and authorization will be enforced through:

```text
Service
 ↓
Repository
```

later.

---

# 47. No Cascade Delete Hooks

Do NOT implement:

```text
when User deleted → delete Profile
when Role deleted → delete Competencies
when Company deleted → delete CompanyMembers
```

through Mongoose hooks.

The database specification uses soft lifecycle states for important entities.

Deletion/orphan policy will be implemented deliberately in Services later.

---

# 48. Embedded vs Referenced Boundary

Maintain the approved boundary:

```text
Profile
 ├── skills[]       ← EMBEDDED
 ├── education[]    ← EMBEDDED
 ├── experience[]   ← EMBEDDED
 └── links          ← EMBEDDED
```

while:

```text
Profile.userId
Profile.targetRoleId
Competency.roleId
CompanyMember.userId
CompanyMember.companyId
CompanyMember.invitedBy
```

are references.

Do NOT accidentally convert embedded candidate information into collections.

---

# 49. No Automatic Population

Do NOT use:

```text
autopopulate
```

Do NOT add:

```text
pre("find")
```

population hooks.

Repositories will explicitly determine when related documents are loaded.

---

# 50. No Business Hooks

Avoid:

```text
pre("save")
post("save")
pre("validate")
```

for business workflows.

Do NOT automatically:

```text
set membership joinedAt
calculate profile completeness
normalize skill intelligence
create related documents
verify company permissions
```

through Mongoose hooks.

---

# 51. Model Exports

Follow the Phase 4 naming convention.

Expected:

```text
ProfileModel
CompetencyModel
CompanyMemberModel
```

Mongoose model names:

```text
Profile
Competency
CompanyMember
```

Collection names:

```text
profiles
competencies
company_members
```

Be particularly careful with:

```text
company_members
```

Do not allow Mongoose to generate an unintended collection name.

Set it explicitly.

---

# 52. TypeScript

Use strong types for:

```text
ObjectId
embedded objects
arrays
enum fields
nullable dates
timestamps
```

Avoid:

```ts
any
```

Do not solve Mongoose typing problems using repeated unsafe casting.

Follow the TypeScript approach established in Phase 4.

---

# 53. Schema Validation Verification

Create development verification code/tests as appropriate, but do NOT leave permanent debug API routes.

At minimum verify:

```text
Profile
Competency
CompanyMember
```

using Mongoose schema validation.

---

# 54. Profile Verification

Verify:

### Valid profile

A valid profile matching required fields passes validation.

### userId

Valid ObjectId accepted.

Missing required `userId` rejected.

### targetRoleId

Valid ObjectId accepted when provided/required according to schema.

### Skills

Valid embedded skill entries accepted.

Invalid `SkillSource` rejected.

### Education

Valid approved education structure accepted.

### Experience

Valid approved experience structure accepted.

Invalid `EmploymentType` rejected.

### Links

Embedded links structure validates correctly.

### Unique index

Verify schema index definition contains:

```text
{ userId: 1 } UNIQUE
```

if required by approved schema.

---

# 55. Competency Verification

Verify:

```text
roleId
skillName
requiredLevel
importance
```

according to approved required rules.

Invalid:

```text
CompetencyImportance
```

must fail.

Verify compound unique index:

```text
{ roleId: 1, skillName: 1 }
```

with:

```text
unique: true
```

---

# 56. CompanyMember Verification

Verify:

```text
companyId
userId
role
status
invitedBy
joinedAt
```

according to approved rules.

Invalid:

```text
CompanyMemberRole
CompanyMemberStatus
```

must fail.

Verify:

```text
{ userId: 1, companyId: 1 }
```

is unique.

---

# 57. Index Verification

Programmatically inspect:

```ts
ProfileSchema.indexes()
CompetencySchema.indexes()
CompanyMemberSchema.indexes()
```

Compare the resulting indexes directly with:

```text
DATABASE_SCHEMA.md
```

Check carefully for accidental duplicate indexes.

Do NOT define the same index twice through both:

```text
index: true
```

and:

```text
schema.index(...)
```

unless technically intentional.

---

# 58. Collection Verification

Verify explicitly:

```text
Profile        → profiles
Competency     → competencies
CompanyMember  → company_members
```

No unexpected collection naming.

---

# 59. Model Regression Check

Confirm existing Phase 4 models remain unchanged unless a genuine schema bug is discovered.

Do NOT casually modify:

```text
User.model.ts
Role.model.ts
Company.model.ts
```

to accommodate Phase 5.

References should point to them without requiring architectural changes.

---

# 60. No Additional Packages

Expected:

```text
No additional packages required.
```

Do NOT install:

```text
mongoose-autopopulate
mongoose-paginate
mongoose-unique-validator
slugify
class-validator
Joi
```

Phase 5 already has everything required.

---

# 61. No Repository Layer Yet

Do NOT create:

```text
BaseRepository
ProfileRepository
CompetencyRepository
CompanyMemberRepository
```

yet.

We first finish the model dependency graph.

---

# 62. No Services Yet

Do NOT create:

```text
ProfileService
CompetencyService
CompanyService
CompanyMemberService
```

yet.

---

# 63. No Controllers Yet

Do NOT create:

```text
ProfileController
CompetencyController
CompanyMemberController
```

yet.

---

# 64. No API Routes

Do NOT create:

```text
/api/profile
/api/competencies
/api/companies/:id/members
```

yet.

---

# 65. No Authentication / Authorization

Do NOT implement:

```text
JWT middleware
RBAC
company permission checks
membership authorization
candidate authorization
```

during this phase.

`CompanyMember` stores authorization data.

It does NOT perform authorization.

---

# 66. Do NOT Implement Remaining Models

Phase 5 must NOT create:

```text
Resume.model.ts
Job.model.ts
CareerPlan.model.ts
Application.model.ts
```

These come in subsequent phases because they depend on the model foundation being built now.

---

# 67. Expected Model Structure

After Phase 5:

```text
server/
└── src/
    └── models/
        ├── User.model.ts
        ├── Role.model.ts
        ├── Company.model.ts
        │
        ├── Profile.model.ts
        ├── Competency.model.ts
        ├── CompanyMember.model.ts
        │
        └── index.ts
```

At this point:

```text
6 / 10
```

approved MVP collections/models should exist.

---

# 68. Model Dependency Graph After Phase 5

Document this:

```text
User
 ├── Profile
 ├── Company.createdBy
 └── CompanyMember
          ├── userId
          └── invitedBy

Role
 ├── Profile.targetRoleId
 └── Competency.roleId

Company
 └── CompanyMember.companyId
```

Future models will extend it.

---

# 69. TypeScript Verification

Run:

```text
npm run type-check
```

Expected:

```text
0 errors
```

Fix all Phase 5 TypeScript errors.

---

# 70. Build Verification

Run:

```text
npm run build
```

Expected:

```text
successful compilation
```

---

# 71. Existing Infrastructure Regression

Start the backend.

Verify:

```text
GET /api/health
```

still returns:

```text
200
```

Verify:

```text
GET /api/health/ready
```

still returns ready when MongoDB is connected.

Phase 5 must not break previous phases.

---

# 72. Database Schema Drift Audit

Before completion compare:

```text
Profile.model.ts
Competency.model.ts
CompanyMember.model.ts
```

against `DATABASE_SCHEMA.md`.

Audit:

```text
field names
types
required rules
defaults
enums
embedded structures
ObjectId references
indexes
unique constraints
timestamps
collection names
```

Report any discrepancy.

Do not silently change the approved schema.

---

# 73. Architecture Audit

Explicitly confirm:

```text
Models contain persistence logic only.

No models import repositories.

No models import services.

No models import controllers.

No business APIs created.

No authentication implemented.

No authorization implemented.

No business workflows implemented.
```

---

# 74. Documentation

Create:

```text
server/doc/phase5.md
```

Document:

```text
Phase objective
Models created
Embedded structures
References
Enums
Indexes
Relationship decisions
Validation performed
Architecture verification
```

Do not paste entire source files.

---

# 75. Phase 5 Completion Report

After implementation provide:

## Packages

Expected:

```text
No additional packages required.
```

## Files Created

Expected:

```text
src/models/Profile.model.ts
src/models/Competency.model.ts
src/models/CompanyMember.model.ts
doc/phase5.md
```

## Files Modified

Expected approximately:

```text
src/models/index.ts
```

Explain any additional modifications.

## Profile Model

Report:

```text
top-level fields
embedded skills
embedded education
embedded experience
embedded links
User reference
Role reference
indexes
timestamps
```

## Competency Model

Report:

```text
fields
Role reference
importance enum
compound unique index
timestamps
```

## CompanyMember Model

Report:

```text
fields
User references
Company reference
membership role
membership status
joinedAt
indexes
timestamps
```

## Relationships

Show:

```text
Profile.userId → User
Profile.targetRoleId → Role

Competency.roleId → Role

CompanyMember.userId → User
CompanyMember.companyId → Company
CompanyMember.invitedBy → User
```

## Index Verification

Show actual Mongoose index definitions for all three models.

## Validation Results

Report:

```text
required field validation
ObjectId validation/casting
enum rejection
embedded document validation
defaults
```

## Build

Report:

```text
npm run type-check
npm run build
```

## Regression

Report:

```text
/api/health
/api/health/ready
MongoDB connection
```

## Architecture Compliance

Explicitly confirm:

```text
No repositories created.
No services created.
No controllers created.
No business routes created.
No authentication implemented.
No authorization implemented.
No remaining models implemented.
```

---

# 76. Stop After Phase 5

Do NOT begin the next phase.

After Phase 5, the model status should be:

```text
User            ✅
Role            ✅
Company         ✅
Profile         ✅
Competency      ✅
CompanyMember   ✅

Resume          ⏳
Job             ⏳
CareerPlan      ⏳
Application     ⏳
```

The next phase will continue the persistence layer with:

```text
PHASE 6 — Resume + Job Models
```

Do NOT create them now.

STOP after Phase 5 is implemented, verified, documented, and reported.
