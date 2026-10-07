# SKILLEZO Backend — Phase 7

## Final Mongoose Models — CareerPlan + Application

Continue from the completed **Phase 1–6 backend implementation inside `/server`**.

Do NOT rebuild, reorganize, or replace previous phases.

Phase 7 is the **final phase of the planned Mongoose persistence/model layer**.

Implement ONLY:

```text
CareerPlan
Application
```

After successful completion:

```text
10 / 10 planned Mongoose models complete
```

The approved database source of truth remains:

```text
DATABASE_SCHEMA.md
```

You MUST inspect `DATABASE_SCHEMA.md` before implementation.

If this prompt conflicts with `DATABASE_SCHEMA.md` regarding:

```text
field names
types
required/optional rules
defaults
enums
references
embedded structures
indexes
unique constraints
collection names
lifecycle values
```

then:

```text
DATABASE_SCHEMA.md wins.
```

Do NOT silently invent missing schema requirements.

If a genuine ambiguity exists that materially changes the database structure, report it before making a major schema decision.

---

# 1. Current Backend Progress

Completed:

```text
PHASE 1 ✅
Express + TypeScript Foundation

PHASE 2 ✅
MongoDB Infrastructure

PHASE 3 ✅
Shared Infrastructure
├── Errors
├── Validation
├── Enums
└── API Response Contracts

PHASE 4 ✅
Root Models
├── User
├── Role
└── Company

PHASE 5 ✅
Dependent Models
├── Profile
├── Competency
└── CompanyMember

PHASE 6 ✅
Resume + Job
├── Resume
└── Job
```

Current model layer:

```text
src/models/
├── User.model.ts
├── Role.model.ts
├── Company.model.ts
├── Profile.model.ts
├── Competency.model.ts
├── CompanyMember.model.ts
├── Resume.model.ts
├── Job.model.ts
└── index.ts
```

Phase 7 adds:

```text
CareerPlan.model.ts
Application.model.ts
```

---

# 2. Architecture Remains Locked

The backend architecture remains:

```text
Next.js Frontend
       ↓
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

Phase 7 works ONLY inside:

```text
Mongoose Model / Persistence Layer
```

Do NOT implement:

```text
repositories
services
controllers
routes
authentication
authorization
AI analysis
skill-gap algorithms
career recommendation logic
job application APIs
notifications
background workers
```

---

# 3. Inspect Before Implementation

Before writing code inspect:

```text
DATABASE_SCHEMA.md

src/models/User.model.ts
src/models/Role.model.ts
src/models/Company.model.ts
src/models/Profile.model.ts
src/models/Competency.model.ts
src/models/CompanyMember.model.ts
src/models/Resume.model.ts
src/models/Job.model.ts
src/models/index.ts

src/constants/enums.ts
src/constants/index.ts

package.json
tsconfig.json
```

Follow the same Mongoose and TypeScript conventions already established.

Do NOT introduce another modeling style.

---

# 4. Phase 7 Files

Create:

```text
server/src/models/CareerPlan.model.ts
server/src/models/Application.model.ts
server/doc/phase7.md
```

Modify:

```text
server/src/models/index.ts
```

to export:

```text
CareerPlanModel
ApplicationModel
```

along with the existing eight models.

---

# 5. Global Model Rules

Both models must:

```text
use Mongoose
use strict TypeScript
use timestamps: true
use centralized enums
use Schema.Types.ObjectId for references
use explicit collection names
use typed embedded schemas
contain persistence concerns only
avoid automatic populate
avoid async foreign-key validators
avoid business hooks
avoid repository/service imports
```

Expected:

```text
No additional packages required.
```

---

# PART A — CAREER PLAN MODEL

# 6. CareerPlan Purpose

Create:

```text
src/models/CareerPlan.model.ts
```

Purpose:

> Persist a candidate's career-plan snapshot for a target role, including the structured skill-gap analysis data defined by the approved database schema.

CareerPlan is NOT responsible for calculating the career plan.

It stores the result of future analysis.

Conceptually:

```text
Profile
   │
   ├── skills[]
   │
   └── targetRoleId
          │
          ▼
        Role
          │
          ▼
     Competencies
          │
          │ future analysis
          ▼
      CareerPlan
          │
          └── gapsData
```

---

# 7. CareerPlan Dependencies

Implement the exact references defined in `DATABASE_SCHEMA.md`.

Expected primary relationships include:

```text
CareerPlan.userId → User

CareerPlan.targetRoleId → Role
```

If the approved schema contains additional references, implement them exactly.

Do NOT invent references.

Use:

```text
Schema.Types.ObjectId
```

with correct Mongoose `ref` values.

---

# 8. Why CareerPlan References User

The career plan belongs to a candidate account.

Conceptually:

```text
User
 │
 │ userId
 ▼
CareerPlan
```

Do NOT embed CareerPlans inside:

```text
User
Profile
```

Career plans have their own lifecycle and historical value.

---

# 9. Why targetRoleId References Role

A CareerPlan should point to the standardized role being targeted.

Example:

```text
CareerPlan
targetRoleId: R100
       │
       ▼
Role
_id: R100
name: Backend Developer
```

Do NOT store only:

```text
targetRole: "Backend Developer"
```

if the approved schema uses `targetRoleId`.

The Role document remains the standardized career taxonomy.

---

# 10. CareerPlan Top-Level Structure

Implement EXACTLY according to `DATABASE_SCHEMA.md`.

Conceptually it may contain:

```text
CareerPlan
│
├── _id
├── userId
├── targetRoleId
├── gapsData
├── status
├── generatedAt / related date if defined
├── createdAt
└── updatedAt
```

This is conceptual only.

Do NOT add fields merely because they appear above.

`DATABASE_SCHEMA.md` is authoritative.

---

# 11. CareerPlan Status

Reuse centralized:

```text
CareerPlanStatus
```

Current Phase 3 enum values:

```text
active
superseded
```

Do NOT redefine the enum locally.

Conceptually:

```text
active
   ↓
superseded
```

means a newer plan may replace an older career-plan snapshot.

The model stores lifecycle state.

It does NOT perform lifecycle transitions.

---

# 12. Do NOT Auto-Supersede Plans

Do NOT implement Mongoose hooks such as:

```text
new CareerPlan created
        ↓
find previous active plan
        ↓
set previous plan = superseded
```

inside the model.

That is business logic.

Future architecture:

```text
CareerPlanService
        ↓
CareerPlanRepository
        ↓
CareerPlanModel
```

will control that workflow.

---

# 13. gapsData Is Critical

The structure of:

```text
CareerPlan.gapsData
```

was finalized because it directly affects:

```text
Mongoose typing
career analysis
recommendations
frontend rendering
future AI output
```

Implement it EXACTLY according to:

```text
DATABASE_SCHEMA.md
```

Do NOT use:

```ts
Schema.Types.Mixed
```

Do NOT use:

```ts
any
```

Do NOT use an unstructured:

```text
{}
```

if the approved schema defines explicit nested fields.

---

# 14. gapsData Concept

`gapsData` represents a persisted snapshot of the difference between a candidate's current capability and target-role requirements.

Conceptually:

```text
CareerPlan
   │
   └── gapsData
          │
          ├── structured gap items
          ├── current state
          ├── required state
          ├── priority
          └── other approved fields
```

This conceptual structure must NOT override the actual approved structure.

Read `DATABASE_SCHEMA.md`.

---

# 15. Gap Priority

If the finalized `gapsData` uses:

```text
GapPriority
```

reuse the centralized enum.

Current allowed values:

```text
low
medium
high
critical
```

Do NOT duplicate those strings manually.

Use exact default/required rules from the database specification.

---

# 16. CareerPlan Snapshot Principle

CareerPlan should behave as a historical analysis snapshot.

For example:

```text
January
Candidate skills
     ↓
CareerPlan A
status = superseded


March
Candidate improved skills
     ↓
CareerPlan B
status = active
```

Do NOT overwrite old analysis merely because a candidate profile changes.

However, do NOT implement this workflow in Phase 7.

The model only needs to support the approved lifecycle.

---

# 17. Do NOT Calculate gapsData

Forbidden inside the model:

```text
Profile.skills
      ↓
compare
      ↓
Competency
      ↓
calculate gapsData
```

Do NOT query:

```text
Profile
Competency
Role
```

from CareerPlan schema hooks.

Future Service Layer:

```text
CareerPlanService
      ↓
ProfileRepository
      ↓
CompetencyRepository
      ↓
calculate gap analysis
      ↓
CareerPlanRepository
      ↓
CareerPlanModel
```

---

# 18. CareerPlan Embedded Structures

If `gapsData` contains arrays or nested value objects, implement them as typed embedded schemas.

Use:

```text
_id: false
```

for pure value objects when consistent with the approved schema.

Do NOT create unnecessary collections such as:

```text
career_plan_gaps
skill_gaps
gap_items
```

unless `DATABASE_SCHEMA.md` explicitly requires them.

---

# 19. CareerPlan Indexes

Implement ONLY indexes specified by `DATABASE_SCHEMA.md`.

Potential query dimensions may include:

```text
userId
targetRoleId
status
createdAt
```

but do not create indexes merely because they look useful.

Programmatically inspect:

```ts
CareerPlanSchema.indexes()
```

and compare against the approved schema.

---

# 20. CareerPlan Uniqueness

Pay special attention to whether the database specification defines constraints involving:

```text
userId
targetRoleId
status
```

Do NOT assume:

```text
{ userId: 1 } UNIQUE
```

because users may need historical plans.

Do NOT accidentally prevent:

```text
CareerPlan A → superseded
CareerPlan B → active
```

from belonging to the same user.

Follow the approved index strategy exactly.

---

# 21. CareerPlan Must NOT Implement

Do NOT implement:

```text
skill-gap calculation
career scoring
career readiness percentage
AI recommendations
learning recommendations
course recommendations
profile updates
role matching
automatic superseding
notifications
```

Phase 7 only stores the career-plan structure.

---

# PART B — APPLICATION MODEL

# 22. Application Purpose

Create:

```text
src/models/Application.model.ts
```

Purpose:

> Represent the relationship between a candidate and a Job they applied to.

This is one of the most important connecting models in SKILLEZO.

Before Application, the architecture has two major sides:

```text
CANDIDATE SIDE

User
├── Profile
├── Resume
└── CareerPlan


RECRUITER SIDE

User
   ↓
CompanyMember
   ↓
Company
   ↓
Job
```

Application connects them:

```text
Candidate User
      │
      ▼
 Application
      │
      ▼
     Job
      │
      ▼
   Company
```

---

# 23. Application Dependencies

Implement references exactly according to `DATABASE_SCHEMA.md`.

Expected core references:

```text
Application.userId → User

Application.jobId → Job
```

If the approved schema contains:

```text
resumeId → Resume
```

implement it exactly.

Do NOT add `resumeId` just because it seems useful if it is not in the approved schema.

Similarly, do NOT invent:

```text
companyId
roleId
profileId
```

inside Application unless the approved schema intentionally stores them.

Avoid redundant references.

---

# 24. Candidate Relationship

Conceptually:

```text
User
 │
 │ userId
 ▼
Application
```

One candidate may have many applications:

```text
User 1:N Application
```

Example:

```text
Candidate A
├── Application → Job 1
├── Application → Job 2
└── Application → Job 3
```

---

# 25. Job Relationship

Conceptually:

```text
Job
 │
 │ jobId
 ▼
Application
```

One job may receive many applications:

```text
Job 1:N Application
```

Example:

```text
Job X
├── Candidate A application
├── Candidate B application
└── Candidate C application
```

Together:

```text
User N:M Job
```

implemented through:

```text
Application
```

This is the same normalization principle used earlier with:

```text
User N:M Company
       ↓
CompanyMember
```

---

# 26. Application as a Bridge Collection

Conceptually:

```text
User
  │
  │ userId
  ▼
Application
  │
  │ jobId
  ▼
Job
```

Therefore:

```text
Application
```

is the relationship document between:

```text
Candidate
and
Job
```

Do NOT store:

```text
User.appliedJobIds[]
```

Do NOT store:

```text
Job.applicantIds[]
```

unless the approved schema explicitly requires denormalized data.

---

# 27. Application Top-Level Structure

Implement EXACTLY according to `DATABASE_SCHEMA.md`.

Conceptually:

```text
Application
│
├── _id
├── userId
├── jobId
├── resumeId (only if approved)
├── status
├── statusHistory / related structure if approved
├── appliedAt / relevant timestamps if approved
├── createdAt
└── updatedAt
```

Again:

```text
DATABASE_SCHEMA.md wins.
```

---

# 28. Application Status

Reuse centralized:

```text
ApplicationStatus
```

Current enum values:

```text
applied
under_review
shortlisted
interview
offered
hired
rejected
withdrawn
```

Do NOT duplicate these values inside `Application.model.ts`.

Follow exact:

```text
default
required
index
```

rules from the approved schema.

---

# 29. Application Lifecycle

Conceptually an application might move:

```text
applied
   ↓
under_review
   ↓
shortlisted
   ↓
interview
   ↓
offered
   ↓
hired
```

Alternative outcomes:

```text
rejected
withdrawn
```

The model stores the current status.

It does NOT decide valid transitions.

---

# 30. Do NOT Implement Status Transition Logic

Do NOT add model logic like:

```text
applied → hired
```

validation.

Do NOT create hooks that automatically change status.

Do NOT prevent transitions inside Mongoose based on business workflow.

Future architecture:

```text
ApplicationService
        ↓
validate transition
        ↓
ApplicationRepository
        ↓
ApplicationModel
```

---

# 31. Duplicate Application Prevention

This constraint is critical.

A candidate generally must not create duplicate applications for the same job.

If this is the approved database rule, enforce through:

```text
{
  userId: 1,
  jobId: 1
}
UNIQUE
```

This allows:

```text
Candidate A → Job 1
Candidate A → Job 2
Candidate B → Job 1
```

but prevents:

```text
Candidate A → Job 1
Candidate A → Job 1   ❌ duplicate
```

Follow `DATABASE_SCHEMA.md` exactly.

If the approved schema defines a different uniqueness strategy, use that instead.

---

# 32. Why Database Uniqueness Matters

Later two requests could arrive almost simultaneously:

```text
Request A ──┐
            ├── apply to Job X
Request B ──┘
```

Service-level checks alone can race.

A database compound unique index provides the final persistence-level guarantee.

Do NOT replace a defined unique index with only application code.

---

# 33. Application Resume Snapshot Relationship

If the approved schema includes:

```text
resumeId
```

understand its purpose:

```text
Candidate applies
      ↓
Application
      ↓
resumeId
      ↓
Resume used for that application
```

This preserves which resume was associated with the application.

Do NOT automatically replace it when the candidate later uploads a newer resume.

But do NOT implement this workflow now.

---

# 34. Do NOT Copy Entire Job into Application

Do NOT duplicate:

```text
job title
company
role
requiredSkills
salary
location
```

inside Application unless explicitly defined by `DATABASE_SCHEMA.md`.

Use references where the approved schema uses references.

Avoid unnecessary denormalization.

---

# 35. Do NOT Copy Entire Profile into Application

Similarly do NOT copy:

```text
candidate skills
education
experience
profile
```

into Application unless the approved schema explicitly defines a snapshot.

Application should represent the relationship and its approved application-specific data.

---

# 36. Application Status History

If `DATABASE_SCHEMA.md` defines a structured:

```text
statusHistory[]
```

implement it exactly.

Potential conceptual structure:

```text
status
changedAt
changedBy
```

BUT do NOT add this structure unless it exists in the approved schema.

If it exists:

* type it strongly
* use centralized `ApplicationStatus`
* use ObjectId refs where defined
* avoid unnecessary `_id` for pure history values if approved

---

# 37. Do NOT Auto-Generate Status History

Even if `statusHistory` exists, do NOT automatically append entries using Mongoose hooks unless the approved architecture explicitly requires it.

Future ApplicationService should coordinate:

```text
validate transition
      ↓
update current status
      ↓
append history
      ↓
save transaction/update
```

Model hooks should not hide this business behavior.

---

# 38. Application Indexes

Implement ONLY indexes defined in `DATABASE_SCHEMA.md`.

Potential important query patterns may involve:

```text
userId
jobId
status
createdAt
```

Possible compound indexes may include:

```text
{ userId: 1, jobId: 1 } UNIQUE

{ jobId: 1, status: 1 }

{ userId: 1, status: 1 }
```

But:

```text
DO NOT GUESS.
```

Use the approved index plan.

Programmatically verify:

```ts
ApplicationSchema.indexes()
```

---

# 39. Application Authorization Is NOT Model Logic

Do NOT check:

```text
Is user a candidate?
Is job active?
Does job exist?
Is company verified?
Can recruiter change this application?
Does recruiter belong to this company?
```

inside the Mongoose schema.

Those belong to future services.

Example future candidate flow:

```text
Authenticated User
      ↓
ApplicationService
      ↓
Check candidate
      ↓
JobRepository
      ↓
Check Job
      ↓
ApplicationRepository
      ↓
Create Application
```

Recruiter status-update flow:

```text
Authenticated Recruiter
      ↓
ApplicationService
      ↓
JobRepository
      ↓
CompanyMemberRepository
      ↓
Verify recruiter access
      ↓
ApplicationRepository
      ↓
Update status
```

---

# 40. No Cross-Collection Validators

Do NOT add async validators that query:

```text
User
Role
Job
Resume
Company
Profile
```

from the Application or CareerPlan schemas.

MongoDB references are not SQL foreign keys.

Cross-collection business integrity belongs in Services/Repositories.

---

# 41. No Automatic Population

Do NOT implement:

```text
autopopulate
pre("find")
post("find")
```

to automatically populate references.

Repositories will later control population/projections.

---

# 42. No Cascade Delete Hooks

Do NOT implement:

```text
User deleted → CareerPlans deleted
User deleted → Applications deleted
Job deleted → Applications deleted
Role deleted → CareerPlans deleted
```

through Mongoose hooks.

Lifecycle/deletion behavior must be deliberate and belong to future Services.

---

# 43. No Business Hooks

Avoid:

```text
pre("save")
post("save")
pre("validate")
```

for:

```text
gap calculation
career-plan generation
automatic superseding
application status transitions
notifications
application counters
job applicant counters
```

Keep models predictable.

---

# 44. TypeScript Requirements

Strongly type:

```text
ObjectIds
enums
gapsData
nested gap structures
Application fields
status structures
nullable dates
timestamps
embedded arrays
```

Avoid:

```ts
any
```

especially for:

```text
CareerPlan.gapsData
```

Do not solve Mongoose typing problems through broad unsafe casting.

Follow the patterns established by Phase 4–6.

---

# 45. Explicit Collection Names

Use the approved collection names.

Expected:

```text
CareerPlan → career_plans

Application → applications
```

Verify against `DATABASE_SCHEMA.md`.

Do not rely on Mongoose pluralization if it could change the database contract.

---

# 46. Model Naming

Follow existing conventions.

Expected exports:

```text
CareerPlanModel
ApplicationModel
```

Mongoose model names:

```text
CareerPlan
Application
```

---

# 47. Barrel Export

Update:

```text
src/models/index.ts
```

to export all ten active models:

```text
UserModel
RoleModel
CompanyModel
ProfileModel
CompetencyModel
CompanyMemberModel
ResumeModel
JobModel
CareerPlanModel
ApplicationModel
```

Do not change the existing barrel-export architecture.

---

# 48. CareerPlan Validation Verification

Test Mongoose validation for:

```text
valid userId
valid targetRoleId
valid status
valid gapsData
valid nested GapPriority
required fields
defaults
nullable/optional fields
```

Verify invalid enum values fail.

Verify malformed structured gap data fails where required by the approved schema.

---

# 49. Application Validation Verification

Test:

```text
valid userId
valid jobId
valid resumeId if present
valid ApplicationStatus
required fields
defaults
optional fields
embedded structures if defined
```

Verify invalid:

```text
ApplicationStatus
ObjectId
nested enum values
```

fail where appropriate.

---

# 50. Index Verification

Programmatically inspect:

```ts
CareerPlanSchema.indexes()
ApplicationSchema.indexes()
```

Compare them line-by-line with `DATABASE_SCHEMA.md`.

Specifically verify:

```text
unique indexes
compound indexes
status indexes
user indexes
job indexes
role indexes
```

Do not define the same index twice using both:

```text
index: true
```

and:

```text
schema.index(...)
```

unless intentionally required.

---

# 51. Collection Verification

Verify:

```text
CareerPlan → career_plans

Application → applications
```

No unexpected Mongoose-generated collection names.

---

# 52. Regression Audit of Existing 8 Models

Do NOT modify:

```text
User.model.ts
Role.model.ts
Company.model.ts
Profile.model.ts
Competency.model.ts
CompanyMember.model.ts
Resume.model.ts
Job.model.ts
```

unless a genuine conflict with `DATABASE_SCHEMA.md` is discovered.

If one is discovered:

```text
STOP
↓
document discrepancy
↓
explain root cause
↓
make smallest correction
↓
record correction in phase7.md
```

Do not casually refactor previous phases.

---

# 53. No Additional Packages

Expected:

```text
No additional packages required.
```

Do NOT install libraries for:

```text
AI
queues
Redis
authentication
notifications
validation
pagination
transactions
resume parsing
```

Phase 7 requires only the existing stack.

---

# 54. Type Check

Run:

```text
npm run type-check
```

Expected:

```text
0 errors
```

Fix all Phase 7 TypeScript issues.

---

# 55. Build

Run:

```text
npm run build
```

Expected:

```text
successful compilation
```

---

# 56. Existing Infrastructure Regression

Start the backend.

Verify:

```text
GET /api/health
```

returns successfully.

Verify:

```text
GET /api/health/ready
```

reports readiness when MongoDB is connected.

Phase 7 must not break previous infrastructure.

---

# 57. Full Relationship Graph After Phase 7

Document the final 10-model relationship graph.

At minimum show:

```text
User
├── Profile.userId
├── Resume.userId
├── CareerPlan.userId
├── Company.createdBy
├── CompanyMember.userId
├── CompanyMember.invitedBy
├── Job.createdBy
└── Application.userId

Role
├── Profile.targetRoleId
├── Competency.roleId
├── Job.roleId
└── CareerPlan.targetRoleId

Company
├── CompanyMember.companyId
└── Job.companyId

Resume
└── Application.resumeId
    ONLY if defined by DATABASE_SCHEMA.md

Job
└── Application.jobId
```

---

# 58. Candidate-Side Final Graph

Document:

```text
                 User
              /    |    \
             /     |     \
            v      v      v
        Profile  Resume  CareerPlan
           |               |
           |               |
           +-----> Role <---+
                    |
                    v
               Competency


User
 |
 v
Application
 |
 v
Job
```

This now gives the candidate side persistence for:

```text
account
professional profile
resume snapshots
target role
role competencies
career plans
job applications
```

---

# 59. Recruiter-Side Final Graph

Document:

```text
User
 |
 v
CompanyMember
 |
 v
Company
 |
 v
Job
 |
 v
Application
 |
 v
Candidate User
```

This gives the persistence foundation for future recruiter workflows:

```text
company membership
job posting
applicant tracking
application status management
```

No workflows are implemented yet.

---

# 60. End-to-End Conceptual Data Flow

Document the future system flow without implementing it:

```text
Candidate
   ↓
User
   ↓
Profile
   ↓
Target Role
   ↓
Competencies
   ↓
CareerPlan
```

Resume path:

```text
Candidate
   ↓
Resume
   ↓
extractedData
   ↓
future Profile synchronization
```

Recruitment path:

```text
Recruiter User
   ↓
CompanyMember
   ↓
Company
   ↓
Job
   ↓
Application
   ↓
Candidate User
```

---

# 61. Application Bridge Explanation

Explicitly document that:

```text
CompanyMember
```

is the bridge for:

```text
User N:M Company
```

while:

```text
Application
```

is the bridge for:

```text
User N:M Job
```

Conceptually:

```text
User
  ↓
CompanyMember
  ↓
Company
```

and:

```text
User
  ↓
Application
  ↓
Job
```

This is an important architectural pattern.

---

# 62. Embedded vs Referenced Audit

Document the final boundary.

Examples of referenced root/domain documents:

```text
User
Role
Company
Resume
Job
```

Examples of embedded/value structures:

```text
Profile.skills[]
Profile.education[]
Profile.experience[]
Profile.links

Resume.extractedData.*

Job.location
Job.salary
Job.requiredSkills[]

CareerPlan.gapsData.*
```

Use the exact final structures from the database schema.

Explain why value objects remain embedded while independently meaningful/lifecycle entities are collections.

---

# 63. Phase 7 Schema Drift Audit

Before completion compare:

```text
CareerPlan.model.ts
Application.model.ts
```

against `DATABASE_SCHEMA.md`.

Audit:

```text
fields
types
required rules
defaults
enums
references
embedded structures
indexes
unique constraints
timestamps
collection names
```

Report any discrepancy.

Do not claim:

```text
Zero Schema Drift
```

unless the implementation was actually compared against the source document.

---

# 64. Architecture Compliance Audit

Explicitly confirm:

```text
Models contain persistence definitions only.

No repositories created.

No services created.

No controllers created.

No business routes created.

No authentication implemented.

No authorization implemented.

No AI analysis implemented.

No gap calculation implemented.

No application workflow implemented.

No notification system implemented.
```

---

# 65. Documentation

Create:

```text
server/doc/phase7.md
```

Document:

```text
Phase objective

CareerPlan model
CareerPlan references
CareerPlan lifecycle
gapsData structure
CareerPlan indexes

Application model
Application references
Application lifecycle
Application uniqueness
Application indexes

Relationship graph
Candidate-side graph
Recruiter-side graph
Embedded vs referenced structures

Validation results
Index verification
Collection verification
Architecture compliance
```

Do NOT paste entire source files.

---

# 66. Phase 7 Completion Report

After implementation provide a detailed walkthrough.

## Packages

Expected:

```text
No additional packages required.
```

## Files Created

Expected:

```text
src/models/CareerPlan.model.ts
src/models/Application.model.ts
doc/phase7.md
```

## Files Modified

Expected:

```text
src/models/index.ts
```

Explain any additional modifications.

---

# 67. CareerPlan Completion Report

Report:

```text
collection name
top-level fields
User reference
Role reference
CareerPlanStatus
gapsData exact structure
GapPriority usage
embedded schemas
indexes
timestamps
```

Explain that:

```text
CareerPlan stores analysis
but does not calculate analysis.
```

---

# 68. Application Completion Report

Report:

```text
collection name
top-level fields
User reference
Job reference
Resume reference if defined
ApplicationStatus
embedded structures if any
compound uniqueness
indexes
timestamps
```

Explain that:

```text
Application connects Candidate User ↔ Job.
```

---

# 69. Index Completion Report

Show actual output/equivalent definitions from:

```text
CareerPlanSchema.indexes()

ApplicationSchema.indexes()
```

Do not simply report:

```text
indexes verified
```

List them.

---

# 70. Validation Completion Report

Report:

```text
required field validation
ObjectId validation/casting
enum rejection
gapsData validation
Application validation
defaults
embedded structures
```

---

# 71. Build Completion Report

Report:

```text
npm run type-check
npm run build
```

with actual results.

---

# 72. Regression Completion Report

Report:

```text
MongoDB connection
/api/health
/api/health/ready
```

and whether previous functionality remained intact.

---

# 73. Final 10-Model Status

At completion report:

```text
01. User            ✅
02. Role            ✅
03. Company         ✅
04. Profile         ✅
05. Competency      ✅
06. CompanyMember   ✅
07. Resume          ✅
08. Job             ✅
09. CareerPlan      ✅
10. Application     ✅

10 / 10 MODELS COMPLETE
```

---

# 74. IMPORTANT — Do Not Start Repository Layer

After Phase 7, STOP.

Do NOT immediately create:

```text
BaseRepository
UserRepository
ProfileRepository
JobRepository
ApplicationRepository
```

The next phase is NOT repository implementation yet.

The next step must first be:

```text
PHASE 8 — Full Database Model Audit & Freeze
```

The audit will verify all 10 models together before higher layers depend on them.

---

# 75. What Phase 8 Will Audit

Do NOT implement Phase 8 now.

But Phase 8 will verify:

```text
10 Mongoose Models
       ↓
Field Audit
       ↓
Reference Audit
       ↓
Relationship Audit
       ↓
Embedded vs Referenced Audit
       ↓
Enum Audit
       ↓
Index Audit
       ↓
Unique Constraint Audit
       ↓
Collection Name Audit
       ↓
TypeScript Audit
       ↓
DATABASE_SCHEMA.md Drift Audit
       ↓
Build + MongoDB Verification
       ↓
MODEL LAYER FROZEN
```

Only after this passes should the Repository Layer begin.

---

# 76. Final Architecture After Phase 7

The persistence architecture should conceptually be:

```text
                         SKILLEZO
                            │
             ┌──────────────┴──────────────┐
             │                             │
         CANDIDATE                     RECRUITER
             │                             │
             ▼                             ▼
           User                           User
        /    |    \                        |
       /     |     \                       v
      v      v      v                CompanyMember
 Profile  Resume  CareerPlan                |
    |               |                      v
    +-------> Role <-+                   Company
               |                           |
               v                           v
          Competency                      Job
                                           |
                                           v
                                      Application
                                           |
                                           v
                                     Candidate User
```

The database should now contain the persistence foundation required for:

```text
candidate accounts
candidate profiles
resume snapshots
role taxonomy
role competencies
career plans
companies
company membership
jobs
applications
```

No business workflows are required yet.

---

# 77. STOP CONDITION

Phase 7 is complete only when:

```text
CareerPlan model implemented
Application model implemented

gapsData strongly typed
Application relationships correct

indexes verified
collections verified
enums reused
references verified

npm run type-check passes
npm run build passes

health endpoint works
readiness endpoint works

phase7.md created

10 / 10 models complete
```

Then STOP.

Do NOT begin repositories.

The next phase is:

```text
PHASE 8
FULL DATABASE MODEL AUDIT & FREEZE
```
