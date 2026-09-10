# 🚀 SKILLEZO AI — Sprint 7 Execution Plan
## Job Center Scalable Pagination, Database Indexing, Backend Stability & Resume Studio Phase 8 Architecture

> **Sprint Duration:** 5 Working Days (Active)  
> **Sprint Goal:** Complete Job Center high-performance pagination & MongoDB compound indexing, solidify backend server lifecycle & monorepo DX, and execute **Phase 8: Resume Studio** (canonical `ResumeDocument` JSON schema, section-level scoring engine, anti-hallucination fact lock, and LaTeX-based ATS vector PDF rendering pipeline).  
> **Sprint Status:** 🟢 **ACTIVE & ON TRACK — MID-DAY MILESTONES DELIVERED**  

---

## 🏛️ Sprint 7 Core Architecture & Workstreams

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SKILLEZO AI SPRINT 7 ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
[JOB CENTER SCALABILITY]        [BACKEND DX & STABILITY]        [RESUME STUDIO PHASE 8]
• 6 Jobs / Page Pagination       • Direct MongoDB Hosts Fallback • Canonical ResumeDocument
• In-Flight AbortController      • Clean Port 5000 Lifecycle     • Section-Level Scoring
• Compound MongoDB Indexing      • Root Monorepo Scripts         • Anti-Hallucination Fact Lock
• Server-Side Aggregation        • Instantaneous Sub-50ms API    • Headless LaTeX ATS PDF Export
```

---

## 📋 Sprint 7 Task Breakdown & Progress

### 🗓️ Workstream 1 — Job Center Scalability & Performance Engine

#### 🎨 Developer 2 (Frontend)
- [x] **`FE-701` — Safe Client-Side Pagination & Dynamic Limit (6/req)** (Completed ✅)
  - **Action:** Upgraded `client/app/dashboard/job-center/page.tsx` from downloading 100 bulk records to fetching 6 jobs per page. Wired Next/Previous navigation buttons to backend page parameters.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`.

- [x] **`FE-702` — Source Tab Segregation & In-Flight Request Cancellation** (Completed ✅)
  - **Action:** Updated `client/services/job.service.ts` to support dynamic `page`, `limit`, and `source` query parameters (`source=platform` vs `source=external`). Integrated `AbortController` signal cancellation to eliminate race conditions during rapid typing or tab switching.
  - **Target Files:** `client/services/job.service.ts`, `client/app/dashboard/job-center/page.tsx`.

#### 🛠️ Developer 1 (Backend Database & Query Optimization)
- [ ] **`BE-703` — MongoDB Compound Indexing for High-Volume Job Search** (In Progress ⏳)
  - **Action:** Add compound indexes in `server/src/database/models/Job.model.ts` on `{ sourceType: 1, createdAt: -1 }`, `{ status: 1, isApproved: 1, createdAt: -1 }`, and text index on `{ title: "text", company: "text", description: "text" }` to guarantee sub-10ms query execution across millions of records.
  - **Target Files:** `server/src/database/models/Job.model.ts`, `server/src/modules/jobs/jobs.service.ts`.

- [ ] **`BE-704` — Server-Side Aggregation Pipeline for Advanced Job Filters** (Planned)
  - **Action:** Progressively transition AI match score calculation, salary range filtering, and skill overlap checks from in-page client arrays into backend MongoDB aggregation pipelines.
  - **Target Files:** `server/src/modules/jobs/jobs.service.ts`, `server/src/modules/jobs/jobs.controller.ts`.

---

### 🗓️ Workstream 2 — Backend Infrastructure, Stability & Monorepo DX

#### 🛠️ Developer 1 (Backend Core & Infrastructure)
- [x] **`BE-701` — Direct MongoDB Replica Set Fallback Resolution** (Completed ✅)
  - **Action:** Diagnosed and resolved local DNS SRV query timeouts (`querySrv ECONNREFUSED`). Configured `MONGODB_DIRECT_HOSTS` fallback in `server/src/database/connection/db.ts` to bypass blocked SRV resolvers.
  - **Target Files:** `server/src/database/connection/db.ts`, `server/.env`.

- [x] **`BE-702` — Orphaned Process Cleanup & Production Build Alignment** (Completed ✅)
  - **Action:** Terminated stale background process `PID 11120` holding port 5000. Recompiled production bundle with `tsup` so `dist/server.js` contains the direct host resolution logic. Reloaded `ts-node-dev` on port 5000 with clean database connectivity.
  - **Target Files:** `server/dist/server.js`, `server/src/server.ts`.

- [x] **`CFG-701` — Root Monorepo Development Orchestration** (Completed ✅)
  - **Action:** Added `"dev": "npm run dev:server"` to root `package.json` to prevent `npm error Missing script: "dev"` and streamline developer ergonomics.
  - **Target Files:** `package.json`.

---

### 🗓️ Workstream 3 — Resume Studio Architecture Foundation (Phase 8 — P0 Milestones)

#### 🧠 Developer 1 & Developer 2 (AI Architecture & Full-Stack Core)
- [x] **`DOC-701` — Resume Studio Master Architecture Blueprint Authoring** (Completed ✅)
  - **Action:** Authored the comprehensive 10-section blueprint documenting the strategic pivot from exposed diagnostic dashboards to candidate-centric **Resume Studio** (Upload ➔ Understand ➔ Score ➔ Improve Section ➔ Re-Score ➔ Build ➔ Tailor ➔ Export), preserving Phases 1–7 as the internal engine.
  - **Target Files:** `doc/RESUME_STUDIO_ARCHITECTURE_BLUEPRINT.md`, `tracker/ai_implementation_doc/RESUME_STUDIO_ARCHITECTURE_BLUEPRINT.md`.

- [ ] **`BE-705` — Canonical `ResumeDocument` Schema & Parser Migration (P0)** (In Progress ⏳)
  - **Action:** Define strict TypeScript interfaces and Zod schemas for `ResumeDocument` (Contact, Summary, Skills, Experience, Projects, Education, Achievements, Evidence). Implement bidirectional serializer migrating legacy parsed resume records into the canonical format.
  - **Target Files:** `server/src/modules/resume-studio/resume-document.types.ts`, `server/src/modules/resume-studio/resume-document.schema.ts`.

- [ ] **`BE-706` — Section Scoring Engine & Unified Diagnostic Contract (P0)** (Planned)
  - **Action:** Implement independent 0–100 scoring APIs for each resume section (Contact 100%, Summary, Skills, Experience, Projects, Education, Achievements) replacing fragmented UI diagnostics with a unified contract.
  - **Target Files:** `server/src/modules/resume-studio/section-scoring.service.ts`.

- [ ] **`FE-707` — Section AI Editor & Workspace Component (P0)** (Planned)
  - **Action:** Build dedicated section-level AI improvement drawers/workspaces where clicking any section opens tailored suggestions, diagnostics, and instant rewrite triggers.
  - **Target Files:** `client/components/dashboard/resume-studio/SectionAIWorkspace.tsx`.

- [ ] **`BE-708` — Anti-Hallucination Evidence & Fact Lock Validator (P0)** (Planned)
  - **Action:** Enforce strict guardrails preventing fabricated metrics or claims. If a metric is missing, the system prompts the candidate for real numbers (users served, latency reduction, cost saved) rather than hallucinating stats.
  - **Target Files:** `server/src/modules/resume-studio/fact-lock.validator.ts`.

---

### 🗓️ Workstream 4 — Resume Studio Rendering & Delivery (Phase 8 — P1 / P2 Milestones)

#### 🎨 Developer 2 & 🛠️ Developer 1 (Frontend UI & Rendering Engine)
- [ ] **`BE-709` — Master Resume Vault & Job-Specific Tailoring Variants (P1)** (Planned)
  - **Action:** Implement single master evidence vault capable of generating tailored variants per Job Description (adjusting skill emphasis, summary focus, and bullet order without fabricating facts).
  - **Target Files:** `server/src/modules/resume-studio/tailoring.service.ts`.

- [ ] **`FE-710` — Simplified Candidate-Facing Studio Dashboard (P1)** (Planned)
  - **Action:** Build the unified **Resume Studio** dashboard replacing complex multi-pillar cards with an intuitive high-level score (82/100), section checklist, "Biggest Opportunity" highlight, and direct action triggers.
  - **Target Files:** `client/app/dashboard/resume-studio/page.tsx`.

- [ ] **`BE-711` — Headless LaTeX PDF Compiler & ATS Templates (P2)** (Planned)
  - **Action:** Build LaTeX template engine compiling `ResumeDocument` into publication-grade, ATS-parsable vector PDFs across 5 curated templates (*Classic*, *Modern*, *Minimal*, *Engineering*, *Executive*).
  - **Target Files:** `server/src/modules/resume-studio/renderer/`, `server/src/modules/resume-studio/templates/`.

- [ ] **`FE-712` — Visual Structured Resume Builder (P2)** (Planned)
  - **Action:** Visual drag-and-drop / structured document editor giving candidates instant feedback on layout, template selection, and typography before final PDF compilation.
  - **Target Files:** `client/components/dashboard/resume-studio/VisualResumeBuilder.tsx`.

---

### 🗓️ Workstream 5 — Quality Assurance, Verification & Automated Testing

- [x] **`QA-701` — Client TypeScript & Whitespace Verification** (Completed ✅)
  - **Action:** Executed `tsc --noEmit` and `git diff --check` verifying 0 compilation errors across all client modifications.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`, `client/services/job.service.ts`.

- [ ] **`QA-702` — Vitest End-to-End Test Suite for `ResumeDocument` & Section Scoring** (Planned)
  - **Action:** Author comprehensive test suites validating schema compliance, migration from raw parsed text, section scoring mathematics, and fact lock safety checks.
  - **Target Files:** `server/tests/unit/modules/resume-studio.spec.ts`.

---

## 📈 Sprint 7 Execution Scorecard

```text
========================================================================================
SPRINT 7 PROGRESS SCORECARD: [██████████░░░░░░░░░░] 50% Active Execution
========================================================================================
[FE-701] Job Center Safe Pagination (6/req)      : [████████████████████] 100% (Completed ✅)
[FE-702] Dynamic Tab Querying & AbortSignal      : [████████████████████] 100% (Completed ✅)
[BE-701] MongoDB Direct Host Fallback            : [████████████████████] 100% (Completed ✅)
[BE-702] Stale Process Cleanup & tsup Rebuild    : [████████████████████] 100% (Completed ✅)
[CFG-701] Root package.json Monorepo Dev Script  : [████████████████████] 100% (Completed ✅)
[DOC-701] Resume Studio Architecture Blueprint   : [████████████████████] 100% (Completed ✅)
[QA-701] Client TypeScript & Git Diff Safety     : [████████████████████] 100% (0 Errors ✅)
----------------------------------------------------------------------------------------
[BE-703] MongoDB Compound Job Indexes            : [██████░░░░░░░░░░░░░░] 30%  (In Progress ⏳)
[BE-705] ResumeDocument Schema & Migration (P0)  : [████░░░░░░░░░░░░░░░░] 20%  (In Progress ⏳)
[BE-706] Section Scoring Engine (P0)             : [░░░░░░░░░░░░░░░░░░░░] 0%   (Planned)
[FE-707] Section AI Editor Workspace (P0)        : [░░░░░░░░░░░░░░░░░░░░] 0%   (Planned)
[BE-708] Anti-Hallucination Fact Lock (P0)       : [░░░░░░░░░░░░░░░░░░░░] 0%   (Planned)
[BE-711] LaTeX ATS PDF Compilation Pipeline (P2) : [░░░░░░░░░░░░░░░░░░░░] 0%   (Planned)
========================================================================================
```

---

## 🎯 Definition of Done for Sprint 7

1. **Job Center Scalability**: Jobs pagination works smoothly at 6/page with sub-50ms query responses backed by MongoDB compound indexes.
2. **Backend Stability**: Dev and production builds run reliably on port 5000 with zero unhandled SRV exceptions or port collisions.
3. **ResumeDocument Standard**: All candidate resume data is represented via the canonical `ResumeDocument` JSON schema.
4. **Section-Level Scoring & Editing**: Candidates can view scores for individual resume sections and trigger AI improvements directly within that section.
5. **Anti-Hallucination Fact Lock**: AI rewrites never fabricate unverified metrics; missing statistics prompt the user for input.
6. **Zero Regression**: 100% of existing backend Vitest tests pass (131/131) and TypeScript compiles cleanly with 0 errors.
