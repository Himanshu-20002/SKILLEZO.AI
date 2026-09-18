# 🗺️ SKILLEZO AI — Product Deliverables & MVP Launch Roadmap

> **Document Version:** 1.0.0  
> **Execution Start Date:** September 14, 2026 *(Active From Today)*  
> **Status:** Live Execution Roadmap  
> **Primary Milestone (Soft MVP / Feature Freeze):** **September 30, 2026** (17 Calendar Days)  
> **Final Release Milestone (Hardened Production Launch):** **October 10, 2026** (27 Calendar Days)  

---

## 📌 Executive Summary

**Skillezo AI** is an AI-powered talent intelligence and career acceleration ecosystem connecting ambitious candidates with data-driven career growth and real employers. The platform combines deterministic ATS resume intelligence, automated job matching, an evidence-locked AI bullet editor, employability scoring, and cryptographically verified skill credentials.

This document establishes the **functionality-wise delivery roadmap**, auditing what is **currently covered & working**, what **remains unbuilt for MVP**, the **week-by-week deadlines** leading up to **September 30 / October 10**, and the **post-MVP expansion plan**.

---

## 🔍 Part 1: Current State Audit (Covered vs. Not Implemented)

```
========================================================================================
CURRENT REPOSITORY READINESS (September 17, 2026 — End-of-Day Status)
========================================================================================
Candidate Core Experience & Auth    : [████████████████████] 100% (Working & Verified: Google OAuth 2.0 & Resend Reset Flow)
Resume Parsing & Normalization      : [████████████████████] 100% (Working & Verified: 3-Project Extraction & PDF Hyperlinks)
7-Section Deterministic ATS Engine  : [████████████████████] 100% (Working & Verified)
Evidence-Locked Section AI Editor   : [████████████████████] 100% (Working & Verified)
Candidate Applications Tracking UI  : [████████████████████] 100% (Working & Verified: Filter Tabs, Timeline, Withdrawal & Routing)
Smart Job Center & Cron Ingestion   : [████████████████████] 100% (Working & Verified: 103+ Jobs, Search & Filters)
Skill Assessments & Quiz Engine     : [████████████████████] 100% (Working & Verified: 29KB Question Banks & Timed Runner)
Skill Verification & Credentials    : [████████████████████] 100% (Working & Verified: In-App Ledger, QR & Cryptographic Minting)
Projects & Portfolio Hub            : [████████████████████] 100% (Working & Verified: Portfolio CRUD & Curated Recommendations)
Profile Completion & Progress Gauge : [████████████████████] 100% (Working & Verified: Real-Time Completeness Meter)
Resume Intelligence Dashboard       : [████████████████████] 100% (Working & Verified: 7-Pillar Inspection & Role Match)
Employability Index Evaluation      : [████████████████████] 100% (Working & Verified: 5-Factor Weighted Gauge & Role Selector)
Visual Resume Studio & Vector PDF Engine : [████████████████████] 100% (Working & Verified: Direct Vector PDF, Templates, Layout & Anti-Orphan)
Zero-Mock Skill Gap Engine          : [████████████████████] 100% (Working & Verified: Deterministic 0% Baselines for Fresh Users)
AI Gateway & Model Gateway (Phase 1): [████████████████████] 100% (Working & Verified: SSE Streaming, Multi-Model Fallback & Circuit Breaker)
Evidence Layer & Cache (Phase 2)    : [████████████████████] 100% (Working & Verified: Provenance, Score Bounds, Normalizer, Snapshot Cache)
Controlled Tool Registry (Phase 3)  : [████████████████████] 100% (Working & Verified: 7 Allowlisted Adapter Tools, Zero-Trust Identity, Ring Buffer)
AI Orchestrator (Phase 4)           : [████████████████████] 100% (Working & Verified: 10 Intents, Staged Execution, Metric Validation, Model Gateway)
Career Coach API (Phase 5)          : [████████████████████] 100% (Working & Verified: POST /api/ai/coach/chat, Strict Zod, SSE Lifecycle, Rate Limiting, Abort)
Career GPS & Skill Gap Roadmaps     : [███████████████░░░░░]  75% (Core Taxonomies Live; Deep-Links & Salary Bands in Week 1)
Recruiter Review Portal             : [██████████████░░░░░░]  70% (Kanban, Drawer & Jobs Live; Data Hydration in Week 2)
Cloud Infrastructure & Production   : [██████░░░░░░░░░░░░░░]  30% (Local Docker/Dev, Prod Hardening in Week 3.5)
Automated Email & Notifications     : [████████████████░░░░]  80% (Resend Transactional Password Reset Engine Live; In-App Notifications)
Public Certificate Verification URL : [████░░░░░░░░░░░░░░░░]  20% (Backend API Live; Public /verify Route in Week 1)
AI Career Coach Assistant           : [██████████████████░░]  90% (Phases 1–6 Live: Gateway + Evidence + Cache + Tools + Orchestrator + Coach API + Intelligence Workbench UI; Phase 7 Mutation Safeguards Next)
Learning Hub & Progress Analytics   : [██░░░░░░░░░░░░░░░░░░]  10% (Placeholder Modules; Post-MVP)
AI Auto-Apply Engine (Inngest)      : [░░░░░░░░░░░░░░░░░░░░]   0% (Manual Apply Only; Inngest Queue in Week 3 Priority 1)
========================================================================================
```

### ✅ 1.1 What is Implemented & 100% Working (Overall Platform)

| Domain | Feature / Capability | Technical Implementation | Status |
| :--- | :--- | :--- | :---: |
| **Auth & Security** | Candidate Authentication & Sessions | Better Auth with secure HTTP-only cookies, session tokens, sign-in/up | 🟢 **100% Working** |
| **Candidate Profile** | Profile Engine & Profile Completion Gauge | Headline, bio, target role, phone, and real-time **ProfileCompletion** percentage progress calculation | 🟢 **100% Working** |
| **Projects & Portfolio** | Dual-Tab Portfolio & Recommendation Hub | `ProjectsPage.tsx` with live CRUD portfolio (`AddProjectModal.tsx`) synced to MongoDB + curated recommended projects boosting Employability Index | 🟢 **100% Working** |
| **Skill Assessments** | Interactive Quiz Runner & Assessment Banks | 29KB question banks (`assessment-bank.data.ts`), timed modal test runner (`AssessmentModal.tsx`), auto-grading & passing score thresholds | 🟢 **100% Working** |
| **Skill Verification** | Cryptographic Ledger & Credential Minting | Automatic minting of SHA-256 credentials (`SKZ-CERT-...`), profile skill auto-sync (`verified: true`), dual-view (`table`/`grid`), and `CertificateModal.tsx` | 🟢 **100% Working** |
| **Job Center** | Live Ingestion & Search Engine | 103+ MongoDB jobs, node-cron 12h cycle, 14-day TTL, title/location/remote filters | 🟢 **100% Working** |
| **Job Matches** | Targeted Recommended Job Deep-Linking | Filter candidate jobs by match compatibility (`/dashboard/job-center?tab=recommended`) | 🟢 **100% Working** |
| **Job Application** | Safe Candidate Job Applications | Duplicate check `(userId, jobId)` compound index, resume ownership check (403 guard) | 🟢 **100% Working** |
| **Applications Tracker** | Candidate Application Status Tracker | `AppliedJobsTracker.tsx` & `ApplicationTimeline.tsx` with 8 status filter tabs (`All`, `Submitted`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Offer`, `Rejected`, `Withdrawn`), expandable progression timeline, 1-click application withdrawal with DB sync, and `/dashboard/applications` route | 🟢 **100% Working** |
| **Resume Ingestion** | Deterministic Extraction & Parser | `pdf-parse` buffer parsing, section segmentation, canonical `ResumeDocument` mapping | 🟢 **100% Working** |
| **Resume Intelligence** | 7-Section Deterministic ATS Scoring | 0–100 pure math scores for Contact, Summary, Skills, Exp, Proj, Edu, Ach (Zod validated) + 7-pillar inspector and live optimization modal | 🟢 **100% Working** |
| **AI Improvement** | Section AI Bullet Studio + Evidence Lock | Gemini anti-hallucination guard, metric proof prompts, non-mutating suggestion review | 🟢 **100% Working** |
| **Instant Delta** | Authoritative Re-Scoring on Edit | Immediate before/after delta calculation (`61 → 84 pts`) upon candidate edit approval | 🟢 **100% Working** |
| **Resume Studio UX & PDF** | Unified Studio, Builder & Vector PDF | 4 unified studio modes, live layout controls, and direct client-side vector PDF generation engine (`FE-806`) with anti-orphan page breaking | 🟢 **100% Working** |
| **Skill Gap Analysis** | 6-Axis Skill Radar & Competency Audit | Role benchmark comparison (6 target roles), radar chart, competency deficit matrix, "Add to Roadmap" | 🟢 **100% Working** |
| **Employability Index** | 5-Factor Employability Score & Radial Ring | 40% Tech + 25% Resume + 15% Proj + 10% Skill + 10% Recruiter weighted score with dynamic role selector | 🟢 **100% Working** |
| **Career GPS (Core)** | 7-Stage Career Progression Visualizer | 6 role benchmark taxonomies, milestone stages, and salary benchmark levels | 🟢 **100% Working** |
| **Backend Verification API** | Cryptographic Credential Lookup API | `GET /api/verification/credentials/:credentialHash` validates hashes against database | 🟢 **100% Working** |
| **Test Coverage** | Comprehensive Vitest Test Suite | 170+ unit tests across 25 suites verifying parsers, scorers, schemas, and endpoints | 🟢 **100% Working** |

---

### 🧭 1.2 Candidate Sidebar Navigation Audit (Item-by-Item Breakdown)

Direct audit of every section and route in the candidate navigation sidebar (`client/components/layout/Sidebar.tsx`):

| Sidebar Section | Nav Item Label | Route / Path | Implementation Status & Code Evidence | Category |
| :--- | :--- | :--- | :--- | :---: |
| **Main** | **Dashboard Overview** | `/dashboard` | 🟢 **100% Built** — Key metrics, quick actions, recent status feeds. | Complete |
| **CAREER INTELLIGENCE** | **Career Profile** | `/dashboard/career-profile` | 🟢 **100% Built** — Full profile CRUD, bio, headline, skills, projects, and dynamic **Profile Completion** indicator ring. | Complete |
| **CAREER INTELLIGENCE** | **Resume Studio** `[AI]` | `/dashboard/resume-studio` | 🟢 **Unified Powerhouse** — Integrated 4 modes: ATS Diagnostics (7-pillar audit, keywords, direct upload), AI Bullet Studio (evidence lock & delta scoring), Resume Builder (templates & layout), and Visual Resume Canvas. Legacy `/dashboard/resume-intelligence` redirects cleanly here. | In Sprint 1 |
| **CAREER INTELLIGENCE** | **Skill Gap Analysis** | `/dashboard/skill-gap-analysis` | 🟢 **100% Built** — 6-axis radar chart, competency matrix, role benchmarks, priority recommendations. | Complete |
| **CAREER INTELLIGENCE** | **Employability Index** `[88%]`| `/dashboard/employability-index` | 🟢 **100% Built** — 5-factor weighted radial gauge, dynamic role selector, strengths & gaps breakdown. | Complete |
| **CAREER INTELLIGENCE** | **Career GPS** | `/dashboard/career-gps` | 🟡 **75% Built** — Core 7-stage visual roadmap live; interactive milestone deep-links & dynamic salary bands in Week 1. | In Sprint 1 |
| **SKILLS & LEARNING** | **Skill Assessments** `[TEST]` | `/dashboard/assessments` | 🟢 **100% Built** — 29KB question banks, timed quiz runner modal, auto-scoring, credential minting. | Complete |
| **SKILLS & LEARNING** | **Learning Hub** | `/dashboard/learning-hub` | 🔴 **10% Built** — `<ComingSoonModule moduleNumber="24" />` placeholder. | Post-MVP |
| **SKILLS & LEARNING** | **Projects & Portfolio** | `/dashboard/projects` | 🟢 **100% Built** — Tab 1: Live portfolio project CRUD (`AddProjectModal.tsx`) synced to DB; Tab 2: Curated recommended projects. | Complete |
| **SKILLS & LEARNING** | **AI Career Coach** `[PRO]` | `/dashboard/ai-career-coach` | 🟢 **90% Built** — Architecture Phases 1–6 Complete (Unified Model Gateway, Streaming, Evidence Layer, Context Cache, Controlled Tool Registry, AI Orchestrator, Coach API, and Dual-Pane Career Intelligence Workbench UI). Phase 7 Action System & Mutation Safeguards next. | In Sprint 1 |
| **OPPORTUNITIES** | **Smart Job Center** `[JOBS]` | `/dashboard/job-center` | 🟢 **100% Built** — 103+ MongoDB jobs, cron ingestion, search, multi-filters, 1-click safe apply. | Complete |
| **OPPORTUNITIES** | **Job Matches** `[MATCH]` | `/dashboard/job-center?tab=recommended` | 🟢 **100% Built** — Recommended job listings filtered by candidate target role and match threshold. | Complete |
| **VERIFICATION** | **Skill Verification** `[VERIFIED]`| `/dashboard/skill-verification` | 🟢 **100% Built** — Verified skills ledger, table/grid views, search/filter, and `CertificateModal` displaying SHA-256 hash. | Complete |
| **VERIFICATION** | **Certifications** | `/dashboard/skill-verification` | 🟢 **90% Built** — Internal credential viewer & backend verification API live; public `/verify/:certId` route in Week 1. | In Sprint 1 |
| **TRACKING (Internal)**| **Applications Tracker** | `/dashboard/applications` | 🟢 **100% Built** — 8 status filter tabs, expandable timeline, 1-click withdrawal. | Complete |
| **ANALYTICS (Internal)**| **Progress Analytics** | `/dashboard/progress-analytics` | 🔴 **10% Built** — `<ComingSoonModule moduleNumber="29" />` placeholder. | Post-MVP |

---

### 🏢 1.3 Deep-Dive: Recruiter Portal Audit (Built vs. What Needs Work)

#### 🟢 A. What is ALREADY BUILT in the Recruiter Portal (Point-by-Point)
1. **Recruiter Executive Dashboard (`/recruiter`):**
   - 4 Core KPI Stat Cards: `Total Active Inflow`, `Active Job Openings`, `Candidates in Interview`, `Offers Extended`.
   - 6-Stage Hiring Funnel Visualizer: `Applied Inflow` ➔ `Under Review` ➔ `Shortlisted` ➔ `Technical Interview` ➔ `Offers Extended` ➔ `Hired & Onboarded`.
   - Recent Inbound Candidates quick table with direct click-through to candidate evaluation.
   - Quick header actions: `[Source Verified Talent]` and `[Post Requisition]`.
2. **Dual-View Applicant Pipeline (`/recruiter/applications`):**
   - **Interactive Kanban Board:** Columns for each stage (`applied`, `under_review`, `shortlisted`, `interview`, `offered`, `hired`, `rejected`) using `KanbanColumn.tsx` and `ApplicantCard.tsx`.
   - **Table View:** Dense tabular representation with candidate name, applied date, job title, match score, and status badges.
   - Multi-parameter filtering: Filter by job requisition, search by candidate name/email, and instant refresh.
3. **Candidate Review Drawer (`CandidateReviewDrawer.tsx`):**
   - Slide-over inspection drawer triggered from Kanban cards or table rows.
   - **Authenticated PDF Streaming:** Inline iframe streaming candidate resume directly via `/api/recruiter/applications/:id/resume`.
   - **State Machine Status Actions:** Buttons to advance application (`Under Review`, `Shortlist`, `Interview`, `Make Offer`, `Hire`, `Reject`) with review notes.
   - **Audit History Tab:** Chronological timeline showing who changed the status, reason, and timestamps.
4. **Job Requisitions Management (`/recruiter/jobs`):**
   - Live listing of company jobs, department, location, applicants count, and status.
   - One-click status toggle (`active` ⟷ `paused`).
   - `CreateJobModal.tsx` for publishing new requisitions directly into MongoDB (`POST /api/jobs`).
5. **Verified Talent Sourcing Pool UI (`/recruiter/talent`):**
   - Filter candidates by verified skill sets and minimum Employability Index score.
   - Candidate cards displaying cryptographic credential badges (`SKZ-CERT-...`).
6. **Dedicated Recruiter Layout & Role Routing:**
   - `RecruiterLayout.tsx` with dedicated navigation topbar and enterprise recruiter workspace badge.
   - Role-based routing in `Navbar.tsx` and `LoginForm.tsx` (`role === 'recruiter' ? '/recruiter/applications' : '/dashboard'`).
7. **Backend Endpoints & Security (`server/src/modules/recruiter-application/` & `server/src/modules/jobs/`):**
   - `GET /api/recruiter/applications/stats` — Pipeline statistics and stage counters.
   - `GET /api/recruiter/applications` — Paginated candidate applications list with query filters.
   - `GET /api/recruiter/applications/:applicationId` — Detailed application metadata.
   - `GET /api/recruiter/applications/:applicationId/status-history` — Status transition audit trail.
   - `GET /api/recruiter/applications/:applicationId/resume` — Authenticated binary PDF streaming.
   - `PATCH /api/recruiter/applications/:applicationId/status` — State machine transition validator (with terminal state protection).
   - `GET /api/jobs/company` — Fetch company job requisitions.
   - `POST /api/jobs` — Create job requisition.
   - `PATCH /api/jobs/:jobId/status` — Toggle job active/paused status.
   - **Auto-Provisioning Workspace:** `assertRecruiterAuthorization()` automatically creates company membership (`SKILLEZO Enterprise Talent Network`) preventing 403 lockouts.

---



### ⏳ 1.4 What is NOT Implemented Yet (Remaining Gaps to Close for MVP)

> **Note:** The **Candidate Application Status Tracker** (`AppliedJobsTracker.tsx`, `ApplicationTimeline.tsx`, and `/dashboard/applications`) is **100% built and verified**, featuring 8 status filters, progression timeline, and live withdrawal.

| Gap ID | Missing Functional Area | Impact on MVP | Complexity |
| :---: | :--- | :--- | :---: |
| **GAP-01** | **Direct Vector PDF Download (`@react-pdf/renderer`)**<br>Currently, the user downloads via `window.print()` / browser PDF dialog. A programmatic 1-click vector PDF download with strict 1-page/2-page page breaks is required. | High (User expectation) | Medium |
| **GAP-02** | **Recruiter Backend Data Hydration & Real Drawer Credentials**<br>Hydrate real candidate profile (`name`, `email`, `headline`, `employabilityScore`, `verifiedSkills`) in `recruiter-application.service.ts` and bind dynamic certificates in `CandidateReviewDrawer.tsx`. | High (Recruiter usability) | Medium |
| **GAP-03** | **Public Certificate Verification Page (`/verify/:certId`)**<br>When candidates share their cryptographic certificate (`SKZ-CERT-...`), third-party recruiters must be able to view a public verification page validating authenticity. | Medium (Social proof) | Low |
| **GAP-04** | **Transactional Email Notifications (Resend / SendGrid)**<br>Automated emails for: (1) Application confirmation, (2) Application status update by recruiter, (3) Welcome / Verification email. | Medium-High (Retention) | Medium |
| **GAP-05** | **In-App Notification Stream**<br>Interactive bell icon in top navbar with unread badge and notification dropdown list. | Medium | Low |
| **GAP-06** | **Career GPS Detail Refinement (`/dashboard/career-gps`)**<br>Actionable milestone deep-links, interactive candidate completion status toggles, and dynamic market salary progression bands. | High (Candidate Engagement) | Low-Medium |
| **GAP-07** | **Interactive AI Career Coach Assistant (`/dashboard/ai-career-coach`)**<br>Replace placeholder UI with real conversational chat backed by `POST /api/career-coach/chat` (Gemini Flash), 4 guided starter pillars, and action cards. | High (Candidate Differentiation) | Medium |
| **GAP-08** | **AI Auto-Apply Job Engine with Inngest (`server/src/modules/auto-apply/`)**<br>Automated durable background event queue matching high-compatibility jobs (≥80% match), candidate preference controls, daily quotas, and instant status notifications. | Critical (Core USP - Week 3 Priority 1) | High |
| **GAP-09** | **1-Click Google OAuth Fast Sign-In (`authClient.signIn.social`)**<br>Configure Better Auth Google social provider in backend, hook up "Continue with Google" buttons on login/register, and auto-provision candidate profile. | High (User Onboarding Friction) | Low-Medium |
| **GAP-10** | **Cloud Production Deployment & Environment Hardening**<br>Vercel production build for frontend, Railway/AWS for backend with MongoDB Atlas, Redis cache, and SSL domain setup. | Critical (Launch requirement) | Medium |

---

## 🎯 Part 2: Scope Boundaries — MVP vs. Post-MVP

To guarantee high quality without scope creep, here are the strict boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                    IN MVP SCOPE (Delivered by Oct 10)       │
├─────────────────────────────────────────────────────────────┤
│ • Full Candidate Journey (Sign-up → Profile → Test)         │
│ • 1-Click Google OAuth Fast Sign-In & Account Linking       │
│ • Resume Ingestion + 7-Section ATS Scoring + AI Rewriter    │
│ • Live Split-View Visual Resume Builder + PDF Vector Export │
│ • Interactive Career GPS (Action Deep-Links & Progress)     │
│ • AI Career Coach Conversational Assistant (Gemini Flash)   │
│ • Job Center Search, Filtering & 1-Click Application        │
│ • Candidate Applications Status Tracker (Completed & Live)  │
│ • AI Auto-Apply Engine with Inngest Durable Orchestration   │
│ • Recruiter Job Applicant Review Drawer & Status Changer    │
│ • Cryptographic Certificate Minting & Public URL Verifier   │
│ • Transactional Email Triggers (Applied, Status Change)     │
│ • Production Cloud Deployment on Vercel + Railway           │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 POST-MVP ROADMAP (Planned after Oct 10)     │
├─────────────────────────────────────────────────────────────┤
│ • Stripe / Razorpay Paid Plans (Pro Candidate & Recruiter)  │
│ • AI Mock Interview Audio/Video Simulator (Phase 19.4)      │
│ • Recruiter-to-Candidate Direct Real-time Chat (WebSockets) │
│ • Multi-Template Style Marketplace (10+ Resume Themes)      │
│ • Enterprise ATS 2-Way Sync (Greenhouse, Lever, Workday)    │
│ • Advanced Candidate Talent Analytics & Recruiter Invoicing │
│ • Mobile Native Shell / PWA Offline Features                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Part 3: Week-by-Week Execution Timeline

### 🗓️ Timeline Overview

| Week | Window | Focus / Theme | Delivery Gate |
| :---: | :---: | :--- | :--- |
| **Week 1** | **Sep 14 – Sep 19** *(Ending Saturday)* | Candidate Loop Completion (Google OAuth + PDF Export + Career GPS Refine + AI Coach + Public Cert) | Candidate side 100% feature complete |
| **Week 2** | **Sep 21 – Sep 26** *(Ending Saturday)* | Recruiter Live Hydration, Review Drawer & Notifications | Recruiter review flow + Emails active |
| **Week 3** | **Sep 28 – Sep 30** | **AI Auto-Apply Engine (Inngest) & SOFT MVP CODE FREEZE** | **Target 1: Auto-Apply Live & Code Freeze** |
| **Week 3.5**| **Oct 01 – Oct 07** | Cloud Deployment, Load Testing, Performance (60+ FPS, Lighthouse 90+) & Security Audit | Production Staging Live & Audited |
| **Week 4** | **Oct 08 – Oct 10** | End-to-End Polish, Final Regression, Domain Binding & Public Launch | **Target 2: Public Production Release** |

---

### 📆 Detailed Weekly Work Breakdown

#### 🔹 WEEK 1: Candidate Loop Closure, Google OAuth, AI Career Coach & Career GPS Refinement
**Dates:** September 14 – September 19, 2026 *(Ending Saturday)*  
**Primary Goal:** Deliver 1-click Google OAuth authentication, native vector PDF downloads, refine Career GPS with interactive milestone actions, launch conversational AI Career Coach, and publish public certificate verification.

* **Deliverable 1.1: Direct Vector PDF Generation Engine (`FE-806`)** `[x] COMPLETED (Sept 15, 2026 - Ahead of Schedule)`
  - Direct client-side vector PDF generation via `@react-pdf/renderer` v4.9.0 with zero server load or rasterization.
  - Native typography and layout mapping for all 3 templates (`classic`, `modern`, `compact`), font families (`sans`, `serif`, `mono`), sizes, margins, line heights, and section ordering.
  - Smart anti-orphan page breaking (`wrap={false}` and `minPresenceAhead={25}`) preventing broken headers and isolated bullet points.
  - Download trigger seamlessly wired to `ResumeStudioSidebar` and Studio header with toast notifications and automatic fallback.
  - *Completed:* **September 15, 2026** (Original Target: September 17, 2026)

* **Deliverable 1.2: Career GPS Detail Refinement for Candidates (`/dashboard/career-gps`)**
  - **Actionable Milestone Deep-Links:** Connect milestone action buttons to active tools (`[Take Assessment]` ➔ `/dashboard/assessments`, `[Improve Resume]` ➔ `/dashboard/resume-studio`, `[Apply High Match Jobs]` ➔ `/dashboard/job-center?tab=recommended`).
  - **Milestone Progress Tracking:** Add interactive candidate status toggles (`In Progress` ⟷ `Completed`) with completion percentage updates.
  - **Dynamic Market Salary Bands:** Replace static progression with dynamic compensation charts based on the candidate's selected target role (Junior ➔ Mid ➔ Senior ➔ Lead).
  - *Deadline:* **September 18, 2026**

* **Deliverable 1.3: Interactive AI Career Coach Assistant (`/dashboard/ai-career-coach`)**
  - **Backend Chat API:** Create `POST /api/career-coach/chat` utilizing the existing `GeminiProvider` with contextual candidate prompt injection (target role, employability score, resume strengths, top skill gaps).
  - **Frontend Conversational Interface:** Replace `<ComingSoonModule />` with an enterprise-grade dark/light AI chat room.
  - **4 Guided Starter Pillars:** Quick prompt buttons for: (1) Mock Interview Simulation, (2) Resume Bullet Critique, (3) Skill Gap Mastery Plan, (4) Salary & Offer Negotiation.
  - **Action Cards:** AI responses embed direct links to test assessments and job openings.
  - *Deadline:* **Saturday, September 19, 2026**

* **Deliverable 1.4: Public Certificate Verification Route (`/verify/:certId`)**
  - Public route (no login required) that validates SHA-256 signature against database.
  - Render branded credential badge, candidate name, skill verified, test score, and issue date.
  - Provide "Add to LinkedIn" button with formatted URL parameters.
  - *Deadline:* **Saturday, September 19, 2026**

* **Deliverable 1.5: 1-Click Google OAuth Authentication & Fast Sign-In (`AUTH-GOOG`)** `[x] COMPLETED (Sept 15, 2026 - Ahead of Schedule)`
  - **Backend Better-Auth Social Provider:** Configured `socialProviders.google` in `server/src/core/auth/auth.ts` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - **Account Auto-Provisioning & Linking:** Candidates signing in via Google automatically get provisioned with `role: "candidate"`, Google profile picture, verified email status, and trusted origin allowances.
  - **Frontend One-Click OAuth Flow:** Hooked up "Continue with Google" in `SocialButton.tsx`, `LoginCard.tsx`, `RegisterCard.tsx`, and `SocialLogin.tsx` with live loading indicators and redirect to `/dashboard`.
  - *Completed:* **September 15, 2026** (Original Target: September 16, 2026)

---




#### 🔹 WEEK 2: Recruiter Portal Live Hydration & Notification Engine
**Dates:** September 21 (Monday) – September 26, 2026 *(Ending Saturday)*  
**Primary Goal:** Complete the candidate data hydration, dynamic credentials drawer, and candidate notification engine for the Recruiter Workspace.

* **Deliverable 2.1: Candidate Data Hydration in Recruiter Backend (`recruiter-application.service.ts`)**
  - Update `getCompanyApplications` and `getCompanyApplicationDetails` to populate candidate details (`name`, `email`, `headline`, `employabilityScore`, and `verifiedSkills`) from `UserModel`, `ProfileModel`, and `VerificationModel`.
  - Eliminate generic `"Candidate Applicant"` fallbacks and client random math scores.
  - *Deadline:* **Tuesday, September 22, 2026**

* **Deliverable 2.2: Dynamic Verified Credentials in Candidate Review Drawer (`CandidateReviewDrawer.tsx`)**
  - Bind Tab 2 ("Verified Credentials") to live `details?.candidate?.verifiedSkills` instead of hardcoded mock skills.
  - Render actual quiz scores, proficiency badges, and SHA-256 certificate hashes.
  - Add structured interview scheduling inputs (date/time, timezone, Google Meet/Zoom link) to the `interview` stage action.
  - *Deadline:* **Thursday, September 24, 2026**

* **Deliverable 2.3: Remove Mock Fallback in Pipeline & Clean Empty State (`applications/page.tsx`)**
  - Remove the 5 hardcoded mock applicants (`Sarah Chen`, etc.) when `items.length === 0`.
  - Render an actionable zero-state card with a "Copy Job Application Link" button so recruiters see real data only.
  - *Deadline:* **Friday, September 25, 2026**

* **Deliverable 2.4: Transactional Notification & Email Engine**
  - Setup email dispatch (Resend or SendGrid API).
  - Triggers:
    1. Candidate applies ➔ Instant confirmation email to candidate & alert to recruiter.
    2. Recruiter changes status (`PATCH /api/recruiter/applications/:id/status`) ➔ In-app notification in `NotificationModel` + status email to candidate.
  - Connect top navbar bell icon with live unread notification badge.
  - *Deadline:* **Saturday, September 26, 2026**

---

#### 🔹 WEEK 3: AI Auto-Apply Engine (Inngest Integration) & Soft MVP Code Freeze
**Dates:** September 28 (Monday) – September 30, 2026  
**Primary Goal:** Build and launch the **AI Auto-Apply Job Engine with Inngest durable event orchestration** as 1st Priority, followed by MVP Feature Freeze, End-to-End Walkthrough, and Beta Demonstration.

* **Deliverable 3.1 [PRIORITY 1]: AI Auto-Apply Job Engine & Inngest Integration (`server/src/modules/auto-apply/`)**
  - **Inngest Durable Queue Setup:** Integrate `inngest` SDK in the backend with an authenticated `/api/inngest` serve handler for background event-driven execution, concurrency controls, and automated retries.
  - **Auto-Apply Matching Algorithm:** Match candidate's canonical `ResumeDocument`, verified skill credentials, and target role against new high-compatibility jobs (threshold: matchScore ≥ 80%).
  - **Candidate Safety Controls & Quotas:** Configurable daily limits (e.g., max 5–10 auto-applications/day), candidate preference filters (minimum salary, remote-only, specific locations), and strict duplicate check guards (`userId, jobId` compound uniqueness).
  - **UI Controls & Consent:** Toggle in `/dashboard/job-center` (`[⚡ Enable AI Auto-Apply]`), configuration preferences modal, and clear timeline tagging in `AppliedJobsTracker.tsx` (`"Auto-Applied by Skillezo Engine"`).
  - **Inngest Event Pipeline:**
    - Event `job.ingested` ➔ evaluate candidate matches.
    - Event `candidate.auto_apply.queued` ➔ safe application submission with attached resume snapshot.
    - Event `application.auto_submitted` ➔ instant candidate notification and confirmation email.
  - *Deadline:* **September 29, 2026**

* **Deliverable 3.2 [PRIORITY 2]: MVP Feature Freeze & End-to-End Integration Walkthrough**
  - Freeze new feature development.
  - Execute full end-to-end user journeys:
    - Candidate: Sign up ➔ Upload Resume ➔ Review 7-Section ATS ➔ Edit with AI Evidence Lock ➔ Take Skill Quiz ➔ Auto-Apply / 1-Click Apply ➔ Track Application Timeline.
    - Recruiter: View Job ➔ Inspect Applicant ATS & Resume ➔ Change Status.
  - Zero critical console errors, zero typecheck regressions.
  - *Deadline:* **September 30, 2026 (11:59 PM)**

---




#### 🔹 WEEK 3.5: Hardening, Cloud DevOps & Security
**Dates:** October 01 – October 07, 2026  
**Primary Goal:** Transform working local MVP into an enterprise-grade, cloud-deployed production system.

* **Deliverable 3.5.1: Cloud Infrastructure Deployment**
  - Deploy Next.js frontend to **Vercel** with custom domain & CDN edge caching.
  - Deploy Node.js/Express backend to **Railway / AWS ECS** with auto-restart and PM2/health checks.
  - Connect production **MongoDB Atlas** cluster with indexed collections and automated daily backups.
  - Configure cloud storage (AWS S3 or Cloudinary) for candidate resume file persistence.
  - *Deadline:* **October 03, 2026**

* **Deliverable 3.5.2: Performance Tuning & Optimization**
  - Audit Google Lighthouse scores (Target: `90+` across Performance, Accessibility, Best Practices, SEO).
  - Ensure 60–120 FPS UI smoothness on Resume Studio Split View and dashboard transitions.
  - Implement Redis / in-memory cache for repeated job search queries and role benchmark taxonomies.
  - *Deadline:* **October 05, 2026**

* **Deliverable 3.5.3: Security, Privacy & Rate Limiting Audit**
  - Rate limiting on Gemini AI endpoints (`express-rate-limit`) to prevent API abuse and cost overruns.
  - Strict input sanitization against prompt injection attacks in AI rewriter.
  - CORS policies, Helmet security headers, and cookie flags (`Secure`, `HttpOnly`, `SameSite=Strict`).
  - *Deadline:* **October 07, 2026**

---

#### 🔹 WEEK 4: Production Release Cut (Hard Deadline)
**Dates:** October 08 – October 10, 2026  
**Primary Goal:** **PUBLIC PRODUCTION RELEASE LAUNCH (October 10)**

* **Deliverable 4.1: Smoke Testing & Disaster Recovery Check**
  - Staging environment regression test with synthetic user accounts.
  - Verify DB connection failover and automated cron job recovery.
  - *Deadline:* **October 09, 2026**

* **Deliverable 4.2: Production Cut & Handover Documentation**
  - Point live DNS (`skillezo.ai`) to production cluster.
  - Publish API documentation & environment variable runbooks.
  - *Deadline:* **October 10, 2026 (Public Launch)**

---






## 🚀 Part 4: Post-MVP Roadmap (After October 10, 2026)

Once the MVP is safely running in production, execution pivots into monetization, enterprise expansion, and advanced AI simulations:

```
Q4 2026 Post-MVP Roadmap
│
├── PHASE A: Monetization & Billing (Mid-October 2026)
│   ├── Stripe / Razorpay Checkout & Webhook Integration
│   ├── Candidate Pro Tier ($15/mo): Unlimited AI rewrites, premium PDF templates, priority recruiter placement
│   └── Recruiter Tier ($99/mo): Post featured jobs, direct candidate outreach, bulk ATS resume screening
│
├── PHASE B: AI Mock Interview Simulator (Late October 2026)
│   ├── Voice & video AI interview room based on candidate's target role
│   ├── Real-time behavioral & technical evaluation
│   └── Instant feedback matrix boosting Employability Index score
│
├── PHASE C: Real-Time Recruiter-Candidate Direct Messaging (Early November 2026)
│   ├── Socket.io encrypted direct messaging drawer
│   ├── Interview scheduling calendar integration (Google Calendar / Calendly sync)
│   └── Candidate availability status toggle
│
└── PHASE D: Enterprise ATS Integration & Multi-Template Marketplace (Late November 2026)
    ├── Two-way sync with Greenhouse, Lever, and Workday APIs
    └── 10+ designer resume templates with custom color schemes and multi-column layouts
```

---

## 📊 Summary Deliverables Matrix & Deadlines

| Milestone | Target Date | Deliverables Included | Success Criteria |
| :--- | :---: | :--- | :--- |
| **Google OAuth Sign-In** | **Sep 16** | Google social provider in Better Auth, 1-click button hookup | Candidate 1-click Google sign-in works with session |
| **Sprint 8 Close** | **Sep 17** | Direct vector PDF download engine, template styling | Clean PDF download with 1/2 page fit |
| **Career GPS & Coach** | **Sep 19 (Sat)** | Interactive Career GPS, conversational AI Career Coach | Dynamic roadmap actions & 24/7 AI mentoring |
| **Candidate Complete** | **Sep 19 (Sat)** | Public certificate verification page, applications tracker | Candidate loop 100% usable without mock data |
| **Recruiter Complete** | **Sep 26 (Sat)** | Recruiter data hydration, live drawer credentials, email alerts | Employers can view candidates and change status |
| **🏁 Auto-Apply & Soft MVP** | **Sep 30** | AI Auto-Apply Engine (Inngest), Code Freeze & Demo | Auto-Apply active in queue, 100% E2E flows pass |
| **DevOps & Staging** | **Oct 05** | Vercel + Railway + Atlas deployment, 60 FPS | Staging cluster accessible with live data |
| **Security & QA** | **Oct 07** | Rate limits, anti-injection, Lighthouse 90+ | Zero high-severity vulnerabilities |
| **🚀 HARD LAUNCH** | **Oct 10** | **Final Production Cut & Domain Binding** | **Public Launch at production domain** |

---
