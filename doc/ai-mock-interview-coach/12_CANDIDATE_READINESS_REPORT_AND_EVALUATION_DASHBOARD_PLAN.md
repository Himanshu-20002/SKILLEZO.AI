# 📋 Implementation Plan: Candidate Readiness Report & Evaluation Dashboard

**Document:** `doc/ai-mock-interview-coach/12_CANDIDATE_READINESS_REPORT_AND_EVALUATION_DASHBOARD_PLAN.md`  
**Date:** Saturday, November 14, 2026  
**System Stack:** Next.js 16 (App Router) + React 19 + Express 5 + MongoDB Mongoose 9 + Vitest v4 + Tailwind CSS + Better Auth  
**Prerequisites:** Phase 4 AI Evaluation Engine (`POST /evaluate`, `GET /report`, `GET /evaluations`) completed and verified.

---

## 🎯 Executive Overview & Goals

With the voice and video interview arena completed and verified, the next critical milestone is delivering the **Candidate Performance & Readiness Report Dashboard** at `/dashboard/interview-coach/report/[sessionId]`.

Currently, when a candidate concludes an interview, they see the high-level completion view (`InterviewCompletionView.tsx`), but there is no dedicated interface to review their AI evaluations, dimension scores, verbal fluency breakdown, and model answers.

This implementation plan outlines the 4 phases to design, build, mount, wire, and test the full evaluation report experience.

---

## 🏗️ Architectural Blueprint & Data Flow

```
                                      [ Candidate Completes Interview ]
                                                     │
                                                     ▼
                                      [ InterviewCompletionView.tsx ]
                                       "View Detailed Feedback" CTA
                                                     │
                                                     ▼
                                     POST /api/interviews/sessions/:id/evaluate
                                      (Generates 5-dim scores & model answers)
                                                     │
                                                     ▼
                     ┌──────────────────────────────────────────────────────────────┐
                     │   REPORT DASHBOARD: /dashboard/interview-coach/report/[id]   │
                     ├──────────────────────────────────────────────────────────────┤
                     │  1. ReadinessScoreHero.tsx                                   │
                     │     - Overall Score (0-100) + Circular Progress Indicator    │
                     │     - Readiness Level Badge (Role Model / Ready / Developing)│
                     │     - Target Role, Seniority, Format & Practice Date         │
                     ├──────────────────────────────────────────────────────────────┤
                     │  2. CompetencyBreakdownCard.tsx                              │
                     │     - 5-Dimension Competency Scorecard (0-100 bars)          │
                     │     - Technical Accuracy, Problem Solving, Structure, etc.   │
                     │     - Target Benchmark Indicator                             │
                     ├──────────────────────────────────────────────────────────────┤
                     │  3. ExecutiveFeedbackCard.tsx                                │
                     │     - Key Strengths Highlight ("What Went Well")             │
                     │     - Actionable Growth Areas ("Where to Focus Next")        │
                     ├──────────────────────────────────────────────────────────────┤
                     │  4. QuestionBreakdownAccordion.tsx                           │
                     │     - Itemized review of each question                       │
                     │     - Candidate Submitted Answer (Text / Voice Transcript)   │
                     │     - Dimension scores & AI-highlighted quoted evidence      │
                     │     - AI Senior Model Answer (Reference Gold Standard)       │
                     └──────────────────────────────────────────────────────────────┘
```

---

## 📅 The 4 Implementation Phases

### Phase 1: Report Presentation Component Architecture

**Goal:** Create isolated, modular, and accessible presentation components under `client/components/dashboard/interview-coach/report/`.

1. **`ReadinessScoreHero.tsx`**:
   - Displays the candidate's aggregate score (0–100) with a gradient circular progress indicator.
   - Highlights the Readiness Level badge:
     - 🌟 **Role Model** (90–100): Emerald gradient styling with crown/sparkles icon.
     - 🟢 **Interview Ready** (75–89): Indigo/blue gradient styling with checkmark badge.
     - 🟡 **Developing** (60–74): Amber gradient styling with trending-up badge.
     - 🔴 **Needs Practice** (< 60): Rose gradient styling with alert badge.
   - Session metadata: Target Role, Seniority tier, Format, Completion timestamp, and Duration.
   - Quick action buttons: **Print / Save PDF** (`window.print()`) and **Practice Again** (`router.push('/dashboard/interview-coach')`).

2. **`CompetencyBreakdownCard.tsx`**:
   - Visualizes the 5 core evaluation dimensions:
     1. **Technical Accuracy** (Weight: 30%)
     2. **Problem-Solving Depth** (Weight: 25%)
     3. **Answer Structure** (Weight: 15%)
     4. **Concept & Domain Coverage** (Weight: 15%)
     5. **Communication & Fluency** (Weight: 15%)
   - Each dimension renders a customized progress bar with numerical score (0-100), descriptive label, and benchmark comparison indicator (*e.g., "Senior Benchmark: 80+"*).

3. **`ExecutiveFeedbackCard.tsx`**:
   - Clean 2-column or split grid card summarizing AI qualitative feedback:
     - **Strengths (What Went Well)**: Green checkmark icons with bullet points of validated technical concepts and strong communication habits.
     - **Growth Areas (Actionable Advice)**: Amber arrow/lightbulb icons with targeted recommendations for upcoming real-world interviews.

4. **`QuestionBreakdownAccordion.tsx`**:
   - Collapsible accordion for each question in the session:
     - **Header Bar**: Question sequence (*"Question 1 of 3"*), Category pill, Difficulty badge, and Question Score pill (*e.g., "85/100"*).
     - **Question Prompt**: Full text of the technical or behavioral question.
     - **Candidate's Response**: Formatted text display of candidate's submitted answer (text or voice transcript).
     - **AI Critique & Evidence**: Dimension-level scores with quoted candidate excerpts proving mastery or gaps.
     - **Senior Model Answer**: Expandable card displaying the AI-generated ideal response showing how a Lead/Senior engineer would structure the answer.

5. **Packaging & Index Export**:
   - Export all components cleanly in `client/components/dashboard/interview-coach/report/index.ts`.

---

### Phase 2: Live Candidate Report Page (`/dashboard/interview-coach/report/[sessionId]`)

**Goal:** Build the complete App Router page route that fetches report data from the backend and renders the assembled dashboard.

1. **Page Architecture**:
   - Route: `client/app/dashboard/interview-coach/report/[sessionId]/page.tsx`.
   - Wrapped inside `<DashboardLayout>` ensuring platform sidebar, topbar, breadcrumbs, and user menu are visible.
   - Client component (`'use client'`) using `use(params)` for Next.js 15/16 parameter unwrapping.

2. **Data Fetching Pipeline**:
   - Fetches concurrently on mount:
     - `GET /api/interviews/sessions/:sessionId` (Session status, role, seniority)
     - `GET /api/interviews/sessions/:sessionId/report` (Aggregated readiness report & 5-dimension scores)
     - `GET /api/interviews/sessions/:sessionId/evaluations` (Per-question evaluation breakdown)
     - `GET /api/interviews/sessions/:sessionId/questions` (Original question prompts & expected concepts)
     - `GET /api/interviews/sessions/:sessionId/answers` (Candidate submitted answers)

3. **State & Error Handling**:
   - **Loading State**: Shimmer skeleton cards representing the Hero, Competency, and Question accordions.
   - **Error / Not Found State**: Informative error card with "Return to Interview Hub" button.
   - **Un-evaluated State**: If candidate lands on report before evaluation is generated, automatically triggers evaluation generation or renders an evaluating progress screen.

---

### Phase 3: Arena Completion & Dashboard Hub Integration

**Goal:** Wire user interactions from the live arena and the main interview hub to seamlessly direct candidates to their new report.

1. **Wire `InterviewCompletionView.tsx`**:
   - Replace the current fallback navigation with an evaluation generation trigger.
   - When candidate clicks **"View Detailed Feedback"**:
     - Check if report already exists.
     - If not, invoke `POST /api/interviews/sessions/:sessionId/evaluate` with an animated evaluating modal (*"AI Evaluator is analyzing your responses against industry benchmarks..."*).
     - Upon completion, route candidate directly to `/dashboard/interview-coach/report/${session._id}`.

2. **Update Main Hub Cards (`client/app/dashboard/interview-coach/page.tsx`)**:
   - In the "Recent Sessions" list:
     - If `session.status === 'completed'`:
       - Update the primary button to **"View Report"** (with `BarChart3` icon) deep-linking to `/dashboard/interview-coach/report/${sess._id}`.
       - Keep the secondary button as **"Plan"** for question inspection.
     - If `session.status === 'in_progress'` or `'pending'`:
       - Maintain **"Enter Arena"** CTA.

3. **Breadcrumbs & Navigation**:
   - Ensure header breadcrumb reads: `Dashboard > AI Mock Interview > Readiness Report`.

---

### Phase 4: Comprehensive Quality Assurance & Verification

**Goal:** Author unit tests, verify end-to-end integration, and guarantee zero TypeScript compiler errors.

1. **Automated Unit Test Suite (`client/tests/interview-coach-report.spec.tsx`)**:
   - Test 1: `ReadinessScoreHero` renders score, target role, and correct readiness badge styling.
   - Test 2: `CompetencyBreakdownCard` renders all 5 dimensions with correct percentage bars.
   - Test 3: `ExecutiveFeedbackCard` displays strengths and growth recommendations correctly.
   - Test 4: `QuestionBreakdownAccordion` expands/collapses and displays candidate answer vs model answer.
   - Test 5: Report page handles loading and error states gracefully.

2. **Full-Stack Verification Gates**:
   - Client TypeScript compilation: `.\client\node_modules\.bin\tsc.cmd --noEmit -p client\tsconfig.json` (0 errors).
   - Server TypeScript compilation: `npm run build` or `tsc --noEmit` on server (0 errors).
   - Automated test execution: Run all client test suites ensuring 100% pass rate.

3. **Documentation Updates**:
   - Update `05_ACTIVITY_AND_TASK_TRACKER.md` to reflect Phase 5 completion.
   - Update `README.md` indexing the new report architecture.

---

## 📂 Source Code Manifest (Deliverables)

```
client/
├── app/
│   └── dashboard/
│       └── interview-coach/
│           ├── page.tsx                                    (MODIFIED - "View Report" button on completed cards)
│           └── report/
│               └── [sessionId]/
│                   └── page.tsx                            (NEW - Candidate Readiness Report Page)
├── components/
│   └── dashboard/
│       └── interview-coach/
│           ├── arena/
│           │   └── InterviewCompletionView.tsx             (MODIFIED - Wire "View Detailed Feedback" to POST /evaluate)
│           └── report/
│               ├── ReadinessScoreHero.tsx                  (NEW - Hero score, readiness badge, meta, actions)
│               ├── CompetencyBreakdownCard.tsx             (NEW - 5-dimension competency progress bars)
│               ├── ExecutiveFeedbackCard.tsx               (NEW - Strengths and growth advice summary)
│               ├── QuestionBreakdownAccordion.tsx          (NEW - Question review, evidence, model answers)
│               └── index.ts                                (NEW - Clean module exports)
└── tests/
    └── interview-coach-report.spec.tsx                     (NEW - Unit tests for report presentation components)

doc/ai-mock-interview-coach/
├── 12_CANDIDATE_READINESS_REPORT_AND_EVALUATION_DASHBOARD_PLAN.md (THIS DOCUMENT)
└── README.md                                               (MODIFIED - Index new architecture doc)
```

---

## 🚀 Execution Checklist

- [ ] **Phase 1: Report Presentation Components**
  - [ ] Create `ReadinessScoreHero.tsx`
  - [ ] Create `CompetencyBreakdownCard.tsx`
  - [ ] Create `ExecutiveFeedbackCard.tsx`
  - [ ] Create `QuestionBreakdownAccordion.tsx`
  - [ ] Create `index.ts` export barrel
- [ ] **Phase 2: Live Candidate Report Page**
  - [ ] Create `client/app/dashboard/interview-coach/report/[sessionId]/page.tsx`
  - [ ] Wire data fetchers for session, report, evaluations, and questions
  - [ ] Add loading skeleton and error views
- [ ] **Phase 3: Arena Completion & Hub Integration**
  - [ ] Wire `InterviewCompletionView.tsx` "View Detailed Feedback" button
  - [ ] Add interactive evaluation analyzing modal/indicator
  - [ ] Update `/dashboard/interview-coach` session cards with "View Report" CTA
- [ ] **Phase 4: Automated Testing & Verification**
  - [ ] Create `client/tests/interview-coach-report.spec.tsx` (5 component tests)
  - [ ] Verify client TypeScript typecheck (0 errors)
  - [ ] Run full client test suite (206+ tests passing)
  - [ ] Update activity tracker and documentation
