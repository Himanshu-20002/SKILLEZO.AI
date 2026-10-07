SKILLEZO Backend — Phase 10A
Better Auth Installation & MongoDB Configuration

Continue from the completed and approved Phase 9.5.

Phase 9.5 final audit:
READY FOR PHASE 10

The approved architecture is:

Better Auth
    ↓
Authentication identity
    ↓
user.id = string

SKILLEZO
    ↓
Business/domain data
    ↓
Mongoose repositories/models

==================================================
PHASE 10A OBJECTIVE
==================================================

Install and configure Better Auth with MongoDB.

This phase is ONLY responsible for:

- installing Better Auth
- configuring the MongoDB adapter
- creating the Better Auth configuration
- configuring the Better Auth user schema
- connecting Better Auth to the existing MongoDB infrastructure
- verifying configuration
- documenting the integration

DO NOT implement the complete authentication module yet.

==================================================
IMPORTANT ARCHITECTURE RULE
==================================================

Better Auth is the authentication authority.

Better Auth owns:

- authentication identity
- credentials
- sessions
- accounts
- verification

SKILLEZO owns:

- Profile
- Company
- CompanyMember
- Resume
- Role
- Competency
- Job
- CareerPlan
- Application

Do NOT create a second authentication User identity.

Do NOT create:

BetterAuthUser
+
SKILLEZOAuthUser

with separate IDs.

There must be one logical authenticated user identity.

==================================================
1. INSPECT CURRENT PROJECT
==================================================

Before installing anything, inspect:

package.json

src/lib/db.ts

src/database/models/User.model.ts

src/database/models/index.ts

src/database/repositories/user/UserRepository.ts

src/server.ts

.env

.env.example

DATABASE_SCHEMA.md

phase9.5-pre-better-auth-audit.md

Understand:

- existing MongoDB connection
- MongoDB database name
- existing environment variables
- UserModel collection name
- UserModel fields
- existing Express version
- existing TypeScript configuration

Do not modify anything during this inspection.

==================================================
2. INSTALL PACKAGES
==================================================

Install the current compatible Better Auth package and the required
MongoDB integration dependencies.

Use the official Better Auth MongoDB integration.

Do not install unnecessary authentication libraries.

Do NOT install:

jsonwebtoken

passport

express-session

bcrypt

another auth framework

unless an official Better Auth integration explicitly requires it.

Preserve the existing dependency architecture.

==================================================
3. CREATE BETTER AUTH CONFIGURATION
==================================================

Create:

src/core/auth/auth.ts

Create if required:

src/core/auth/index.ts

src/core/auth/auth.types.ts

Use the official Better Auth configuration for:

Express
MongoDB

Use the existing MongoDB infrastructure where supported.

IMPORTANT:

Do NOT create a second unmanaged MongoDB connection if the existing
database infrastructure can safely be reused.

Keep database connection ownership clear.

==================================================
4. MONGODB ADAPTER
==================================================

Configure the official Better Auth MongoDB adapter.

Verify:

- MongoDB client
- database name
- adapter configuration
- user persistence
- sessions persistence
- accounts persistence
- verification persistence

Do NOT create custom MongoDB collections manually.

Do NOT create custom authentication schemas.

Do NOT create custom session models.

Let Better Auth manage its authentication persistence.

==================================================
5. USER CONFIGURATION
==================================================

Configure Better Auth's user model according to the approved architecture.

Required conceptual fields:

email
name
emailVerified
image
createdAt
updatedAt

SKILLEZO-specific fields may include:

role
accountStatus
lastLoginAt

Only add fields that are already approved by DATABASE_SCHEMA.md.

For sensitive/server-owned fields such as:

role
accountStatus
lastLoginAt

do not allow arbitrary client input.

Do NOT add:

passwordHash

Better Auth owns credential storage.

==================================================
6. USER ID ARCHITECTURE
==================================================

The application contract is:

Better Auth user.id
        ↓
string

SKILLEZO user references:

Profile.userId
Resume.userId
Company.createdBy
CompanyMember.userId
CompanyMember.invitedBy
Job.createdBy
CareerPlan.userId
Application.userId
Application.statusHistory[].changedBy

        ↓

string

Domain entity IDs remain:

Company → ObjectId
Role → ObjectId
Job → ObjectId
Resume → ObjectId
Profile → ObjectId
CareerPlan → ObjectId
Application → ObjectId
Competency → ObjectId

IMPORTANT:

Do NOT force a physical MongoDB `_id` representation without confirming
how the official Better Auth MongoDB adapter handles the mapping.

The logical Better Auth user ID is a string.

Do not introduce an ID conversion layer unless actually required.

==================================================
7. EXISTING USER MODEL SAFETY
==================================================

The existing:

src/database/models/User.model.ts

must NOT become a competing authentication persistence implementation.

Do not add:

password hashing
login
register
session handling
JWT
email verification logic

Determine whether the current UserModel can safely coexist as a
domain representation/projection.

If Better Auth and UserModel would both attempt to own the same
authentication persistence, STOP and report the conflict instead of
inventing a workaround.

Do not silently duplicate user records.

==================================================
8. ENVIRONMENT VARIABLES
==================================================

Update:

.env.example

with only the required Better Auth configuration variables.

Do not expose secrets in source code.

Do not commit actual secret values.

Use placeholders in:

.env.example

Preserve the existing MongoDB configuration.

If Better Auth requires a secret, configure it through environment
variables.

==================================================
9. EXPRESS INTEGRATION
==================================================

DO NOT implement authentication routes yet.

DO NOT implement login/register endpoints yet.

DO NOT implement authentication middleware yet.

For this phase, only prepare the Better Auth handler/configuration
needed for the next phase.

If Express integration requires mounting the Better Auth handler,
implement ONLY the minimum configuration required to verify the
integration.

Follow the official Better Auth Express middleware ordering.

Do not place express.json() before the Better Auth handler if the
official integration requires access to the raw request body.

Preserve:

CORS
health routes
404 middleware
error middleware
graceful shutdown

==================================================
10. DO NOT IMPLEMENT
==================================================

Do NOT implement:

❌ Register flow
❌ Login flow
❌ Logout flow
❌ Session middleware
❌ requireAuth middleware
❌ Protected routes
❌ JWT
❌ OAuth
❌ Password reset
❌ Email verification workflows
❌ Role authorization
❌ Controllers
❌ Services
❌ Business logic

These belong to later phases.

==================================================
11. DATABASE VERIFICATION
==================================================

Verify that Better Auth can initialize correctly against MongoDB.

Verify the expected Better Auth persistence requirements.

Do NOT create fake authentication users just to make the build pass.

If safe, perform a minimal configuration/database initialization test.

Do not destroy or reset existing collections.

Do not drop the database.

Do not delete existing collections.

==================================================
12. HEALTH VERIFICATION
==================================================

Verify:

GET /api/health

GET /api/health/ready

Both must continue working.

==================================================
13. BUILD VERIFICATION
==================================================

Run:

npm run type-check

npm run build

Both must pass with zero errors.

==================================================
14. ARCHITECTURE VERIFICATION
==================================================

Verify:

Better Auth
    ↓
Authentication persistence

SKILLEZO
    ↓
Domain persistence

Verify:

- no duplicate User identity
- no passwordHash
- no custom JWT
- no authentication logic in repositories
- no authentication logic in models
- no authentication logic in services
- no authentication controllers
- no authentication middleware

==================================================
15. DOCUMENTATION
==================================================

Create:

server/doc/phase10a-better-auth-installation.md

Document:

1. Objective

2. Packages installed

3. Better Auth configuration

4. MongoDB adapter configuration

5. Existing MongoDB connection integration

6. User identity strategy

7. Better Auth responsibilities

8. SKILLEZO responsibilities

9. UserModel ownership decision

10. Environment variables

11. Express integration preparation

12. Database verification

13. Security considerations

14. Type-check result

15. Build result

16. Health endpoint result

17. Known limitations

18. Next phase

==================================================
16. FINAL REPORT
==================================================

Return a detailed implementation walkthrough.

Include:

Files created

Files modified

Packages installed

MongoDB configuration

Better Auth configuration

User identity strategy

UserModel compatibility result

Environment variables

Database verification

TypeScript result

Build result

Health endpoint result

Architecture verification

Known risks

==================================================
COMPLETION CRITERIA
==================================================

Phase 10A is complete only when:

✅ Better Auth installed

✅ Official MongoDB integration configured

✅ Existing MongoDB infrastructure preserved

✅ Better Auth configuration created

✅ Authentication user ID remains logically string

✅ No duplicate User identity created

✅ passwordHash not reintroduced

✅ No custom JWT implemented

✅ No authentication business logic implemented

✅ No authentication middleware implemented

✅ No business controllers created

✅ No business services created

✅ .env.example updated

✅ Documentation created

✅ TypeScript passes

✅ Build passes

✅ Health endpoints work

==================================================
NEXT PHASE
==================================================

PHASE 10B — Better Auth Express Handler & Session Verification