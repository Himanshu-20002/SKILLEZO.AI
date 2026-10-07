# 📁 SKILLEZO AI — Resume Studio Development Roadmap
# Phase 5: Section AI Editor + Evidence Lock

> **Status:** 🟢 **COMPLETE**  
> **Milestone:** M2 (AI Intelligence & Section Optimization)  
> **Authoritative Input:** Canonical `ResumeDocument` + Phase 2 `SectionAnalysis` + Fact & Evidence Ledger  
> **Strict Invariants:** Zero Hallucination, Evidence Lock, Anti-Prompt Injection, Zero Automatic Mutation (Approval Required), 100% Deterministic Re-scoring.

---

## 1. Architectural Mission

Phase 5 introduces section-by-section AI-assisted resume improvement designed to elevate candidate phrasing, clarity, and impact without inventing reality:

```text
Candidate sees section weakness
        ↓
Opens Section Detail View
        ↓
Sees Current Resume Content
        ↓
Clicks [ Improve with AI ]
        ↓
Server builds Evidence-Locked Prompt (Anti-Injection)
        ↓
AI proposes structured improvement (Zero new facts)
        ↓
Candidate reviews Before vs After comparison
        ↓
Candidate chooses [ Keep Original ] or [ Approve Changes ]
        ↓
On Approval: Safe Section Mutator updates ResumeDocument
        ↓
Phase 2 Section Engine re-evaluates
        ↓
Phase 3 Scoring Engine recalculates deterministic score
        ↓
Candidate sees score delta (e.g. 31 → 68 Updated)
```

---

## 2. Hard Boundaries & Safety Rules

1. **Evidence Lock (Zero Hallucination)**: AI may improve wording, active verbs, and structure. It cannot invent metrics, percentages, revenue, company names, job titles, or dates not supported by the candidate's resume ledger.
2. **Anti-Prompt Injection Defense**: Resume content is treated as untrusted user data. Directives embedded within resume text cannot override safety rules or system instructions.
3. **Approval-Gated Mutation**: Requesting an AI improvement NEVER modifies the `ResumeDocument`. Modifications only occur after the candidate clicks **Approve Changes**.
4. **Authoritative Deterministic Re-scoring**: AI never computes or returns scores. Recalculation is performed exclusively by the Phase 3 `ResumeScoringEngine` after the updated document is persisted.
5. **No Visual Builder / PDF Export**: Visual rendering and `@react-pdf/renderer` compilation remain cleanly decoupled for Phases 7+.

---

## 3. Core Modules Created

| File | Purpose |
| :--- | :--- |
| `server/src/modules/resume-intelligence/editor/editor.types.ts` | Type definitions for `SectionImprovementSuggestion`, changes, and payloads. |
| `server/src/modules/resume-intelligence/editor/editor.schemas.ts` | Zod runtime validation schemas for suggestions and mutation requests. |
| `server/src/modules/resume-intelligence/editor/evidence-lock.prompt.ts` | Evidence-locked prompt builder with anti-injection defenses. |
| `server/src/modules/resume-intelligence/editor/unsupported-claim.detector.ts` | Heuristic validator detecting and flagging unverified metrics or claims. |
| `server/src/modules/resume-intelligence/editor/section-mutator.ts` | Pure function applying approved changes with version concurrency & schema checks. |
| `server/src/modules/resume-intelligence/editor/section-ai-editor.service.ts` | Orchestrates AI generation, fallback, and validation. |

---

## 4. REST API Endpoints

### A. Suggest Section Improvement
* **Route**: `POST /api/resumes/:resumeId/sections/:sectionId/suggest-improvement`
* **Body**: `{ userInstruction?: string }`
* **Behavior**: Non-mutating; returns `SectionImprovementSuggestion`.

### B. Apply Section Improvement
* **Route**: `POST /api/resumes/:resumeId/sections/:sectionId/apply-improvement`
* **Body**: `{ suggestionId: string, proposed: any, baseDocumentVersion: number }`
* **Behavior**: Validates version concurrency, mutates `ResumeDocument`, saves to DB, recalculates deterministic score, and returns updated score delta.

---

## 5. Verification Results

* **Automated Unit Tests**: 7 tests in `server/tests/unit/modules/resume-ai-editor.spec.ts` (68 total Resume Studio tests passing).
* **TypeScript Compilation**: 0 errors across `client` and `server`.
