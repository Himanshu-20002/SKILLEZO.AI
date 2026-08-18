# SKILLEZO Backend — Phase 6

## Resume + Job Mongoose Models

Continue from the completed **Phase 1–5 backend implementation inside `/server`**.

Do NOT rebuild, reorganize, or replace previous phases.

Phase 6 continues the Mongoose persistence/model layer by implementing:

```text
Resume
Job
```

The approved database source of truth remains:

```text
DATABASE_SCHEMA.md
```

You MUST inspect `DATABASE_SCHEMA.md` before implementation.

If this prompt conflicts with `DATABASE_SCHEMA.md` regarding:

```text
field names
field types
required/optional rules
defaults
enums
references
embedded structures
indexes
unique constraints
collection names
lifecycle states
```

then:

```text
DATABASE_SCHEMA.md wins.
```

Do NOT silently invent schema decisions.

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
└── index.ts
```

Phase 6 adds:

```text
Resume.model.ts
Job.model.ts
```

After Phase 6:

```text
8 / 10 models complete
```

Remaining afterward:

```text
CareerPlan
Application
```

---

# 2. Architecture Remains Locked

The backend architecture remains:

```text
Next.js Frontend
       ↓
Routes
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

Phase 6 works ONLY inside:

```text
Mongoose Models
```

Do NOT create:

```text
Repositories
Services
Controllers
Routes
Authentication
Authorization
AI services
Resume parsing services
Job posting workflows
```

---

# 3. Dependency Graph Before Phase 6

Current relationships:

```text
User
├── Profile
├── Company.createdBy
└── CompanyMember

Role
├── Profile.targetRoleId
└── Competency.roleId

Company
└── CompanyMember
```

Phase 6 expands this to:

```text
User
├── Profile
├── Resume              ← NEW
├── Company.createdBy
├── CompanyMember
└── Job.createdBy       ← NEW

Role
├── Profile.targetRoleId
├── Competency.roleId
└── Job.roleId          ← NEW

Company
├── CompanyMember
└── Job                 ← NEW
```

---

# 4. Inspect Before Implementing

Before changing code inspect:

```text
DATABASE_SCHEMA.md

server/src/models/User.model.ts
server/src/models/Role.model.ts
server/src/models/Company.model.ts

server/src/models/Profile.model.ts
server/src/models/Competency.model.ts
server/src/models/CompanyMember.model.ts

server/src/models/index.ts

server/src/constants/enums.ts
server/src/constants/index.ts

server/package.json
server/tsconfig.json
```

Follow the exact Mongoose and TypeScript conventions established by Phase 4 and Phase 5.

Do NOT introduce a new model style.

---

# 5. Phase 6 Files

Create:

```text
server/src/models/Resume.model.ts
server/src/models/Job.model.ts
server/doc/phase6.md
```

Modify:

```text
server/src/models/index.ts
```

to export:

```text
ResumeModel
JobModel
```

along with the existing six models.

---

# 6. Global Model Rules

Both models must:

```text
use Mongoose
use strict TypeScript
use timestamps: true
use centralized enums
use explicit collection names
use Schema.Types.ObjectId for references
contain persistence concerns only
avoid automatic populate
avoid business hooks
avoid service/repository imports
```

Do NOT install additional packages.

Expected:

```text
No additional packages required.
```

---

# PART A — RESUME MODEL

# 7. Resume Purpose

Create:

```text
src/models/Resume.model.ts
```

Purpose:

> Store uploaded resume metadata, resume-processing lifecycle state, and the structured snapshot extracted from the resume.

Important distinction:

```text
Profile
=
canonical editable candidate professional data

Resume
=
uploaded document + parsing/extraction snapshot
```

Do NOT merge these responsibilities.

---

# 8. Resume Relationship

Resume belongs to a platform User.

Relationship:

```text
User
 │
 │ userId
 ▼
Resume
```

Implement:

```text
Resume.userId → User._id
```

using:

```text
Schema.Types.ObjectId
ref: "User"
```

Follow `DATABASE_SCHEMA.md` for required/index rules.

Do NOT store resume IDs inside `User`.

---

# 9. Resume Cardinality

Do NOT assume:

```text
User 1:1 Resume
```

unless `DATABASE_SCHEMA.md` explicitly says so.

A resume collection commonly needs to preserve multiple uploads/versions.

Therefore inspect the approved schema carefully before creating any unique index on:

```text
userId
```

Do NOT add:

```text
{ userId: 1 } UNIQUE
```

unless it is explicitly required.

---

# 10. Resume Top-Level Structure

Implement the exact fields from `DATABASE_SCHEMA.md`.

The expected conceptual structure is:

```text
Resume
│
├── _id
├── userId
├── fileName
├── fileUrl
├── fileType
├── fileSize
├── status
├── extractedData
├── errorMessage / parsing error field if defined
├── parsedAt / processing timestamps if defined
├── createdAt
└── updatedAt
```

This is conceptual only.

The exact approved schema is authoritative.

Do NOT add a field merely because it appears in this conceptual example.

---

# 11. Resume File Metadata

For resume metadata fields defined by the approved schema, use the exact types and required rules.

Examples may include:

```text
fileName
fileUrl
fileType
fileSize
```

Do NOT implement:

```text
Multer
S3
Cloudinary
file uploads
PDF parsing
DOCX parsing
file downloads
virus scanning
```

during Phase 6.

The Resume model stores metadata only.

---

# 12. Resume Status

Reuse centralized:

```text
ResumeStatus
```

Allowed values currently established in Phase 3:

```text
uploaded
processing
parsed
failed
```

Do NOT duplicate these values manually.

Follow `DATABASE_SCHEMA.md` for:

```text
required
default
index
```

rules.

Conceptual lifecycle:

```text
uploaded
   ↓
processing
   ↓
parsed

or

processing
   ↓
failed
```

The model stores the status.

It does NOT control lifecycle transitions.

---

# 13. No Resume Lifecycle Hooks

Do NOT implement:

```text
pre("save")
post("save")
```

to automatically change:

```text
uploaded → processing
processing → parsed
processing → failed
```

Future resume-processing services/workers will manage those transitions.

---

# 14. extractedData Is Important

Implement the `extractedData` structure exactly as finalized in:

```text
DATABASE_SCHEMA.md
```

Do NOT use:

```ts
extractedData: Schema.Types.Mixed
```

if the database schema defines an explicit structure.

Do NOT reduce it to:

```text
{}
unknown object
any
```

when the structure has already been finalized.

The purpose of finalizing `extractedData` earlier was specifically to prevent an unstructured Mongoose model.

---

# 15. extractedData Concept

`extractedData` represents what was extracted from a particular resume upload.

Conceptually:

```text
Resume
   |
   +-- extractedData
          |
          +-- candidate information
          +-- skills
          +-- education
          +-- experience
          +-- other approved extracted fields
```

Follow the exact names and nesting from `DATABASE_SCHEMA.md`.

---

# 16. Resume Snapshot vs Profile

Do NOT automatically synchronize:

```text
Resume.extractedData
        ↓
Profile
```

inside Mongoose.

The intended future architecture is:

```text
Resume Uploaded
      ↓
ResumeService
      ↓
Parsing / Extraction
      ↓
Resume.extractedData
      ↓
ProfileService
      ↓
Approved Profile Update
```

Phase 6 implements only the persistence structure required for this future workflow.

---

# 17. Resume Embedded Schemas

If `extractedData` contains nested structures such as:

```text
skills[]
education[]
experience[]
```

implement typed embedded schemas according to `DATABASE_SCHEMA.md`.

Avoid unnecessary embedded `_id` values for pure snapshot/value objects unless the approved schema requires them.

For value objects, use:

```text
_id: false
```

where appropriate and consistent with Phase 5.

---

# 18. Do Not Reuse Profile Subschemas Blindly

Even if:

```text
Profile.skills[]
```

and:

```text
Resume.extractedData.skills[]
```

look similar, do NOT automatically force them to use the same exact schema.

Why?

Because:

```text
Profile
```

is canonical candidate data.

Whereas:

```text
Resume.extractedData
```

is a parser snapshot.

Follow `DATABASE_SCHEMA.md`.

If the structures are intentionally identical, reuse is acceptable only if it creates a clean dependency and does not couple unrelated persistence behavior.

Prefer clarity over premature abstraction.

---

# 19. Resume Parsing Metadata

If the approved schema defines fields such as:

```text
parsedAt
processingStartedAt
errorMessage
parserVersion
```

implement them exactly.

If they are not in `DATABASE_SCHEMA.md`, do NOT invent them.

---

# 20. Resume Failure Information

If a parsing failure field exists, store only safe processing information.

Do NOT design the model to persist:

```text
stack traces
internal filesystem paths
API secrets
raw provider credentials
```

Error persistence must remain safe.

---

# 21. Resume Indexes

Implement ONLY indexes defined in `DATABASE_SCHEMA.md`.

Possible query patterns may involve:

```text
userId
status
createdAt
```

but do NOT add indexes merely because they seem useful.

Compare the actual approved index plan.

Programmatically verify:

```ts
ResumeSchema.indexes()
```

after implementation.

---

# 22. Resume Must NOT Implement

Do NOT implement:

```text
resume upload API
resume download API
resume parser
OpenAI extraction
LLM calls
OCR
PDF extraction
DOCX extraction
profile synchronization
resume scoring
resume ranking
skill gap analysis
career recommendations
```

Resume is a persistence model only.

---

# PART B — JOB MODEL

# 23. Job Purpose

Create:

```text
src/models/Job.model.ts
```

Purpose:

> Represent a job opportunity posted by a Company and associated with a standardized career Role.

Job connects:

```text
Company
Role
User
```

---

# 24. Job Relationships

Implement approved references:

```text
Job.companyId → Company._id

Job.roleId → Role._id

Job.createdBy → User._id
```

using:

```text
Schema.Types.ObjectId
```

with appropriate:

```text
ref
```

values.

Do NOT store related documents inline.

---

# 25. Why createdBy Is Separate from companyId

These represent different things:

```text
companyId
=
which organization owns the job

createdBy
=
which platform user created the job
```

Example:

```text
Job
├── companyId → Acme Technologies
└── createdBy → recruiter@example.com
```

Do NOT replace one with the other.

---

# 26. Company Membership Is Not Stored in Job

Do NOT add:

```text
companyMemberId
recruiterRole
recruiterStatus
```

to Job unless explicitly required by `DATABASE_SCHEMA.md`.

Future authorization should work through:

```text
Authenticated User
       ↓
CompanyMember
       ↓
Company
       ↓
Job
```

The Job model stores ownership/reference information.

`CompanyMember` determines whether the user is allowed to perform company actions.

---

# 27. Job Top-Level Structure

Implement exactly according to `DATABASE_SCHEMA.md`.

Expected conceptual structure:

```text
Job
│
├── _id
├── companyId
├── roleId
├── createdBy
├── title
├── description
├── location
├── workplaceType
├── employmentType
├── requiredSkills[]
├── experience requirements
├── compensation fields if defined
├── status
├── publishedAt
├── closesAt
├── createdAt
└── updatedAt
```

Again:

```text
DATABASE_SCHEMA.md wins.
```

Do not add fields simply because they appear in this conceptual overview.

---

# 28. Job title

Implement according to approved schema.

Normally:

```text
String
required
trim
```

Do NOT generate a slug unless the approved schema explicitly contains a Job slug.

Do not invent one.

---

# 29. Job description

Follow the exact required/optional rules.

Persistence should store the description.

Do NOT implement:

```text
HTML sanitization engine
AI job-description generation
SEO generation
```

inside the model.

---

# 30. Job companyId

Implement:

```text
companyId: ObjectId
```

Reference:

```text
Company
```

Required according to the approved schema.

This defines:

```text
Company 1:N Job
```

Conceptually:

```text
Company A
├── Job 1
├── Job 2
└── Job 3
```

---

# 31. Job roleId

Implement:

```text
roleId: ObjectId
```

Reference:

```text
Role
```

This maps a job posting to the standardized role taxonomy.

Conceptually:

```text
Role
Full Stack Developer
       ↑
       |
Job.roleId
```

This will later allow job requirements and standardized role competencies to be compared.

---

# 32. Job createdBy

Implement:

```text
createdBy: ObjectId
```

Reference:

```text
User
```

Do NOT check in the model whether:

```text
User.role == recruiter
```

Do NOT check whether the user belongs to the company.

Future Service Layer logic will do:

```text
JobService
    ↓
CompanyMemberRepository
    ↓
Verify membership
    ↓
Verify role/status
    ↓
Create Job
```

---

# 33. Workplace Type

Reuse centralized:

```text
WorkplaceType
```

Allowed:

```text
onsite
hybrid
remote
```

Do NOT duplicate the enum.

Follow approved default/required rules.

---

# 34. Job Employment Type

Reuse:

```text
JobEmploymentType
```

Allowed:

```text
full_time
part_time
internship
contract
freelance
```

Do NOT use:

```text
EmploymentType
```

for Job if that enum contains:

```text
self_employed
```

Candidate employment history and Job employment type are deliberately separate concepts.

---

# 35. Job Status

Reuse centralized:

```text
JobStatus
```

Allowed:

```text
draft
active
closed
archived
```

Follow `DATABASE_SCHEMA.md` for the default.

Do NOT automatically change statuses with Mongoose hooks.

For example, do NOT implement:

```text
closesAt reached
      ↓
automatically set closed
```

inside the model.

That belongs to a future service/scheduled process.

---

# 36. Job Required Skills

Implement:

```text
requiredSkills[]
```

exactly as defined in `DATABASE_SCHEMA.md`.

Do NOT assume it is simply:

```ts
string[]
```

if the approved schema defines structured skill requirements.

If the approved structure includes fields such as:

```text
name
requiredLevel
importance
yearsOfExperience
```

use the exact approved structure.

Do NOT invent fields.

---

# 37. Job Skills vs Competencies

Keep these concepts distinct.

```text
Competency
=
standard requirements for a Role

Job.requiredSkills
=
requirements for one specific Job
```

Example:

```text
Role: Full Stack Developer

Standard Competencies
├── React
├── Node.js
├── MongoDB
└── TypeScript
```

Specific job:

```text
Senior Full Stack Developer — Acme

requiredSkills
├── React
├── Node.js
├── TypeScript
├── AWS
└── Docker
```

A specific Job may differ from the general Role competency definition.

Do NOT force Job required skills to reference Competency documents unless `DATABASE_SCHEMA.md` explicitly says so.

---

# 38. Embedded Job Skill IDs

If `requiredSkills[]` is a value-object array and no stable subdocument IDs are required:

```text
_id: false
```

is preferred.

Follow `DATABASE_SCHEMA.md`.

---

# 39. Job Location

If the approved Job schema defines an embedded location structure:

```text
location
├── city
├── state
└── country
```

implement it as an embedded subdocument.

Do NOT create a Location collection.

Disable unnecessary embedded `_id` where appropriate.

If the Job location structure differs from Company location, follow the approved Job schema.

---

# 40. Job Experience Requirements

If `DATABASE_SCHEMA.md` defines fields such as:

```text
minExperienceYears
maxExperienceYears
```

or another structure, implement them exactly.

Do NOT invent experience fields.

Do NOT add cross-field business validation unless explicitly specified at the persistence layer.

For example:

```text
maxExperienceYears >= minExperienceYears
```

can later be handled by Zod/service validation unless the schema explicitly requires model-level enforcement.

---

# 41. Compensation

If compensation/salary fields are present in the approved schema, implement exactly:

```text
field names
types
currency representation
required rules
```

Do NOT invent salary structures if they are absent.

Do NOT implement currency conversion.

---

# 42. Job Dates

Implement only approved date fields.

Potential examples:

```text
publishedAt
closesAt
```

Follow exact nullability/default rules.

Do NOT automatically set `publishedAt` merely because:

```text
status = active
```

unless explicitly defined by the schema.

Job publishing is a future business workflow.

---

# 43. Job Indexes

Implement exactly the approved Job index plan.

Likely query dimensions may include:

```text
companyId
roleId
status
workplaceType
employmentType
location.city
createdAt
```

but do NOT add speculative indexes.

Inspect `DATABASE_SCHEMA.md`.

Programmatically verify:

```ts
JobSchema.indexes()
```

---

# 44. Job Compound Indexes

Pay particular attention to compound indexes defined by the approved schema.

If `DATABASE_SCHEMA.md` specifies indexes such as:

```text
{ companyId: 1, status: 1 }

{ roleId: 1, status: 1 }
```

implement them exactly.

Do NOT create additional compound indexes based only on guessed query patterns.

---

# 45. Job Must NOT Implement

Do NOT implement:

```text
job publishing API
job editing API
job closing API
company authorization
recruiter permissions
job search service
job recommendation
candidate matching
AI ranking
application creation
application counts
notifications
```

This phase defines the Job persistence structure only.

---

# 46. No Application Model Yet

Even though Job will eventually connect to candidates through applications:

```text
User
  ↓
Application
  ↓
Job
```

do NOT create:

```text
Application.model.ts
```

during Phase 6.

That comes in the next phase.

---

# 47. No CareerPlan Model Yet

Do NOT create:

```text
CareerPlan.model.ts
```

during this phase.

It comes with the final dependency group.

---

# 48. Complete Graph After Phase 6

After successful implementation:

```text
                         User
             ┌────────────┼───────────────┐
             │            │               │
             ▼            ▼               ▼
          Profile       Resume      CompanyMember
             │                            │
             │                            ▼
             │                         Company
             │                            │
             │                            ▼
             │                           Job
             │                         ↙     ↘
             │                   roleId     createdBy
             │                      ↓          ↓
             └───────────────────→ Role       User
                                     │
                                     ▼
                                Competency
```

More explicitly:

```text
Profile.userId             → User
Profile.targetRoleId       → Role

Resume.userId              → User

Competency.roleId          → Role

Company.createdBy          → User

CompanyMember.userId       → User
CompanyMember.companyId    → Company
CompanyMember.invitedBy    → User

Job.companyId              → Company
Job.roleId                 → Role
Job.createdBy              → User
```

---

# 49. Candidate Side After Phase 6

```text
User
├── Profile
│   ├── skills[]
│   ├── education[]
│   ├── experience[]
│   └── targetRoleId → Role
│
└── Resume
    ├── uploaded document metadata
    ├── processing status
    └── extractedData
```

The important separation is:

```text
User
=
account

Profile
=
canonical professional profile

Resume
=
document + extraction snapshot
```

Do not collapse them.

---

# 50. Recruiter Side After Phase 6

```text
User
   ↓
CompanyMember
   ↓
Company
   ↓
Job
```

Job also references:

```text
Role
User(createdBy)
```

This prepares the data model for future recruiter workflows.

---

# 51. Future Authorization Flow

Do NOT implement this now, but preserve the model structure required for:

```text
Recruiter requests job creation
          ↓
Authenticated User
          ↓
JobService
          ↓
CompanyMemberRepository
          ↓
Find:
userId + companyId
          ↓
Check:
status = active
role = owner/admin/recruiter
          ↓
JobRepository
          ↓
JobModel.create()
```

This explains why Job should not contain authorization logic.

---

# 52. Future Resume Processing Flow

Do NOT implement this now, but preserve the structure required for:

```text
Candidate uploads resume
          ↓
Resume created
status = uploaded
          ↓
Background processing
          ↓
status = processing
          ↓
Parser / extraction
          ↓
Resume.extractedData
          ↓
status = parsed
          ↓
Optional Profile update
```

Phase 6 stores the state required by that workflow.

---

# 53. No Automatic Population

Do NOT use:

```text
mongoose-autopopulate
pre("find")
automatic populate hooks
```

Future repositories decide when relationships are populated.

---

# 54. No Cascade Hooks

Do NOT implement:

```text
User deleted → Resume deleted
Company deleted → Jobs deleted
Role deleted → Jobs deleted
```

through model hooks.

Deletion/lifecycle behavior belongs in future Services.

---

# 55. No Foreign-Key Existence Validators

Do NOT perform async schema queries such as:

```text
Does userId exist?
Does companyId exist?
Does roleId exist?
```

inside Mongoose validators.

Future Services/Repositories enforce reference existence.

---

# 56. No Business Methods

Do NOT add model methods such as:

```text
resume.parse()
resume.syncProfile()

job.publish()
job.close()
job.canBeEditedBy()
job.matchCandidate()
```

Persistence models should remain predictable.

---

# 57. TypeScript Requirements

Strongly type:

```text
ObjectIds
enums
embedded structures
arrays
nullable fields
dates
timestamps
extractedData
requiredSkills
```

Avoid:

```ts
any
```

especially for:

```text
Resume.extractedData
Job.requiredSkills
```

These structures were finalized specifically to avoid untyped database blobs.

Use the same Mongoose TypeScript approach established in Phase 4/5.

---

# 58. Model Export Convention

Follow existing conventions:

```text
ResumeModel
JobModel
```

Mongoose model names:

```text
Resume
Job
```

Collections:

```text
resumes
jobs
```

Set collection names explicitly if required to guarantee the database contract.

---

# 59. Update Barrel Export

Update:

```text
src/models/index.ts
```

to export all eight models:

```text
UserModel
RoleModel
CompanyModel
ProfileModel
CompetencyModel
CompanyMemberModel
ResumeModel
JobModel
```

Do not change the barrel-export pattern unnecessarily.

---

# 60. Resume Schema Verification

Verify a valid Resume passes Mongoose validation according to `DATABASE_SCHEMA.md`.

Test:

```text
valid userId
required file metadata
valid ResumeStatus
valid extractedData structure
nullable/optional parsing fields
timestamps
```

Verify invalid:

```text
ResumeStatus
ObjectId
nested extractedData values
```

are handled according to schema rules.

---

# 61. Job Schema Verification

Verify a valid Job passes validation according to the approved schema.

Test:

```text
companyId
roleId
createdBy
title
description
requiredSkills
workplaceType
employmentType
status
location
approved optional fields
```

Verify invalid:

```text
WorkplaceType
JobEmploymentType
JobStatus
ObjectId references
nested requiredSkills
```

fail where required.

---

# 62. Index Verification

Programmatically inspect:

```ts
ResumeSchema.indexes()
JobSchema.indexes()
```

Compare each index with:

```text
DATABASE_SCHEMA.md
```

Verify:

```text
unique
non-unique
compound
nested-field indexes
```

and check for duplicate equivalent indexes.

---

# 63. Existing Model Regression Audit

Do NOT modify:

```text
User.model.ts
Role.model.ts
Company.model.ts
Profile.model.ts
Competency.model.ts
CompanyMember.model.ts
```

unless a genuine schema bug is discovered.

If modification is necessary:

1. Stop.
2. Explain the issue.
3. Explain why the previous model conflicts with `DATABASE_SCHEMA.md`.
4. Make only the smallest required correction.
5. Document it in `phase6.md`.

Do not casually refactor earlier phases.

---

# 64. No Additional Packages

Expected:

```text
No additional packages required.
```

Do NOT install:

```text
multer
pdf-parse
mammoth
OpenAI SDK
AWS SDK
Cloudinary
BullMQ
Redis
mongoose plugins
```

Those belong to future implementation phases if required.

---

# 65. Type Check

Run:

```text
npm run type-check
```

Expected:

```text
0 TypeScript errors
```

Fix all Phase 6 errors.

---

# 66. Build

Run:

```text
npm run build
```

Expected:

```text
successful compilation
```

---

# 67. Existing Backend Regression

Start the backend and verify:

```text
GET /api/health
```

still works.

Verify:

```text
GET /api/health/ready
```

still reports readiness when MongoDB is connected.

Phase 6 must not break previous phases.

---

# 68. Collection Verification

Verify:

```text
Resume → resumes

Job → jobs
```

Do not allow unexpected collection names.

---

# 69. Schema Drift Audit

Before completion compare both models against `DATABASE_SCHEMA.md`.

For Resume verify:

```text
fields
types
required rules
defaults
ResumeStatus
user reference
extractedData
embedded structures
indexes
timestamps
collection
```

For Job verify:

```text
fields
types
required rules
defaults
references
requiredSkills
WorkplaceType
JobEmploymentType
JobStatus
location
indexes
timestamps
collection
```

Report any discrepancy.

---

# 70. Architecture Audit

Explicitly verify:

```text
Resume.model.ts
Job.model.ts
```

contain persistence concerns only.

Confirm:

```text
No repositories created.

No services created.

No controllers created.

No routes created.

No authentication added.

No authorization added.

No resume parser added.

No AI extraction added.

No job business workflows added.

No Application model added.

No CareerPlan model added.
```

---

# 71. Documentation

Create:

```text
server/doc/phase6.md
```

Document:

```text
Phase objective
Resume model
Resume extractedData structure
Resume lifecycle fields
Job model
Job requiredSkills structure
References
Enums
Embedded structures
Indexes
Collection names
Validation results
Architecture decisions
Regression verification
```

Do not paste entire source files.

---

# 72. Phase 6 Completion Report

After implementation provide a detailed walkthrough.

## Packages

Expected:

```text
No additional packages required.
```

## Files Created

Expected:

```text
src/models/Resume.model.ts
src/models/Job.model.ts
doc/phase6.md
```

## Files Modified

Expected:

```text
src/models/index.ts
```

Explain any other modification.

---

# 73. Resume Report

Report:

```text
collection
top-level fields
User reference
file metadata
ResumeStatus
extractedData structure
embedded schemas
optional/null fields
indexes
timestamps
```

Explain clearly:

```text
Resume != Profile
```

and how they will eventually interact.

---

# 74. Job Report

Report:

```text
collection
top-level fields
Company reference
Role reference
createdBy User reference
requiredSkills
WorkplaceType
JobEmploymentType
JobStatus
location
other approved structures
indexes
timestamps
```

---

# 75. Relationship Report

Show:

```text
Resume.userId → User

Job.companyId → Company
Job.roleId → Role
Job.createdBy → User
```

Also show how these extend existing relationships:

```text
User
├── Profile
├── Resume
└── CompanyMember

Role
├── Profile
├── Competency
└── Job

Company
├── CompanyMember
└── Job
```

---

# 76. Validation Report

Report results for:

```text
required fields
ObjectId casting
enum rejection
nested extractedData
nested requiredSkills
defaults
normalization
```

---

# 77. Index Report

Show the actual Mongoose index definitions for:

```text
Resume
Job
```

Do not merely say "indexes verified."

List them.

---

# 78. Build Report

Report:

```text
npm run type-check
npm run build
```

with results.

---

# 79. Regression Report

Report:

```text
/api/health
/api/health/ready
MongoDB connection
```

---

# 80. Final Model Status

At completion report:

```text
User            ✅
Role            ✅
Company         ✅
Profile         ✅
Competency      ✅
CompanyMember   ✅
Resume          ✅
Job             ✅

CareerPlan      ⏳
Application     ⏳

8 / 10 models complete
```

---

# 81. Stop After Phase 6

Do NOT begin Phase 7.

The next phase will be:

```text
PHASE 7 — CareerPlan + Application
```

These will complete the planned MVP model layer.

After Phase 7:

```text
10 / 10 Mongoose models complete
```

Only then should we perform a full database/model audit and move into the Repository Layer.

STOP after Phase 6 is implemented, validated, documented, and reported.
