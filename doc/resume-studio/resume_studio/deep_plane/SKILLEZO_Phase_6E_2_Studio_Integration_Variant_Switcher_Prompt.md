# SKILLEZO AI — Phase 6E.2 Implementation Prompt

## Studio Integration — Tailored Resume Identity, Target Job Context & Variant Switcher

### ROLE

Implement **Phase 6E.2 of SKILLEZO AI**.

Phase 6E.1 is COMPLETE and FROZEN. It provides:

```ts
computeResumeDiff(masterDoc, tailoredDoc, context)
```

Phase 6E.2 integrates the existing Master/Tailored Resume architecture into the existing Resume Studio UX.

The goal is to make these immediately obvious and safe:

- Master Resume
- Tailored Resume
- Target Job / Companyt
- Current variant
- Unsaved edits

Do not redesign the backend architecture.

Do not build Tailoring Insights, comparison UI, or Evidence Drawer yet.

---

# 1. PHASE OBJECTIVE

Transform the Studio from a generic resume editor into a context-aware workspace where the user can immediately understand:

```text
WHAT RESUME AM I EDITING?
IS IT MASTER OR TAILORED?
WHAT JOB IS THIS TAILORED FOR?
WHAT HAPPENS IF I SWITCH?
ARE MY CURRENT EDITS SAVED?
```

The user must never accidentally believe editing a Tailored Resume edits the Master Resume.

Architecture remains:

```text
Career Profile
      ↓
Master Resume
      ↓
Resume Portfolio
      ↓
Tailored Resume Variant
      ↓
Resume Studio
```

---

# 2. HARD SCOPE

## IN SCOPE

1. Studio Master/Tailored identity
2. Target Job context
3. Variant switcher
4. Safe variant navigation
5. Dirty-state protection
6. URL/deep-link handling
7. Existing Studio header integration
8. Portfolio ↔ Studio navigation
9. Optional lightweight 6E.1 diff summary
10. Responsive behavior
11. Accessibility
12. Tests
13. Typecheck
14. Full regression

## OUT OF SCOPE

Do NOT implement:

- Tailoring Insights
- Comparison modal
- Side-by-side comparison
- Unified diff UI
- Evidence drawer
- New AI/LLM calls
- New scoring
- New matching
- New tailoring logic
- New Tailoring Plan generation
- New Resume generation
- Application / Auto Apply
- Career GPS redesign
- Career Profile redesign
- Master Resume regeneration redesign
- New ResumeDocument schema
- New ResumeRenderer
- New diff engine
- Database redesign

---

# 3. EXISTING ARCHITECTURE — PRESERVE

Phase 6A:
```text
Job Profile
```

Phase 6B:
```text
Career ↔ Job Evidence Matching
```

Phase 6C:
```text
Tailoring Plan + User Approval
```

Phase 6D:
```text
Approved Tailoring Plan
      ↓
Tailored Resume Variant
```

Phase 6E.1:
```text
Master ResumeDocument
        +
Tailored ResumeDocument
        ↓
computeResumeDiff()
        ↓
ResumeComparisonResult
```

Phase 6E.2 consumes these existing outputs. It does not replace them.

---

# 4. EXISTING STUDIO ARCHITECTURE

Preserve the Phase 5.5 three-zone Studio:

```text
┌───────────────────────────────────────────────────────────────┐
│ Header                                                        │
├─────────────────┬────────────────────────────┬────────────────┤
│ Resume          │                            │                │
│ Navigation      │       A4 Resume Canvas     │  Intelligence  │
│ / Structure     │                            │  / Editor      │
└─────────────────┴────────────────────────────┴────────────────┘
```

Before modifying anything, inspect:

- `useResumeStudio`
- `ResumeStudioHeader`
- `ResumeStudioWorkspace`
- `ResumeSectionNavigator`
- `ResumePreviewPanel`
- `ResumeEditorPanel`
- existing Portfolio navigation
- existing resume routing
- existing variant metadata
- existing dirty/autosave lifecycle

Reuse existing state and components wherever possible.

Do not create duplicate server state.

---

# 5. ROUTING / DEEP LINKING

Continue using the existing Studio route, for example:

```text
/dashboard/resumes/studio?resumeId=<resumeId>
```

Use the project's actual current route if different.

The active `resumeId` is the canonical identity of the document being edited.

When opening a Tailored Resume:

```text
resumeId = tailoredResumeId
```

When opening Master:

```text
resumeId = masterResumeId
```

Variant switching must update the URL using the existing routing mechanism.

Avoid full page reloads.

---

# 6. VARIANT IDENTITY

Reuse the canonical Resume metadata/types already present in the codebase.

At minimum derive:

```ts
variantType
displayName / title
targetJobTitle?
targetCompany?
parentResumeId?
isMaster?
```

Expected variants:

```text
MASTER
TAILORED
```

Do not introduce duplicate variant enums/string unions if a canonical type already exists.

---

# 7. MASTER HEADER STATE

When active resume is Master, clearly display:

```text
⭐ MASTER RESUME

Your canonical resume
```

Optionally:

```text
Source: Career Profile
```

Do not display a target job unless the existing Master model genuinely contains such metadata.

---

# 8. TAILORED HEADER STATE

When active resume is Tailored, display:

```text
🎯 TAILORED RESUME

Senior Frontend Engineer
Google
```

If only title exists:

```text
🎯 TAILORED RESUME

Senior Frontend Engineer
```

If target metadata is missing:

```text
🎯 TAILORED RESUME

Job-specific variant
```

Never fabricate job/company information.

---

# 9. TARGET JOB CONTEXT

Add a compact target-job context area in the Studio header/context region.

Example:

```text
┌─────────────────────────────────────────────┐
│ 🎯 Tailored for                             │
│                                             │
│ Senior Frontend Engineer                    │
│ Google                                      │
│                                             │
│ Based on approved tailoring decisions       │
└─────────────────────────────────────────────┘
```

Keep it compact. The user should understand it in under 2 seconds.

Do not turn the header into a dashboard.

---

# 10. TARGET JOB DATA SOURCE

Use existing Tailored Resume metadata first.

If the Resume model already contains:

```ts
targetJobTitle
targetCompany
targetJobId
```

use those fields.

If an existing JobProfile service/API already supports lookup by `targetJobId`, it may be reused.

Do NOT create a new JobProfile fetching system solely for this phase.

If metadata is missing:

- do not infer it from the resume
- do not call an LLM
- do not fabricate values

---

# 11. VARIANT SWITCHER

Add a visible Master/Tailored variant switcher.

Example:

```text
Resume Version

[ ⭐ Master ] [ 🎯 Senior Frontend Engineer · Google ]
```

or:

```text
Resume Version
┌─────────────────────────────────────┐
│ ✓ 🎯 Senior Frontend Engineer · Google│
│   ⭐ Master Resume                   │
│   🎯 React Developer · Amazon        │
└─────────────────────────────────────┘
```

Use the existing Portfolio metadata API/hook.

Do NOT fetch full ResumeDocuments for every variant.

---

# 12. VARIANT SWITCHER DATA

Use the existing metadata-only Portfolio contract from Phase 5.

The switcher should use lightweight fields only:

```text
id
displayName/title
variantType
targetJobTitle
targetCompany
parentResumeId
updatedAt
createdAt
sourceProfileVersion
isMasterStale
```

Do not load for every option:

- AST
- builder config
- PDF
- Tailoring Plan
- full ResumeDocument

Only the selected resume should be loaded into Studio.

---

# 13. ACTIVE VARIANT

The active variant must be visually obvious.

Example:

```text
✓ 🎯 Senior Frontend Engineer · Google
  ⭐ Master Resume
  🎯 React Developer · Amazon
```

Do not rely only on color.

Use selected state, checkmark/badge, and accessible state such as:

```tsx
aria-current="true"
```

where appropriate.

---

# 14. SWITCHING BEHAVIOR

Support:

```text
Master → Tailored
Tailored → Master
Tailored A → Tailored B
```

The current Studio architecture remains intact.

Do not mount multiple Studio instances simultaneously.

Do not duplicate the editor.

---

# 15. DIRTY STATE SAFETY

This is critical.

If:

```text
dirty === true
```

and the user attempts to switch variants, never silently discard changes.

Use an existing confirmation dialog if available.

Otherwise add a small reusable confirmation dialog:

```text
Unsaved changes

You have unsaved changes in this resume.

Switching resumes will discard these local changes.

[Stay Here] [Switch Resume]
```

The user must explicitly choose.

---

# 16. DIRTY STATE RULES

### Clean

```text
dirty = false
```

→ switch immediately.

### Saving

```text
saving = true
```

Prefer waiting for save completion before switching.

### Save error

```text
error
```

Keep the user on the current resume.

Do not silently switch and risk losing changes.

### Unsaved

```text
unsaved = true
```

→ confirmation required.

---

# 17. AUTOSAVE

Reuse the existing Studio autosave lifecycle:

```text
saved
saving
unsaved
error
```

Do not create a second autosave system.

After successful variant load:

```text
dirty = false
saveState = saved
```

only when the newly loaded document is actually current.

---

# 18. SWITCH FAILURE

If the target variant fails to load:

```text
Current Resume
      ↓
Switch attempt
      ↓
Load failure
      ↓
Stay on current Resume
```

Show an actionable error.

Do not leave the UI showing one resume while the URL represents another.

---

# 19. URL STATE

The URL must represent the active resume.

Example:

```text
/studio?resumeId=MASTER_ID
```

then:

```text
/studio?resumeId=TAILORED_ID
```

Browser Back/Forward must restore the corresponding variant.

Avoid navigation loops.

Use the existing push/replace convention consistently.

---

# 20. PORTFOLIO → STUDIO

Master:

```text
Portfolio
  ↓
Master Resume
  ↓
Studio
  ↓
Master active
```

Tailored:

```text
Portfolio
  ↓
Tailored Resume
  ↓
Studio
  ↓
Tailored active
```

The Studio must not silently default to Master when a valid Tailored `resumeId` was explicitly supplied.

---

# 21. STUDIO → PORTFOLIO

Keep the existing Back to Portfolio action.

Do not unnecessarily lose the selected variant/navigation state.

---

# 22. MASTER SAFETY

Editing Tailored Resume must never mutate:

```text
ProfileModel
```

or:

```text
Master Resume
```

All existing editing/autosave actions must target the active Resume ID.

Do not use language implying the Tailored document is the Master.

---

# 23. TAILORED SAFETY

When active:

```text
Active Resume = Tailored
```

all Studio operations must target that Resume ID.

Audit the existing flows for active-resume correctness:

- save
- autosave
- PDF
- section edits
- AI section editing
- builder configuration
- refresh
- delete behavior

Do not redesign these systems.

---

# 24. MASTER DELETE SAFETY

Preserve existing Phase 5 behavior:

```text
Master Resume
→ cannot be deleted
```

6E.2 must not weaken this protection.

---

# 25. OPTIONAL 6E.1 DIFF INTEGRATION

6E.2 may consume the existing deterministic diff engine for lightweight context such as:

```text
12 changes from Master
```

or:

```text
Based on Master Resume
12 tailored changes
```

If implemented:

```ts
const result = computeResumeDiff(masterDoc, tailoredDoc, context);
result.totalChanges
```

is informational only.

Do NOT build:

- comparison modal
- side-by-side diff
- unified diff
- evidence drawer

Do NOT create a score or percentage from the diff.

Not acceptable:

```text
87% tailored
Tailoring Score: 92
```

If calculating the diff requires expensive additional document loading that harms Studio performance, defer the badge to a later phase.

---

# 26. NO DUPLICATE INTELLIGENCE

Do not recalculate inside 6E.2:

- candidate/JD match
- evidence relevance
- why a skill changed
- why a bullet changed
- tailoring decisions
- ATS scores
- quality scores

Those responsibilities already belong to:

```text
6B → Evidence Matching
6C → Tailoring Plan
6D → Materialization
6E.1 → Deterministic Diff
```

6E.2 is context and navigation.

---

# 27. HEADER DESIGN

Integrate with the existing `ResumeStudioHeader`.

Conceptual Master state:

```text
┌───────────────────────────────────────────────────────────────┐
│ ← Portfolio   ⭐ MASTER RESUME                                │
│                Your canonical resume                          │
│                                                               │
│                [Version ▼] [Content] [Design] [ATS & Score] │
│                                      Saved ✓   PDF           │
└───────────────────────────────────────────────────────────────┘
```

Tailored state:

```text
┌───────────────────────────────────────────────────────────────┐
│ ← Portfolio   🎯 TAILORED RESUME                             │
│                Senior Frontend Engineer · Google             │
│                                                               │
│                [Version ▼] [Content] [Design] [ATS & Score] │
│                                      Saved ✓   PDF           │
└───────────────────────────────────────────────────────────────┘
```

Preserve existing controls and avoid overcrowding.

---

# 28. RESPONSIVE UX

### Desktop

Show:

- variant identity
- target job
- variant switcher
- save state
- existing actions

### Tablet

Condense target information.

### Mobile

Prioritize:

```text
Variant identity
Target job
Variant switcher
Save state
```

Do not make the header unusably tall.

Reuse existing mobile Studio patterns.

---

# 29. ACCESSIBILITY

Variant switcher must support:

- keyboard navigation
- visible focus
- semantic buttons
- accessible labels
- selected state
- screen-reader context

Confirmation dialog must use clear action labels:

```text
Stay Here
Switch Resume
```

rather than ambiguous:

```text
OK
Cancel
```

Use existing dialog primitives where available.

---

# 30. STATE OWNERSHIP

Continue using:

```text
useResumeStudio
```

as the orchestration layer.

Do not create duplicate server state hooks such as:

```text
useVariantSwitcherState
useResumeVersionState
useTailoredResumeState
```

if they duplicate existing state.

Small local UI state is acceptable for:

```text
isVariantMenuOpen
pendingResumeId
showSwitchConfirmation
```

---

# 31. EXPECTED COMPONENTS

Reuse existing components first.

Only add focused components if necessary:

```text
client/components/resume-studio/

ResumeStudioHeader.tsx
ResumeVariantSwitcher.tsx
ResumeVariantBadge.tsx
ResumeTargetJobContext.tsx
ResumeSwitchConfirmDialog.tsx
```

Do not create unnecessary component fragmentation.

If an existing component already owns the responsibility, extend it.

---

# 32. HOOK / SERVICE INTEGRATION

Inspect:

```text
useResumeStudio
useResumePortfolio
resume service
portfolio service
routing helpers
```

Potential orchestration responsibilities:

```text
useResumeStudio
├── activeResume
├── activeResumeId
├── saveState
├── dirty state
├── switchResumeVariant()
├── loadResume()
└── existing Studio actions
```

If switching does not exist, add it to the existing orchestration layer, not the header component.

---

# 33. VARIANT SWITCH ALGORITHM

Adapt this to the existing implementation:

```ts
async function switchResumeVariant(targetResumeId: string) {
  if (targetResumeId === activeResumeId) return;

  if (saveState === 'saving') {
    await waitForSaveCompletion();
  }

  if (saveState === 'error') {
    return;
  }

  if (isDirty) {
    const confirmed = await confirmSwitch();

    if (!confirmed) return;
  }

  await loadResume(targetResumeId);

  if (loadFailed) return;

  updateStudioUrl(targetResumeId);
  resetLocalStudioStateForLoadedResume();
  setDirty(false);
}
```

Do not blindly copy this pseudocode if the existing orchestration already handles part of the lifecycle.

---

# 34. CONCURRENCY SAFETY

Rapid switching must not allow stale responses to overwrite the newest selection.

Example:

```text
User clicks Tailored A
User immediately clicks Tailored B

A request
B request
B response
A response
```

The Studio must remain on B.

Reuse existing cancellation/latest-request-wins logic if present.

Otherwise implement a minimal request identity guard.

---

# 35. STALE MASTER CONTEXT

If existing metadata reliably says a Tailored Resume was created from an older Master/Profile version, reuse that information.

Example:

```text
🎯 Tailored Resume
Senior Frontend Engineer · Google

Based on an earlier Master version
```

Do not create a new staleness algorithm.

---

# 36. ERROR STATES

Handle:

### Invalid resume ID

```text
Resume not found
```

### Unauthorized resume

Use existing authorization/error behavior.

Do not leak whether another user's resume exists.

### Deleted variant

```text
This resume is no longer available.

Return to Resume Portfolio
```

### Portfolio metadata failure

The Studio should still load the active resume if the active Resume API succeeds.

Do not make metadata failure destroy the entire Studio unnecessarily.

---

# 37. TESTING

Add focused tests for:

### Variant identity

- Master displays Master identity
- Tailored displays Tailored identity
- target title/company display correctly
- missing metadata does not fabricate values

### Switching

- Master → Tailored
- Tailored → Master
- Tailored A → Tailored B
- same resume is a no-op
- URL updates correctly

### Dirty safety

- clean switch works
- unsaved switch requires confirmation
- cancel keeps current resume
- confirm switches
- save failure prevents unsafe switching
- saving state is handled safely

### Routing

- deep link opens correct variant
- browser Back restores previous variant
- browser Forward restores next variant
- failed load does not leave inconsistent state

### Isolation

- Tailored save uses Tailored ID
- Master remains untouched
- Profile remains untouched
- Master delete protection remains

### Accessibility

- switcher keyboard usable
- active variant announced
- dialog accessible

### Concurrency

- rapid A → B switching cannot leave stale A active after B wins

### 6E.1 integration

Only verify that a diff summary is consumed correctly if implemented. Do not duplicate the 6E.1 algorithm tests.

---

# 38. REGRESSION

Run the project's real commands.

## Client tests

```bash
cd client
npx vitest run
```

Report actual:

```text
X test files / Y tests passed
```

Do not hardcode a baseline.

## Client TypeScript

```bash
cd client
npx tsc --noEmit
```

Must be:

```text
0 errors
```

## Server TypeScript

```bash
cd server
npx tsc --noEmit
```

Must be:

```text
0 errors
```

If the project's normal server regression suite is part of the workflow, run it and report actual counts.

Do not delete, rename, skip, or weaken existing tests.

---

# 39. FILE CHANGE DISCIPLINE

Before coding:

1. Inspect existing Studio files.
2. Inspect existing hooks.
3. Inspect routing.
4. Inspect Portfolio metadata types.
5. Inspect Resume variant types.
6. Inspect save/dirty lifecycle.
7. Inspect existing confirmation modal.
8. Inspect API contracts.

Then make the smallest coherent change.

Do not rewrite:

- Resume Studio architecture
- ResumeDocument
- ResumeRenderer
- Tailoring Engine
- Job Matching Engine
- Master Resume Builder

---

# 40. BACKEND DISCIPLINE

6E.2 is primarily frontend/Studio integration.

Prefer:

```text
Existing API
Existing model
Existing service
Existing hook
Existing types
```

Do not create a new collection or parallel endpoint merely for convenience.

Only make a minimal backend compatibility change if the existing contract genuinely lacks required already-established metadata.

---

# 41. VISUAL UX REQUIREMENT

The result must make Master and Tailored visibly different.

Master:

```text
⭐ MASTER RESUME
Your canonical resume
```

Tailored:

```text
🎯 TAILORED RESUME
Senior Frontend Engineer · Google
12 changes from Master
```

The distinction should be understandable without returning to Portfolio.

However, keep the existing Phase 5.5 design language.

Do not redesign the entire Studio again.

---

# 42. DEFINITION OF DONE

Phase 6E.2 is complete only when:

- [ ] Master/Tailored identity is obvious.
- [ ] Target job context is shown for Tailored variants when available.
- [ ] No target information is fabricated.
- [ ] Variant switcher works.
- [ ] Switcher uses lightweight metadata.
- [ ] Active resume is loaded by actual `resumeId`.
- [ ] URL reflects active resume.
- [ ] Browser Back/Forward works.
- [ ] Dirty state prevents accidental data loss.
- [ ] Saving/error states are handled safely.
- [ ] Rapid switching is concurrency-safe.
- [ ] Tailored editing targets Tailored resume only.
- [ ] Master/Profile remain untouched.
- [ ] Master delete protection remains.
- [ ] Phase 6E.1 remains pure and unchanged.
- [ ] No new AI/LLM calls.
- [ ] No new scoring/matching/tailoring logic.
- [ ] No comparison modal.
- [ ] No Evidence Drawer.
- [ ] Responsive behavior works.
- [ ] Accessibility requirements pass.
- [ ] Focused tests pass.
- [ ] Full client regression passes.
- [ ] Client TypeScript passes with 0 errors.
- [ ] Server TypeScript passes with 0 errors.
- [ ] No existing tests are deleted, skipped, or weakened.

---

# 43. REQUIRED FINAL WALKTHROUGH

After implementation, report:

## Architecture
Files/components/hooks changed.

## Variant Identity
How Master vs Tailored is displayed.

## Target Job Context
How title/company are sourced.

## Variant Switching
How switching and URL synchronization work.

## Dirty Safety
How unsaved changes are protected.

## Concurrency
How rapid switching is handled.

## Master Safety
How Master/Profile mutation is prevented.

## 6E.1 Integration
Whether the diff engine is consumed and where.

## Tests

Report exact actual results:

```text
Focused tests:
X/X passed

Full client regression:
X test files / Y tests passed

Client TypeScript:
0 errors

Server TypeScript:
0 errors
```

## Scope Confirmation

Explicitly confirm:

```text
No new AI
No new scoring
No new matching
No new tailoring engine
No comparison UI
No evidence drawer
No backend redesign
```

---

# FINAL IMPLEMENTATION PRINCIPLE

Phase 6E.2 makes the Studio **context-aware**, not intelligence-aware.

6E.1 answers:

> What changed?

6E.2 answers:

> What resume am I looking at, and what job is it for?

Later 6E phases answer:

> Why did it change?

Never mix those responsibilities.

Implement the smallest production-quality solution that fits the existing SKILLEZO architecture.
