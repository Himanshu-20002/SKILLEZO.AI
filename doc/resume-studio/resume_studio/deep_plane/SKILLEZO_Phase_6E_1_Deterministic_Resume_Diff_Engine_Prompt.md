# SKILLEZO AI — Phase 6E.1
# Deterministic Master-vs-Tailored Resume Diff Engine
## Antigravity IDE Implementation Prompt

---

# 1. ROLE

You are implementing **Phase 6E.1 — Data Contracts & Deterministic Resume Diff Engine** for SKILLEZO AI.

This is the **first implementation sub-phase of Phase 6E**.

Phases 1–6D are implemented and frozen.

Phase 6E.1 must build only the **pure, deterministic comparison foundation** that later 6E UI phases will consume.

The output is:

```text
MASTER ResumeDocument
        +
TAILORED ResumeDocument
        ↓
6E.1 Deterministic Diff Engine
        ↓
Typed ResumeComparisonResult
```

This phase must NOT build the Studio UI, Tailoring Insights UI, Evidence Drawer, variant switcher, or editing workflow.

---

# 2. RESPONSIBILITY BOUNDARY

Keep this exact boundary:

```text
6A = Understand the Job

6B = Match Job Requirements to Candidate Evidence

6C = Decide What Should Change + User Approval

6D = Materialize Approved Changes

6E.1 = Deterministically identify meaningful differences
        between Master and Tailored Resume

6E.2+ = Consume this comparison data in the Studio UI
```

6E.1 is a **derived comparison utility**, not a new intelligence engine.

---

# 3. HARD SCOPE

## IN SCOPE

- Typed comparison data contracts.
- Pure TypeScript deterministic diff function.
- Master vs Tailored `ResumeDocument` comparison.
- Summary diff.
- Skills diff.
- Experience diff.
- Projects diff.
- Education diff where supported by the existing AST.
- Section-order/layout diff.
- Proposal traceability lookup where safely resolvable.
- Change categorization.
- Meaningful normalization.
- Null/optional field handling.
- Ignoring irrelevant runtime metadata.
- Exhaustive unit tests.
- TypeScript validation.

## OUT OF SCOPE

Do NOT implement:

- Resume Studio UI.
- Tailoring Insights UI.
- Evidence Drawer UI.
- Variant switcher.
- Dirty-state handling.
- Autosave.
- PDF.
- API endpoints unless an existing architecture requires a pure shared utility export.
- Database models.
- Database persistence.
- New backend services.
- New scoring engine.
- New ATS logic.
- New matching logic.
- New AI calls.
- LLM-based diffing.
- New ResumeDocument AST.
- New ResumeRenderer.
- New TailoringPlan engine.
- Regeneration.
- Application workflow.

---

# 4. NON-NEGOTIABLE INVARIANTS

## 4.1 ZERO LLM

The diff engine must make:

```text
0 LLM calls
0 AI calls
0 network calls
```

Comparison must be deterministic.

---

## 4.2 NO NEW SOURCE OF TRUTH

Do NOT persist:

```text
ComparisonDocument
ResumeDiffDocument
TailoredComparison
```

The source documents remain:

```text
Master ResumeDocument
Tailored ResumeDocument
```

The comparison result is derived in memory.

---

## 4.3 MASTER IS READ-ONLY

The diff function must never mutate either input document.

Both inputs must be treated as immutable.

Conceptually:

```ts
computeResumeDiff(masterDoc, tailoredDoc, context)
```

must return a new result without modifying:

```text
masterDoc
tailoredDoc
```

---

## 4.4 TAILORED IS READ-ONLY TO THE DIFF ENGINE

6E.1 only reads the Tailored Resume.

It does not modify it.

---

## 4.5 NO NEW SCORING

Do not calculate:

- ATS score
- role match score
- fit score
- quality score
- confidence score

6E.1 identifies differences only.

---

# 5. INSPECT BEFORE CODING

Before writing code, inspect the actual current codebase.

You MUST inspect:

### ResumeDocument

- canonical `ResumeDocument` type
- all section types
- skill shape
- experience shape
- project shape
- education shape
- summary shape
- layout/template configuration
- entity IDs
- evidence/provenance fields
- optional/null fields

### Existing cloning/normalization

Inspect:

- existing ResumeDocument normalizer
- clone utilities
- equality helpers
- normalization utilities
- stable ID utilities

Reuse existing utilities where appropriate.

### Phase 6C

Inspect:

- `TailoringPlan`
- proposal schema
- proposal IDs
- target references
- `targetEntityId`
- `targetField`
- proposal actions
- requirement IDs
- evidence IDs

### Phase 6D

Inspect:

- generated Tailored Resume document
- source TailoringPlan ID/version
- generation metadata
- any existing provenance/revision metadata

### Existing tests

Inspect existing ResumeDocument tests and avoid duplicating established behavior.

---

# 6. IMPORTANT — DO NOT ASSUME THE AST SHAPE

Do NOT invent fields such as:

```ts
summary.text
experience.bullets
project.description
layout.sectionOrder
```

unless those fields actually exist.

Use the existing canonical `ResumeDocument` structure.

If the existing AST differs from the examples in this prompt, adapt the implementation to the actual types.

The canonical ResumeDocument contract is authoritative.

---

# 7. FILES

Create only the minimum files required by the existing architecture.

Preferred frontend locations, if consistent with the current project:

```text
client/types/resume-comparison.types.ts

client/lib/resume-studio/resume-diff.ts

client/lib/resume-studio/__tests__/resume-diff.test.ts
```

Do not create duplicate locations if an equivalent existing utility/type directory exists.

---

# 8. TYPE CONTRACT

Create a strongly typed derived comparison contract.

Conceptually:

```ts
type ResumeChangeType =
  | "PROMOTED"
  | "DE_EMPHASIZED"
  | "REWRITTEN"
  | "REORDERED"
  | "SELECTED"
  | "EXCLUDED"
  | "EDITED"
  | "USER_EDIT"
  | "ADDED"
  | "REMOVED"
  | "CHANGED";
```

IMPORTANT:

Only include change types that are actually supported by the existing Phase 6C/6D semantics.

Do not add redundant categories merely for UI decoration.

---

# 9. CRITICAL — USER_EDIT ATTRIBUTION

A pure Master-vs-Tailored diff **cannot inherently know** whether a difference was:

```text
6D generated change
```

or:

```text
manual user edit after generation
```

Therefore:

## DO NOT do this:

```text
Master !== Tailored
    ↓
USER_EDIT
```

That is incorrect.

Instead inspect existing provenance/revision/source metadata.

Possible reliable source signals include existing project metadata that records:

```text
generation
proposal
revision
user modification
```

Use the actual existing architecture if available.

### If reliable provenance exists

Use it.

### If reliable provenance does NOT exist

Do NOT falsely label the change as `USER_EDIT`.

Use a safe classification such as:

```text
GENERATED
TRACEABLE
UNATTRIBUTED
CHANGED
```

depending on the actual type contract.

The implementation must document this limitation.

Do NOT build a complete revision-history system in 6E.1 just to support `USER_EDIT`.

---

# 10. PROPOSED DIFF RESULT

Conceptually:

```ts
interface ResumeDiffItem {
  id: string;

  section:
    | "summary"
    | "skills"
    | "experience"
    | "projects"
    | "education"
    | "layout";

  changeType: ResumeChangeType;

  title: string;

  masterValue?: unknown;
  tailoredValue?: unknown;

  entityId?: string;

  proposalId?: string;
  proposalTitle?: string;

  reason?: string;

  requirementIds?: string[];
  evidenceIds?: string[];

  source?: 
    | "TAILORING_PLAN"
    | "USER_EDIT"
    | "UNATTRIBUTED"
    | "UNKNOWN";
}
```

Adapt this to actual domain types.

Do not use `unknown` in public UI-facing contracts if the existing architecture can provide stronger types.

Prefer section-specific typed values where practical.

---

# 11. COMPARISON RESULT

Conceptually:

```ts
interface ResumeComparisonResult {
  masterResumeId: string;
  tailoredResumeId: string;

  totalChanges: number;

  sections: {
    summary: ResumeDiffItem[];
    skills: ResumeDiffItem[];
    experience: ResumeDiffItem[];
    projects: ResumeDiffItem[];
    education: ResumeDiffItem[];
    layout: ResumeDiffItem[];
  };

  changes: ResumeDiffItem[];
}
```

Adapt this to the actual existing architecture.

Do not duplicate resume IDs or metadata that can be safely derived elsewhere if unnecessary.

---

# 12. DIFF ENTRY POINT

Provide one deterministic entry point:

```ts
computeResumeDiff(
  masterDocument,
  tailoredDocument,
  context?
): ResumeComparisonResult
```

The function must be:

- pure
- deterministic
- side-effect free
- synchronous unless the existing architecture requires otherwise
- testable without React
- testable without network
- testable without database

Calling it twice with the same inputs must produce equivalent results.

---

# 13. NORMALIZATION BEFORE COMPARISON

Normalize only for comparison.

Do NOT mutate the original AST.

Examples of comparison normalization:

- insignificant whitespace
- line-ending differences
- harmless empty arrays
- object key ordering
- runtime metadata
- timestamps
- generated persistence metadata

Do NOT normalize away meaningful resume content.

---

# 14. NULL / OPTIONAL VALUES

The existing canonical ResumeDocument may contain legitimate nullable values.

For example:

```ts
startDate: null
endDate: null
description: null
```

If the canonical schema permits them, the diff engine must handle them safely.

Do NOT:

```text
null → ""
null → "N/A"
null → fake date
```

Do not mutate source data.

---

# 15. SUMMARY DIFF

Compare the actual canonical summary representation.

Rules:

```text
Master summary === Tailored summary
→ no change

Master summary !== Tailored summary
→ one meaningful summary change
```

Ignore insignificant whitespace only if the existing product semantics treat it as insignificant.

Preserve meaningful wording differences.

If a matching 6C proposal can be safely resolved:

```text
proposalId
reason
requirementIds
evidenceIds
```

may be attached.

If not safely resolvable, do not invent traceability.

---

# 16. SKILLS DIFF

Inspect the actual skill structure first.

Match skills using the existing canonical stable identifier where available.

If stable IDs are unavailable, use a carefully normalized semantic key such as:

```text
normalized skill name
```

Do not rely solely on array index.

Detect meaningful changes such as:

### Promotion

Existing skill moves to a more prominent position/order because of approved tailoring.

```text
Master:
React
Node.js
Next.js

Tailored:
Next.js
React
Node.js
```

Potential result:

```text
Next.js → PROMOTED
```

Only classify as `PROMOTED` when the change is supported by actual 6C proposal/action context.

Otherwise use:

```text
REORDERED
```

---

# 17. SKILL FABRICATION SAFETY

The diff engine must never interpret:

```text
skill exists only in Tailored
```

as proof that the skill is valid.

It only reports:

```text
Tailored contains skill not present in Master
```

Traceability must come from existing 6C/6D data.

Do not infer candidate truth from the diff.

---

# 18. EXPERIENCE DIFF

Inspect the real experience schema.

Prefer stable experience entity IDs.

Only use:

```text
companyName + jobTitle
```

as a fallback identity if the existing model requires it.

Do not rely on array index as the primary identity.

Compare:

- company
- title
- dates
- location where relevant
- summary/description where present
- bullet content
- technology lists where present
- ordering

Meaningful bullet changes should be reported.

If a 6C proposal safely maps to the change:

```text
REWRITTEN
```

or the actual proposal action.

If the change cannot be attributed safely:

```text
CHANGED
```

or equivalent.

Do not falsely claim `USER_EDIT`.

---

# 19. PROJECT DIFF

Compare:

- stable project identity
- project name
- description
- bullets/content
- technologies where relevant
- order
- inclusion/exclusion

Examples:

```text
Master:
Project A
Project B
Project C

Tailored:
Project B
Project A
```

Possible result:

```text
Project B → PROMOTED / REORDERED
Project C → EXCLUDED
```

Only use `SELECTED`/`EXCLUDED` when supported by actual 6C proposal decisions.

Do not infer user intent from ordering alone.

---

# 20. EDUCATION DIFF

Support education comparison if the existing ResumeDocument includes education.

Handle:

- institution
- degree
- field
- dates
- description
- ordering

Do not assume every education field is required or non-null.

Follow the canonical schema.

---

# 21. SECTION ORDER DIFF

Compare the actual layout/section-order representation.

Example:

```text
Master:
Summary
Experience
Skills
Projects

Tailored:
Summary
Skills
Experience
Projects
```

Return a layout/order change only when the actual canonical layout representation differs.

Do not report:

- object key order
- serialization order
- unrelated builder metadata

as layout changes.

---

# 22. PROPOSAL TRACEABILITY

Traceability should follow:

```text
Diff
 ↓
TailoringPlan proposal
 ↓
Requirement ID
 ↓
Evidence ID
```

Prefer:

```text
proposalId
targetEntityId
stable entity ID
```

over array indexes.

Do not invent:

```text
proposalId
requirementId
evidenceId
```

If a proposal cannot be resolved safely:

```text
source = UNATTRIBUTED
```

or equivalent.

The diff must still be returned.

A traceability failure must not erase a real document change.

---

# 23. TRACEABILITY MUST NOT CHANGE THE DIFF

The comparison algorithm answers:

> What is different?

Traceability answers:

> Why did this difference happen?

These are separate concerns.

Therefore:

```text
No proposal match
```

must NOT mean:

```text
No diff
```

It means:

```text
Diff exists
Traceability unavailable
```

---

# 24. DETERMINISTIC CHANGE CLASSIFICATION

Use this priority where appropriate:

```text
1. Exact approved proposal/action
2. Existing reliable provenance
3. Deterministic structural difference
4. Generic CHANGED / ADDED / REMOVED
```

Never invent a more specific semantic label than the available evidence supports.

For example:

```text
Skill moved
```

does not automatically mean:

```text
PROMOTED
```

unless 6C/6D confirms promotion.

---

# 25. NO FALSE POSITIVES

The following must NOT create changes:

```text
- object key order
- generated runtime IDs
- persistence timestamps
- irrelevant metadata
- whitespace-only changes if product semantics ignore them
- null vs equivalent empty collection where canonical semantics define them as equivalent
```

Be careful with:

```text
null vs ""
```

Do not automatically treat them as equivalent unless the existing canonical contract explicitly does.

---

# 26. NO FALSE NEGATIVES

Do NOT accidentally hide:

- real summary wording changes
- skill addition/removal
- skill reordering
- bullet changes
- project selection/exclusion
- project reorder
- section-order changes
- education changes

The comparison must be meaningful to a resume user.

---

# 27. ORDERING OF RESULTS

Make result ordering deterministic.

Recommended:

```text
Summary
Skills
Experience
Projects
Education
Layout
```

Within each section:

```text
Document order
```

Do not depend on:

```text
object property iteration order
random IDs
database return order
```

---

# 28. PERFORMANCE

The diff engine must be efficient for normal resume sizes.

Do NOT:

- call an LLM
- call an API
- access a database
- perform O(n²) comparisons unnecessarily
- repeatedly normalize the same document
- serialize/parse the entire AST multiple times

Use maps/indexes where appropriate.

Resume documents are small, so prioritize clarity over premature optimization.

---

# 29. IMMUTABILITY TEST

Add a test proving:

```text
computeResumeDiff(master, tailored)
```

does not modify either object.

Use deep snapshots before and after.

Expected:

```text
masterBefore === masterAfter
tailoredBefore === tailoredAfter
```

---

# 30. REQUIRED TEST MATRIX

Create comprehensive unit tests.

## Summary

```text
identical summary
changed summary
whitespace-only summary
empty/null summary where canonical schema permits
```

## Skills

```text
identical skills
added skill
removed skill
reordered skill
promoted skill with proposal
reordered skill without proposal
```

## Experience

```text
identical experience
changed bullet
changed title
changed company
changed dates
reordered experience
null optional dates
proposal traceability
unattributed change
```

## Projects

```text
identical projects
changed description
selected project
excluded project
reordered project
added project
removed project
```

## Education

```text
identical education
changed education
optional/null fields
reordered education
```

## Layout

```text
identical section order
changed section order
irrelevant metadata difference
```

## Traceability

```text
proposal → requirement → evidence
proposal target resolves
proposal target does not resolve
no proposal exists
```

## User edits

If reliable user-edit provenance exists:

```text
known user edit → USER_EDIT
```

If provenance does not exist:

```text
post-generation difference without provenance
→ NOT falsely labeled USER_EDIT
```

## Safety

```text
master unchanged
tailored unchanged
no AI/network calls
```

---

# 31. TEST FOR THE EXACT 6D OUTPUT

Use a realistic Tailored Resume produced by Phase 6D.

Example conceptual scenario:

```text
Master:
React
Node.js
Next.js

Tailored:
Next.js
React
Node.js

Master Experience Bullet:
Built web applications using React.

Tailored Experience Bullet:
Built production React and Next.js applications.
```

Expected:

```text
Next.js
→ meaningful reorder/promotion depending on proposal context

Experience bullet
→ meaningful change

Summary
→ no change if identical
```

Do not hardcode assumptions that contradict the actual Phase 6D output schema.

---

# 32. NO UI DEPENDENCY

The diff engine tests must run without:

- React
- browser DOM
- Next.js runtime
- network
- MongoDB
- authenticated session

It must be a pure utility.

---

# 33. TYPE SAFETY

Run:

```bash
cd client
npx tsc --noEmit
```

Fix all type errors.

Do not use:

```ts
any
```

to bypass the ResumeDocument type contract.

Use proper narrowing/adapters where needed.

---

# 34. FULL REGRESSION

Do not use the outdated Phase 6E plan baseline of:

```text
19 server tests
12 client tests
```

Those numbers are not the current SKILLEZO baseline.

Before implementation, use the actual completed Phase 6D implementation report as the baseline.

Run:

```bash
cd server
npx vitest run
npx tsc --noEmit
```

and:

```bash
cd client
npx vitest run
npx tsc --noEmit
```

Phase 6E.1 must not remove, rename, relocate, disable, or exclude existing tests.

Report exact counts.

---

# 35. ACCEPTANCE CRITERIA

Phase 6E.1 is complete only when:

### Data contracts

- comparison types are strongly typed
- no duplicate persisted source of truth
- actual ResumeDocument shape is respected

### Diff engine

- deterministic
- pure
- side-effect free
- no LLM
- no network
- no database
- no scoring
- no matching

### Coverage

- summary
- skills
- experience
- projects
- education where supported
- layout/section order

### Traceability

- proposal lookup works where safely resolvable
- requirement IDs preserved
- evidence IDs preserved
- unresolved traceability does not hide the diff
- no fabricated provenance

### User edit handling

- USER_EDIT is used only when reliable provenance exists
- no false attribution
- no new revision-history system introduced

### Safety

- Master unchanged
- Tailored unchanged
- optional/null values handled correctly
- no mutation of input ASTs

### Verification

- focused tests pass
- full client regression passes
- client typecheck passes
- exact counts reported

---

# 36. FINAL REPORT

When complete, return:

```text
PHASE 6E.1 IMPLEMENTATION COMPLETE

Files:
- Added:
- Modified:

Diff Engine:
- Summary:
- Skills:
- Experience:
- Projects:
- Education:
- Layout:
- Traceability:

User Edit Attribution:
- Existing provenance reused: YES/NO
- USER_EDIT safely supported: YES/NO
- False attribution prevented: PASS/FAIL

Safety:
- Master input immutable: PASS/FAIL
- Tailored input immutable: PASS/FAIL
- No AI calls: PASS/FAIL
- No network calls: PASS/FAIL
- No database dependency: PASS/FAIL
- No scoring engine: PASS/FAIL

Tests:
- Focused:
- Full client regression:
- Client typecheck:

Final Status:
PASS
or
PASS WITH CHANGES
or
FAIL
```

Do not claim PASS unless tests and typecheck actually ran.

---

# FINAL INSTRUCTION

Implement **Phase 6E.1 only**.

Do not implement 6E.2 or later.

Do not build UI.

Do not build Tailoring Insights.

Do not build the Evidence Drawer.

Do not build variant switching.

Do not build autosave.

Do not build regeneration.

Do not create a new AI system.

Do not create a new scoring system.

Do not create a new backend model.

Build a clean, deterministic, pure comparison foundation that later Phase 6E components can safely consume.

The key invariant is:

```text
MASTER ResumeDocument
        +
TAILORED ResumeDocument
        ↓
PURE DETERMINISTIC DIFF
        ↓
EXPLAINABLE COMPARISON RESULT
```

Start by inspecting the actual canonical ResumeDocument and Phase 6C/6D provenance structures before writing code.
