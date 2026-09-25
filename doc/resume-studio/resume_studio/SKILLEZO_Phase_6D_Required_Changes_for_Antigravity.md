# Phase 6D — Required Changes Before Implementation

## Review Status

**PASS WITH CHANGES**

The Phase 6D architecture is fundamentally correct and aligned with the frozen Phase 1–6C boundaries.

Do **not** begin implementation until the following changes are incorporated into the Phase 6D implementation plan.

---

## 1. Resolve TailoringPlan Status Transition

The plan currently contains two different lifecycle transitions:

- One section says the TailoringPlan becomes `APPLIED`.
- Another says the service updates the status to `APPROVED`.

These must be reconciled.

### Required behavior

Inspect the existing Phase 6C TailoringPlan status enum/state machine and reuse it.

If the existing lifecycle supports:

```text
DRAFT
  ↓
READY_FOR_REVIEW
  ↓
APPROVED
  ↓
APPLIED
```

then 6D should perform:

```text
APPROVED → APPLIED
```

**only after successful Tailored Resume persistence.**

Never mark the plan `APPLIED` before the Tailored Resume is successfully persisted.

If `APPLIED` does not exist in the existing Phase 6C model, do not invent a second lifecycle without first reconciling it with the existing architecture.

---

## 2. CRITICAL — PROMOTE Must Never Create Unsupported Skills

The current plan says that for `PROMOTE`, the generator may ensure the skill exists in the cloned document.

This must be tightened.

A `PROMOTE` proposal must only reorder/emphasize an **already-supported candidate skill**.

Correct:

```text
Existing supported skill
        ↓
PROMOTE
        ↓
Reorder existing skill
```

Incorrect:

```text
PROMOTE proposal
        ↓
Skill does not exist
        ↓
Create new skill
```

If the skill does not already exist in the source ResumeDocument or cannot be resolved to valid canonical evidence:

```text
INVALID_TAILORING_TARGET
```

or an equivalent structured error must be returned.

**6D must never create a candidate skill as a side effect of PROMOTE.**

---

## 3. CRITICAL — Never Silently Overwrite an Existing Tailored Resume

The current plan says an existing Tailored Resume may be safely updated or a new version created.

This needs explicit behavior.

### First generation

```text
No Tailored Resume
        ↓
Create
```

### Existing generated variant without user edits

An explicit regeneration may update/recreate it according to the project's existing versioning strategy.

### Existing variant with user edits

Do NOT silently overwrite it.

Use one of:

```text
Explicit confirmation
```

or:

```text
Create a new version
```

depending on the existing architecture.

The user must not lose manual changes.

---

## 4. Define `force` Precisely

The current API contains:

```ts
{
  force?: boolean
}
```

Define exactly what this means.

`force` must **never** bypass:

- ownership checks
- evidence validation
- factual validation
- stale-source protection
- approval requirements
- DO_NOT_ADD protection

If retained, `force` should only represent explicit user confirmation to regenerate/replace an existing Tailored Resume where replacement is otherwise protected.

It must never mean:

```text
ignore safety checks
```

Add tests proving this.

---

## 5. Staleness Must Be Dynamically Verified

Do not rely only on:

```text
isStale === false
```

Before generation, compare current source versions against the versions captured by the TailoringPlan/MatchResult.

Verify the project's actual versioning fields for:

```text
Current Profile version
        ===
TailoringPlan source Profile version

Current Job analysis version
        ===
TailoringPlan source Job analysis version

Current JobMatchResult version/source
        ===
TailoringPlan source MatchResult version
```

The stored `isStale` flag may support UI, but it must not be the only correctness gate.

---

## 6. Validate the TailoringPlan Against the Current Master Resume

The plan was generated against a particular Master Resume state.

Before materialization:

```text
6C Plan created
      ↓
Master Resume changes
      ↓
6D Generate
```

must be detected.

6D must not blindly apply old entity IDs, bullet targets, or proposal assumptions to a changed Master Resume.

If the Master Resume changed incompatibly:

```text
SOURCE_VERSION_CHANGED
```

or the project's equivalent structured error must be returned.

---

## 7. Preserve User Edits Exactly

For:

```text
decision = EDITED
```

6D must use:

```text
userEditedValue
```

after factual validation.

Do NOT do:

```text
userEditedValue
      ↓
LLM
      ↓
new rewritten value
```

unless Phase 6C explicitly created and approved a new proposal.

The user's approved edit is authoritative.

---

## 8. Validate Every Proposal Target Type

Inspect the actual Phase 6C proposal target union.

Every supported proposal target must either:

1. have a deterministic materializer in 6D, or
2. explicitly fail as unsupported.

Never silently skip a proposal.

If a proposal cannot be materialized:

```text
UNSUPPORTED_TAILORING_TARGET
```

or the project's equivalent structured error must be returned.

A generation must never succeed while silently ignoring an approved proposal.

---

## 9. DO_NOT_ADD Must Be a Final-Document Exclusion Invariant

Do not only verify that `DO_NOT_ADD` proposals were not directly applied.

Also validate the final Tailored Resume against protected exclusions where the Phase 6C data model makes this possible.

Example:

```text
AWS → DO_NOT_ADD
```

must not appear through another approved summary/bullet proposal as an unsupported candidate claim.

Final output validation should ensure protected exclusions remain absent.

---

## 10. Add Final Master-vs-Tailored Diff Validation

Before persistence, calculate a controlled conceptual diff:

```text
Master Resume
      ↓
Tailored Resume
      ↓
Expected Differences
```

Every meaningful difference should be explainable by an approved Phase 6C proposal.

Examples:

```text
Changed summary
Promoted skill
Changed bullet
Selected project
Changed section order
```

must correspond to approved decisions.

Do not persist unexplained changes.

The complete diff does not necessarily need to be persisted. A validation-only diff is sufficient.

This establishes the invariant:

> Only approved Phase 6C changes were materialized.

---

## 11. Keep AI Usage Minimal in 6D

6D must remain a deterministic execution layer.

Prefer:

```text
6C approved value
      ↓
Validate
      ↓
Apply
```

over:

```text
6C approved value
      ↓
LLM rewrite
      ↓
Apply
```

AI may only be used for an explicitly supported proposal type where Phase 6C authorized generated/refined text.

Do not allow 6D to become a second tailoring engine.

---

## 12. Atomic Tailored Resume + TailoringPlan State

The correct sequence is:

```text
Validate everything
      ↓
Build Tailored Resume in memory
      ↓
Validate final document
      ↓
Persist Tailored Resume
      ↓
ONLY AFTER SUCCESS
mark TailoringPlan APPLIED
```

If Tailored Resume persistence fails:

```text
TailoringPlan must NOT become APPLIED
```

Avoid:

```text
Plan = APPLIED
Tailored Resume = missing
```

Use a MongoDB transaction/session if the existing architecture supports it.

If transactions are not appropriate, implement an equivalent safe consistency strategy.

---

## 13. Add Concurrency Protection

Handle simultaneous requests:

```text
Request A → Generate
Request B → Generate
```

They must not create conflicting variants or overwrite each other unpredictably.

Reuse existing repository/concurrency patterns.

Add an appropriate idempotency/concurrency test if practical.

---

## 14. Preserve Explicit Source TailoringPlan Identity

The plan already proposes:

```text
sourceTailoringPlanVersion
```

Also inspect whether the existing architecture has a TailoringPlan ID/version reference that should be retained.

A future debugging flow should be able to answer:

```text
Which TailoringPlan produced this Tailored Resume?
```

Prefer an explicit source plan reference if compatible with the existing schema.

Do not duplicate information unnecessarily.

---

## 15. Define Proposal Count Semantics

The response currently contains:

```ts
appliedProposalsCount
rejectedProposalsCount
```

Define exactly what these mean.

Recommended:

```text
applied =
  ACCEPTED + EDITED proposals successfully materialized

rejected =
  explicitly REJECTED proposals
```

Do not automatically count:

```text
DO_NOT_ADD
```

as ordinary rejected proposals unless that is explicitly defined by the domain model.

Protected/non-actionable proposals may need a separate category if useful.

---

## 16. Keep Tailored Resume Retrieval Metadata-Safe

For:

```http
GET /api/job-profiles/:id/tailored-resume
```

follow the existing Resume Portfolio metadata conventions.

Do not accidentally return the entire ResumeDocument/AST if only metadata is needed.

Reuse existing Portfolio/Resume retrieval patterns.

---

## 17. Verify Existing Resume Studio Routing Before Adding Anything

The proposed navigation:

```text
/dashboard/resume-studio?resumeId=${id}
```

is valid only if the existing Resume Studio already supports arbitrary variant IDs.

Verify the Phase 5/5.5 routing implementation.

If it already works:

```text
Reuse it.
```

Do not redesign Resume Studio in 6D.

Phase 6E owns deeper Studio integration/comparison UX.

---

## 18. Verify Master vs Tailored Identity

Manual QA must verify:

### Master

```text
variantType = MASTER
parentResumeId = null / existing expected value
```

### Tailored

```text
variantType = TAILORED
parentResumeId = Master ID
targetJobId = JobProfile ID
```

Also verify the Tailored Resume never becomes the new Master source.

---

## 19. Add One High-Value 6A → 6D Integration Test

Add one end-to-end integration test covering:

```text
6A JobProfile
      ↓
6B JobMatchResult
      ↓
6C approved TailoringPlan
      ↓
6D generation
      ↓
TAILORED Resume
```

Verify:

- correct `variantType`
- correct `parentResumeId`
- correct JobProfile association
- approved changes applied
- rejected changes absent
- DO_NOT_ADD absent
- evidence preserved
- Master unchanged
- Profile unchanged
- TailoringPlan transitions correctly

This test should protect the complete contract between the four phases.

---

# Final Review Status

After these changes are incorporated:

**PASS / READY TO IMPLEMENT**

Do not expand Phase 6D into Phase 6E.

Maintain the core boundary:

```text
6C = decides WHAT should change.

6D = MATERIALIZES only those approved decisions.

Master Resume = untouched.
Career Profile = untouched.
```

Start implementation only after these changes are reflected in the plan.
