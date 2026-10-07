# ⚙️ SKILLEZO AI — Backend Implementation Status & Module Inventory

> **Path:** `server/`  
> **Framework:** Express 5.2 + TypeScript 5.9 + Mongoose 9.9 + Better Auth 1.6 + Vitest + tsup  
> **Status:** 100% Type-Safe • 7 Test Suites Passing (30/30 Tests) • Production Docker Ready  

---

## 🏛️ 1. Backend Modules Breakdown

```text
server/src/modules/
├── auth/                   # Better-Auth integration with MongoDB adapter, Bearer plugin & proxy trust
├── jobs/                   # Real-time job search, filters (experience, location, salary), pagination & stats
├── job-ingestion/          # Scheduled 12-hour background cron & Jooble external job fetcher
├── resume/                 # PDF extraction (pdf-parse 1.1.1), multi-category skill matcher & resume CRUD
├── profile/                # Candidate profile CRUD, bio, social links, and experience
├── application/            # Candidate job application submission, validation, and status tracking
├── recruiter-application/  # Recruiter application review, stage transition & pipeline filtering
├── company/                # Company profile creation, verification & member management
├── company-member/         # Team member invites and role assignment
├── career-plan/            # Skill gap calculation, role benchmark & career milestone models
├── users/                  # User account management, status (active/suspended) & role checks
└── admin/                  # System admin telemetry & moderation routes
```

---

## 🗄️ 2. Database Models & Schema Status

All models are defined in [server/src/database/models/](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/):

| Model File | Collection | Key Fields | Status |
| :--- | :--- | :--- | :---: |
| [`User.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/User.model.ts) | `users` | `name`, `email`, `role` (CANDIDATE / RECRUITER / ADMIN), `accountStatus` | 🟢 **Live** (Managed by Better Auth) |
| [`Job.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Job.model.ts) | `jobs` | `title`, `company`, `location`, `workplaceType`, `skills`, `salary`, `externalSource`, `status` | 🟢 **Live** (Indexed for text search) |
| [`Resume.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Resume.model.ts) | `resumes` | `userId`, `extractedData` (skills, education, experience, personalInfo), `rawText`, `fileUrl` | 🟢 **Live** |
| [`Profile.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Profile.model.ts) | `profiles` | `userId`, `bio`, `headline`, `skills`, `socialLinks`, `preferredRoles` | 🟢 **Live** |
| [`Application.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Application.model.ts) | `applications` | `jobId`, `candidateId`, `resumeId`, `status` (SUBMITTED, UNDER_REVIEW, SHORTLISTED, REJECTED) | 🟢 **Live** |
| [`Company.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Company.model.ts) | `companies` | `name`, `website`, `logo`, `industry`, `verificationStatus` | 🟢 **Live** |
| [`CompanyMember.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/CompanyMember.model.ts) | `company_members` | `companyId`, `userId`, `role` (OWNER, ADMIN, RECRUITER) | 🟢 **Live** |
| [`CareerPlan.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/CareerPlan.model.ts) | `career_plans` | `userId`, `targetRole`, `milestones`, `employabilityScore` | 🟡 **Schema Ready** |
| [`Competency.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Competency.model.ts) | `competencies` | `roleName`, `requiredSkills`, `weightage` | 🟡 **Schema Ready** |

---

## 🔌 3. Mounted HTTP Endpoints Summary

```text
/api/health                       ➔ GET: Service Health & DB Connection Status
/api/auth/*                       ➔ ALL: Better Auth Handlers (Sign in, Sign up, Session, Sign out)
/api/profile                      ➔ GET /me, PUT /me (Candidate Profile)
/api/jobs                         ➔ GET / (search with filters), GET /:id, GET /stats
/api/job-ingestion/trigger        ➔ POST: Manually trigger external ingestion sweep
/api/resumes                      ➔ POST /upload (Multer PDF buffer), GET /me, GET /:id
/api/applications                 ➔ POST / (Apply), GET /my-applications, GET /:id
/api/recruiter/applications       ➔ GET / (Company candidate pipeline), PATCH /:id/status
/api/companies                    ➔ GET /, POST /, GET /:id, PUT /:id
/api/company-members              ➔ GET /:companyId, POST /invite
```

---

## 🛡️ 4. Test Coverage & Build Pipeline

- **Test Framework:** `vitest`
- **Current Tests:** 7 Test Suites • **30 Unit & Integration Tests (100% Green)**:
  - `health.routes.spec.ts` (API Integration test)
  - `resume.parser.spec.ts` (PDF text extraction & Skill taxonomy)
  - `resume.service.spec.ts` (Upload and persistence)
  - `jobs.service.spec.ts` (Job search and query filtering)
  - `application.service.spec.ts` (Application creation, deduplication & status transition)
  - `skill-extractor.spec.ts` (Regex skill parsing)
  - `validate.middleware.spec.ts` (Zod validation errors)
- **Production Build:** `tsup` bundles `src/server.ts` into a clean, standalone `dist/server.js` with `better-auth` inlined.
