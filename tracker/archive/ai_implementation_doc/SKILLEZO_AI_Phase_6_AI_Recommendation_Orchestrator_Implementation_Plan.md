# SKILLEZO AI — Phase 6 Implementation Plan
## AI Recommendation Orchestrator

**Phase:** 6 of 8  
**Goal:** Turn the deterministic intelligence from Phases 1–5 into a ranked, actionable recommendation system.

---

# 1. Phase Objective

Phase 6 answers:

> **“What should this candidate improve first, and why?”**

The system must combine:

- Phase 1 — AI Intelligence Foundation
- Phase 2 — Evidence + Skill Intelligence
- Phase 3 — Role Benchmark + Optional JD Intelligence
- Phase 4 — Resume ↔ Job Matching
- Phase 5 — Impact + Content Intelligence

into one recommendation layer.

The recommendation layer must **prioritize improvements**, not simply display every detected problem.

## Core architecture rule

> **Deterministic engines calculate facts, scores, priorities, evidence, and recommendation eligibility. AI explains, summarizes, and phrases recommendations.**

AI must never:

- invent candidate skills
- invent metrics
- invent experience
- invent achievements
- change ATS Score
- change Match Score
- change Content Score
- change deterministic recommendation priority
- convert NOT_DETECTED into a factual claim that the candidate lacks a skill

---

# 2. Existing Architecture — DO NOT BREAK

Current architecture:

```text
Resume
  ↓
Resume Parser
  ↓
Phase 2 — Skill Intelligence
  ↓
Phase 3 — Role / JD Intelligence
  ↓
Phase 4 — Resume ↔ Job Matching
  ↓
Phase 5 — Content Intelligence
  ↓
Phase 6 — Recommendation Orchestrator
  ↓
AI Explanation Layer
  ↓
Frontend
```

The three authoritative scores remain independent:

```text
ATS Score
Match Score
Content Score
```

Phase 6 does NOT create a fourth replacement score.

It creates:

```text
Recommendation Priority
```

Recommendation priority answers:

> Which improvement is most valuable and actionable right now?

---

# 3. Scope

## Included

Phase 6 must implement:

1. Unified recommendation input model
2. Recommendation signal collection
3. Recommendation normalization
4. Duplicate detection and grouping
5. Deterministic priority calculation
6. Impact classification
7. Actionability classification
8. Evidence/confidence propagation
9. Recommendation categories
10. Recommendation ranking
11. Recommendation limits
12. AI recommendation explanation
13. Factual safety validation
14. Recommendation API integration
15. Frontend recommendation presentation
16. Caching/versioning
17. Comprehensive tests
18. Regression validation across Phases 1–5

## Explicitly NOT Included

Do NOT implement:

- automatic resume rewriting
- automatic bullet replacement
- automatic skill insertion
- automatic metric generation
- full resume editor
- one-click optimization
- final resume generation
- cover letter generation
- interview preparation
- Copilot/chat workflow
- Phase 7 optimization engine
- Phase 8 Resume Copilot

Phase 6 tells the user:

> **what to improve and why**

Phase 7 will handle:

> **how to actually optimize the resume**

---

# 4. Recommendation Philosophy

The system should not overwhelm the candidate.

Bad:

```text
32 problems detected
```

Good:

```text
Top 5 improvements

1. Strengthen measurable impact in Experience
2. Improve evidence for TypeScript
3. Address missing AWS requirement
4. Reduce repeated generic responsibility bullets
5. Improve keyword alignment with the target role
```

The recommendation engine should prioritize:

```text
Impact
×
Relevance
×
Evidence
×
Actionability
×
Confidence
```

while avoiding duplicate recommendations.

---

# 5. Recommendation Categories

Create canonical recommendation categories.

Suggested categories:

```ts
export enum RecommendationCategory {
  ATS = "ATS",
  SKILL = "SKILL",
  MATCH = "MATCH",
  CONTENT = "CONTENT",
  IMPACT = "IMPACT",
  EXPERIENCE = "EXPERIENCE",
  STRUCTURE = "STRUCTURE",
  KEYWORD = "KEYWORD",
  EVIDENCE = "EVIDENCE",
  ROLE_RELEVANCE = "ROLE_RELEVANCE",
}
```

Do not create unnecessary categories.

A single recommendation may reference multiple underlying signals.

Example:

```text
Category: EVIDENCE

Signals:
- required React skill matched
- weak evidence
- low technical-depth signal
- low impact evidence
```

This should become **one recommendation**, not four.

---

# 6. Recommendation Data Model

Create:

```text
server/src/modules/recommendation-intelligence/
```

Suggested files:

```text
recommendation.types.ts
recommendation.constants.ts
recommendation.signals.ts
recommendation.grouping.ts
recommendation.priority.ts
recommendation.service.ts
recommendation.validator.ts
recommendation.ai.ts
index.ts
```

Do not duplicate logic already implemented in earlier modules.

---

# 7. Recommendation Type

Create a canonical recommendation model.

Suggested structure:

```ts
interface ResumeRecommendation {
  id: string;

  category: RecommendationCategory;

  title: string;

  summary: string;

  priority: RecommendationPriority;

  impact: RecommendationImpact;

  actionability: RecommendationActionability;

  effort: RecommendationEffort;

  confidence: number;

  score: number;

  sourceIds: string[];

  evidenceIds: string[];

  requirementIds?: string[];

  skillIds?: string[];

  affectedSections?: string[];

  status: RecommendationStatus;

  explanation?: string;

  suggestedAction?: string;

  safetyFlags?: string[];

  engineVersion: string;
}
```

Suggested priority:

```ts
enum RecommendationPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}
```

Use CRITICAL sparingly.

Most recommendations should be:

```text
HIGH
MEDIUM
LOW
```

---

# 8. Actionability Model

This is extremely important.

Not every detected gap can be fixed by rewriting.

Create:

```ts
enum RecommendationActionability {
  FIX_NOW = "FIX_NOW",
  STRENGTHEN_EVIDENCE = "STRENGTHEN_EVIDENCE",
  REQUIRES_NEW_EVIDENCE = "REQUIRES_NEW_EVIDENCE",
  INFORMATIONAL = "INFORMATIONAL",
}
```

Examples:

### FIX_NOW

Existing evidence is present but poorly expressed.

```text
“Worked on backend APIs.”

```

Possible recommendation:

```text
Make ownership and technical contribution clearer.
```

### STRENGTHEN_EVIDENCE

The skill exists, but evidence is weak.

```text
TypeScript detected.
Evidence is only mentioned once.
```

Recommendation:

```text
Strengthen the TypeScript evidence in your strongest relevant experience bullet.
```

### REQUIRES_NEW_EVIDENCE

The requirement is not detected.

```text
AWS — NOT_DETECTED
```

Recommendation:

```text
If you have genuine AWS experience, add it with a truthful example.
```

Never:

```text
Add AWS to your resume.
```

### INFORMATIONAL

Useful observation but not necessarily an immediate action.

---

# 9. Evidence Strength

Every recommendation must preserve evidence traceability.

Possible evidence strength:

```ts
enum EvidenceStrength {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  NONE = "NONE",
}
```

Recommendation generation must reference:

```text
sourceIds
evidenceIds
```

Examples:

```text
content_bullet_12
skill_evidence_7
match_requirement_4
```

Do not generate recommendations from unsupported claims.

---

# 10. Input Signal Collection

Create a unified signal collector.

Input:

```ts
interface RecommendationInput {
  atsResult: ATSAnalysisResult;

  skillProfile: ResumeSkillProfile;

  roleProfile?: RoleProfile;

  jobRequirements?: JobRequirementProfile;

  matchResult?: ResumeJobMatchResult;

  contentResult?: ResumeContentAnalysisResult;

  resumeEvidence?: ResumeEvidence[];

  resumeHash: string;
}
```

The collector converts existing intelligence into normalized recommendation signals.

Example:

```ts
interface RecommendationSignal {
  id: string;

  category: RecommendationCategory;

  type: string;

  severity: number;

  impact: number;

  relevance: number;

  actionability: RecommendationActionability;

  confidence: number;

  sourceIds: string[];

  evidenceIds: string[];

  requirementIds?: string[];

  skillIds?: string[];

  section?: string;

  metadata?: Record<string, unknown>;
}
```

Do not recalculate ATS, Match, Content, or Skill results here.

---

# 11. Signal Sources

Phase 6 may consume signals from:

## ATS

Examples:

```text
weak formatting
weak structure
keyword coverage
readability
brevity
```

## Skill Intelligence

Examples:

```text
weak skill evidence
important skill mentioned only once
skill detected with low confidence
```

## Role Benchmark

Examples:

```text
target role expects React
candidate has React
target role expects Docker
candidate does not have Docker evidence
```

## Job Matching

Examples:

```text
required skill NOT_DETECTED
required skill PARTIAL
preferred skill NOT_DETECTED
experience below requirement
education mismatch
```

## Content Intelligence

Examples:

```text
weak impact
generic bullet
low ownership
low specificity
missing measurable outcome
repetition
duplicate achievement
weak technical depth
```

---

# 12. Recommendation Eligibility

Not every signal should produce a recommendation.

Create deterministic eligibility rules.

Example:

```text
Strong evidence + strong match
→ no recommendation

Strong skill match + weak content evidence
→ recommendation

Required skill NOT_DETECTED
→ recommendation

Preferred skill NOT_DETECTED
→ lower-priority recommendation

Strong bullet + repeated verb
→ style signal only

Duplicate achievement
→ recommendation

Weak generic bullet
→ recommendation
```

Avoid recommendations for trivial issues.

---

# 13. Important Rule — Repetition

Phase 5 detects repeated verbs and phrases.

Do NOT allow repetition to dominate the recommendation system.

Example:

```text
Built...
Built...
Built...
Built...
```

If all bullets are otherwise strong:

```text
Content Score = strong
```

The system may produce:

```text
Medium/Low:
“Vary repeated action verbs for stronger writing variety.”
```

It must NOT produce:

```text
High priority:
“Your experience section is weak.”
```

Repetition is a style signal, not automatically a quality failure.

---

# 14. Recommendation Grouping

Multiple signals may represent the same underlying problem.

Example:

```text
React matched
React evidence weak
React technical depth low
React appears once
```

Do NOT produce:

```text
1. Improve React
2. Add React evidence
3. Add React technical depth
4. Mention React more
```

Group them into:

```text
Strengthen your React evidence in your strongest experience entry.
```

The recommendation stores all relevant source IDs.

---

# 15. Grouping Rules

Create deterministic grouping keys.

Example:

```ts
skill:<canonicalSkillId>
requirement:<requirementId>
section:<section>:impact
section:<section>:specificity
bullet:<bulletId>
```

Prefer canonical IDs over raw text.

Never group unrelated skills just because their names are similar.

---

# 16. Priority Calculation

Priority must be deterministic.

Suggested formula:

```text
priorityScore =
  impact
  × relevance
  × actionability
  × confidence
  × evidenceFactor
```

Normalize all values:

```text
0.0 → 1.0
```

Suggested weighting:

```text
Impact        30%
Relevance     25%
Actionability 20%
Confidence    15%
Evidence      10%
```

Alternative implementation:

```ts
priorityScore =
  impact * 0.30 +
  relevance * 0.25 +
  actionability * 0.20 +
  confidence * 0.15 +
  evidence * 0.10;
```

The exact constants must live in:

```text
recommendation.constants.ts
```

Do not scatter magic numbers.

---

# 17. Impact Classification

Create:

```ts
enum RecommendationImpact {
  VERY_HIGH = "VERY_HIGH",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}
```

Suggested logic:

### VERY_HIGH

Examples:

```text
required job skill missing
major role mismatch
critical evidence gap
major ATS issue blocking parsing
```

### HIGH

Examples:

```text
required skill only partially supported
strong candidate evidence poorly expressed
important experience lacks measurable impact
```

### MEDIUM

Examples:

```text
preferred skill gap
moderate content weakness
keyword refinement
section quality improvement
```

### LOW

Examples:

```text
style variation
minor wording issue
small repetition issue
```

---

# 18. Relevance Calculation

Relevance should depend on context.

Priority order:

```text
Specific JD requirement
↓
Target role requirement
↓
Resume quality issue
↓
General style issue
```

A missing required JD skill should generally outrank a generic style recommendation.

Example:

```text
Required: Docker
Candidate: NOT_DETECTED

vs.

Repeated action verb: Built
```

Docker gap should rank higher.

---

# 19. Actionability Score

Suggested values:

```text
FIX_NOW                = 1.00
STRENGTHEN_EVIDENCE    = 0.85
REQUIRES_NEW_EVIDENCE  = 0.65
INFORMATIONAL          = 0.30
```

Why?

A candidate can immediately improve existing evidence.

A missing skill may require actual experience before it can truthfully be added.

---

# 20. Candidate Safety

This is mandatory.

The recommendation engine must distinguish:

```text
NOT_DETECTED
```

from:

```text
DOES NOT KNOW
```

Never output:

```text
“You don't know AWS.”
```

Use:

```text
“AWS is not currently detected in the resume.”
```

Or:

```text
“If you have AWS experience, consider adding a concrete example.”
```

---

# 21. Metric Safety

Never invent:

```text
percentages
revenue
users
team sizes
latency
performance gains
scale
time savings
cost reductions
```

Bad:

```text
Add that you reduced API latency by 30%.
```

Good:

```text
If you have a measured latency improvement, consider adding it.
```

Recommendations may suggest **where evidence would improve the bullet**, but never manufacture the evidence.

---

# 22. Experience Safety

Do not create numeric experience claims from vague text.

Bad:

```text
You have 5 years of backend experience.
```

unless deterministic experience calculation supports it.

Do not convert:

```text
Experienced backend developer
```

into:

```text
5 years experience
```

---

# 23. Recommendation Explanation Layer

AI may be used to convert deterministic recommendation objects into natural language.

Input to AI:

```ts
{
  recommendation,
  supportingEvidence,
  requirementContext,
  roleContext,
  safeCandidateContext
}
```

AI output:

```ts
interface AIRecommendationExplanation {
  explanation: string;
  suggestedAction: string;
  confidence: number;
}
```

AI must not output:

```text
score changes
new skills
new metrics
new achievements
new experience
```

---

# 24. AI Output Validation

Create Zod schema.

Example:

```ts
const AIRecommendationExplanationSchema = z.object({
  explanation: z.string().min(1).max(1000),
  suggestedAction: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
});
```

Reject invalid output.

Fallback:

```text
deterministic explanation
+
deterministic suggested action
```

The product must remain functional if AI fails.

---

# 25. AI Prompt Safety

The prompt must explicitly state:

```text
You are explaining a deterministic recommendation.

Do not invent candidate facts.

Do not invent metrics.

Do not invent skills.

Do not invent years of experience.

Do not change any score.

Do not change recommendation priority.

Do not claim NOT_DETECTED means the candidate lacks the skill.

Only use facts supplied in the context.
```

---

# 26. Recommendation Limits

Avoid recommendation overload.

Suggested limits:

```text
Top 5 recommendations
```

Optional:

```text
Top 3 priority actions
Top 5 recommendations
Additional observations
```

The backend should determine ordering.

The frontend must not independently rank recommendations.

---

# 27. Recommendation Ordering

Sort deterministically:

```text
priorityScore DESC
impact DESC
relevance DESC
confidence DESC
id ASC
```

The final tie-breaker must be deterministic.

Do not use random ordering.

---

# 28. Recommendation Status

Create:

```ts
enum RecommendationStatus {
  OPEN = "OPEN",
  ADDRESSED = "ADDRESSED",
  DISMISSED = "DISMISSED",
}
```

For Phase 6, status can initially default to:

```text
OPEN
```

Do not build complex persistence workflows unless already supported by the architecture.

Phase 7 may use recommendation IDs to track which optimization actions were applied.

---

# 29. Recommendation Output

Create:

```ts
interface ResumeRecommendationResult {
  engineVersion: string;

  generatedAt: string;

  recommendations: ResumeRecommendation[];

  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  topAction?: ResumeRecommendation;

  sourceScores: {
    atsScore: number;
    matchScore?: number;
    contentScore?: number;
  };
}
```

The source scores are references only.

Phase 6 must NOT modify them.

---

# 30. Score Ownership

Authoritative ownership remains:

```text
ATS Score
→ ATS engine

Match Score
→ Matching engine

Content Score
→ Content engine

Skill detection
→ Skill engine

Recommendation Priority
→ Recommendation engine
```

AI owns:

```text
language
explanation
phrasing
```

AI does NOT own:

```text
scores
facts
evidence
priority
matching
skill detection
```

---

# 31. Recommendation Examples

## Example 1 — Required Skill Missing

Input:

```text
JD requirement:
Docker — REQUIRED

Resume:
Docker — NOT_DETECTED
```

Recommendation:

```text
Title:
Address the Docker requirement

Priority:
HIGH

Impact:
HIGH

Actionability:
REQUIRES_NEW_EVIDENCE

Suggested action:
If you have genuine Docker experience, add a concrete example from your work or projects.
```

---

# 32. Example 2 — Skill Matched but Weak Evidence

Input:

```text
React — MATCHED

Evidence:
“Worked with React.”
```

Recommendation:

```text
Title:
Strengthen your React evidence

Priority:
HIGH

Actionability:
STRENGTHEN_EVIDENCE
```

Suggested action:

```text
Describe what you built with React and the technical responsibility you owned.
```

No invented metric.

---

# 33. Example 3 — Strong Evidence but Weak Impact

Input:

```text
“Architected reusable React component library used by 5 teams,
reducing duplicate UI code by 35%.”
```

This is strong evidence.

Do NOT recommend:

```text
Add more React.
```

Potential recommendation:

```text
No recommendation.
```

---

# 34. Example 4 — Generic Bullet

Input:

```text
“Worked on backend development and APIs.”
```

Recommendation:

```text
Make backend contributions more specific
```

Suggested action:

```text
Clarify the API work you owned, the technologies involved,
and the outcome when measurable evidence exists.
```

---

# 35. Example 5 — Missing Metric

Input:

```text
“Improved application performance.”
```

Recommendation:

```text
Strengthen the performance claim with measurable evidence
```

Suggested action:

```text
If you have a measured improvement, include the actual metric
and describe what changed.
```

Never:

```text
“Add 30% performance improvement.”
```

---

# 36. Example 6 — Repetition

Input:

```text
Built...
Built...
Built...
Built...
```

If bullets are otherwise strong:

```text
Priority: LOW / MEDIUM
```

Recommendation:

```text
Vary repeated action verbs
```

Do not reduce Content Score simply because the same strong verb appears multiple times.

---

# 37. Recommendation Deduplication

Before ranking:

```text
collect signals
↓
normalize
↓
group
↓
merge evidence
↓
calculate priority
↓
generate deterministic recommendation
↓
AI explanation
↓
validate
↓
sort
↓
limit
```

This pipeline must be centralized.

No frontend recommendation ranking.

No AI recommendation ranking.

No duplicate recommendation generation in ATS/Skill/Match/Content modules.

---

# 38. Service API

Create:

```ts
RecommendationService.generate(...)
```

Suggested input:

```ts
{
  atsResult,
  skillProfile,
  roleProfile,
  jobRequirements,
  matchResult,
  contentResult,
  resumeEvidence,
  resumeHash
}
```

Output:

```ts
ResumeRecommendationResult
```

---

# 39. Integration With AI Context

Update:

```text
server/src/core/ai/ai.context.ts
```

to include:

```ts
recommendationResult
```

The AI context should expose:

```text
ATS
Skills
Role
JD
Match
Content
Recommendations
```

But recommendation data remains deterministic.

AI uses it for explanation.

---

# 40. Hash / Cache Versioning

Create:

```ts
RECOMMENDATION_ENGINE_VERSION = "1.0.0";
```

Include in the AI/context hash.

Recommended hash inputs:

```text
resumeHash
roleId
normalizedJdHash
ATS_ENGINE_VERSION
SKILL_ENGINE_VERSION
ROLE_ENGINE_VERSION
JD_ENGINE_VERSION
MATCH_ENGINE_VERSION
CONTENT_ENGINE_VERSION
RECOMMENDATION_ENGINE_VERSION
```

Any recommendation logic change must invalidate old cached results.

---

# 41. Cache Safety

Do not cache recommendations across:

```text
different resumes
different JD text
different target roles
different engine versions
```

The cache key must remain deterministic.

---

# 42. API Integration

Expose recommendation data through the existing resume intelligence flow.

Preferred:

```text
GET /api/resume/intelligence
```

or extend the existing analysis endpoint rather than creating unnecessary duplicate endpoints.

Response should include:

```json
{
  "scores": {
    "ats": 82,
    "match": 74,
    "content": 68
  },
  "recommendations": {
    "topAction": {},
    "items": []
  }
}
```

Do not let frontend calculate priority.

---

# 43. Frontend

Update the existing:

```text
AIRecommendations.tsx
```

Do not create a second recommendation UI unless necessary.

Recommended UI:

```text
AI Recommendations

1. HIGH
   Strengthen measurable impact
   Experience section

   Why this matters:
   Several important bullets describe responsibilities
   without measurable outcomes.

   Action:
   Add genuine measurable results where available.

2. HIGH
   Strengthen React evidence

3. MEDIUM
   Address Docker requirement

4. MEDIUM
   Improve keyword alignment

5. LOW
   Vary repeated action verbs
```

---

# 44. UI Rules

Each recommendation should display:

```text
Priority
Title
Why
Action
Affected section
Optional requirement/skill
```

Do NOT show:

```text
internal source IDs
engine internals
raw hashes
AI prompt details
```

Evidence IDs can remain backend/debug information.

---

# 45. Recommendation Language

Use constructive language.

Avoid:

```text
Your resume is bad.
You don't know Docker.
Your experience is weak.
You failed this requirement.
```

Prefer:

```text
Docker is not currently detected in the resume.
This requirement may be worth addressing if you have genuine experience.

Your existing React evidence could be more specific.

Several experience bullets could communicate measurable impact more clearly.
```

---

# 46. Recommendation Priority Examples

Suggested deterministic ordering:

```text
1. Required JD skill NOT_DETECTED
2. Required JD skill PARTIAL
3. Important matched skill with weak evidence
4. Major content/impact weakness in relevant section
5. Experience requirement gap
6. Education/certification requirement gap
7. ATS parsing/structure issue
8. Preferred skill gap
9. Keyword refinement
10. Style/repetition improvements
```

This is guidance, not a hard-coded final ranking.

The priority engine must use normalized scoring.

---

# 47. No “Fix Everything” Recommendation

Never generate:

```text
Fix your resume.
Improve your ATS.
Improve your content.
Add more keywords.
```

These are too broad.

Every recommendation must have:

```text
specific problem
specific reason
specific next action
```

---

# 48. Evidence Traceability

Every recommendation must answer internally:

```text
Why was this created?
```

Required:

```text
sourceIds
evidenceIds
```

Example:

```ts
{
  category: "CONTENT",
  sourceIds: [
    "content_bullet_4",
    "content_bullet_7"
  ],
  evidenceIds: [
    "resume_evidence_12"
  ]
}
```

If no evidence exists, recommendation must be informational or based on an explicit deterministic requirement gap.

---

# 49. Requirement Traceability

For JD-related recommendations:

```ts
requirementIds
```

must reference the normalized requirement object from Phase 3/4.

Do not create a second JD requirement representation.

---

# 50. Skill Traceability

For skill recommendations:

```ts
skillIds
```

must reference canonical Phase 2 skill IDs.

Do not create another skill taxonomy.

---

# 51. Candidate vs Requirement Separation

Maintain:

```text
Candidate Evidence
Role Benchmark
JD Requirement
Recommendation
```

as separate concepts.

Example:

```text
Candidate:
React detected

JD:
React required

Match:
MATCHED

Recommendation:
Improve React evidence
```

Do not collapse them into:

```text
Candidate must know React.
```

---

# 52. AI Failure Handling

If AI provider fails:

```text
Use deterministic recommendation.title
Use deterministic recommendation.summary
Use deterministic suggestedAction
```

Never return an empty recommendation experience because AI failed.

---

# 53. AI Hallucination Audit

Add tests where AI attempts to:

```text
invent a metric
invent a skill
invent years
invent team size
invent achievement
change priority
change score
claim missing skill means lack of ability
```

Expected:

```text
validation failure
→ deterministic fallback
```

---

# 54. Testing

Minimum backend coverage:

## Recommendation signal tests

```text
ATS issue → signal
skill gap → signal
match gap → signal
content gap → signal
```

## Grouping tests

```text
same skill signals → one recommendation
same bullet signals → one recommendation
different skills → separate recommendations
```

## Priority tests

```text
required missing skill > style issue
high-impact issue > low-impact issue
high relevance > low relevance
```

## Actionability tests

```text
existing evidence → FIX_NOW/STRENGTHEN_EVIDENCE
missing skill → REQUIRES_NEW_EVIDENCE
style observation → INFORMATIONAL/FIX_NOW
```

---

# 55. Score Ownership Tests

Add regression tests proving:

```text
Recommendation generation does not change ATS score.
Recommendation generation does not change Match score.
Recommendation generation does not change Content score.
```

Example:

```ts
const before = {
  ats: 82,
  match: 74,
  content: 68,
};

generateRecommendations(...);

expect(after).toEqual(before);
```

---

# 56. Evidence Tests

Verify every actionable recommendation has:

```text
sourceIds OR requirementIds
```

and, where candidate evidence is involved:

```text
evidenceIds
```

No unsupported factual recommendations.

---

# 57. Duplicate Recommendation Tests

Example input:

```text
React weak evidence
React low technical depth
React low specificity
React mentioned once
```

Expected:

```text
1 recommendation
```

not:

```text
4 recommendations
```

---

# 58. Missing Skill Safety Tests

Input:

```text
Docker NOT_DETECTED
```

Expected:

```text
“AWS/Docker is not currently detected...”
```

Not:

```text
“You don't know Docker.”
```

---

# 59. Metric Safety Tests

Input:

```text
“Improved performance.”
```

AI attempts:

```text
“Improved performance by 30%.”
```

Expected:

```text
reject AI output
fallback to deterministic language
```

---

# 60. Experience-Year Regression Test

Retain and verify the Phase 4 audit:

```text
2020–2023
2022–2025
```

must not become:

```text
6 years
```

The experience matcher must merge overlapping periods.

Also verify:

```text
“Experienced backend developer”
```

does not become numeric experience.

Phase 6 must not bypass or replace the Phase 4 experience calculation.

---

# 61. End-to-End Test

Create an end-to-end scenario:

```text
Resume
+
Target Role
+
JD
```

Expected flow:

```text
ATS
↓
Skills
↓
Role
↓
JD
↓
Match
↓
Content
↓
Recommendations
↓
AI Explanation
```

Verify:

- deterministic scores remain unchanged
- recommendations are ranked
- duplicates are grouped
- evidence is traceable
- missing skills are safely phrased
- AI cannot fabricate facts
- output is stable

---

# 62. Performance

Recommendation generation should be lightweight.

Avoid:

```text
AI call per recommendation
```

Preferred:

```text
deterministic recommendations
↓
one batched AI explanation request
```

or deterministic explanations if AI is unavailable.

Do not repeatedly parse the resume.

Reuse:

```text
ResumeAIContext
SkillProfile
MatchResult
ContentResult
```

---

# 63. Security

Ensure:

- candidate resume data is scoped to the authenticated user
- JD data cannot leak across users
- recommendation cache keys cannot collide
- raw resume text is not unnecessarily logged
- AI prompts do not expose unrelated candidate data
- debug logs do not contain sensitive resume content

---

# 64. Observability

Recommended internal metadata:

```text
recommendationEngineVersion
signalCount
groupedSignalCount
finalRecommendationCount
aiExplanationUsed
aiFallbackUsed
```

Do not log:

```text
full resume text
private candidate data
full JD text
```

---

# 65. Files to Create

Recommended:

```text
server/src/modules/recommendation-intelligence/
├── recommendation.types.ts
├── recommendation.constants.ts
├── recommendation.signals.ts
├── recommendation.grouping.ts
├── recommendation.priority.ts
├── recommendation.validator.ts
├── recommendation.ai.ts
├── recommendation.service.ts
└── index.ts
```

Update:

```text
server/src/core/ai/ai.types.ts
server/src/core/ai/ai.context.ts
server/src/core/ai/ai.service.ts
```

and the existing resume intelligence route/service.

Frontend:

```text
client/.../AIRecommendations.tsx
```

Reuse existing component where possible.

---

# 66. Do Not Duplicate Existing Engines

Phase 6 must NOT recreate:

```text
skill detection
JD extraction
role normalization
match scoring
content scoring
ATS scoring
experience calculation
```

Use their outputs.

If a missing capability is discovered, fix it in the owning phase/module instead of duplicating it in Phase 6.

---

# 67. Definition of Done

Phase 6 is complete only when:

### Architecture

- [ ] Recommendation module exists
- [ ] Deterministic priority engine exists
- [ ] Recommendation grouping exists
- [ ] Recommendation model is canonical
- [ ] No duplicate scoring engines exist

### Intelligence

- [ ] ATS signals integrated
- [ ] Skill signals integrated
- [ ] Role signals integrated
- [ ] JD signals integrated
- [ ] Match signals integrated
- [ ] Content signals integrated
- [ ] Evidence strength integrated
- [ ] Recommendations are actionable

### Safety

- [ ] No metric fabrication
- [ ] No skill fabrication
- [ ] No experience fabrication
- [ ] NOT_DETECTED ≠ DOES_NOT_KNOW
- [ ] AI cannot modify scores
- [ ] AI cannot modify priority
- [ ] AI cannot invent facts

### Ranking

- [ ] Signals are grouped
- [ ] Duplicates are removed
- [ ] Priority is deterministic
- [ ] Top recommendations are limited
- [ ] Ordering is stable

### Traceability

- [ ] Source IDs retained
- [ ] Evidence IDs retained
- [ ] Requirement IDs retained
- [ ] Skill IDs retained

### AI

- [ ] Zod validation
- [ ] Safe prompt
- [ ] Fallback
- [ ] Hallucination tests

### Regression

- [ ] Experience overlap test passes
- [ ] ATS score ownership test passes
- [ ] Match score ownership test passes
- [ ] Content score ownership test passes
- [ ] Phase 1–5 tests still pass
- [ ] Frontend TypeScript passes

---

# 68. FINAL PHASE 6 AUDIT — REQUIRED BEFORE PHASE 7

Do not start Phase 7 until this audit passes.

## Audit 1 — Recommendation Authority

Verify:

```text
Recommendation Engine
→ owns recommendation priority

AI
→ explains only
```

No AI-generated priority.

---

## Audit 2 — Score Authority

Verify exactly one owner for:

```text
ATS Score
Match Score
Content Score
```

Phase 6 must not recalculate or mutate any of them.

---

## Audit 3 — Evidence Authority

Verify:

```text
Candidate evidence
≠
Role requirement
≠
JD requirement
≠
Recommendation
```

---

## Audit 4 — Skill Authority

Verify Phase 2 remains the single canonical skill taxonomy.

No duplicate skill lists in Phase 6.

---

## Audit 5 — Recommendation Explosion

Use a resume containing:

```text
weak React evidence
weak specificity
weak technical depth
React mentioned once
generic bullet
low impact
```

Expected:

```text
small number of grouped recommendations
```

not six separate React recommendations.

---

## Audit 6 — Metric Fabrication

Use:

```text
“Improved performance.”
```

Ensure the system never produces:

```text
“Improved performance by 20%.”
```

unless the 20% exists in candidate evidence.

---

## Audit 7 — Missing Skill Safety

Use:

```text
Docker NOT_DETECTED
```

Ensure output says:

```text
Docker is not currently detected.
```

and not:

```text
You don't know Docker.
```

---

## Audit 8 — Strong Resume Protection

Use strong evidence:

```text
Architected reusable React component library used by 5 teams,
reducing duplicate UI code by 35%.
```

Ensure the engine does not recommend unnecessary rewriting simply because a generic content heuristic exists.

---

## Audit 9 — Repetition Signal

Use four strong bullets beginning with:

```text
Built
Built
Built
Built
```

Ensure repetition remains a style recommendation and does not disproportionately reduce Content Score or create a HIGH priority recommendation.

---

## Audit 10 — Experience Safety

Verify Phase 4 overlap handling remains intact.

```text
2020–2023
2022–2025
```

must not produce six years.

---

## Audit 11 — Determinism

Run the same input multiple times.

Expected:

```text
same recommendations
same priority scores
same ordering
same IDs where applicable
```

AI wording may vary only if explicitly allowed, but deterministic recommendation metadata must remain stable.

---

## Audit 12 — Full Regression

Run:

```text
all backend tests
frontend TypeScript
lint
build
```

Expected:

```text
PASS
```

No Phase 1–5 regression is acceptable.

---

# 69. Phase 6 Boundary

At the end of Phase 6:

```text
Resume
  ↓
ATS
  ↓
Skills
  ↓
Role
  ↓
JD
  ↓
Match
  ↓
Content
  ↓
Recommendations
  ↓
AI Explanation
```

The user can now see:

```text
What is wrong?
↓
Why does it matter?
↓
What should I improve first?
```

But the system still does NOT automatically modify the resume.

That is Phase 7.

---

# 70. Phase 7 Dependency

Phase 7 will consume:

```ts
ResumeRecommendation[]
```

and use recommendation IDs to decide:

```text
what should be optimized
```

Phase 7 will introduce:

- AI resume optimization
- bullet rewriting
- safe content improvements
- controlled keyword optimization
- re-scoring after modifications
- before/after comparison
- deterministic validation

Therefore Phase 6 must keep recommendations structured, traceable, and machine-readable.

---

# FINAL ARCHITECTURE

```text
                    ┌────────────────────┐
                    │      RESUME        │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │  Resume Parser     │
                    └─────────┬──────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   ATS Engine           Skill Engine          Content Engine
        │                     │                     │
        │                     ↓                     │
        │               Role / JD Engine            │
        │                     │                     │
        │                     ↓                     │
        └──────────────→ Match Engine ←────────────┘
                              │
                              ↓
                  ┌────────────────────────┐
                  │ Recommendation Engine  │
                  │                        │
                  │ Signal Collection      │
                  │ Grouping               │
                  │ Priority               │
                  │ Actionability          │
                  │ Evidence               │
                  └────────────┬───────────┘
                               ↓
                    ┌────────────────────┐
                    │ AI Explanation     │
                    │                    │
                    │ Explain only       │
                    │ No facts invented  │
                    │ No score changes   │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │ Recommendation UI  │
                    └─────────┬──────────┘
                              ↓
                       Phase 7 Optimizer
```

# CORE PRINCIPLE

> **Phase 6 does not try to make the resume better automatically. It determines, using deterministic evidence and scoring, which improvements matter most, why they matter, and what truthful action the candidate can take next. AI makes those recommendations understandable — it does not make them authoritative.**
