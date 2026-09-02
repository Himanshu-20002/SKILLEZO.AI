# 🏃 SKILLEZO AI — Sprint 2 Execution Plan

> **Sprint Goal:** Connect live MongoDB jobs and candidate resumes into a complete end-to-end Job Application & Tracking system.  
> **Duration:** 5 Working Days  
> **Sprint Status:** ⚪ **PLANNED / READY TO LAUNCH**  
> **Core Theme:** **"Search Live Jobs ➔ Apply with Uploaded Resume ➔ Track Applications in Real Time"**

---

## 🎯 Sprint 2 Daily Structure & Core Workflow

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           END-TO-END APPLICATION WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. BROWSE: Candidate searches real MongoDB jobs on /dashboard/job-center                │
│ 2. ONE-CLICK APPLY: Clicks "Apply Now" to open live Application Modal                   │
│ 3. RESUME PICKER: Modal auto-selects default uploaded resume or lets candidate switch   │
│ 4. SUBMIT: Submits application to POST /api/applications with instant feedback          │
│ 5. APPLIED BADGE: Job card updates immediately to "✓ Applied" (disables duplicates)   │
│ 6. TRACKER: /dashboard/applications lists live status pipeline & allows withdrawal      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Day-by-Day Sprint Schedule (4 Tasks Per Day)

### 🗓️ DAY 1 — Application Core & Data Contracts

- [x] **`BE-201` — Application Security & Resume Ownership Validation** (1h 15m) — *COMPLETED (01-Sep-2026)*
  - **Action:** Ensure `POST /api/applications` validates that the attached `resumeId` exists in storage and belongs strictly to the authenticated `userId`.
  - **Target Files:** `server/src/modules/application/application.service.ts`.
  - **Verify:** Submitting with an unowned `resumeId` returns `403 FORBIDDEN`.

- [x] **`BE-202` — Duplicate Application Prevention & Active Job Check** (1h 00m) — *COMPLETED (01-Sep-2026)*
  - **Action:** Verify target job is `active` and enforce unique `(userId, jobId)` constraint returning error code `DUPLICATE_APPLICATION`.
  - **Target Files:** `server/src/modules/application/application.service.ts`, `server/src/database/models/Application.model.ts`.
  - **Verify:** Second application to the same job fails gracefully with descriptive message.

- [x] **`FE-206` — Application TypeScript Interfaces & Data Contracts** (0h 45m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Define `ApplicationRecord`, `ApplicationStatus`, `ApplicationSubmissionDTO`, and query filter types in `client/types/application.ts`.
  - **Target Files:** `client/types/application.ts`.
  - **Verify:** Types match backend Mongoose schema and compile cleanly.

- [x] **`FE-207` — Build Application Client Service (`application.service.ts`)** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Implement `applyToJob()`, `getMyApplications()`, `getApplicationById()`, and `withdrawApplication()` using `client/lib/api.ts`.
  - **Target Files:** `client/services/application.service.ts`.
  - **Verify:** `npx tsc --noEmit` compiles with 0 errors.

---

### 🗓️ DAY 2 — "Apply with Resume" Modal & Submission Flow

- [x] **`FE-208` — Create Apply Modal UI Shell & Job Summary Header** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Build `client/components/dashboard/job-center/JobApplyModal.tsx` showing job title, company logo, location, type, and salary.
  - **Target Files:** `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Modal opens cleanly from Job Center with responsive backdrop.

- [ ] **`FE-209` — Resume Selector Dropdown & Quick Preview** (1h 15m)
  - **Action:** Wire `resumeService.getUserResumes()` into modal dropdown, auto-selecting default resume and displaying filename and upload date.
  - **Target Files:** `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Candidate can switch between multiple uploaded resumes.

- [ ] **`FE-210` — Cover Letter Editor & Inline Resume Upload** (1h 00m)
  - **Action:** Add optional cover letter textarea and an embedded upload dropzone for candidates uploading a fresh resume on the fly.
  - **Target Files:** `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Uploading a new PDF from modal immediately selects it for submission.

- [ ] **`FE-211` — Application Submission Handler & Toast Feedback** (1h 00m)
  - **Action:** Wire modal submit button to `applicationService.applyToJob()`, showing loading spinner and success toast.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`, `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Submitting creates application in MongoDB and closes modal.

---

### 🗓️ DAY 3 — Real-Time Job Card Sync & Applied State

- [ ] **`BE-203` — Candidate Applied Job IDs Batch Endpoint** (1h 00m)
  - **Action:** Create `GET /api/applications/my-job-ids` returning a lightweight array of job IDs the candidate has applied to.
  - **Target Files:** `server/src/modules/application/application.controller.ts`, `server/src/modules/application/application.routes.ts`.
  - **Verify:** Endpoint returns JSON array of string IDs for authenticated user.

- [ ] **`FE-212` — Batch Applied State Cache in Job Center** (1h 00m)
  - **Action:** Fetch applied job IDs on `/dashboard/job-center` mount to populate an in-memory `Set<string>` of applied jobs.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`.
  - **Verify:** Applied status loads efficiently without N+1 individual queries.

- [ ] **`FE-213` — Dynamic "✓ Applied" Badge on Job Cards** (1h 15m)
  - **Action:** In `JobCard.tsx`, check if `job._id` is in applied set; replace "Apply Now" button with a sleek `✓ Applied` pill badge.
  - **Target Files:** `client/components/dashboard/job-center/JobCard.tsx`.
  - **Verify:** Applied jobs visually reflect status and disable duplicate submissions.

- [ ] **`FE-214` — Quick Application Summary Drawer on Job Click** (1h 00m)
  - **Action:** Clicking on an applied job card opens a side drawer displaying submission timestamp, resume used, and current review status.
  - **Target Files:** `client/components/dashboard/job-center/JobDetailsDrawer.tsx`.
  - **Verify:** Drawer shows real application submission metadata.

---

### 🗓️ DAY 4 — Live Application Tracker Dashboard (`/dashboard/applications`)

- [ ] **`FE-215` — Wire Application Tracker Page to Live Backend** (1h 15m)
  - **Action:** Replace `mockJobApplications` in `client/app/dashboard/applications/page.tsx` with live data from `applicationService.getMyApplications()`.
  - **Target Files:** `client/app/dashboard/applications/page.tsx`.
  - **Verify:** Page loads candidate's real applications from MongoDB.

- [ ] **`FE-216` — Status Pipeline Badges & Filter Tabs** (1h 00m)
  - **Action:** Implement filter tabs (`All`, `Active`, `Interviewing`, `Archived`) with badges for `Applied`, `Under Review`, `Shortlisted`, `Interview`, `Offered`, `Rejected`.
  - **Target Files:** `client/app/dashboard/applications/page.tsx`.
  - **Verify:** Filtering tabs accurately partitions applications by status.

- [ ] **`FE-217` — Attached Resume Viewer in Application Card** (1h 00m)
  - **Action:** Add "View Submitted Resume" button on each application card, opening the exact PDF snapshot in a new browser tab.
  - **Target Files:** `client/components/dashboard/applications/ApplicationCard.tsx`.
  - **Verify:** Clicking button opens authenticated PDF blob stream.

- [ ] **`FE-218` — Empty States, Search & Sorting Controls** (1h 00m)
  - **Action:** Add search input by company/title, sorting by applied date, and clean empty state with a "Browse Jobs" button.
  - **Target Files:** `client/app/dashboard/applications/page.tsx`.
  - **Verify:** Zero-state directs candidate directly to `/dashboard/job-center`.

---

### 🗓️ DAY 5 — Application Lifecycle Management & End-to-End QA

- [ ] **`BE-204` — Application Withdrawal Endpoint & Audit History** (1h 00m)
  - **Action:** Update `PATCH /api/applications/:id/withdraw` to record withdrawal timestamp, reason, and status transition history.
  - **Target Files:** `server/src/modules/application/application.service.ts`.
  - **Verify:** Withdrawing application updates status to `withdrawn` in MongoDB.

- [ ] **`FE-219` — Withdraw Application Modal & UI Update** (1h 00m)
  - **Action:** Add "Withdraw Application" button with confirmation prompt, updating status in UI immediately without page reload.
  - **Target Files:** `client/app/dashboard/applications/page.tsx`.
  - **Verify:** Withdrawing moves application to Archived/Withdrawn tab.

- [ ] **`BE-205` — Automated Application Module Unit Tests** (1h 15m)
  - **Action:** Create unit tests in `server/tests/unit/modules/application.service.spec.ts` testing apply, duplicate rejection, and withdrawal.
  - **Target Files:** `server/tests/unit/modules/application.service.spec.ts`.
  - **Verify:** `npm test` runs with 100% green test suite.

- [ ] **`QA-201` — Full End-to-End User Journey Smoke Test** (1h 15m)
  - **Action:** Validate complete workflow:
    1. Upload resume in `/dashboard/resume-intelligence`.
    2. Browse real jobs in `/dashboard/job-center`.
    3. Click "Apply Now", select resume, and submit.
    4. Verify card switches to `✓ Applied`.
    5. Navigate to `/dashboard/applications` to view live status pipeline and test withdrawal.
    6. Verify `npm test` and `npx tsc --noEmit` have 0 errors.
  - **Verify:** 100% functional user journey with 0 mock dependencies.

---

## 🏆 Sprint 2 Deliverable Checklist

- [ ] Candidates can apply to real MongoDB jobs with their uploaded PDF resume.
- [ ] Job cards reflect `✓ Applied` status and block duplicate submissions.
- [ ] `/dashboard/applications` displays live status pipeline for all submitted applications.
- [ ] Candidates can view the exact resume used for each application and withdraw if needed.
- [ ] 0 TypeScript errors and 100% passing automated backend unit tests.
