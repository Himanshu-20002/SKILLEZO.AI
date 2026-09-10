# SKILLEZO AI — Phase 7 Implementation Plan
## Resume Optimization + Deterministic Re-score

**Phase:** 7 of 8  
**Depends on:** Phases 1–6  
**Goal:** Safely transform prioritized Phase 6 recommendations into AI-proposed resume improvements, validate every modification against candidate evidence, re-run deterministic intelligence, and present a trustworthy before/after comparison.

---

# 1. Phase Objective

Phase 7 answers:

> **“How can I improve this resume without changing the truth?”**

Phase 6 determines:

> What should be improved first?

Phase 7 determines:

> How can that improvement be expressed better?

The optimization pipeline must be:

```text
Original Resume
      ↓
Phase 6 Recommendation
      ↓
Optimization Target
      ↓
AI Proposed Change
      ↓
Deterministic Safety Validation
      ↓
Evidence Validation
      ↓
Candidate Review
      ↓
Temporary Optimized Resume
      ↓
Re-parse
      ↓
ATS Re-score
      ↓
Match Re-score
      ↓
Content Re-score
      ↓
Before / After Comparison
      ↓
Accept or Reject
```

---

# 2. Core Architecture Rule

This phase introduces AI-generated resume modifications.

Therefore the most important rule is:

> **AI may propose wording changes, but deterministic systems decide whether the resulting resume is factually safe and how the optimized resume actually scores.**

AI must NEVER be the source of truth for:

- candidate facts
- skills
- years of experience
- metrics
- achievements
- education
- certifications
- employment dates
- ATS Score
- Match Score
- Content Score
- recommendation priority

AI is a **proposal generator**, not an authoritative optimizer.

---

# 3. Original Resume Must Remain Untouched

Never directly overwrite the user's original resume.

Maintain:

```text
Original Resume
Optimized Draft
Accepted Version
```

At minimum Phase 7 must support:

```text
original
draft
```

The original must remain recoverable.

Preferred architecture:

```text
ResumeVersion
├── original
├── optimizationDraft
└── acceptedVersion
```

Do not destroy historical resume content.

---

# 4. Phase 7 Scope

## Included

Implement:

1. Recommendation → optimization target mapping
2. Safe optimization request model
3. AI optimization proposal
4. Structured AI output
5. Evidence-aware optimization context
6. Factual guardrails
7. Meaning-preservation validation
8. Metric preservation validation
9. Skill preservation validation
10. Candidate-fact preservation
11. Section/bullet-level modification
12. Draft generation
13. Deterministic re-parse
14. ATS re-score
15. Match re-score
16. Content re-score
17. Before/after comparison
18. Improvement/regression detection
19. Accept/reject workflow
20. Optimization history
21. Safe rollback
22. Versioning/cache invalidation
23. AI failure fallback
24. Comprehensive tests
25. Frontend optimization UI

---

# 5. Explicitly NOT Included

Do NOT implement:

- Resume Copilot chat
- conversational resume editing
- interview preparation
- cover letter generation
- job application automation
- automatic job applications
- automatic skill invention
- automatic metric invention
- automatic experience invention
- unrestricted whole-resume rewriting
- uncontrolled AI rewriting
- Phase 8 Copilot

Phase 7 is controlled optimization.

---

# 6. Optimization Philosophy

The system should optimize the resume based on:

```text
Existing Candidate Evidence
+
Phase 6 Priority
+
Target Role
+
Optional JD
```

The optimizer should prefer:

```text
clarify existing evidence
>
strengthen existing evidence
>
improve measurable framing where a real metric exists
>
improve role relevance
>
improve keyword placement
>
suggest missing evidence
```

It must NOT fabricate missing evidence.

---

# 7. Optimization Types

Create canonical optimization types.

Suggested:

```ts
enum OptimizationType {
  REWRITE_BULLET = "REWRITE_BULLET",
  STRENGTHEN_EVIDENCE = "STRENGTHEN_EVIDENCE",
  IMPROVE_IMPACT = "IMPROVE_IMPACT",
  IMPROVE_SPECIFICITY = "IMPROVE_SPECIFICITY",
  IMPROVE_TECHNICAL_DEPTH = "IMPROVE_TECHNICAL_DEPTH",
  IMPROVE_KEYWORD_ALIGNMENT = "IMPROVE_KEYWORD_ALIGNMENT",
  IMPROVE_STRUCTURE = "IMPROVE_STRUCTURE",
  REDUCE_REDUNDANCY = "REDUCE_REDUNDANCY",
  IMPROVE_SUMMARY = "IMPROVE_SUMMARY",
}
```

Do not allow Phase 7 to invent new skill facts.

---

# 8. Optimization Target

Create:

```ts
interface OptimizationTarget {
  recommendationId: string;

  type: OptimizationType;

  section: ResumeSection;

  bulletId?: string;

  sourceText: string;

  sourceEvidenceIds: string[];

  skillIds?: string[];

  requirementIds?: string[];

  constraints: OptimizationConstraint[];

  engineVersion: string;
}
```

The optimizer must know exactly what it is allowed to modify.

---

# 9. Allowed Modification Boundary

For a bullet rewrite:

```text
Input:
original bullet

Allowed:
wording
ordering
clarity
grammar
specificity
technical phrasing
impact framing using existing evidence
keyword placement using existing detected skills
```

Not allowed:

```text
new metric
new technology
new achievement
new responsibility
new employer
new job title
new education
new certification
new experience duration
```

---

# 10. Optimization Constraints

Create:

```ts
enum OptimizationConstraint {
  NO_NEW_FACTS = "NO_NEW_FACTS",
  NO_NEW_METRICS = "NO_NEW_METRICS",
  NO_NEW_SKILLS = "NO_NEW_SKILLS",
  PRESERVE_MEANING = "PRESERVE_MEANING",
  PRESERVE_NUMERIC_VALUES = "PRESERVE_NUMERIC_VALUES",
  PRESERVE_EMPLOYMENT_FACTS = "PRESERVE_EMPLOYMENT_FACTS",
  PRESERVE_EDUCATION_FACTS = "PRESERVE_EDUCATION_FACTS",
  PRESERVE_CERTIFICATION_FACTS = "PRESERVE_CERTIFICATION_FACTS",
}
```

Default every AI optimization request to:

```text
NO_NEW_FACTS
NO_NEW_METRICS
NO_NEW_SKILLS
PRESERVE_MEANING
```

---

# 11. Optimization Request Model

Create:

```ts
interface OptimizationRequest {
  resumeId: string;

  recommendationId: string;

  target: OptimizationTarget;

  roleProfile?: RoleProfile;

  jobRequirements?: JobRequirementProfile;

  matchResult?: ResumeJobMatchResult;

  contentResult: ResumeContentAnalysisResult;

  skillProfile: ResumeSkillProfile;

  candidateEvidence: ResumeEvidence[];

  originalResumeHash: string;
}
```

Do not accept arbitrary client-provided candidate facts as authoritative.

The backend should retrieve authoritative data.

---

# 12. AI Optimization Output

AI must return structured JSON.

Suggested:

```ts
interface AIOptimizationProposal {
  proposalId: string;

  recommendationId: string;

  originalText: string;

  optimizedText: string;

  changes: OptimizationChange[];

  preservedEvidenceIds: string[];

  addedClaims: string[];

  removedClaims: string[];

  confidence: number;
}
```

Where:

```ts
interface OptimizationChange {
  type:
    | "CLARITY"
    | "SPECIFICITY"
    | "TECHNICAL_DEPTH"
    | "IMPACT"
    | "KEYWORD_ALIGNMENT"
    | "GRAMMAR"
    | "REDUNDANCY";

  description: string;
}
```

The AI must not be trusted simply because it returns valid JSON.

JSON validity ≠ factual validity.

---

# 13. Zod Validation

Create a strict Zod schema.

Validate:

- proposalId
- recommendationId
- originalText
- optimizedText
- changes
- preservedEvidenceIds
- addedClaims
- removedClaims
- confidence

Limits:

```text
optimizedText:
reasonable bullet length

changes:
limited count

confidence:
0 → 1
```

Reject malformed responses.

---

# 14. AI Prompt Contract

The AI optimization prompt must explicitly say:

```text
You are rewriting existing resume content.

Use ONLY facts supplied in the candidate evidence.

Do not invent:
- metrics
- percentages
- revenue
- users
- team sizes
- technologies
- certifications
- employers
- responsibilities
- achievements
- years of experience

Do not upgrade weak evidence into a stronger factual claim.

Do not change numeric values.

Do not add skills that are not supported by candidate evidence.

Preserve the meaning of the original statement.

You are proposing wording only.
The deterministic validation system decides whether the proposal is safe.
```

---

# 15. Evidence-Aware AI Context

For every optimization request provide:

```text
Original text
Relevant candidate evidence
Skill evidence
Requirement context
Role context
Content signals
Recommendation
```

Do NOT provide unrelated candidate data unnecessarily.

Example:

```text
Recommendation:
Strengthen React evidence

Original:
"Worked on React applications."

Evidence:
React detected
Project: dashboard application
Technical responsibility: component development

Allowed:
"Developed reusable React components for dashboard applications."

Not allowed:
"Architected enterprise-scale React platform used by 100,000 users."
```

---

# 16. Factual Validation Layer

Create:

```text
optimization.validator.ts
```

This is the most important Phase 7 safety component.

Validation must compare:

```text
Original
vs
Optimized
vs
Authoritative Evidence
```

Never rely only on the AI's `addedClaims` field.

The validator must independently inspect the proposed text.

---

# 17. New-Claim Detection

Detect whether optimized text introduces:

- new numbers
- new percentages
- new currencies
- new technologies
- new tools
- new certifications
- new employers
- new job titles
- new people
- new locations
- new achievements
- new scale claims

If a new factual claim is detected and it is not supported:

```text
REJECT
```

---

# 18. Metric Preservation

Example original:

```text
Reduced API latency by 35%.
```

Allowed:

```text
Reduced API latency by 35% through API optimization.
```

Not allowed:

```text
Reduced API latency by 50%.
```

Not allowed:

```text
Reduced API latency by 35%, saving $100K annually.
```

unless `$100K` exists in candidate evidence.

Numeric values must remain authoritative.

---

# 19. Skill Preservation

Original:

```text
Built APIs using Node.js.
```

Allowed:

```text
Developed backend APIs using Node.js.
```

Not allowed:

```text
Designed scalable Node.js and Kubernetes microservices.
```

unless Kubernetes is supported by candidate evidence.

The validator must compare canonical Phase 2 skill IDs.

---

# 20. Meaning Preservation

Optimization should not silently change meaning.

Example:

Original:

```text
"Worked with the backend team to develop APIs."
```

Unsafe:

```text
"Led backend API architecture."
```

because:

```text
worked with
```

does not prove:

```text
led
```

Ownership cannot be upgraded without evidence.

---

# 21. Ownership Preservation

Detect changes such as:

```text
assisted → led
supported → owned
contributed → architected
participated → managed
worked on → designed
```

These may change factual meaning.

Require evidence before accepting stronger ownership language.

---

# 22. Responsibility Preservation

Do not turn:

```text
"Assisted with testing."
```

into:

```text
"Owned automated testing strategy."
```

without supporting evidence.

The optimizer should improve wording, not manufacture seniority.

---

# 23. Employment Fact Preservation

Optimization must never alter:

```text
company
job title
employment dates
employment duration
location
```

These should be outside AI-generated text whenever possible.

If editable text includes such data, validator must protect it.

---

# 24. Education Preservation

Do not modify:

```text
degree
institution
graduation year
field of study
```

unless the change is purely formatting and deterministic.

---

# 25. Certification Preservation

Do not add:

```text
AWS Certified
Azure Certified
CKA
PMP
etc.
```

unless supported by candidate evidence.

---

# 26. Recommendation → Optimization Mapping

Phase 6 recommendations must be the primary entry point.

Example:

```text
Recommendation:
Strengthen measurable impact

↓
Optimization Type:
IMPROVE_IMPACT

↓
Target:
Experience bullet #7
```

Another:

```text
Recommendation:
Strengthen React evidence

↓
Optimization Type:
STRENGTHEN_EVIDENCE

↓
Target:
React-related bullet
```

If no safe target exists:

```text
No optimization generated.
```

Do not force AI to rewrite something that cannot be safely improved.

---

# 27. Missing Skill Recommendations

If Phase 6 says:

```text
Docker is NOT_DETECTED.
```

Phase 7 must NOT automatically add Docker.

Instead:

```text
Optimization unavailable
Reason:
No candidate evidence supporting Docker.
```

Optional UI:

```text
This recommendation requires new evidence and cannot be safely
resolved through automatic rewriting.
```

This is critical.

---

# 28. Missing Metric Recommendations

If Phase 6 says:

```text
Add measurable impact if available.
```

Phase 7 must not create a metric.

It can optimize:

```text
"Improved performance."
```

into:

```text
"Improved application performance through query optimization."
```

But only if query optimization is already supported.

If no measurable evidence exists:

```text
Do not invent one.
```

---

# 29. Optimization Scope

Default optimization should be:

```text
ONE recommendation
→ ONE target
→ ONE controlled change
```

Do not initially send the entire resume to an unrestricted rewrite prompt.

This makes validation and rollback much safer.

---

# 30. Optional Batch Optimization

If later supporting multiple recommendations:

```text
Recommendation 1
Recommendation 2
Recommendation 3
```

process them independently or through a tightly structured batch contract.

Every modification must remain independently traceable.

Do not merge unrelated changes into one opaque AI output.

---

# 31. Draft Model

Create:

```ts
interface ResumeOptimizationDraft {
  draftId: string;

  resumeId: string;

  baseResumeVersionId: string;

  recommendationId: string;

  target: OptimizationTarget;

  originalText: string;

  proposedText: string;

  validation: OptimizationValidationResult;

  beforeScores: ResumeScoreSnapshot;

  afterScores?: ResumeScoreSnapshot;

  status:
    | "PROPOSED"
    | "VALIDATED"
    | "REJECTED"
    | "ACCEPTED"
    | "DISCARDED";

  createdAt: string;
}
```

---

# 32. Validation Result

Create:

```ts
interface OptimizationValidationResult {
  valid: boolean;

  safetyScore: number;

  errors: OptimizationValidationError[];

  warnings: OptimizationValidationWarning[];

  preservedEvidenceIds: string[];

  unsupportedClaims: string[];

  changedMetrics: string[];

  addedSkills: string[];

  changedOwnershipClaims: string[];

  meaningPreserved: boolean;
}
```

A proposal with unsupported claims must not be accepted.

---

# 33. Validation Severity

Suggested:

```ts
enum ValidationSeverity {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
}
```

Examples:

```text
New unsupported metric
→ ERROR

New unsupported skill
→ ERROR

Ownership strengthening without evidence
→ ERROR

Longer sentence
→ WARNING

Grammar improvement
→ INFO
```

---

# 34. Deterministic Re-parse

After a proposal passes factual validation:

```text
optimized draft
↓
existing Resume Parser
```

Do not build a second parser.

The re-parser must produce:

```text
candidate info
skills
experience
projects
education
certifications
evidence
```

---

# 35. Deterministic Re-score

Run the existing engines again.

```text
Optimized Resume
      ↓
ATS Engine
      ↓
Skill Engine
      ↓
Role/JD
      ↓
Match Engine
      ↓
Content Engine
```

Obtain:

```text
afterATS
afterMatch
afterContent
```

Never allow AI to calculate these.

---

# 36. Before / After Score Snapshot

Create:

```ts
interface ResumeScoreSnapshot {
  atsScore: number;

  matchScore?: number;

  contentScore?: number;

  timestamp: string;

  engineVersions: EngineVersions;
}
```

Comparison:

```ts
interface OptimizationScoreComparison {
  before: ResumeScoreSnapshot;
  after: ResumeScoreSnapshot;

  delta: {
    ats: number;
    match?: number;
    content?: number;
  };

  improved: boolean;
  regressed: boolean;
}
```

---

# 37. Optimization Must Not Assume Improvement

An AI rewrite is NOT automatically better.

Possible result:

```text
Before:
ATS 82
Match 78
Content 71

After:
ATS 84
Match 81
Content 76
```

Good.

But also possible:

```text
Before:
ATS 82
Match 78
Content 71

After:
ATS 83
Match 70
Content 74
```

This is a regression in Match Score.

The system must detect it.

---

# 38. Regression Policy

Suggested default:

```text
If any critical score materially regresses:
    flag optimization
```

Example threshold:

```text
ATS regression > 3 points
Match regression > 3 points
Content regression > 3 points
```

Do not automatically accept.

Keep thresholds centralized.

---

# 39. Optimization Decision

Create:

```ts
enum OptimizationDecision {
  ACCEPTABLE = "ACCEPTABLE",
  IMPROVED = "IMPROVED",
  REGRESSED = "REGRESSED",
  REJECTED = "REJECTED",
}
```

Suggested logic:

```text
Safety invalid
→ REJECTED

Safety valid + meaningful improvement
→ IMPROVED

Safety valid + neutral
→ ACCEPTABLE

Safety valid + material regression
→ REGRESSED
```

---

# 40. Multi-Score Tradeoffs

Do not require every score to increase.

Example:

```text
ATS +2
Match +4
Content -1
```

This may still be valuable.

Therefore compare:

```text
recommendation objective
+
score deltas
+
regression thresholds
```

The optimizer should not game one score at the expense of the others.

---

# 41. Recommendation Objective Alignment

An optimization should primarily improve the problem identified by Phase 6.

Example:

Recommendation:

```text
Improve measurable impact
```

Expected:

```text
Content impact signal improves
```

If the rewrite changes unrelated wording but does not improve the target signal:

```text
do not mark as successful optimization
```

---

# 42. Re-run Phase 6 After Optimization

After re-scoring, run recommendation intelligence again.

This is important.

Pipeline:

```text
Original
↓
Phase 6 recommendations
↓
Optimization
↓
Re-parse
↓
ATS / Match / Content
↓
Phase 6 again
```

The system can determine:

```text
recommendation resolved
```

or:

```text
recommendation still open
```

Do not assume a recommendation is solved merely because the text changed.

---

# 43. Recommendation Resolution

Example:

Before:

```text
Strengthen React evidence
```

After:

```text
React evidence now strong
```

The recommendation can become:

```text
ADDRESSED
```

But this must be determined from deterministic re-analysis.

---

# 44. Accepted Version

Only after user acceptance:

```text
Draft
↓
User accepts
↓
Create new ResumeVersion
```

Never overwrite the original.

Suggested:

```text
ResumeVersion 1
Original

ResumeVersion 2
Optimized / Accepted
```

---

# 45. Reject Workflow

User rejects proposal:

```text
Draft
↓
REJECT
↓
Original remains unchanged
```

No score changes to the original.

---

# 46. Rollback

If accepted version later needs rollback:

```text
Version 2
↓
Rollback
↓
Version 1
```

Prefer creating a new version pointing to an earlier version rather than deleting history.

---

# 47. Optimization History

Store:

```ts
interface OptimizationHistoryEntry {
  optimizationId: string;

  resumeId: string;

  recommendationId: string;

  originalVersionId: string;

  resultingVersionId?: string;

  decision: OptimizationDecision;

  scoreComparison: OptimizationScoreComparison;

  createdAt: string;
}
```

This enables:

```text
What changed?
Why did it change?
Which recommendation caused it?
Did the scores improve?
```

---

# 48. AI Prompt Privacy

Only send the minimum required candidate data.

For a bullet optimization:

Do NOT send the entire resume if the target can be safely optimized using:

```text
target bullet
relevant evidence
relevant skill evidence
role/JD requirement
recommendation
```

This reduces:

- privacy exposure
- token usage
- hallucination surface
- prompt complexity

---

# 49. API Design

Preferred endpoints:

```text
POST /api/resume/optimizations/propose
POST /api/resume/optimizations/:id/validate
POST /api/resume/optimizations/:id/re-score
POST /api/resume/optimizations/:id/accept
POST /api/resume/optimizations/:id/reject
GET  /api/resume/optimizations
```

However, reuse the existing resume intelligence API structure where possible.

Do not create redundant endpoints unnecessarily.

---

# 50. Proposal Endpoint

Input should primarily contain:

```text
resumeId
recommendationId
```

The backend resolves:

```text
recommendation
target
candidate evidence
role
JD
skills
content result
```

Do not trust the frontend to supply authoritative candidate evidence.

---

# 51. Accept Endpoint

Accept only a validated proposal.

Server must verify:

```text
proposal belongs to user
resume belongs to user
recommendation belongs to resume
draft belongs to resume
validation passed
base version still exists
```

Prevent stale or cross-user acceptance.

---

# 52. Optimistic Concurrency

If the resume changed after the proposal was generated:

```text
Original Resume Version A
↓
AI Proposal created

User edits resume manually
↓
Resume Version B

User tries to accept proposal based on A
```

Do NOT silently overwrite Version B.

Return:

```text
STALE_OPTIMIZATION
```

Require re-generation.

---

# 53. Cache Safety

Optimization proposals may be cached only when all inputs match:

```text
resumeVersionHash
recommendationId
roleId
JD hash
optimization engine version
AI model/provider version
```

Do not reuse a proposal against a modified resume.

---

# 54. Engine Versioning

Create:

```ts
OPTIMIZATION_ENGINE_VERSION = "1.0.0";
```

Include it in relevant hashes.

When optimization validation logic changes:

```text
cache invalidation
```

must occur.

---

# 55. AI Provider Failure

If AI fails:

```text
Do not fabricate a fallback rewrite.
```

For Phase 7, safe fallback can be:

```text
No automatic optimization available.
Please edit this recommendation manually.
```

Do NOT use a generic AI-like rewrite unless deterministic and safe.

---

# 56. Frontend UX

Update the existing recommendation UI.

Example:

```text
HIGH
Strengthen measurable impact

Why:
This bullet describes an improvement but does not clearly
communicate the outcome.

[Optimize this bullet]
```

After generation:

```text
Original
Improved version

Before:
Improved application performance.

After:
Improved application performance through query optimization.

Safety:
✓ No new metrics
✓ No unsupported skills
✓ Meaning preserved

Score impact:
ATS +1
Match +0
Content +6

[Accept]
[Reject]
```

---

# 57. Important UI Rule

Never show:

```text
AI says this is 94% better
```

unless the value is based on deterministic analysis.

Show:

```text
ATS: 82 → 83
Match: 74 → 74
Content: 68 → 74
```

These come from actual engines.

---

# 58. Optimization Preview

The user should see:

```text
Before
After
```

side-by-side or clearly separated.

Highlight changed words if practical.

Do not hide the original.

---

# 59. User Control

No automatic acceptance.

The user must explicitly choose:

```text
Accept
```

or:

```text
Reject
```

AI must never silently modify the stored resume.

---

# 60. Unsupported Optimization

Some recommendations cannot be safely optimized.

Example:

```text
Docker not detected.
```

UI:

```text
This recommendation requires new evidence.

Automatic rewriting cannot safely add Docker without
supporting experience.
```

This is correct behavior.

---

# 61. Optimization Safety Levels

Optional:

```ts
enum OptimizationSafetyLevel {
  SAFE = "SAFE",
  REVIEW = "REVIEW",
  BLOCKED = "BLOCKED",
}
```

Suggested:

### SAFE

Pure wording improvement with no new claims.

### REVIEW

Potential meaning/ownership change requiring user attention.

### BLOCKED

Unsupported metric/skill/fact detected.

---

# 62. Deterministic Text Comparison

Implement lightweight deterministic comparison for:

- numeric values
- skill mentions
- metric mentions
- named entities where supported
- ownership verbs
- candidate evidence terms

Do not rely entirely on an LLM judge.

AI may assist explanation, but deterministic validation is authoritative.

---

# 63. Metric Extraction Reuse

Reuse Phase 5:

```text
content.impact.ts
```

for metric extraction.

Do NOT create another metric parser unless absolutely necessary.

The same canonical metric representation should be used for:

```text
original
optimized
```

comparison.

---

# 64. Skill Detection Reuse

Reuse Phase 2:

```text
skill.detector.ts
skill.normalizer.ts
skill.catalog.ts
```

to compare:

```text
original skills
optimized skills
```

If optimized text introduces a new canonical skill:

```text
verify supporting evidence
```

Otherwise:

```text
BLOCK / REJECT
```

---

# 65. Content Analysis Reuse

Reuse Phase 5:

```text
content.bullet.ts
content.impact.ts
content.score.ts
content.service.ts
```

Do not create a second content scoring implementation.

---

# 66. ATS Re-score Reuse

Reuse:

```text
resume.ats.ts
```

The optimizer must not contain its own ATS scoring.

---

# 67. Match Re-score Reuse

Reuse:

```text
matching-intelligence
```

The optimizer must not contain its own Match Score.

---

# 68. Phase 7 Service Architecture

Suggested:

```text
server/src/modules/optimization-intelligence/
├── optimization.types.ts
├── optimization.constants.ts
├── optimization.target.ts
├── optimization.prompt.ts
├── optimization.schemas.ts
├── optimization.validator.ts
├── optimization.diff.ts
├── optimization.rescore.ts
├── optimization.service.ts
└── index.ts
```

Keep responsibilities separated.

---

# 69. Responsibility Breakdown

### optimization.target.ts

Maps Phase 6 recommendation → safe optimization target.

### optimization.prompt.ts

Builds constrained AI prompt.

### optimization.schemas.ts

Validates AI response shape.

### optimization.validator.ts

Validates factual safety.

### optimization.diff.ts

Compares original vs optimized.

### optimization.rescore.ts

Runs existing deterministic engines.

### optimization.service.ts

Orchestrates complete workflow.

---

# 70. No Duplicate Intelligence

Phase 7 must NOT recreate:

```text
ATS scoring
Skill detection
JD parsing
Role normalization
Match scoring
Content scoring
Recommendation scoring
Experience calculation
Metric extraction
```

Reuse previous engines.

---

# 71. Recommendation Ownership

Phase 6 remains responsible for:

```text
What should be fixed?
```

Phase 7 is responsible for:

```text
How can it be safely rewritten?
```

Do not move recommendation ranking logic into Phase 7.

---

# 72. Optimization Ownership

AI proposes:

```text
optimizedText
```

Deterministic validator decides:

```text
safe / unsafe
```

Deterministic engines decide:

```text
score impact
```

User decides:

```text
accept / reject
```

This is the correct authority chain.

---

# 73. Score Ownership

Never allow:

```text
AI optimization
↓
"ATS should increase by 8"
```

The actual ATS engine must determine the result.

Same for:

```text
Match Score
Content Score
```

---

# 74. Example Complete Flow

Original:

```text
"Worked on React applications."
```

Phase 6:

```text
Recommendation:
Strengthen React evidence

Priority:
HIGH

Actionability:
STRENGTHEN_EVIDENCE
```

Phase 7 target:

```text
bullet #4
```

AI proposes:

```text
"Developed reusable React components for dashboard applications."
```

Validator:

```text
No unsupported metric
No unsupported skill
No ownership inflation
Meaning preserved
```

PASS.

Re-parse.

Scores:

```text
ATS:
82 → 83

Match:
74 → 75

Content:
68 → 76
```

Phase 6 re-run:

```text
React evidence recommendation
→ ADDRESSED
```

User:

```text
ACCEPT
```

New version created.

Original remains available.

---

# 75. Example Unsafe Flow

Original:

```text
"Improved application performance."
```

AI proposes:

```text
"Improved application performance by 35%, reducing latency by 120ms."
```

Validator detects:

```text
35%
120ms
```

not present in evidence.

Result:

```text
BLOCKED
```

No re-score.

No acceptance.

---

# 76. Example Unsafe Skill Flow

Original:

```text
"Built backend APIs using Node.js."
```

AI proposes:

```text
"Built scalable Node.js APIs deployed using Kubernetes."
```

If Kubernetes is not supported:

```text
BLOCKED
```

Do not allow the optimization merely because Kubernetes is a useful keyword.

---

# 77. Example Ownership Flow

Original:

```text
"Worked with the backend team to develop APIs."
```

AI proposes:

```text
"Led backend API architecture."
```

Validator:

```text
ownership escalation detected
```

If no supporting evidence:

```text
BLOCKED
```

---

# 78. Example Safe Optimization

Original:

```text
"Responsible for backend APIs."
```

Evidence:

```text
Node.js
Express.js
API development
```

Possible:

```text
"Developed backend APIs using Node.js and Express.js."
```

If all claims are supported:

```text
SAFE
```

---

# 79. Optimization Success Criteria

A proposal is considered successful only when:

```text
1. AI response is schema-valid
2. No unsupported facts
3. No unsupported metrics
4. No unsupported skills
5. Meaning preserved
6. Ownership preserved
7. Candidate evidence preserved
8. Deterministic re-parse succeeds
9. Re-score succeeds
10. No material regression
11. Target recommendation improves or is addressed
```

---

# 80. Testing Strategy

Create unit tests for:

### Target mapping

```text
recommendation → optimization target
```

### AI schema

```text
valid
invalid
malformed
```

### Metric safety

```text
new metric → reject
existing metric preserved → pass
```

### Skill safety

```text
new unsupported skill → reject
existing skill → pass
```

### Meaning safety

```text
worked with → led
```

must be rejected without evidence.

### Ownership safety

```text
assisted → owned
```

must be rejected without evidence.

---

# 81. Re-score Tests

Test:

```text
Before:
ATS 82
Match 74
Content 68

After:
ATS 84
Match 76
Content 75
```

Expected:

```text
IMPROVED
```

Test:

```text
After:
ATS 84
Match 68
Content 75
```

Expected:

```text
REGRESSED
```

if Match regression exceeds configured threshold.

---

# 82. Recommendation Resolution Tests

Before:

```text
React evidence weak
```

After:

```text
React evidence strong
```

Expected:

```text
recommendation addressed
```

If still weak:

```text
recommendation remains OPEN
```

---

# 83. Original Resume Integrity Test

Create:

```text
Original Version
```

Generate and accept optimization.

Verify:

```text
Original Version content unchanged.
New Version contains optimization.
```

---

# 84. Reject Integrity Test

Generate proposal.

Reject.

Verify:

```text
Original unchanged.
No accepted version created.
```

---

# 85. Stale Version Test

Generate optimization against:

```text
Resume Version A
```

Modify resume to:

```text
Resume Version B
```

Attempt acceptance.

Expected:

```text
STALE_OPTIMIZATION
```

No overwrite.

---

# 86. Rollback Test

Create:

```text
Version A
Version B
```

Rollback B.

Verify:

```text
Version A remains intact.
History remains intact.
```

---

# 87. AI Failure Tests

Simulate:

```text
Gemini unavailable
OpenAI unavailable
timeout
invalid JSON
hallucinated metric
hallucinated skill
```

Expected:

```text
No unsafe rewrite accepted.
Original remains unchanged.
```

---

# 88. Regression Tests

After Phase 7 implementation:

```text
ALL Phase 1–6 tests must still pass.
```

At minimum preserve:

```text
ATS tests
Skill tests
Role tests
JD tests
Match tests
Content tests
Recommendation tests
AI tests
```

---

# 89. Performance

Do not re-run every engine unnecessarily.

Preferred:

```text
AI proposal
↓
validation
↓
re-parse once
↓
reuse parsed result where possible
↓
run required deterministic analyses
```

Do not call AI multiple times for one bullet unless required.

---

# 90. AI Cost Control

Default:

```text
1 recommendation
→ 1 optimization proposal
```

If batching later:

```text
strict structured batch
```

Do not generate:

```text
20 AI calls
```

for 20 recommendations automatically.

---

# 91. Security

Every optimization operation must verify:

```text
authenticated user
resume ownership
recommendation ownership
draft ownership
version ownership
```

Never trust:

```text
resumeId
recommendationId
draftId
```

from the client without server-side authorization.

---

# 92. Logging

Do not log:

```text
full resume
full AI prompt
full candidate evidence
private candidate information
```

Log only:

```text
resumeId
optimizationId
recommendationId
engineVersion
validation result
decision
score deltas
```

where safe and consistent with existing privacy practices.

---

# 93. Caching

Never share optimization proposals across users.

Cache key should include:

```text
user/resume ownership boundary
resumeVersionHash
recommendationId
roleId
JD hash
OPTIMIZATION_ENGINE_VERSION
AI provider/model version
```

---

# 94. UI Safety

The UI must clearly distinguish:

```text
AI proposal
```

from:

```text
Accepted resume content
```

Before acceptance:

```text
DRAFT
```

After acceptance:

```text
ACCEPTED
```

Never make an AI proposal look like the user's stored resume until accepted.

---

# 95. Phase 7 API Response

Suggested:

```json
{
  "optimization": {
    "id": "opt_123",
    "recommendationId": "rec_456",
    "status": "VALIDATED",
    "originalText": "...",
    "proposedText": "..."
  },
  "validation": {
    "valid": true,
    "safetyLevel": "SAFE",
    "warnings": []
  },
  "scores": {
    "before": {
      "ats": 82,
      "match": 74,
      "content": 68
    },
    "after": {
      "ats": 84,
      "match": 76,
      "content": 75
    }
  },
  "decision": "IMPROVED"
}
```

All score values must come from deterministic engines.

---

# 96. Important: No Score Gaming

Do not optimize merely to increase ATS keywords.

Example:

```text
Before:
"Built React applications."
```

Bad:

```text
"Built React React React applications using React."
```

Even if keyword count increases.

Content quality and match relevance must remain meaningful.

The goal is:

```text
better evidence
+
better clarity
+
better role relevance
```

not keyword stuffing.

---

# 97. Important: Preserve Human Voice

Optimization should not turn every bullet into identical AI language.

Avoid:

```text
Spearheaded...
Leveraged...
Orchestrated...
Drove...
```

on every bullet.

Preserve concise, natural professional language.

---

# 98. Important: Do Not Over-Optimize

A strong bullet should not be changed simply because AI can make it different.

If:

```text
Content strong
Evidence strong
Match strong
```

then:

```text
No optimization needed.
```

Phase 7 should improve weaknesses, not rewrite everything.

---

# 99. Phase 7 Engine Version

Create:

```ts
OPTIMIZATION_ENGINE_VERSION = "1.0.0";
```

Update it whenever:

- validation logic changes
- optimization target logic changes
- optimization decision logic changes
- optimization safety rules materially change

---

# 100. FINAL PHASE 7 AUDIT — REQUIRED BEFORE PHASE 8

Do NOT start Phase 8 until every audit passes.

## Audit 1 — Original Integrity

Original resume remains unchanged after:

- proposal
- validation
- rejection
- acceptance

Acceptance creates a new version.

---

## Audit 2 — Metric Fabrication

Try:

```text
Original:
Improved performance.

AI:
Improved performance by 30%.
```

Expected:

```text
BLOCKED
```

---

## Audit 3 — Skill Fabrication

Try adding:

```text
Kubernetes
AWS
Docker
```

without evidence.

Expected:

```text
BLOCKED
```

---

## Audit 4 — Ownership Escalation

Try:

```text
worked with
→ led

assisted
→ owned

contributed
→ architected
```

without evidence.

Expected:

```text
BLOCKED
```

---

## Audit 5 — Experience Fabrication

Try adding:

```text
5 years
7 years
10 years
```

without authoritative evidence.

Expected:

```text
BLOCKED
```

---

## Audit 6 — Score Authority

Verify:

```text
AI does not calculate scores.

ATS engine calculates ATS.

Match engine calculates Match.

Content engine calculates Content.
```

---

## Audit 7 — Re-score

Every accepted optimization must be re-parsed and re-scored.

No score assumptions.

---

## Audit 8 — Regression

A materially worse optimization must not be silently accepted.

---

## Audit 9 — Recommendation Resolution

Verify Phase 6 is re-run after optimization.

Recommendations must be resolved based on deterministic analysis.

---

## Audit 10 — Stale Draft

Optimization generated against Version A must not overwrite Version B.

---

## Audit 11 — Evidence Traceability

Every optimization must preserve:

```text
recommendationId
source evidence
target bullet
```

---

## Audit 12 — AI Failure

AI failure must never modify the original resume.

---

## Audit 13 — Missing Evidence

Missing skill or missing metric must NOT be automatically invented.

---

## Audit 14 — Strong Resume Protection

A strong bullet should remain unchanged unless there is a meaningful improvement opportunity.

---

## Audit 15 — Keyword Stuffing

Verify optimization does not artificially repeat skills to increase ATS keyword counts.

---

## Audit 16 — Full Regression

Run:

```text
all backend tests
frontend TypeScript
lint
production build
```

Expected:

```text
PASS
```

---

# 101. Definition of Done

Phase 7 is complete only when:

### Architecture

- [ ] Optimization module exists
- [ ] Recommendation → target mapping exists
- [ ] AI proposal schema exists
- [ ] Deterministic validation exists
- [ ] Re-score pipeline exists
- [ ] Versioning exists
- [ ] Accept/reject workflow exists

### Safety

- [ ] No new unsupported facts
- [ ] No new unsupported metrics
- [ ] No new unsupported skills
- [ ] No ownership inflation
- [ ] No experience fabrication
- [ ] Meaning preservation
- [ ] Original resume protected
- [ ] AI failure safe

### Scoring

- [ ] ATS re-score deterministic
- [ ] Match re-score deterministic
- [ ] Content re-score deterministic
- [ ] No score fabrication
- [ ] Regression detection works

### Recommendation

- [ ] Phase 6 recommendation drives optimization
- [ ] Recommendation resolution is re-evaluated
- [ ] Recommendation IDs remain traceable

### UX

- [ ] Before/after preview
- [ ] Validation state visible
- [ ] Score comparison visible
- [ ] Accept/reject controls
- [ ] Original version recoverable

### Testing

- [ ] Metric hallucination tests
- [ ] Skill hallucination tests
- [ ] Ownership tests
- [ ] Experience tests
- [ ] Score tests
- [ ] Version tests
- [ ] Stale draft tests
- [ ] Rollback tests
- [ ] AI failure tests
- [ ] Full regression

---

# 102. FINAL ARCHITECTURE

```text
                         RESUME
                            │
                            ▼
                     Resume Parser
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
         ATS              Skills            Content
          │                 │                 │
          │                 ▼                 │
          │            Role + JD              │
          │                 │                 │
          │                 ▼                 │
          └────────────► Matching ◄───────────┘
                            │
                            ▼
                    Recommendations
                         Phase 6
                            │
                            ▼
                   Optimization Target
                         Phase 7
                            │
                            ▼
                      AI Proposal
                            │
                            ▼
                 Deterministic Validator
                     │              │
                   FAIL             PASS
                     │              │
                     ▼              ▼
                  REJECT       Draft Resume
                                    │
                                    ▼
                              Resume Parser
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
                ATS               Match             Content
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    ▼
                            Before / After
                               Comparison
                                    │
                                    ▼
                         Phase 6 Re-analysis
                                    │
                                    ▼
                              User Review
                              │         │
                           ACCEPT      REJECT
                              │         │
                              ▼         ▼
                       New Resume     Original
                         Version       Remains
```

---

# CORE PRINCIPLE

> **Phase 7 is not an AI resume writer. It is a controlled optimization system.**

The AI proposes wording.

The evidence system decides what is supported.

The deterministic engines decide what changed.

The scoring engines decide whether the resume actually improved.

The user decides whether the change becomes part of the resume.

The original resume is never destroyed.

That separation must remain intact before moving to Phase 8 — Resume Copilot.
