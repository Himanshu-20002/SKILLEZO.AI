# 🛠️ SKILLEZO AI — Backend Implementation Status & Developer Task Assignment Matrix

> **Document Version:** 1.0.0  
> **Date:** August 31, 2026  
> **Repository:** [Himanshu-20002/SKILLEZO.AI](https://github.com/Himanshu-20002/SKILLEZO.AI.git)  
> **Backend Architecture:** Node.js, Express 5, TypeScript 5.9, MongoDB Atlas, Mongoose 9.9, Better Auth 1.6  

---

## 📌 Table of Contents

1. [Executive Backend Audit Summary](#1-executive-backend-audit-summary)
2. [Module-by-Module Backend Implementation Status](#2-module-by-module-backend-implementation-status)
3. [What is Complete & Production-Ready on Backend](#3-what-is-complete--production-ready-on-backend)
4. [What is Left to Build on Backend](#4-what-is-left-to-build-on-backend)
5. [Frontend Integration Gap (Work Required by Frontend Devs)](#5-frontend-integration-gap-work-required-by-frontend-devs)
6. [Developer Workstream Allocation](#6-developer-workstream-allocation)
7. [Developer 1 Task Matrix (Backend AI, Services & Security)](#7-developer-1-task-matrix-backend-ai-services--security)
8. [Developer 2 Task Matrix (Backend APIs & Frontend Integration)](#8-developer-2-task-matrix-backend-apis--frontend-integration)
9. [Sprint-by-Sprint Execution Roadmap](#9-sprint-by-sprint-execution-roadmap)

---

## 1. Executive Backend Audit Summary

The SKILLEZO backend is structured around a strict **Controller → Service → Repository → Mongoose Model** architecture.

- **10 of 10 Database Models** are defined and indexed in MongoDB (`User`, `Role`, `Company`, `CompanyMember`, `Competency`, `Job`, `Profile`, `Resume`, `CareerPlan`, `Application`).
- **Core Identity & Two-Sided Hiring Pipeline** (Phases 1 through 18) are **100% completed on the backend**.
- **AI Intelligence Engines, Employability Scoring, and In-App Notifications** are defined in schemas but have **not yet been implemented in services/routes**.
- **Crucial Takeaway:** A massive amount of finished backend functionality is already sitting idle waiting for frontend integration. The team must divide work into:
  - **Workstream A (Backend AI & New Modules):** Building the remaining AI, Career Plan, ATS Scoring, and Security services.
  - **Workstream B (API Extensions & Frontend Integration):** Connecting the completed backend APIs to the Next.js UI and adding missing recruiter job CRUD.

---

## 2. Module-by-Module Backend Implementation Status

| # | Backend Module | Folder Location | Model Status | Service & API Status | Overall Status |
| :-: | :--- | :--- | :---: | :---: | :---: |
| **1** | **Authentication & Identity** | `server/src/core/auth` | ✅ Better Auth Collections | ✅ Email/Password, Sessions, `requireAuth` | 🟢 **90% Complete** (OAuth/Reset left) |
| **2** | **Candidate Profile** | `server/src/modules/profile` | ✅ `ProfileModel` | ✅ Full CRUD, Section Updates | 🟢 **100% Complete** |
| **3** | **Company Management** | `server/src/modules/company` | ✅ `CompanyModel` | ✅ Create, Read, Update, Owner hook | 🟢 **100% Complete** |
| **4** | **Company Members & Roles** | `server/src/modules/company-member` | ✅ `CompanyMemberModel` | ✅ Role Updates, Invites, Removals | 🟢 **100% Complete** |
| **5** | **External Job Ingestion** | `server/src/modules/job-ingestion` | ✅ `JobModel` | ✅ Jooble Provider, Deduplication | 🟡 **80% Complete** (Cron trigger left) |
| **6** | **Job Discovery & Search** | `server/src/modules/jobs` | ✅ `JobModel` | ✅ Public Search, Filters, Pagination | 🟡 **80% Complete** (Employer CRUD left) |
| **7** | **Resume Storage & Management** | `server/src/modules/resume` | ✅ `ResumeModel` | ✅ Upload, Disk Store, Stream, Delete | 🟡 **70% Complete** (AI Parsing left) |
| **8** | **Candidate Application Workflow** | `server/src/modules/application` | ✅ `ApplicationModel` | ✅ Apply, Snapshot, Withdraw, History | 🟢 **100% Complete** |
| **9** | **Recruiter Application Pipeline** | `server/src/modules/recruiter-application` | ✅ `ApplicationModel` | ✅ Review, Status Change, Stream Resume | 🟢 **100% Complete** |
| **10** | **Skill Gap & Career Plan** | `server/src/modules/career-plan` | ✅ `CareerPlanModel` | ⚪ Empty Directory (No Service/Route) | 🔴 **20% Complete** (Schema Only) |
| **11** | **Competencies & Target Roles** | `server/src/database/models` | ✅ `Competency`, `Role` | ⚪ No Active Service | 🔴 **20% Complete** (Schema Only) |
| **12** | **Employability Index Engine** | `server/src/modules/employability` | ⚪ Not Created | ⚪ Not Created | ⚪ **0% Not Implemented** |
| **13** | **Skill Verification Engine** | `server/src/modules/verification` | ⚪ Not Created | ⚪ Not Created | ⚪ **0% Not Implemented** |
| **14** | **In-App Notifications** | `server/src/modules/notifications` | ⚪ Not Created | ⚪ Not Created | ⚪ **0% Not Implemented** |
| **15** | **Admin & Content Moderation** | `server/src/modules/admin` | ⚪ Not Created | ⚪ Empty Directory | ⚪ **0% Not Implemented** |

---

## 3. What is Complete & Production-Ready on Backend

### 🔐 1. Authentication & Session Security (Better Auth)
* **Endpoints:**
  - `POST /api/auth/sign-up/email` — Register candidate/recruiter.
  - `POST /api/auth/sign-in/email` — Authenticate & issue session cookie + token.
  - `POST /api/auth/sign-out` — Invalidate session.
  - `GET /api/auth/get-session` — Validate active session.
* **Features:** Express raw body handler mounted before `express.json()`, `requireAuth` middleware with token caching and `SUSPENDED`/`DEACTIVATED` account guard.

### 👤 2. Candidate Profile Module (`/api/profile`)
* **Endpoints:**
  - `POST /api/profile` — Create candidate profile.
  - `GET /api/profile/me` — Retrieve candidate's full profile.
  - `PATCH /api/profile/me` — General bio and location update.
  - `PATCH /api/profile/me/skills` — Replace / append skills array.
  - `PATCH /api/profile/me/education` — Update education history.
  - `PATCH /api/profile/me/experience` — Update work experience array.
  - `PATCH /api/profile/me/links` — Update GitHub, LinkedIn, portfolio links.
  - `PATCH /api/profile/me/target-role` — Update target career role.

### 🏢 3. Company & Member Management (`/api/companies` & `/api/company-members`)
* **Endpoints:**
  - `POST /api/companies` — Create company (creator automatically becomes `OWNER`).
  - `GET /api/companies/me` — List all companies the user belongs to.
  - `GET /api/companies/:companyId` — Public company details.
  - `PATCH /api/companies/:companyId` — Update company profile (`OWNER`/`ADMIN` only).
  - `GET /api/company-members/me` — List user's memberships.
  - `GET /api/companies/:companyId/members` — List all company employees/recruiters.
  - `POST /api/companies/:companyId/members` — Invite new member.
  - `PATCH /api/companies/:companyId/members/:memberId/role` — Promote/demote role.
  - `PATCH /api/companies/:companyId/members/:memberId/status` — Activate/suspend member.
  - `DELETE /api/companies/:companyId/members/:memberId` — Remove member from organization.

### 💼 4. Job Ingestion & Discovery (`/api/job-ingestion` & `/api/jobs`)
* **Endpoints:**
  - `POST /api/job-ingestion/search` — Query Jooble API and ingest external jobs into MongoDB.
  - `GET /api/jobs` — Public paginated job search (supports `search`, `location`, `workMode`, `employmentType`, `minSalary`, `maxSalary`, `page`, `limit`).
  - `GET /api/jobs/:jobId` — Public job details view.

### 📄 5. Resume Management & Private Storage (`/api/resumes`)
* **Endpoints:**
  - `POST /api/resumes/upload` — Multer file upload (stores securely on disk in `storage/resumes`).
  - `GET /api/resumes` — List all resumes belonging to authenticated candidate.
  - `GET /api/resumes/:resumeId` — Get resume metadata.
  - `GET /api/resumes/:resumeId/download` — Stream resume file from disk.
  - `PUT /api/resumes/:resumeId/default` — Set active default resume.
  - `PATCH /api/resumes/:resumeId` — Update resume title.
  - `DELETE /api/resumes/:resumeId` — Delete resume record and unlink disk file.

### 📨 6. Candidate Job Applications (`/api/applications`)
* **Endpoints:**
  - `POST /api/applications` — Apply to a job (creates resume snapshot, enforces 1 application per job).
  - `GET /api/applications` — List user's submitted applications with pagination and status filter.
  - `GET /api/applications/:applicationId` — View application details.
  - `GET /api/applications/:applicationId/status-history` — View audit trail of status updates.
  - `PATCH /api/applications/:applicationId/withdraw` — Candidate withdraws application.

### 🎯 7. Recruiter Application Review Pipeline (`/api/recruiter/applications`)
* **Endpoints:**
  - `GET /api/recruiter/applications` — List all applicants across company's jobs with filters (`jobId`, `status`, `page`, `limit`).
  - `GET /api/recruiter/applications/:applicationId` — Inspect candidate details and snapshot.
  - `GET /api/recruiter/applications/:applicationId/status-history` — View full transition timeline.
  - `GET /api/recruiter/applications/:applicationId/resume` — Stream candidate's submitted resume PDF.
  - `PATCH /api/recruiter/applications/:applicationId/status` — Move application through stages (`UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `OFFERED`, `REJECTED`).

---

## 4. What is Left to Build on Backend

The following backend features must be built to complete the SKILLEZO vision:

### 🧠 1. AI Resume Parsing & ATS Scoring Engine (Module: `resume`)
- **Missing:**
  - PDF text extraction utility (`pdf-parse`) to convert uploaded resume files into structured text.
  - ATS scoring algorithm measuring keyword density, formatting compliance, action verb usage, and brevity.
  - Endpoint: `GET /api/resumes/:resumeId/analysis` returning ATS score (0–100), missing keywords, formatting errors, and improvement recommendations.

### 🗺️ 2. AI Skill Gap & Career Plan Engine (Module: `career-plan`)
- **Missing:**
  - `CareerPlanRepository` implementing `BaseRepository<ICareerPlan>`.
  - `SkillGapService` comparing candidate profile skills against required skills defined in `RoleModel` / `CompetencyModel`.
  - Algorithms for calculating matched skills, missing skill deficiencies, and role readiness percentage.
  - Endpoints:
    - `GET /api/roles` — List available industry roles (Full-Stack, DevOps, AI Engineer, etc.).
    - `POST /api/career-plan/generate` — Generate and persist a personalized roadmap.
    - `GET /api/career-plan/me` — Retrieve active career plan and radar proficiency categories.

### 📊 3. Employability Index Computation Engine (Module: `employability`)
- **Missing:**
  - Weighted algorithmic scoring service aggregating:
    - Profile completeness (20%)
    - Resume ATS compatibility score (30%)
    - Skills match against target role (30%)
    - Verified credentials & project experience (20%)
  - Endpoint: `GET /api/employability-index/me` returning overall score (0–100), percentile benchmark, strengths, and priority action items.

### 🏢 4. Employer / Recruiter Job Management CRUD (Module: `jobs`)
- **Missing:**
  - Recruiter endpoints to create and manage native job postings for their verified company:
    - `POST /api/jobs` — Post new job listing (requires company `OWNER`, `ADMIN`, or `RECRUITER` role).
    - `PATCH /api/jobs/:jobId` — Update job description, requirements, salary, or status (`ACTIVE`, `CLOSED`, `DRAFT`).
    - `DELETE /api/jobs/:jobId` — Archive/delete job posting.
    - `GET /api/companies/:companyId/jobs` — List all jobs posted by a company.

### ⏰ 5. Automated Job Ingestion Background Cron (Module: `job-ingestion`)
- **Missing:**
  - Cron service (`node-cron`) to run `JobIngestionService` periodically (e.g. every 12 hours) across configured search keywords, automatically updating MongoDB with fresh job postings without manual API calls.

### 🔐 6. OAuth & Email Transport Configuration (Module: `auth`)
- **Missing:**
  - Social login plugins in Better Auth for Google and GitHub OAuth.
  - Real email delivery service (SMTP / Resend) for password reset tokens and email verification links.

### 🔔 7. In-App Notifications Engine (Module: `notifications`)
- **Missing:**
  - `NotificationModel` and `NotificationService` storing system events:
    - Application status changed by recruiter (`SHORTLISTED`, `INTERVIEW_SCHEDULED`).
    - New high-match job available.
    - Career plan milestone reached.
  - Endpoints:
    - `GET /api/notifications` — Get user notifications (with unread count).
    - `PATCH /api/notifications/:id/read` — Mark single notification as read.
    - `PATCH /api/notifications/mark-all-read` — Mark all as read.

### 🧪 8. Automated Test Pipeline (DevOps)
- **Missing:**
  - Vitest / Jest test runner setup with `npm test` script.
  - Integration test suites for auth, jobs, resumes, applications, and recruiter flows.

---

## 5. Frontend Integration Gap (Work Required by Frontend Devs)

The Next.js client already has beautiful UI pages, but they are currently disconnected from the finished backend. Here is the exact mapping of backend APIs to frontend views that must be wired:

| Frontend Page / Component | Current Frontend State | Finished Backend API Ready to Connect |
| :--- | :--- | :--- |
| `/dashboard/job-center` | Using `mockJobListings` | `GET /api/jobs` (search, pagination, filters) |
| `/dashboard/job-center` (Apply Modal) | Appending to in-memory state | `POST /api/applications` |
| `/dashboard/job-center` (Applied Tracker) | Using `mockJobApplications` | `GET /api/applications` & `PATCH /.../withdraw` |
| `/dashboard/resume-intelligence` | "Simulate Upload" button | `POST /api/resumes/upload` & `GET /api/resumes` |
| `/dashboard/profile` | Modal buttons only show toasts | `PATCH /api/profile/me/*` (`skills`, `education`, `links`) |
| `/dashboard/settings` | Forms submit local toast only | `PATCH /api/profile/me` & Better Auth update |
| `/dashboard/recruiter` (To be created) | Page does not exist | `GET /api/recruiter/applications` & `PATCH /status` |

---

## 6. Developer Workstream Allocation

To maximize productivity and eliminate dependency bottlenecks:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                       DEVELOPER WORKSTREAM DIVISION                        │
├──────────────────────────────────────┬─────────────────────────────────────┤
│   DEVELOPER 1: Backend AI & Services │   DEVELOPER 2: APIs & Frontend Wire │
├──────────────────────────────────────┼─────────────────────────────────────┤
│ • Automated Test Suite Setup (Vitest)│ • Local Dev Proxy Fix (.env.local)  │
│ • Resume PDF Text Extraction         │ • Job Center Live API Integration   │
│ • AI ATS Scoring Engine              │ • Resume Upload Live API Integration│
│ • Skill Gap & Career Plan Engine     │ • Application Flow Live Integration │
│ • Employability Index Service        │ • Profile Mutation Modals & Wire    │
│ • OAuth & Password Reset API         │ • Employer Job CRUD Endpoints       │
│ • Job Ingestion Cron Background Job  │ • Recruiter Dashboard Views         │
└──────────────────────────────────────┴─────────────────────────────────────┘
```

---

## 7. Developer 1 Task Matrix (Backend AI, Services & Security)

Developer 1 will focus on the **core backend intelligence, algorithms, testing, and authentication features**.

### 📋 Task Breakdown for Developer 1

```text
========================================================================================
TASK ID | MILESTONE         | MODULE        | TYPE     | PRIORITY | ESTIMATE | DEPENDENCY
========================================================================================
BE-101  | Test Suite Setup  | core/testing  | DevOps   | P0       | 4h       | None
BE-102  | Resume Text Parser| resume        | Backend  | P1       | 8h       | None
BE-103  | AI ATS Scorer     | resume        | AI/Score | P1       | 8h       | BE-102
BE-104  | Skill Gap Engine  | career-plan   | Backend  | P1       | 8h       | None
BE-105  | Career Plan API   | career-plan   | API      | P1       | 6h       | BE-104
BE-106  | Employability Svc | employability | AI/Score | P2       | 8h       | BE-103, BE-104
BE-107  | OAuth Providers   | core/auth     | Security | P2       | 5h       | None
BE-108  | Password Reset API| core/auth     | Backend  | P2       | 4h       | None
BE-109  | Ingestion Cron    | job-ingestion | Cron/Job | P2       | 4h       | None
BE-110  | Notifications API | notifications | API      | P2       | 6h       | None
========================================================================================
```

#### Detailed Specifications:

* **`BE-101` — Test Suite Setup (Vitest + Supertest):**
  - Install `vitest` and `supertest` in `/server`. Configure `vitest.config.ts` and add `npm test` script.
  - Migrate and verify existing test specs in `server/src/modules/application/__tests__` and `resume/__tests__`.
* **`BE-102` — Resume PDF Text Extraction Service:**
  - Install `pdf-parse`. Create `ResumeParserService` in `server/src/modules/resume` to extract raw text and basic metadata upon upload.
  - Store extracted text and keywords in `ResumeModel.extractedData`.
* **`BE-103` — AI ATS Scoring & Feedback Engine:**
  - Create `AtsScoringService` evaluating extracted resume text for keyword density, formatting, and action verbs.
  - Expose `GET /api/resumes/:resumeId/analysis` returning score breakdown, missing skills, and tips.
* **`BE-104` — Skill Gap Calculation Engine:**
  - Create `SkillGapService` in `server/src/modules/career-plan`.
  - Compare candidate profile skills against required competencies in `RoleModel` and calculate matched/missing skills.
* **`BE-105` — Career Plan API Endpoints:**
  - Expose `POST /api/career-plan/generate`, `GET /api/career-plan/me`, and `GET /api/roles`.
  - Persist output in `CareerPlanModel` and return structured gaps data.
* **`BE-106` — Employability Index Scoring Engine:**
  - Create `EmployabilityService` calculating a weighted composite score (0–100) from profile completeness, ATS score, and skill gaps.
  - Expose `GET /api/employability-index/me`.
* **`BE-107` — Better Auth OAuth Integration (Google & GitHub):**
  - Add Google and GitHub OAuth providers in `server/src/core/auth/auth.ts`.
* **`BE-108` — Real Password Reset & Email Verification Transport:**
  - Configure SMTP / Resend email adapter in Better Auth to dispatch actual password reset tokens and verification links.
* **`BE-109` — Job Ingestion Cron Job:**
  - Add `node-cron` job running `JobIngestionService.ingestJobs()` automatically every 12 hours.
* **`BE-110` — In-App Notifications API:**
  - Create `NotificationModel`, `NotificationService`, and routes (`GET /api/notifications`, `PATCH /:id/read`).

---

## 8. Developer 2 Task Matrix (Backend APIs & Frontend Integration)

Developer 2 will focus on **connecting the completed backend APIs to the Next.js UI, building client services, and creating missing recruiter employer features**.

### 📋 Task Breakdown for Developer 2

```text
========================================================================================
TASK ID | MILESTONE         | MODULE        | TYPE     | PRIORITY | ESTIMATE | DEPENDENCY
========================================================================================
FE-201  | Dev Proxy Fix     | client/config | DevOps   | P0       | 1h       | None
FE-202  | Job Client Service| client/jobs   | Frontend | P0       | 4h       | FE-201
FE-203  | Job Center Wiring | client/jobs   | Frontend | P0       | 6h       | FE-202
FE-204  | Resume Client Svc | client/resume | Frontend | P0       | 4h       | FE-201
FE-205  | Resume Upload UI  | client/resume | Frontend | P0       | 5h       | FE-204
FE-206  | Apply Client Svc  | client/apply  | Frontend | P0       | 4h       | FE-201
FE-207  | Apply Modal Wire  | client/apply  | Frontend | P0       | 5h       | FE-206, FE-205
FE-208  | Profile Modals    | client/profile| Frontend | P1       | 6h       | FE-201
FE-209  | Employer Job API  | server/jobs   | Backend  | P1       | 6h       | None
FE-210  | Recruiter UI Base | client/recruit| Frontend | P1       | 8h       | FE-201
FE-211  | Recruiter Review  | client/recruit| Frontend | P1       | 8h       | FE-210
FE-212  | Skill Gap UI Wire | client/career | Frontend | P1       | 6h       | BE-105 (Dev 1)
========================================================================================
```

#### Detailed Specifications:

* **`FE-201` — Configure Client Dev Proxy (`.env.local`):**
  - Add `BACKEND_INTERNAL_URL=http://localhost:5000` in `client/.env.local` so local Next.js `/api/*` rewrites point to local Express.
* **`FE-202` — Build Job Client Service (`job.service.ts`):**
  - Create `client/services/job.service.ts` with typed methods for `searchJobs()` and `getJobById()` calling `GET /api/jobs`.
* **`FE-203` — Wire Smart Job Center UI to Live Jobs API:**
  - Replace `mockJobListings` in `/dashboard/job-center` with live data from `job.service.ts`. Connect pagination and search queries.
* **`FE-204` — Build Resume Client Service (`resume.service.ts`):**
  - Create `client/services/resume.service.ts` for file upload (`FormData`), resume list, download, and delete.
* **`FE-205` — Wire Live Resume Upload in Resume Intelligence UI:**
  - Connect file dropzone on `/dashboard/resume-intelligence` to `resumeService.uploadResume()`. Display user's actual uploaded files.
* **`FE-206` — Build Application Client Service (`application.service.ts`):**
  - Create `client/services/application.service.ts` for `applyToJob()`, `getMyApplications()`, and `withdrawApplication()`.
* **`FE-207` — Wire Job Apply Modal & Applications Tracker:**
  - Connect `ApplyJobModal` in Job Center to submit real applications. Populate "Applied Jobs" tab with live data from `GET /api/applications`.
* **`FE-208` — Build Candidate Profile Mutation Modals:**
  - Create dialog modals for "Add Skill", "Add Education", "Add Experience", and "Edit Links" in `/dashboard/profile`, connecting them to `profileService` PATCH endpoints.
* **`FE-209` — Backend Employer Job Posting CRUD (`/api/jobs`):**
  - Add `POST /api/jobs`, `PATCH /api/jobs/:id`, and `DELETE /api/jobs/:id` in `server/src/modules/jobs` with authorization check for company members.
* **`FE-210` — Build Recruiter Dashboard Page:**
  - Create `client/app/dashboard/recruiter/page.tsx` and `recruiter.service.ts` to list applications submitted to the user's company jobs via `GET /api/recruiter/applications`.
* **`FE-211` — Build Candidate Review & Status Transition UI:**
  - Create recruiter application detail drawer allowing status changes (`SHORTLISTED`, `INTERVIEW_SCHEDULED`, `REJECTED`) and resume streaming.
* **`FE-212` — Wire Skill Gap UI to Live Career Plan API:**
  - Connect `/dashboard/skill-gap-analysis` to `GET /api/career-plan/me` once Developer 1 finishes `BE-105`.

---

## 9. Sprint-by-Sprint Execution Roadmap

### 🏃 SPRINT 1 (Week 1) — Core Pipeline Integration & Testing
* **Sprint Goal:** Enable real job searching, live PDF resume uploading, candidate job applications, and automated backend testing.
* **Developer 1:**
  - `BE-101` (Vitest test suite setup)
  - `BE-102` (Resume PDF text parser)
  - `BE-103` (AI ATS scoring engine)
* **Developer 2:**
  - `FE-201` (Dev proxy config fix)
  - `FE-202` & `FE-203` (Live Job Center API integration)
  - `FE-204` & `FE-205` (Live Resume Upload integration)
* **Sprint 1 Outcome:** Users can search real MongoDB jobs, upload real PDF resumes to the server, and receive an automated test pass on `npm test`.

---

### 🏃 SPRINT 2 (Week 2) — Applications, Career Intelligence & Recruiter Base
* **Sprint Goal:** Complete end-to-end job application lifecycle, live candidate profile updates, and skill gap intelligence.
* **Developer 1:**
  - `BE-104` (Skill gap calculation engine)
  - `BE-105` (Career plan API endpoints)
  - `BE-107` (OAuth Google & GitHub integration)
  - `BE-108` (Password reset & email transport)
* **Developer 2:**
  - `FE-206` & `FE-207` (Live job apply modal & application tracker)
  - `FE-208` (Profile mutation modals: skills, education, experience)
  - `FE-209` (Employer job creation & management API)
  - `FE-212` (Wire Skill Gap UI to live API)
* **Sprint 2 Outcome:** Candidates can submit real applications to jobs, update profile sections dynamically, view real skill gap analyses, and log in with OAuth.

---

### 🏃 SPRINT 3 (Week 3) — Recruiter Portal, Employability & Automation
* **Sprint Goal:** Build the employer candidate review pipeline, employability index scoring, and background job ingestion.
* **Developer 1:**
  - `BE-106` (Employability index composite scoring service)
  - `BE-109` (Job ingestion cron worker)
  - `BE-110` (In-app notifications API)
* **Developer 2:**
  - `FE-210` (Recruiter dashboard & application directory)
  - `FE-211` (Candidate review drawer, resume viewer, status transitions)
* **Sprint 3 Outcome:** Full two-sided hiring workflow active: candidates apply to jobs → recruiters review resumes and update candidate hiring status in real time.

---

### 🏃 SPRINT 4 (Week 4) — Quality Assurance, Hardening & Production Launch
* **Sprint Goal:** End-to-end verification, security hardening, performance optimization, and production deployment.
* **Joint Tasks:**
  - Load testing & database index optimization.
  - Responsive mobile testing & cross-browser QA.
  - Production deployment validation on Railway (backend) and Vercel (frontend).
* **Launch Outcome:** Complete, production-ready SKILLEZO platform with 0 mock data dependencies.
