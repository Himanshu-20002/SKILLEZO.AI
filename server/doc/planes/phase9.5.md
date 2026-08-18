SKILLEZO Backend — Phase 9.5
Better Auth Identity Preparation & Domain Identity Migration

Continue from the completed Phase 9 Repository Layer.

The project has approved Option A:

BETTER AUTH
→ Owns authentication identity, credentials, sessions, accounts and verification.

SKILLEZO
→ Owns business/domain data and business rules.

This phase is ONLY for preparing the identity architecture for Better Auth.

DO NOT install Better Auth yet.
DO NOT create authentication routes.
DO NOT create login/register endpoints.
DO NOT create authentication services.
DO NOT create authentication middleware.
DO NOT implement JWT.
DO NOT implement password hashing.
DO NOT implement sessions.

This is a controlled database/domain identity migration.

==================================================
1. IMPORTANT IDENTITY RULE
==================================================

DO NOT blindly change:

User._id: ObjectId → String

Do NOT assume that Better Auth's logical user ID must be represented as a
Mongoose String `_id`.

The official Better Auth MongoDB adapter must ultimately own the mapping
between Better Auth's logical `user.id` and MongoDB persistence.

Therefore:

1. Better Auth will become the authentication authority.
2. The Better Auth MongoDB adapter will own Better Auth persistence.
3. SKILLEZO domain models will store authenticated user IDs as strings.
4. SKILLEZO domain entities will continue using MongoDB ObjectIds.
5. Do not create a duplicate authentication identity.
6. Do not create a competing Mongoose User persistence model for the same
   Better Auth users collection.

==================================================
2. FIRST — INSPECT CURRENT IMPLEMENTATION
==================================================

Before modifying files, inspect:

DATABASE_SCHEMA.md

src/database/models/

src/database/repositories/

src/core/validators/

package.json

tsconfig.json

Determine:

- How User.model.ts currently owns the users collection.
- How UserRepository interacts with UserModel.
- Which models reference User.
- Which repositories assume User IDs are ObjectIds.
- Which code assumes passwordHash exists.
- Which code assumes UserModel is the authentication authority.

Do not modify anything until this inspection is complete.

==================================================
3. UPDATE DATABASE_SCHEMA.md
==================================================

Update the database specification to explicitly define:

Authentication Identity:
Better Auth

Authentication User ID:
string

Domain Entity IDs:
MongoDB ObjectId

Document this distinction clearly.

Example:

Authentication references:

userId
createdBy
invitedBy
changedBy

→ string

Domain references:

companyId
roleId
jobId
resumeId
targetRoleId
sourceResumeId

→ ObjectId

Remove application-owned passwordHash from the authentication
responsibility.

Document that Better Auth owns:

- credentials
- sessions
- accounts
- verification

SKILLEZO owns:

- profile
- company
- company membership
- resume
- jobs
- applications
- career plans
- roles
- competencies

==================================================
4. USER MODEL OWNERSHIP
==================================================

Do NOT simply convert User.model.ts from ObjectId to String.

Determine whether the existing User.model.ts should:

A. Be removed as an authentication persistence model,

OR

B. Be retained only as a domain representation/projection that does NOT
   compete with Better Auth for persistence.

Choose the cleanest option based on the existing repository architecture.

IMPORTANT:

There must be exactly ONE authentication User identity.

Do not create:

BetterAuthUser
+
SkillzUser

with two different IDs.

Avoid:

BetterAuthUser.id
      ↓
mapping
      ↓
SkillzUser._id

unless absolutely required.

The goal is:

Better Auth user identity
      ↓
single user ID
      ↓
SKILLEZO domain references

==================================================
5. PASSWORD RESPONSIBILITY
==================================================

Remove SKILLEZO application ownership of:

passwordHash

Do not replace it with another custom password field.

Do not implement:

bcrypt.hash()

bcrypt.compare()

JWT password authentication

Better Auth will own credential handling.

If User.model.ts currently contains passwordHash,
remove it from the domain authentication model as part of this migration.

==================================================
6. MIGRATE USER REFERENCES
==================================================

Change ONLY references to authenticated users from ObjectId to String.

The following fields represent Better Auth users:

Profile.userId
→ String

Resume.userId
→ String

Company.createdBy
→ String

CompanyMember.userId
→ String

CompanyMember.invitedBy
→ String | null

Job.createdBy
→ String

CareerPlan.userId
→ String

Application.userId
→ String

Application.statusHistory[].changedBy
→ String | null

Do NOT change unrelated ObjectId fields.

==================================================
7. PRESERVE DOMAIN OBJECTIDS
==================================================

The following must remain MongoDB ObjectIds:

Profile.targetRoleId

Competency.roleId

CompanyMember.companyId

Job.companyId

Job.roleId

Application.jobId

Application.resumeId

CareerPlan.roleId

CareerPlan.sourceResumeId

Any other reference to a SKILLEZO domain entity must remain ObjectId
unless DATABASE_SCHEMA.md explicitly specifies otherwise.

DO NOT perform a global:

ObjectId → String

replacement.

==================================================
8. MONGOOSE REFERENCES
==================================================

Do NOT create Mongoose `ref: "User"` relationships for Better Auth users
simply to enable populate().

Authenticated user references should be explicit string identifiers.

For example:

userId: {
    type: String,
    required: true,
    index: true
}

Do not rely on:

populate("userId")

for Better Auth users.

Domain-to-domain Mongoose relationships may continue using:

ref: "Company"

ref: "Role"

ref: "Job"

ref: "Resume"

etc.

==================================================
9. VALIDATION
==================================================

Update:

src/core/validators/common.validators.ts

Keep:

objectIdSchema

for domain entity IDs.

Add:

userIdSchema

using a non-ObjectId-specific string validation.

Example:

z.string().trim().min(1, "User ID is required")

Do NOT constrain user IDs to:

24-character hexadecimal strings.

==================================================
10. REPOSITORIES
==================================================

Update repositories that explicitly handle authenticated user IDs.

Change:

string | Types.ObjectId

to:

string

where the parameter represents a Better Auth user ID.

Review:

UserRepository

ProfileRepository

CompanyRepository

and all other affected repositories.

Remove authentication-specific repository behavior.

In particular:

Do NOT retain:

updatePassword()

or any passwordHash persistence operation.

Do NOT add Better Auth calls to repositories in this phase.

Repositories must remain database/domain persistence abstractions.

==================================================
11. INDEXES
==================================================

Preserve all existing business indexes.

Verify:

Profile.userId unique index

Resume userId indexes

Company createdBy indexes if defined

CompanyMember:

userId + companyId unique

Application:

userId + jobId unique

CareerPlan:

userId indexes

Do not remove indexes simply because their type changes.

==================================================
12. USER ID TYPE AUDIT
==================================================

Search the entire backend for code such as:

Types.ObjectId

Schema.Types.ObjectId

ObjectId.isValid()

string | Types.ObjectId

where the value specifically represents an authenticated User ID.

Update ONLY those cases.

Do not change ObjectId usage for:

Company

Role

Job

Resume

Profile

CareerPlan

Application

Competency

or other domain entities.

==================================================
13. DO NOT IMPLEMENT BETTER AUTH YET
==================================================

This phase must NOT contain:

better-auth package installation

auth.ts

Better Auth handler

/auth routes

login

register

logout

session middleware

password reset

email verification

OAuth

JWT

authentication controllers

authentication services

==================================================
14. DOCUMENTATION
==================================================

Create:

server/doc/phase9.5-better-auth-identity-migration.md

Document:

1. Why Better Auth was selected

2. Before architecture

3. After architecture

4. Authentication identity vs domain identity

5. Better Auth responsibility

6. SKILLEZO responsibility

7. User ID strategy

8. User model ownership decision

9. Affected models

10. Affected fields

11. Preserved ObjectId relationships

12. Validation changes

13. Repository changes

14. Index verification

15. Risks

16. Future Better Auth integration

17. Verification results

Include this architecture:

                Better Auth
                    │
                    │ user.id = string
                    ▼
              Authentication
                 Identity
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
     Profile      Resume       Company
        │           │            │
        │           │            └── createdBy: string
        │           │
        │           └── userId: string
        │
        └── userId: string


Domain relationships:

Profile.targetRoleId → ObjectId
CompanyMember.companyId → ObjectId
Job.companyId → ObjectId
Job.roleId → ObjectId
Application.jobId → ObjectId
Application.resumeId → ObjectId
CareerPlan.roleId → ObjectId
CareerPlan.sourceResumeId → ObjectId

==================================================
18. VERIFICATION
==================================================

Run:

npm run type-check

npm run build

Then search the repository for remaining authenticated-user ObjectId
assumptions.

Verify:

1. No accidental global ObjectId → String migration occurred.

2. All authenticated user references are String.

3. All domain entity references remain ObjectId.

4. Existing indexes are preserved.

5. No passwordHash persistence remains in the SKILLEZO authentication model.

6. No Better Auth package was installed yet.

7. No authentication routes were created.

8. No authentication services were created.

9. No authentication middleware was created.

10. Existing health endpoints still work.

==================================================
19. FINAL ARCHITECTURE
==================================================

The intended architecture after this phase is:

                    CLIENT
                      │
                      ▼
                 EXPRESS
                      │
                      ▼
                Future Better Auth
                      │
                      ▼
              Authenticated User
                      │
                user.id: string
                      │
                      ▼
             SKILLEZO Application
                      │
             ┌────────┴────────┐
             ▼                 ▼
         Controller          Service
                               │
                               ▼
                         Repository
                               │
                               ▼
                         Mongoose Model
                               │
                               ▼
                            MongoDB

Better Auth owns:

- authentication identity
- credentials
- sessions
- accounts
- verification

SKILLEZO owns:

- profile
- company
- company membership
- resume
- role
- competency
- job
- application
- career plan

==================================================
20. FINAL COMPLETION CRITERIA
==================================================

The implementation is complete only when:

✅ Better Auth identity contract documented

✅ User authentication responsibility separated

✅ User references migrated to String

✅ Domain ObjectIds preserved

✅ User ID validation separated from ObjectId validation

✅ Repository User ID types updated

✅ PasswordHash ownership removed

✅ No duplicate User identity introduced

✅ No Mongoose Better Auth `populate()` dependency introduced

✅ Existing business indexes preserved

✅ DATABASE_SCHEMA.md updated

✅ Phase 9.5 documentation created

✅ TypeScript passes

✅ Build passes

✅ Health endpoints remain functional

❌ Better Auth NOT installed yet

❌ Authentication NOT implemented yet

==================================================

NEXT PHASE

PHASE 10 — Better Auth Installation & Configuration