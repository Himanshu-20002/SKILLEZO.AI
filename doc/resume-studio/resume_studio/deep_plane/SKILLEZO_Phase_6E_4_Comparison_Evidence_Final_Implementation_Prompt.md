# SKILLEZO AI — Phase 6E.4 Final Implementation Prompt

## Comparison + Evidence — Master ↔ Tailored Resume, Exact Changes & Evidence Traceability

You are implementing **Phase 6E.4 of SKILLEZO AI**.

This phase follows:

```text
6A   → Job Analysis
6B   → Career ↔ Job Evidence Matching
6C   → Tailoring Plan + User Approval
6D   → Tailored Resume Generation
6E.1 → Deterministic Resume Diff Engine
6E.2 → Studio Variant Identity + Safe Switching
6E.3 → Tailoring Insights
6E.4 → Comparison + Evidence
```

The goal of Phase 6E.4 is to give the candidate a transparent way to inspect the **exact difference between the Master and Tailored Resume** and then inspect the **evidence and requirement relationships behind individual changes**.

The user should be able to answer:

```text
WHAT exactly changed?
WHERE did it change?
WHY was it changed?
WHICH job requirement caused it?
WHAT evidence supports it?
WAS it an approved tailoring decision, explicit user edit, generation change, or unattributed change?
```

This must be a **read-only inspection and comparison layer**.

---

# 1. PRIMARY OBJECTIVE

Build the final comparison/evidence experience on top of:

```text
6E.1 Resume Diff
6E.2 Resume Studio integration
6E.3 Tailoring Insights
```

The user must be able to:

1. Open a Tailored Resume.
2. Click **Compare with Master**.
3. Inspect an exact Master ↔ Tailored comparison.
4. View changes grouped by resume section.
5. Understand additions, removals, rewrites, promotions, exclusions, and reordering.
6. Select a change.
7. Inspect requirement/proposal/evidence traceability.
8. Open deeper evidence information in an Evidence Drawer/Panel.
9. Navigate back to the corresponding resume section/entity.
10. Distinguish:
   - tailoring-plan changes
   - explicit user edits
   - generation-origin changes
   - unattributed changes
11. Keep the Master Resume and Career Profile completely untouched.

---

# 2. CORE PRODUCT PRINCIPLE

The architecture must preserve:

```text
JOB PROFILE
    ↓
what the job requires

CAREER PROFILE / EVIDENCE
    ↓
what is actually true

JOB MATCH
    ↓
what evidence is relevant

TAILORING PLAN
    ↓
what approved decisions were made

TAILORED RESUME
    ↓
what was actually materialized

6E.1 DIFF
    ↓
what actually changed

6E.3 INSIGHTS
    ↓
why those changes exist

6E.4 COMPARISON + EVIDENCE
    ↓
show the exact change and inspect supporting evidence
```

6E.4 must consume existing source contracts.

It must not become a second intelligence engine.

---

# 3. STRICT SCOPE BOUNDARIES

## IN SCOPE

Implement:

- Compare with Master entry point.
- Comparison workspace/modal/panel.
- Side-by-side comparison.
- Unified comparison mode if it can reuse existing 6E.1 data cleanly.
- Section-level grouping.
- Exact change-level visualization from 6E.1.
- Master value vs Tailored value display.
- Added/removed/changed/reordered visual states.
- Requirement references.
- Tailoring proposal references.
- Match-state context.
- Evidence Drawer/Panel.
- Evidence source details already available from existing contracts.
- `[View in Resume]`.
- Highlight corresponding resume section/entity.
- Provenance display.
- Explicit user-edit distinction when supported.
- Unattributed-change handling.
- Loading, empty, partial-data, and error states.
- Responsive behavior.
- Accessibility.
- Tests.

## STRICTLY OUT OF SCOPE

Do NOT implement:

- New AI/LLM calls.
- New prompts.
- New matching engine.
- New tailoring engine.
- New scoring engine.
- New resume generation.
- Tailoring Plan regeneration.
- Proposal approval/rejection.
- Career Profile editing.
- Master Resume editing from comparison.
- Auto Apply.
- Application tracking.
- New intelligence calculations.
- Duplicate 6E.1 diff engine.
- New evidence extraction.
- New evidence-generation pipeline.
- New evidence records unless an existing explicit read-only API truly requires one.
- Any mutation of Master/Profile/Tailored Resume caused by comparison.

---

# 4. FIRST: INSPECT THE ACTUAL CODEBASE

Before writing code, inspect the current implementation of:

- `useResumeStudio`
- `ResumeStudioWorkspace`
- `ResumeEditorPanel`
- Phase 6E.1 `computeResumeDiff`
- Phase 6E.1 `ResumeComparisonResult`
- `ResumeDiffItem`
- Phase 6E.2 variant switching
- Phase 6E.2 Master/Tailored identity
- Phase 6E.3 Tailoring Insights
- Job Profile service
- Job Match service
- Tailoring Plan service
- Resume retrieval service
- Existing evidence/career-profile service
- Existing Radix dialog/drawer/sheet primitives
- Existing Studio navigation/highlight APIs
- Existing design system
- Existing loading/error patterns

Do not assume names or contracts.

Reuse the actual repository implementation.

---

# 5. 6E.1 IS THE SOLE DIFF ENGINE

Do NOT reimplement comparison logic.

The authoritative comparison source is the existing Phase 6E.1:

```ts
computeResumeDiff(...)
```

and:

```ts
ResumeComparisonResult
```

Before implementation, inspect the actual exported signature and types.

Use the exact existing contract.

Do not invent a simplified version.

Do not duplicate:

- summary comparison
- skills comparison
- experience comparison
- project comparison
- education comparison
- layout comparison
- change classification
- deterministic normalization
- existing traceability logic

6E.4 consumes 6E.1 output.

---

# 6. EXPECTED 6E.1 DATA

Where available, a `ResumeDiffItem` may contain:

```text
id
section
changeType
proposalId
requirementIds
entityId
subEntityId
masterValue
tailoredValue
source
```

Possible source semantics may include:

```text
TAILORING_PLAN
USER_EDIT
GENERATION
UNATTRIBUTED
```

Use the actual repository types.

Never reinterpret them inconsistently.

---

# 7. COMPARISON ENTRY POINT

For Tailored Resume Studio, provide:

```text
[Compare with Master]
```

The action should be visible but must not overwhelm the primary editing workflow.

For Master Resume:

- Do not present Master as if it were a Tailored variant.
- Hide or disable the comparison entry point using a clear existing UX pattern.

Do not fabricate comparison data.

---

# 8. COMPARISON CONTAINER

Use the existing accessible overlay primitive where possible.

Possible implementation:

```text
ResumeComparisonDialog
```

or:

```text
ResumeComparisonPanel
```

Inspect existing application patterns first.

Do not manually recreate:

- focus trapping
- keyboard handling
- escape behavior
- accessible labeling

when existing Radix/application primitives already provide them.

---

# 9. COMPARISON HEADER

Suggested structure:

```text
Compare with Master

MASTER RESUME
        ↔
TAILORED RESUME
Senior Frontend Engineer · Google

[Side by Side] [Unified]
```

Use actual active Studio metadata from 6E.2.

Do not infer target job information from resume text.

---

# 10. COMPARISON MODES

Support at least one robust mode.

Preferred:

```text
[Side by Side] [Unified]
```

## Side-by-side

```text
MASTER                        TAILORED
────────────────────────────────────────────
Summary                       Summary
original text                 tailored text

Skills                        Skills
React                         React ↑
Node.js                       Node.js
PHP                           —
```

## Unified

```text
SUMMARY

- Master text
+ Tailored text
```

### Important

Do NOT implement a separate text-diff algorithm.

The Unified representation must be driven by existing 6E.1 change records.

If Unified mode introduces substantial duplicated logic, keep it out of the initial implementation and document it as deferred rather than creating a second comparison engine.

---

# 11. SECTION-LEVEL GROUPING

Group changes by canonical section:

```text
SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
LAYOUT
```

Use the section information from 6E.1.

Prefer showing sections with changes:

```text
12 Changes

Summary        1
Skills         5
Experience     4
Projects       2
```

Do not independently recalculate 6E.1 counts.

---

# 12. CHANGE-LEVEL DISPLAY

Every displayed change must originate from the existing 6E.1 result.

Possible semantics:

```text
ADDED
REMOVED
CHANGED
REWRITTEN
PROMOTED
DE_EMPHASIZED
REORDERED
SELECTED
EXCLUDED
USER_EDIT
UNATTRIBUTED
```

Use the actual `ResumeChangeType` and existing source types.

Do not create a conflicting second taxonomy.

---

# 13. MASTER VALUE VS TAILORED VALUE

For each change, present actual values where available.

Changed:

```text
MASTER
<original>

TAILORED
<actual tailored>
```

Added:

```text
MASTER
—

TAILORED
<new value>
```

Removed:

```text
MASTER
<removed value>

TAILORED
—
```

Reordered:

- Show the actual old/new order or location only when supported by 6E.1.
- Never invent positional semantics.

---

# 14. EXACT TRACEABILITY CHAIN

When supported, present:

```text
CHANGE
  ↓
TAILORING PROPOSAL
  ↓
JOB REQUIREMENT
  ↓
MATCH STATE
  ↓
EVIDENCE
```

Example:

```text
Change:
React promoted

Action:
PROMOTE

Requirement:
React

Match:
PROVEN_RELEVANT

Evidence:
Project X
<existing evidence excerpt>
```

If a relationship is not available:

```text
Requirement:
Unavailable

Evidence:
Unavailable
```

Do not invent missing links.

---

# 15. PROPOSAL TRACEABILITY

Prefer stable identifiers:

```text
proposalId
requirementIds
entityId
subEntityId
diffItem.id
```

Never match using:

- array index
- display order
- text similarity
- fuzzy string matching
- title similarity

unless the actual 6E.1 or persisted domain contract explicitly defines a deterministic relationship.

If multiple possible proposals match:

```text
Ambiguous relationship
→ do not guess
→ show partial attribution
```

---

# 16. EVIDENCE DRAWER / PANEL

When a comparison change is selected, allow:

```text
[View Evidence]
```

Example:

```text
EVIDENCE

React

Requirement
Required skill

Match
PROVEN_RELEVANT

Source
Project: EVENTO

Evidence
"Built a React-based event recommendation interface..."

Evidence ID
<existing evidence ID>

[View in Resume]
```

Only show information available in existing contracts.

---

# 17. EVIDENCE SOURCE OF TRUTH

Evidence must come from existing:

- Career Profile evidence references.
- Match-result evidence references.
- Tailoring proposal evidence references.
- Existing entity/evidence APIs.

Possible stable references:

```text
evidenceId
sourceDocumentId
experienceId
bulletId
skillId
projectId
educationId
```

Use actual repository fields.

Do NOT:

- invent evidence
- synthesize new evidence
- infer evidence from Tailored Resume wording
- create fake evidence IDs
- create new evidence confidence
- create new approval metadata

---

# 18. EVIDENCE DETAILS

Where available, render:

```text
Source type
Source title
Entity
Excerpt
Evidence ID
Related entity
```

Only render actual fields.

Never invent:

```text
confidence = 95%
verified = true
approval = approved
```

unless those properties actually exist in the source contract.

---

# 19. MATCH STATE PRESENTATION

Reuse existing Phase 6B semantics:

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

Do not redefine meanings.

The UI is a consumer only.

---

# 20. NOT ADDED / INTENTIONAL OMISSION

For an explicit approved `DO_NOT_ADD` decision, show:

```text
INTENTIONALLY NOT ADDED

Requirement:
Kubernetes

Match:
MISSING

Decision:
DO_NOT_ADD

Why:
No verified candidate evidence was available.
```

Only display this when the existing 6C/6B conditions support it.

Do NOT infer Not Added solely because the item is absent from the Tailored Resume.

---

# 21. USER EDIT VS TAILORING VS GENERATION VS UNATTRIBUTED

Provenance must be explicit.

Use actual source semantics:

```text
TAILORING_PLAN
→ Tailoring-origin change

USER_EDIT
→ User edit only with explicit provenance

GENERATION
→ Generation-origin change

UNATTRIBUTED
→ No reliable attribution
```

Never label an unattributed change as:

```text
USER EDIT
```

or:

```text
TAILORING
```

without explicit source evidence.

---

# 22. USER-EDITED PROPOSALS

If the existing 6C/6D contract records:

```text
userDecision = EDITED
```

make it clear the final value was candidate-customized.

Example:

```text
Decision:
Edited by candidate

Status:
Applied
```

Do not claim AI independently chose the final wording.

---

# 23. VIEW IN RESUME

For changes with reliable section/entity mapping:

```text
[View in Resume]
```

Behavior:

```text
1. Close comparison overlay if appropriate.
2. Select canonical Studio section.
3. Set entity/sub-entity highlight when supported.
4. Switch right panel to the correct editing/detail context.
5. Highlight and/or scroll to the relevant resume item.
```

Reuse existing 6E.2 Studio navigation.

Do not create a parallel navigation system.

If the mapping is ambiguous:

```text
Do not navigate automatically.
```

---

# 24. EVIDENCE → RESUME NAVIGATION

The Evidence Drawer may also provide:

```text
[View in Resume]
```

when stable IDs exist.

Examples:

```text
skillId
experienceId
bulletId
projectId
educationId
```

Use stable entity IDs.

Never use array indexes as identity.

---

# 25. COMPARISON STATE SAFETY

Opening, closing, or navigating the comparison UI must not mutate:

```text
Master Resume
Tailored Resume
Career Profile
JobProfile
JobMatchResult
TailoringPlan
```

Comparison is read-only.

Existing Resume editing remains outside the comparison overlay.

---

# 26. CONCURRENCY

If comparison/evidence data is loaded asynchronously, protect it against variant switching.

Example:

```text
Tailored A
→ comparison opens
→ evidence request starts

Tailored B becomes active
→ previous response arrives
```

The A response must not overwrite B state.

Use an appropriate:

```text
request sequence
AbortController
activeResumeId check
```

or equivalent repository pattern.

Comparison context must remain associated with the active Tailored Resume.

---

# 27. STALE COMPARISON CONTEXT

If active resume changes while comparison is open:

- Close stale comparison context, OR
- Reinitialize it for the new active Tailored Resume.

Never show:

```text
Tailored B
```

with:

```text
Tailored A comparison/evidence
```

---

# 28. PERFORMANCE

Do not:

- fetch unrelated ASTs
- rerun matching
- rerun tailoring
- call an LLM
- recalculate 6E.1 comparison
- preload evidence for every change unnecessarily

Preferred:

```text
Open comparison
→ consume existing 6E.1 result

Select change
→ inspect available evidence references
→ lazy-load deeper evidence only if actually required
```

---

# 29. DATA AVAILABILITY

Comparison should remain useful when evidence/requirement metadata is incomplete.

Example:

```text
Diff available
Requirement unavailable
Evidence unavailable
```

Show:

```text
Requirement details unavailable.
Evidence details unavailable.
```

Do not fabricate.

If JobProfile or JobMatch is unavailable but 6E.1 diff exists, comparison can still display actual changes.

---

# 30. ERROR HANDLING

Comparison failure:

```text
Unable to load comparison.
Retry
```

Evidence failure:

```text
Unable to load evidence details.
Retry
```

Failure in this subsystem must not break Resume Studio editing.

No resume mutations may occur because comparison/evidence loading failed.

---

# 31. LOADING STATES

Use existing Studio loading primitives.

Comparison:

```text
[Compare with Master]
→ skeleton/loading
```

Evidence:

```text
Change selected
→ evidence skeleton
→ evidence details
```

Do not block the whole Studio unnecessarily.

---

# 32. RESPONSIVE DESIGN

Desktop:

```text
Master | Tailored
```

Tablet:

```text
Condensed / stacked comparison
```

Mobile:

```text
MASTER
↓
TAILORED
```

Evidence drawer becomes a responsive sheet/full-screen view using existing primitives.

Do not invent an unrelated mobile navigation model.

---

# 33. ACCESSIBILITY

Use existing accessible primitives.

Ensure:

- Accessible dialog title/description.
- Accessible drawer/sheet labeling.
- Keyboard-accessible comparison controls.
- Keyboard-accessible change selection.
- Accessible close behavior.
- Proper focus management.
- Screen-reader distinction between Master and Tailored.
- Added/removed states are not communicated by color alone.
- Focus restored appropriately when overlay closes.

Do not manually implement focus trapping when existing Radix/application primitives already provide it.

---

# 34. VISUAL LANGUAGE

Reuse existing 6E.2/6E.3 semantic tokens.

Suggested meaning:

```text
Added        → positive semantic
Removed      → neutral/destructive semantic
Changed      → informational semantic
Tailoring    → existing tailoring semantic
User Edit    → existing user-edit semantic
Unattributed → neutral/slate semantic
Evidence     → existing information semantic
```

Do not introduce arbitrary new colors.

Do not rely on color alone.

---

# 35. SUGGESTED COMPONENT ARCHITECTURE

First inspect existing components.

Potential structure:

```text
client/components/resume-studio/comparison/

├── ResumeComparisonLauncher.tsx
├── ResumeComparisonDialog.tsx
├── ResumeComparisonHeader.tsx
├── ResumeComparisonModeToggle.tsx
├── ResumeComparisonSection.tsx
├── ResumeComparisonChange.tsx
├── ResumeComparisonEmptyState.tsx
├── ResumeEvidenceDrawer.tsx
├── ResumeEvidenceDetails.tsx
└── index.ts
```

Create only what is genuinely needed.

Do not over-fragment.

---

# 36. HOOK / STATE ARCHITECTURE

Prefer extending existing Studio orchestration only where appropriate.

A possible hook:

```text
useResumeComparison
```

It should remain thin and read-only.

Responsibilities:

- Receive active Tailored Resume.
- Consume Master/ Tailored comparison inputs.
- Manage comparison open/close state.
- Manage selected change.
- Manage evidence loading.
- Guard asynchronous responses.
- Expose comparison state.

It must NOT become another intelligence engine.

---

# 37. POSSIBLE COMPARISON VIEW MODEL

Only create a view model if no existing equivalent exists.

Example:

```ts
type ComparisonMode =
  | 'SIDE_BY_SIDE'
  | 'UNIFIED';

type ComparisonChangeVM = {
  id: string;
  section: string;
  changeType: ExistingResumeChangeType;

  masterValue?: ResumeDiffValue;
  tailoredValue?: ResumeDiffValue;

  proposalId?: string;
  requirementIds: string[];

  entityId?: string;
  subEntityId?: string;

  source: ExistingDiffChangeSource;

  matchState?: ExistingMatchState;

  reason?: string;

  evidenceIds?: string[];

  canNavigateToResume: boolean;
};

type ResumeComparisonVM = {
  resumeId: string;
  masterResumeId: string;

  targetJobTitle?: string;
  targetCompany?: string;

  totalChanges: number;

  sectionCounts: Record<string, number>;

  changes: ComparisonChangeVM[];
};
```

Use actual existing types whenever possible.

Do not use `any`.

---

# 38. NO SECOND DIFF MODEL

Do not persist a new comparison collection/model.

Use existing 6E.1 comparison data and current Resume data.

Comparison is derived/read-only.

---

# 39. NO SECOND EVIDENCE SYSTEM

Do not create a separate evidence collection or duplicate evidence architecture.

Use existing evidence references/APIs.

Only add a narrowly scoped read-only API if the existing API genuinely cannot expose already-stored evidence.

---

# 40. COMPARISON + 6E.3 INTEGRATION

6E.4 should complement 6E.3.

Recommended relationship:

```text
6E.3 Tailoring Insights
        ↓
"Compare with Master"
        ↓
6E.4 Comparison
        ↓
select specific change
        ↓
Evidence
```

Do not duplicate the 6E.3 summary metrics or explanatory logic unnecessarily.

6E.4 focuses on exact comparison and evidence inspection.

---

# 41. EXACT COUNTING

Use existing 6E.1 counts where appropriate:

```ts
diffResult.totalChanges
diffResult.sectionCounts
```

Do not recalculate change counts independently.

Requirement counts and evidence counts must use stable unique IDs if shown.

Do not count UI cards.

---

# 42. TEST PLAN

Create focused tests for:

## Comparison Rendering

- Tailored Resume shows Compare with Master.
- Master does not show inappropriate comparison context.
- Side-by-side renders correctly.
- Unified renders correctly if implemented.
- Sections group correctly.
- Actual 6E.1 changes render.
- No-change state renders correctly.

## Change Rendering

Test:

- Added.
- Removed.
- Changed.
- Rewritten.
- Promoted.
- De-emphasized.
- Reordered.
- Selected.
- Excluded.

## Traceability

Test:

- Diff → proposal.
- Diff → requirement.
- Proposal → requirement.
- Requirement → match state.
- Diff → evidence.
- Stable entity navigation.
- Ambiguous relationships do not guess.

## Provenance

Test:

- TAILORING_PLAN source.
- USER_EDIT only with explicit provenance.
- GENERATION source.
- UNATTRIBUTED source.

## Evidence

Test:

- Evidence drawer opens.
- Evidence source/title/excerpt.
- Evidence IDs.
- Missing evidence.
- Read-only evidence.
- View in Resume.

## Concurrency

Test:

```text
Tailored A
→ comparison/evidence request
→ Tailored B active
→ stale A response ignored
```

## Navigation

Test:

- View in Resume selects correct section.
- Entity highlight works when IDs exist.
- Comparison closes appropriately.
- Existing Studio remains functional.

## Error / Partial Data

Test:

- Diff unavailable.
- JobProfile unavailable.
- JobMatch unavailable.
- TailoringPlan unavailable.
- Evidence unavailable.
- Partial comparison.
- Retry.

---

# 43. NO HARDCODED TEST COUNTS

Run the actual project commands.

At minimum:

```bash
cd client && npx vitest run
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

If the repository has a standard `npm test` command, use it.

Report actual counts.

Do not assume previous phase counts.

---

# 44. FULL REGRESSION

After implementation verify that:

```text
6E.1 Diff Engine
6E.2 Studio Switching
6E.3 Tailoring Insights
6E.4 Comparison + Evidence
```

work together without regression.

Do not break:

- Studio switching.
- Tailoring Insights.
- Master Resume.
- Tailored Resume editing.
- ATS tools.
- Resume Renderer.
- Existing navigation.

---

# 45. SECURITY / OWNERSHIP

Never trust IDs from the client.

Existing server authorization remains authoritative.

Evidence/comparison access must not allow another user's data to be inspected by modifying:

```text
resumeId
jobProfileId
proposalId
requirementId
evidenceId
```

Use existing ownership/authorization middleware and services.

---

# 46. MASTER / PROFILE IMMUTABILITY

The comparison/evidence subsystem performs zero mutation.

No:

```text
POST
PUT
PATCH
DELETE
```

for inspection.

The user may inspect Master and Tailored values, but editing remains in the existing Resume Studio editor.

---

# 47. DO NOT CHANGE 6E.1 UNNECESSARILY

If something is missing from 6E.1:

1. Inspect whether the existing contract already provides it.
2. Prefer an adapter.
3. Only make a narrowly compatible 6E.1 change if absolutely necessary.

If 6E.1 must be touched, preserve:

- deterministic behavior
- existing types
- existing tests
- backward compatibility
- prior phase scope

Do not rewrite the engine.

---

# 48. DO NOT EXPAND 6E.3

6E.3 remains the explanation layer.

6E.4 may consume useful 6E.3 presentation state, but it should primarily rely on authoritative sources.

Do not duplicate large portions of the 6E.3 insight engine.

---

# 49. UX FLOW

Expected flow:

```text
Resume Portfolio
      ↓
Open Tailored Resume
      ↓
Resume Studio
      ↓
Tailoring Insights
      ↓
[Compare with Master]
      ↓
Comparison
 ┌──────────────────────────────────────┐
 │ Master       ↔       Tailored        │
 │                                      │
 │ Summary                              │
 │ Skills                               │
 │ Experience                           │
 │ Projects                             │
 │                                      │
 │ 12 changes                           │
 └──────────────────────────────────────┘
      ↓
Select a change
      ↓
Change Details
      ↓
Requirement / Match / Proposal
      ↓
[View Evidence]
      ↓
Evidence Drawer
      ↓
[View in Resume]
      ↓
Studio section/entity highlighted
```

---

# 50. NO-CHANGE EXPERIENCE

If:

```ts
diffResult.totalChanges === 0
```

show:

```text
No changes detected
```

Do not fabricate counts or differences.

---

# 51. PARTIAL TRACEABILITY EXPERIENCE

Example:

```text
React
PROMOTED

Applied change:
React moved to top of Skills.

Requirement:
React

Match:
PROVEN_RELEVANT

Evidence:
Available

Proposal rationale:
Unavailable
```

Only display available information.

Never fill missing information with generated text.

---

# 52. UNATTRIBUTED CHANGE EXPERIENCE

Example:

```text
UNATTRIBUTED CHANGE

A difference exists between Master and Tailored Resume,
but no reliable tailoring-plan attribution is available.
```

Do not say:

```text
User changed this
```

unless explicit USER_EDIT provenance exists.

---

# 53. EVIDENCE TRUST LANGUAGE

Use factual language:

```text
Evidence from Career Profile
Matched requirement
Approved tailoring decision
No verified candidate evidence
```

Avoid:

```text
This guarantees ATS success.
Recruiters will prefer this.
This will get you hired.
This is the best version.
```

The system should explain what happened, not predict hiring outcomes.

---

# 54. FINAL DEFINITION OF DONE

- [ ] Tailored Resume has a clear Compare with Master entry point.
- [ ] Comparison consumes the existing 6E.1 diff engine.
- [ ] No duplicate diff logic exists.
- [ ] Side-by-side comparison works.
- [ ] Unified comparison works if implemented.
- [ ] Changes are grouped by canonical section.
- [ ] Master and Tailored values display correctly.
- [ ] Added/removed/changed/reordered states are accurate.
- [ ] Requirement relationships are shown only when reliable.
- [ ] Proposal relationships are shown only when reliable.
- [ ] Existing 6B match state semantics are preserved.
- [ ] Evidence is shown only from existing source contracts.
- [ ] No evidence is fabricated.
- [ ] Evidence Drawer/Panel is read-only.
- [ ] User edits are identified only with explicit provenance.
- [ ] Unattributed changes remain unattributed.
- [ ] Explicit DO_NOT_ADD decisions are represented correctly.
- [ ] `[View in Resume]` navigates to the correct section/entity.
- [ ] Comparison/evidence UI is responsive.
- [ ] Comparison/evidence UI is accessible.
- [ ] Loading/error/partial states do not block Resume Studio.
- [ ] Comparison performs zero mutation.
- [ ] Master Resume remains untouched.
- [ ] Career Profile remains untouched.
- [ ] No new AI/LLM calls.
- [ ] No new matching/tailoring/scoring engines.
- [ ] No unnecessary new backend model.
- [ ] No duplicate evidence system.
- [ ] Async stale-response protection exists.
- [ ] Focused tests pass.
- [ ] Full client regression passes.
- [ ] Client TypeScript passes with 0 errors.
- [ ] Server TypeScript passes with 0 errors.

---

# 55. FINAL IMPLEMENTATION DISCIPLINE

Implement **Phase 6E.4 only**.

Prefer the smallest safe change set.

Do not rewrite:

- Resume AST.
- Resume Renderer.
- Resume Studio architecture.
- Master Resume generation.
- Tailoring engine.
- Job Match engine.
- ATS scoring.
- 6E.1 diff engine.
- 6E.2 navigation.
- 6E.3 insight layer.

Consume existing contracts.

Where information is unavailable, show that it is unavailable.

Never guess.

Never fabricate.

Never mutate source data.

---

# 56. FINAL PRODUCT OUTCOME

After Phase 6E.4, the candidate should be able to go from:

```text
"I have a Tailored Resume."
```

to:

```text
"I can see exactly what changed."
        ↓
"I can see which job requirement is connected."
        ↓
"I can see the approved tailoring decision."
        ↓
"I can inspect the evidence supporting it."
        ↓
"I can see what was intentionally not added."
        ↓
"I can jump directly to that resume section."
```

The complete audit trail becomes:

```text
JOB REQUIREMENT
      ↓
MATCH
      ↓
TAILORING DECISION
      ↓
ACTUAL RESUME CHANGE
      ↓
EVIDENCE
```

That chain is the core product outcome of Phase 6E.4.

---

# 57. FINAL IMPLEMENTATION REPORT

After implementation, provide:

1. Files created/modified.
2. Comparison architecture.
3. Evidence architecture.
4. Existing contracts reused.
5. Whether Side-by-Side and/or Unified mode was implemented.
6. Exact focused test counts.
7. Full client regression count.
8. Client TypeScript result.
9. Server TypeScript result.
10. Confirmation that no new AI/matching/tailoring/scoring engine was added.
11. Confirmation that comparison/evidence performs no mutation.
12. Confirmation that Master Resume and Career Profile remain untouched.
13. Any limitations or follow-up work deferred beyond Phase 6E.4.

## FINAL INSTRUCTION

Implement **ONLY Phase 6E.4 — Comparison + Evidence**.

Do not expand the scope into Application/Auto Apply or future workflows.

Keep the implementation deterministic, read-only, traceable, accessible, performant, and fully aligned with the existing 6E.1/6E.2/6E.3 architecture.
