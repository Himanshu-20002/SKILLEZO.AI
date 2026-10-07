# 🚀 SKILLEZO AI — Sprint 8 Execution Plan
## Skillezo Resume Studio: Architecture Freeze, 7-Section Scoring Engine, AI Editor with Evidence Lock & React-PDF Builder

> **Sprint Duration:** 5–7 Working Days  
> **Sprint Goal:** Build and launch the complete **Skillezo Resume Studio** following the browser-first master specification in `doc/resume_studio.md`. Implement the canonical `ResumeDocument` single source of truth, 7-section deterministic scoring engine, Evidence-Locked AI bullet studio, multi-template visual builder, and `@react-pdf/renderer` ATS export engine.  
> **Sprint Status:** 🟡 **PLANNED & READY FOR EXECUTION**  

---

## 🏛️ Master Architecture Blueprint

```text
                             SKILLEZO RESUME STUDIO
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
       [ANALYZE]                  [IMPROVE]                   [BUILD]
     • 7 Section Cards          • AI Suggestions           • 5 Unified Templates
     • Deterministic Scoring    • Evidence Lock (No Halluc)• React/HTML Interactive Editor
     • Weakness Diagnostics     • Instant Re-Score Delta   • @react-pdf/renderer 4.x
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                              [ATS VALIDATION]
                         • PDF Text Extraction Roundtrip
                         • Zero Data Loss Guarantee
                         • 1-Page / 2-Page Strict Fit
```

---

## 📦 Milestone & Phase Roadmap

### 🏁 Milestone 1: Foundation, Ingestion & Section Scoring (Phases 0–4)

#### **Phase 0: Architecture Freeze & Canonical `ResumeDocument`**
* **Objective:** Define the immutable TypeScript data contract that all downstream services, AI prompts, visual builders, and PDF renderers will consume.
* **Contracts Defined:**
  - `ResumeDocument` (Single Source of Truth)
  - `ResumeContact`, `ResumeSummary`, `ResumeSkillSection`, `ResumeExperienceItem`, `ResumeProjectItem`, `ResumeEducationItem`, `ResumeAchievementItem`
  - `SectionScore`, `ResumeScoreSnapshot`, `EvidenceLockRequirement`
* **Browser Checkpoint:** Create `/dashboard/resume-studio/dev` rendering sample `ResumeDocument` data.

#### **Phase 1: Resume Ingestion to `ResumeDocument`**
* **Objective:** Adapt the existing PDF/DOCX parsing infrastructure to output a validated, type-safe `ResumeDocument`.
* **Testing Fixture:** Test with `webuxhimanshu_resume.pdf` to verify 100% extraction across all 7 sections without dropped bullets.
* **Acceptance:** Upload PDF ➔ Clean Parse ➔ Validated `ResumeDocument` ➔ 0 missing major sections.

#### **Phase 2 & 3: 7-Section Diagnostics & Deterministic Scoring Engine**
* **Objective:** Implement deterministic scoring (0–100) and qualitative diagnostics for each individual section:
  1. **Contact:** Completeness, email/phone, LinkedIn/GitHub link validity, ATS safety.
  2. **Summary:** Target-role alignment, brevity, clarity, keyword density.
  3. **Skills:** Categorization, canonical coverage, duplicate detection, relevance.
  4. **Experience:** Power verb usage, quantifiable metrics, technical depth, ownership claims.
  5. **Projects:** Problem-solution clarity, stack depth, scale, link credibility.
  6. **Education:** Degree completeness, dates, relevance.
  7. **Achievements:** Specificity, awards, verified credentials.
* **Critical Rule:** Scoring is 100% deterministic (pure math in TypeScript). AI never invents or overrides numeric scores.

#### **Phase 4: Unified Resume Studio UI**
* **Objective:** Build the sleek, candidate-centric Resume Studio dashboard.
* **UI Structure:**
  - Top Hero: Overall Score (0–100), Target Role Switcher, ATS/Match/Content Pillars.
  - Section Grid: 7 interactive cards showing status badges (`✓ Optimized`, `⚠ Needs Review`, `🔴 Low Impact`), section scores, and one-click `[ Improve Section ]` triggers.

---

### 🏁 Milestone 2: AI Section Editor & Evidence Lock (Phases 5–6)

#### **Phase 5: Section AI Editor with Evidence Lock**
* **Objective:** Build an interactive bullet editor supporting `[ Accept ]`, `[ Edit ]`, `[ Reject ]`, and `[ Regenerate ]`.
* **Evidence Lock Protocol:**
  - If Gemini proposes adding a new metric (e.g., *"reduced latency by 35%"*) or tech stack not in the candidate's background:
  - System raises `⚠ Evidence Required` prompt: `[ Enter candidate proof ]` or `[ Skip metric ]`.
  - Zero unverified claims are permitted into the final document.

#### **Phase 6: Instant Re-Score & Impact Delta**
* **Objective:** Real-time re-scoring when a candidate accepts an AI suggestion.
* **UX Feedback:** Displays instant before/after transition (`61 → 84 (+23 pts)`) with clear explanation badges (+ Stronger Verbs, + Quantified Metric, + Verified Skill Match).

---

### 🏁 Milestone 3: Visual Builder, Templates & PDF Export (Phases 7–11)

#### **Phase 7 & 8: Visual Resume Builder & Multi-Template System**
* **Objective:** Fast, responsive two-pane editing experience (Left: Structured Form & Section Editor; Right: Live DOM Preview).
* **Templates:**
  - `Classic` (Traditional corporate / ATS benchmark)
  - `Modern` (Sleek SaaS / tech aesthetic)
  - `Minimal` (Clean typography-focused)
  - `Engineering` (Technical depth, dual-column skills)
  - `Executive` (Leadership & milestone focused)

#### **Phase 9 & 10: `@react-pdf/renderer` Controlled Export**
* **Objective:** Client-side vector PDF generation using `@react-pdf/renderer` 4.x.
* **Performance Rule:** PDF is compiled strictly on-demand (when user clicks `Preview PDF` or `Download PDF`), avoiding expensive background re-renders during text editing.
* **Pagination Control:** Strict page-break handling ensuring headings are never orphaned and content fits clean 1-page or 2-page bounds.

#### **Phase 11: ATS PDF Roundtrip Validator**
* **Objective:** Extract raw text from the generated PDF and diff it against `ResumeDocument` source of truth.
* **Output:** Displays `PDF Quality: 99/100 (ATS Verified)` ensuring perfect OCR readability.

---

## 👥 Task Breakdown & Assignments

### 🛠️ Developer 1 (Backend & Intelligence Core)

| Task ID | Component | Description | Est. Hours | Status |
| :--- | :--- | :--- | :---: | :---: |
| **`BE-801`** | Data Models | Define canonical `ResumeDocument` JSON Schema & Mongoose schemas | 4h | 🟢 **Complete** |
| **`BE-802`** | Parser Adapter | Map parser output to canonical `ResumeDocument` structure | 4h | 🟢 **Complete** |
| **`BE-803`** | Section Scorer | Implement deterministic scoring algorithms for all 7 sections | 6h | 🟢 **Complete** |
| **`BE-804`** | Evidence Lock | Enforce metric & claim validation in AI rewrite endpoints | 5h | 🟢 **Complete** |
| **`BE-805`** | Live Re-Score API | Endpoint calculating before/after score delta upon edits | 4h | 🟢 **Complete** |
| **`BE-806`** | Unit Tests | Add Vitest test suites for all 7 section scoring rules & evidence lock | 5h | 🟢 **Complete** |

### 🎨 Developer 2 (Frontend & UI Engineering)

| Task ID | Component | Description | Est. Hours | Status |
| :--- | :--- | :--- | :---: | :---: |
| **`FE-801`** | Dev Route | Scaffold `/dashboard/resume-studio/dev` with mock `ResumeDocument` | 2h | 🟢 **Complete** |
| **`FE-802`** | Studio Dashboard | Build unified Resume Studio page with 7 interactive section cards | 6h | 🟢 **Complete** |
| **`FE-803`** | AI Section Editor | Evidence-Locked AI improvement workspace with Accept/Reject workflow | 6h | 🟢 **Complete** |
| **`FE-804`** | Visual Renderer | Modular HTML/CSS Visual Resume Renderer with Live Reactive Preview | 8h | 🟢 **Complete** |
| **`FE-805`** | Template Engine | Implement ATS-friendly design templates | 6h | ⚪ Next (Phase 8) |
| **`FE-806`** | React-PDF Export | Wire `@react-pdf/renderer` 4.x with controlled on-demand download | 5h | ⚪ Planned (Phase 9) |
| **`FE-807`** | PDF Quality Diff | Build ATS PDF roundtrip validator UI card | 4h | ⚪ Planned (Phase 11) |

---

## 🧪 Browser-First Verification Protocol

Every phase must pass this 5-point checklist before moving to the next:
1. ✅ **Browser Verified:** UI elements render properly without layout shifts or console errors.
2. ✅ **API Verified:** Backend endpoints respond in `< 50ms` with type-checked JSON.
3. ✅ **TypeScript Clean:** Zero errors on `npx tsc --noEmit` across `client/` and `server/`.
4. ✅ **Test Green:** Vitest test suites pass with 100% green status.
5. ✅ **Zero Regressions:** Existing Job Center, Auth, and Resume Upload flows remain fully functional.
