# SKILLEZO.AI — Phase 6C
# AI Tailoring Plan + Evidence Approval — Full Antigravity Implementation Prompt

## ROLE

Implement **Phase 6C: Tailoring Plan + User Approval** for SKILLEZO.AI.

Phase 1–5.5 and Phase 6A–6B are already implemented and verified.

Implement **ONLY Phase 6C**. Do not redesign previous phases. Do not implement Phase 6D or later functionality.

---

# 1. PRODUCT OBJECTIVE

Phase 6A answers:

> What does this job require?

Phase 6B answers:

> What verified career evidence does the candidate have?

Phase 6C answers:

> Given the job requirements and verified candidate evidence, what should change in the resume, and what should the user approve?

Phase 6C creates an **evidence-grounded Tailoring Plan** and user-reviewable **Tailoring Proposals**.

It does **not** generate the final tailored resume.

The user remains in control.

---

# 2. PRODUCT FLOW

Preserve:

```text
Career Profile
      ↓
Master Resume
      ↓
Job / JD
      ↓
6A — Job Analysis
      ↓
JobProfile
      ↓
6B — Career ↔ Job Evidence Matching
      ↓
JobMatchResult
      ↓
6C — Tailoring Plan + User Approval
      ↓
Approved TailoringPlan
      ↓
6D — Tailored Resume Generation
      ↓
Tailored Resume Variant
      ↓
6E — Resume Studio / Compare
```

Phase 6C consumes the outputs of 6A and 6B.

---

# 3. HARD PHASE BOUNDARIES

Phase 6C must NEVER mutate:

- `ProfileModel`
- Career Profile canonical facts
- Master `ResumeModel`
- Master `ResumeDocument`
- `JobProfile`
- `JobMatchResult`

The only new persisted domain output should be:

- `TailoringPlan`
- proposal decisions associated with that plan

Do not create a tailored resume in this phase.

---

# 4. ABSOLUTE ANTI-HALLUCINATION RULE

A Tailoring Proposal may only claim or promote information supported by verified Career Profile evidence and/or existing Master Resume facts.

The Job Description is NEVER candidate evidence.

Example:

```text
JD:
AWS required

Career Profile:
No AWS evidence

6C:
DO_NOT_ADD AWS
```

Never convert a JD requirement into a candidate skill.

---

# 5. INPUTS

Phase 6C consumes:

## A. JobProfile — Phase 6A

Use:

- normalized job identity
- `requirements[]`
- `REQUIRED`, `PREFERRED`, `UNKNOWN`
- requirement category
- source evidence
- analysis version
- job fingerprint/hash

## B. JobMatchResult — Phase 6B

Use:

- `requirementMatches[]`
- `matchState`
- evidence references
- explanations
- explicit coverage counts
- `sourceProfileVersion`
- `jobAnalysisVersion`

Relevant states:

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

## C. Master Resume

Read-only.

Use it only to determine:

- what is currently represented
- what is underrepresented
- current presentation/order
- existing section content

Never mutate it.

---

# 6. TAILORING ACTION VOCABULARY

Use a finite typed action set:

```ts
type TailoringAction =
  | "KEEP"
  | "EMPHASIZE"
  | "PROMOTE"
  | "DE_EMPHASIZE"
  | "REWRITE"
  | "REORDER"
  | "SELECT"
  | "EXCLUDE"
  | "DO_NOT_ADD";
```

Do not invent arbitrary action types.

Supported target sections:

```text
SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
SECTION_ORDER
```

---

# 7. TAILORING PROPOSAL DOMAIN

Create or reuse an existing equivalent abstraction.

Conceptually:

```ts
interface TailoringProposal {
  id: string;

  action: TailoringAction;

  targetSection:
    | "SUMMARY"
    | "SKILLS"
    | "EXPERIENCE"
    | "PROJECTS"
    | "EDUCATION"
    | "SECTION_ORDER";

  targetEntityId?: string;
  targetField?: string;

  title: string;

  currentValue?: string;
  proposedValue?: string;

  reason: string;

  requirementIds: string[];

  evidence: CareerEvidenceReference[];

  confidence?: number;

  priority: "HIGH" | "MEDIUM" | "LOW";

  userDecision:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "EDITED";

  userEditedValue?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

Adapt names to existing SKILLEZO conventions.

Do not create duplicate abstractions if an existing proposal/action system can safely be reused.

---

# 8. EVIDENCE REFERENCES

Reuse Phase 6B evidence infrastructure where possible.

Every proposal must be traceable to actual evidence.

Example:

```ts
{
  sourceType: "PROJECT",
  sourceId: "...",
  label: "EVENTO",
  excerpt: "Built recommendation engine using Next.js..."
}
```

The server must validate every evidence reference against the authenticated user's Career Profile/canonical evidence.

Never trust evidence IDs supplied by the browser.

---

# 9. MATCH STATE → TAILORING RULES

## PROVEN_RELEVANT

Allowed:

```text
KEEP
EMPHASIZE
PROMOTE
REWRITE
REORDER
SELECT
```

Example:

```text
Requirement: Next.js
Match: PROVEN_RELEVANT

Proposal:
PROMOTE Next.js in Skills
```

## PROVEN_UNDERREPRESENTED

Allowed:

```text
PROMOTE
EMPHASIZE
REWRITE
REORDER
SELECT
```

It may only be assigned when authentic verified evidence exists in `ProfileModel` AND the current Master Resume does not adequately represent that evidence.

Keyword absence alone is not enough.

## PARTIAL_MATCH

Allowed:

```text
KEEP
EMPHASIZE
REWRITE
```

Never upgrade the evidence.

Example:

```text
Requirement: 5+ years React
Evidence: 3 years structured React evidence

Allowed:
Emphasize React experience.

Not allowed:
Rewrite as 5+ years React.
```

## RELATED_EVIDENCE

Allowed:

```text
KEEP
```

or, where genuinely useful:

```text
EMPHASIZE
```

Never turn related evidence into proof.

Example:

```text
Requirement: Docker
Evidence: Kubernetes

Allowed:
Keep/emphasize Kubernetes.

Not allowed:
Add Docker.
```

Show:

> Related evidence does not prove the requirement.

## MISSING

Only:

```text
DO_NOT_ADD
```

Example:

```text
AWS
MISSING

DO_NOT_ADD

Reason:
No verified AWS evidence exists in Career Profile.
SKILLEZO will not add this claim.
```

## INSUFFICIENT_EVIDENCE

Use:

```text
KEEP
DO_NOT_ADD
NEEDS_REVIEW
```

Do not fabricate details.

## NEEDS_REVIEW

Do not automatically create a strong claim. Present the uncertainty clearly.

## NOT_APPLICABLE

Normally:

```text
EXCLUDE
```

or no proposal.

---

# 10. TAILORING INTENSITY

Support:

```text
LIGHT
BALANCED
AGGRESSIVE
```

Default:

```text
BALANCED
```

### LIGHT

Prefer minimal changes:

```text
KEEP
EMPHASIZE
PROMOTE
```

### BALANCED

Allow:

```text
PROMOTE
EMPHASIZE
REWRITE
REORDER
SELECT
DE_EMPHASIZE
EXCLUDE
```

only when evidence supports them.

### AGGRESSIVE

Can make stronger presentation changes.

But:

> Aggressive means stronger prioritization/presentation, NOT inventing facts.

Even AGGRESSIVE mode cannot add unsupported:

- skills
- technologies
- years
- responsibilities
- achievements
- metrics
- leadership claims
- scale
- revenue
- company facts

---

# 11. PROPOSAL GROUPING

Do NOT generate 40–50 tiny approval cards.

Group related changes.

Bad:

```text
Accept React
Accept Next.js
Accept TypeScript
Accept Node.js
Accept REST
Accept Express
```

Better:

```text
SKILLS — Promote Frontend Stack

Promote:
React
Next.js
TypeScript

Reason:
These are proven requirements for the target role.
```

Also group relevant project/experience changes where appropriate while preserving individual evidence references.

---

# 12. SUMMARY PROPOSAL

The engine may propose a targeted professional summary.

Example:

```text
CURRENT
Frontend developer with experience building web applications.

PROPOSED
Frontend developer specializing in React, Next.js and TypeScript,
with experience building scalable web applications and REST APIs.
```

Every factual claim must be grounded.

Never invent:

- years
- metrics
- company names
- responsibilities
- technologies
- achievements
- leadership
- scale
- revenue
- performance improvements

unless supported by evidence.

---

# 13. SKILLS PROPOSALS

Allowed actions:

```text
PROMOTE
KEEP
DE_EMPHASIZE
EXCLUDE
DO_NOT_ADD
```

Example:

```text
PROMOTE
React
Next.js
TypeScript

KEEP
Node.js
Express

DE_EMPHASIZE
Less relevant technology

DO_NOT_ADD
AWS
Docker
```

Never add a missing JD skill.

---

# 14. EXPERIENCE PROPOSALS

May:

- select relevant roles
- promote relevant bullets
- reorder bullets
- rewrite bullets for clarity/relevance
- de-emphasize irrelevant bullets

Rewrites must preserve factual meaning.

Allowed:

```text
Current:
Worked on frontend application.

Proposed:
Built React and Next.js frontend features for the application.
```

only when the evidence supports React/Next.js involvement.

Not allowed:

```text
"Worked with team"
→
"Led a team of 8 engineers"
```

unless explicitly supported.

---

# 15. PROJECT PROPOSALS

Use projects when they provide strong verified evidence.

Allowed:

```text
SELECT
PROMOTE
REORDER
REWRITE
DE_EMPHASIZE
EXCLUDE
```

Example:

```text
EVENTO
✓ React
✓ Next.js
✓ Recommendation logic

Target:
Next.js

Proposal:
Promote EVENTO above less relevant projects.
```

---

# 16. SECTION ORDER

May propose role-relevant section ordering.

Do not apply automatically.

Example:

```text
Current:
Summary
Skills
Experience
Projects
Education

Proposed:
Summary
Skills
Projects
Experience
Education
```

The user must approve.

---

# 17. DO_NOT_ADD MUST BE FIRST-CLASS

Examples:

```text
AWS
MISSING
→ DO_NOT_ADD

Docker
RELATED_EVIDENCE
→ DO_NOT_ADD as Docker claim

5+ years experience
INSUFFICIENT_EVIDENCE
→ DO_NOT_ADD duration claim
```

6C is an evidence-grounded tailoring engine, not a keyword-stuffing engine.

---

# 18. USER APPROVAL MODEL

Every proposal starts:

```text
PENDING
```

User actions:

```text
ACCEPT
EDIT
REJECT
```

### ACCEPT

```text
userDecision = ACCEPTED
```

### EDIT

Store:

```text
userDecision = EDITED
userEditedValue = <user value>
```

The edited value becomes authoritative for 6D.

### REJECT

```text
userDecision = REJECTED
```

Do not apply it.

---

# 19. APPROVAL SAFETY

The client must not be trusted to approve arbitrary proposals.

Server must:

1. Load persisted TailoringPlan.
2. Verify ownership.
3. Verify proposal belongs to the plan.
4. Validate decision.
5. Validate evidence references.
6. Persist the decision.

---

# 20. PLAN STATUS

Use or adapt:

```text
DRAFT
READY_FOR_REVIEW
IN_REVIEW
APPROVED
STALE
```

Recommended:

```text
Generated → READY_FOR_REVIEW
User starts review → IN_REVIEW
All required decisions completed → APPROVED
Inputs change → STALE
```

A stale plan must not silently proceed to 6D.

---

# 21. VERSIONING / STALENESS

Store at least:

```text
sourceProfileVersion
jobAnalysisVersion
jobMatchResultId
```

When:

```text
Profile version changes
OR
Job analysis version changes
OR
JobMatchResult becomes stale
```

then:

```text
TailoringPlan.isStale = true
```

Do not silently use stale evidence.

---

# 22. SUGGESTED BACKEND MODEL

Conceptually:

```text
TailoringPlan
-------------------------
id
userId
jobProfileId
jobMatchResultId

sourceProfileVersion
jobAnalysisVersion
matchResultGeneratedAt

intensity:
  LIGHT | BALANCED | AGGRESSIVE

status:
  DRAFT
  READY_FOR_REVIEW
  IN_REVIEW
  APPROVED
  STALE

proposals[]

summary:
  totalProposals
  pending
  accepted
  edited
  rejected
  doNotAdd

createdAt
updatedAt
```

Use existing schema conventions.

Avoid unnecessary normalization if embedded proposals fit the current architecture.

---

# 23. BACKEND SERVICES

Create or extend a dedicated service, for example:

```text
tailoring-plan.service.ts
```

Responsibilities:

```text
createTailoringPlan()
getTailoringPlan()
updateProposalDecision()
regenerateTailoringPlan()
checkStaleness()
```

Do not put business logic in controllers.

---

# 24. TAILORING ENGINE

Create or reuse an engine such as:

```text
tailoring-plan.engine.ts
```

Conceptual input:

```text
JobMatchResult
+
JobProfile
+
Career Profile
+
Master Resume
```

Output:

```text
TailoringPlan
```

Use deterministic rules first.

Use AI only where semantic reasoning or grounded rewriting is genuinely required.

---

# 25. AI RESPONSIBILITIES

AI may:

- rank relevant verified evidence
- suggest emphasis
- draft grounded rewrites
- propose summary wording
- propose bullet restructuring
- explain relevance of verified facts

AI may NOT:

- invent candidate facts
- invent evidence
- invent source IDs
- convert missing requirements into candidate skills
- claim unsupported years
- create fake achievements
- fabricate metrics
- infer employment history absent from Career Profile

---

# 26. AI INPUT

Provide targeted information:

```text
Target requirement(s)
Relevant match results
Relevant verified evidence
Current resume content
Allowed actions
Grounding rules
```

Do not dump the entire Career Profile into every prompt unnecessarily.

---

# 27. AI OUTPUT VALIDATION

Use existing `ModelGateway` and structured validation.

Validate:

```text
action
targetSection
targetEntityId
requirementIds
evidence
proposedValue
reason
```

After AI returns:

1. Validate schema.
2. Validate requirement IDs against JobProfile.
3. Validate evidence IDs against Career Profile.
4. Validate target entity against Master Resume where applicable.
5. Validate proposed claims are grounded.
6. Reject/downgrade invalid proposals.
7. Never persist unvalidated AI output.

---

# 28. PROPOSAL QUALITY

Every proposal should answer:

```text
WHAT should change?
WHY should it change?
WHAT job requirement does it support?
WHAT evidence proves it?
WHAT happens if accepted?
```

Example:

```text
Action:
PROMOTE

Target:
SKILLS → Next.js

Requirement:
req_nextjs

Evidence:
PROJECT:evento

Reason:
Next.js is a REQUIRED job skill and is verified in the
candidate's Career Profile but is not sufficiently prominent
in the current Master Resume.

User Decision:
PENDING
```

---

# 29. API DESIGN

Suggested:

```http
POST /api/job-profiles/:jobProfileId/tailoring-plan
GET  /api/job-profiles/:jobProfileId/tailoring-plan

PATCH /api/job-profiles/:jobProfileId/tailoring-plan/proposals/:proposalId

POST /api/job-profiles/:jobProfileId/tailoring-plan/regenerate
```

Follow existing SKILLEZO API conventions if equivalent endpoints already exist.

Never expose an endpoint that mutates ProfileModel or Master Resume.

---

# 30. API RESPONSE

GET:

```ts
{
  tailoringPlan: TailoringPlanDTO | null,
  isStale: boolean
}
```

Return only UI-required fields.

---

# 31. FRONTEND FLOW

Extend:

```text
intake
→ analysis
→ match
```

to:

```text
intake
→ analysis
→ match
→ tailoring
→ review
```

Do not break 6A/6B.

At the end of Career Match:

```text
[ Create Tailoring Plan → ]
```

Flow:

1. Verify current JobMatchResult exists.
2. Verify it is not stale.
3. Generate/load TailoringPlan.
4. Transition to 6C.

If stale:

```text
Career Match is outdated.
[ Refresh Match ]
```

Do not generate a plan from stale matching data.

---

# 32. 6C UI

Create a visually distinct workflow.

Suggested:

```text
┌───────────────────────────────────────────────────────────────┐
│ ← Career Match        Tailoring Plan          Step 3 of 5    │
│                                                               │
│ Senior Frontend Engineer                                     │
│ Acme Technologies                                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Tailoring intensity                                           │
│                                                               │
│   Light          ● Balanced          Aggressive               │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ PLAN SUMMARY                                                  │
│                                                               │
│ 8  Proven requirements                                        │
│ 2  Underrepresented                                           │
│ 2  Changes proposed                                           │
│ 2  Do not add                                                  │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ PROPOSED CHANGES                                              │
│                                                               │
│ SUMMARY                                                       │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Rewrite professional summary                              │ │
│ │                                                           │ │
│ │ Current                                                   │ │
│ │ Frontend developer...                                     │ │
│ │                                                           │ │
│ │ Suggested                                                 │ │
│ │ Frontend developer specializing in React...              │ │
│ │                                                           │ │
│ │ Evidence                                                  │ │
│ │ ✓ React — Experience                                      │ │
│ │ ✓ Next.js — EVENTO                                        │ │
│ │                                                           │ │
│ │ [ Reject ] [ Edit ] [ Accept ]                            │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ SKILLS                                                        │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Promote: React, Next.js, TypeScript                       │ │
│ │ Why: Required + verified + underrepresented              │ │
│ │ [ Reject ] [ Accept ]                                     │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ DO NOT ADD                                                    │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ AWS                                                       │ │
│ │ ✕ No verified evidence                                    │ │
│ │   SKILLEZO will not add this claim.                       │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                 [ Continue to Review → ]                       │
└───────────────────────────────────────────────────────────────┘
```

It must feel like a new intelligence workflow, not another generic modal.

---

# 33. PROPOSAL CARD UX

Every proposal should clearly show:

```text
Action
Target
Current
Proposed
Why
Evidence
Decision
```

Use clear visual states:

```text
PROMOTE
EMPHASIZE
REWRITE
REORDER
SELECT
DE-EMPHASIZE
EXCLUDE
DO NOT ADD
```

Keep user-facing language simple.

---

# 34. EVIDENCE DRAWER

Allow:

```text
Why is SKILLEZO suggesting this?
```

Show:

```text
Job requirement:
Next.js

Evidence:
Project — EVENTO

Evidence excerpt:
"Built the frontend using Next.js..."

Source:
Career Profile → Projects → EVENTO
```

This is essential for trust.

---

# 35. EDIT MODE

For text proposals:

```text
[ Edit ]
```

opens an editable field.

On save:

```text
userDecision = EDITED
userEditedValue = user text
```

Keep the original suggestion for audit/debugging if existing architecture supports it.

Do not overwrite evidence.

---

# 36. REVIEW SUMMARY

Before 6D:

```text
Tailoring Review

✓ 5 accepted
✎ 2 edited
✕ 1 rejected
⚠ 2 do not add

Your Master Resume has not been changed.

[ Back to Plan ]
[ Continue to Generate Tailored Resume → ]
```

The final button may only act as a **6D entry point/navigation placeholder**.

Do not implement 6D generation.

Only allow proceeding when the plan is valid and not stale.

---

# 37. MASTER RESUME SAFETY

During 6C:

```text
Master Resume
     ↓
READ ONLY
```

Never patch the Master Resume.

6C stores approved instructions only.

6D will later create a new `TAILORED` variant.

---

# 38. FUTURE 6D CONTRACT

6D should eventually consume:

```text
JobProfile
+
Approved TailoringPlan
+
Master Resume
+
Career Profile
```

and create:

```text
TAILORED Resume Variant
```

Do not implement this now.

---

# 39. SECURITY

Every endpoint must:

- require authentication
- verify ownership
- verify JobProfile belongs to user
- verify JobMatchResult belongs to user
- verify TailoringPlan belongs to user
- verify proposal belongs to plan
- validate evidence server-side

Never trust client-provided:

```text
userId
evidence IDs
jobProfileId ownership
proposal IDs
```

without server verification.

---

# 40. CONCURRENCY

If multiple requests generate/update a plan:

- Avoid duplicate active plans for the same user + JobProfile + relevant source versions.
- Follow existing repository/concurrency conventions.
- Handle duplicate-key errors safely.
- Do not create multiple active plans accidentally.

---

# 41. REGENERATION

If intensity changes:

```text
LIGHT → BALANCED
```

regeneration may create a new draft plan.

Do not silently destroy approved decisions.

Recommended:

```text
Existing Plan
     ↓
Regenerate
     ↓
New Draft Plan
     ↓
User reviews again
```

Do not overbuild history unless the existing architecture already supports it.

---

# 42. TESTING — BACKEND

Minimum focused tests:

### Plan generation

1. Creates plan from valid JobProfile + JobMatchResult.
2. Requires analyzed JobProfile.
3. Requires non-stale JobMatchResult.
4. Stores source versions correctly.

### Evidence grounding

5. Proven requirement produces evidence-backed proposal.
6. Underrepresented requirement can produce PROMOTE.
7. Missing requirement produces DO_NOT_ADD.
8. Related evidence never becomes a claim for the missing technology.
9. Fake evidence IDs are rejected.
10. Unsupported requirement IDs are rejected.

### Content safety

11. No unsupported years are generated.
12. No unsupported skills are generated.
13. No unsupported metrics are generated.
14. No unsupported leadership/company/achievement claims are generated.

### Decisions

15. ACCEPT works.
16. REJECT works.
17. EDITED stores `userEditedValue`.
18. Unauthorized proposal update is rejected.
19. Proposal from another user's plan is rejected.

### Immutability

20. ProfileModel remains unchanged.
21. Master Resume remains unchanged.
22. JobProfile remains unchanged.
23. JobMatchResult remains unchanged.

### Staleness

24. Profile version change makes plan stale.
25. Job analysis version change makes plan stale.
26. Stale match result prevents valid new plan generation until refreshed.

### Intensity

27. LIGHT limits proposal aggressiveness.
28. BALANCED is default.
29. AGGRESSIVE never bypasses evidence rules.

---

# 43. TESTING — FRONTEND

Create focused tests for:

1. Tailoring Plan loads.
2. Loading state.
3. Error state.
4. Stale plan warning.
5. Proposal rendering.
6. Evidence drawer.
7. Accept decision.
8. Reject decision.
9. Edit decision.
10. Intensity selector.
11. Proposal counts update.
12. DO_NOT_ADD disclaimer.
13. RELATED_EVIDENCE warning.
14. Continue button respects plan state.
15. 6A → 6B → 6C transition.
16. No accidental Master Resume mutation request.

---

# 44. MANUAL QA

Use:

```text
Senior Frontend Engineer

Required:
React
Next.js
TypeScript
REST APIs
AWS
Docker

Preferred:
Node.js
PostgreSQL

Experience:
4+ years
```

Candidate:

```text
React
Next.js
TypeScript
Node.js
REST APIs
PostgreSQL
Kubernetes

No AWS
No Docker
Incomplete historical dates
```

Expected 6B:

```text
React       PROVEN
Next.js     PROVEN
TypeScript  PROVEN
REST APIs   PROVEN
Node.js     PROVEN
PostgreSQL  PROVEN
Kubernetes  RELATED to Docker
AWS         MISSING
Docker      RELATED / not proven
4+ years    INSUFFICIENT_EVIDENCE
```

Expected 6C:

```text
PROMOTE:
React
Next.js
TypeScript
REST APIs

PROMOTE / EMPHASIZE:
Relevant project using Next.js

KEEP:
Node.js
PostgreSQL

RELATED:
Kubernetes — do not claim Docker

DO_NOT_ADD:
AWS
Docker

DO_NOT_ADD:
4+ years if evidence is insufficient
```

The user must be able to review and approve changes individually or as grouped proposals.

---

# 45. FULL REGRESSION

Backend:

```bash
npm test -- --run
npx tsc --noEmit
```

Frontend:

```bash
npm test -- --run
npx tsc --noEmit
```

Also run focused Phase 6C tests.

Do not declare completion if Phase 1–6B regress.

---

# 46. PERFORMANCE

Do not call the LLM once per tiny proposal.

Prefer:

```text
JobMatchResult
      ↓
deterministic proposal planning
      ↓
group related changes
      ↓
single/batched AI generation for ambiguous text
      ↓
structured validation
```

Use targeted evidence instead of sending the entire Career Profile unnecessarily.

---

# 47. OBSERVABILITY

Follow existing logging conventions.

Useful events:

```text
[ResumeTailoring]
[ProposalGeneration]
```

Log:

- jobProfileId
- planId
- proposal count
- action types
- model/provider metadata if AI used
- validation failures

Do NOT log:

- full resumes
- full Career Profile
- raw personal data
- sensitive candidate information

---

# 48. DO NOT OVERBUILD

Do NOT implement:

- 6D tailored resume generation
- automatic resume mutation
- Application creation
- Auto Apply
- job scraping
- browser automation
- DOCX export
- new resume renderer
- new ATS scoring engine
- new Career GPS engine
- new skill taxonomy
- recruiter functionality
- job discovery
- unnecessary background queues
- unnecessary proposal version-history infrastructure

Keep Phase 6C focused.

---

# 49. INSPECT BEFORE CODING

Before writing code, inspect:

### Phase 6A

- JobProfile model
- repository
- types
- JobAnalysisSummary
- JobTailoringWorkspace
- service
- ModelGateway integration
- structured-output patterns

### Phase 6B

- JobMatchResult model
- repository
- career-job-matcher
- job-match service
- types
- CareerMatchView
- RequirementMatchCard
- evidence validation
- staleness logic

### Resume architecture

- ProfileModel
- ResumeModel
- canonical ResumeDocument
- Master Resume builder
- ResumeRenderer
- Resume Studio
- provenance infrastructure

### Existing AI infrastructure

- ModelGateway
- structured validation
- provider metadata
- retry/error conventions

### Existing conventions

- authentication
- ownership checks
- DTO transformations
- API errors
- repository patterns
- logging
- tests

Reuse existing infrastructure.

---

# 50. SEARCH FOR EXISTING TAILORING ABSTRACTIONS

Before creating new domain code, search the repository for:

```text
tailoring
proposal
optimization
recommendation
resume optimization
action proposal
approval
```

If an existing abstraction can safely support 6C, extend/reuse it.

Do not create a parallel proposal engine.

---

# 51. USER-FACING TERMINOLOGY

Use:

```text
Tailoring Plan
Tailoring Suggestions
Recommended Changes
Career Evidence
Why this change?
Accept
Edit
Reject
Do Not Add
```

Do not expose internal implementation names such as:

```text
JobMatchResult
ProfileModel
sourceProfileVersion
canonical AST
```

in normal UI.

---

# 52. SUCCESS CRITERIA

Phase 6C is complete only when:

### Architecture

- [ ] 6A and 6B remain frozen.
- [ ] ProfileModel is read-only.
- [ ] Master Resume is read-only.
- [ ] JobProfile is read-only.
- [ ] JobMatchResult is read-only.
- [ ] Only TailoringPlan/proposal decisions are persisted.

### Intelligence

- [ ] Proposals are evidence-grounded.
- [ ] Missing skills cannot become claims.
- [ ] Related evidence cannot become proof.
- [ ] Unsupported metrics/years/achievements cannot be invented.
- [ ] Underrepresented evidence is correctly identified.
- [ ] Existing ScoreEngine remains the only scoring source.

### UX

- [ ] User can move from 6B Career Match to 6C Tailoring Plan.
- [ ] User can select Light/Balanced/Aggressive.
- [ ] User can understand every proposal.
- [ ] User can inspect evidence.
- [ ] User can Accept/Edit/Reject.
- [ ] DO_NOT_ADD items are clearly explained.
- [ ] Stale plans are clearly blocked.
- [ ] Master Resume remains unchanged.

### Engineering

- [ ] Backend focused tests pass.
- [ ] Frontend focused tests pass.
- [ ] Full backend regression passes.
- [ ] Full frontend regression passes.
- [ ] Backend TypeScript passes.
- [ ] Frontend TypeScript passes.
- [ ] No duplicate tailoring/proposal engine created.
- [ ] No Phase 6D functionality implemented.

---

# 53. FINAL ANTIGRAVITY INSTRUCTION

Implement **Phase 6C only**.

The contract is:

```text
JobProfile
    +
JobMatchResult
    +
Career Profile evidence
    +
Master Resume representation
    ↓
TAILORING PLAN
    ↓
EVIDENCE-GROUNDED PROPOSALS
    ↓
USER REVIEW
    ├── ACCEPT
    ├── EDIT
    └── REJECT
    ↓
APPROVED TAILORING PLAN
    ↓
[6D ENTRY POINT ONLY]
```

The most important principle:

> **6C decides what should change; 6D will later generate the changed resume.**

Never modify the Master Resume.

Never modify Career Profile.

Never create a Tailored Resume.

Never invent candidate facts.

Never add missing JD skills.

Never create a new scoring engine.

Never bypass user approval.

Reuse existing SKILLEZO architecture wherever possible.

Before declaring completion, provide:

1. Files created.
2. Files modified.
3. Existing abstractions reused.
4. TailoringPlan schema/domain.
5. Proposal generation logic.
6. Evidence validation logic.
7. Staleness/versioning behavior.
8. API endpoints.
9. UI flow/screens implemented.
10. AI usage and validation.
11. Focused backend test results.
12. Focused frontend test results.
13. Full backend regression result.
14. Full frontend regression result.
15. Backend typecheck result.
16. Frontend typecheck result.
17. Confirmation that ProfileModel, Master Resume, JobProfile, and JobMatchResult were not mutated.
18. Confirmation that no Phase 6D functionality was implemented.

Do not claim PASS unless all verification is actually run and successful.
