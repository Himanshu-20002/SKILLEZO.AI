# SKILLEZO AI — Phase 6E.3 Final Implementation Prompt

## Tailoring Insights — Explain Why the Tailored Resume Looks This Way

You are implementing **Phase 6E.3 of SKILLEZO AI**.

This phase follows:

```text
6A → Job Analysis
6B → Career ↔ Job Evidence Matching
6C → Tailoring Plan + User Approval
6D → Tailored Resume Generation
6E.1 → Deterministic Resume Diff Engine
6E.2 → Studio Variant Identity + Safe Switching
6E.3 → Tailoring Insights
```

The purpose of 6E.3 is to make the existing tailoring decisions understandable and trustworthy inside Resume Studio.

The user should be able to understand:

```text
WHY was this changed?
WHAT job requirement caused it?
WHAT evidence supports it?
WHAT was intentionally NOT added?
```

---

# 1. Primary Objective

Build a **Tailoring Insights** experience for an active Tailored Resume.

The insights UI must explain existing tailoring decisions using already-persisted and already-approved data from:

```text
JobProfile
JobMatchResult
TailoringPlan
Tailored Resume
6E.1 Resume Diff
```

6E.3 is an **explanation/presentation layer**, not a new intelligence engine.

---

# 2. Core Product Principle

The architecture must preserve this trust model:

```text
JOB PROFILE
    ↓
tells SKILLEZO what matters

CAREER PROFILE
    ↓
tells SKILLEZO what is true

JOB MATCH
    ↓
identifies evidence/relevance

TAILORING PLAN
    ↓
decides what should change

TAILORED RESUME
    ↓
materializes approved decisions

6E.1 DIFF
    ↓
shows what actually changed

6E.3 INSIGHTS
    ↓
explains why those changes exist
```

The insights layer must never invent a reason that is not supported by persisted source data.

---

# 3. Strict Scope Boundary

## IN SCOPE

Implement:

- Tailoring Insights panel in Resume Studio.
- Target job summary.
- High-level tailoring summary.
- Applied tailoring counts.
- Requirement/proposal explanations.
- Summary change explanations.
- Skill promotion/de-emphasis explanations.
- Experience change explanations.
- Project selection/emphasis explanations.
- "Not Added" / unsupported requirement explanations.
- Requirement status context from 6B.
- Approved proposal context from 6C.
- Materialized status from 6D.
- Lightweight evidence references where already available.
- Read-only insight cards.
- Filtering/section grouping where useful.
- Loading/empty/error states.
- Tests.

## STRICTLY OUT OF SCOPE

Do NOT implement:

- New AI/LLM calls.
- New matching logic.
- New tailoring logic.
- New scoring engine.
- New recommendation engine.
- New evidence-generation logic.
- New Career Profile mutations.
- New Tailoring Plan generation.
- New Tailored Resume generation.
- Auto Apply.
- Application workflows.
- Side-by-side comparison UI.
- Unified diff UI.
- Evidence Drawer UI.
- New database models unless an existing persisted contract is genuinely insufficient.
- Duplicate 6E.1 diff logic.
- Duplicate 6B matching logic.
- Duplicate 6C proposal logic.

**6E.4 owns Comparison + Evidence presentation.**

---

# 4. FIRST: Inspect the Existing Codebase

Before implementation, inspect the actual existing architecture.

Inspect:

- `useResumeStudio`
- Resume Studio right-side panel architecture
- Phase 6B `JobMatchResult` types/service/API
- Phase 6C `TailoringPlan` types/service/API
- Phase 6D Tailored Resume generation/result contract
- Phase 6E.1 `computeResumeDiff()` and result types
- Phase 6E.2 active Tailored Resume metadata
- Existing ATS/score recommendation components
- Existing section cards and UI primitives
- Existing badge/chip/card design tokens
- Existing dialog/drawer patterns
- Existing loading/error/empty-state patterns
- Existing client service/hook patterns

Do not assume names if the repository differs.

Reuse actual existing contracts.

Do not create parallel services when an existing service already exposes the required information.

---

# 5. Source-of-Truth Rules

The insight UI must be strictly read-only.

Never mutate:

```text
ProfileModel
Master Resume
Tailored Resume
JobProfile
JobMatchResult
TailoringPlan
```

6E.3 only reads existing data.

The active Tailored Resume is determined by the existing 6E.2 Studio state.

---

# 6. Data Provenance Model

Every insight must have an explainable source.

Conceptually:

```ts
type TailoringInsightSource =
  | 'JOB_MATCH'
  | 'TAILORING_PLAN'
  | 'TAILORED_RESUME'
  | 'RESUME_DIFF'
  | 'UNSUPPORTED_REQUIREMENT';
```

Prefer persisted identifiers over UI-derived assumptions:

```text
jobProfileId
matchResultId
tailoringPlanId
proposalId
requirementId
resumeId
entityId
```

Do not infer proposal/reason relationships from array indexes.

---

# 7. No Invented Explanations

This is a critical invariant.

Do NOT create explanations such as:

```text
"AI decided this was more relevant."
"Recruiters prefer this."
"This will increase your chances."
"This keyword is trending."
```

unless the exact information is explicitly represented by an existing persisted/source contract.

Allowed:

```text
React was promoted because the target job marked React
as a required skill and the candidate has verified React evidence.
```

Only show this when the matching/proposal data actually supports it.

---

# 8. Tailored Resume Eligibility

Tailoring Insights should primarily appear when:

```ts
currentResume?.variantType === 'TAILORED'
```

Master Resume should not display Tailoring Insights as if it were tailored.

For Master:

- Keep existing Master identity behavior.
- Do not fabricate tailoring context.
- Do not invent a target job.

If no Tailored context exists:

```text
No tailoring insights available.
```

Use existing UI patterns.

---

# 9. Insights Header

The panel should clearly identify context:

```text
TAILORING INSIGHTS

Senior Frontend Engineer · Google

12 changes applied
8 requirements matched
3 requirements promoted
2 requirements intentionally not added
```

Counts must come from existing persisted/derived data.

Do not create a second intelligence-counting engine.

If a count cannot be reliably derived, omit it rather than fabricate it.

---

# 10. High-Level Summary

Provide a compact summary of the tailoring result.

Possible presentation:

```text
Tailoring Summary

✓ Relevant strengths emphasized
✓ Underrepresented evidence promoted
✓ Resume wording adjusted
✓ Section ordering optimized

Not Added
⚠ Kubernetes
No verified candidate evidence
```

Exact statements must be derived from existing 6B/6C/6D data.

No new semantic inference.

---

# 11. Requirement-Centered Explanation

The strongest unit of explanation is:

```text
JOB REQUIREMENT
       ↓
MATCH STATE
       ↓
APPROVED TAILORING DECISION
       ↓
ACTUAL RESUME CHANGE
       ↓
WHY
```

Example:

```text
React
Required skill

✓ Proven + Relevant

Action:
PROMOTE

Result:
React moved higher in the Skills section.

Reason:
Required by the target job and supported by existing candidate evidence.
```

Use existing requirement/match/proposal relationships.

---

# 12. Match-State Mapping

Reuse existing 6B states.

Examples:

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

Do not redefine these states.

Suggested presentation:

```text
PROVEN_RELEVANT
→ Relevant + supported

PROVEN_UNDERREPRESENTED
→ Supported but not prominent enough

PARTIAL_MATCH
→ Partially supported

RELATED_EVIDENCE
→ Related evidence exists

MISSING
→ No candidate evidence

INSUFFICIENT_EVIDENCE
→ Evidence exists but is insufficient

NEEDS_REVIEW
→ Requires user review

NOT_APPLICABLE
→ Not used for resume tailoring
```

Use the exact existing semantics from Phase 6B.

Do not silently reinterpret them.

---

# 13. Action Mapping

Reuse existing 6C proposal actions:

```text
KEEP
EMPHASIZE
PROMOTE
DE_EMPHASIZE
REWRITE
REORDER
SELECT
EXCLUDE
DO_NOT_ADD
```

6E.3 should explain actions that were actually approved/materialized.

Do not create a new action taxonomy.

---

# 14. Proposal Lifecycle Awareness

Respect the actual 6C/6D lifecycle.

Conceptually:

```text
PROPOSED
→ APPROVED / EDITED
→ APPLIED
```

Use the actual persisted status names from the repository.

Do not display a proposal as applied unless 6D actually materialized it.

Do not display rejected proposals as applied.

User-edited approved values are authoritative when recorded by the existing contract.

---

# 15. Summary Insights

For Summary changes, present information such as:

```text
SUMMARY
✓ Rewritten

Reason:
Approved tailoring proposal for the target role.

Target requirement:
React + TypeScript

Applied:
<actual applied summary>
```

Do not turn this into a comparison UI.

6E.4 owns comparison.

6E.3 focuses on explanation.

---

# 16. Skills Insights

## PROMOTE

```text
↑ React
Promoted

Why:
Required by target job
+
Supported by verified candidate evidence
```

## DE_EMPHASIZE

```text
↓ PHP
De-emphasized

Why:
Not a priority for this target role
```

Only display the reason when 6C/source data explicitly supports it.

## DO_NOT_ADD

```text
⚠ Kubernetes
Not Added

Why:
No verified candidate evidence
```

This must come from the existing DO_NOT_ADD/missing-evidence logic.

Do not use absence of a keyword in the Tailored Resume as proof of lack of evidence.

---

# 17. Experience Insights

For Experience changes:

```text
EXPERIENCE
Company / Role

✓ Bullet emphasized

Reason:
Existing evidence matches a required job responsibility.

Action:
EMPHASIZE
```

For rewritten content:

```text
✓ Bullet rewritten

Reason:
Approved tailoring proposal.

Evidence:
<existing safe evidence reference>
```

Do not generate new factual claims.

Do not expose full before/after comparison UI in this phase.

---

# 18. Project Insights

For projects:

```text
SELECTED
Project X

Why:
Strong alignment with target responsibilities.
```

Only display when backed by 6B/6C data.

For exclusions:

```text
EXCLUDED
Project Y

Reason:
Approved tailoring decision.
```

Do not invent strategic explanations.

---

# 19. "Not Added" Section

This is a high-trust feature.

Create a dedicated section:

```text
NOT ADDED

Kubernetes
No verified candidate evidence

AWS
Insufficient candidate evidence

Terraform
Missing from Career Profile
```

Exact wording must reflect the actual 6B match state / 6C `DO_NOT_ADD` proposal.

Do NOT say:

```text
Candidate is not capable.
Candidate lacks experience.
Candidate should learn this.
```

unless an existing persisted source explicitly supports such language.

The UI should communicate:

```text
JD requirement exists
+
Candidate evidence is insufficient/missing
→ SKILLEZO did not turn it into a resume claim
```

---

# 20. Do Not Turn Every JD Requirement Into a Tiny Card

The user should not see 40 tiny cards.

Group information into meaningful categories:

```text
Overview
Summary
Skills
Experience
Projects
Not Added
```

Prefer:

```text
12 Changes Applied
──────────────────
Summary        1
Skills         5
Experience     4
Projects       2

Not Added      3
```

Allow details to expand on demand.

Avoid excessive UI density.

---

# 21. Insight Card Structure

A reusable card may contain:

```text
[status icon] [requirement/proposal title]

Match:
Proven + Relevant

Action:
PROMOTE

Applied:
React moved to the top of Skills

Why:
Required by target role and supported by verified evidence

Source:
Requirement #req-123
Proposal #prop-456
```

Only render fields that are actually available.

Never fabricate IDs or source text.

---

# 22. Requirement → Proposal → Diff Traceability

Use existing stable relationships wherever available:

```text
requirementId
proposalId
entityId
resumeDiff.proposalId
resumeDiff.requirementIds
```

Possible chain:

```text
Job Requirement
      ↓
JobMatchResult
      ↓
TailoringPlan Proposal
      ↓
Tailored Resume
      ↓
6E.1 Diff
```

If a link is ambiguous:

```text
Do not guess.
Display a generic supported explanation.
```

Never match by array index.

Never match equal text merely because it looks similar unless the existing system explicitly provides a deterministic relationship.

---

# 23. Use 6E.1 Diff Only for Actual Changes

6E.3 may consume the existing `ResumeComparisonResult` / `computeResumeDiff()` output.

Use it to answer:

```text
What actually changed?
```

Do not reimplement:

- Summary comparison
- Skill comparison
- Experience comparison
- Project comparison
- Education comparison
- Layout comparison

6E.1 remains the sole deterministic diff engine.

---

# 24. Do Not Recompute 6B Matching

Do not call a new matcher.

Use the existing:

```text
JobMatchResult
```

or its existing service/hook.

Do not create a second interpretation of the match states.

The insight layer is a consumer only.

---

# 25. Do Not Recompute 6C Tailoring Decisions

Do not call the Tailoring Plan engine.

Read the existing:

```text
TailoringPlan
```

and persisted proposals.

Do not generate new proposal actions in 6E.3.

---

# 26. Do Not Recompute 6D Generation

6D is authoritative for what was actually materialized.

If an approved proposal was not materialized successfully, do not display it as applied.

Use existing 6D status/result information when available.

---

# 27. Suggested Read-Only Insight Adapter

If existing APIs expose fragmented data, create a **pure deterministic adapter/view-model**, not a new intelligence engine.

Example:

```ts
type TailoringInsightsViewModel = {
  resumeId: string;
  jobProfileId: string;
  targetJobTitle?: string;
  targetCompany?: string;

  summary: {
    totalAppliedChanges?: number;
    matchedRequirements?: number;
    notAddedRequirements?: number;
  };

  sections: {
    summary: TailoringInsightItem[];
    skills: TailoringInsightItem[];
    experience: TailoringInsightItem[];
    projects: TailoringInsightItem[];
    notAdded: TailoringInsightItem[];
  };
};
```

The adapter must:

- Read existing persisted data.
- Perform deterministic formatting/grouping only.
- Never infer new intelligence.
- Never generate candidate facts.
- Never mutate source data.

Do not add a database model for this view model.

---

# 28. Backend Requirement

Prefer **zero backend changes**.

Before adding anything server-side, inspect whether existing APIs expose:

- Job Profile.
- Match Result.
- Tailoring Plan.
- Tailored Resume metadata/document.
- 6E.1 diff inputs/result.

If existing APIs are sufficient, compose the data in the client/hook.

Only add backend support if a required persisted relationship genuinely does not exist.

If backend work is required, it must remain read-only and narrowly scoped.

No new intelligence endpoint.

---

# 29. Hook / Orchestration

Prefer existing:

```text
useResumeStudio
```

and existing job/tailoring hooks/services.

If a dedicated hook improves separation:

```text
useTailoringInsights
```

it must remain a thin read-only orchestration layer.

Responsibilities may include:

- Determine active Tailored Resume.
- Load/reuse existing JobProfile.
- Load/reuse existing JobMatchResult.
- Load/reuse existing TailoringPlan.
- Consume existing 6E.1 diff.
- Build deterministic view model.
- Expose loading/error/empty state.

It must not become a new intelligence engine.

---

# 30. Studio Integration

6E.3 belongs in the existing right-side intelligence/editor area established by Phase 5.5.

Do not redesign the entire Studio.

When active resume is Tailored:

```text
Right Panel
────────────────────
Tailoring Insights
Target Job
Summary
Skills
Experience
Projects
Not Added
```

When active resume is Master:

```text
Existing Master Studio insights
```

Do not show Tailoring Insights as if Master were tailored.

Variant identity must continue to come from 6E.2 canonical state.

---

# 31. Interaction Model

The insight UI is read-only.

Allowed:

- Expand/collapse.
- Filter.
- Section tabs.
- Scroll.
- Navigate to relevant Studio section.
- Open existing context where supported.

Not allowed:

- Approving proposals.
- Regenerating Tailored Resume.
- Editing Career Profile.
- Editing Tailoring Plan.
- Applying new AI suggestions.
- Re-running matching.

Those actions belong to other workflows.

---

# 32. Navigation to Resume Sections

Where safe, an insight may provide:

```text
View in Resume
```

Use existing Studio section selection/navigation.

Do not create a second section-navigation system.

If target mapping is ambiguous, do not navigate automatically.

---

# 33. Evidence Handling

6E.3 may display lightweight evidence references only when the existing model already exposes them safely.

Examples:

```text
Evidence:
React used in Project X
Evidence ID: <existing-id>
```

Do NOT build the full Evidence Drawer in 6E.3.

Do NOT invent:

- Evidence confidence.
- Evidence approval state.
- New evidence records.
- New evidence extraction.

6E.4 owns deeper Evidence UI.

---

# 34. Visual Hierarchy

The panel should quickly communicate:

```text
TAILORING INSIGHTS
Senior Frontend Engineer · Google

12 changes applied

Why these changes?
────────────────────────
✓ 5 skills emphasized
✓ 4 experience changes
✓ 2 projects selected
✓ 1 summary rewrite

Not Added
────────────────────────
⚠ Kubernetes
⚠ Terraform
```

Then allow detail expansion.

Avoid long paragraphs and excessive technical metadata.

---

# 35. Trust / Language Rules

Use factual wording.

Good:

```text
Promoted because it was a required job skill and existing evidence
supports it.
```

Good:

```text
Not added because the system found no verified candidate evidence.
```

Avoid:

```text
This will get you hired.
This guarantees ATS success.
Recruiters love this.
This is the best wording.
You should definitely learn this.
```

Do not make hiring-outcome promises.

---

# 36. Loading States

When insights data loads:

- Use existing Studio skeleton/loading primitives.
- Do not block the resume canvas.
- Keep the Tailored Resume usable while insights load.

---

# 37. Partial Data

If one upstream source is unavailable:

Example:

```text
JobMatchResult available
TailoringPlan unavailable
```

Do not fabricate.

Show supported portions and an appropriate partial-data state.

Example:

```text
Tailoring decisions are temporarily unavailable.
Your Tailored Resume remains available.
```

---

# 38. Error Handling

If insights fail:

```text
Resume editing continues normally.
```

Use a non-destructive right-panel error state:

```text
Unable to load tailoring insights.
Retry
```

Do not mutate the Tailored Resume.

---

# 39. Performance

Avoid:

- Fetching full ASTs for unrelated variants.
- Re-running matching.
- Re-running tailoring.
- New AI calls.
- Recomputing expensive intelligence unnecessarily.

Reuse existing data already loaded by Studio where practical.

Memoize deterministic view-model derivation only where useful.

---

# 40. Accessibility

Use existing accessible primitives.

Ensure:

- Proper headings.
- Keyboard-accessible expand/collapse.
- Correct focus states.
- Semantic buttons for interactions.
- Screen-reader-friendly status text.
- Correct ARIA when required.
- No clickable `<div>` where a button is appropriate.
- No color-only status communication.

Do not manually recreate existing interaction primitives.

---

# 41. Suggested Component Architecture

Before creating files, inspect existing components.

Potential structure:

```text
client/components/resume-studio/tailoring-insights/
├── TailoringInsightsPanel.tsx
├── TailoringInsightsHeader.tsx
├── TailoringSummary.tsx
├── TailoringInsightSection.tsx
├── TailoringInsightCard.tsx
├── TailoringNotAddedSection.tsx
└── index.ts
```

Potential hook:

```text
client/hooks/useTailoringInsights.ts
```

Create only what is genuinely needed.

Avoid excessive fragmentation.

---

# 42. Strongly Typed Contracts

Use existing repository types where available.

Do not use `any`.

Example only if no existing equivalent exists:

```ts
type TailoringInsightCategory =
  | 'SUMMARY'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'PROJECTS'
  | 'NOT_ADDED';

type TailoringInsightItem = {
  id: string;

  category: TailoringInsightCategory;

  title: string;

  requirementId?: string;
  proposalId?: string;

  matchState?: ExistingMatchState;
  action?: ExistingTailoringAction;

  reason?: string;

  applied?: boolean;

  changeId?: string;

  evidenceIds?: string[];

  source:
    | 'JOB_MATCH'
    | 'TAILORING_PLAN'
    | 'TAILORED_RESUME'
    | 'RESUME_DIFF'
    | 'UNSUPPORTED_REQUIREMENT';
};
```

Adapt to actual repository types.

Do not create conflicting duplicate enums if equivalent types already exist.

---

# 43. Deterministic Grouping Rules

Grouping may be deterministic.

Examples:

```text
proposal.targetField
→ category

proposal.requirementIds
→ job requirement reference

proposal.id
→ proposal traceability

diff.proposalId
→ actual applied change
```

If multiple sources map to the same insight:

- Merge only when stable IDs prove the same entity.
- Preserve relevant source references.
- Do not merge merely because display text is equal.

---

# 44. Duplicate Data Safety

Tests must cover:

- Two requirements with similar text.
- Two skills with similar names.
- Two proposals targeting different entities.
- Duplicate display titles.
- Identical bullet text in different experiences.
- Multiple proposals referencing different requirement IDs.

The UI must not attribute the wrong requirement/reason to a change.

---

# 45. User-Edited Tailoring Decisions

If existing 6C/6D data records a proposal as user-edited:

Display the actual authoritative status, e.g.:

```text
Action:
EDITED

Status:
Applied

Source:
User-approved tailoring decision
```

Do not imply that AI independently chose the final wording if the user changed it.

The user-approved/edit value is authoritative.

---

# 46. Unattributed Changes

A Tailored Resume may contain a difference with no reliable 6C proposal relationship.

Do NOT invent a tailoring reason.

Acceptable presentation:

```text
Change detected
Reason unavailable
```

or omit the item from the explanation list.

Never label an unattributed difference as:

```text
AI change
Tailoring change
User edit
```

without reliable provenance.

---

# 47. Master vs Tailored Safety

6E.3 must never make the Master look like a generated Tailored Resume.

When switching:

```text
Master
→ Existing Master insights

Tailored
→ Tailoring Insights
```

Variant identity continues to come from 6E.2.

---

# 48. Focused Tests

Create tests for actual behavior.

## Panel Rendering

Test:

- Master hides Tailoring Insights.
- Tailored shows Tailoring Insights.
- Target job title/company render from canonical metadata.
- Missing metadata handled safely.
- Applied count renders from source data.
- Not Added section renders only supported items.

## Mapping

Test:

- `PROVEN_RELEVANT` renders correctly.
- `PROVEN_UNDERREPRESENTED` renders correctly.
- `MISSING` does not become a candidate claim.
- `INSUFFICIENT_EVIDENCE` displays correctly.
- `DO_NOT_ADD` displays Not Added.
- Existing action types render correctly.

## Traceability

Test:

- Requirement → proposal mapping.
- Proposal → diff mapping.
- Requirement → diff mapping where available.
- Ambiguous mapping does not guess.
- Duplicate display text does not cause wrong attribution.

## Provenance

Test:

- Reliable source → displayed.
- No source → no fabricated reason.
- User-edited decision represented correctly.
- Unattributed change is not labeled AI/tailoring/user edit.

## Error / Partial State

Test:

- Job Match unavailable.
- Tailoring Plan unavailable.
- Diff unavailable.
- Partial data.
- Retry behavior.
- Studio remains usable.

## Performance

Test:

- No new AI call.
- No matching rerun.
- No tailoring generation.
- No unnecessary full-resume fetch for unrelated variants.

---

# 49. Do Not Hardcode Historical Test Counts

Run the actual repository commands.

Use project-standard commands if they differ.

At minimum verify:

```bash
cd client && npx vitest run
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

Report exact final counts.

Do not assume previous Phase 6E.2 counts.

---

# 50. Full Regression Requirement

After implementation verify:

```text
6E.1 Diff Engine
6E.2 Studio switching
6E.3 Tailoring Insights
```

continue to coexist without regression.

Do not modify earlier phase behavior merely to make 6E.3 easier.

---

# 51. Definition of Done

- [ ] Tailoring Insights appear only for Tailored Resume context.
- [ ] Target job context is canonical.
- [ ] Insights consume existing 6B/6C/6D/6E.1 data.
- [ ] No new AI/LLM calls.
- [ ] No new matching logic.
- [ ] No new tailoring logic.
- [ ] No new scoring logic.
- [ ] No duplicated diff engine.
- [ ] No fabricated explanations.
- [ ] Requirement → proposal → actual change traceability is preserved where reliable.
- [ ] Ambiguous relationships are not guessed.
- [ ] User-edited decisions are represented correctly.
- [ ] Unattributed changes are not falsely attributed.
- [ ] "Not Added" explains missing/insufficient evidence safely.
- [ ] No unsupported candidate claims are created.
- [ ] Master Resume remains untouched.
- [ ] Career Profile remains untouched.
- [ ] Tailored Resume remains read-only from this UI.
- [ ] Existing Studio editing continues to work.
- [ ] Existing navigation continues to work.
- [ ] Loading/error/partial states are non-blocking.
- [ ] Accessible primitives are reused.
- [ ] No unnecessary backend architecture.
- [ ] Focused tests pass.
- [ ] Full client regression passes.
- [ ] Client TypeScript passes with 0 errors.
- [ ] Server TypeScript passes with 0 errors.

---

# 52. Final Product Behavior

The final 6E.3 experience should let a user open a Tailored Resume and understand:

```text
TAILORED RESUME
Senior Frontend Engineer · Google

12 changes applied

WHY?
────────────────────────
React
✓ Proven + Relevant
PROMOTE
Required by the target job.
Supported by verified candidate evidence.

TypeScript
✓ Proven + Underrepresented
PROMOTE
Required by the target job and insufficiently prominent
in the Master Resume.

EXPERIENCE
────────────────────────
Project X
✓ Bullet emphasized
Reason:
Existing evidence aligns with the target responsibility.

NOT ADDED
────────────────────────
Kubernetes
⚠ No verified candidate evidence

Terraform
⚠ Insufficient candidate evidence
```

The user should understand:

```text
WHAT changed
WHY it changed
WHAT requirement drove it
WHAT evidence supported it
WHAT SKILLEZO deliberately did NOT claim
```

without SKILLEZO inventing intelligence or duplicating earlier phases.

---

# 53. Final Implementation Instruction

Implement **Phase 6E.3 only**.

Treat this phase as a **read-only explanation and presentation layer** over:

```text
6B Job Match
6C Tailoring Plan
6D Tailored Resume
6E.1 Resume Diff
6E.2 Studio Context
```

Do not expand the phase into Comparison, Evidence Drawer, new AI, or new tailoring functionality.

Use the existing architecture.

Make the smallest safe change set.

After implementation, provide:

1. Files changed/created.
2. Architecture summary.
3. Data sources used.
4. Focused tests and exact counts.
5. Full client regression count.
6. Client TypeScript result.
7. Server TypeScript result.
8. Confirmation that no new AI/matching/tailoring/scoring engine was added.
9. Confirmation that Master Resume and Career Profile remain untouched.
10. Any unresolved limitations or follow-up work for Phase 6E.4.
