# SKILLEZO AI — Phase 4 Implementation Plan
## Resume ↔ Job Matching Intelligence

**Project:** Skillezo AI — Resume Intelligence  
**Phase:** 4  
**Depends on:** Phase 1 — AI Intelligence Foundation, Phase 2 — Evidence & Skill Intelligence, Phase 3 — Role Benchmark + Optional Job Description Intelligence  
**Status:** Implementation Plan

---

# 1. Phase 4 Objective

Build the deterministic **Resume ↔ Job Matching Intelligence Engine**.

Phase 1 established the AI foundation.

Phase 2 established:

> "What does the candidate actually have evidence for?"

Phase 3 established:

> "What does the target role and optional job description require?"

Phase 4 answers:

> **"How well does the candidate's verified resume evidence satisfy those requirements?"**

The architecture becomes:

```text
Phase 1
AI Foundation
        ↓
Phase 2
Candidate Evidence + Skill Intelligence
        ↓
Phase 3
Role Benchmark + Optional JD Requirements
        ↓
Phase 4
Resume ↔ Job Matching
        ↓
Phase 5
Impact + Content Intelligence
        ↓
Phase 6
AI Recommendation Orchestrator
        ↓
Phase 7
Resume Optimization + Re-score
        ↓
Phase 8
Resume Copilot
```

The Phase 4 engine must be deterministic, explainable, evidence-backed, and reusable by all later phases.

---

# 2. Core Architectural Rule

Continue the project's primary rule:

> **Deterministic systems calculate facts, matches, gaps, confidence, and authoritative scores. AI explains, prioritizes, and communicates those results.**

AI must never:

- invent candidate skills
- invent candidate experience
- invent candidate projects
- invent candidate certifications
- turn JD requirements into candidate evidence
- decide that a candidate possesses a skill without resume evidence
- arbitrarily change the deterministic match score
- override deterministic evidence
- hide a requirement because AI thinks it is unimportant

AI may:

- explain a match
- explain a gap
- summarize evidence
- prioritize gaps
- explain requirement importance
- generate human-readable recommendations
- identify potentially related concepts for review

The deterministic engine remains the source of truth.

---

# 3. Phase 4 Scope

## In Scope

- Candidate ↔ Role matching
- Candidate ↔ JD matching
- required skill matching
- preferred skill matching
- exact skill matching
- alias-normalized matching
- parent/child skill relationship handling
- related skill handling
- evidence-aware match classification
- experience requirement matching
- education requirement matching
- certification requirement matching
- responsibility relevance signals
- keyword coverage
- requirement-level match results
- match confidence
- match source tracking
- partial/related match handling
- deterministic overall match score
- deterministic gap calculation
- gap prioritization inputs
- AI explanation layer
- versioned matching engine
- caching
- API integration
- frontend presentation
- comprehensive tests

---

# 4. Explicitly Out of Scope

Do NOT implement these in Phase 4.

## Resume Rewriting

Do not:

- rewrite resume bullets
- rewrite summary
- rewrite projects
- rewrite skills section
- automatically insert skills

This belongs to Phase 7.

## Resume Editor

Do not build:

- drag-and-drop resume editor
- inline editing system
- document generation workflow

This belongs to later optimization/copilot phases.

## Full Impact Intelligence

Do not implement the complete:

- bullet impact engine
- metric quality engine
- achievement rewriting engine

These belong to Phase 5.

## Recommendation Orchestration

Do not build the final AI recommendation ranking system yet.

That belongs to Phase 6.

---

# 5. Inputs

Phase 4 should consume the outputs of Phases 1–3.

Required conceptual inputs:

```ts
CandidateSkillProfile
RoleProfile
```

Optional:

```ts
JobRequirementProfile
```

Additional candidate information may come from the existing parsed resume:

```ts
ResumeEvidence
CandidateExperience
Education
Certifications
Projects
```

The matching engine must not re-parse the resume if the required normalized information already exists.

---

# 6. Primary Analysis Modes

## Mode A — Role Matching

When no JD is supplied:

```text
Candidate Resume
        +
Candidate Skill Profile
        +
Target Role Profile
        ↓
Role Match Analysis
```

## Mode B — Role + JD Matching

When a JD is supplied:

```text
Candidate Resume
        +
Candidate Skill Profile
        +
Role Profile
        +
Job Requirement Profile
        ↓
Combined Match Analysis
```

The JD remains optional.

---

# 7. Matching Model

The fundamental relationship is:

```text
Candidate Evidence
        ↕
Requirement
```

Not:

```text
Candidate
        ↔
Raw JD Text
```

Every match should operate against normalized requirements.

Example:

```text
Candidate:
skill_react
evidence:
resume-project-12

Requirement:
skill_react
source:
JOB_DESCRIPTION
type:
REQUIRED
```

Result:

```text
MATCHED
```

---

# 8. Requirement Identity

Every requirement must have a stable normalized identity.

For skills:

```ts
skillId
```

For experience:

```ts
experienceRequirementId
```

For education:

```ts
educationRequirementId
```

For certifications:

```ts
certificationRequirementId
```

This prevents string-based matching throughout the system.

---

# 9. Skill Match Classification

Create a deterministic skill match classification.

Recommended states:

```ts
type SkillMatchStatus =
  | "MATCHED"
  | "PARTIAL"
  | "RELATED"
  | "NOT_DETECTED";
```

Meaning:

### MATCHED

Candidate has direct evidence for the required canonical skill.

### PARTIAL

Candidate evidence covers part of a requirement or a closely scoped variant.

### RELATED

Candidate has a related skill through an explicitly defined Phase 2 relationship.

### NOT_DETECTED

No acceptable candidate evidence was found.

Important:

> `NOT_DETECTED` means the skill was not detected in the resume. It does NOT mean the candidate does not know the skill.

---

# 10. Exact Skill Matching

Exact matching should use canonical Phase 2 IDs.

Example:

```text
Resume:
React

JD:
React

→ MATCHED
```

Do not compare raw strings where normalized skill IDs already exist.

---

# 11. Alias Matching

Aliases must already be normalized by Phase 2.

Example:

```text
Resume:
NodeJS

JD:
Node.js
```

Both become:

```text
skill_nodejs
```

Result:

```text
MATCHED
```

Do not create a new alias table inside Phase 4.

---

# 12. Parent / Child Skill Matching

Phase 2 relationships must be consumed carefully.

Example:

```text
Next.js
    ↓
React
    ↓
JavaScript
```

If the candidate has:

```text
Next.js
```

and the requirement is:

```text
React
```

the candidate may receive:

```text
RELATED
```

or `MATCHED` only if the Phase 2 relationship explicitly defines the child as sufficient for the parent.

Do not automatically treat every parent/child relationship as equivalent.

The matching policy must be explicit and configurable.

---

# 13. Related Skill Matching

Example:

```text
Candidate:
Node.js

Requirement:
Express.js
```

If Phase 2 defines:

```text
Node.js → Express.js
```

the result may be:

```text
RELATED
```

not automatically:

```text
MATCHED
```

This distinction protects score accuracy.

---

# 14. Skill Match Evidence

Every match must contain candidate evidence IDs.

Example:

```ts
interface MatchEvidence {
  candidateEvidenceIds: string[];
  requirementEvidenceIds: string[];
}
```

Example:

```text
Candidate Evidence:
resume-ev-102

JD Evidence:
jd-ev-41
```

This allows the UI and later AI layers to explain exactly why the match exists.

---

# 15. Requirement Match Result

Create a normalized requirement result.

Suggested structure:

```ts
interface RequirementMatchResult {
  requirementId: string;

  category:
    | "SKILL"
    | "EXPERIENCE"
    | "EDUCATION"
    | "CERTIFICATION"
    | "KEYWORD"
    | "RESPONSIBILITY";

  requirementType:
    | "REQUIRED"
    | "PREFERRED";

  source:
    | "ROLE_BENCHMARK"
    | "JOB_DESCRIPTION"
    | "BOTH";

  status:
    | "MATCHED"
    | "PARTIAL"
    | "RELATED"
    | "NOT_DETECTED";

  confidence: number;

  candidateEvidenceIds: string[];

  requirementEvidenceIds: string[];

  rationaleCode: string;
}
```

The exact interface may be adapted to project conventions.

---

# 16. Requirement Source Handling

A requirement may originate from:

```text
ROLE_BENCHMARK
JOB_DESCRIPTION
BOTH
```

Example:

```text
React
```

Role benchmark:

```text
REQUIRED
```

JD:

```text
REQUIRED
```

Result:

```text
source = BOTH
```

Do not duplicate the same requirement unnecessarily.

---

# 17. Source Priority

When role benchmark and JD requirements overlap:

```text
Role Benchmark
+
JD
```

the employer-specific JD requirement must remain visible.

Example:

```text
Role:
Next.js PREFERRED

JD:
Next.js REQUIRED
```

Final requirement:

```text
Next.js
REQUIRED
source:
BOTH
```

The role catalog itself must remain unchanged.

---

# 18. Required vs Preferred Weighting

Required and preferred requirements must not have equal importance.

Recommended initial weighting:

```text
Required = 1.0
Preferred = 0.5
```

These values should be centralized as configuration constants.

Do not scatter weights across the codebase.

Example:

```ts
MATCH_WEIGHTS = {
  REQUIRED: 1.0,
  PREFERRED: 0.5
};
```

These are match importance weights, not ATS score modifications.

---

# 19. Match Status Weights

Define deterministic status contribution.

Example starting policy:

```text
MATCHED     = 1.00
PARTIAL     = 0.60
RELATED     = 0.35
NOT_DETECTED = 0.00
```

These are initial engineering defaults.

Keep them centralized and versioned.

Do not allow AI to change these values.

---

# 20. Required Skill Coverage

Calculate:

```text
Required Skill Coverage
=
Weighted satisfied required requirements
/
Total required requirement weight
```

Example:

```text
10 required skills

8 MATCHED
1 PARTIAL
1 NOT_DETECTED
```

Using:

```text
MATCHED = 1.0
PARTIAL = 0.6
NOT_DETECTED = 0
```

coverage:

```text
(8 + 0.6) / 10
=
86%
```

The exact formula must be implemented once and reused.

---

# 21. Preferred Skill Coverage

Calculate separately:

```text
Preferred Skill Coverage
=
Weighted satisfied preferred requirements
/
Total preferred requirement weight
```

Do not allow strong preferred coverage to hide major required gaps.

---

# 22. Overall Match Score

Create one deterministic matching score.

Recommended conceptual model:

```text
Overall Match Score
=
Required Coverage × 70%
+
Preferred Coverage × 15%
+
Experience Match × 10%
+
Education/Certification Coverage × 5%
```

These percentages are initial defaults and must be centralized.

If a category has no applicable requirements, its weight must be redistributed rather than incorrectly treated as zero.

Example:

```text
No certification requirement
```

should not automatically penalize the candidate.

---

# 23. Score Normalization

Return scores consistently as:

```text
0–100
```

Use integer or controlled decimal precision.

Example:

```json
{
  "overallMatchScore": 84
}
```

This is a **job/role match score**, not the ATS compatibility score.

Do not overwrite the existing ATS score.

---

# 24. Separate Scores

Maintain separate concepts:

```text
ATS Score
```

answers:

> How well does the resume satisfy ATS/resume-quality criteria?

and:

```text
Match Score
```

answers:

> How well does the candidate's verified resume evidence satisfy the target role/JD requirements?

Never merge them into one authoritative score.

---

# 25. Experience Matching

Match candidate experience against JD/role requirements.

Example:

```text
Requirement:
3+ years backend development

Candidate:
4 years backend development
```

Result:

```text
MATCHED
```

Example:

```text
Requirement:
5+ years

Candidate:
3 years
```

Result:

```text
PARTIAL
```

or an equivalent deterministic state if the implementation defines a dedicated experience status.

Do not infer exact years from vague resume language.

---

# 26. Experience Evidence

Experience matching must reference candidate evidence.

Example:

```ts
candidateEvidenceIds: [
  "experience-01",
  "experience-04"
]
```

The system must be able to explain where the experience calculation came from.

---

# 27. Education Matching

Example:

```text
JD:
Bachelor's degree required

Resume:
B.Tech Computer Science

→ MATCHED
```

Equivalent degrees should be represented through deterministic normalization rules.

Do not use AI to invent degree equivalency.

---

# 28. Certification Matching

Example:

```text
JD:
AWS Certified Solutions Architect

Resume:
AWS Certified Solutions Architect

→ MATCHED
```

If the resume does not contain evidence:

```text
→ NOT_DETECTED
```

Never infer certification from a candidate's AWS skill.

---

# 29. Keyword Matching

Keywords should be handled separately from canonical skills.

Example:

```text
JD:
scalable distributed systems
```

Candidate resume:

```text
built distributed services
```

This may produce:

```text
PARTIAL
```

only if deterministic keyword normalization supports it.

Do not turn every semantic similarity into a hard match.

---

# 30. Responsibility Relevance

Responsibilities should produce relevance signals rather than automatically becoming required skills.

Example:

```text
JD Responsibility:
Build scalable REST APIs.
```

Candidate:

```text
Built REST APIs using Node.js.
```

Result may be:

```text
RESPONSIBILITY_RELEVANCE = HIGH
```

But this should not automatically create:

```text
Required Skill:
REST
```

unless the requirement profile explicitly contains that skill requirement.

---

# 31. Candidate Evidence Strength

Use Phase 2 evidence confidence.

Example:

```text
Exact skill evidence:
0.99

Alias evidence:
0.95
```

Do not invent new candidate evidence confidence logic if Phase 2 already provides it.

Phase 4 consumes and aggregates it.

---

# 32. Match Confidence

Match confidence should consider:

```text
candidate evidence confidence
+
requirement extraction confidence
+
relationship confidence
```

Example:

```ts
matchConfidence =
  candidateConfidence
  × requirementConfidence
  × relationshipConfidence;
```

The exact formula can be adjusted, but it must be deterministic.

AI must not directly assign the authoritative confidence.

---

# 33. Gap Engine

Build a deterministic gap engine.

A gap exists when:

```text
Requirement
+
No acceptable candidate evidence
```

or when evidence only partially satisfies the requirement.

Classifications:

```text
MISSING
PARTIAL
RELATED
```

Do not call a `NOT_DETECTED` skill a definitive candidate deficiency.

Preferred UI wording:

```text
Not detected in resume
```

rather than:

```text
You don't have this skill
```

---

# 34. Gap Priority

Create a deterministic priority signal.

Suggested factors:

```text
Requirement Type
+
Match Status
+
Requirement Source
+
Role Importance
+
JD Explicitness
```

Example:

```text
Required + NOT_DETECTED
→ HIGH

Required + PARTIAL
→ HIGH/MEDIUM

Preferred + NOT_DETECTED
→ MEDIUM/LOW

Preferred + RELATED
→ LOW
```

The exact rules should be centralized.

---

# 35. Gap Result

Suggested structure:

```ts
interface SkillGap {
  skillId: string;

  skillName: string;

  requirementType:
    | "REQUIRED"
    | "PREFERRED";

  source:
    | "ROLE_BENCHMARK"
    | "JOB_DESCRIPTION"
    | "BOTH";

  status:
    | "MISSING"
    | "PARTIAL"
    | "RELATED";

  priority:
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  requirementIds: string[];

  evidenceIds: string[];
}
```

---

# 36. Do Not Automatically Recommend Learning

Phase 4 should identify gaps.

It should not yet build a complete learning recommendation system.

Example:

```text
GraphQL — HIGH PRIORITY GAP
```

is acceptable.

But:

```text
Take Course X for 14 days
```

belongs to later recommendation logic.

---

# 37. Combined Role + JD Matching

When both role benchmark and JD exist:

```text
Candidate
   ↓
Role Match
   +
JD Match
   ↓
Combined Requirement View
```

The system should preserve:

```text
General Role Requirements
```

and:

```text
Employer-Specific Requirements
```

separately.

This allows the UI to distinguish:

```text
Role Gap
```

from:

```text
Employer-Specific Gap
```

---

# 38. Example Combined Result

Input:

```text
Target Role:
Frontend Engineer
```

Role benchmark:

```text
Required:
React
TypeScript
JavaScript
HTML
CSS
```

JD:

```text
Required:
React
TypeScript
GraphQL

Preferred:
Next.js
Playwright
```

Candidate:

```text
React
TypeScript
Next.js
```

Result:

```text
ROLE BENCHMARK
✓ React
✓ TypeScript
✓ JavaScript
⚠ HTML
⚠ CSS

JOB DESCRIPTION
✓ React
✓ TypeScript
✕ GraphQL

Preferred
✓ Next.js
✕ Playwright
```

Do not calculate the above relationships using AI.

---

# 39. Match Result Object

Create a top-level result.

Suggested:

```ts
interface ResumeJobMatchResult {
  overallMatchScore: number;

  requiredCoverage: number;

  preferredCoverage: number;

  experienceMatch: number;

  educationCoverage: number;

  certificationCoverage: number;

  skillMatches: RequirementMatchResult[];

  experienceMatches: RequirementMatchResult[];

  educationMatches: RequirementMatchResult[];

  certificationMatches: RequirementMatchResult[];

  keywordMatches: RequirementMatchResult[];

  responsibilitySignals: ResponsibilityMatchResult[];

  gaps: SkillGap[];

  summary: {
    matched: number;
    partial: number;
    related: number;
    notDetected: number;
  };

  engineVersion: string;
}
```

Adapt to existing project naming conventions.

---

# 40. Engine Version

Create:

```ts
MATCH_ENGINE_VERSION = "1.0.0";
```

Any scoring or classification behavior change requires a version update.

Do not silently change scoring logic.

---

# 41. Hashing

Extend the Phase 3 analysis hash with:

```text
MATCH_ENGINE_VERSION
```

Conceptually:

```text
analysisHash =
SHA256(
  resumeHash +
  roleVersion +
  jdHash +
  skillEngineVersion +
  atsEngineVersion +
  aiEngineVersion +
  matchEngineVersion
)
```

This ensures cached results are invalidated when matching logic changes.

---

# 42. Caching

Cache deterministic match results where practical.

Recommended cache identity:

```text
resumeHash
+
roleProfileVersion
+
jobRequirementHash
+
skillEngineVersion
+
matchEngineVersion
```

The cache must distinguish:

```text
Role-only analysis
```

from:

```text
Role + JD analysis
```

---

# 43. AI Explanation Layer

After deterministic matching completes:

```text
Deterministic Match Engine
        ↓
Verified Match Results
        ↓
AI Explanation
```

AI receives the structured result.

It should not independently recalculate the match.

---

# 44. AI Responsibilities in Phase 4

AI may generate:

### Match Explanation

```text
Your React experience is strongly supported by
project evidence showing component development.
```

### Gap Explanation

```text
GraphQL is required by this job description but was
not detected in the resume evidence.
```

### Priority Explanation

```text
GraphQL is a high-priority gap because the employer
explicitly lists it as required.
```

These statements must remain grounded in deterministic data.

---

# 45. AI Guardrails

AI output must pass Phase 1 guardrails.

If AI says:

```text
You have GraphQL experience.
```

but deterministic evidence says:

```text
GraphQL = NOT_DETECTED
```

the statement must be rejected or rewritten.

Safe alternative:

```text
GraphQL is not detected in the current resume.
```

---

# 46. No AI Score Mutation

If deterministic engine returns:

```text
overallMatchScore = 82
```

AI cannot return:

```text
overallMatchScore = 91
```

and overwrite it.

AI can only explain:

```text
Why the score is 82.
```

The numeric score remains deterministic.

---

# 47. AI Structured Output

Use Zod validation for AI explanations.

Suggested:

```ts
interface AIMatchExplanation {
  summary: string;

  strengths: AIExplanationItem[];

  gaps: AIExplanationItem[];

  priorities: AIExplanationItem[];
}
```

Each item should reference:

```ts
requirementId
```

or:

```ts
skillId
```

where applicable.

AI should not be allowed to reference unknown requirements.

---

# 48. Unknown AI References

If AI returns:

```text
skillId = skill_unknown_123
```

and it is not present in the deterministic result:

```text
reject
```

or safely omit it.

Never create a new requirement from AI output.

---

# 49. API Integration

Extend the existing analysis response.

Conceptually:

```ts
{
  ats: {...},

  skillsProfile: {...},

  roleProfile: {...},

  jobRequirements: {...} | null,

  match: {
    overallMatchScore: 84,
    requiredCoverage: 86,
    preferredCoverage: 72,
    ...
  },

  ai: {
    matchExplanation: {...}
  }
}
```

Keep ATS and match scores separate.

---

# 50. Frontend Presentation

Add a dedicated:

```text
Job Match
```

or:

```text
Role Match
```

section.

Recommended structure:

```text
┌─────────────────────────────────────┐
│         ROLE MATCH                  │
│                                     │
│             84 / 100                │
│          Strong Match               │
└─────────────────────────────────────┘

Required Skills
✓ React
✓ TypeScript
✓ JavaScript
⚠ HTML
✕ GraphQL

Preferred Skills
✓ Next.js
✕ Playwright

Top Gaps
1. GraphQL
2. Playwright
3. HTML
```

---

# 51. Score Explanation

Show what the score represents.

Example:

```text
Match Score
How well your verified resume evidence aligns
with the target role and job requirements.
```

Do not label it:

```text
ATS Score
```

because it is a different metric.

---

# 52. Match Status UI

Use clear language:

```text
MATCHED
PARTIAL
RELATED
NOT DETECTED
```

For users, display:

```text
✓ Matched
⚠ Partial
↗ Related
○ Not detected
```

Avoid accusatory wording.

---

# 53. Evidence Inspection

The user should eventually be able to inspect why something matched.

Example:

```text
React
✓ Matched

Evidence:
"Built reusable React components for..."
```

The Phase 4 result should provide the evidence IDs required for this UI.

Do not duplicate resume evidence text unnecessarily.

---

# 54. Role vs JD UI

If no JD:

```text
Role Benchmark
```

If JD exists:

```text
Role Benchmark
+
Employer Requirements
```

The UI should make the distinction obvious.

Example:

```text
Role Benchmark
General expectations for Frontend Engineer

Employer Requirements
Specific requirements extracted from the pasted JD
```

---

# 55. Empty JD Behavior

If:

```text
jobDescription = ""
```

treat it as:

```text
no JD
```

Do not create an empty JobRequirementProfile.

Role matching must still work.

---

# 56. Invalid JD Behavior

If JD validation fails:

```text
Do not fail the entire resume analysis.
```

Return:

```text
Role match available
JD match unavailable
```

with a safe warning.

---

# 57. Missing Candidate Evidence

If a requirement exists but the resume has no evidence:

```text
NOT_DETECTED
```

not:

```text
FAILED
```

This distinction is important for user trust.

---

# 58. Semantic Matching Boundaries

Do not build a general-purpose semantic similarity engine in Phase 4.

Avoid:

```text
Embedding every sentence
+
cosine similarity
+
arbitrary threshold
```

as the primary scoring mechanism.

Prefer:

```text
Canonical skill IDs
+
explicit relationships
+
evidence
+
deterministic rules
```

Semantic AI assistance can be introduced later where justified.

---

# 59. No Double Counting

Prevent the same candidate evidence from artificially inflating multiple requirement scores.

Example:

```text
Candidate:
React evidence
```

should not automatically satisfy:

```text
React
Frontend
JavaScript
Web Development
```

unless explicit relationship rules define those matches.

One piece of evidence may support multiple valid requirements, but scoring must avoid accidental multiplication.

---

# 60. Skill Hierarchy Policy

Create centralized rules for:

```text
Exact match
Alias match
Parent match
Child match
Related match
```

Example:

```ts
MATCH_POLICY = {
  EXACT: "MATCHED",
  ALIAS: "MATCHED",
  CHILD_TO_PARENT: "RELATED",
  PARENT_TO_CHILD: "NOT_DETECTED",
  RELATED: "RELATED"
};
```

This is an example policy; use the actual Phase 2 relationship semantics.

Do not hardcode relationship behavior inside individual match functions.

---

# 61. Experience Overlap

When candidate experience contains multiple roles/projects, aggregate relevant evidence carefully.

Example:

```text
Role 1:
React — 2 years

Role 2:
React — 1 year
```

Candidate may have:

```text
3 years React evidence
```

if the project's existing experience model supports safe aggregation.

Do not simply sum overlapping calendar periods.

Avoid double-counting concurrent experience.

---

# 62. Candidate Experience Matching

Candidate experience calculations must use existing resume structures.

If the resume only says:

```text
"Experienced React developer"
```

do not infer:

```text
4 years
```

without evidence.

---

# 63. Requirement Confidence

Requirements extracted from a JD may have different confidence.

Example:

```text
Explicit:
"React is required."
confidence = high

Ambiguous:
"Experience with modern frontend frameworks."
confidence = lower
```

Low-confidence requirements should not have the same scoring authority as explicit requirements unless the deterministic policy says so.

---

# 64. JD Extraction Confidence and Matching

If a JD requirement was extracted with low confidence:

```text
requirement.confidence < threshold
```

the system may:

- exclude it from authoritative scoring
- classify it as informational
- retain it for UI review

Choose one consistent policy and document it.

Do not silently let low-confidence AI extraction materially distort the match score.

---

# 65. Required Requirement Safety

A requirement should only receive:

```text
REQUIRED
```

when deterministic evidence or high-confidence structured extraction supports that classification.

Do not promote ambiguous text into a required requirement merely because AI thinks it sounds important.

---

# 66. Match Summary

Generate deterministic counts:

```ts
{
  matched: 12,
  partial: 3,
  related: 2,
  notDetected: 4
}
```

These counts must come from requirement results.

Do not ask AI to count them.

---

# 67. Match Strength Label

Create a deterministic label.

Suggested:

```text
90–100 → Excellent Match
75–89  → Strong Match
60–74  → Moderate Match
40–59  → Weak Match
0–39   → Low Match
```

Keep thresholds centralized and versioned.

Do not let AI decide the label.

---

# 68. Score Caveat

The match score should be described as:

```text
Deterministic alignment estimate based on
the available resume evidence and normalized
role/job requirements.
```

Do not claim:

```text
Probability of getting hired
```

or:

```text
Employer hiring score
```

The system cannot know those things.

---

# 69. Backend Module Structure

Suggested:

```text
server/src/modules/matching-intelligence/

├── match.types.ts
├── match.constants.ts
├── match.engine.ts
├── match.skill.ts
├── match.experience.ts
├── match.education.ts
├── match.certification.ts
├── match.keyword.ts
├── match.responsibility.ts
├── match.gap.ts
├── match.score.ts
├── match.service.ts
└── match.utils.ts
```

Exact paths can follow project conventions.

Keep the engine modular so Phase 5 and Phase 6 can consume its output without rewriting it.

---

# 70. Single Scoring Engine

There must be exactly one authoritative Phase 4 scoring implementation.

Avoid:

```text
Frontend score calculation
Backend score calculation
AI score calculation
ATS score calculation
```

for the same match metric.

The backend deterministic match engine owns:

```text
overallMatchScore
coverage scores
match status
gap priority
```

Frontend only displays them.

---

# 71. Testing — Core Skill Matching

Minimum tests:

### Exact

```text
React → React = MATCHED
```

### Alias

```text
NodeJS → Node.js = MATCHED
```

### Parent/Child

```text
Next.js → React = according to explicit policy
```

### Related

```text
Node.js → Express.js = RELATED
```

### Missing

```text
GraphQL → NOT_DETECTED
```

---

# 72. Testing — Required vs Preferred

Verify:

```text
Required React matched
Preferred Playwright missing
```

does not produce the same priority or score contribution.

---

# 73. Testing — Role Only

Input:

```text
Resume
+
Frontend Engineer
```

Verify:

- role requirements load
- candidate requirements match
- score calculates
- no JD dependency exists

---

# 74. Testing — Role + JD

Input:

```text
Resume
+
Frontend Engineer
+
JD
```

Verify:

- role benchmark remains
- JD requirements are added
- duplicates are merged
- source tracking works
- JD-specific requirements remain visible

---

# 75. Testing — Source Conflict

Test:

```text
Role:
Next.js PREFERRED

JD:
Next.js REQUIRED
```

Expected:

```text
Next.js REQUIRED
source = BOTH
```

Role catalog must remain unchanged.

---

# 76. Testing — No Evidence

JD:

```text
GraphQL required
```

Resume:

```text
React
TypeScript
```

Expected:

```text
GraphQL
status = NOT_DETECTED
```

Never:

```text
candidateDoesNotKnowGraphQL = true
```

---

# 77. Testing — Score Stability

Given the same:

```text
resumeHash
roleVersion
jdHash
engineVersions
```

the match engine must produce the same result.

This is important for caching and regression detection.

---

# 78. Testing — AI Guardrails

Test:

```text
Deterministic:
GraphQL = NOT_DETECTED

AI:
Candidate has strong GraphQL experience
```

Expected:

```text
AI statement rejected or safely corrected
```

---

# 79. Testing — No Score Mutation

Test:

```text
Deterministic Match Score:
82
```

AI output:

```text
91
```

Expected:

```text
Final score:
82
```

---

# 80. Testing — Evidence Integrity

Every:

```text
MATCHED
PARTIAL
RELATED
```

result must contain valid candidate evidence references where required.

Every JD-derived requirement should contain valid requirement evidence references where available.

---

# 81. Testing — Regression

Required baseline:

```text
Phase 1 tests: PASS
Phase 2 tests: PASS
Phase 3 tests: PASS
Phase 4 tests: PASS
Frontend TypeScript: 0 errors
```

No regression in:

- ATS scoring
- skill detection
- role normalization
- JD parsing
- AI guardrails

---

# 82. Performance

Avoid recalculating:

- skill normalization
- role normalization
- JD extraction
- candidate skill detection

when already available.

Phase 4 should consume normalized Phase 2/3 outputs.

Expected flow:

```text
Parse once
Normalize once
Match once
Explain once
```

---

# 83. Caching Strategy

Cache:

```text
Role Profile
Job Requirement Profile
Candidate Skill Profile
Match Result
```

where safe.

Never cache solely by:

```text
targetRole
```

because different resumes produce different matches.

Never cache solely by:

```text
JD text
```

because different candidates produce different matches.

---

# 84. Privacy and Security

Do not log:

- full resume
- full JD
- candidate personal information
- AI prompts containing private candidate information

Prefer operational metadata:

```text
resumeHash
jdHash
roleId
matchEngineVersion
latency
cacheHit
```

Validate all API input.

---

# 85. API Error Handling

Matching failure should not destroy the existing ATS analysis.

If match calculation fails:

```text
ATS analysis → still available
Skill profile → still available
Role profile → still available
Match → unavailable with safe error
```

Do not return a fabricated fallback match score.

---

# 86. API Backward Compatibility

Existing consumers that only expect:

```text
ATS
+
Skill Intelligence
```

must continue working.

Phase 4 fields should be additive where possible.

Do not break existing response contracts without a deliberate versioning decision.

---

# 87. Observability

Record:

```text
matchEngineVersion
roleId
roleVersion
jdHash
resumeHash
candidateSkillCount
requirementCount
matchedCount
partialCount
relatedCount
notDetectedCount
cacheHit
latency
```

Avoid sensitive raw content.

---

# 88. Example End-to-End Flow

Input:

```text
Target Role:
Backend Engineer

JD:
Required:
Node.js
TypeScript
PostgreSQL

Preferred:
AWS
Docker

3+ years backend development
```

Candidate evidence:

```text
Node.js ✓
TypeScript ✓
PostgreSQL ✓
AWS ✓
2.5 years backend development
```

Deterministic output:

```text
Required:
✓ Node.js
✓ TypeScript
✓ PostgreSQL
⚠ Experience

Preferred:
✓ AWS
○ Docker
```

Then:

```text
Match Score
```

is calculated by the deterministic engine.

Only after that does AI explain:

```text
Your technical stack aligns strongly with the role.
The main gap is the requested 3+ years of backend
experience; the current resume provides evidence for
approximately 2.5 years.
```

---

# 89. Example — Missing Required Skill

Input:

```text
JD:
GraphQL required
```

Candidate:

```text
React
Node.js
TypeScript
```

Output:

```text
GraphQL
○ Not detected

Priority:
HIGH

Source:
Employer Requirement
```

AI explanation:

```text
GraphQL is explicitly listed as a required employer
skill but is not detected in the current resume.
```

No invented candidate claim.

---

# 90. Example — Related Skill

Candidate:

```text
Node.js
```

Requirement:

```text
Express.js
```

Phase 2 relationship:

```text
Node.js → Express.js
```

Output:

```text
Express.js
↗ Related
```

Do not report:

```text
✓ Express.js
```

unless the relationship policy explicitly permits it.

---

# 91. Example — Role Benchmark Without JD

Target:

```text
Frontend Engineer
```

Candidate:

```text
React
TypeScript
Next.js
```

Output:

```text
Role Match

Strong Match

Core strengths:
✓ React
✓ TypeScript
✓ Next.js

Potential gaps:
○ Testing
○ Accessibility
```

This must work even when no JD is pasted.

---

# 92. Phase 4 Data Contract for Phase 5+

Later phases should consume:

```ts
ResumeJobMatchResult
```

without recalculating matching.

Phase 5 can ask:

```text
Which matched requirements lack strong evidence?
```

Phase 6 can ask:

```text
Which gaps should be prioritized?
```

Phase 7 can ask:

```text
Which changes could improve the match?
```

This keeps the architecture modular.

---

# 93. Important Phase Boundary

The phases now have clear responsibilities:

```text
Phase 2
"What skills/evidence does the candidate have?"

Phase 3
"What does the role/JD require?"

Phase 4
"How does the candidate's evidence satisfy those requirements?"

Phase 5
"How strong and impactful is the candidate's content?"

Phase 6
"What should the candidate improve first?"

Phase 7
"How can we safely optimize the resume?"

Phase 8
"How can the candidate interactively work with the system?"
```

Do not move Phase 5/6/7 responsibilities backward into Phase 4.

---

# 94. Definition of Done

Phase 4 is complete only when all of the following are true.

## Matching Engine

- [ ] Candidate skill profile is consumed from Phase 2
- [ ] Role profile is consumed from Phase 3
- [ ] Optional JD requirement profile is consumed from Phase 3
- [ ] Exact skill matching works
- [ ] Alias matching works through Phase 2 normalization
- [ ] Parent/child matching follows explicit policy
- [ ] Related skill matching follows explicit policy
- [ ] Required/preferred weighting is centralized
- [ ] Match statuses are deterministic
- [ ] Evidence references are preserved
- [ ] Match confidence is deterministic
- [ ] Requirement source is preserved

## Experience / Education / Certification

- [ ] Experience requirements can be matched
- [ ] Education requirements can be matched
- [ ] Certification requirements can be matched
- [ ] Candidate evidence supports the result
- [ ] No unsupported candidate facts are inferred

## Score

- [ ] Overall match score is deterministic
- [ ] Score is 0–100
- [ ] Required coverage is separate
- [ ] Preferred coverage is separate
- [ ] ATS score remains separate
- [ ] No AI score mutation exists
- [ ] Score thresholds are centralized
- [ ] Match engine version is tracked

## Gap Intelligence

- [ ] Not-detected requirements are identified
- [ ] Partial matches are identified
- [ ] Related matches are identified
- [ ] Gap priority is deterministic
- [ ] Missing requirements are not phrased as definitive lack of ability
- [ ] Role and JD gaps can be distinguished

## AI

- [ ] AI receives deterministic match results
- [ ] AI explains rather than recalculates
- [ ] AI output is schema validated
- [ ] AI cannot invent candidate facts
- [ ] AI cannot mutate scores
- [ ] AI references only known requirements/evidence
- [ ] Phase 1 guardrails remain active

## API / Frontend

- [ ] Role-only matching works
- [ ] Role + JD matching works
- [ ] Existing APIs remain compatible
- [ ] Match result is exposed cleanly
- [ ] ATS and match scores are clearly separated
- [ ] Match statuses are understandable
- [ ] Evidence can be inspected
- [ ] No-JD flow remains first-class

## Testing

- [ ] Phase 1 tests pass
- [ ] Phase 2 tests pass
- [ ] Phase 3 tests pass
- [ ] Phase 4 tests pass
- [ ] AI guardrail tests pass
- [ ] Score stability tests pass
- [ ] Evidence integrity tests pass
- [ ] Frontend TypeScript = 0 errors

---

# 95. Final Engineering Principle

Phase 4 must become the authoritative **matching layer** of Skillezo AI.

The final architecture should be:

```text
                 CANDIDATE
                     │
                     ▼
          ┌────────────────────┐
          │ Candidate Evidence │
          │     Phase 2        │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ Candidate Skill    │
          │ Profile            │
          └─────────┬──────────┘
                    │
                    │
       ┌────────────┴────────────┐
       │                         │
       ▼                         ▼
┌───────────────┐       ┌──────────────────┐
│ Role Profile  │       │ Optional JD      │
│   Phase 3     │       │ Requirements     │
└───────┬───────┘       └────────┬─────────┘
        │                         │
        └────────────┬────────────┘
                     ▼
          ┌────────────────────┐
          │  PHASE 4 MATCH     │
          │      ENGINE        │
          ├────────────────────┤
          │ Skill Matching     │
          │ Experience         │
          │ Education          │
          │ Certifications     │
          │ Keywords           │
          │ Responsibilities   │
          │ Coverage           │
          │ Gaps               │
          │ Match Score        │
          └─────────┬──────────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
      ┌────────────┐ ┌──────────────┐
      │ Deterministic│ │ AI Explain │
      │ Source Truth │ │ & Prioritize│
      └────────────┘ └──────────────┘
```

The most important rule remains:

> **Candidate evidence comes only from the candidate's resume. Requirements come from the role benchmark and/or job description. Phase 4 deterministically measures the relationship between them. AI explains the relationship but never invents it.**

Once Phase 4 is complete, Skillezo will have a reliable foundation for **Impact + Content Intelligence in Phase 5**, followed by recommendation orchestration, safe resume optimization, and the final Copilot experience.
