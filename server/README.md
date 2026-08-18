# 🚀 SKILLEZO AI Backend

> **Express.js + TypeScript Backend Service for SKILLEZO AI**

The SKILLEZO AI backend is built using **Node.js, Express.js, TypeScript, MongoDB Atlas (via Mongoose), and Better Auth** following a strict multi-layered architecture:

```text
Next.js Frontend
       ↓ HTTP
Express Backend (/server)
       ↓
Better Auth (/api/auth/*)   ← Identity & Session Layer
       ↓
Routes
       ↓
Validators (Zod)
       ↓
Controllers
       ↓
Services
       ↓
Repositories / Integrations (Jooble API, etc.)
       ↓
Mongoose Models / External APIs
       ↓
MongoDB Atlas
```

---

## 📚 Complete System Documentation Index

The backend documentation system is located inside [`server/doc/`](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/README.md):

* 🚀 **[Documentation Homepage Index](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/README.md)**
* 📖 **[API Overview](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/01-overview/API_OVERVIEW.md)** | **[API Conventions](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/01-overview/API_CONVENTIONS.md)** | **[API Changelog](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/01-overview/API_CHANGELOG.md)**
* 🔐 **[Authentication Guide](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/02-auth/AUTHENTICATION.md)** | **[Authorization Guide](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/02-auth/AUTHORIZATION.md)** | **[Error Handling Guide](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/02-auth/ERROR_HANDLING.md)**
* 📡 **[Candidate Profile API](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/03-api/profile/PROFILE_API.md)** | **[Company API](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/03-api/company/COMPANY_API.md)**
* 💻 **[Frontend Integration Guide](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/04-integration/FRONTEND_INTEGRATION.md)** | **[API Sequence Flows](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/04-integration/API_FLOWS.md)**
* 🗄 **[Database Schema](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/05-database/DATABASE_SCHEMA.md)** | **[Database Architecture](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/05-database/DATABASE_ARCHITECTURE.md)**
* 🏗 **[Backend Architecture](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/06-architecture/BACKEND_ARCHITECTURE.md)** | **[Layer Architecture](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/06-architecture/LAYER_ARCHITECTURE.md)**

---

## 📌 Implementation Status

Current implementation progress: **Phases 1 through 14 Completed + Full Layered Architecture**

- [x] **PHASE 1 — Backend Foundation**: Environment configuration (Zod validation), structure setup, TypeScript setup, base dependencies (`express`, `mongoose`, `zod`).
- [x] **PHASE 2 — MongoDB Connection + Core Infrastructure**: Mongoose connection manager with state management, graceful shutdown listeners (`SIGINT`/`SIGTERM`), CORS origin handling, liveness (`GET /api/health`), and database readiness (`GET /api/health/ready`) endpoints.
- [x] **PHASE 3 — Shared Backend Infrastructure**: Domain enums, machine-readable error codes (`ERROR_CODES`), numeric HTTP status (`HTTP_STATUS`), custom operational `AppError`, generic `apiResponse` contracts, `asyncHandler`, Zod `validate` request middleware, `objectIdSchema`, `userIdSchema`, `paginationQuerySchema`, `notFoundMiddleware`, and central `errorMiddleware`.
- [x] **PHASE 4 — Root Mongoose Models**: `User`, `Role`, `Company` models with indexes, defaults, and schema validations.
- [x] **PHASE 5 — Dependent Mongoose Models**: `Profile` (embedded `skills`, `education`, `experience`, `links`), `Competency` (compound unique `{ roleId, skillName }`), `CompanyMember` (N:M bridge between `User` and `Company`).
- [x] **PHASE 6 — Resume & Job Mongoose Models**: `Resume` (typed `extractedData`), `Job` (multi-references, embedded `location`, `salary`, `requiredSkills`).
- [x] **PHASE 7 — Final Mongoose Models**: `CareerPlan` (typed `gapsData`), `Application` (N:M bridge between `User` and `Job` with `{ userId, jobId }` compound unique constraint). **Total: 10 / 10 Models Complete**.
- [x] **PHASE 8 — Database Model Audit & Freeze**: Programmatic audit of 47 registered indexes across all 10 collections. Model persistence layer frozen with 0 schema drift.
- [x] **PHASE 9 — Repository Layer Foundation**: Generic `IRepository<T>` interface and `BaseRepository<T>` abstract class. Implemented `UserRepository`, `ProfileRepository`, `RoleRepository`, `CompanyRepository`, `CompanyMemberRepository`, and custom `RepositoryError` hierarchy.
- [x] **PHASE 9.5 — Better Auth Identity Migration**: Option A identity separation (Better Auth owns identity string `user.id`, SKILLEZO owns domain data). Migrated 9 user-referencing fields to `String`, removed Mongoose `ref: "User"` population dependencies, and preserved all domain `ObjectId` entity references.
- [x] **PHASE 10A — Better Auth Installation & MongoDB Configuration**: Installed `better-auth` and `mongodb`, configured official `mongodbAdapter(mongoose.connection.db)`, created core `auth.ts` setup with restricted server-owned user fields (`role`, `accountStatus`, `lastLoginAt`).
- [x] **PHASE 10B — Better Auth Express Handler & Session Verification**: Integrated `toNodeHandler(auth)` in Express middleware pipeline (`/api/auth`) before `express.json()`, enabled `emailAndPassword` auth, verified server-side session resolution via `auth.api.getSession`.
- [x] **PHASE 10C — Authentication Middleware & Protected Route Foundation**: Implemented `requireAuth` middleware using Better Auth `auth.api.getSession`, defined `AuthenticatedUserContext` (`user.id: string`), extended Express Request typing, implemented account status checks (`SUSPENDED`/`DEACTIVATED` → 403).
- [x] **PHASE 11 — Candidate Profile Module**: Implemented Candidate Profile DTOs, Zod validators, ProfileService, ProfileController, and profileRouter (`/api/profile`). Enforced single-profile ownership per candidate, strict identity isolation (`req.user.id`), and section update endpoints (`/skills`, `/education`, `/experience`, `/links`, `/target-role`).
- [x] **PHASE 12 — Company Module & Ownership Foundation**: Implemented Company CRUD DTOs, Zod validators, CompanyRepository, CompanyMemberRepository, CompanyService, CompanyController, and companyRouter (`/api/companies`). Enforced automatic `OWNER` creation on company creation, slug uniqueness, and `OWNER`/`ADMIN` role-based authorization.
- [x] **PHASE 13 — Company Member Management Module**: Implemented CompanyMember DTOs, validators, CompanyMemberService, CompanyMemberController, and companyMemberRouter (`/api/company-members` & `/api/companies/:companyId/members`). Enabled member listings, invites, role updates (`OWNER`, `ADMIN`, `MEMBER`, `RECRUITER`), status updates, and member removals.
- [x] **PHASE 14 — External Job Ingestion Integration**: Implemented external Jooble API integration client, JobIngestionService, JobIngestionController, and jobIngestionRouter (`/api/job-ingestion`). Enables searching and fetching live external jobs for ingestion.

---

## 🔐 Authentication (Better Auth)

SKILLEZO uses **[Better Auth](https://better-auth.com/)** for all identity management.

| Layer           | Owns                                                                                        |
| :-------------- | :------------------------------------------------------------------------------------------ |
| **Better Auth** | User identity (`user.id: string`), password hashing, sessions, accounts, email verification |
| **SKILLEZO**    | Domain entities (`profiles`, `resumes`, `companies`, `jobs`, `applications`, etc.)          |

### Auth Endpoints (mounted at `/api/auth`)

| Method | Endpoint                  | Description                    |
| :----- | :------------------------ | :----------------------------- |
| `POST` | `/api/auth/sign-up/email` | Register a new user            |
| `POST` | `/api/auth/sign-in/email` | Sign in with email & password  |
| `POST` | `/api/auth/sign-out`      | Sign out (invalidates session) |
| `GET`  | `/api/auth/get-session`   | Retrieve current session       |

---

## 🧪 Implemented API Endpoints

### Health Checks (`/api`)
| Method | Endpoint            | Auth Required | Description                                |
| :----- | :------------------ | :-----------: | :----------------------------------------- |
| `GET`  | `/api/health`       |     ❌ No      | Liveness check                             |
| `GET`  | `/api/health/ready` |     ❌ No      | Readiness check (MongoDB connection state) |

### Candidate Profile Endpoints (`/api/profile`)
| Method  | Endpoint                      | Auth Required | Description                      |
| :------ | :---------------------------- | :-----------: | :------------------------------- |
| `POST`  | `/api/profile`                |     ✅ Yes     | Create candidate profile         |
| `GET`   | `/api/profile/me`             |     ✅ Yes     | Retrieve candidate's own profile |
| `PATCH` | `/api/profile/me`             |     ✅ Yes     | General profile update           |
| `PATCH` | `/api/profile/me/skills`      |     ✅ Yes     | Update skills array              |
| `PATCH` | `/api/profile/me/education`   |     ✅ Yes     | Update education array           |
| `PATCH` | `/api/profile/me/experience`  |     ✅ Yes     | Update experience array          |
| `PATCH` | `/api/profile/me/links`       |     ✅ Yes     | Update portfolio & social links  |
| `PATCH` | `/api/profile/me/target-role` |     ✅ Yes     | Update target role ObjectId      |

### Company Endpoints (`/api/companies`)
| Method  | Endpoint                    | Auth Required |   Authorization    | Description                           |
| :------ | :-------------------------- | :-----------: | :----------------: | :------------------------------------ |
| `POST`  | `/api/companies`            |     ✅ Yes     | Authenticated User | Create company & set creator as OWNER |
| `GET`   | `/api/companies/me`         |     ✅ Yes     |   Active Member    | Retrieve companies user belongs to    |
| `GET`   | `/api/companies/:companyId` |     ❌ No      |       Public       | View public company profile           |
| `PATCH` | `/api/companies/:companyId` |     ✅ Yes     |   OWNER / ADMIN    | Update company details                |

### Company Member Endpoints (`/api/company-members` & `/api/companies/:companyId/members`)
| Method   | Endpoint                                        | Auth Required |  Authorization | Description                                 |
| :------- | :---------------------------------------------- | :-----------: | :------------: | :------------------------------------------ |
| `GET`    | `/api/company-members/me`                       |     ✅ Yes     |  Authenticated | Get all company memberships of current user |
| `GET`    | `/api/companies/:companyId/members`             |     ✅ Yes     |  Company Member| List all members of a company               |
| `POST`   | `/api/companies/:companyId/members`             |     ✅ Yes     |  OWNER / ADMIN | Add/invite new member to company            |
| `GET`    | `/api/companies/:companyId/members/:memberId`   |     ✅ Yes     |  Company Member| Get details of specific company member      |
| `PATCH`  | `/api/companies/:companyId/members/:memberId/role` | ✅ Yes    |  OWNER / ADMIN | Update role of a company member             |
| `PATCH`  | `/api/companies/:companyId/members/:memberId/status` | ✅ Yes  |  OWNER / ADMIN | Update status of a company member           |
| `DELETE` | `/api/companies/:companyId/members/:memberId`   |     ✅ Yes     |  OWNER / ADMIN | Remove member from company                  |

### Job Ingestion Endpoints (`/api/job-ingestion`)
| Method | Endpoint                 | Auth Required | Description                                       |
| :----- | :----------------------- | :-----------: | :------------------------------------------------ |
| `POST` | `/api/job-ingestion/search` |    ✅ Yes     | Fetch and ingest live job listings from Jooble API |

---

## 🏛 Express Middleware Pipeline Order

```text
CORS
  ↓
/api/auth  →  Better Auth (toNodeHandler)     ← Mounted BEFORE express.json()
  ↓
express.json({ limit: "1mb" })
  ↓
/api/health            →  Health Router
/api/profile           →  Profile Router
/api/companies         →  Company Router (includes /:companyId/members)
/api/company-members   →  Company Member Router (/me)
/api/job-ingestion     →  Job Ingestion Router
  ↓
notFoundMiddleware
  ↓
errorMiddleware
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server` directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skillezo
CLIENT_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret_key_at_least_32_chars
BETTER_AUTH_URL=http://localhost:5000
NODE_ENV=development

# Job Ingestion API (Jooble)
JOOBLE_API_KEY=your_jooble_api_key
JOOBLE_API_BASE_URL=https://in.jooble.org/api
```

---

## 🛠 Setup & Running Locally

```bash
cd server
npm install
npm run dev
```

### Type-Check & Build
```bash
npm run type-check   # Type check TypeScript codebase
npm run build        # Production compilation with tsc & tsc-alias
npm start            # Run compiled server from dist/server.js
```

