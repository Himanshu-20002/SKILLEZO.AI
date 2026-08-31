# 🛠️ SKILLEZO AI — Developer 1 Task Backlog (Backend & AI)

> **Owner:** Developer 1  
> **Domain:** Server Core, Mongoose Repositories, AI Intelligence Services, Authentication & Testing  
> **Working Directory:** `/server`  

---

## 📋 Task Summary

| Task ID | Milestone | Task Title | Module | Est. | Priority | Status |
| :-: | :--- | :--- | :--- | :-: | :-: | :-: |
| **BE-101** | M1: Core Integration | Setup Vitest Automated Test Suite | `core/testing` | 45m | P0 | 🟢 **Done** |
| **BE-102** | M1: Core Integration | Resume PDF Text Extraction Service | `modules/resume` | 1h | P1 | ⚪ Todo |
| **BE-103** | M1: Core Integration | AI ATS Scoring & Feedback Engine | `modules/resume` | 1.5h | P1 | ⚪ Todo |
| **BE-104** | M2: Applications & AI | Skill Gap Calculation Engine | `modules/career-plan` | 1.5h | P1 | ⚪ Todo |
| **BE-105** | M2: Applications & AI | Career Plan API Endpoints (`/api/career-plan`)| `modules/career-plan` | 1h | P1 | ⚪ Todo |
| **BE-106** | M3: Recruiter & AI | Employability Index Scoring Engine | `modules/employability` | 1.5h | P2 | ⚪ Todo |
| **BE-107** | M3: Recruiter & AI | Better Auth OAuth Providers (Google/GitHub) | `core/auth` | 1h | P2 | ⚪ Todo |
| **BE-108** | M3: Recruiter & AI | Real Password Reset & Email Transport | `core/auth` | 45m | P2 | ⚪ Todo |
| **BE-109** | M3: Recruiter & AI | Job Ingestion Background Cron & Lifecycle Engine | `modules/job-ingestion`| 1h | P2 | 🟢 **Done** |
| **BE-110** | M3: Recruiter & AI | In-App Notifications API | `modules/notifications`| 1h | P2 | ⚪ Todo |

---

## 🔍 Detailed Task Specifications

### `BE-101` — Setup Vitest Automated Test Suite
- **Priority:** P0 | **Estimate:** 4 hours | **Status:** 🟢 **Done** (31-Aug-2026)
- **Target Files:**
  - `server/package.json`
  - `server/vitest.config.mts`
  - `server/src/core/utils/skill-extractor.spec.ts`
  - `server/src/core/middleware/validate.middleware.spec.ts`
  - `server/src/modules/jobs/jobs.service.spec.ts`
  - `server/src/routes/health.routes.spec.ts`
  - `server/src/modules/application/__tests__/application.service.spec.ts`
  - `server/src/modules/resume/__tests__/resume.service.spec.ts`
- **Specification:** Install `vitest`, `supertest`, and `vite-tsconfig-paths`. Configure `vitest.config.mts` with `@/` path alias. Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `package.json`.
- **Acceptance Criteria:**
  - [x] `npm test` runs from `/server` with 100% green exit code.
  - [x] Unit tests cover core services, middleware, and route integration. existing test specs.
  - [x] All unit and repository mock tests pass with green exit code 0.

---

### `BE-102` — Resume PDF Text Extraction Service
- **Priority:** P1 | **Estimate:** 8 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `server/src/modules/resume/resume.parser.ts`
  - `server/src/modules/resume/resume.service.ts`
  - `server/src/database/models/Resume.model.ts`
- **Specification:** Install `pdf-parse`. Create `ResumeParserService` to extract raw text, email, phone number, and candidate skill keywords from uploaded PDF files. Update `ResumeService.uploadResume()` to trigger parsing upon upload and persist structured text in `ResumeModel.extractedData`.
- **Acceptance Criteria:**
  - [ ] Uploading a resume PDF automatically extracts text into MongoDB.
  - [ ] `extractedData.rawText` and `extractedData.skills` are populated.

---

### `BE-103` — AI ATS Scoring & Feedback Engine
- **Priority:** P1 | **Estimate:** 8 hours | **Status:** ⚪ Todo
- **Dependency:** `BE-102`
- **Target Files:**
  - `server/src/modules/resume/ats.service.ts`
  - `server/src/modules/resume/resume.controller.ts`
  - `server/src/modules/resume/resume.routes.ts`
- **Specification:** Implement `AtsScoringService` to evaluate extracted resume text against ATS scoring criteria (keyword density, section headers, bullet formatting, impact metrics). Expose endpoint `GET /api/resumes/:resumeId/analysis`.
- **Acceptance Criteria:**
  - [ ] `GET /api/resumes/:resumeId/analysis` returns `{ overallScore, atsScore, impactScore, brevityScore, keywords, missingSkills, recommendations }`.
  - [ ] Authenticated candidate can only view analysis for their own resumes.

---

### `BE-104` — Skill Gap Calculation Engine
- **Priority:** P1 | **Estimate:** 8 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `server/src/modules/career-plan/skill-gap.service.ts`
  - `server/src/database/models/CareerPlan.model.ts`
  - `server/src/database/models/Competency.model.ts`
- **Specification:** Implement `SkillGapService` in `server/src/modules/career-plan`. Compare candidate profile skills against required skills in `RoleModel` / `CompetencyModel`, identifying matched skills, missing competencies, and calculating a role readiness score.
- **Acceptance Criteria:**
  - [ ] Returns categorized skills: `matchedSkills`, `missingSkills`, `improvementSkills`, and `readinessScore` (0–100%).

---

### `BE-105` — Career Plan API Endpoints (`/api/career-plan`)
- **Priority:** P1 | **Estimate:** 6 hours | **Status:** ⚪ Todo
- **Dependency:** `BE-104`
- **Target Files:**
  - `server/src/modules/career-plan/career-plan.repository.ts`
  - `server/src/modules/career-plan/career-plan.controller.ts`
  - `server/src/modules/career-plan/career-plan.routes.ts`
  - `server/src/server.ts`
- **Specification:** Create repository, controller, and routes for career plans:
  - `POST /api/career-plan/generate` — Generate & persist plan for target role.
  - `GET /api/career-plan/me` — Retrieve active career plan.
  - `GET /api/roles` — List available industry target roles.
- **Acceptance Criteria:**
  - [ ] Authenticated user can generate and retrieve their personalized career plan stored in `CareerPlanModel`.

---

### `BE-106` — Employability Index Scoring Engine
- **Priority:** P2 | **Estimate:** 8 hours | **Status:** ⚪ Todo
- **Dependency:** `BE-103`, `BE-104`
- **Target Files:**
  - `server/src/modules/employability/employability.service.ts`
  - `server/src/modules/employability/employability.routes.ts`
- **Specification:** Create `EmployabilityService` calculating a weighted index: Profile completeness (20%) + Resume ATS score (30%) + Role match score (30%) + Experience/projects (20%). Expose `GET /api/employability-index/me`.
- **Acceptance Criteria:**
  - [ ] Returns overall score, percentile ranking, strengths, and top 3 priority actions.

---

### `BE-107` — Better Auth OAuth Providers (Google & GitHub)
- **Priority:** P2 | **Estimate:** 5 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `server/src/core/auth/auth.ts`
  - `server/src/core/config/env.ts`
- **Specification:** Configure official Better Auth Google & GitHub social providers using client ID/secrets from environment variables.
- **Acceptance Criteria:**
  - [ ] Visiting `/api/auth/sign-in/social?provider=google` initiates OAuth flow.

---

### `BE-108` — Real Password Reset & Email Transport
- **Priority:** P2 | **Estimate:** 4 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `server/src/core/auth/auth.ts`
  - `server/src/core/utils/email.ts`
- **Specification:** Wire SMTP / Resend email provider into Better Auth to send real password reset tokens and verification emails.
- **Acceptance Criteria:**
  - [ ] Requesting password reset sends email with valid reset link/token.

---

### `BE-109` — Job Ingestion Background Cron & Lifecycle Engine
- **Priority:** P2 | **Estimate:** 4 hours | **Status:** 🟢 **Done** (31-Aug-2026)
- **Target Files:**
  - `server/src/modules/job-ingestion/job-ingestion.cron.ts`
  - `server/src/database/models/Job.model.ts`
  - `server/src/database/repositories/job/JobRepository.ts`
  - `server/src/modules/jobs/jobs.controller.ts`
  - `server/src/server.ts`
- **Specification:** Install `node-cron`. Schedule background job ingestion every 12 hours across core engineering tracks. Implement 14-day TTL index on `importedAt` and real-time outbound link health check verifier (`GET /api/jobs/:id/redirect`).
- **Acceptance Criteria:**
  - [x] Cron automatically triggers every 12 hours without manual intervention.
  - [x] 14-day TTL index automatically purges expired external jobs from MongoDB.
  - [x] Outbound redirect endpoint verifies link health and auto-closes dead 404 postings.

---

### `BE-110` — In-App Notifications API
- **Priority:** P2 | **Estimate:** 6 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `server/src/database/models/Notification.model.ts`
  - `server/src/modules/notifications/notification.service.ts`
  - `server/src/modules/notifications/notification.routes.ts`
- **Specification:** Create notification system storing recruiter status changes and career milestones. Endpoints: `GET /api/notifications` and `PATCH /api/notifications/:id/read`.
- **Acceptance Criteria:**
  - [ ] Recruiter status update automatically creates notification for candidate.
