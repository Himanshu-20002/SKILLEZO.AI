# SKILLEZO Backend --- Phase 4 & Phase 5 Model Walkthrough

## 1. Purpose

This document explains how **Phase 4** and **Phase 5** of the SKILLEZO
backend are connected, what has been implemented, how the Mongoose
models depend on each other, and how data will flow through the
architecture later.

At the end of Phase 5, the project has **6 persistence models**:

-   `User`
-   `Role`
-   `Company`
-   `Profile`
-   `Competency`
-   `CompanyMember`

These models form the first connected foundation of the SKILLEZO
database.

------------------------------------------------------------------------

# 2. Backend Architecture

The backend follows a strict layered architecture:

``` text
Next.js Frontend
        |
        | HTTP Request
        v
+-------------------+
|      Routes       |
+-------------------+
        |
        v
+-------------------+
| Validation / Zod  |
+-------------------+
        |
        v
+-------------------+
|    Controllers    |
+-------------------+
        |
        v
+-------------------+
|     Services      |
|  Business Logic   |
+-------------------+
        |
        v
+-------------------+
|   Repositories    |
|   Data Access     |
+-------------------+
        |
        v
+-------------------+
| Mongoose Models   |
+-------------------+
        |
        v
+-------------------+
|  MongoDB Atlas    |
+-------------------+
```

### Dependency rule

``` text
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

The model layer must **not** call upward into repositories, services,
controllers, or routes.

Phase 4 and Phase 5 are building the **Model / Persistence Layer** at
the bottom of this architecture.

------------------------------------------------------------------------

# 3. Why Phase 4 Came Before Phase 5

Phase 4 created the **root models**:

``` text
User
Role
Company
```

Phase 5 created models that reference those root models:

``` text
Profile
Competency
CompanyMember
```

Therefore the dependency is:

``` text
PHASE 4 — ROOT MODELS
       |
       v
PHASE 5 — DEPENDENT MODELS
```

Phase 5 depends on Phase 4 because fields such as:

``` text
Profile.userId
Profile.targetRoleId
Competency.roleId
CompanyMember.userId
CompanyMember.companyId
CompanyMember.invitedBy
```

reference documents created by Phase 4 models.

------------------------------------------------------------------------

# 4. Models Implemented So Far

## Phase 4 --- Root Models

  Model       Collection    Responsibility
  ----------- ------------- ----------------------------------
  `User`      `users`       Authentication/account identity
  `Role`      `roles`       Standard career roles
  `Company`   `companies`   Employer/recruiting organization

## Phase 5 --- Dependent Models

  Model             Collection          Responsibility
  ----------------- ------------------- -----------------------------------
  `Profile`         `profiles`          Candidate professional profile
  `Competency`      `competencies`      Skills required for a career role
  `CompanyMember`   `company_members`   User ↔ Company membership

------------------------------------------------------------------------

# 5. Complete Relationship Architecture

``` text
                              +----------------+
                              |      User      |
                              |----------------|
                              | _id            |
                              | email          |
                              | passwordHash   |
                              | role           |
                              | accountStatus  |
                              +-------+--------+
                                      |
                         userId       | 1 : 1
                                      v
                              +----------------+
                              |    Profile     |
                              |----------------|
                              | userId         |
                              | targetRoleId   |---------+
                              | skills[]       |         |
                              | education[]    |         |
                              | experience[]   |         |
                              | links          |         |
                              +----------------+         |
                                                       |
                                                       v
                                              +----------------+
                                              |      Role      |
                                              |----------------|
                                              | _id            |
                                              | name           |
                                              | slug           |
                                              | status         |
                                              +-------+--------+
                                                      |
                                               roleId | 1 : N
                                                      v
                                              +----------------+
                                              |   Competency   |
                                              |----------------|
                                              | roleId         |
                                              | skillName      |
                                              | requiredLevel  |
                                              | importance     |
                                              +----------------+


+----------------+         +--------------------+         +----------------+
|      User      |         |   CompanyMember    |         |    Company     |
|----------------|         |--------------------|         |----------------|
| _id            |<--------| userId             |         | _id            |
| email          |<--------| invitedBy          |         | name           |
| role           |         | companyId          |-------->| slug           |
+----------------+         | role               |         | industry       |
                           | status             |         | createdBy -----+----> User
                           | joinedAt           |         +----------------+
                           +--------------------+
```

------------------------------------------------------------------------

# 6. Phase 4 --- Root Models

## 6.1 User

`User` represents the platform account.

It contains account-level information such as:

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

It intentionally does **not** contain:

``` text
firstName
lastName
skills
education
experience
targetRole
companyId
```

Those concerns belong to other models.

### Important indexes

``` text
email          UNIQUE
role
accountStatus
```

`passwordHash` uses `select: false`, so normal database queries should
not return it automatically.

------------------------------------------------------------------------

## 6.2 Role

`Role` represents a standardized career role.

Examples:

``` text
Frontend Developer
Backend Developer
Full Stack Developer
Data Analyst
Product Designer
```

Structure:

``` text
Role
├── _id
├── name
├── slug
├── description
├── status
├── createdAt
└── updatedAt
```

A Role becomes important in Phase 5 because both `Profile` and
`Competency` can reference it.

------------------------------------------------------------------------

## 6.3 Company

`Company` represents an employer/recruiting organization.

``` text
Company
├── _id
├── name
├── slug
├── description
├── industry
├── website
├── logoUrl
├── location
├── companySize
├── verificationStatus
├── createdBy → User
├── createdAt
└── updatedAt
```

`Company.createdBy` records which platform user originally created the
company.

This does **not** mean that the user is permanently attached to only
that company.

Membership is handled separately through `CompanyMember`.

------------------------------------------------------------------------

# 7. Phase 5 --- Dependent Models

## 7.1 Profile

`Profile` depends on:

``` text
User
Role
```

Relationships:

``` text
Profile.userId       → User._id
Profile.targetRoleId → Role._id
```

Conceptually:

``` text
User 1 : 1 Profile
```

The unique index on `Profile.userId` prevents multiple profiles for the
same user.

### Example

``` text
users
--------------------------------
_id: U101
email: candidate@example.com
role: candidate


profiles
--------------------------------
_id: P501
userId: U101
firstName: Rahul
lastName: Sharma
targetRoleId: R10
skills:
  - React
  - JavaScript
  - Node.js
```

The relationship is:

``` text
User U101
   |
   | userId
   v
Profile P501
```

Account information stays in `User`; professional information stays in
`Profile`.

------------------------------------------------------------------------

# 8. Embedded Candidate Data

Inside `Profile`, candidate-specific information is embedded rather than
separated into additional collections.

``` text
Profile
├── location
├── skills[]
├── education[]
├── experience[]
└── links
```

This means SKILLEZO does **not** need separate collections such as:

``` text
candidate_skills
candidate_education
candidate_experience
candidate_links
```

Example:

``` text
Profile
|
+-- skills[]
|   +-- React
|   +-- Node.js
|   +-- MongoDB
|
+-- education[]
|   +-- B.Tech
|
+-- experience[]
|   +-- Software Developer
|
+-- links
    +-- LinkedIn
    +-- GitHub
    +-- Portfolio
```

These pieces belong to the candidate profile and are normally read
together, so embedding keeps the model cohesive.

------------------------------------------------------------------------

# 9. Profile → Role Relationship

A candidate may target a standardized role.

Example:

``` text
Profile
targetRoleId: R100
       |
       v
Role
_id: R100
name: Full Stack Developer
```

This gives the system a common role definition instead of storing
arbitrary target-role text on every candidate.

Later, SKILLEZO can use this relationship to determine what competencies
are expected for the candidate's target role.

------------------------------------------------------------------------

# 10. Competency

`Competency` depends on:

``` text
Role
```

Relationship:

``` text
Competency.roleId → Role._id
```

One Role can have many Competencies:

``` text
Role 1 : N Competency
```

Example:

``` text
Role
Full Stack Developer
        |
        +------ React competency
        |
        +------ Node.js competency
        |
        +------ MongoDB competency
        |
        +------ TypeScript competency
```

Example records:

``` text
Role
_id: R100
name: Full Stack Developer


Competency
roleId: R100
skillName: React
requiredLevel: ...


Competency
roleId: R100
skillName: Node.js
requiredLevel: ...


Competency
roleId: R100
skillName: MongoDB
requiredLevel: ...
```

The compound unique index:

``` text
{ roleId: 1, skillName: 1 } UNIQUE
```

prevents duplicate competency definitions such as:

``` text
Full Stack Developer + React
Full Stack Developer + React
```

while still allowing:

``` text
Frontend Developer + React
Full Stack Developer + React
```

because the roles differ.

------------------------------------------------------------------------

# 11. Candidate Skill Gap Foundation

The actual skill-gap algorithm has **not** been implemented yet.

However, Phase 4 and Phase 5 now provide the data relationships required
for it.

Conceptually, later:

``` text
Candidate
   |
   v
Profile.skills[]
   |
   | compare
   v
Role
   |
   v
Competencies[]
```

Example:

``` text
Candidate Skills
----------------
React
Node.js
MongoDB


Target Role: Full Stack Developer

Required Competencies
---------------------
React
Node.js
MongoDB
TypeScript
Docker
```

A future service could determine:

``` text
Existing
✓ React
✓ Node.js
✓ MongoDB

Possible gaps
✗ TypeScript
✗ Docker
```

But that comparison belongs to the **Service Layer**, not the Mongoose
models.

------------------------------------------------------------------------

# 12. CompanyMember

`CompanyMember` depends on:

``` text
User
Company
```

It is the bridge between them.

``` text
User
  |
  v
CompanyMember
  |
  v
Company
```

This represents:

``` text
User N : M Company
```

A user may belong to multiple companies.

A company may have multiple users.

------------------------------------------------------------------------

# 13. Why We Do Not Use User.companyId

A simpler design might be:

``` text
User
├── email
├── role
└── companyId
```

But this would effectively restrict the user to one company.

Instead:

``` text
User
   |
   +---- CompanyMember ---- Company A
   |
   +---- CompanyMember ---- Company B
   |
   +---- CompanyMember ---- Company C
```

Each membership can have its own:

``` text
role
status
joinedAt
```

Example:

``` text
User U100
   |
   +-- Company A
   |      role: owner
   |      status: active
   |
   +-- Company B
   |      role: recruiter
   |      status: active
   |
   +-- Company C
          role: viewer
          status: invited
```

This is much more flexible than `User.companyId`.

------------------------------------------------------------------------

# 14. Platform Role vs Company Role

These are different concepts.

## User.role

Platform-wide identity:

``` text
candidate
recruiter
admin
```

Example:

``` text
User.role = recruiter
```

means the user is a recruiter-type user on SKILLEZO.

## CompanyMember.role

Company-scoped permission:

``` text
owner
admin
recruiter
viewer
```

Example:

``` text
CompanyMember
userId: U100
companyId: C200
role: admin
```

means that user has the `admin` membership role specifically inside
company `C200`.

Therefore:

``` text
UserRole != CompanyMemberRole
```

They must remain separate.

------------------------------------------------------------------------

# 15. CompanyMember Example

``` text
users
--------------------------------
_id: U200
email: recruiter@example.com
role: recruiter


companies
--------------------------------
_id: C500
name: Acme Technologies


company_members
--------------------------------
userId: U200
companyId: C500
role: recruiter
status: active
invitedBy: U100
```

Connection:

``` text
User U200
   |
   | userId
   v
CompanyMember
   |
   | companyId
   v
Company C500
```

`invitedBy` also references a `User`:

``` text
User U100
   |
   | invitedBy
   v
CompanyMember
```

------------------------------------------------------------------------

# 16. CompanyMember Unique Constraint

The compound unique index:

``` text
{ userId: 1, companyId: 1 } UNIQUE
```

allows:

``` text
User A → Company X
User A → Company Y
```

but prevents duplicate membership records:

``` text
User A → Company X
User A → Company X   X duplicate
```

------------------------------------------------------------------------

# 17. Dependency Table

  -----------------------------------------------------------------------
  Dependent Model   Field             Depends On        Relationship
  ----------------- ----------------- ----------------- -----------------
  Profile           `userId`          User              1:1

  Profile           `targetRoleId`    Role              Many profiles may
                                                        target one role

  Competency        `roleId`          Role              Role 1:N
                                                        Competencies

  CompanyMember     `userId`          User              User N:M Company
                                                        through
                                                        membership

  CompanyMember     `companyId`       Company           Company N:M User
                                                        through
                                                        membership

  CompanyMember     `invitedBy`       User              User who invited
                                                        the member

  Company           `createdBy`       User              User who created
                                                        the company
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 18. Current Database Graph

After Phase 5:

``` text
                         +---------+
                         |  User   |
                         +----+----+
                              |
                 +------------+-------------+
                 |                          |
                 v                          v
             +---------+             +---------------+
             | Profile |             | CompanyMember |
             +----+----+             +-------+-------+
                  |                          |
                  | targetRoleId             | companyId
                  v                          v
             +---------+                +---------+
             |  Role   |                | Company |
             +----+----+                +---------+
                  |
                  | roleId
                  v
            +------------+
            | Competency |
            +------------+
```

Additionally:

``` text
Company.createdBy ----------> User

CompanyMember.invitedBy ----> User
```

------------------------------------------------------------------------

# 19. What Has Actually Been Implemented

At the end of Phase 5:

``` text
Infrastructure
├── Express server                    DONE
├── TypeScript                        DONE
├── Environment validation            DONE
├── MongoDB connection                DONE
├── Health/readiness endpoints        DONE
├── Central error handling            DONE
├── Zod validation infrastructure     DONE
├── API response helpers              DONE
└── Domain enums                      DONE

Persistence Models
├── User                              DONE
├── Role                              DONE
├── Company                           DONE
├── Profile                           DONE
├── Competency                        DONE
└── CompanyMember                     DONE
```

So currently:

``` text
6 core/dependent models implemented
```

The project has the database definitions for these entities, but not the
complete application workflows around them yet.

------------------------------------------------------------------------

# 20. What Is NOT Implemented Yet

The following business functionality does not exist yet:

``` text
Register user
Login user
JWT authentication
Authorization
Create/update profile API
Create company API
Invite company member API
Role management API
Competency management API
Skill-gap calculation
Career readiness calculation
Job posting
Job application
Resume parsing
```

This is intentional.

The project is being constructed bottom-up:

``` text
Database structure
       ↓
Models
       ↓
Repositories
       ↓
Services
       ↓
Controllers
       ↓
Routes
       ↓
Frontend integration
```

------------------------------------------------------------------------

# 21. Example of How a Future API Will Work

Suppose later the frontend requests:

``` text
GET /api/profile/me
```

The request should eventually flow like:

``` text
Next.js
   |
   | GET /api/profile/me
   v
Profile Route
   |
   v
Authentication Middleware
   |
   v
Profile Controller
   |
   v
Profile Service
   |
   v
Profile Repository
   |
   v
Profile Model
   |
   +---- userId ----> User Model
   |
   +---- targetRoleId ----> Role Model
   |
   v
MongoDB
```

The model does not decide what the user is allowed to do.

The service layer will eventually handle those decisions.

------------------------------------------------------------------------

# 22. Future Company Authorization Example

Later, suppose a recruiter wants to create a job for company `C500`.

Conceptual flow:

``` text
POST /api/companies/C500/jobs
          |
          v
Authentication
          |
          v
Job Controller
          |
          v
Job Service
          |
          +----> CompanyMemberRepository
          |          |
          |          v
          |    Find membership:
          |    userId + companyId
          |
          |    Check:
          |    status = active
          |    role = owner/admin/recruiter
          |
          v
If allowed
          |
          v
Job Repository
          |
          v
Job Model
```

This is why `CompanyMember` was established before implementing company
authorization.

------------------------------------------------------------------------

# 23. Future Skill Analysis Example

Later:

``` text
Candidate Profile
       |
       | targetRoleId
       v
      Role
       |
       | roleId
       v
Competencies
       |
       +-------------------+
                           |
Profile.skills[]           |
       |                   |
       +------ compare ----+
                 |
                 v
            Skill Gaps
```

Again, the current models only provide the data foundation.

The calculation belongs in a future service.

------------------------------------------------------------------------

# 24. Why This Architecture Is Useful

The separation gives each model one clear responsibility:

``` text
User
→ Who is this account?

Profile
→ What professional background does this candidate have?

Role
→ What standardized career role exists?

Competency
→ What skills does that role require?

Company
→ What organization exists?

CompanyMember
→ Which user belongs to which company, with what company-level role?
```

This prevents a giant `User` document from becoming responsible for
everything.

------------------------------------------------------------------------

# 25. Model Responsibility Summary

``` text
USER
Account Identity
    |
    +---- PROFILE
    |     Candidate Identity
    |     Skills
    |     Education
    |     Experience
    |     Target Role
    |
    +---- COMPANY MEMBER
          Company Membership
          Company Role
          Membership Status


ROLE
Career Definition
    |
    +---- PROFILE.targetRoleId
    |
    +---- COMPETENCY
          Required Skills


COMPANY
Employer Organization
    |
    +---- COMPANY MEMBER
          Users belonging to company
```

------------------------------------------------------------------------

# 26. Current Model Layer Status

``` text
MODEL LAYER

User                 DONE
Role                 DONE
Company              DONE

Profile              DONE
Competency           DONE
CompanyMember        DONE

Resume               PENDING
Job                  PENDING
CareerPlan           PENDING
Application          PENDING
```

------------------------------------------------------------------------

# 27. Next Dependency Expansion

The next models will build on this foundation.

Conceptually:

``` text
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

Job
└── Application
```

This is why the model layer is being implemented in dependency order.

------------------------------------------------------------------------

# 28. Final Understanding

Phase 4 created the entities that can exist as the main roots of the
system:

``` text
User
Role
Company
```

Phase 5 connected business-domain information to those roots:

``` text
User + Role
     ↓
   Profile

Role
 ↓
Competency

User + Company
      ↓
CompanyMember
```

Together they create the first meaningful SKILLEZO database graph:

``` text
Candidate Side

User
 ↓
Profile
 ↓
Role
 ↓
Competency


Recruiter Side

User
 ↓
CompanyMember
 ↓
Company
```

The system now understands **how the data is structured and connected**,
but it does not yet expose business workflows.

The remaining architecture will gradually add:

``` text
Remaining Models
      ↓
Repositories
      ↓
Services
      ↓
Authentication / Authorization
      ↓
Controllers
      ↓
Routes
      ↓
Frontend
```

This keeps database access predictable and preserves the agreed
architecture:

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
