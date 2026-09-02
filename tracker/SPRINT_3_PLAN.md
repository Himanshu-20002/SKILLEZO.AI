# 🤖 SKILLEZO AI — Sprint 3 Execution Plan
## Auto-Apply Bot & Intelligent Autopilot Engine

> **Sprint Duration:** 5 Days  
> **Primary Goal:** Build the high-throughput **AI Auto-Apply Bot** with dual-engine architecture: **Direct ATS APIs** (Greenhouse/Lever/Ashby) & **Headless AI Browser Worker** (Playwright/Puppeteer form-filler) with real-time candidate dashboard telemetry.  
> **Status:** 🟡 **PLANNED & READY FOR KICKOFF**  

---

## 🏛️ Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                  SKILLEZO AI AUTO-APPLY BOT ARCHITECTURE               │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       Candidate Clicks "Auto-Apply" / Turns On Autopilot in Dashboard
                                    │
                                    ▼
                        SKILLEZO AUTO-APPLY QUEUE
                        ┌───────────┴───────────┐
                        ▼                       ▼
           [ENGINE 1: Direct ATS APIs]    [ENGINE 2: AI Browser Worker]
           (Greenhouse, Lever, Ashby)     (Workday, Taleo, Custom)
           • Pure backend HTTP POST       • Headless Playwright / Puppeteer
           • Direct Resume PDF Buffer     • AI detects form fields & fills
           • 0.5s instant submission      • Answers questions with LLM
           • 100% reliability             • Submits & captures screenshot
                        └───────────┬───────────┘
                                    │
                                    ▼
           MongoDB: Status updated to "APPLIED" (with Screenshot Proof)
           Live Real-Time Telemetry & Toast on Candidate Dashboard
```

---

## 🗓️ Day-by-Day Sprint Breakdown

### 🗓️ DAY 1 — Autopilot Preferences, Queue Infrastructure & Data Models

- [ ] **`BE-301` — Auto-Apply Queue & Autopilot Data Schema** (1h 30m)
  - **Action:** Create `AutopilotConfig` model and `AutoApplyJobQueue` in `/server`. Store candidate preferences: match threshold (e.g. `85%+`), target job roles, preferred workplace modes, max applications/day, and default resume snapshot.
  - **Target Files:** `server/src/database/models/AutopilotConfig.model.ts`, `server/src/modules/auto-apply/`.
  - **Verify:** Mongoose schema validates preferences and initializes per user.

- [ ] **`FE-301` — Autopilot Settings & Toggle Widget in Job Center** (1h 15m)
  - **Action:** Add an interactive **"AI Autopilot"** activation widget in `/dashboard/job-center` with a live switch, threshold sliders (Match score %, daily cap), and preferences modal.
  - **Target Files:** `client/components/dashboard/job-center/AutopilotWidget.tsx`, `client/app/dashboard/job-center/page.tsx`.
  - **Verify:** Candidate can turn on Autopilot and configure job criteria with instant feedback.

---

### 🗓️ DAY 2 — Engine 1: Direct ATS API Submitter (Greenhouse, Lever, Ashby)

- [ ] **`BE-302` — ATS Direct API Connector (Greenhouse / Lever / Ashby)** (2h 00m)
  - **Action:** Build dedicated API clients for Greenhouse (`/v1/boards/{board}/jobs/{id}/applications`), Lever (`/v0/postings/{company}/{id}`), and Ashby.
  - **Action:** Format candidate profile, contact details, cover note, and stream PDF resume buffer directly via multipart/form-data.
  - **Target Files:** `server/src/integrations/ats/greenhouse.client.ts`, `server/src/integrations/ats/lever.client.ts`, `server/src/modules/auto-apply/engine-ats.service.ts`.
  - **Verify:** Submits applications in under 0.5s directly to ATS endpoints with 100% payload validity.

- [ ] **`FE-302` — Batch "Auto-Apply to High Matches" Trigger** (1h 00m)
  - **Action:** Add a "1-Click Auto-Apply" button on the **Recommended** tab in Job Center that enqueues all 85%+ match jobs into Engine 1.
  - **Target Files:** `client/app/dashboard/job-center/page.tsx`.
  - **Verify:** High match jobs process and dynamically flip cards to `Applied ✓`.

---

### 🗓️ DAY 3 — Engine 2: Headless AI Browser Worker & Form Intelligence

- [ ] **`BE-303` — Headless Browser Automation Worker (Playwright / Puppeteer)** (2h 30m)
  - **Action:** Implement headless browser runner that navigates to external job posting URLs, detects standard job application forms, and manages sessions.
  - **Target Files:** `server/src/modules/auto-apply/engine-browser.service.ts`.
  - **Verify:** Headless browser successfully loads custom job application portals and locates inputs.

- [ ] **`BE-304` — AI Form Field Detector & Question Answerer (LLM Service)** (2h 00m)
  - **Action:** Build an intelligent form-filler that maps standard fields (First Name, Last Name, Email, Phone, LinkedIn, Portfolio, Years of Experience, Work Auth) and uses LLM to answer custom screening questions using candidate profile context.
  - **Target Files:** `server/src/modules/auto-apply/form-filler.ai.ts`.
  - **Verify:** Automatically populates custom application forms and uploads resume PDF.

- [ ] **`BE-305` — Application Proof Screenshot Capture & Storage** (1h 00m)
  - **Action:** Capture post-submission success screenshot, upload to local/cloud storage, and link image URL to the `Application` record in MongoDB.
  - **Target Files:** `server/src/modules/auto-apply/auto-apply.service.ts`.
  - **Verify:** Screenshot proof stored and returned with application metadata.

---

### 🗓️ DAY 4 — Live Telemetry, Activity Feed & Screenshot Viewer

- [ ] **`FE-303` — Live Auto-Apply Activity Feed & Telemetry Modal** (1h 30m)
  - **Action:** Build real-time progress drawer/modal showing active submissions: `Connecting to ATS...` ➔ `Submitting Resume...` ➔ `Completed (0.4s)`.
  - **Target Files:** `client/components/dashboard/job-center/AutoApplyTelemetryDrawer.tsx`.
  - **Verify:** Live status pulses in real time during auto-apply execution.

- [ ] **`FE-304` — Screenshot Proof Viewer in Applied Jobs Tracker** (1h 00m)
  - **Action:** Update `AppliedJobsTracker.tsx` so clicking on an auto-applied job card displays the verified application screenshot proof.
  - **Target Files:** `client/components/dashboard/job-center/AppliedJobsTracker.tsx`.
  - **Verify:** Candidates can view the visual confirmation screenshot for every bot-submitted application.

---

### 🗓️ DAY 5 — Safety Guardrails, Rate Limiting & End-to-End QA

- [ ] **`BE-306` — Daily Application Rate Limiter & Duplicate Safety Guard** (1h 00m)
  - **Action:** Enforce configurable daily limits (e.g. max 20 applications/day) and blacklist rules (ignore specific companies or salary ranges).
  - **Target Files:** `server/src/modules/auto-apply/auto-apply.guard.ts`.
  - **Verify:** Halts queue when daily limit is reached and notifies candidate.

- [ ] **`QA-301` — Full End-to-End Automated & Browser QA** (1h 30m)
  - **Action:** Run unit tests for Direct ATS payloads, headless worker, rate limits, and client typechecks (`npx tsc --noEmit` on client & server).
  - **Verify:** 100% green tests with 0 TypeScript errors.

---

## 🏆 Sprint 3 Deliverable Checklist

- [ ] Candidate can configure AI Autopilot preferences (Match score %, daily cap, target titles).
- [ ] Engine 1: Instant direct API submissions to Greenhouse, Lever, and Ashby (<0.5s).
- [ ] Engine 2: Headless AI form-filler with automated custom screening question answering.
- [ ] Visual application screenshot proof captured and viewable in the Applied tab.
- [ ] Rate-limiting guardrails and company blacklists prevent spam flags.
- [ ] 0 TypeScript errors across client and server.
