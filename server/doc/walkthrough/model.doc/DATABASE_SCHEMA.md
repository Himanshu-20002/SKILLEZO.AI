# SKILLEZO — Database Schema Specification

**Status:** Final — Backend Implementation Baseline
**Database:** MongoDB Atlas
**ODM:** Mongoose
**Architecture:** Controller → Service → Repository → Model
**Version:** 1.0

---

# 1. Purpose

This document is the database source of truth for the SKILLEZO MVP.

```text id="idbgcy"
ERD
 ↓
DATABASE_SCHEMA.md
 ↓
Mongoose Models
 ↓
Repositories
 ↓
Services
 ↓
Controllers
 ↓
API Routes
```

The ERD defines the original core entities and relationships.

This specification additionally finalizes implementation details required by MongoDB and the SKILLEZO product, including:

* candidate skills
* education
* work experience
* recruiter/company membership
* resume extraction structure
* career gap analysis structure
* enums
* indexes
* uniqueness constraints
* timestamps
* soft deletion
* ownership rules
* data validation

---

# 2. Final Collections

The MVP database will contain:

```text id="k2amjr"
users
profiles
resumes

roles
competencies

career_plans

companies
company_members

jobs
applications
```

Total:

```text id="coc3c9"
10 collections
```

Candidate skills, education, and experience will be embedded inside `profiles`.

They will NOT initially become independent collections.

---

# 3. Global MongoDB Conventions

## Authentication & Entity IDs

Authentication Provider: **Better Auth**

- **Authenticated User ID**: `String` (managed by Better Auth)
- **Domain Entity IDs**: `MongoDB ObjectId` (e.g. `_id` for Profile, Resume, Role, Competency, Company, CompanyMember, Job, Application, CareerPlan)

User Reference Fields (Better Auth User ID → `String`):
```ts
userId
createdBy
invitedBy
changedBy
```

Domain Entity Reference Fields (Domain Object → `ObjectId`):
```ts
companyId
roleId
jobId
resumeId
targetRoleId
sourceResumeId
```

---

## Timestamps

Every collection uses:

```ts id="1bc6lo"
{
  timestamps: true
}
```

producing:

```text id="m24pmf"
createdAt
updatedAt
```

---

## Naming

Collections:

```text id="vgb1g4"
lowercase plural
```

Fields:

```text id="k56nl5"
camelCase
```

References:

```text id="oc2j4i"
<entity>Id
```

Example:

```text id="f6ns4a"
userId
companyId
roleId
jobId
```

---

# 4. USERS

## Purpose

Authentication identity representation and account-level domain details. Better Auth owns credentials, sessions, accounts, and verification. Custom password handling is NOT managed by SKILLEZO application code.

Candidate-specific information does NOT belong here.

## Schema

```ts id="v5ynkr"
User {
  _id: String,

  email: String,

  role: String,

  emailVerified: Boolean,
  accountStatus: String,

  lastLoginAt: Date | null,

  createdAt: Date,
  updatedAt: Date
}
```

## Fields

| Field           | Type     | Required | Default   | Indexed |
| --------------- | -------- | -------: | --------- | ------: |
| `_id`           | String   |     Auto | Auto      |     Yes |
| `email`         | String   |      Yes | —         |  Unique |
| `role`          | String   |      Yes | candidate |     Yes |
| `emailVerified` | Boolean  |      Yes | false     |      No |
| `accountStatus` | String   |      Yes | active    |     Yes |
| `lastLoginAt`   | Date     |       No | null      |      No |
| `createdAt`     | Date     |     Auto | Auto      |      No |
| `updatedAt`     | Date     |     Auto | Auto      |      No |

## role

```ts id="wq2icn"
enum: [
  "candidate",
  "recruiter",
  "admin"
]
```

## accountStatus

```ts id="dd1wq5"
enum: [
  "active",
  "suspended",
  "deactivated"
]
```

## Indexes

```ts id="x83m0s"
{ email: 1 } UNIQUE
{ role: 1 }
{ accountStatus: 1 }
```

Email must be normalized before saving:

```text id="bzkp2i"
trim
lowercase
```

---

# 5. PROFILES

## Purpose

Stores the candidate's professional identity and career information.

Candidate:

```text id="1z8hrw"
basic profile
skills
education
experience
target role
professional links
```

will live here.

## Schema

```ts id="ay76ts"
Profile {

  _id: ObjectId,

  userId: ObjectId,
  targetRoleId: ObjectId | null,

  firstName: String,
  lastName: String,

  headline: String,
  bio: String,

  location: {
    city: String,
    state: String,
    country: String
  },

  skills: [],

  education: [],

  experience: [],

  links: {
    linkedin: String,
    github: String,
    portfolio: String
  },

  completenessScore: Number,

  createdAt: Date,
  updatedAt: Date
}
```

---

# 6. Candidate Skills

Skills will initially be embedded inside Profile.

## Structure

```ts id="h0kzhf"
skills: [
  {
    name: String,

    level: Number,

    yearsOfExperience: Number,

    source: String,

    verified: Boolean
  }
]
```

Example:

```json id="cktybc"
{
  "name": "React",
  "level": 4,
  "yearsOfExperience": 2,
  "source": "profile",
  "verified": false
}
```

## Skill Level

Standard scale:

```text id="nd0vle"
1 = Beginner
2 = Basic
3 = Intermediate
4 = Advanced
5 = Expert
```

Validation:

```text id="y3r5kp"
min = 1
max = 5
```

## source

```ts id="yz0pew"
enum: [
  "profile",
  "resume",
  "assessment",
  "admin"
]
```

This allows us to know where a skill originated.

Example:

```text id="72kfq8"
React

source = resume
```

means it was detected during resume parsing.

While:

```text id="ld6jz9"
React

source = assessment
verified = true
```

could represent a skill later verified by an assessment.

---

# 7. Candidate Education

Education will be embedded inside Profile.

## Structure

```ts id="ewc12b"
education: [
  {
    institution: String,

    degree: String,

    fieldOfStudy: String,

    startDate: Date,

    endDate: Date | null,

    currentlyStudying: Boolean,

    grade: String | null,

    description: String | null
  }
]
```

Example:

```json id="as84v5"
{
  "institution": "ABC University",
  "degree": "B.Tech",
  "fieldOfStudy": "Computer Science",
  "startDate": "2021-07-01",
  "endDate": "2025-06-01",
  "currentlyStudying": false,
  "grade": "8.2 CGPA"
}
```

Rule:

If:

```text id="n6dt0c"
currentlyStudying = true
```

then:

```text id="6u14va"
endDate = null
```

---

# 8. Candidate Experience

Work experience will also be embedded inside Profile.

## Structure

```ts id="c8r92x"
experience: [
  {
    company: String,

    title: String,

    employmentType: String,

    location: String,

    startDate: Date,

    endDate: Date | null,

    currentlyWorking: Boolean,

    description: String,

    skills: [String]
  }
]
```

Example:

```json id="acndy9"
{
  "company": "Acme Technologies",
  "title": "Frontend Developer",
  "employmentType": "full_time",
  "location": "Gurugram",
  "startDate": "2025-01-01",
  "endDate": null,
  "currentlyWorking": true,
  "description": "Developing React applications.",
  "skills": [
    "React",
    "TypeScript",
    "Next.js"
  ]
}
```

## employmentType

```ts id="43g1z2"
enum: [
  "full_time",
  "part_time",
  "internship",
  "contract",
  "freelance",
  "self_employed"
]
```

Rule:

```text id="cz5xve"
currentlyWorking = true

→

endDate = null
```

---

# 9. Profile Links

```ts id="omcmg2"
links: {

  linkedin: String | null,

  github: String | null,

  portfolio: String | null
}
```

All populated values must pass URL validation.

---

# 10. Profile Completeness

```ts id="w8wmnq"
completenessScore

min = 0
max = 100
```

This value should NOT be trusted from the frontend.

It is calculated by:

```text id="ocx9p8"
ProfileService
```

Example calculation inputs:

```text id="d3xy8f"
basic details
headline
skills
education
experience
resume
target role
professional links
```

The exact weighting can evolve without changing the database schema.

---

# 11. Profile Indexes

```ts id="v5fr69"
{ userId: 1 } UNIQUE

{ targetRoleId: 1 }

{ "skills.name": 1 }
```

The unique `userId` guarantees:

```text id="0jyvpp"
User 1 : 1 Profile
```

---

# 12. RESUMES

## Purpose

Stores uploaded resume files and normalized resume parsing results.

## Schema

```ts id="0tlpzu"
Resume {

  _id: ObjectId,

  userId: ObjectId,

  fileUrl: String,
  fileName: String,
  mimeType: String,

  status: String,

  extractedData: {},

  parsingError: String | null,

  uploadedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

---

# 13. Resume Status

```ts id="jstz71"
enum: [
  "uploaded",
  "processing",
  "parsed",
  "failed"
]
```

Flow:

```text id="wzhml8"
uploaded
   ↓
processing
   ↓
parsed
```

Failure:

```text id="sdqf57"
processing
   ↓
failed
```

---

# 14. extractedData — FINAL STRUCTURE

We will NOT leave `extractedData` as an undefined blob.

It will follow this contract:

```ts id="89um24"
extractedData: {

  personalInfo: {

    fullName: String | null,

    email: String | null,

    phone: String | null,

    location: String | null,

    linkedin: String | null,

    github: String | null,

    portfolio: String | null
  },

  summary: String | null,

  skills: [
    {
      name: String,
      confidence: Number
    }
  ],

  education: [
    {
      institution: String,
      degree: String,
      fieldOfStudy: String | null,

      startDate: String | null,
      endDate: String | null
    }
  ],

  experience: [
    {
      company: String,
      title: String,

      startDate: String | null,
      endDate: String | null,

      description: String | null,

      skills: [String]
    }
  ],

  projects: [
    {
      name: String,
      description: String | null,
      technologies: [String],
      url: String | null
    }
  ],

  certifications: [
    {
      name: String,
      issuer: String | null,
      issueDate: String | null,
      url: String | null
    }
  ],

  totalExperienceYears: Number | null,

  parserVersion: String
}
```

---

# 15. Why Resume Data and Profile Data Are Separate

Important architecture decision:

```text id="t2n38y"
Resume.extractedData
```

represents:

> What was detected from a particular uploaded resume.

While:

```text id="rwcm0l"
Profile
```

represents:

> The candidate's current canonical professional profile.

Therefore:

```text id="3ob18d"
Resume Parser
      ↓
extractedData
      ↓
Candidate reviews/confirms
      ↓
ProfileService
      ↓
Profile
```

We should NOT blindly overwrite the candidate's profile every time a resume is parsed.

---

# 16. Resume Skill Confidence

Parsed skills may contain:

```ts id="2d6efn"
{
  name: "React",
  confidence: 0.96
}
```

Validation:

```text id="exk1ao"
confidence

0 → 1
```

This represents parser confidence, NOT candidate skill level.

These are different concepts:

```text id="zg2qbf"
confidence = parser certainty

level = candidate proficiency
```

---

# 17. Resume Indexes

```ts id="3ly13m"
{ userId: 1 }

{ status: 1 }

{ userId: 1, createdAt: -1 }
```

---

# 18. ROLES

## Purpose

Represents standardized career roles.

Example:

```text id="0psbge"
Frontend Developer
Backend Developer
Full Stack Developer
Product Designer
Data Analyst
```

## Schema

```ts id="hl0s36"
Role {

  _id: ObjectId,

  name: String,

  slug: String,

  description: String,

  status: String,

  createdAt: Date,
  updatedAt: Date
}
```

## status

```ts id="gwcr6j"
enum: [
  "active",
  "inactive"
]
```

## Indexes

```ts id="8qvj0d"
{ name: 1 }

{ slug: 1 } UNIQUE

{ status: 1 }
```

Example:

```text id="a2f5fq"
name:
Full Stack Developer

slug:
full-stack-developer
```

---

# 19. COMPETENCIES

## Purpose

Defines skills required for a particular role.

Example:

```text id="k2ckgr"
Frontend Developer

React       → level 4 → critical
JavaScript  → level 4 → critical
HTML        → level 4 → high
CSS         → level 4 → high
Git         → level 3 → medium
```

## Schema

```ts id="yk8h1b"
Competency {

  _id: ObjectId,

  roleId: ObjectId,

  skillName: String,

  requiredLevel: Number,

  importance: String,

  createdAt: Date,
  updatedAt: Date
}
```

## requiredLevel

```text id="sbn3j3"
1 = Beginner
2 = Basic
3 = Intermediate
4 = Advanced
5 = Expert
```

## importance

```ts id="owkfp5"
enum: [
  "low",
  "medium",
  "high",
  "critical"
]
```

## Indexes

```ts id="g19ebs"
{ roleId: 1 }

{ skillName: 1 }

{
  roleId: 1,
  skillName: 1
} UNIQUE
```

---

# 20. CAREER_PLANS

## Purpose

Stores a snapshot of candidate readiness against a particular role.

## Schema

```ts id="2vkxbh"
CareerPlan {

  _id: ObjectId,

  userId: ObjectId,

  roleId: ObjectId,

  sourceResumeId: ObjectId | null,

  readinessScore: Number,

  gapsData: {},

  status: String,

  createdAt: Date,
  updatedAt: Date
}
```

## status

```ts id="dkdb2c"
enum: [
  "active",
  "superseded"
]
```

---

# 21. gapsData — FINAL STRUCTURE

```ts id="r2glnd"
gapsData: {

  matchedSkills: [
    {
      skillName: String,

      candidateLevel: Number,

      requiredLevel: Number,

      importance: String
    }
  ],

  missingSkills: [
    {
      skillName: String,

      requiredLevel: Number,

      importance: String,

      priority: String
    }
  ],

  improvementSkills: [
    {
      skillName: String,

      candidateLevel: Number,

      requiredLevel: Number,

      gap: Number,

      importance: String,

      priority: String
    }
  ],

  strengths: [
    {
      skillName: String,

      candidateLevel: Number,

      requiredLevel: Number
    }
  ],

  summary: {

    totalRequiredSkills: Number,

    matchedSkillsCount: Number,

    missingSkillsCount: Number,

    improvementSkillsCount: Number
  },

  generatedAt: Date,

  engineVersion: String
}
```

---

# 22. Career Gap Categories

Suppose the role requires:

```text id="xyb0o3"
React       4
TypeScript  4
Node.js     3
MongoDB     3
```

Candidate:

```text id="nnx6if"
React       4
TypeScript  2
MongoDB     4
```

Result:

```text id="spj19p"
MATCHED

React
MongoDB


IMPROVEMENT NEEDED

TypeScript
candidate = 2
required = 4
gap = 2


MISSING

Node.js
```

---

# 23. Gap Priority

```ts id="4fizxs"
priority: [
  "low",
  "medium",
  "high",
  "critical"
]
```

Priority should be determined by CareerPlanService using factors such as:

```text id="v9th9c"
competency importance

+

skill gap
```

It must NOT be accepted directly from the frontend.

---

# 24. Readiness Score

```text id="mufxlk"
0 → 100
```

The exact scoring formula belongs in:

```text id="mxcm7v"
CareerPlanService
```

not:

```text id="gwv2eo"
CareerPlanRepository
```

and not:

```text id="0tnvb6"
CareerPlan model
```

This allows the algorithm to evolve independently of persistence.

---

# 25. Career Plan History

We WILL keep historical evaluations.

Therefore:

```text id="8vh0zc"
userId + roleId
```

will NOT be unique.

Example:

```text id="bln3ss"
January

Frontend Developer
readiness = 55


March

Frontend Developer
readiness = 72


June

Frontend Developer
readiness = 88
```

This gives SKILLEZO progression history.

Indexes:

```ts id="bn2d21"
{ userId: 1 }

{ roleId: 1 }

{ userId: 1, roleId: 1, createdAt: -1 }

{ userId: 1, status: 1 }
```

When a new active plan replaces the previous one:

```text id="m42ak6"
previous → superseded

new → active
```

---

# 26. COMPANIES

## Purpose

Represents employers/recruiting organizations.

## Schema

```ts id="ddkmhc"
Company {

  _id: ObjectId,

  name: String,

  slug: String,

  description: String,

  industry: String,

  website: String,

  logoUrl: String,

  location: {
    city: String,
    state: String,
    country: String
  },

  companySize: String,

  verificationStatus: String,

  createdBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

---

# 27. Company Size

```ts id="u7gs8m"
enum: [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+"
]
```

---

# 28. Company Verification

```ts id="80kex4"
verificationStatus: [
  "pending",
  "verified",
  "rejected"
]
```

---

# 29. Company Indexes

```ts id="ks1fs9"
{ slug: 1 } UNIQUE

{ name: 1 }

{ industry: 1 }

{ verificationStatus: 1 }

{ "location.city": 1 }
```

---

# 30. Recruiter → Company Relationship

This relationship will NOT be stored as:

```text id="30f5w1"
User.companyId
```

because that creates limitations.

A recruiter may eventually:

```text id="r5jbn5"
belong to multiple companies

have different permissions

invite other recruiters

change organizations
```

Therefore we introduce:

```text id="3r41s6"
company_members
```

---

# 31. COMPANY_MEMBERS

## Purpose

Acts as the membership/authorization relationship between users and companies.

```text id="o3we4y"
USER

  ↓

COMPANY_MEMBER

  ↓

COMPANY
```

This creates:

```text id="nn5hhs"
User N : M Company
```

---

# 32. Company Member Schema

```ts id="l77sv3"
CompanyMember {

  _id: ObjectId,

  userId: ObjectId,

  companyId: ObjectId,

  role: String,

  status: String,

  invitedBy: ObjectId | null,

  joinedAt: Date | null,

  createdAt: Date,
  updatedAt: Date
}
```

## role

```ts id="j75r9m"
enum: [
  "owner",
  "admin",
  "recruiter",
  "viewer"
]
```

These are COMPANY roles.

They are different from:

```text id="e9q1br"
User.role
```

Example:

```text id="n7fqf4"
User.role

recruiter


CompanyMember.role

admin
```

The user is globally a recruiter but has admin privileges within that specific company.

---

# 33. Company Membership Status

```ts id="yytmyr"
enum: [
  "invited",
  "active",
  "suspended",
  "removed"
]
```

---

# 34. Company Member Indexes

```ts id="k06pm7"
{ userId: 1 }

{ companyId: 1 }

{
  userId: 1,
  companyId: 1
} UNIQUE

{
  companyId: 1,
  role: 1
}
```

A user cannot have duplicate membership records for the same company.

---

# 35. Recruiter Authorization Flow

Publishing a job must work like:

```text id="0vym14"
Authenticated User
       ↓
User.role == recruiter?
       ↓
CompanyMember lookup
       ↓
Membership active?
       ↓
Check company permission
       ↓
Company valid?
       ↓
JobService
       ↓
Create Job
```

Example authorization:

```text id="rzglhh"
owner      → create/update/delete/manage members
admin      → create/update/manage jobs
recruiter  → create/update assigned recruitment data
viewer     → read only
```

Detailed permission policy belongs in the Service/Authorization layer.

---

# 36. JOBS

## Purpose

Stores job opportunities.

## Schema

```ts id="q15g1w"
Job {

  _id: ObjectId,

  companyId: ObjectId,

  roleId: ObjectId,

  createdBy: ObjectId,

  title: String,

  description: String,

  location: String,

  workplaceType: String,

  employmentType: String,

  externalUrl: String | null,

  status: String,

  publishedAt: Date | null,

  closesAt: Date | null,

  createdAt: Date,
  updatedAt: Date
}
```

---

# 37. Job Status

```ts id="bms97y"
enum: [
  "draft",
  "active",
  "closed",
  "archived"
]
```

Lifecycle:

```text id="u2hj3h"
draft
  ↓
active
  ↓
closed
  ↓
archived
```

---

# 38. Workplace Type

```ts id="o5sz40"
enum: [
  "onsite",
  "hybrid",
  "remote"
]
```

---

# 39. Job Employment Type

```ts id="8hhyy1"
enum: [
  "full_time",
  "part_time",
  "internship",
  "contract",
  "freelance"
]
```

---

# 40. Job Indexes

```ts id="vsmxmi"
{ companyId: 1 }

{ roleId: 1 }

{ status: 1 }

{ location: 1 }

{ createdBy: 1 }

{ status: 1, createdAt: -1 }

{ companyId: 1, status: 1 }
```

---

# 41. APPLICATIONS

## Purpose

Connects candidates with jobs.

## Schema

```ts id="am9e3w"
Application {

  _id: ObjectId,

  userId: ObjectId,

  jobId: ObjectId,

  resumeId: ObjectId | null,

  status: String,

  appliedAt: Date,

  statusHistory: [
    {
      status: String,
      changedAt: Date,
      changedBy: ObjectId | null
    }
  ],

  createdAt: Date,
  updatedAt: Date
}
```

---

# 42. Application Status

Final lifecycle:

```ts id="qxdp4h"
enum: [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
  "withdrawn"
]
```

Typical flow:

```text id="4rsjsm"
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

Alternative:

```text id="mgug57"
any eligible stage
       ↓
rejected
```

Candidate action:

```text id="3fbt0n"
applied / review / shortlisted
             ↓
         withdrawn
```

---

# 43. Application Status History

We will preserve application status changes.

Example:

```json id="nfd0a2"
[
  {
    "status": "applied",
    "changedAt": "2026-08-01T10:00:00Z"
  },
  {
    "status": "under_review",
    "changedAt": "2026-08-03T09:30:00Z"
  },
  {
    "status": "shortlisted",
    "changedAt": "2026-08-05T14:00:00Z"
  }
]
```

This enables:

```text id="gwky8d"
application timeline
recruiter audit history
candidate tracking
future analytics
```

---

# 44. Duplicate Application Protection

A candidate can apply only once to the same job.

Database-level protection:

```ts id="94n6x6"
{
  userId: 1,
  jobId: 1
}
```

with:

```ts id="x81k0v"
unique: true
```

This is important because service-level duplicate checks alone can suffer race conditions.

---

# 45. Application Indexes

```ts id="gf0ok7"
{ userId: 1 }

{ jobId: 1 }

{ status: 1 }

{ userId: 1, createdAt: -1 }

{ jobId: 1, status: 1 }

{ userId: 1, jobId: 1 } UNIQUE
```

---

# 46. Final Relationship Model

```text id="wh97p1"
USER
 │
 ├──── 1:1 ───── PROFILE
 │                   │
 │                   ├── skills[]
 │                   ├── education[]
 │                   ├── experience[]
 │                   │
 │                   └──── N:1 ─── ROLE
 │
 ├──── 1:N ───── RESUMES
 │
 ├──── 1:N ───── CAREER_PLANS
 │                     │
 │                     └──── N:1 ─── ROLE
 │
 ├──── 1:N ───── APPLICATIONS
 │                     │
 │                     └──── N:1 ─── JOB
 │
 │
 └──── 1:N ───── COMPANY_MEMBERS
                       │
                       ▼
                    COMPANY
                       │
                       │ 1:N
                       ▼
                      JOB
                       │
                       ├──── N:1 ─── ROLE
                       │
                       └──── 1:N ─── APPLICATIONS


ROLE
 │
 └──── 1:N ─── COMPETENCIES
```

---

# 47. Final Collection Ownership

```text id="jln1zr"
users
 └── account/authentication


profiles
 └── canonical candidate information


resumes
 └── resume files + extracted snapshots


roles
 └── career role definitions


competencies
 └── role skill requirements


career_plans
 └── candidate-role readiness snapshots


companies
 └── employer organizations


company_members
 └── recruiter/company authorization


jobs
 └── job opportunities


applications
 └── candidate/job pipeline
```

---

# 48. Embedded vs Referenced Decision

## Embedded

Use embedded documents when the data belongs strongly to its parent.

Therefore:

```text id="ljr7km"
Profile
 ├── skills[]
 ├── education[]
 ├── experience[]
 └── links

Resume
 └── extractedData

CareerPlan
 └── gapsData

Application
 └── statusHistory[]
```

---

## Referenced

Use ObjectId references for independent domain entities.

```text id="uxvv1r"
Profile → User

Profile → Role

Resume → User

Competency → Role

CareerPlan → User

CareerPlan → Role

CompanyMember → User

CompanyMember → Company

Job → Company

Job → Role

Application → User

Application → Job

Application → Resume
```

---

# 49. Soft Delete Strategy

Business data should generally not disappear immediately.

Where deletion is needed, important entities may later support:

```ts id="m46vdr"
deletedAt: Date | null
```

For MVP, lifecycle states should be preferred where they already exist:

```text id="m1nl9m"
User
→ deactivated


CompanyMember
→ removed


Job
→ archived


Application
→ withdrawn
```

Hard deletion must only be performed by explicit Service Layer workflows.

---

# 50. Data Ownership Rules

## Candidate

Can modify:

```text id="fxf8wm"
own profile
own resume
own applications where candidate actions are allowed
```

Cannot modify:

```text id="tmq8fs"
roles
competencies
companies
jobs owned by recruiters
other users
```

---

## Recruiter

Can operate on company resources only when an active `company_members` record grants sufficient permission.

Can manage:

```text id="sucf5w"
company jobs
job applications
company recruiting workflows
```

Cannot modify:

```text id="xxh7k2"
candidate profile
candidate resume
other companies
```

---

## Admin

Can manage platform-level:

```text id="jswddp"
roles
competencies
users
companies
moderation
```

Administrative operations should still pass through Services.

---

# 51. Validation Architecture

Validation occurs at three levels.

```text id="i74uio"
Request
   ↓
DTO / Validator
   ↓
Service Validation
   ↓
Repository
   ↓
Mongoose Validation
   ↓
MongoDB
```

## DTO

Validates:

```text id="n3sg4v"
required request fields
email
URL
ObjectId format
string lengths
enum values
```

## Service

Validates business rules:

```text id="2wxsg2"
user permissions
job availability
company membership
duplicate applications
career-plan rules
resume ownership
role existence
```

## Mongoose

Enforces:

```text id="9rfxxm"
types
required
enum
min/max
indexes
unique constraints
```

---

# 52. Repository Rules

Repositories perform data access only.

Example:

```text id="0xgywi"
ApplicationRepository

create()

findByUserAndJob()

findCandidateApplications()

findJobApplications()

updateStatus()
```

Repository must NOT decide:

```text id="dr0mdg"
whether candidate can apply

whether recruiter has permission

whether job accepts applications
```

Those belong to:

```text id="u53bhz"
ApplicationService
```

---

# 53. Service Responsibilities

Examples:

## ProfileService

```text id="ic0jq1"
update profile

calculate completeness

merge confirmed resume data
```

## ResumeService

```text id="57l42j"
upload

trigger parsing

validate parser result

manage resume status
```

## CareerPlanService

```text id="9yt7do"
compare skills

calculate gaps

calculate readiness

supersede previous active plan
```

## CompanyService

```text id="yj6pyx"
create company

invite recruiter

manage memberships

check permissions
```

## JobService

```text id="q6m34y"
validate company membership

publish job

close job

archive job
```

## ApplicationService

```text id="pmdxew"
validate candidate

validate job

prevent duplicate application

apply

withdraw

change status
```

---

# 54. Final Backend Dependency Rule

Always:

```text id="1nkwdo"
API Route
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
```

Never:

```text id="8r41w3"
Controller → Mongoose
```

Never:

```text id="u0tvlx"
Route → MongoDB
```

Never:

```text id="crsv1p"
Repository → Service
```

Dependencies only move downward.

---

# 55. Final Mongoose Model List

The backend should implement:

```text id="s0l5i6"
models/

├── User.model.ts
├── Profile.model.ts
├── Resume.model.ts
├── Role.model.ts
├── Competency.model.ts
├── CareerPlan.model.ts
├── Company.model.ts
├── CompanyMember.model.ts
├── Job.model.ts
└── Application.model.ts
```

Repositories:

```text id="54bcf1"
repositories/

├── BaseRepository.ts
├── UserRepository.ts
├── ProfileRepository.ts
├── ResumeRepository.ts
├── RoleRepository.ts
├── CompetencyRepository.ts
├── CareerPlanRepository.ts
├── CompanyRepository.ts
├── CompanyMemberRepository.ts
├── JobRepository.ts
└── ApplicationRepository.ts
```

---

# 56. Implementation Order

Build the database layer in dependency order:

```text id="rr64zq"
STEP 1

MongoDB connection


STEP 2

User
Role
Company


STEP 3

Profile
Competency
CompanyMember


STEP 4

Resume
Job


STEP 5

CareerPlan
Application


STEP 6

BaseRepository


STEP 7

Individual repositories


STEP 8

AuthService


STEP 9

ProfileService


STEP 10

ResumeService


STEP 11

Role / Competency Service


STEP 12

CareerPlanService


STEP 13

Company Service


STEP 14

Job Service


STEP 15

Application Service
```

---

# 57. Final Architecture

```text id="ng4mxl"
                         CLIENT
                            │
                            ▼
                       API ROUTES
                            │
                            ▼
                       CONTROLLERS
                            │
                            ▼
                         SERVICES
                            │
              ┌─────────────┼──────────────┐
              │             │              │
              ▼             ▼              ▼
          Candidate      Hiring         Career
          Services       Services       Services
              │             │              │
              └─────────────┼──────────────┘
                            ▼
                       REPOSITORIES
                            │
                            ▼
                         MODELS
                            │
                            ▼
                     MONGODB ATLAS
```

---

# 58. Schema Status

The MVP schema is now sufficiently defined to begin Mongoose implementation.

The following previously undefined areas now have explicit implementation decisions:

```text id="0wpkhf"
✓ Candidate skills

✓ Candidate education

✓ Candidate experience

✓ Candidate professional links

✓ Skill proficiency scale

✓ Resume extractedData structure

✓ Resume parsing lifecycle

✓ Parser confidence

✓ Career gapsData structure

✓ Skill gap categories

✓ Career readiness history

✓ Recruiter → Company relationship

✓ Company membership roles

✓ Company membership authorization

✓ Job lifecycle

✓ Application lifecycle

✓ Application status history

✓ Duplicate application protection

✓ Embedding strategy

✓ Reference strategy

✓ Index strategy

✓ Data ownership rules

✓ Validation boundaries

✓ Repository boundaries

✓ Service responsibilities
```

This document is the implementation baseline for SKILLEZO MVP database development.

Any future structural database change should update this specification before modifying the corresponding Mongoose models.
