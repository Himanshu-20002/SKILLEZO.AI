# SKILLEZO AI — Phase 6E Implementation Plan
## Tailored Resume Studio Integration, Comparison & Tailoring Insights

---

## 1. Executive Summary & Objective

The objective of **Phase 6E** is to integrate the **Tailored Resume** (materialized in Phase 6D from approved Phase 6C Tailoring Plans) into the **Resume Studio** as a first-class citizen. 

Phase 6E establishes:
1. **Tailored Identity & Target Job Context** in Resume Studio without ambiguity.
2. **Master-vs-Tailored Comparison** powered by a 100% deterministic pure-TypeScript AST diff engine (no LLM hallucinations or guessing).
3. **Tailoring Insights & Traceability** linking every generated modification back to Phase 6C Proposals, Phase 6B Requirements, and verified Candidate Evidence.
4. **Independent Tailored Editing & Autosave** with absolute protection of the Master Resume and Career Profile (Master remains strictly read-only from Tailored Studio).
5. **Seamless Variant Switching with Dirty-State Protection** across Master and Tailored variants.

---

## 2. Product Boundaries & Architecture Invariants

```text
                  CAREER PROFILE (Canonical career facts)
                         │ (Untouched)
                         ↓
                  ┌──────────────┐
                  │ MASTER RESUME│ (Read-only baseline / comparison source)
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ↓                     ↓
        MASTER STUDIO          JOB ENGINE
                                    │
                                    ↓
                                  6A JobProfile
                                    │
                                    ↓
                                  6B JobMatchResult
                                    │
                                    ↓
                                  6C TailoringPlan
                                    │
                                    ↓
                                  6D Tailored Resume (ResumeModel + ResumeDocument)
                                    │
                                    ↓
                                  6E TAILORED RESUME STUDIO
                                  ├── 1. Tailored Identity & Header Context
                                  ├── 2. Variant Switcher with Dirty Guard
                                  ├── 3. Deterministic Master vs Tailored Comparison
                                  ├── 4. Tailoring Insights (6B Match + 6C Changes)
                                  ├── 5. "Why this change?" Evidence Drawer
                                  └── 6. Independent Tailored Editing & Autosave
```

### Strict Non-Negotiable Invariants:
1. **Master Resume is Read-Only from Tailored Studio:** Edits while viewing a Tailored Resume only persist to the Tailored record (`selectedResumeId`). Master Resume is never mutated.
2. **Career Profile is Untouched:** Never write to `ProfileModel` or invoke profile mutation services from Studio.
3. **No Duplicate Source of Truth:** Do not create a database model for `TailoredStudioDocument`, `ComparisonDocument`, or `TailoringInsightDocument`. The canonical source is `ResumeModel` + `ResumeDocument`. Comparison and insights are **derived in-memory views**.
4. **100% Deterministic Diff:** Comparison must compare `Master.resumeDocument` vs `Tailored.resumeDocument` deterministically. **Never use an LLM to compute diffs or invent explanations.**
5. **No Second Scoring Engine:** Re-use Phase 6B `JobMatchResult` and Phase 6C `TailoringPlan`. Do not calculate a new ATS or match score.
6. **No Automatic Regeneration:** Manual edits in Studio must not trigger automatic 6C/6D regeneration.
7. **Preserve Phase 5.5 Three-Zone Layout:** Left (Structure / Navigation), Center (A4 Canvas), Right (Intelligence / Tailoring Insights). No permanent fourth column on desktop.
8. **PDF Export Authoritativeness:** Downloading PDF exports the active Tailored Resume, never Master.

---

## 3. Component & File Map

### New Files to Create:
| File | Layer | Purpose |
|---|---|---|
| `client/types/resume-comparison.types.ts` | Frontend Types | Strongly typed data contracts for diff items, change types, and comparison results. |
| `client/lib/resume-studio/resume-diff.ts` | Frontend Utility | Pure TypeScript deterministic diff engine comparing Master AST vs Tailored AST. |
| `client/lib/resume-studio/__tests__/resume-diff.test.ts` | Unit Tests | Exhaustive unit tests for diff engine across summary, skills, experience, projects, layout, and user edits. |
| `client/hooks/useTailoredStudioContext.ts` | Frontend Hook | Fetches & memoizes Phase 6B match, Phase 6C plan, and Master comparison data for the active tailored resume. |
| `client/components/resume-studio/TailoringInsightsView.tsx` | UI Component | Right-zone intelligence panel for Tailored Resumes (Target Job banner, 6B match states, 6C changes summary, protected items). |
| `client/components/resume-studio/comparison/MasterTailoredComparisonModal.tsx` | UI Modal | Side-by-side and unified diff modal with section tabs, change badges, and summary counts. |
| `client/components/resume-studio/comparison/SectionDiffView.tsx` | UI Component | Individual section diff rendering (Master vs Tailored snippet highlight). |
| `client/components/resume-studio/comparison/EvidenceDrawer.tsx` | UI Drawer | Slide-over drawer explaining "Why did this change?" with 6B requirements, 6C proposal decision, and candidate evidence. |
| `client/components/resume-studio/VariantSwitcherModal.tsx` | UI Modal | Unsaved-changes confirmation dialog when switching variants with unsaved edits. |
| `server/src/modules/job-tailoring/__tests__/tailored-resume-immutability.test.ts` | Backend Test | Critical integration test verifying Master Resume immutability when editing Tailored Resumes. |

### Existing Files to Update:
| File | Purpose of Change |
|---|---|
| `client/components/resume-studio/ResumeStudioHeader.tsx` | Add Tailored identity badge, Target Job/Company subtitle, `[Compare with Master]` button, variant switcher dropdown, and dirty guard. |
| `client/components/resume-studio/ResumeInsightsPanel.tsx` | Integrate `TailoringInsightsView` as a tab alongside `AtsDiagnosticsView` when a Tailored resume is active. |
| `client/components/resume-studio/ResumeSectionNavigator.tsx` | Include variant switcher integration and target job metadata badge. |
| `client/hooks/useResumeStudio.ts` | Add dirty-state tracking (`isDirty`), variant switching with unsaved guard, and export active resume document for PDF. |
| `client/app/dashboard/resume-studio/page.tsx` | Mount `MasterTailoredComparisonModal`, wire comparison state, and support query param `?resumeId=`. |
| `client/services/resume.service.ts` | Add endpoint helper for tailored resume document updates if needed. |
| `server/src/modules/resume/resume.service.ts` | Verify Master immutability guard ensuring tailored update calls never mutate Master. |

---

## 4. Phase-by-Phase Implementation Steps

### Phase 6E.1: Data Contracts & Pure Diff Engine
- **Files:** `client/types/resume-comparison.types.ts`, `client/lib/resume-studio/resume-diff.ts`
- **Specification:**
  - Define `ResumeChangeType`:
    `'PROMOTED' | 'DE_EMPHASIZED' | 'REWRITTEN' | 'REORDERED' | 'SELECTED' | 'EXCLUDED' | 'EDITED' | 'USER_EDIT'`
  - Define `ResumeDiffItem`:
    - `id`: unique identifier
    - `section`: `'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'layout'`
    - `changeType`: `ResumeChangeType`
    - `title`: human-readable label (e.g., `"Work Experience · Senior Frontend Developer"`)
    - `masterValue`: text or array from Master AST
    - `tailoredValue`: text or array from Tailored AST
    - `proposalId`: linked Phase 6C proposal ID (if generated)
    - `proposalTitle`: title of proposal
    - `reason`: approved rationale from 6C
    - `requirementIds`: matching 6B requirement IDs
    - `evidence`: candidate evidence references
    - `isUserEdit`: boolean flag indicating if the item was edited manually post-generation
  - **Deterministic Diff Algorithm:**
    - **Summary:** String comparison ignoring insignificant whitespace. Checks if matches proposal target or user edit.
    - **Skills:** Match skills by normalized name. Detect skills promoted to top category/position, de-emphasized, or reordered.
    - **Experience:** Match experiences by `companyName` + `jobTitle`. Compare bullet points by index and similarity. Map to proposals where `target.section === 'EXPERIENCE'`. Mark post-generation changes as `USER_EDIT`.
    - **Projects:** Compare project order, inclusions, and bullet text. Detect `SELECTED`, `EXCLUDED`, or `REORDERED`.
    - **Section Order:** Compare `layout.sectionOrder` between Master and Tailored.
    - **Proposal Traceability:** Pure lookup against `TailoringPlan.proposals` by target ref.
    - **Edge Cases Handled:**
      - Null vs empty arrays (treated as equivalent, no false diff).
      - Reordered keys in JSON objects.
      - Runtime IDs and timestamps omitted from comparison.
      - Zero false changes when content is semantically identical.

### Phase 6E.2: Tailoring Context Hook
- **File:** `client/hooks/useTailoredStudioContext.ts`
- **Specification:**
  - Hook activates when `currentResume.variantType === 'TAILORED'`.
  - Reuses:
    - `jobMatchService.getJobMatch(targetJobId)` (Phase 6B match data).
    - `tailoringPlanService.getPlan(targetJobId)` (Phase 6C proposal data).
    - Master Resume record from `resumeService.getMasterResume()`.
  - Computes `ResumeComparisonResult` using `computeResumeDiff` memoized on `[masterDoc, tailoredDoc, tailoringPlan]`.
  - Extracts staleness state: `isStale` and `stalenessReason`.

### Phase 6E.3: Studio Header & Identity Refresh
- **File:** `client/components/resume-studio/ResumeStudioHeader.tsx`
- **Specification:**
  - **Master Variant:** Displays `⭐ MASTER RESUME` in amber pill.
  - **Tailored Variant:** Displays `⭐ TAILORED RESUME` in indigo pill, with subtitle:
    `[targetJobTitle] · [targetCompany] — Based on Master Resume`.
  - **Actions in Tailored Mode:**
    - `[Compare with Master]` button with badge showing change count (e.g. `12 changes`).
    - `[PDF]` export button.
    - `← Back to Tailoring` (if `targetJobId` present).
    - `← Resume Portfolio` navigation.
  - **Variant Switcher Dropdown:**
    - Fast dropdown listing Master Resume and Tailored variants.
    - **Switching Safety:** If `saveStatus === 'unsaved'`, triggers confirmation modal:
      `"Unsaved changes: Save before leaving? [Save & Continue] [Discard] [Cancel]"`.

### Phase 6E.4: Tailoring Insights Panel (Right Studio Zone)
- **Files:** `client/components/resume-studio/TailoringInsightsView.tsx`, `ResumeInsightsPanel.tsx`
- **Specification:**
  - When Tailored is active, adds tab switcher: `[Tailoring Insights]` / `[ATS & Scores]`.
  - **Target Job Summary Card:** Job Title, Company, Seniority, and staleness status badge (`✓ Up to date` vs `⚠ Source data changed`).
  - **Match Context (Phase 6B):**
    - Proven, Underrepresented, Missing/Protected counts.
    - Requirement list with 6B status pills:
      `PROVEN_RELEVANT`, `PROVEN_UNDERREPRESENTED`, `PARTIAL_MATCH`, `RELATED_EVIDENCE`, `MISSING`, `INSUFFICIENT_EVIDENCE`.
    - Truthfulness reassurance note: *"Missing requirements were intentionally protected and not added due to absence of verified candidate evidence."*
  - **Tailoring Decisions (Phase 6C/6D):**
    - Plan Intensity (`BALANCED`, `LIGHT`, `AGGRESSIVE`).
    - Proposal breakdown: e.g. `12 proposals: 8 accepted, 2 edited, 2 rejected/protected`.
    - Promoted skills count, rewritten bullets count, reordered sections count.
  - Button to open **Master-vs-Tailored Comparison Modal**.

### Phase 6E.5: Master-vs-Tailored Comparison Modal & Evidence Drawer
- **Files:**
  - `client/components/resume-studio/comparison/MasterTailoredComparisonModal.tsx`
  - `client/components/resume-studio/comparison/SectionDiffView.tsx`
  - `client/components/resume-studio/comparison/EvidenceDrawer.tsx`
- **Specification:**
  - Modal with Side-by-Side (Master on left, Tailored on right) and Unified view toggle.
  - Section navigation tabs with change badges: `All`, `Summary`, `Skills`, `Experience`, `Projects`, `Layout`.
  - Side-by-side snippet comparison showing exact changes with word/sentence highlighting.
  - Badges for change types: `[PROMOTED]`, `[DE_EMPHASIZED]`, `[REWRITTEN]`, `[REORDERED]`, `[USER_EDIT]`.
  - Action button: `[Why this change?]` on each item.
  - **Evidence Drawer:**
    - Slide-over drawer displaying:
      - Target Requirement name & category.
      - Match State (`PROVEN_UNDERREPRESENTED`).
      - Verified candidate evidence excerpt from Career Profile.
      - 6C Proposal decision, confidence score, and approval timestamp.
      - If `USER_EDIT`: *"Manually edited by candidate in Resume Studio. Not generated by AI."*

### Phase 6E.6: Editing Safety & Master Immutability
- **Files:** `client/hooks/useResumeStudio.ts`, `server/src/modules/resume/resume.service.ts`
- **Specification:**
  - All edits (autosave, AI suggestions, builder config) target `selectedResumeId` only.
  - Backend guard in `ResumeService.ts`: verify that tailored resume update requests do not modify Master record.
  - User edit attribution: When user modifies a bullet post-generation, diff engine labels it `USER_EDIT` and does not attribute to 6C/AI.
  - Regeneration warning modal: If user attempts to re-run 6D generation when manual edits exist, prompt user that manual edits may be replaced.

### Phase 6E.7: Navigation, Routing & PDF Authoritativeness
- **Files:** `client/app/dashboard/resume-studio/page.tsx`
- **Specification:**
  - Support query param: `/dashboard/resume-studio?resumeId=<resumeId>`.
  - Server-backed resume loading.
  - PDF export passes active tailored `resumeDoc` to `exportResumeToPdf`. Never exports Master when Tailored is active.

---

## 5. Verification & Testing Strategy

### 1. Focused Automated Tests:
1. **Diff Engine Unit Tests (`client/lib/resume-studio/__tests__/resume-diff.test.ts`):**
   - Summary change: Master != Tailored -> 1 summary change.
   - Skills promotion: Promoted skill -> `PROMOTED`.
   - Experience bullet rewrite -> `REWRITTEN`.
   - Post-generation edit -> `USER_EDIT`.
   - Identical documents -> 0 changes (no false positives).
   - Traceability: Proposal -> Requirement -> Evidence resolution.
2. **Critical Master Immutability Test (`server/src/modules/job-tailoring/__tests__/tailored-resume-immutability.test.ts`):**
   - Load Tailored Resume.
   - Edit summary and experience bullet.
   - Save changes.
   - Reload Master Resume.
   - Assert: Master Resume summary and bullets are 100% untouched.

### 2. Full Regression Baseline:
- **Server:** Run `cd server && npx vitest run` & `npx tsc --noEmit`. Verify 0 errors, no regressions on existing 19 tests.
- **Client:** Run `cd client && npx vitest run` & `npx tsc --noEmit`. Verify 0 errors, no regressions on existing 12 tests.

### 3. Manual QA Flow:
1. Open generated Tailored Resume (`Senior Frontend Developer · Acme Corp`).
2. Verify Tailored header identity and Target Job badges.
3. Open `Tailoring Insights`: Verify requirements match 6B states, proposal breakdown matches 6C.
4. Click `[Compare with Master]`: Verify side-by-side diff matches actual changes.
5. Click `[Why this change?]`: Verify Evidence Drawer shows requirement, match state, and verified evidence.
6. Edit a bullet in the Tailored Resume -> Verify autosave indicates `Saved ✓`.
7. Re-open comparison -> Verify bullet shows `[USER_EDIT]`.
8. Switch to Master Resume -> Verify Master bullet is completely unchanged.
9. Switch back to Tailored Resume -> Verify edit is preserved.
10. Download PDF -> Verify PDF contains Tailored content.

---

## 6. Definition of Done (DoD)

- [ ] Tailored Resume identity clearly presented in Studio Header.
- [ ] Target Job context (role, company, 6B match counts) displayed.
- [ ] Variant switcher enables switching between Master and Tailored with dirty guard.
- [ ] 100% deterministic pure diff engine implemented (zero LLM calls).
- [ ] Side-by-side and unified Master-vs-Tailored comparison view operational.
- [ ] Proposal traceability & Evidence Drawer working for every change.
- [ ] Manual user edits attributed to `USER_EDIT`.
- [ ] Master Resume and Career Profile completely untouched during Tailored editing.
- [ ] PDF export outputs active Tailored Resume.
- [ ] All unit and immutability tests pass.
- [ ] Full client and server test regression passes with 0 errors.
- [ ] TypeScript checks on client and server return 0 errors.
