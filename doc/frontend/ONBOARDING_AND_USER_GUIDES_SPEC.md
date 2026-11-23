# 🧭 SKILLEZO.AI — Onboarding Guides & User Walkthroughs Specification

**Document Version:** 1.0.0  
**Status:** 🟢 **Production Verified & Active**  
**Tech Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS + Better Auth + Express 5 + Mongoose  

---

## 📌 Overview

SKILLEZO.AI incorporates a cohesive, multi-layered onboarding architecture designed to eliminate friction for first-time job seekers, students, and recruiters. Rather than a monolithic forced tutorial, onboarding is delivered progressively across key touchpoints:
1. **Global Candidate Readiness & Completion Guide** (Main Dashboard)
2. **Contextual Welcome & Progress Tracker** (Dynamic Header Banner)
3. **Master Resume Ingestion & Parsing Gateway** (Resume Studio)
4. **4-Step AI Mock Interview Setup Wizard & Preparation Stage** (Interview Coach)
5. **Skill Gap & Learning Hub Guidance Banners** (Career GPS & Learning)
6. **Zero-Friction Account Provisioning & Token Welcome Grant** (Authentication & Billing)

---

## 🛠️ Implemented Onboarding Systems

### 1. Profile Completion Onboarding Guide
- **File:** [`client/components/dashboard/ProfileCompletionGuide.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/dashboard/ProfileCompletionGuide.tsx)
- **Primary Route:** `/dashboard`
- **Purpose:** Serves as the candidate's persistent command center for profile readiness, guiding them from a fresh sign-up (0%) to an enterprise-ready profile (100%).
- **Interactive Mechanics:**
  - Hidden by default to avoid screen clutter; expands seamlessly on hover or click.
  - Features an animated pulse indicator on the next actionable step.
  - Dynamically calculates readiness percentage based on profile completeness.
- **Progressive Milestones:**

| Step | Milestone | Weight | Deep-Link Destination | Unlocked Capability |
| :--- | :--- | :---: | :--- | :--- |
| **1** | **Set Target Career Role** | `+15%` | `/dashboard/profile?focus=target-role` | Aligns ATS benchmarks, Career GPS roadmaps, and mock interview questions to the desired role. |
| **2** | **Upload Master Resume** | `+35%` | `/dashboard/resume-studio` | Unlocks vector ATS diagnostics, keyword gap radar, and the real-time A4 editing canvas. |
| **3** | **Add Top Technical Skills** | `+25%` | `/dashboard/profile` | Establishes the candidate's core baseline stack (requires minimum 3 skills). |
| **4** | **Verify Your First Skill** | `+25%` | `/dashboard/skill-verification#assessments` | Issues a cryptographic SHA-256 on-chain badge verified for recruiter spotlight. |

---

### 2. Candidate Welcome Banner & Live Metric Tracker
- **File:** [`client/components/dashboard/WelcomeBanner.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/dashboard/WelcomeBanner.tsx)
- **Primary Route:** `/dashboard` (Top Placement)
- **Purpose:** Welcomes returning and new candidates with personalized greetings and immediate visual feedback on their platform standing.
- **Key Features:**
  - **Dynamic Greeting:** Personalizes greeting with the candidate's first name.
  - **Radial Progress Ring:** An SVG circular progress ring indicating current candidate readiness.
  - **Live Counter Badges:** Real-time counters showing active resumes, total skills, and verified badges.
  - **Dynamic Quick Action:** Directs candidates to the single most impactful pending action with one click.

---

### 3. Master Resume Ingestion & Parsing Gateway
- **File:** [`client/components/resume-studio/ResumeStudioUploadGateway.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/resume-studio/ResumeStudioUploadGateway.tsx)
- **Primary Route:** `/dashboard/resume-studio` (Empty State)
- **Purpose:** First-time onboarding screen for candidates entering Resume Studio without an uploaded resume.
- **Workflow:**
  1. **Drag-and-Drop Area:** Supports PDF vector resume files up to 10MB.
  2. **Multi-Stage Telemetry Visualizer:** Displays live extraction progress steps:
     - *Validating File Integrity & Text Streams*
     - *Extracting Sections (Contact, Skills, Experience, Projects)*
     - *Generating Baseline ATS Audit & Invariant Master Document*
  3. **Instant Canvas Transition:** Automatically opens the parsed document in the Live Resume Canvas with zero page reloads.

---

### 4. AI Mock Interview Setup Wizard & Preparation Stage
- **Files:**
  - Setup Wizard: [`client/components/dashboard/interview-coach/InterviewSetupWizard.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/dashboard/interview-coach/InterviewSetupWizard.tsx)
  - Preparation Overlay: [`client/components/dashboard/interview-coach/arena/ReadyCountdownOverlay.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/dashboard/interview-coach/arena/ReadyCountdownOverlay.tsx)
- **Primary Route:** `/dashboard/interview-coach`
- **Purpose:** Step-by-step guided interview generation ensuring candidates practice under tailored, realistic hiring conditions.
- **4-Step Setup Flow:**
  1. **Target Role Selection:** Choose from 10+ pre-configured technology stacks (React, .NET, MERN, Python, Java, DevOps, Data Analyst, Cloud Engineer, etc.) or input a custom role.
  2. **Seniority Tier:** Select target level (Entry, Junior, Mid, Senior, Tech Lead) to adjust prompt complexity and rubric depth.
  3. **Interview Type:** Choose assessment focus (Technical Deep-Dive, System Architecture, Behavioral STAR, or Full Simulation).
  4. **Question Volume & Constraints:** Configure question count and response time limits.
- **Pre-Assessment Readiness Buffer:**
  - A 3-second glassmorphic countdown overlay (`3` $\rightarrow$ `2` $\rightarrow$ `1` $\rightarrow$ `Let's Go!`) with microphone and camera checks.
  - Automated speech gating ensures the AI evaluator starts speaking strictly after the candidate is ready.

---

### 5. Skill Gap & Learning Hub Guidance Banners
- **Files:**
  - [`client/components/dashboard/learning-hub/SkillGapRecommendationBanner.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/dashboard/learning-hub/SkillGapRecommendationBanner.tsx)
  - [`client/app/dashboard/skill-gap-analysis/page.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/skill-gap-analysis/page.tsx)
- **Purpose:** Onboarding guidance for candidates visiting career planning modules before verifying skills or uploading resumes.
- **Behavior:**
  - Renders a prominent guidance banner explaining how the verification engine analyzes technical gaps against live market job postings.
  - Deep-links directly to recommended assessment modules and curated learning hub tracks.

---

### 6. Automated Account Provisioning & Welcome Quota
- **Files:**
  - [`server/src/core/auth/auth.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/core/auth/auth.ts)
  - [`server/src/modules/plan/plan.service.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/plan/plan.service.ts)
  - [`server/src/modules/plan/plan.constants.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/plan/plan.constants.ts)
- **Purpose:** Eliminates initial payment friction and empty-state abandonment upon sign-up.
- **Automated Provisioning:**
  - Upon user registration (via Google OAuth or Email credentials), an active **Free Explorer** subscription is provisioned automatically.
  - A dedicated `TokenAccount` is initialized with **1,000 Free AI Welcome Tokens**.
  - An audit ledger entry (`WELCOME_BONUS`) is created in MongoDB.
  - Guarantees immediate access to test 1 full AI Mock Interview session (1,000 tokens) or run ATS diagnostics (300 tokens) + Skill Gap roadmaps (500 tokens) without requiring credit card details.

---

## 📊 Summary Matrix

| Guide Component | Target User Stage | Key Action Prompted | Auto-Trigger / Entry Point |
| :--- | :--- | :--- | :--- |
| **Profile Completion Guide** | New & In-Progress Candidates | Complete 4 essential profile pillars | Prominent on `/dashboard` |
| **Welcome Banner** | All Active Candidates | Resume next high-priority task | Top of `/dashboard` |
| **Resume Upload Gateway** | Candidates with 0 resumes | Upload master PDF resume | `/dashboard/resume-studio` empty state |
| **Interview Setup Wizard** | Candidates preparing for interviews | Configure role, level & interview style | "New Interview" on `/dashboard/interview-coach` |
| **Ready Countdown Buffer** | Candidates entering live arena | Verify camera/mic, prepare for AI speech | Auto-displays on interview room launch |
| **Skill Gap Guidance Banner** | Candidates with 0 verified skills | Take first technical assessment | Top of `/dashboard/skill-gap-analysis` |
| **Welcome Token Provisioning** | First-time account registration | Explore core AI features with ₹0 spend | Background hook on `signUp` event |
