You are a Senior Backend Architect and TypeScript/Node.js Engineer.

We are beginning backend implementation for the **SKILLEZO** platform.

The database architecture and database schema have already been designed. Do NOT redesign the architecture or randomly introduce additional collections, frameworks, patterns, or abstractions.

We will implement the backend incrementally in phases.

Each phase MUST:

1. Build on the previous phase.
2. Keep existing working code intact.
3. Avoid implementing future phases prematurely.
4. Keep the project runnable after the phase is complete.
5. Follow strict TypeScript practices.
6. Follow the repository + service architecture defined below.
7. Explain what was created after completing the phase.
8. Run TypeScript/lint/build checks where available and fix errors caused by the implementation.

---

# ARCHITECTURE

The required dependency flow is:

```text
Client
  ↓
Next.js API Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Mongoose Model
  ↓
MongoDB Atlas
```

Dependencies only flow downward.

Never:

```text
API Route → Mongoose

Controller → Mongoose

Controller → Repository

Repository → Service

Repository → Controller
```

Responsibilities:

```text
API Route
HTTP entry point only.

Controller
Request/response coordination.

Service
Business logic and authorization.

Repository
Database queries only.

Model
MongoDB persistence schema.
```

---

# DATABASE

Database:

MongoDB Atlas

ODM:

Mongoose

Primary IDs:

MongoDB ObjectId

All collections use timestamps.

The final MVP collections are:

```text
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

Do NOT create additional collections unless explicitly requested.

---

# BACKEND TECHNOLOGY

Use:

```text
Next.js
Node.js
TypeScript
MongoDB Atlas
Mongoose
Zod
JWT-based authentication architecture
bcryptjs
```

Do NOT introduce:

```text
Prisma
SQL
NestJS
Firebase
Supabase
GraphQL
Redux
```

unless explicitly requested later.

---

# TARGET PROJECT STRUCTURE

We are progressively working toward:

```text
src/
│
├── app/
│   └── api/
│
├── controllers/
│
├── services/
│
├── repositories/
│
├── models/
│
├── validators/
│
├── dto/
│
├── middleware/
│
├── config/
│
├── lib/
│
├── types/
│
├── constants/
│
└── utils/
```

Do not create meaningless empty files just to make the folder tree look complete.

Folders should receive files when their phase actually requires them.

---

# PLANNED IMPLEMENTATION PHASES

We will implement the backend in this order.

```text
PHASE 1
Backend Foundation
        ↓
PHASE 2
Database Connection + Core Infrastructure
        ↓
PHASE 3
Shared Types / Enums / Error Infrastructure
        ↓
PHASE 4
Core Mongoose Models
        ↓
PHASE 5
Dependent Mongoose Models
        ↓
PHASE 6
Repository Infrastructure
        ↓
PHASE 7
Authentication
        ↓
PHASE 8
Profile Module
        ↓
PHASE 9
Resume Module
        ↓
PHASE 10
Roles + Competencies
        ↓
PHASE 11
Career Planning Engine
        ↓
PHASE 12
Company + Membership
        ↓
PHASE 13
Jobs
        ↓
PHASE 14
Applications
        ↓
PHASE 15
Testing + Security + Production Hardening
```

Do NOT implement all phases now.

We are starting with **PHASE 1 only**.

---

# PHASE 1 — BACKEND FOUNDATION

Your task is to prepare the existing project for backend development.

Before changing anything:

1. Inspect the existing project.
2. Inspect `package.json`.
3. Inspect the existing `src` structure.
4. Inspect `tsconfig.json`.
5. Inspect the Next.js configuration.
6. Determine the currently installed package manager from the lockfile.
7. Identify existing dependencies that can be reused.
8. Do NOT overwrite working frontend configuration.

Then implement the backend foundation.

---

# STEP 1 — INSTALL REQUIRED FOUNDATION PACKAGES

Install only packages needed for the backend foundation and near-term backend work.

Required runtime dependencies:

```text
mongoose
zod
bcryptjs
jsonwebtoken
```

Required development dependency if needed:

```text
@types/jsonwebtoken
```

Before installing anything:

Check whether it already exists.

Do not install duplicate packages.

Use the project's existing package manager.

For example, if the project uses:

```text
package-lock.json → npm
pnpm-lock.yaml → pnpm
yarn.lock → yarn
```

use that package manager.

Do NOT replace the project's package manager.

---

# STEP 2 — CREATE BACKEND DIRECTORY FOUNDATION

Create the following directories under `src` if they do not already exist:

```text
src/

├── controllers/
├── services/
├── repositories/
├── models/
├── validators/
├── dto/
├── middleware/
├── config/
├── lib/
├── types/
├── constants/
└── utils/
```

Do not move existing frontend files unnecessarily.

Do not break the existing Next.js App Router structure.

---

# STEP 3 — ENVIRONMENT CONFIGURATION

Create or update:

```text
.env.example
```

Add:

```text
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Do NOT put real secrets in `.env.example`.

Check `.gitignore`.

Make sure actual environment files such as:

```text
.env
.env.local
```

are ignored.

Never commit credentials.

Do not invent MongoDB credentials.

---

# STEP 4 — ENVIRONMENT VALIDATION

Create:

```text
src/config/env.ts
```

Use Zod to validate server environment variables.

The application should fail clearly when required backend environment variables are missing during backend execution.

Do not expose secrets through variables prefixed with:

```text
NEXT_PUBLIC_
```

Example conceptual responsibility:

```text
process.env
   ↓
Zod validation
   ↓
typed env object
```

Export a centralized environment configuration.

Avoid reading `process.env` randomly throughout services and repositories.

---

# STEP 5 — BACKEND CONFIGURATION

Create only minimal configuration needed at this stage.

Example:

```text
src/config/
    env.ts
```

Do NOT create large speculative configuration systems.

---

# STEP 6 — DATABASE FILE PLACEHOLDER

Prepare:

```text
src/lib/db.ts
```

However, Phase 1 should NOT yet implement complicated repository/model logic.

The database connection will be completed and tested in Phase 2.

The file can contain the clean MongoDB connection foundation if appropriate, but do not create models yet.

---

# STEP 7 — SHARED BACKEND TYPES

Create minimal shared types only if immediately useful.

For example:

```text
src/types/api.types.ts
```

Potential generic response contracts:

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

Do NOT create dozens of speculative types.

---

# STEP 8 — CONSTANTS

Create:

```text
src/constants/
```

Only add constants required by Phase 1.

Do NOT define database enums yet unless they are actually required.

Those will be finalized during the model phases.

---

# STEP 9 — API HEALTH CHECK

Create a simple backend health endpoint:

```text
GET /api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

The purpose is to verify:

```text
Next.js
   ↓
API Route
   ↓
Backend works
```

This endpoint should NOT query MongoDB yet.

Database health will be introduced during Phase 2.

---

# STEP 10 — CODE QUALITY

Review existing:

```text
tsconfig.json
eslint configuration
Next.js configuration
```

Do not aggressively rewrite them.

Only make changes required for backend compatibility.

Maintain strict TypeScript compatibility where the existing project permits it.

Avoid:

```ts
any
```

unless absolutely unavoidable and documented.

---

# STEP 11 — SECURITY BASELINE

Ensure:

* secrets are not committed
* backend secrets never use NEXT_PUBLIC_
* no credentials are hardcoded
* password hashing will use bcryptjs
* JWT secrets come from environment variables
* MongoDB URI comes from environment variables

Do NOT implement authentication yet.

---

# STEP 12 — DO NOT IMPLEMENT YET

Phase 1 must NOT create:

```text
User model
Profile model
Resume model
Role model
Competency model
CareerPlan model
Company model
CompanyMember model
Job model
Application model
```

Do NOT create:

```text
repositories
services
controllers
authentication routes
JWT middleware
resume parser
career engine
job APIs
application APIs
```

Those belong to later phases.

---

# STEP 13 — VERIFY PROJECT

After implementation run the project's relevant checks.

Prefer:

```text
npm run lint
npm run build
```

or the equivalent commands for the project's package manager.

If a command does not exist, inspect package.json instead of inventing scripts.

Fix errors introduced by this phase.

Do NOT modify unrelated frontend functionality just to silence unrelated pre-existing warnings.

Clearly distinguish:

```text
existing issue
```

from:

```text
issue introduced by Phase 1
```

---

# EXPECTED PHASE 1 RESULT

At completion the project should approximately contain:

```text
src/
│
├── app/
│   ├── api/
│   │   └── health/
│   │       └── route.ts
│   │
│   └── existing frontend...
│
├── controllers/
├── services/
├── repositories/
├── models/
├── validators/
├── dto/
├── middleware/
│
├── config/
│   └── env.ts
│
├── lib/
│   └── db.ts
│
├── types/
│   └── api.types.ts
│
├── constants/
└── utils/
```

Again: do not create unnecessary placeholder files inside empty directories.

---

# PHASE COMPLETION REPORT

When finished, return a concise walkthrough containing:

## 1. Packages

List:

```text
installed
already present
not installed
```

and why each package is required.

## 2. Files Created

Show the exact files created or modified.

## 3. Folder Structure

Show the relevant backend tree.

## 4. Environment Setup

Explain which variables the developer must provide locally.

Never display secret values.

## 5. Health Endpoint

Show how to test:

```text
GET /api/health
```

## 6. Verification

Report:

```text
TypeScript
lint
build
```

results.

## 7. Architecture Check

Confirm that Phase 1 has not introduced database queries, models, repositories, business logic, or authentication prematurely.

## 8. Next Phase

State exactly:

```text
PHASE 2 — MongoDB Connection + Core Infrastructure
```

Do NOT implement Phase 2 until explicitly instructed.
