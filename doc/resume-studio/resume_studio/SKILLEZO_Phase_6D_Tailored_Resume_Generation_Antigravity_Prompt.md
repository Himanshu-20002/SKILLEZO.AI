# SKILLEZO AI — Phase 6D
# Tailored Resume Generation & Materialization
## Antigravity IDE Implementation Prompt

## 1. Objective

Implement **Phase 6D — Tailored Resume Generation & Materialization**.

Phase 6A, 6B, and 6C are complete and frozen.

6D takes the **approved Phase 6C TailoringPlan** and materializes it into an independent `TAILORED` Resume variant.

```text
Career Profile
      ↓
Master Resume
      ↓
Job Profile
      ↓
Job Match Result
      ↓
Approved TailoringPlan (6C)
      ↓
6D Generator
      ↓
Independent TAILORED Resume
      ↓
Phase 6E Resume Studio
```

6D is an execution/materialization layer, **not a new free-form AI resume writer**.

---

## 2. Hard Scope

### In scope

- Load Master Resume, JobProfile, JobMatchResult, and TailoringPlan.
- Validate ownership, versions, freshness, and approval state.
- Deep-clone the Master Resume.
- Apply only approved 6C proposals.
- Preserve user-edited proposal values.
- Preserve evidence provenance.
- Validate the resulting ResumeDocument.
- Validate factual grounding.
- Persist an independent `TAILORED` Resume.
- Associate it with the target JobProfile.
- Support safe regeneration.
- Add generation UX and tests.

### Out of scope

Do **not** implement:

- Career Profile redesign
- Master Resume mutation
- new Job Analysis logic
- new Career ↔ Job matching logic
- new TailoringPlan logic
- new scoring engine
- Auto Apply
- Application creation
- job scraping
- DOCX generation
- new PDF renderer
- Resume Studio redesign
- Career GPS redesign
- autonomous AI rewriting
- unrelated architecture refactors
- Phase 6E comparison UX

---

## 3. Non-Negotiable Invariants

### 3.1 Career Profile is immutable

Never write to `ProfileModel`.

### 3.2 Master Resume is immutable

Never update the Master Resume during generation.

The Master must remain unchanged before and after generation.

### 3.3 Tailored Resume is independent

Use the existing typed deep-clone utility if available.

Never shallow-copy nested ResumeDocument structures.

Prove independence with tests for nested document/config objects.

### 3.4 Only approved proposals execute

- `ACCEPT` → apply.
- `EDIT` → apply the user's approved edited value.
- `REJECT` → do not apply.
- `PENDING` → do not silently apply; respect Phase 6C's approval-completion rules.

Do not create a second approval model.

### 3.5 DO_NOT_ADD remains protected

`DO_NOT_ADD` must never become candidate content.

The JD is never candidate evidence.

### 3.6 Evidence provenance survives

Preserve canonical evidence IDs/references from the Career Profile.

Do not replace provenance with arbitrary copied text.

### 3.7 No factual invention

Never invent:

- skills
- technologies
- years
- companies
- titles
- responsibilities
- metrics
- leadership
- scale
- certifications
- education
- projects
- clients
- achievements

### 3.8 Aggressive intensity does not weaken truth

`AGGRESSIVE` means stronger presentation of supported facts, never permission to invent or add missing requirements.

### 3.9 No competing scoring engine

Reuse existing ATS/match/diagnostic infrastructure where needed.

Do not create a new scoring methodology.

---

## 4. Inspect Before Coding

First inspect and reuse the existing implementation.

Specifically inspect:

### Resume architecture

- `ResumeModel`
- Resume repository/service
- `variantType`
- `parentResumeId`
- `targetJobId`
- `targetJobTitle`
- `targetCompany`
- Master Resume retrieval
- existing clone utilities
- `ResumeDocument`
- document validation
- builder/template configuration
- existing Resume Studio loading/routing

### Phase 6C

Inspect:

- `TailoringPlan`
- `TailoringPlanRepository`
- `tailoring-plan.types.ts`
- `tailoring-plan.engine.ts`
- `tailoring-plan.service.ts`
- `tailoring-factual.validator.ts`
- proposal decisions
- target references
- evidence references
- source-version fields
- stale/regeneration logic

### Phase 6B

Inspect:

- `JobMatchResult`
- requirement matches
- match states
- evidence references
- profile/job-analysis versions
- stale logic

### Phase 6A

Inspect:

- `JobProfile`
- requirement IDs
- job analysis version
- job fingerprint

### Existing Studio

Reuse:

- `useResumeStudio`
- `ResumeStudioWorkspace`
- `LiveResumeCanvas`
- `ResumeRenderer`
- existing resume retrieval
- existing variant routing
- existing PDF functionality

Do not duplicate existing infrastructure.

---

## 5. Tailored Resume Data

Use the existing `ResumeModel`. Do not create a second TailoredResume model unless the existing architecture makes that unavoidable.

The resulting record should use the project's existing equivalent of:

```ts
{
  userId,
  variantType: "TAILORED",
  parentResumeId: masterResumeId,
  targetJobId: jobProfileId,
  targetJobTitle,
  targetCompany,
  title/displayName,
  document,
  builderConfig,
  sourceProfileVersion,
  sourceJobAnalysisVersion,
  sourceMatchResultVersion,
  sourceTailoringPlanVersion,
  createdAt,
  updatedAt
}
```

Do not add duplicate fields when an existing equivalent already exists.

---

## 6. Generation Approval Gate

Before generation, validate:

- TailoringPlan exists.
- TailoringPlan belongs to the authenticated user.
- JobProfile belongs to the authenticated user.
- JobMatchResult belongs to the authenticated user.
- Master Resume belongs to the authenticated user.
- Master Resume exists.
- TailoringPlan is current.
- JobProfile analysis version is current.
- JobMatchResult is current.
- Profile source version is compatible.
- required proposals are resolved according to Phase 6C rules.
- proposal targets are valid.
- evidence references are valid.
- factual validation rules pass.

If stale or invalid, fail safely with structured errors such as:

```ts
{
  code: "TAILORING_PLAN_STALE",
  occurredAt
}
```

Do not silently regenerate from stale source data.

---

## 7. Generation Pipeline

Implement this order:

```text
1. Authenticate user
2. Load source documents server-side
3. Verify ownership
4. Validate source versions/staleness
5. Validate TailoringPlan approval state
6. Deep-clone Master Resume
7. Apply approved deterministic proposals
8. Apply approved user-edited/generated textual proposals
9. Validate evidence references
10. Validate factual claims
11. Validate ResumeDocument
12. Validate DO_NOT_ADD exclusions
13. Persist independent TAILORED Resume
14. Return result metadata
```

Do not partially persist an invalid result.

Preferred model:

```text
load
 ↓
validate
 ↓
clone in memory
 ↓
apply
 ↓
validate final document
 ↓
persist
```

---

## 8. Deterministic-First Execution

Prefer deterministic execution.

Examples:

### Skills

If 6C says:

```text
PROMOTE Next.js
```

apply that approved ordering.

Do not ask an LLM to redesign the entire Skills section.

### Projects

If 6C says:

```text
SELECT Project A
EXCLUDE Project C
```

apply those exact decisions.

### Section order

Apply approved ordering directly.

### Text

If 6C already contains an approved proposed value, use it after validation instead of generating another version.

---

## 9. AI Restrictions

AI may only be used where the approved 6C proposal explicitly authorizes generated/refined textual content.

AI must **not** independently decide:

- what skills to add
- what evidence exists
- what the candidate knows
- what projects to select
- what requirements are proven
- whether a missing skill should be added
- whether the user approved a change

6D executes decisions from previous phases.

Any AI-generated text must pass the existing factual validator.

Validate claims involving:

- skills
- technologies
- dates
- years
- companies
- titles
- responsibilities
- projects
- metrics
- leadership
- scale
- certifications
- education
- achievements

On validation failure, do not persist unsafe output.

Use an existing safe fallback only if one already exists; otherwise return a structured generation failure.

---

## 10. Proposal Target Validation

Use Phase 6C's typed target references.

Every proposal must resolve against the cloned ResumeDocument.

Examples:

```text
summary
experience.id
experience.bullets[index]
skills[index]
project.id
sectionOrder
```

Validate:

```text
targetEntityId
+
targetField
```

before applying.

If the target no longer exists:

```text
INVALID_TAILORING_TARGET
```

Do not guess a replacement target.

---

## 11. User-Edited Proposals

For:

```text
decision = EDIT
```

use the user's approved edited value.

Never regenerate and overwrite it.

Example:

```text
Original:
Built web applications using React.

AI suggestion:
Developed scalable React applications...

User edit:
Built production React and Next.js applications...

6D:
Use the approved user edit.
```

User-approved edits take precedence over generated suggestions.

---

## 12. Evidence Validation

Resolve evidence server-side.

Never trust candidate evidence IDs supplied by the browser.

Every factual proposal must resolve to valid evidence belonging to the authenticated user's current Career Profile.

Reject:

- foreign-user evidence
- nonexistent evidence
- deleted evidence
- incompatible/stale evidence

---

## 13. Match-State Safety

The following must never be upgraded into unsupported candidate claims:

```text
MISSING
RELATED_EVIDENCE
INSUFFICIENT_EVIDENCE
NEEDS_REVIEW
```

`PARTIAL_MATCH` may only produce claims supported by the actual evidence.

Example:

```text
Candidate:
React
Next.js
Node.js

JD:
React
Next.js
Node.js
AWS

Result:
React       → allowed
Next.js     → allowed
Node.js     → allowed
AWS         → absent
```

---

## 14. Versioning

Preserve the existing equivalent of:

```text
sourceProfileVersion
sourceJobAnalysisVersion
sourceMatchResultVersion
sourceTailoringPlanVersion
```

These versions must allow the system to determine later whether the Tailored Resume is stale.

Do not invent a second versioning mechanism if an existing one already exists.

---

## 15. Regeneration

Regeneration is allowed, but must be explicit and safe.

Do not silently destroy a tailored resume that a user has manually edited.

If an existing tailored variant contains user edits, use the existing project strategy for versioning/confirmation.

Prefer an explicit:

```text
Generate New Version
```

or confirmation where appropriate.

Do not silently overwrite user-authored content.

Prevent accidental duplicate generation caused by:

- double-clicks
- retries
- network replay
- browser refresh

Reuse existing repository/idempotency patterns.

---

## 16. API

Inspect existing routing conventions before adding endpoints.

A suitable endpoint may be:

```http
POST /api/job-profiles/:jobProfileId/tailoring-plan/generate
```

Use the project's actual conventions if different.

If retrieval already exists through Resume Portfolio, reuse it.

Do not create redundant APIs.

A successful response can return lightweight metadata:

```ts
{
  success: true,
  resume: {
    id,
    variantType: "TAILORED",
    parentResumeId,
    targetJobId,
    targetJobTitle,
    targetCompany,
    sourceProfileVersion,
    sourceJobAnalysisVersion,
    sourceTailoringPlanVersion,
    createdAt,
    updatedAt
  }
}
```

---

## 17. Generation Status

If generation needs progress feedback, use lightweight states:

```text
VALIDATING
CLONING
APPLYING_PLAN
VALIDATING_RESULT
PERSISTING
COMPLETED
FAILED
```

Do not introduce queues/workers unless existing performance requirements justify them.

A synchronous implementation is acceptable if generation is fast enough.

---

## 18. Security

The server must derive the authenticated `userId`.

Never trust browser-supplied candidate facts or ownership IDs.

Ownership must be checked for:

- JobProfile
- JobMatchResult
- TailoringPlan
- Master Resume
- evidence

A user must never generate a tailored resume using another user's data.

---

## 19. Frontend

Extend the existing Phase 6C workspace.

After the user completes 6C:

```text
Review Tailoring Plan
        ↓
Generate Tailored Resume
```

Show clearly:

> Your Master Resume will remain unchanged. A new tailored resume will be created for this job.

Then show:

```text
Generating...
```

On success:

```text
Tailored Resume Ready

[Open Tailored Resume]
[View Portfolio]
```

Do not build the full Phase 6E compare experience yet.

Use existing Resume Studio/Portfolio routing.

---

## 20. Error UX

Use structured error codes such as:

```text
TAILORING_PLAN_STALE
TAILORING_PLAN_INCOMPLETE
MASTER_RESUME_NOT_FOUND
INVALID_TAILORING_TARGET
EVIDENCE_VALIDATION_FAILED
FACTUAL_VALIDATION_FAILED
SOURCE_VERSION_CHANGED
TAILORED_RESUME_GENERATION_FAILED
```

Map these to user-friendly messages.

Never expose stack traces or sensitive server details.

---

## 21. Backend Tests

Add focused tests for:

### Generation

- creates `TAILORED` variant
- correct `parentResumeId`
- correct JobProfile association
- correct title/company
- correct source versions

### Immutability

- Profile unchanged
- Master unchanged
- JobProfile unchanged
- JobMatchResult unchanged
- TailoringPlan unchanged

### Deep clone

- top-level document independent
- nested sections independent
- builder config independent

### Decisions

- ACCEPT applied
- EDIT uses user value
- REJECT ignored
- PENDING blocks generation where required

### Evidence

- valid evidence accepted
- foreign evidence rejected
- missing evidence rejected
- stale/incompatible evidence rejected

### Safety

- MISSING never added
- RELATED_EVIDENCE never upgraded
- INSUFFICIENT_EVIDENCE never upgraded
- DO_NOT_ADD remains absent

### Factual validation

- invented skill rejected
- invented metric rejected
- invented duration rejected
- invented leadership claim rejected
- invented technology rejected

### Security

- foreign JobProfile rejected
- foreign TailoringPlan rejected
- foreign Master Resume rejected

### Staleness

- stale TailoringPlan rejected
- changed Profile version detected
- changed Job Analysis detected
- changed MatchResult detected

### Regeneration

- regeneration works safely
- user edits are not silently destroyed
- duplicate requests are handled

---

## 22. Frontend Tests

Test:

- Generate button
- confirmation state
- loading state
- success state
- error state
- stale plan handling
- JobProfile display
- Master Resume unchanged messaging
- navigation to generated Tailored Resume
- duplicate-click prevention

Do not duplicate backend factual validation in the client.

---

## 23. Manual QA

Use this scenario:

```text
Job:
Senior Frontend Developer
React
Next.js
TypeScript
AWS
Docker
4+ years

Candidate:
React → proven
Next.js → proven but underrepresented
TypeScript → proven
AWS → missing
Docker → insufficient/related
Experience → verify actual dates
```

Expected:

```text
React → emphasized if approved
Next.js → promoted if approved
TypeScript → emphasized if approved
AWS → absent
Docker → absent unless independently evidenced
4+ years → only stated if evidence supports it
```

Verify:

1. 6C plan is approved.
2. Generate Tailored Resume.
3. `variantType = TAILORED`.
4. `parentResumeId` points to Master.
5. Job association is correct.
6. Master Resume is unchanged.
7. Career Profile is unchanged.
8. Evidence references remain valid.
9. Tailored Resume opens through existing Resume Studio.
10. Regeneration is safe.
11. Rejected and DO_NOT_ADD items remain absent.

---

## 24. Full Regression

Run the **complete root-level test suites**.

Do not test only a subdirectory.

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

Current Phase 6C baseline:

```text
Server: 45 files / 436 tests
Client: 8 files / 48 tests
```

Do not delete, rename, relocate, disable, or exclude existing tests to make counts pass.

Report the exact final counts.

---

## 25. Architecture Quality Checks

Before finishing, verify:

- no duplicate ResumeDocument abstraction
- no duplicate renderer
- no duplicate scoring engine
- no duplicate evidence system
- no second Profile source of truth
- no browser-supplied candidate facts
- no Master mutation
- no Career Profile mutation
- no silent AI fallback
- no unsupported JD claims
- no silent stale generation
- no accidental duplicate variants
- no premature Phase 6E implementation

Reuse existing abstractions.

---

## 26. Expected Implementation Areas

Inspect the current module structure first.

Possible backend areas:

```text
server/src/modules/resume/
server/src/modules/resume-intelligence/
server/src/modules/job-tailoring/
server/src/modules/job-profile/
```

Possible files, only if consistent with the existing architecture:

```text
tailored-resume.generator.ts
tailored-resume.service.ts
tailored-resume.controller.ts
tailored-resume.types.ts
tailored-resume.spec.ts
```

Do not blindly create these names.

Frontend should reuse:

```text
JobTailoringWorkspace
useTailoringPlan
Resume Portfolio
Resume Studio
```

---

## 27. Mental Model

Keep this exact responsibility boundary:

```text
6A = WHAT DOES THE JOB REQUIRE?

6B = WHAT DOES THE CANDIDATE ACTUALLY HAVE?

6C = WHAT SHOULD CHANGE, AND DID THE USER APPROVE IT?

6D = EXECUTE THOSE APPROVED CHANGES SAFELY.

6E = LET THE USER WORK WITH THE RESULT.
```

Do not make 6D smarter than its responsibility.

---

## 28. Definition of Done

### Backend

- Tailored Resume generation works.
- Master Resume is cloned safely.
- Approved 6C proposals are applied.
- User edits are preserved.
- Rejected/PENDING proposals are not incorrectly applied.
- DO_NOT_ADD protection remains intact.
- Evidence provenance is preserved.
- Factual validation passes.
- Source immutability is tested.
- Ownership is tested.
- Staleness is tested.
- Duplicate generation is handled.
- `TAILORED` variant persists correctly.
- `parentResumeId` is correct.
- Job association is correct.

### Frontend

- User can trigger generation from 6C.
- User understands Master remains unchanged.
- Loading state works.
- Success state works.
- Failure state works.
- Generated Tailored Resume can be opened.

### Verification

- focused backend tests pass
- focused frontend tests pass
- complete backend regression passes
- complete frontend regression passes
- server typecheck = 0 errors
- client typecheck = 0 errors
- manual QA passes

---

## 29. Final Report

When finished, report:

```text
PHASE 6D IMPLEMENTATION COMPLETE

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

Generation:
- Master Resume immutable: PASS/FAIL
- Career Profile immutable: PASS/FAIL
- Evidence preserved: PASS/FAIL
- DO_NOT_ADD protection: PASS/FAIL
- Factual validation: PASS/FAIL
- Staleness handling: PASS/FAIL
- Regeneration safety: PASS/FAIL
- Ownership/security: PASS/FAIL

Manual QA:
- PASS/FAIL

Final Status:
PASS
or
PASS WITH CHANGES
or
FAIL
```

Do not claim PASS unless the complete regression and both typechecks actually ran.

---

# FINAL INSTRUCTION

Implement **Phase 6D only**.

Preserve all Phase 1–6C architecture and invariants.

Do not redesign unrelated systems.

Do not modify the Career Profile.

Do not modify the Master Resume.

Do not create a second source of truth.

Do not let AI invent candidate facts.

Do not bypass Phase 6C approval.

Do not build Phase 6E prematurely.

The final result must be:

```text
APPROVED 6C TAILORING PLAN
          ↓
CONTROLLED 6D GENERATION
          ↓
INDEPENDENT TAILORED RESUME
          ↓
READY FOR PHASE 6E
```

Start by inspecting the existing codebase and Phase 6C implementation before making changes.
