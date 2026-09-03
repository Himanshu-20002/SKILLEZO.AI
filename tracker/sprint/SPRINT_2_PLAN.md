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

- [x] **`FE-209` — Resume Selector Dropdown & Quick Preview** (1h 15m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Wire `resumeService.getUserResumes()` into modal dropdown, auto-selecting default resume and displaying filename and upload date.
  - **Target Files:** `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Candidate can switch between multiple uploaded resumes.

- [x] **`FE-210` — Cover Letter Editor & Inline Resume Upload** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Add optional cover letter textarea and an embedded upload dropzone for candidates uploading a fresh resume on the fly.
  - **Target Files:** `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Uploading a new PDF from modal immediately selects it for submission.

- [x] **`FE-211` — Application Submission Handler & Toast Feedback** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Wire modal submit button to `applicationService.applyToJob()`, showing loading spinner and success toast.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`, `client/components/dashboard/job-center/JobApplyModal.tsx`.
  - **Verify:** Submitting creates application in MongoDB and closes modal.

---

### 🗓️ DAY 3 — Real-Time Job Card Sync & Applied State

- [x] **`BE-203` — Candidate Applied Job IDs Batch Endpoint** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Create `GET /api/applications/my-job-ids` returning a lightweight array of job IDs the candidate has applied to.
  - **Target Files:** `server/src/modules/application/application.controller.ts`, `server/src/modules/application/application.routes.ts`.
  - **Verify:** Endpoint returns JSON array of string IDs for authenticated user.

- [x] **`FE-212` — Batch Applied State Cache in Job Center** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Fetch applied job IDs on `/dashboard/job-center` mount to populate an in-memory `Set<string>` of applied jobs.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`.
  - **Verify:** Applied status loads efficiently without N+1 individual queries.

- [x] **`FE-213` — Dynamic "✓ Applied" Badge on Job Cards** (1h 15m) — *COMPLETED (02-Sep-2026)*
  - **Action:** In `JobCard.tsx`, check if `job._id` is in applied set; replace "Apply Now" button with a sleek `✓ Applied` pill badge.
  - **Target Files:** `client/components/dashboard/job-center/JobCard.tsx`.
  - **Verify:** Applied jobs visually reflect status and disable duplicate submissions.

- [x] **`FE-214` — Quick Application Summary Drawer on Job Click** (1h 00m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Clicking on an applied job card opens a side drawer displaying submission timestamp, resume used, and current review status.
  - **Target Files:** `client/components/dashboard/job-center/JobDetailsDrawer.tsx`.
  - **Verify:** Drawer shows real application submission metadata.

---

### 🗓️ DAY 4 — Application Lifecycle (Withdrawal) & QA

- [x] **`BE-204` — Application Withdrawal Endpoint** (45m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Ensure `PATCH /api/applications/:id/withdraw` updates status to `withdrawn` in MongoDB and logs status history.
  - **Target Files:** `server/src/modules/application/application.service.ts`.
  - **Verify:** Withdrawing application updates status in MongoDB.

- [x] **`FE-215` — In-Place Application Withdrawal in Job Center** (30m) — *COMPLETED (02-Sep-2026)*
  - **Action:** Add a lightweight "Withdraw" button on application cards in the Job Center Applied Tab with confirmation toast.
  - **Target Files:** `client/components/dashboard/job-center/AppliedJobsTracker.tsx`, `client/app/dashboard/job-center/page.tsx`.
  - **Verify:** Withdrawn applications instantly update their status badge.


## 🏆 Sprint 2 Deliverable Checklist

- [x] Candidates can apply to real MongoDB jobs with their uploaded PDF resume.
- [x] Job cards reflect `Applied ✓` status and block duplicate submissions.
- [x] Job Center "Applied" tab displays live status pipeline for all submitted applications.
- [x] Job details drawer shows submission date, resume used, and review status.
- [x] Candidates can withdraw an active application directly from the Applied tab.
- [x] 0 TypeScript errors on client and server (30/30 unit tests passed).
