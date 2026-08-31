# 🎨 SKILLEZO AI — Developer 2 Task Backlog (Frontend & UI Integration)

> **Owner:** Developer 2  
> **Domain:** Next.js Client, UI Services Layer, Component Wiring, Modals, Recruiter Dashboard  
> **Working Directory:** `/client`  

---

## 📋 Task Summary

| Task ID | Milestone | Task Title | Target View / Service | Est. | Priority | Status |
| :-: | :--- | :--- | :--- | :-: | :-: | :-: |
| **FE-201** | M1: Core Integration | Configure Dev Proxy in `.env.local` | `client/.env.local` | 1h | P0 | 🟢 **Done** |
| **FE-202** | M1: Core Integration | Build Job Client Service (`job.service.ts`)| `client/services` | 4h | P0 | 🟢 **Done** |
| **FE-203** | M1: Core Integration | Wire Smart Job Center UI to Live Jobs API | `/dashboard/job-center`| 6h | P0 | ⚪ Todo |
| **FE-204** | M1: Core Integration | Build Resume Client Service (`resume.service.ts`)| `client/services` | 4h | P0 | ⚪ Todo |
| **FE-205** | M1: Core Integration | Wire Live Resume Upload in UI | `/resume-intelligence` | 5h | P0 | ⚪ Todo |
| **FE-206** | M2: Applications & AI | Build Application Client Service | `client/services` | 4h | P0 | ⚪ Todo |
| **FE-207** | M2: Applications & AI | Wire Job Apply Modal & Tracker to Live API | `/dashboard/job-center`| 5h | P0 | ⚪ Todo |
| **FE-208** | M2: Applications & AI | Build Candidate Profile Mutation Modals | `/dashboard/profile` | 6h | P1 | ⚪ Todo |
| **FE-209** | M2: Applications & AI | Backend Employer Job Posting CRUD | `server/src/modules/jobs`| 6h | P1 | ⚪ Todo |
| **FE-210** | M3: Recruiter Portal | Build Recruiter Dashboard Views | `/dashboard/recruiter` | 8h | P1 | ⚪ Todo |
| **FE-211** | M3: Recruiter Portal | Build Candidate Review & Status Drawer | `/dashboard/recruiter` | 8h | P1 | ⚪ Todo |
| **FE-212** | M2: Applications & AI | Wire Skill Gap UI to Live API | `/skill-gap-analysis` | 6h | P1 | ⚪ Todo |
| **FE-213** | M3: Recruiter Portal | Wire Real Password Reset Screens | `/(auth)/forgot-password`| 4h | P2 | ⚪ Todo |
| **FE-214** | M3: Recruiter Portal | Wire Live Notifications Center | `/dashboard/notifications`| 4h | P2 | ⚪ Todo |

---

## 🔍 Detailed Task Specifications

### `FE-201` — Configure Client Dev Proxy (`.env.local`)
- **Priority:** P0 | **Estimate:** 1 hour | **Status:** 🟢 **Done** (31-Aug-2026)
- **Target Files:**
  - `client/.env.local`
  - `client/.env.example`
- **Specification:** Add `BACKEND_INTERNAL_URL=http://localhost:5000` to `client/.env.local`. Ensure `next.config.ts` rewrite proxy `/api/:path*` correctly routes relative requests to local Express during development.
- **Acceptance Criteria:**
  - [x] `fetch('/api/health')` from client reaches `http://localhost:5000/api/health`.

---

### `FE-202` — Build Job Client Service (`job.service.ts`)
- **Priority:** P0 | **Estimate:** 4 hours | **Status:** 🟢 **Done** (31-Aug-2026)
- **Dependency:** `FE-201`
- **Target Files:**
  - `client/services/job.service.ts`
  - `client/types/job-center.ts`
- **Specification:** Create `jobService` with typed methods:
  - `searchJobs(query: JobSearchQuery): Promise<PaginatedJobsResponse>` calling `GET /api/jobs`.
  - `getJobById(id: string): Promise<JobDetails>` calling `GET /api/jobs/:id`.
- **Acceptance Criteria:**
  - [x] Method returns typed live jobs matching backend `JobModel` structure.

---

### `FE-203` — Wire Smart Job Center UI to Live Jobs API
- **Priority:** P0 | **Estimate:** 6 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-202`
- **Target Files:**
  - `client/app/dashboard/job-center/page.tsx`
  - `client/components/dashboard/job-center/JobCard.tsx`
  - `client/components/dashboard/job-center/JobFilters.tsx`
- **Specification:** Replace static `mockJobListings` in `/dashboard/job-center` with live state fetched from `jobService.searchJobs()`. Connect search input debounce, category/salary filters, and pagination controls to query parameters.
- **Acceptance Criteria:**
  - [ ] Page renders live database jobs with loading skeleton and empty state.
  - [ ] Changing filters triggers fresh API request with correct results.

---

### `FE-204` — Build Resume Client Service (`resume.service.ts`)
- **Priority:** P0 | **Estimate:** 4 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-201`
- **Target Files:**
  - `client/services/resume.service.ts`
- **Specification:** Create `resumeService` with methods:
  - `uploadResume(file: File, title: string): Promise<ResumeRecord>` (uses `FormData`).
  - `getUserResumes(): Promise<ResumeRecord[]>` calling `GET /api/resumes`.
  - `getResumeById(id: string)` calling `GET /api/resumes/:id`.
  - `deleteResume(id: string)` calling `DELETE /api/resumes/:id`.
  - `setDefaultResume(id: string)` calling `PUT /api/resumes/:id/default`.
- **Acceptance Criteria:**
  - [ ] File upload sends multipart `FormData` and successfully uploads to server.

---

### `FE-205` — Wire Live Resume Upload in Resume Intelligence Page
- **Priority:** P0 | **Estimate:** 5 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-204`
- **Target Files:**
  - `client/app/dashboard/resume-intelligence/page.tsx`
  - `client/components/dashboard/resume-intelligence/ResumeUploader.tsx`
- **Specification:** Replace `onSimulateUpload` mock button with real file input and drag-and-drop handler calling `resumeService.uploadResume()`. List uploaded user resumes and allow setting default.
- **Acceptance Criteria:**
  - [ ] Uploading PDF saves file in backend and displays live file name, size, and upload date.

---

### `FE-206` — Build Application Client Service (`application.service.ts`)
- **Priority:** P0 | **Estimate:** 4 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-201`
- **Target Files:**
  - `client/services/application.service.ts`
- **Specification:** Implement `applicationService` calling `/api/applications`:
  - `applyToJob(jobId: string, resumeId: string, coverNote?: string)`
  - `getMyApplications(query?: { page?: number; status?: string })`
  - `withdrawApplication(id: string, reason?: string)`
- **Acceptance Criteria:**
  - [ ] All methods typed and error-handled with `ApiError`.

---

### `FE-207` — Wire Job Apply Modal & Applications Tracker
- **Priority:** P0 | **Estimate:** 5 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-206`, `FE-205`
- **Target Files:**
  - `client/app/dashboard/job-center/page.tsx`
  - `client/components/dashboard/job-center/ApplyJobModal.tsx`
  - `client/components/dashboard/job-center/AppliedJobsTracker.tsx`
- **Specification:** Update `ApplyJobModal` to let candidate pick an uploaded resume and submit to `applicationService.applyToJob()`. Update "Applied Jobs" tab to fetch and display live submissions from `getMyApplications()`.
- **Acceptance Criteria:**
  - [ ] Submitting application creates real record in MongoDB and shows up in Applied Jobs tab.

---

### `FE-208` — Build Candidate Profile Mutation Modals
- **Priority:** P1 | **Estimate:** 6 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-201`
- **Target Files:**
  - `client/app/dashboard/profile/page.tsx`
  - `client/components/dashboard/profile/EditProfileModal.tsx`
  - `client/components/dashboard/profile/AddSkillModal.tsx`
  - `client/components/dashboard/profile/AddEducationModal.tsx`
- **Specification:** Replace placeholder toasts on "Add Skill", "Add Education", "Add Experience", and "Edit Profile" with interactive modal dialogs connected to `profileService` PATCH endpoints.
- **Acceptance Criteria:**
  - [ ] Candidate can add skills, education, and edit bio with changes immediately saved to MongoDB.

---

### `FE-209` — Backend Employer Job Posting CRUD (`/api/jobs`)
- **Priority:** P1 | **Estimate:** 6 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `server/src/modules/jobs/jobs.controller.ts`
  - `server/src/modules/jobs/jobs.routes.ts`
  - `server/src/modules/jobs/jobs.validator.ts`
- **Specification:** Add employer job endpoints in backend: `POST /api/jobs` (create native job), `PATCH /api/jobs/:jobId` (update details/status), and `DELETE /api/jobs/:jobId` (archive job). Enforce company membership check.
- **Acceptance Criteria:**
  - [ ] Verified recruiter can post and update job listings for their company.

---

### `FE-210` — Build Recruiter Dashboard Views
- **Priority:** P1 | **Estimate:** 8 hours | **Status:** ⚪ Todo
- **Target Files:**
  - `client/app/dashboard/recruiter/page.tsx`
  - `client/services/recruiter.service.ts`
  - `client/components/dashboard/recruiter/RecruiterApplicationTable.tsx`
- **Specification:** Create `/dashboard/recruiter` page displaying paginated table of candidates who applied to the recruiter's company jobs using `GET /api/recruiter/applications`.
- **Acceptance Criteria:**
  - [ ] Recruiter can search applicants, filter by job, and see match scores.

---

### `FE-211` — Build Candidate Review & Status Drawer
- **Priority:** P1 | **Estimate:** 8 hours | **Status:** ⚪ Todo
- **Dependency:** `FE-210`
- **Target Files:**
  - `client/components/dashboard/recruiter/CandidateReviewDrawer.tsx`
- **Specification:** Build drawer component showing candidate snapshot, embedded resume PDF stream viewer, and status transition selector (`UNDER_REVIEW` → `SHORTLISTED` → `OFFERED` / `REJECTED`) calling `PATCH /api/recruiter/applications/:id/status`.
- **Acceptance Criteria:**
  - [ ] Status updates persist in database and reflect in candidate's live application tracker.

---

### `FE-212` — Wire Skill Gap UI to Live API
- **Priority:** P1 | **Estimate:** 6 hours | **Status:** ⚪ Todo
- **Dependency:** `BE-105` (Dev 1)
- **Target Files:**
  - `client/app/dashboard/skill-gap-analysis/page.tsx`
  - `client/services/career-plan.service.ts`
- **Specification:** Connect `/dashboard/skill-gap-analysis` to `GET /api/career-plan/me` and `GET /api/roles` to render dynamic radar charts and real missing skill gap lists.
- **Acceptance Criteria:**
  - [ ] Selecting different target roles updates skill gap analysis from live backend calculations.
