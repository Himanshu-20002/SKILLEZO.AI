# SKILLEZO AI — Phase 7
# AI Action System / Safe Action Execution
## Implementation Prompt for Antigravity IDE

---

## 0. ROLE

You are implementing **Phase 7 of the SKILLEZO AI architecture**.

Phases 1–6 are complete and must be treated as stable.

Phase 7 introduces the controlled boundary between:

```text
AI Recommendation
        ↓
Action Proposal
        ↓
User Review
        ↓
Explicit User Approval
        ↓
Safe Action Executor
        ↓
Deterministic Mutation
        ↓
Verified Result
```

Core rule:

> **AI may propose. The user must approve. Only deterministic application code may mutate data.**

The LLM must NEVER directly mutate the database.

Do not implement autonomous actions.
Do not implement silent writes.
Do not allow the LLM to choose arbitrary mutation functions.

---

# 1. CURRENT ARCHITECTURE

```text
Phase 1 → Model Gateway & Provider Abstraction        ✅
Phase 2 → Evidence Layer & Candidate Context         ✅
Phase 3 → Controlled Tool Registry                   ✅
Phase 4 → AI Orchestrator                            ✅
Phase 5 → Career Coach API                           ✅
Phase 6 → Career Coach UI / Workbench                ✅
Phase 7 → AI Action System / Safe Action Execution   🚧 CURRENT
Phase 8 → Scale & Production Hardening               ⏳ FUTURE
```

Phase 7 extends the existing flow:

```text
AI Recommendation
 ↓
Action Proposal
 ↓
User Review
 ↓
Explicit Approval
 ↓
Authorization
 ↓
Idempotency / Staleness Checks
 ↓
Deterministic Service
 ↓
Database Mutation
 ↓
Read-Back Verification
 ↓
Action Result
```

---

# 2. FIRST STEP — INSPECT BEFORE IMPLEMENTING

Before writing code, inspect the actual repository.

Identify:

1. Existing mutation services.
2. Existing repositories.
3. Existing Mongoose models.
4. Existing authentication/session middleware.
5. Existing ownership checks.
6. Existing Resume Studio mutation flows.
7. Existing Career Plan mutation flows.
8. Existing Profile mutation flows.
9. Existing Job Application flows.
10. Existing validation schemas.
11. Existing transaction/session support.
12. Existing version/revision mechanisms.
13. Existing audit logging.
14. Existing request ID infrastructure.
15. Existing error conventions.
16. Phase 5 action/recommendation response types.
17. Phase 6 action/recommendation UI.
18. Existing API client and routing conventions.

Do not assume an existing mutation service is safe until inspected.

Reuse authoritative business services rather than creating duplicate database logic.

---

# 3. ARCHITECTURAL INVARIANT

The complete trusted lifecycle is:

```text
READ
 ↓
REASON
 ↓
PROPOSE
 ↓
USER APPROVES
 ↓
WRITE
 ↓
VERIFY
```

Never:

```text
READ
 ↓
AI
 ↓
WRITE
```

The model has no mutation authority.

---

# 4. PHASE 7 RESPONSIBILITY

Phase 7 owns:

```text
Action types
Action schemas
Action Registry
Proposal validation
Proposal persistence where required
Proposal preview
Approval boundary
Authorization
Ownership verification
Action state machine
Idempotency
Stale/version protection
Deterministic execution
Mutation verification
Audit metadata
Action API
Action UI
```

Phase 7 does NOT own:

```text
AI provider abstraction
LLM reasoning
Deterministic career scoring
Evidence generation
Tool Registry intelligence
Career Coach orchestration
Autonomous application
Unapproved mutations
```

Do not redesign Phases 1–6.

---

# 5. ACTION SYSTEM ARCHITECTURE

Build:

```text
                 AI RECOMMENDATION
                         │
                         ▼
                  ACTION PROPOSER
                         │
                         ▼
                 ACTION VALIDATOR
                         │
                         ▼
                  ACTION PROPOSAL
                         │
                         ▼
                   USER REVIEW
                         │
                ┌────────┴────────┐
                │                 │
              REJECT            APPROVE
                │                 │
                ▼                 ▼
            REJECTED       ACTION EXECUTOR
                                  │
                                  ▼
                           AUTHORIZATION
                                  │
                                  ▼
                          OWNERSHIP CHECK
                                  │
                                  ▼
                        STALE/VERSION CHECK
                                  │
                                  ▼
                          IDEMPOTENCY CHECK
                                  │
                                  ▼
                       DETERMINISTIC SERVICE
                                  │
                                  ▼
                              DATABASE
                                  │
                                  ▼
                         READ-BACK VERIFY
                                  │
                                  ▼
                            ACTION RESULT
```

---

# 6. ACTION PROPOSAL

An Action Proposal is NOT a mutation.

It describes:

```text
what will happen
why it is proposed
what evidence supports it
what entity will be affected
what fields/sections will change
what the user must approve
```

Conceptual shape:

```ts
type ActionProposal = {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  rationale: string;
  evidenceIds: string[];
  preview: ActionPreview;
  status: ActionStatus;
  createdAt: string;
  expiresAt?: string;
};
```

This is conceptual only. Match actual repository conventions.

---

# 7. STRICT ACTION ALLOWLIST

Create a server-side allowlist.

Potential action types:

```ts
type ActionType =
  | "RESUME_UPDATE"
  | "CAREER_PLAN_CREATE"
  | "CAREER_PLAN_UPDATE"
  | "PROFILE_UPDATE"
  | "JOB_APPLICATION_PREPARE";
```

Only implement action types for which the repository already has an authoritative deterministic service.

Do not expose arbitrary action types.

Do not let the model invent executable action names.

---

# 8. ACTION REGISTRY

Create a closed server-side Action Registry.

Conceptual:

```text
ActionRegistry
 ├── RESUME_UPDATE
 ├── CAREER_PLAN_CREATE
 ├── CAREER_PLAN_UPDATE
 ├── PROFILE_UPDATE
 └── JOB_APPLICATION_PREPARE
```

Each registered action should define:

```text
action type
input schema
preview schema
authorization requirements
target entity type
executor
verification strategy
idempotency strategy
```

Unknown action types must be rejected.

Do not dynamically execute functions based on model-generated strings.

---

# 9. IDENTITY AND OWNERSHIP

The client must NEVER be authoritative for:

```text
userId
candidateId
ownerId
executor
database collection
permissions
```

Identity must come from:

```text
authenticated server request context
```

At execution time verify:

```text
req.user.id
      ↓
proposal.ownerId
      ↓
targetEntity.ownerId
```

All ownership relationships must be valid.

Cross-candidate access must be rejected.

---

# 10. ACTION IDENTITY

Generate proposal/action IDs server-side.

Do not trust client-generated IDs as authoritative.

Actions should be traceable using appropriate existing infrastructure:

```text
requestId
actionId
authenticated user
```

Do not expose unnecessary internal IDs to the client.

---

# 11. ACTION INPUT VALIDATION

Use strict Zod schemas or the project's existing validation system.

Reject:

```text
unknown fields
raw Mongo update objects
Mongo operators
$set
$push
$pull
$where
aggregation expressions
arbitrary collection names
arbitrary executor names
```

Bad:

```json
{
  "update": {
    "$set": {
      "profile.skills": ["TypeScript"]
    }
  }
}
```

Good:

```json
{
  "actionType": "PROFILE_UPDATE",
  "changes": {
    "skills": ["TypeScript"]
  }
}
```

The server translates semantic action input into deterministic service calls.

---

# 12. ACTION PREVIEW

Before approval, the user must understand what will happen.

For meaningful mutations, show:

```text
Action
What changes
Before
After
Why
Supporting evidence
Affected entity
Limitations
```

Example:

```text
Improve Resume Experience

BEFORE
Built REST APIs.

AFTER
Built and optimized REST APIs,
improving response latency by 30%.

Why
Your impact evidence is weak.

Evidence
Resume Intelligence

[Reject]     [Review & Approve]
```

Do not fabricate before/after values.

The preview must come from the validated action proposal.

---

# 13. RESUME UPDATE FLOW

If Resume Update is supported:

```text
Current Resume
 ↓
Read authoritative state
 ↓
AI proposal
 ↓
Validate proposed change
 ↓
User review
 ↓
Explicit approval
 ↓
Check current resume version
 ↓
Deterministic Resume Service
 ↓
Persist section/field change
 ↓
Read updated resume
 ↓
Re-run relevant Resume Intelligence
 ↓
Return verified result
```

Never blindly replace the entire resume.

Prefer section-level or field-level mutation.

---

# 14. STALE PROPOSAL PROTECTION

Protect proposals against source changes.

Conceptual:

```text
Proposal created:
resumeVersion = 12

User edits resume:
resumeVersion = 13

User approves old proposal

→ STALE
→ no mutation
→ user must review updated state
```

Use the existing version/revision mechanism if available.

If none exists, implement the smallest safe mechanism necessary.

Never silently rebase a proposal onto a changed entity.

---

# 15. CAREER PLAN ACTIONS

If supported by existing services:

```text
Current Career Context
 ↓
AI Proposal
 ↓
Validation
 ↓
User Review
 ↓
Approval
 ↓
Career Plan Service
 ↓
Persist
 ↓
Read-back Verification
```

Do not allow the LLM to write Career Plan documents directly.

---

# 16. PROFILE ACTIONS

If supported:

```text
Current Profile
 ↓
AI Proposal
 ↓
User Review
 ↓
Approval
 ↓
Profile Service
 ↓
Persist
 ↓
Verification
```

Only explicitly allowlisted profile fields may be modified.

Never accept arbitrary Mongo update documents.

---

# 17. JOB APPLICATION BOUNDARY

If Job Application actions are implemented in Phase 7, initially support:

```text
JOB_APPLICATION_PREPARE
```

not autonomous submission.

Safe initial flow:

```text
Job
 ↓
AI prepares application material
 ↓
User reviews
 ↓
User approves preparation
 ↓
Save draft
```

Do NOT implement autonomous application submission or auto-apply in Phase 7.

---

# 18. EXPLICIT USER APPROVAL

Approval must be explicit.

Valid:

```text
[Approve Changes]
```

Invalid:

```text
opening proposal = approval
viewing proposal = approval
timeout = approval
AI response = approval
```

Do not execute a mutation simply because a recommendation was displayed.

---

# 19. APPROVAL-TIME REVALIDATION

When the user approves, re-check:

```text
authenticated user
proposal ownership
proposal status
proposal expiration
target ownership
authorization
current target state
source version
idempotency
```

Do not rely only on validation performed when the proposal was created.

---

# 20. ACTION STATE MACHINE

Implement explicit states.

Conceptual:

```ts
type ActionStatus =
  | "PROPOSED"
  | "APPROVED"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "EXPIRED"
  | "STALE";
```

Allowed transitions:

```text
PROPOSED
 ├── REJECTED
 ├── EXPIRED
 ├── STALE
 └── APPROVED
        ↓
    EXECUTING
      ├── COMPLETED
      └── FAILED
```

Reject invalid transitions.

Do not allow:

```text
REJECTED → APPROVED
EXPIRED → APPROVED
COMPLETED → EXECUTING
```

unless a deliberately designed retry transition exists.

---

# 21. IDEMPOTENCY

Every mutation-capable action must be idempotent.

If approval/execution is accidentally repeated:

```text
First request  → executes
Second request → returns existing result
```

It must not duplicate mutations.

Use a server-side action execution identifier/idempotency mechanism.

Frontend button disabling is NOT sufficient.

Test duplicate requests.

---

# 22. CONCURRENCY

Protect against simultaneous approvals.

Example:

```text
Request A approves
Request B approves simultaneously

→ only one execution
→ one authoritative result
```

Use existing locking/transaction/version mechanisms where appropriate.

Do not claim stronger concurrency guarantees than the database infrastructure provides.

---

# 23. TRANSACTIONAL SAFETY

Inspect existing database transaction/session support.

For multiple dependent writes:

```text
write A
write B
write C
```

use an existing transaction/session mechanism when available and appropriate.

If atomicity is unavailable:

- keep the operation sequence minimal
- detect partial failure
- return accurate status
- do not claim full atomicity

---

# 24. POST-MUTATION VERIFICATION

Never return success solely because the database operation did not throw.

Required pattern:

```text
Mutation
 ↓
Read updated entity
 ↓
Validate actual state
 ↓
Optional deterministic intelligence refresh
 ↓
Return verified action result
```

For resume actions, relevant deterministic intelligence may be re-run after mutation.

Only return metrics that were actually re-calculated/verified.

---

# 25. ACTION RESULT

Conceptual:

```ts
type ActionResult = {
  actionId: string;
  status: "COMPLETED" | "FAILED";
  summary: string;
  affectedEntity?: {
    type: string;
    id: string;
  };
  verification?: {
    verified: boolean;
    metrics?: StructuredMetricItem[];
  };
};
```

Match actual project conventions.

Do not expose internal database details.

---

# 26. API BOUNDARY

Create a clean server action API according to existing routing conventions.

Possible conceptual endpoints:

```text
POST /api/ai/actions/proposals
GET  /api/ai/actions/:actionId
POST /api/ai/actions/:actionId/approve
POST /api/ai/actions/:actionId/reject
```

Do not blindly implement these exact paths if existing conventions dictate otherwise.

Every endpoint must enforce:

```text
authentication
validation
ownership
authorization
state transition
idempotency
staleness
audit
```

---

# 27. PROPOSAL CREATION FROM AI

AI recommendations may lead to proposals.

However, the server must validate everything.

The model may suggest:

```text
action type
rationale
proposed changes
evidence references
```

The server must verify:

```text
action type is allowlisted
evidence exists
evidence belongs to candidate context
target entity belongs to candidate
fields are permitted
values satisfy schema
proposal is executable
```

Never trust the model's assertion that an action is valid.

---

# 28. AI CANNOT DECIDE AUTHORITY

The model cannot decide:

```text
which user to modify
which collection to update
which function to call
which fields are authorized
whether approval occurred
whether a proposal is still valid
whether a mutation succeeded
```

Those are deterministic application decisions.

---

# 29. AUDIT TRAIL

Record appropriate non-sensitive action metadata:

```text
actionId
requestId
authenticated user
action type
target entity type
target entity ID
status
createdAt
approvedAt
completedAt
```

Avoid storing full sensitive AI conversations unless existing privacy architecture explicitly requires it.

Audit must answer:

```text
Who approved this?
What action ran?
When?
Against what entity?
Did it succeed?
```

---

# 30. FRONTEND ACTION UX

Extend the Phase 6 Career Coach UI.

Recommendation:

```text
AI Recommendation
       ↓
Review Proposed Change
```

Example:

```text
AI Recommendation

Improve your resume impact statements.

Proposed change:
────────────────────────────
BEFORE
Built REST APIs.

AFTER
Built and optimized REST APIs,
improving response latency by 30%.
────────────────────────────

Evidence:
Resume Intelligence

[Reject]       [Review & Approve]
```

Do not execute meaningful mutations directly from the initial recommendation card.

---

# 31. REVIEW SCREEN

Create a review experience appropriate to the existing UI.

Show:

```text
Action title
What will change
Before
After
Why
Supporting evidence
Affected entity
Potential limitations
```

Controls:

```text
Reject
Approve
```

For higher-impact mutations, require an explicit confirmation step if appropriate.

---

# 32. POST-ACTION UX

Successful example:

```text
✓ Action completed

Your resume section was updated.

Verified result:
ATS Compatibility: 86
Impact & Content: 81

[View Resume]
```

Use actual returned values only.

If verification is inconclusive:

```text
Action completed, but verification was inconclusive.
```

Do not falsely display a verified result.

---

# 33. FAILED ACTION UX

Use safe user-facing errors.

Examples:

```text
This action could not be completed.

Your resume changed since this proposal was created.
Please review the latest version.
```

or:

```text
This proposal has expired.
Please generate a new proposal.
```

Never expose:

```text
Mongo errors
stack traces
internal paths
provider errors
database details
```

---

# 34. ACTION HISTORY

If existing architecture supports it, provide a lightweight history:

```text
Recent AI Actions

✓ Resume improvement       Completed
✕ Career plan update       Failed
↻ Profile proposal         Rejected
```

Do not build a complex enterprise audit dashboard.

---

# 35. SECURITY AUDIT

Search for unsafe patterns:

```text
req.body.userId
req.body.ownerId
req.body.candidateId
Model.updateOne(req.body)
Model.findOneAndUpdate(req.body)
dynamic executor
dynamic collection
eval
Function(...)
```

Also confirm no frontend direct imports of:

```text
mongoose
MongoDB
Gemini SDK
OpenAI SDK
ToolRegistry
ModelGateway
AIProvider
```

---

# 36. OBSERVABILITY

Reuse existing request ID and telemetry infrastructure.

Track suitable lifecycle events:

```text
action_proposed
action_reviewed
action_approved
action_rejected
action_started
action_completed
action_failed
action_stale
action_expired
```

Do not log sensitive payloads unnecessarily.

---

# 37. TESTING — SERVER

Create comprehensive tests.

### Action Registry
- allowed action accepted
- unknown action rejected
- arbitrary executor rejected

### Ownership
- correct owner succeeds
- cross-user proposal access rejected
- cross-user approval rejected
- cross-user execution rejected

### Validation
- invalid input rejected
- unknown fields rejected
- raw Mongo updates rejected
- unauthorized fields rejected

### State Machine
- PROPOSED → APPROVED
- PROPOSED → REJECTED
- PROPOSED → EXPIRED
- PROPOSED → STALE
- APPROVED → EXECUTING
- EXECUTING → COMPLETED
- EXECUTING → FAILED
- invalid transitions rejected

### Approval
- approval required
- viewing proposal does not approve
- AI response cannot auto-approve
- expired proposal cannot approve
- stale proposal cannot approve

### Idempotency
- duplicate approval does not duplicate mutation
- duplicate execution returns existing result

### Concurrency
- changed source entity causes stale rejection
- concurrent approval cannot double-write

### Verification
- mutation is read-back verified
- verification failure is handled honestly

### Audit
- required action metadata recorded

---

# 38. TESTING — CLIENT

Cover:

```text
proposal rendering
review screen
before/after diff
evidence display
approve
reject
loading
approval failure
stale action
expired action
completed action
failed action
duplicate click protection
```

Verify the client never directly invokes mutation services.

---

# 39. NO AUTO-APPLY

Do NOT implement autonomous job application.

The future safe flow remains:

```text
Job Discovery
 ↓
Job Matching
 ↓
Application Preparation
 ↓
User Review
 ↓
User Approval
 ↓
Application Submission
```

Auto-apply requires a separate future architecture with explicit controls.

---

# 40. NO BULK MUTATIONS

Do not implement:

```text
Approve All
Apply All
Update All
Bulk AI Edit
```

Each mutation-capable action must have an individual approval boundary.

---

# 41. IMPLEMENTATION ORDER

```text
STEP 1
Inspect mutation services/repositories

↓

STEP 2
Inspect auth/ownership infrastructure

↓

STEP 3
Inspect transactions/version/audit support

↓

STEP 4
Define strict Action types and schemas

↓

STEP 5
Build Action Registry

↓

STEP 6
Build proposal validation

↓

STEP 7
Build proposal persistence if required

↓

STEP 8
Build action state machine

↓

STEP 9
Build approval boundary

↓

STEP 10
Build deterministic Action Executor

↓

STEP 11
Build idempotency + stale protection

↓

STEP 12
Build mutation verification

↓

STEP 13
Build Action API

↓

STEP 14
Integrate Phase 6 UI

↓

STEP 15
Build review/approval UX

↓

STEP 16
Add tests

↓

STEP 17
Run regression/typecheck/build/security audit
```

---

# 42. ACCEPTANCE CRITERIA

### Architecture
- [ ] AI can propose but cannot mutate.
- [ ] User approval is mandatory.
- [ ] Action Registry is allowlisted.
- [ ] Action Executor is deterministic.
- [ ] Existing business services are reused.
- [ ] Phases 1–6 remain intact.

### Security
- [ ] Identity comes from authenticated server context.
- [ ] Cross-user access is rejected.
- [ ] Target ownership is checked.
- [ ] Client cannot select arbitrary executors.
- [ ] Raw Mongo updates are rejected.
- [ ] Unknown action types are rejected.

### Safety
- [ ] Proposals are reviewable.
- [ ] Before/after state is visible where applicable.
- [ ] Stale proposals cannot execute.
- [ ] Expired proposals cannot execute.
- [ ] Duplicate approvals cannot duplicate mutations.
- [ ] No autonomous mutations.
- [ ] No auto-apply.
- [ ] No bulk mutation.

### Verification
- [ ] Mutations are followed by verification.
- [ ] Action result reflects actual state.
- [ ] Verification failure is represented honestly.

### UI
- [ ] Recommendation opens a proposal.
- [ ] Proposal review works.
- [ ] Reject works.
- [ ] Approve works.
- [ ] Loading/error/success states work.
- [ ] Action result is visible.
- [ ] Existing SKILLEZO design language is preserved.

---

# 43. VERIFICATION COMMANDS

Inspect actual package scripts first.

Run:

```bash
cd server
npm test
npm run type-check
npm run build
```

Then:

```bash
cd client
npm test
npm run type-check
npm run build
```

Adapt commands to the actual repository.

Record actual results.

Never fabricate test counts.

---

# 44. REGRESSION

Confirm all existing systems remain green:

```text
Authentication
Resume Intelligence
ATS
Skill Gap
Employability
Job Matching
Career Plan
AI Orchestrator
Career Coach API
Career Coach UI
```

---

# 45. FINAL ARCHITECTURAL VALIDATION

The trusted flow must be:

```text
USER
 ↓
CAREER COACH UI
 ↓
AI REASONING
 ↓
VALIDATED RECOMMENDATION
 ↓
ACTION PROPOSAL
 ↓
USER REVIEW
 ↓
EXPLICIT APPROVAL
 ↓
ACTION API
 ↓
AUTHORIZATION
 ↓
OWNERSHIP CHECK
 ↓
STALE/VERSION CHECK
 ↓
IDEMPOTENCY CHECK
 ↓
DETERMINISTIC SERVICE
 ↓
DATABASE MUTATION
 ↓
READ-BACK VERIFICATION
 ↓
ACTION RESULT
 ↓
CAREER COACH UI
```

Critical boundary:

```text
             AI
              │
              ▼
         PROPOSAL ONLY
              │
        USER APPROVAL
              │
              ▼
       DETERMINISTIC CODE
              │
              ▼
           DATABASE
```

---

# 46. DO NOT IMPLEMENT PHASE 8

Do not add:

```text
Redis
distributed action queues
multi-region execution
advanced workflow engines
enterprise approval chains
complex distributed locks
large-scale action orchestration
```

unless already required by existing infrastructure.

Phase 8 handles scale and production hardening.

---

# 47. FINAL WALKTHROUGH

At completion provide:

## 1. Files created
Actual files only.

## 2. Files modified
Actual files only.

## 3. Action architecture
Proposal → approval → execution → verification.

## 4. Implemented action types
List only actual implemented action types.

## 5. Security
Identity, ownership and authorization.

## 6. State machine
Valid action transitions.

## 7. Idempotency
Duplicate request handling.

## 8. Stale protection
Version/concurrency protection.

## 9. Verification
Post-mutation verification.

## 10. UI
Proposal/review/approval/result experience.

## 11. Tests
Actual results:

```text
Action tests: X/X
Server full suite: X/X
Client tests: X/X
Server typecheck: PASS/FAIL
Client typecheck: PASS/FAIL
Server build: PASS/FAIL
Client build: PASS/FAIL
Security audit: PASS/FAIL
```

Never fabricate numbers.

---

# 48. STOP CONDITIONS

Stop and report instead of guessing if:

- Existing mutation service semantics are unclear.
- Ownership rules are unclear.
- Version/concurrency behavior cannot be established safely.
- A mutation would require arbitrary database access.
- A model would need direct mutation authority.
- Approval cannot be made explicit.
- Idempotency cannot be safely guaranteed.
- Verification cannot determine actual post-mutation state.
- Existing Phase 1–6 architecture would need to be weakened.

Do not bypass a safety boundary to complete the feature.

---

# FINAL RULES

1. Inspect before implementing.
2. Treat Phases 1–6 as stable.
3. AI proposes; deterministic code executes.
4. User approval is mandatory.
5. Never allow the LLM to mutate data.
6. Never allow arbitrary model-generated function execution.
7. Use an allowlisted Action Registry.
8. Use strict schemas.
9. Identity comes from authenticated server context.
10. Verify ownership at proposal and execution time.
11. Never trust client-supplied userId/ownerId/candidateId.
12. Never accept raw Mongo update operators from clients.
13. Reuse existing deterministic business services.
14. Protect against stale proposals.
15. Protect against duplicate execution.
16. Make mutation results verifiable.
17. Keep an appropriate audit trail.
18. Never implement autonomous actions.
19. Never implement auto-apply.
20. Never implement bulk mutation.
21. Preserve Phase 6 UI architecture.
22. Do not expose server internals.
23. Do not expose provider secrets.
24. Do not modify Phases 1–6 unnecessarily.
25. Do not implement Phase 8.
26. Run actual tests.
27. Run actual typechecks.
28. Run actual builds.
29. Do not fabricate verification results.
30. Do not push to git.

---

# PHASE 7 END STATE

SKILLEZO should now support:

```text
AI analyzes
    ↓
AI recommends
    ↓
SKILLEZO creates structured proposal
    ↓
USER REVIEWS
    ↓
USER APPROVES
    ↓
SERVER AUTHORIZES
    ↓
SERVER EXECUTES DETERMINISTIC ACTION
    ↓
DATABASE CHANGES
    ↓
SKILLEZO VERIFIES RESULT
    ↓
USER SEES VERIFIED OUTCOME
```

This establishes the safe mutation foundation required for future intelligent career automation.

**End Phase 7 here.**
