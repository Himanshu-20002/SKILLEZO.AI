# SKILLEZO AI — Phase 6E
# Tailored Resume Studio Integration, Comparison & Tailoring Insights
## Antigravity IDE Implementation Prompt

## 1. Objective

Implement **Phase 6E — Tailored Resume Studio Integration, Master-vs-Tailored Comparison & Tailoring Insights**.

Phases 1–6D are implemented and frozen.

6E is the **presentation, editing, comparison, and job-context integration layer** for the Tailored Resume created by 6D.

The goal is to make a Tailored Resume a first-class Resume Studio experience without creating another resume engine, tailoring engine, scoring engine, or source of truth.

---

## 2. Existing Architecture

```text
CAREER PROFILE
     │
     ↓
MASTER RESUME
     │
     ├───────────────────────────────┐
     │                               │
     ↓                               ↓
RESUME STUDIO                  6A JOB PROFILE
                                     ↓
                              6B CAREER ↔ JOB MATCH
                                     ↓
                              6C TAILORING PLAN
                                     ↓
                              6D TAILORED RESUME
                                     ↓
                              6E STUDIO INTEGRATION
                                     │
                                     ├── Tailored Resume
                                     ├── Master Comparison
                                     └── Tailoring Insights
```

Product boundaries:

```text
Career Profile
= canonical career facts / source of truth

Master Resume
= presentation artifact derived from Career Profile

Tailored Resume
= independent job-specific presentation variant derived from Master Resume
  using approved 6C decisions and materialized by 6D

Application
= future immutable historical snapshot
```

Do not change these boundaries.

---

## 3. Scope

### IN SCOPE

- Tailored Resume identity in Resume Studio.
- Target job/company context.
- Master ↔ Tailored switching.
- Master-vs-Tailored comparison.
- Section/item change visualization.
- Tailoring Insights.
- Requirement/evidence context from 6B.
- Proposal context from 6C.
- 6D generation context.
- Tailored Resume editing using existing Studio mechanisms.
- Independent autosave.
- Stale/source indicators.
- Portfolio and Job/Tailoring navigation.
- Accessibility, responsive behavior, tests, regression.

### OUT OF SCOPE

Do NOT implement:

- Career Profile redesign.
- Master Resume mutation.
- New Job Analysis.
- New Career ↔ Job matching.
- New TailoringPlan engine.
- New Tailored Resume generation.
- New AI rewriting engine.
- New ATS/match scoring engine.
- Auto Apply.
- Applications/application snapshots.
- Job scraping.
- DOCX.
- New PDF renderer.
- New ResumeDocument AST.
- New ResumeRenderer.
- Career GPS redesign.
- Another full Resume Studio architecture rewrite.

Reuse the Phase 5.5 Studio architecture.

---

## 4. NON-NEGOTIABLE INVARIANTS

### 4.1 Master is read-only from Tailored Studio

When Tailored is active:

```text
Master Resume = comparison/reference source only
```

No Tailored Studio interaction may save into Master.

### 4.2 Career Profile is untouched

Never write career facts to `ProfileModel`.

### 4.3 Tailored remains independent

All edits must target the existing `TAILORED` Resume record.

Never mutate `MASTER`.

### 4.4 No duplicate source of truth

Do not create a persisted:

```text
TailoredStudioDocument
ComparisonDocument
TailoringInsightDocument
```

The canonical Tailored Resume remains the existing `ResumeModel` + `ResumeDocument`.

Comparison and insights are derived views.

### 4.5 No second scoring engine

Reuse existing ATS/role/impact/brevity diagnostics where needed.

### 4.6 No automatic regeneration

Manual Tailored edits must NOT automatically rerun 6C/6D.

Regeneration remains an explicit workflow.

---

## 5. INSPECT BEFORE CODING

First inspect and reuse:

### Resume Studio

- `useResumeStudio`
- `ResumeStudioWorkspace`
- `ResumeStudioHeader`
- `ResumeEditorPanel`
- `ResumePreviewPanel`
- `ResumeInsightsPanel`
- `ResumeSectionNavigator`
- `LiveResumeCanvas`
- `ResumeRenderer`
- `AtsDiagnosticsView`
- `SectionAiWorkspace`
- `ResumeBuilderControls`
- autosave
- dirty/saved state
- variant loading
- `resumeId` routing
- PDF download
- delete behavior

### Resume Portfolio

Inspect:

- Master card
- Tailored card
- metadata
- `targetJobId`
- `targetJobTitle`
- `targetCompany`
- `parentResumeId`
- stale state

### Phase 6B

Inspect:

- `JobMatchResult`
- requirement matches
- match states
- evidence references
- requirement IDs
- source versions

### Phase 6C

Inspect:

- `TailoringPlan`
- proposal IDs
- decisions
- actions
- requirement IDs
- evidence
- intensity
- source versions
- status

### Phase 6D

Inspect:

- Tailored Resume fields
- `sourceTailoringPlanId`
- `sourceTailoringPlanVersion`
- source profile/job/match versions
- generation metadata
- existing tailored-resume endpoints

Do not duplicate existing APIs/state.

---

## 6. TAILORED IDENTITY

The header must clearly distinguish the active variant.

Example:

```text
← Resume Portfolio

⭐ TAILORED RESUME
Senior Frontend Developer · Acme Corp

Based on Master Resume

● Saved     [Compare with Master] [PDF]
```

Master should be:

```text
⭐ MASTER RESUME
```

Avoid ambiguous labels such as "Resume" or "Optimized Resume".

---

## 7. TARGET JOB CONTEXT

When Tailored is active, show:

```text
Target Job
Senior Frontend Developer

Company
Acme Corp
```

Where available, show lightweight existing match context:

```text
Requirements
12 total

Proven
8

Underrepresented
2

Missing / Protected
2
```

Reuse 6B data. Do not calculate a new score.

---

## 8. VARIANT SWITCHER

Provide a clear switcher:

```text
[ Senior Frontend Developer — Tailored ▾ ]
```

Example:

```text
⭐ Master Resume
Senior Frontend Developer — Acme Corp
Tailored
Product Engineer — XYZ
Tailored
```

Use existing Portfolio metadata. Do not load full documents just for the switcher.

---

## 9. SWITCHING SAFETY

If the active Tailored Resume is dirty:

```text
Unsaved changes
Save before leaving?

[Save & Continue]
[Discard]
[Cancel]
```

Never silently discard changes.

Master remains read-only where appropriate.

---

## 10. THREE-ZONE STUDIO

Reuse Phase 5.5:

```text
┌─────────────────────────────────────────────────────────────┐
│ Header / Variant / Job Context                              │
├───────────────┬───────────────────────────┬─────────────────┤
│ Resume        │                           │ Tailoring /     │
│ Structure     │      A4 Resume Canvas     │ Intelligence    │
│               │                           │                 │
│ Sections      │                           │ Overview        │
│ Health        │                           │ Changes         │
│               │                           │ Requirements    │
│               │                           │ Evidence        │
└───────────────┴───────────────────────────┴─────────────────┘
```

Do not create a fourth permanent desktop column.

---

## 11. TAILORING INSIGHTS

When Tailored is active, make the existing right-side intelligence panel job-aware.

Example:

```text
TAILORING INSIGHTS

Target Job
Senior Frontend Developer
Acme Corp

Match Context
━━━━━━━━━━━━━━━━
React          ✓ Proven
Next.js        ↑ Promoted
TypeScript     ↑ Emphasized
AWS            — Not added
Docker         — Not added

Tailoring Changes
━━━━━━━━━━━━━━━━
3 skills promoted
2 bullets changed
1 project promoted
1 section reordered

Plan
━━━━━━━━━━━━━━━━
Balanced
12 proposals
8 accepted
2 edited
2 rejected/protected
```

All values must come from actual backend data.

Never invent counts.

---

## 12. REQUIREMENT STATES

Reuse the existing Phase 6B states:

```text
PROVEN_RELEVANT
PROVEN_UNDERREPRESENTED
PARTIAL_MATCH
RELATED_EVIDENCE
MISSING
INSUFFICIENT_EVIDENCE
NOT_APPLICABLE
NEEDS_REVIEW
```

Example:

```text
Next.js
PROVEN_UNDERREPRESENTED
→ Promoted in Tailored Resume
```

```text
AWS
MISSING
→ Not added
```

Make clear that missing requirements were intentionally not added because candidate evidence was insufficient.

---

## 13. MASTER VS TAILORED COMPARISON

This is the primary 6E feature.

Provide:

```text
[ Compare with Master ]
```

Display meaningful differences:

```text
MASTER                         TAILORED

Original Summary               Tailored Summary

Original Skills                Promoted Skills

Original Experience            Modified Experience

Original Projects              Reordered Projects
```

Comparison must be a derived view, not another persisted resume source.

---

## 14. COMPARISON LEVELS

Support:

### Document level

```text
12 changes
```

### Section level

```text
Summary       1 change
Skills        3 changes
Experience    2 changes
Projects      1 change
Layout        1 change
```

### Item level

Example:

```text
Experience — Acme Corp

MASTER
Built web applications using React.

TAILORED
Built production React and Next.js applications...
```

---

## 15. CHANGE TYPES

Reuse Phase 6C semantics where possible:

```text
PROMOTED
DE_EMPHASIZED
REWRITTEN
REORDERED
SELECTED
EXCLUDED
EDITED
```

Each displayed generated change should map to a source proposal when applicable.

---

## 16. WHY DID THIS CHANGE?

Every meaningful generated change should be explainable.

Example:

```text
Next.js
Promoted

Why?
→ Required by target job
→ Candidate has verified Next.js evidence
→ Approved in Tailoring Plan
```

For a bullet:

```text
Experience Bullet
Rewritten

Why?
→ Supports target responsibility
→ Uses existing candidate evidence
→ Approved in Phase 6C
```

For an exclusion:

```text
AWS
Not Added

Why?
→ Job requirement
→ No verified candidate evidence
→ Protected by DO_NOT_ADD
```

Never invent explanations.

---

## 17. PROPOSAL TRACEABILITY

Where possible:

```text
Resume Change
      ↓
Tailoring Proposal
      ↓
Requirement IDs
      ↓
JobMatchResult
      ↓
Evidence
```

The UI should show human-readable context, not raw internal IDs unless useful.

---

## 18. EVIDENCE DRAWER

A "Why?" action should open compact evidence context.

Example:

```text
WHY THIS CHANGE?

Requirement
Next.js

Match
PROVEN_UNDERREPRESENTED

Evidence
Experience — Frontend Developer
"Built applications using Next.js..."

Decision
PROMOTE

Approved
Yes
```

Reuse existing evidence/provenance structures.

Do not expose unrelated candidate information.

---

## 19. MANUAL TAILORED EDITING

Tailored Resume must remain editable through the existing Studio.

```text
Tailored Resume
    ↓
Edit bullet
    ↓
Autosave
```

All edits must target the Tailored Resume ID.

Never send them to the Master endpoint.

---

## 20. USER EDIT ATTRIBUTION

After 6D:

```text
6D generated Tailored Resume
        ↓
User edits Tailored Resume
```

The system must distinguish:

```text
6C/6D generated change
```

from:

```text
USER_EDIT
```

If existing revision/source metadata supports this, reuse it.

Do not falsely claim that a manual edit came from AI/6C.

Do not build a full version-history system unless already present.

---

## 21. NO PLAN MUTATION FROM STUDIO EDITS

Editing the Tailored Resume must NOT mutate:

```text
TailoringPlan
JobMatchResult
JobProfile
Career Profile
Master Resume
```

The TailoringPlan remains the historical explanation for the original 6D materialization.

Do not automatically rewrite proposal decisions from Studio edits.

---

## 22. REGENERATION SAFETY

If the user attempts to regenerate after manual edits, reuse the Phase 6D protection.

Example:

```text
This tailored resume has manual edits.

Regenerating may replace those changes.

[Cancel]
[Generate New Version]
```

Do not create a new regeneration engine in 6E.

---

## 23. STALENESS

Reuse Phase 6C/6D version logic.

Show:

```text
✓ Up to date
```

or:

```text
⚠ Source data changed

Career Profile or Job Analysis changed after this
Tailored Resume was generated.

[Review / Regenerate]
```

Do not create another stale algorithm.

A resume may be:

```text
Customized + Current
Customized + Stale
Generated + Current
Generated + Stale
```

Do not conflate customization with staleness.

---

## 24. PDF

Reuse existing PDF download functionality.

When Tailored is active, PDF must export the active Tailored Resume.

Never accidentally export Master.

Do not create a new PDF renderer.

---

## 25. NAVIGATION

Provide:

```text
← Resume Portfolio
```

and, when entered from the tailoring flow:

```text
← Back to Tailoring
```

Reuse existing routes/context.

Do not build a new Job Engine.

---

## 26. ROUTING

Continue using:

```text
/dashboard/resume-studio?resumeId=<resumeId>
```

The page must load the requested resume variant.

The server remains authoritative.

Do not infer identity only from client state.

---

## 27. API REUSE

Reuse existing APIs where possible.

Potential existing data sources:

```http
GET /api/resumes/:resumeId
GET /api/resumes/portfolio
GET /api/job-profiles/:jobProfileId/match
GET /api/job-profiles/:jobProfileId/tailoring-plan
GET /api/job-profiles/:jobProfileId/tailored-resume
```

Do not create duplicate endpoints if current APIs already provide the data.

Do not persist a separate Comparison model.

---

## 28. COMPARISON DATA CONTRACT

If a typed comparison representation is required, make it derived/non-persistent.

Conceptually:

```ts
type ResumeChange = {
  id: string;
  section:
    | "summary"
    | "skills"
    | "experience"
    | "projects"
    | "education"
    | "layout";

  changeType:
    | "PROMOTED"
    | "DE_EMPHASIZED"
    | "REWRITTEN"
    | "REORDERED"
    | "SELECTED"
    | "EXCLUDED"
    | "EDITED"
    | "USER_EDIT";

  entityId?: string;
  proposalId?: string;

  masterValue?: unknown;
  tailoredValue?: unknown;

  requirementIds?: string[];
  evidenceIds?: string[];
};
```

Adapt to actual project types.

Do not duplicate existing domain models.

---

## 29. DETERMINISTIC DIFF

Comparison must deterministically compare:

```text
Master ResumeDocument
vs
Tailored ResumeDocument
```

Do NOT use an LLM to determine differences.

Do NOT use an LLM to invent explanations.

Use TailoringPlan/JobMatchResult for explanation context.

---

## 30. DIFF EDGE CASES

Handle:

- reordered skills
- reordered projects
- changed bullet text
- changed summary
- selected/excluded projects
- section-order changes
- empty sections
- null optional fields
- missing sections
- manual edits after generation

Do not report irrelevant differences caused by:

- object ordering
- generated IDs
- timestamps
- runtime metadata
- serialization order
- irrelevant builder internals

---

## 31. NO FALSE CHANGES

If Master and Tailored content are semantically unchanged for a section:

```text
No change
```

Do not report changes caused only by serialization or metadata.

---

## 32. UI MODES

Reuse the Phase 5.5 modes:

```text
[ Content ]
[ Design ]
[ ATS & Score ]
```

Tailoring context should preferably integrate into the existing intelligence/content experience rather than creating a completely separate Studio architecture.

---

## 33. RESPONSIVE

### Desktop

Existing 3-zone layout.

### Tablet

Existing responsive behavior.

### Mobile

Existing segmented/floating navigation.

Do not create a separate mobile architecture.

---

## 34. ACCESSIBILITY

Ensure:

- keyboard-accessible variant switcher
- keyboard-accessible compare controls
- visible focus
- semantic buttons
- proper ARIA labels
- no color-only meaning
- sufficient contrast
- screen-reader-readable change descriptions
- proper modal focus management

---

## 35. PERFORMANCE

Avoid unnecessary document retrieval.

Use:

- metadata-only data for switchers
- existing resume retrieval
- memoized comparison where appropriate
- derived client state where safe

Avoid API requests on every hover.

Do not introduce a complex caching framework.

---

## 36. SECURITY

Server must verify ownership for:

- resumeId
- jobProfileId
- proposal context
- evidence context

A user must never access:

- another user's Master Resume
- another user's Tailored Resume
- another user's JobProfile
- another user's evidence

Do not trust IDs from the browser as ownership proof.

---

## 37. CRITICAL MASTER IMMUTABILITY TEST

Add an integration test:

```text
Open Tailored Resume
        ↓
Edit summary
        ↓
Save
        ↓
Reload Master
```

Expected:

```text
Master summary = unchanged
Tailored summary = edited
```

This is a critical 6E safety test.

---

## 38. COMPARISON TESTS

Test:

### Summary

```text
Master summary ≠ Tailored summary
→ one summary change
```

### Skills

```text
Promoted skill
→ PROMOTED
```

### Experience

```text
Changed bullet
→ REWRITTEN / EDITED
```

### Projects

```text
Reordered project
→ SELECTED / PROMOTED
```

### Layout

```text
Section order changed
→ REORDERED
```

### No changes

```text
Master = Tailored
→ zero changes
```

### Manual edit

```text
6D output
→ user edits bullet
→ comparison identifies user edit where appropriate
```

---

## 39. TRACEABILITY TESTS

Where a generated change has a proposal:

```text
Change
 ↓
Proposal
 ↓
Requirement
 ↓
Evidence
```

must resolve correctly.

If a manual edit has no proposal:

```text
source = USER_EDIT
```

Do not falsely attribute it to 6C/AI.

---

## 40. TAILORING INSIGHTS TESTS

Verify:

- counts match actual backend data
- requirement states match JobMatchResult
- proposal counts match TailoringPlan/6D
- protected exclusions display correctly
- missing requirements display correctly
- no unsupported claims appear
- no new score is calculated

---

## 41. FRONTEND TESTS

Add focused tests for:

- Tailored identity header
- target job/company
- variant switcher
- dirty-state protection
- comparison open/close
- summary diff
- skill diff
- experience diff
- project diff
- section-order diff
- evidence drawer
- proposal traceability
- stale state
- customized state
- PDF action
- Portfolio navigation
- Job/Tailoring navigation
- Master read-only behavior

---

## 42. BACKEND TESTS

Only if new backend comparison/retrieval logic is actually required.

Test:

- ownership
- Master/Tailored retrieval
- metadata projection
- comparison correctness
- source immutability
- cross-user protection
- null/optional fields
- manual-edit attribution
- stale metadata

Do not add backend complexity if existing endpoints are sufficient.

---

## 43. MANUAL QA

Use a real Phase 6A–6D generated example:

```text
Job:
Senior Frontend Developer
Company:
Acme Corp

Candidate:
React        → proven
Next.js      → proven / underrepresented
TypeScript   → proven
AWS          → missing
Docker       → insufficient
```

Expected:

```text
TAILORED
Senior Frontend Developer · Acme Corp
```

Insights:

```text
React       → Proven
Next.js     → Promoted
TypeScript  → Emphasized
AWS         → Not Added
Docker      → Not Added
```

Then:

1. Edit a Tailored bullet.
2. Save.
3. Switch to Master.
4. Verify Master is unchanged.
5. Return to Tailored.
6. Verify the edit remains.
7. Open Compare.
8. Verify the manual change is not falsely attributed to 6C.
9. Download PDF.
10. Verify PDF represents Tailored.
11. Return to Portfolio.
12. Verify Master and Tailored variants.
13. Return to Job/Tailoring.
14. Verify correct job association.
15. Test stale/customized state if available.

---

## 44. FINAL ARCHITECTURE

After 6E:

```text
                    CAREER PROFILE
                         │
                         ↓
                  ┌──────────────┐
                  │ MASTER RESUME│
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ↓                     ↓
        MASTER STUDIO          JOB ENGINE
                                    │
                                    ↓
                                  6A
                               JobProfile
                                    │
                                    ↓
                                  6B
                              JobMatchResult
                                    │
                                    ↓
                                  6C
                            TailoringPlan
                                    │
                                    ↓
                                  6D
                            Tailored Resume
                                    │
                                    ↓
                                  6E
                         Tailored Resume Studio
                         ├── Edit
                         ├── Compare
                         ├── Insights
                         ├── Evidence
                         └── Job Context
```

---

## 45. DEFINITION OF DONE

### Identity

- Tailored Resume clearly identified.
- Target job/company visible.
- Master and Tailored distinguishable.

### Editing

- Tailored editable.
- Autosave works.
- Dirty state works.
- Master untouched.

### Comparison

- Master vs Tailored works.
- Meaningful changes shown.
- No false metadata changes.
- Changes trace to 6C where applicable.
- Manual changes distinguishable.

### Intelligence

- Requirements use 6B.
- Decisions use 6C.
- Evidence uses canonical evidence.
- No new scoring engine.

### Navigation

- Portfolio works.
- Job/Tailoring works.
- Variant switching works.
- Studio route works.
- PDF exports active Tailored Resume.

### Safety

- Master cannot be mutated from Tailored Studio.
- Career Profile cannot be mutated.
- Cross-user access prevented.
- Regeneration cannot silently destroy manual edits.

### Quality

- Focused tests pass.
- Full server regression passes.
- Full client regression passes.
- Server typecheck = 0 errors.
- Client typecheck = 0 errors.
- Manual QA passes.

---

## 46. FULL REGRESSION

Run complete root-level tests.

Do not run only new Phase 6E tests.

Server:

```bash
cd server
npx vitest run
npx tsc --noEmit
```

Client:

```bash
cd client
npx vitest run
npx tsc --noEmit
```

Use the actual Phase 6D implementation counts as the baseline. Do not assume counts.

Report exact:

```text
Server:
X files / Y tests

Client:
X files / Y tests

Server typecheck:
0 errors

Client typecheck:
0 errors
```

Do not delete, rename, relocate, disable, or exclude existing tests.

---

## 47. ARCHITECTURAL QUALITY CHECK

Before completion verify:

- no new ResumeDocument abstraction
- no new ResumeRenderer
- no new scoring engine
- no new Career Profile source
- no new Master Resume source
- no second Tailored Resume source
- no duplicate tailoring engine
- no automatic regeneration
- no Master mutation
- no Career Profile mutation
- no hidden source synchronization
- no cross-user access
- no unnecessary backend duplication
- no Application/Auto Apply functionality

---

## 48. FINAL REPORT

Return:

```text
PHASE 6E IMPLEMENTATION COMPLETE

Resume Studio:
- Tailored identity:
- Target job context:
- Variant switcher:
- Tailored editing:
- Master protection:

Comparison:
- Master vs Tailored:
- Section diff:
- Item diff:
- Proposal traceability:
- Manual edit attribution:

Tailoring Insights:
- Job requirements:
- Match states:
- Proposal summary:
- Evidence:
- Protected exclusions:

Navigation:
- Portfolio:
- Job/Tailoring:
- Studio:
- PDF:

Backend:
- Files added/changed:
- Focused tests:
- Full regression:
- Typecheck:

Frontend:
- Files added/changed:
- Focused tests:
- Full regression:
- Typecheck:

Safety:
- Master immutable: PASS/FAIL
- Career Profile immutable: PASS/FAIL
- Cross-user protection: PASS/FAIL
- Manual edit protection: PASS/FAIL
- Regeneration safety: PASS/FAIL

Manual QA:
- PASS/FAIL

Final Status:
PASS
or
PASS WITH CHANGES
or
FAIL
```

Do not claim PASS unless complete regression, typechecks, and manual QA actually ran.

---

# FINAL INSTRUCTION

Implement **Phase 6E only**.

Use the existing Phase 5.5 Resume Studio architecture.

Do not redesign Resume Studio from scratch.

Do not create another resume engine.

Do not create another AI tailoring engine.

Do not create another scoring engine.

Do not modify Career Profile.

Do not modify Master Resume.

Do not automatically regenerate Tailored Resume.

Do not automatically synchronize Tailored changes back to Master.

Do not implement Applications or Auto Apply.

Responsibility boundary:

```text
6A = Understand the Job
6B = Match Job Requirements to Candidate Evidence
6C = Decide What Should Change + User Approval
6D = Materialize the Approved Tailored Resume
6E = Make That Tailored Resume a First-Class Studio Experience
```

Final experience:

```text
JOB
 ↓
MATCH
 ↓
TAILORING PLAN
 ↓
APPROVAL
 ↓
TAILORED RESUME
 ↓
OPEN IN RESUME STUDIO
 ↓
SEE WHAT CHANGED
 ↓
UNDERSTAND WHY
 ↓
EDIT
 ↓
COMPARE WITH MASTER
 ↓
EXPORT / CONTINUE
```

Start by inspecting the existing Phase 5.5 Studio and Phase 6B/6C/6D implementations before making changes.
