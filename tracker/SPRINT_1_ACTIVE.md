# 🏃 SKILLEZO AI — Sprint 1 Active Execution Plan

> **Sprint Goal:** Enable live job search, real PDF resume upload to backend storage, candidate job application foundation, and automated backend testing.  
> **Duration:** September 01, 2026 → September 05, 2026 (5 Working Days)  
> **Sprint Status:** 🟡 **IN PROGRESS**  

---

## 🎯 What to Do NEXT (Immediate Priority)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CURRENT ACTIVE PRIORITIES                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. DEVELOPER 1: Start BE-101 (Setup Vitest Automated Testing Suite)         │
│ 2. DEVELOPER 2: Start FE-204 (Build Resume Client Service resume.service.ts)│
│ 3. DEVELOPER 2: Start FE-205 (Wire Live Resume Upload in UI)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Completed Tasks in Sprint 1 (So Far)

* ✅ `FE-201`: Configure Client Dev Proxy (`.env.local`)
* ✅ `FE-202`: Build Job Client Service (`client/services/job.service.ts`)
* ✅ `FE-203`: Wire Smart Job Center UI to Live Jobs API (103 real MongoDB jobs)
* ✅ `BE-109`: Job Ingestion Background Cron & 3-Tier Lifecycle Engine (`node-cron` + 14-Day TTL)
* ✅ `BE-101`: Setup Vitest Automated Test Suite (`server/vitest.config.mts` — 18/18 passing)
* ✅ `FE-204`: Build Resume Client Service (`client/services/resume.service.ts`)

---

## 📅 Day-by-Day Sprint Schedule

### 🗓️ DAY 1 (Tuesday, Sep 01)

#### 🛠️ Developer 1 (Backend)
- [x] **`BE-101` — Setup Vitest Automated Test Suite** (4 hours) — *COMPLETED (31-Aug-2026)*
  - **Action:** Install `vitest`, `supertest`, and `vite-tsconfig-paths` in `/server`. Create `server/vitest.config.mts`.
  - **Target Files:** `server/package.json`, `server/vitest.config.mts`.
  - **Verify:** Run `npm test` from `/server` and verify that unit tests pass (18/18 green).

#### 🎨 Developer 2 (Frontend)
- [x] **`FE-201` — Configure Client Dev Proxy** (1 hour) — *COMPLETED (31-Aug-2026)*
  - **Action:** Add `BACKEND_INTERNAL_URL=http://localhost:5000` to `client/.env.local` and `.env.example`.
  - **Target Files:** `client/.env.local`, `client/.env.example`.
  - **Verify:** Requesting `/api/health` from Next.js reaches `localhost:5000`.
- [x] **`FE-202` — Build Job Client Service** (4 hours) — *COMPLETED (31-Aug-2026)*
  - **Action:** Create `client/services/job.service.ts` calling `GET /api/jobs` and `GET /api/jobs/:id`.
  - **Target Files:** `client/services/job.service.ts`.
  - **Verify:** Calling `jobService.searchJobs({ page: 1 })` returns typed response from backend.

---

### 🗓️ DAY 2 (Wednesday, Sep 02)

#### 🛠️ Developer 1 (Backend)
- [ ] **`BE-102` (Part 1) — Resume Text Extraction Utility** (4 hours)
  - **Action:** Install `pdf-parse` in `/server`. Create text extraction helper in `server/src/modules/resume`.
  - **Target Files:** `server/package.json`, `server/src/modules/resume/resume.parser.ts`.

#### 🎨 Developer 2 (Frontend)
- [x] **`FE-203` — Wire Smart Job Center to Live API** (6 hours) — *COMPLETED (31-Aug-2026)*
  - **Action:** Update `client/app/dashboard/job-center/page.tsx` to replace `mockJobListings` with data from `job.service.ts`.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`.
  - **Verify:** Page loads real MongoDB jobs; search input, pagination, and filter changes fetch fresh live data.

---

### 🗓️ DAY 3 (Thursday, Sep 03)

#### 🛠️ Developer 1 (Backend)
- [ ] **`BE-102` (Part 2) — Store Extracted Text in MongoDB** (4 hours)
  - **Action:** Hook `ResumeParserService` into `POST /api/resumes/upload` to parse uploaded PDF and save text in `ResumeModel.extractedData`.
  - **Target Files:** `server/src/modules/resume/resume.service.ts`.
  - **Verify:** Uploading a PDF saves extracted keywords and metadata to database.

#### 🎨 Developer 2 (Frontend)
- [x] **`FE-204` — Build Resume Client Service** (4 hours) — *COMPLETED (31-Aug-2026)*
  - **Action:** Create `client/services/resume.service.ts` with `uploadResume(file, title)`, `getUserResumes()`, `deleteResume(id)`.
  - **Target Files:** `client/services/resume.service.ts`, `client/types/resume.ts`.
  - **Verify:** TypeScript check passes with typed methods calling `/api/resumes`.

---

### 🗓️ DAY 4 (Friday, Sep 04)

#### 🛠️ Developer 1 (Backend)
- [ ] **`BE-103` (Part 1) — Implement AI ATS Scoring Logic** (4 hours)
  - **Action:** Build `AtsScoringService` evaluating keyword density, formatting, and brevity against target roles.
  - **Target Files:** `server/src/modules/resume/ats.service.ts`.

#### 🎨 Developer 2 (Frontend)
- [ ] **`FE-205` — Wire Live Resume Upload in UI** (5 hours)
  - **Action:** Replace "Simulate Upload" in `client/app/dashboard/resume-intelligence/page.tsx` with real file input calling `resumeService.uploadResume()`.
  - **Target Files:** `client/app/dashboard/resume-intelligence/page.tsx`, `client/components/dashboard/resume-intelligence/ResumeUploader.tsx`.
  - **Verify:** Uploading a real PDF uploads to backend `storage/resumes` and lists under user's resumes.

---

### 🗓️ DAY 5 (Monday, Sep 07 / Wrap-up)

#### 🛠️ Developer 1 (Backend)
- [ ] **`BE-103` (Part 2) — ATS Scoring API Endpoint** (4 hours)
  - **Action:** Expose `GET /api/resumes/:resumeId/analysis` returning score breakdown and tips.
  - **Target Files:** `server/src/modules/resume/resume.controller.ts`, `server/src/modules/resume/resume.routes.ts`.
  - **Verify:** Calling endpoint returns ATS score (0–100) and recommendation list.

#### 🎨 Developer 2 (Frontend)
- [ ] **Sprint 1 Integration QA & End-to-End Smoke Test** (3 hours)
  - **Action:** Verify candidate can search live jobs on `/dashboard/job-center` and upload a real PDF resume on `/dashboard/resume-intelligence`.
  - **Verify:** `npx tsc --noEmit` and `npm run type-check` both pass with 0 errors.

---

## 🏆 Sprint 1 Deliverable Checklist

Before declaring Sprint 1 complete, verify all 4 criteria:
- [ ] `npm test` runs in `/server` and passes automated test suites.
- [ ] `/dashboard/job-center` loads live jobs from MongoDB with real pagination and filters (0 mock items).
- [ ] `/dashboard/resume-intelligence` uploads a real PDF file to the backend and lists the uploaded file metadata.
- [ ] Zero TypeScript errors in both `/server` and `/client`.
