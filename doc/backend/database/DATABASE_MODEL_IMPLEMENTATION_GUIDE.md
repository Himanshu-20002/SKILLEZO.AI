# SKILLEZO Backend --- Database Model Implementation Guide

## 1. Purpose

This document explains the completed SKILLEZO Mongoose database model
layer after Phase 7.

### Completed Models

1.  User
2.  Role
3.  Company
4.  Profile
5.  Competency
6.  CompanyMember
7.  Resume
8.  Job
9.  CareerPlan
10. Application

The purpose is to understand **why each model exists, how models
connect, when data is embedded or referenced, how cardinality and
indexes work, and where business logic belongs**.

------------------------------------------------------------------------

## 2. Backend Layering

``` text
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

The responsibilities are:

``` text
Model       → Defines and stores persistence structure
Repository  → Reads/writes database data
Service     → Business rules, decisions and calculations
Controller  → HTTP request/response coordination
Route       → Maps endpoints to controllers
```

The model layer should not contain application workflows.

------------------------------------------------------------------------

## 3. Models by Domain

``` text
IDENTITY
└── User

CANDIDATE
├── Profile
├── Resume
└── CareerPlan

CAREER TAXONOMY
├── Role
└── Competency

RECRUITMENT
├── Company
├── CompanyMember
├── Job
└── Application
```

  Model           Responsibility
  --------------- ------------------------------------------
  User            Platform account/authentication identity
  Profile         Canonical candidate professional data
  Resume          Uploaded resume and extraction snapshot
  Role            Standardized career role
  Competency      Standard skill requirement for a Role
  CareerPlan      Career/skill-gap analysis snapshot
  Company         Employer organization
  CompanyMember   User ↔ Company relationship
  Job             Specific company vacancy
  Application     Candidate User ↔ Job relationship

------------------------------------------------------------------------

## 4. Complete Model Graph

``` text
                         USER
               ┌──────────┼───────────────┐
               │          │               │
               ▼          ▼               ▼
            PROFILE     RESUME       CAREER PLAN
               │                           │
               │ targetRoleId              │ roleId
               └───────────┐     ┌─────────┘
                           ▼     ▼
                             ROLE
                              │
                              ▼
                         COMPETENCY


                         USER
                           │
                           ▼
                    COMPANY MEMBER
                           │
                           ▼
                        COMPANY
                           │
                           ▼
                          JOB
                           │
                           ▼
                      APPLICATION
                           │
                           ▼
                    CANDIDATE USER
```

The two major flows are:

``` text
CAREER INTELLIGENCE

User
 ↓
Profile
 ↓
Role
 ↓
Competency
 ↓
CareerPlan
```

``` text
RECRUITMENT

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

------------------------------------------------------------------------

## 5. References vs Embedded Data

This is one of the most important MongoDB design concepts.

### Referenced entities

Independent/lifecycle entities use their own collections and ObjectId
references.

Examples:

``` text
User
Role
Company
Resume
Job
CareerPlan
Application
```

Example:

``` text
Application
├── userId → User
├── jobId → Job
└── resumeId → Resume (where defined)
```

### Embedded value objects

Data that strongly belongs to a parent is embedded.

Examples:

``` text
Profile
├── skills[]
├── education[]
├── experience[]
├── location
└── links

Resume
└── extractedData
    ├── personalInfo
    ├── skills[]
    ├── education[]
    ├── experience[]
    ├── projects[]
    └── certifications[]

Job
├── location
├── salary
└── requiredSkills[]

CareerPlan
└── gapsData

Application
└── statusHistory[]
```

A useful question is:

> Does this data have an independent identity/lifecycle?

If yes, a separate referenced collection may make sense. If it is a
value that belongs strongly to one parent and is normally consumed with
it, embedding is often appropriate.

------------------------------------------------------------------------

## 6. Cardinality

### User → Profile

``` text
User 1 ───── 1 Profile
```

A unique `Profile.userId` enforces one profile per user.

### Role → Competency

``` text
Role 1 ───── N Competencies
```

Example:

``` text
Backend Developer
├── Node.js
├── Express
├── MongoDB
├── REST APIs
└── Docker
```

### Company → Job

``` text
Company 1 ───── N Jobs
```

### User → Resume

``` text
User 1 ───── N Resumes
```

where multiple uploads are allowed by the approved schema.

### User → CareerPlan

``` text
User 1 ───── N CareerPlans
```

This supports historical analysis snapshots.

------------------------------------------------------------------------

## 7. User

`User` represents platform identity and account-level information.

``` text
User
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

Important:

``` text
User ≠ Profile
```

User should not become a giant document containing candidate skills,
resumes, companies, jobs and applications.

------------------------------------------------------------------------

## 8. Profile

`Profile` contains the candidate's canonical editable professional data.

``` text
Profile.userId       → User
Profile.targetRoleId → Role
```

``` text
User
 ↓
Profile
 ├── skills[]
 ├── education[]
 ├── experience[]
 ├── location
 ├── links
 └── targetRoleId
          ↓
         Role
```

The professional value objects are embedded because they naturally
belong to the candidate profile.

------------------------------------------------------------------------

## 9. Role

`Role` is a standardized career definition.

Examples:

``` text
Frontend Developer
Backend Developer
Full Stack Developer
Data Analyst
Product Designer
```

Role is referenced by:

``` text
Profile
Competency
Job
CareerPlan
```

It provides a common career taxonomy across the platform.

------------------------------------------------------------------------

## 10. Competency

`Competency` represents a standardized skill requirement for a Role.

``` text
Role 1 ───── N Competencies
```

Example:

``` text
Role: Full Stack Developer

Competencies
├── React
├── Node.js
├── MongoDB
├── TypeScript
└── REST APIs
```

A compound uniqueness rule such as:

``` text
roleId + skillName
```

prevents duplicate competency definitions for the same role while
allowing the same skill under different roles.

------------------------------------------------------------------------

## 11. Company

`Company` represents an employer organization.

``` text
Company
├── name
├── slug
├── description
├── industry
├── website
├── logoUrl
├── location
├── companySize
├── verificationStatus
└── createdBy → User
```

`createdBy` identifies who created the company record. It does not
represent all users who belong to the company.

------------------------------------------------------------------------

## 12. CompanyMember --- Bridge Collection

``` text
User
  ↓
CompanyMember
  ↓
Company
```

This models:

``` text
User N : M Company
```

The relationship itself has data:

``` text
CompanyMember
├── userId
├── companyId
├── role
├── status
└── invitedBy
```

This is better than placing one `companyId` directly on User because a
user may participate in multiple companies.

------------------------------------------------------------------------

## 13. Platform Role vs Company Role

These are separate concepts.

``` text
User.role
→ candidate / recruiter / admin
```

This is the user's platform-level role.

``` text
CompanyMember.role
→ owner / admin / recruiter / viewer
```

This is the user's permission inside one particular company.

Therefore:

``` text
UserRole ≠ CompanyMemberRole
```

------------------------------------------------------------------------

## 14. Resume

Resume stores:

``` text
uploaded document metadata
+
processing status
+
structured extraction snapshot
```

``` text
Resume
├── userId → User
├── file metadata
├── status
└── extractedData
    ├── personalInfo
    ├── skills
    ├── education
    ├── experience
    ├── projects
    └── certifications
```

The extraction structure is strongly typed instead of being an arbitrary
`Mixed`/`any` object.

------------------------------------------------------------------------

## 15. Profile vs Resume

This distinction is critical.

``` text
Resume
=
document/extraction snapshot
```

``` text
Profile
=
current canonical editable professional data
```

Future flow:

``` text
Resume Upload
      ↓
Parser
      ↓
Resume.extractedData
      ↓
ProfileService
      ↓
Profile
```

If a candidate later edits their Profile, the original Resume extraction
can remain unchanged as a historical snapshot of that uploaded document.

------------------------------------------------------------------------

## 16. Job

Job represents a real vacancy.

``` text
Job.companyId → Company
Job.roleId    → Role
Job.createdBy → User
```

Conceptually:

``` text
Company
   ↓
Job
├── title
├── description
├── roleId → Role
├── createdBy → User
├── location
├── salary
├── requiredSkills[]
├── employmentType
├── workplaceType
└── status
```

------------------------------------------------------------------------

## 17. Role vs Job

These should not be confused.

``` text
Role
=
general standardized career definition
```

Example competencies:

``` text
Backend Developer
├── Node.js
├── MongoDB
├── REST
├── Docker
└── Git
```

``` text
Job
=
specific company vacancy
```

Example:

``` text
Senior Backend Developer — Acme

Required Skills
├── Node.js
├── MongoDB
├── AWS
├── Docker
└── Kafka
```

A Job can therefore have requirements beyond the generic Role competency
definition.

------------------------------------------------------------------------

## 18. CareerPlan

CareerPlan stores a candidate's career-analysis snapshot.

``` text
CareerPlan
├── userId → User
├── roleId → Role
├── status
└── gapsData
    ├── matchedSkills
    ├── missingSkills
    ├── improvementSkills
    ├── strengths
    └── summary
```

The important principle is:

``` text
CareerPlan stores analysis.
CareerPlan does NOT calculate analysis.
```

------------------------------------------------------------------------

## 19. CareerPlan Snapshot Behavior

Example:

``` text
JANUARY

Candidate
├── React ✓
├── Node.js ✓
└── Docker ✗

CareerPlan A
└── Docker → missing
```

After the candidate learns Docker:

``` text
MARCH

Candidate
├── React ✓
├── Node.js ✓
├── Docker ✓
└── AWS ✗

CareerPlan B
└── AWS → missing
```

This allows historical career development to be preserved instead of
overwriting every previous analysis.

------------------------------------------------------------------------

## 20. CareerPlan Calculation Belongs in Service Layer

Future architecture:

``` text
CareerPlanService
      │
      ├── ProfileRepository
      │       ↓
      │  Candidate Skills
      │
      ├── CompetencyRepository
      │       ↓
      │  Required Skills
      │
      ├── Calculate gaps
      │
      ▼
CareerPlanRepository
      ↓
CareerPlanModel
      ↓
MongoDB
```

Remember:

``` text
Model      → stores
Repository → accesses
Service    → decides/calculates
```

------------------------------------------------------------------------

## 21. Application --- Candidate ↔ Job Bridge

Application connects Candidate User to Job.

``` text
User
  ↓
Application
  ↓
Job
```

This creates:

``` text
User N : M Job
```

One candidate can apply to many jobs, and one job can receive
applications from many candidates.

The relationship itself has application-specific information:

``` text
Application
├── userId
├── jobId
├── resumeId
├── status
└── statusHistory[]
```

------------------------------------------------------------------------

## 22. Two Important Bridge Collections

The database contains two clear N:M bridge patterns.

### User ↔ Company

``` text
User
 ↓
CompanyMember
 ↓
Company
```

### User ↔ Job

``` text
User
 ↓
Application
 ↓
Job
```

This is an important reusable database design pattern.

------------------------------------------------------------------------

## 23. Duplicate Application Protection

The compound unique index:

``` text
{ userId: 1, jobId: 1 } UNIQUE
```

allows:

``` text
Candidate A → Job 1 ✓
Candidate A → Job 2 ✓
Candidate B → Job 1 ✓
```

but prevents:

``` text
Candidate A → Job 1
Candidate A → Job 1 ❌
```

This is stronger than relying only on an application-level `findOne()`
check because concurrent requests can race.

The database unique constraint becomes the final persistence guarantee.

------------------------------------------------------------------------

## 24. Application Status vs Status History

`status` answers:

> Where is the application now?

Example:

``` text
status = interview
```

`statusHistory` answers:

> How did it reach that state?

Example:

``` text
applied       Aug 1
under_review  Aug 2
shortlisted   Aug 4
interview     Aug 6
```

This can later support timelines, audits and recruitment analytics.

------------------------------------------------------------------------

## 25. Application Workflow Is Not Model Logic

The model may restrict status values using `ApplicationStatus`, but it
should not decide business transitions.

For example, questions such as:

``` text
Can shortlisted become interview?
Can rejected become hired?
Can a hired candidate withdraw?
```

belong in:

``` text
ApplicationService
       ↓
Validate business transition
       ↓
ApplicationRepository
       ↓
ApplicationModel
```

------------------------------------------------------------------------

## 26. Mongoose ref Is Not a SQL Foreign Key

A Mongoose field such as:

``` javascript
userId: {
  type: Schema.Types.ObjectId,
  ref: "User"
}
```

defines the logical relationship and enables operations such as
population.

It does not provide the same foreign-key enforcement as SQL.

A valid ObjectId may potentially reference a document that does not
exist.

Therefore future services should perform business integrity checks where
necessary:

``` text
Verify User
Verify Job
Verify Job status
Verify candidate permissions
Create Application
```

------------------------------------------------------------------------

## 27. Centralized Enums

The model layer uses centralized enums such as:

``` text
UserRole
AccountStatus
SkillSource
EmploymentType
JobEmploymentType
RoleStatus
CompetencyImportance
CareerPlanStatus
GapPriority
CompanySize
CompanyVerificationStatus
CompanyMemberRole
CompanyMemberStatus
JobStatus
WorkplaceType
ApplicationStatus
ResumeStatus
```

This establishes one domain vocabulary.

Without centralization, different modules could accidentally use:

``` text
under_review
under-review
in_review
reviewing
```

for the same concept.

------------------------------------------------------------------------

## 28. Indexes

Indexes have two main responsibilities:

``` text
1. Persistence constraints
2. Query performance
```

Constraint example:

``` text
Application
{ userId: 1, jobId: 1 } UNIQUE
```

Query example:

``` text
Application
{ jobId: 1, status: 1 }
```

supports:

``` text
Find shortlisted applications for Job X
```

Likewise:

``` text
{ userId: 1, status: 1 }
```

supports candidate-centric application queries.

Indexes should be based on actual access patterns or required
constraints, not added randomly.

------------------------------------------------------------------------

## 29. Index Trade-Off

More indexes do not automatically mean a better database.

Indexes have costs:

``` text
additional storage
write overhead
index maintenance
memory usage
```

Therefore the final model audit should verify whether every index has a
clear purpose.

------------------------------------------------------------------------

## 30. Implementation Order

The model layer was built in dependency order.

``` text
Phase 4
Root Models
├── User
├── Role
└── Company

Phase 5
Dependent Models
├── Profile
├── Competency
└── CompanyMember

Phase 6
├── Resume
└── Job

Phase 7
├── CareerPlan
└── Application
```

This allowed dependent schemas to be designed after their root entities
were already established.

------------------------------------------------------------------------

## 31. Final Dependency Map

``` text
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
└── CareerPlan.roleId

Company
├── CompanyMember.companyId
└── Job.companyId

Job
└── Application.jobId

Resume
└── Application.resumeId
    where defined by DATABASE_SCHEMA.md
```

------------------------------------------------------------------------

## 32. Important Model Boundaries

``` text
User
→ account identity

Profile
→ canonical candidate professional information

Resume
→ uploaded document + extraction snapshot

Role
→ standardized career definition

Competency
→ standard requirement for a Role

Job
→ specific employer vacancy

CareerPlan
→ analysis snapshot

Company
→ organization

CompanyMember
→ User ↔ Company relationship

Application
→ Candidate ↔ Job relationship
```

These boundaries prevent one model from becoming responsible for the
entire system.

------------------------------------------------------------------------

## 33. Logic That Does NOT Belong in Models

Examples:

``` text
Authentication workflow
Authorization
Recruiter permission checks
Resume parsing
AI extraction
Profile synchronization
Skill-gap calculations
Career readiness calculations
Job recommendations
Candidate matching
Application transition rules
Notifications
Company workflow rules
```

These belong to higher layers, primarily Services.

------------------------------------------------------------------------

## 34. Future Application Flow

``` text
POST /api/jobs/:jobId/apply
           ↓
Authentication Middleware
           ↓
Application Controller
           ↓
Application Service
           │
           ├── Verify User
           ├── Verify candidate
           ├── Verify Job
           ├── Verify Job is active
           ├── Verify Resume if required
           └── Apply business rules
           ↓
Application Repository
           ↓
Application Model
           ↓
MongoDB
```

------------------------------------------------------------------------

## 35. Future Job Creation Flow

``` text
POST /api/companies/:companyId/jobs
             ↓
Authentication
             ↓
Job Controller
             ↓
Job Service
             │
             ├── Find Company
             ├── Find CompanyMember
             ├── Check membership status
             ├── Check company role
             └── Validate business rules
             ↓
Job Repository
             ↓
Job Model
             ↓
MongoDB
```

------------------------------------------------------------------------

## 36. Future Career Analysis Flow

``` text
Candidate requests analysis
             ↓
CareerPlan Controller
             ↓
CareerPlan Service
             │
             ├── ProfileRepository
             │       ↓
             │   Candidate skills
             │
             ├── CompetencyRepository
             │       ↓
             │   Required competencies
             │
             ├── Compare
             │
             └── Generate gapsData
             ↓
CareerPlan Repository
             ↓
CareerPlan Model
             ↓
MongoDB
```

------------------------------------------------------------------------

## 37. Five Questions for Future Model Design

Whenever designing another MongoDB model, ask:

1.  **Collection or embedded?** Does this need independent
    identity/lifecycle?
2.  **Relationships?** Which entities does it reference?
3.  **Cardinality?** Is it 1:1, 1:N, or N:M?
4.  **Access patterns?** What queries will run frequently and need
    indexes?
5.  **Persistence rule or business rule?** Should the database enforce
    it, or should a Service decide it?

------------------------------------------------------------------------

## 38. Application Example Using Those Questions

``` text
Own collection?
→ Yes.

Why?
→ Candidate-job relationship has its own lifecycle.

Relationships?
→ User + Job + Resume where defined.

Cardinality?
→ User N:M Job.

Persistence constraint?
→ userId + jobId UNIQUE.

Query patterns?
→ applications by job/status
→ applications by user/status

Business workflow?
→ ApplicationService.
```

This is database-design reasoning rather than simply Mongoose syntax.

------------------------------------------------------------------------

## 39. Completed Status

``` text
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

------------------------------------------------------------------------

## 40. What Is Still Pending

Completing the model layer does not mean the backend is complete.

Still pending:

``` text
Full model audit/freeze
Repositories
Authentication
Authorization
Business services
Controllers
Business routes
Resume upload/parsing
Profile synchronization
Career-gap calculation
Company workflows
Job workflows
Application workflows
Candidate/job matching
Notifications
```

------------------------------------------------------------------------

## 41. Recommended Next Phase --- Model Audit & Freeze

Before repositories:

``` text
DATABASE_SCHEMA.md
        ↕
10 Mongoose Models
        ↓
Field Audit
        ↓
Type Audit
        ↓
Reference Audit
        ↓
Cardinality Audit
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
Timestamp Audit
        ↓
TypeScript + Build Verification
        ↓
MODEL LAYER FROZEN
```

The complete model graph should be checked as one system rather than
relying only on each phase's individual "Zero Schema Drift" statement.

------------------------------------------------------------------------

## 42. What You Should Be Able to Explain

Before repositories, you should confidently answer:

``` text
Why is Profile separate from User?

Why is Resume separate from Profile?

Why is Role separate from Job?

Why does Competency have its own collection?

Why is CompanyMember a bridge collection?

Why is Application a bridge collection?

Why is userId + jobId unique?

Why are some structures embedded?

Why are other entities ObjectId references?

Why can a User have multiple CareerPlans?

Why does CareerPlan store gapsData rather than calculate it?

Why does Application store status without controlling transitions?

Why are enums centralized?

Why do indexes depend on query patterns?

Why is Mongoose ref not an SQL foreign key?

Why should business logic live in Services instead of Models?
```

------------------------------------------------------------------------

## 43. Core Mental Model

``` text
CANDIDATE / CAREER SIDE

USER
Who is the account?
        ↓
PROFILE / RESUME
What does the candidate know?
        ↓
ROLE / COMPETENCY
What does the target career require?
        ↓
CAREER PLAN
What is the candidate missing?
```

``` text
RECRUITMENT SIDE

USER
Who is the recruiter?
        ↓
COMPANY MEMBER
Which company can they act for?
        ↓
COMPANY
Which employer?
        ↓
JOB
What opportunity exists?
        ↓
APPLICATION
Which candidate applied?
```

And underneath every future feature:

``` text
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

This is the database foundation established through Phase 1--7.
