# 🧠 SKILLEZO AI — Sprint 4 Execution Plan
## AI Career Intelligence, Skill Gap Engine & Recruiter Portal

> **Sprint Duration:** 5 Days  
> **Primary Goal:** Complete the end-to-end intelligence suite: **AI Resume ATS Scoring**, **Skill Gap Analysis (Module 21)**, **Employability Index (Module 22)**, and the **Employer / Recruiter Applicant Management Portal (Module 30)** with 100% live API integrations.  
> **Status:** ⚪ **PLANNED & READY FOR SPRINT 4**  

---

## 🏛️ Sprint 4 Core Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SKILLEZO AI INTELLIGENCE & RECRUITER SUITE           │
└────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
[RESUME INTELLIGENCE]     [SKILL GAP & CAREER GPS]    [RECRUITER PORTAL]
(Module 19 & 23)          (Modules 21 & 22)           (Module 30)
• ATS Compatibility       • Role Benchmark Engine     • Live Applicant Kanban
• Keyword Matcher         • 6-Axis Radar Matrix       • Resume PDF Streamer
• Impact Score (0-100)    • Employability Score       • Pipeline Stage Switcher
• AI Recommendation Fix   • Dynamic Milestones        • Recruiter Scoring & Notes
```

---

## 🗓️ Day-by-Day Sprint Breakdown

### 🗓️ DAY 1 — AI Resume Intelligence & ATS Compatibility Engine

- [ ] **`BE-401` — ATS Compatibility & Scoring Algorithm** (2h 00m)
  - **Action:** Build `ResumeAtsService` calculating:
    1. Overall ATS Compatibility % across Greenhouse, Lever, Workday, and Taleo.
    2. Category keyword matches (Frontend, Backend, Cloud, DevOps, Database).
    3. Brevity, formatting, and impact statement scores.
  - **Target Files:** `server/src/modules/resume/resume.ats.ts`, `server/src/modules/resume/resume.controller.ts`.
  - **Verify:** Returns structured ATS breakdown from parsed MongoDB resume text.

- [ ] **`FE-401` — Wire Live Resume Intelligence UI** (1h 30m)
  - **Action:** Connect [`client/app/dashboard/resume-intelligence/page.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/resume-intelligence/page.tsx) to live ATS backend endpoints.
  - **Action:** Replace mock data with dynamic score gauges, missing keyword tags, and actionable AI improvement tips.
  - **Target Files:** `client/app/dashboard/resume-intelligence/page.tsx`, `client/services/resume.service.ts`.
  - **Verify:** Uploading or switching resumes updates ATS scores dynamically.

---

### 🗓️ DAY 2 — Dynamic Skill Gap Analysis & 6-Axis Radar Matrix

- [ ] **`BE-402` — Role Benchmark & Skill Gap Calculation Engine** (2h 00m)
  - **Action:** Build `SkillGapService` comparing candidate parsed skills against role taxonomies (`Full-Stack Engineer`, `AI/ML Specialist`, `DevOps Engineer`, `Cloud Architect`).
  - **Action:** Compute 6-axis competencies (Frontend, Backend, Database, Cloud, DevOps, System Design).
  - **Target Files:** `server/src/modules/career-plan/skill-gap.service.ts`, `server/src/database/models/Competency.model.ts`.
  - **Verify:** Generates real numeric gaps and missing skill priority lists.

- [ ] **`FE-402` — Live Skill Gap Dashboard & Radar Visualizer** (1h 30m)
  - **Action:** Connect [`client/app/dashboard/skill-gap-analysis/page.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/skill-gap-analysis/page.tsx) to live gap engine.
  - **Action:** Render live interactive Radar Chart, role switcher dropdown, and missing skill badges with priority sorting.
  - **Target Files:** `client/app/dashboard/skill-gap-analysis/page.tsx`.
  - **Verify:** Role switcher updates radar chart and missing skill courses in real time.

---

### 🗓️ DAY 3 — Employability Index & AI Career GPS Roadmap

- [ ] **`BE-403` — Multi-Factor Employability Index Engine** (1h 30m)
  - **Action:** Implement holistic algorithm combining:
    - Technical Readiness (40%)
    - Resume Strength (25%)
    - Project Strength (15%)
    - Skill Alignment (10%)
    - Recruiter Visibility (10%)
  - **Target Files:** `server/src/modules/career-plan/employability.service.ts`.
  - **Verify:** Returns composite 0–100 Employability Score and top improvement action items.

- [ ] **`FE-403` — Wire Live Employability Index & Career GPS** (1h 30m)
  - **Action:** Connect [`client/app/dashboard/employability-index/page.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/employability-index/page.tsx) and [`client/app/dashboard/career-gps/page.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/career-gps/page.tsx).
  - **Target Files:** `client/app/dashboard/employability-index/page.tsx`, `client/app/dashboard/career-gps/page.tsx`.
  - **Verify:** Gauge displays live employability score with dynamic milestone tracking.

---

### 🗓️ DAY 4 — Recruiter / Employer Applicant Management Portal

- [ ] **`BE-404` — Recruiter Applications Pipeline API** (2h 00m)
  - **Action:** Implement `GET /api/recruiter/applications` (paginated, filterable by job & status) and `PATCH /api/recruiter/applications/:id/status` with role-based access control (RBAC).
  - **Target Files:** `server/src/modules/recruiter-application/`.
  - **Verify:** Recruiter can query all applicants for their company jobs and update stages.

- [ ] **`FE-404` — Recruiter Applicant Kanban & Review Drawer** (2h 00m)
  - **Action:** Build recruiter dashboard with Kanban columns (`Under Review`, `Shortlisted`, `Interview`, `Offer`, `Hired`).
  - **Action:** Add candidate deep-dive drawer with inline authenticated PDF resume streaming and recruiter review notes.
  - **Target Files:** `client/app/recruiter/applications/page.tsx`, `client/components/recruiter/`.
  - **Verify:** Recruiter can advance candidate stage and stream resume in 1 click.

---

### 🗓️ DAY 5 — End-to-End Integration QA & Polish

- [ ] **`QA-401` — Mock Elimination & Full Lifecycle Audit** (1h 30m)
  - **Action:** Verify 100% elimination of mock data across:
    1. Resume Intelligence (`/dashboard/resume-intelligence`)
    2. Skill Gap Analysis (`/dashboard/skill-gap-analysis`)
    3. Employability Index (`/dashboard/employability-index`)
    4. Career GPS (`/dashboard/career-gps`)
    5. Recruiter Portal (`/recruiter/applications`)
  - **Verify:** All pages query live MongoDB backend.

- [ ] **`QA-402` — Full Vitest Suite & TypeScript Safety** (1h 00m)
  - **Action:** Add unit test coverage for ATS scorer, skill gap engine, and recruiter RBAC. Run `npx tsc --noEmit` across client and server.
  - **Verify:** 100% green tests with 0 TypeScript errors.

---

## 🏆 Sprint 4 Deliverable Checklist

- [ ] Live ATS compatibility, keyword density, and AI recommendations based on uploaded PDF resume.
- [ ] Live 6-axis Radar Chart and dynamic missing skill course suggestions.
- [ ] Live 0–100 Employability Score and Career GPS milestone tracker.
- [ ] Recruiter applicant management portal with stage transitions and inline resume viewing.
- [ ] 100% mock data removed from career intelligence and recruiter modules.
- [ ] 0 TypeScript errors across client and server.
