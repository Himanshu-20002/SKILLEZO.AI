# SKILLEZO AI — Phase 5 Implementation Plan
## Impact + Content Intelligence

**Project:** Skillezo AI — Resume Intelligence  
**Phase:** 5  
**Depends on:** Phase 1 — AI Intelligence Foundation, Phase 2 — Evidence & Skill Intelligence, Phase 3 — Role Benchmark + Optional Job Description Intelligence, Phase 4 — Resume ↔ Job Matching Intelligence  
**Status:** Implementation Plan

---

# 1. Phase 5 Objective

Build the deterministic **Resume Impact + Content Intelligence Engine**.

Phase 4 answers:

> **How well does the candidate's verified evidence satisfy the role/JD requirements?**

Phase 5 answers:

> **How strong, specific, credible, and impactful is the candidate's actual resume content?**

The system should evaluate the quality of resume content without rewriting it yet.

The architecture becomes:

```text
Phase 1
AI Foundation
        ↓
Phase 2
Candidate Evidence + Skill Intelligence
        ↓
Phase 3
Role Benchmark + Optional JD Intelligence
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

Phase 5 is an **analysis layer**, not a resume editing layer.

---

# 2. Core Architectural Rule

Continue the project's primary rule:

> **Deterministic systems calculate content signals, evidence strength, measurable-impact signals, quality classifications, and authoritative scores. AI explains, prioritizes, and communicates those results.**

AI must never:

- invent metrics
- invent percentages
- invent performance improvements
- invent team sizes
- invent revenue
- invent users
- invent technologies
- invent project scope
- invent responsibilities
- invent outcomes
- change authoritative deterministic scores

AI may:

- explain why a bullet is weak
- identify ambiguity
- suggest what type of evidence is missing
- explain how an existing metric strengthens a bullet
- prioritize content improvements
- propose wording only in later optimization phases

---

# 3. Phase 5 Scope

## In Scope

### Bullet Intelligence

- bullet extraction
- bullet classification
- action/ownership detection
- technology/context detection
- outcome detection
- measurable-impact detection
- specificity detection
- responsibility vs achievement classification
- evidence strength
- bullet quality signals

### Impact Intelligence

- metric detection
- metric type classification
- metric evidence validation
- outcome detection
- business/technical impact detection
- scope detection
- performance-impact signals
- measurable achievement signals

### Content Quality

- generic language detection
- weak action verb detection
- vague claim detection
- responsibility-heavy language
- repetition detection
- keyword stuffing signals
- overly long bullet signals
- overly short/incomplete bullet signals
- specificity scoring

### Section Intelligence

- experience content quality
- project content quality
- summary quality
- skills section quality
- education/certification content checks where applicable

### Role/JD Context

- content relevance to target role
- content support for matched requirements
- content support for high-priority gaps
- evidence strength for important requirements

### AI Explanation

- human-readable explanations
- prioritized content observations
- evidence-grounded improvement guidance

---

# 4. Explicitly Out of Scope

Do NOT implement:

## Automatic Resume Rewriting

Do not:

- rewrite bullets automatically
- replace bullet text
- rewrite summary
- rewrite experience
- rewrite projects
- insert metrics
- invent missing achievements

This belongs to Phase 7.

## Resume Editor

Do not build:

- document editor
- drag-and-drop sections
- inline resume editing
- final PDF generation workflow

This belongs to later phases.

## Final Recommendation Orchestration

Do not build the complete recommendation prioritization engine.

That belongs to Phase 6.

## AI-Generated Metrics

Never generate:

```text
"increased performance by 40%"
```

unless `40%` is supported by candidate evidence.

---

# 5. Key Concept: Evidence Strength

Phase 5 introduces:

> **Evidence Strength**

This is different from:

```text
Skill Match
```

and:

```text
ATS Score
```

and:

```text
Job Match Score
```

Example:

```text
Bullet A:
"Worked on React applications."

Evidence Strength:
LOW
```

```text
Bullet B:
"Built reusable React components used across 5 internal applications."

Evidence Strength:
MEDIUM/HIGH
```

```text
Bullet C:
"Built reusable React components that reduced duplicate UI code by 35% across 5 applications."

Evidence Strength:
HIGH
```

The system evaluates what the resume actually demonstrates.

---

# 6. Bullet Data Model

Create a normalized bullet representation.

Suggested:

```ts
interface ResumeBullet {
  bulletId: string;

  section:
    | "EXPERIENCE"
    | "PROJECTS"
    | "SUMMARY"
    | "OTHER";

  sourceText: string;

  normalizedText: string;

  order: number;

  evidenceIds: string[];
}
```

Do not create a second resume parser.

Use the existing resume parser and extend its structured output where necessary.

---

# 7. Bullet Analysis Model

Create:

```ts
interface BulletContentAnalysis {
  bulletId: string;

  actionScore: number;

  ownershipScore: number;

  specificityScore: number;

  outcomeScore: number;

  measurableImpactScore: number;

  technicalDepthScore: number;

  relevanceScore: number;

  evidenceStrengthScore: number;

  qualityScore: number;

  classification: BulletClassification[];

  signals: ContentSignal[];

  metricEvidence: MetricEvidence[];

  requirementLinks: string[];

  engineVersion: string;
}
```

Keep all authoritative scores deterministic.

---

# 8. Bullet Classification

Create controlled classifications.

Recommended:

```ts
type BulletClassification =
  | "ACHIEVEMENT"
  | "RESPONSIBILITY"
  | "IMPACT"
  | "TECHNICAL"
  | "METRIC"
  | "OWNERSHIP"
  | "GENERIC"
  | "VAGUE";
```

A bullet may have multiple classifications.

Example:

```text
"Reduced API latency by 42% by optimizing Node.js services."

→ ACHIEVEMENT
→ IMPACT
→ TECHNICAL
→ METRIC
```

---

# 9. Action Detection

Identify strong action-oriented language.

Examples:

```text
Built
Designed
Developed
Implemented
Optimized
Automated
Led
Architected
Reduced
Improved
Migrated
Launched
Delivered
Scaled
```

Avoid creating a simplistic rule where every bullet beginning with an action verb is automatically strong.

Action is only one component of quality.

---

# 10. Weak Action Detection

Detect weak or passive openings.

Examples:

```text
Worked on
Helped with
Responsible for
Involved in
Participated in
Assisted with
Handled
Used
Worked with
```

These should create signals, not automatically fail the bullet.

Example:

```ts
{
  type: "WEAK_ACTION",
  severity: "MEDIUM"
}
```

---

# 11. Ownership Detection

Identify signals of ownership.

Examples:

```text
Led
Owned
Architected
Designed
Drove
Implemented
Built
Managed
Delivered
```

Also identify passive language:

```text
Assisted
Supported
Helped
Participated
```

Ownership should be treated as a signal, not a guarantee of seniority.

---

# 12. Specificity Detection

Evaluate whether a bullet answers:

```text
What?
How?
At what scope?
For whom/what?
With what result?
```

Weak:

```text
"Worked on backend development."
```

More specific:

```text
"Built Node.js REST APIs for the payments platform."
```

Strong:

```text
"Built Node.js REST APIs for the payments platform, reducing average transaction latency by 28%."
```

---

# 13. Outcome Detection

Detect outcome-oriented language.

Examples:

```text
reduced
increased
improved
accelerated
saved
generated
eliminated
automated
scaled
improved reliability
reduced errors
increased throughput
```

Outcome detection should remain deterministic where possible.

---

# 14. Metric Detection

Create deterministic metric extraction.

Recognize:

```text
42%
3x
2.5x
500+
10,000
$2M
25 ms
40 hours/week
30% reduction
```

Suggested model:

```ts
interface MetricEvidence {
  metricId: string;

  rawValue: string;

  metricType:
    | "PERCENTAGE"
    | "COUNT"
    | "CURRENCY"
    | "MULTIPLIER"
    | "TIME"
    | "RATE"
    | "SCALE"
    | "OTHER";

  sourceText: string;

  evidenceId: string;

  confidence: number;
}
```

---

# 15. Metric Safety

Metrics are high-risk because fabricated numbers damage resume credibility.

The engine must distinguish:

```text
Metric present
```

from:

```text
Metric credible / supported
```

Phase 5 may validate whether a metric is syntactically present and connected to an outcome.

It must NOT invent a missing value.

Example:

```text
"Improved performance significantly."

→ No metric
```

Do NOT transform into:

```text
"Improved performance by 30%."
```

---

# 16. Metric Context Validation

A metric should ideally be connected to:

```text
Action
+
Object
+
Metric
+
Outcome
```

Example:

```text
"Reduced API latency by 35%."
```

contains:

```text
Action: Reduced
Object: API latency
Metric: 35%
Outcome: lower latency
```

Compare:

```text
"Managed 35%."
```

The second metric has weak contextual meaning.

The engine should flag it for low metric context quality.

---

# 17. Metric Type Intelligence

Different metrics communicate different impact.

Examples:

### Performance

```text
latency
response time
throughput
CPU
memory
```

### Scale

```text
users
requests
transactions
records
services
applications
```

### Business

```text
revenue
conversion
retention
cost
savings
```

### Delivery

```text
hours saved
deployment frequency
release time
cycle time
```

Do not treat all metrics as equally strong.

---

# 18. Impact Classification

Create deterministic impact levels:

```ts
type ImpactLevel =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NONE";
```

Suggested interpretation:

### HIGH

Clear measurable outcome with meaningful scope.

### MEDIUM

Clear outcome or scope but limited measurement.

### LOW

Weak impact signal or vague outcome.

### NONE

No meaningful impact signal detected.

---

# 19. Scope Detection

Detect measurable scope.

Examples:

```text
5 applications
20-person team
1M users
500K records
100+ deployments
10 services
```

Scope strengthens credibility because it establishes magnitude.

Suggested:

```ts
interface ScopeEvidence {
  value: string;
  unit?: string;
  sourceText: string;
  confidence: number;
}
```

Do not infer scope from context without evidence.

---

# 20. Technical Depth

Detect technical specificity.

Example:

```text
"Worked on backend."

LOW
```

```text
"Built Node.js REST APIs with PostgreSQL."

MEDIUM
```

```text
"Designed Node.js REST APIs with PostgreSQL indexing and Redis caching to reduce p95 latency by 31%."

HIGH
```

Technical depth should consider:

```text
technology
architecture
implementation
optimization
tradeoff
scale
result
```

Avoid rewarding keyword density by itself.

---

# 21. Responsibility vs Achievement

This is a core Phase 5 capability.

Responsibility:

```text
"Developed REST APIs."
```

Achievement:

```text
"Developed REST APIs that reduced checkout failures by 24%."
```

The first is not bad.

The second provides stronger evidence of impact.

Classify rather than shame.

Preferred user wording:

```text
"Responsibility-focused"
```

rather than:

```text
"Bad bullet"
```

---

# 22. Generic Language Detection

Detect phrases such as:

```text
worked on
responsible for
helped with
participated in
various
multiple
several
dynamic
hardworking
team player
results-driven
```

These are signals, not automatic failures.

A bullet containing generic wording may still contain strong evidence.

---

# 23. Vague Claim Detection

Detect claims that lack measurable or concrete support.

Examples:

```text
"Improved system performance."
"Worked on scalable architecture."
"Helped improve reliability."
```

Possible signal:

```ts
{
  type: "VAGUE_OUTCOME",
  severity: "MEDIUM"
}
```

Do not fabricate the missing details.

---

# 24. Repetition Detection

Detect repeated:

- verbs
- technologies
- phrases
- accomplishments
- sentence structures

Example:

```text
Built...
Built...
Built...
Built...
```

This may indicate repetitive writing.

Do not penalize legitimate repeated technology mentions excessively.

---

# 25. Duplicate Achievement Detection

Detect potentially duplicated accomplishments.

Example:

```text
Experience:
"Reduced API latency by 30%."

Project:
"Reduced API response time by 30%."
```

Flag as:

```text
POSSIBLE_DUPLICATE_IMPACT
```

Do not automatically delete or modify content.

---

# 26. Keyword Stuffing Detection

Detect suspicious repeated skill mentions.

Example:

```text
React React React React React
```

or unnatural lists inside bullets.

Keyword presence alone should never increase content quality.

This is especially important because Phase 4 already handles normalized skill matching.

---

# 27. Bullet Length

Detect:

```text
too short
healthy
too long
```

Recommended starting thresholds:

```text
< 6 words → SHORT
6–35 words → NORMAL
> 35 words → LONG
```

Treat these as signals, not hard failures.

Do not optimize solely for word count.

---

# 28. Bullet Completeness

A strong technical bullet generally has some combination of:

```text
Action
+
Object
+
Context
+
Technology
+
Outcome
+
Metric
```

Not every bullet needs all six.

The engine should score evidence quality rather than enforce a rigid template.

---

# 29. Evidence Strength Formula

Create one deterministic evidence-strength calculation.

Example conceptual weighting:

```text
Action / Ownership       15%
Specificity              20%
Technical Context        15%
Outcome                  20%
Measurable Impact        20%
Scope                    10%
```

Weights must be centralized.

Do not allow AI to change them.

---

# 30. Content Quality Score

Create a deterministic:

```text
0–100
```

content quality score.

Example:

```text
Action        15%
Specificity   20%
Technical     15%
Outcome       20%
Metrics       20%
Scope         10%
```

The exact weights are configurable and versioned.

Do not make this another ATS score.

---

# 31. Section-Level Content Scores

Calculate separately:

```text
Experience Content
Project Content
Summary Content
```

Example:

```text
Experience:
84

Projects:
76

Summary:
61
```

This helps later recommendation orchestration.

---

# 32. Resume-Level Content Score

Create:

```text
contentScore
```

as a deterministic aggregate of section/bullet quality.

Do not simply average every bullet equally.

Recommended:

```text
Experience → highest weight
Projects → medium weight
Summary → lower weight
```

Centralize the weights.

---

# 33. Role Relevance

Phase 5 should use Phase 4 match information.

Example:

```text
Candidate bullet:
"Built React dashboards..."

Target role:
Frontend Engineer
```

This is highly relevant.

But:

```text
Candidate bullet:
"Managed office inventory..."
```

may have low relevance.

Relevance must not override content quality.

A highly relevant weak bullet remains weak content.

---

# 34. Requirement Evidence Mapping

Link strong bullets to Phase 4 requirements.

Example:

```text
Bullet:
"Built Node.js APIs..."

Requirement:
Node.js REQUIRED

→ requirementLinks = [skill_nodejs]
```

This lets later phases identify:

```text
Important requirement
+
weak supporting evidence
```

---

# 35. Match + Content Combined Insight

Phase 5 should make it possible to detect:

```text
Requirement:
React

Match:
MATCHED

Evidence:
Weak
```

This is different from:

```text
Requirement:
React

Match:
MATCHED

Evidence:
Strong
```

Both satisfy the requirement, but the second communicates the skill more convincingly.

This distinction will become important in Phase 6 and Phase 7.

---

# 36. High-Value Content Gap

Create a concept for:

```text
High-value content gap
```

Example:

```text
Candidate matches:
AWS

But supporting bullet:
"Worked with AWS."

Result:

MATCHED skill
+
LOW evidence strength
+
HIGH role relevance
```

This is a strong future optimization opportunity.

Do not rewrite it yet.

---

# 37. Content Signal Model

Suggested:

```ts
interface ContentSignal {
  signalId: string;

  type:
    | "WEAK_ACTION"
    | "VAGUE_OUTCOME"
    | "NO_METRIC"
    | "STRONG_METRIC"
    | "STRONG_SCOPE"
    | "RESPONSIBILITY_HEAVY"
    | "GENERIC_LANGUAGE"
    | "REPETITION"
    | "POSSIBLE_DUPLICATE"
    | "KEYWORD_STUFFING"
    | "LONG_BULLET"
    | "SHORT_BULLET"
    | "STRONG_IMPACT";

  severity:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  evidenceIds: string[];

  explanationCode: string;
}
```

---

# 38. Deterministic Signal Priority

Signals should have deterministic priority.

Example:

```text
HIGH:
- fabricated-looking metric pattern
- unsupported impact claim
- severe keyword stuffing
- duplicate achievement

MEDIUM:
- vague outcome
- responsibility-heavy bullet
- weak action
- excessive length

LOW:
- repeated verb
- minor generic phrasing
```

These are starting policies and should be centralized.

---

# 39. AI Explanation Layer

After deterministic analysis:

```text
Resume Content Engine
        ↓
Verified Signals
        ↓
AI Explanation
```

AI may explain:

```text
"This bullet establishes the technology used but does not
show the outcome of the work."
```

AI may recommend evidence categories:

```text
Consider adding a measurable result if you have one,
such as latency reduction, scale, cost savings, or delivery impact.
```

This is safe because it does not invent the value.

---

# 40. AI Must Never Invent Missing Metrics

Bad:

```text
"Reduced API latency by 35%."
```

when the resume only says:

```text
"Improved API performance."
```

Good:

```text
"If you have a measured latency improvement, adding it would
make the impact more concrete."
```

The AI must ask for or suggest the category of evidence, not fabricate the value.

---

# 41. AI Explanation Contract

Suggested:

```ts
interface AIContentExplanation {
  summary: string;

  strengths: AIContentInsight[];

  opportunities: AIContentInsight[];

  evidenceRequests: AIContentInsight[];
}
```

Each insight should reference:

```text
bulletId
signalId
```

where applicable.

AI must not reference unknown bullets.

---

# 42. AI Guardrails

Use the Phase 1 guardrails.

AI output must be rejected if it:

- invents a metric
- invents a technology
- invents a result
- invents a project
- invents candidate experience
- changes deterministic content score
- claims unsupported ownership

---

# 43. Metric Evidence Guardrail

For every AI-generated statement containing:

```text
%
x
$
number
time
count
```

validate that the value exists in candidate evidence.

If not:

```text
reject
```

or rewrite to a non-numeric suggestion.

---

# 44. Content Score Separation

Maintain:

```text
ATS Score
```

```text
Job Match Score
```

```text
Content Quality Score
```

These answer different questions.

### ATS Score

Resume parsing/format/ATS compatibility.

### Match Score

Alignment with role/JD requirements.

### Content Quality Score

Strength and evidence quality of the actual resume writing.

Never merge these into one hidden score.

---

# 45. No Score Mutation

AI cannot change:

```text
contentScore
```

If deterministic engine returns:

```text
72
```

AI cannot return:

```text
88
```

The final authoritative score remains:

```text
72
```

---

# 46. Content Score Labels

Suggested:

```text
90–100 → Excellent Content
75–89  → Strong Content
60–74  → Moderate Content
40–59  → Needs Improvement
0–39   → Weak Content
```

Centralize thresholds.

Version them with the content engine.

---

# 47. Content Engine Version

Create:

```ts
CONTENT_ENGINE_VERSION = "1.0.0";
```

Use it in:

- analysis hash
- cache key
- response metadata
- regression tests

---

# 48. Hashing and Caching

Extend the existing analysis hash.

Conceptually:

```text
analysisHash =
SHA256(
  resumeHash +
  roleVersion +
  jdHash +
  skillEngineVersion +
  atsEngineVersion +
  matchEngineVersion +
  contentEngineVersion
)
```

If content analysis does not depend on JD for a particular sub-analysis, the system may reuse lower-level caches.

Do not duplicate expensive processing.

---

# 49. API Integration

Extend the analysis response:

```ts
{
  ats: {...},

  skillsProfile: {...},

  roleProfile: {...},

  jobRequirements: {...} | null,

  match: {...},

  content: {
    score: number,
    label: string,
    sections: {...},
    bullets: [...],
    signals: [...],
    metrics: [...],
    impact: {...}
  },

  ai: {
    ...
  }
}
```

Keep the existing contracts backward compatible.

---

# 50. Frontend Content Intelligence

Add a dedicated:

```text
Content Intelligence
```

section.

Example:

```text
Content Quality
82 / 100
Strong Content

Impact
████████░░ 78

Specificity
█████████░ 86

Technical Depth
████████░░ 81

Measurable Results
██████░░░░ 61
```

Then:

```text
Content Opportunities

• 4 bullets are responsibility-focused
• 3 bullets contain outcomes without measurements
• 2 bullets have strong measurable impact
```

Use supportive wording.

---

# 51. Bullet-Level UI

Example:

```text
Built Node.js REST APIs for internal services.

Technical Depth      High
Specificity          Medium
Impact               Low
Evidence Strength    Medium

Opportunity:
The bullet establishes what you built, but the outcome
is not currently visible.
```

Do not automatically rewrite the bullet in Phase 5.

---

# 52. Metric UI

Example:

```text
Strong Metrics Detected

42% latency reduction
5 applications
1M+ records processed
30 hours/week saved
```

Every metric should be traceable to source text.

Do not display AI-created metrics.

---

# 53. Impact Summary

Generate deterministic counts:

```text
Bullets analyzed: 24
Impact bullets: 9
Metric-backed bullets: 6
Responsibility-focused bullets: 8
Vague bullets: 4
High-evidence bullets: 10
```

AI may explain these numbers but must not calculate them.

---

# 54. Role-Aware Content Insights

Use Phase 4 results to prioritize relevant content.

Example:

```text
Required:
AWS

Match:
MATCHED

Evidence Strength:
LOW

Insight:
AWS is present, but the resume does not strongly
demonstrate what was accomplished with it.
```

This is a high-value Phase 5 result.

---

# 55. JD-Aware Content Insights

If JD exists:

```text
JD Requirement:
Scalable APIs

Candidate Match:
MATCHED

Supporting Content:
Weak

Insight:
The resume demonstrates API development but provides
limited evidence of scale.
```

Do not invent scale.

---

# 56. Content vs Match Matrix

Create internal support for:

```text
                 Strong Content    Weak Content
Matched          Strong Position   Optimization Opportunity

Not Detected     Gap               Gap
```

Example:

```text
React:
Matched + Strong Content
```

```text
AWS:
Matched + Weak Content
```

```text
GraphQL:
Not Detected
```

This matrix becomes extremely useful for Phase 6.

---

# 57. Content Recommendation Inputs

Phase 5 should output structured opportunity data for Phase 6.

Example:

```ts
interface ContentOpportunity {
  opportunityId: string;

  type:
    | "ADD_MEASURABLE_IMPACT"
    | "STRENGTHEN_OUTCOME"
    | "INCREASE_SPECIFICITY"
    | "SHOW_OWNERSHIP"
    | "REDUCE_GENERIC_LANGUAGE"
    | "REDUCE_REPETITION"
    | "STRENGTHEN_TECHNICAL_DEPTH";

  priorityFactors: {
    roleRelevance: number;
    matchImportance: number;
    evidenceStrength: number;
    contentQuality: number;
  };

  bulletIds: string[];

  requirementIds: string[];

  signalIds: string[];
}
```

Do not create the final recommendation priority yet.

---

# 58. No Duplicate Scoring Logic

Phase 5 must not recreate:

```text
Skill Match
```

or:

```text
Role Match
```

or:

```text
ATS Score
```

It consumes Phase 2 and Phase 4 outputs.

Its responsibility is:

```text
Content Quality
+
Impact
+
Evidence Strength
```

---

# 59. Performance

Avoid repeatedly analyzing the same bullet.

Suggested flow:

```text
Parse Resume
      ↓
Extract Bullets
      ↓
Analyze Each Bullet Once
      ↓
Aggregate Section Scores
      ↓
Aggregate Resume Score
      ↓
Map to Requirements
```

Cache deterministic bullet analysis where useful.

---

# 60. Privacy

Do not log:

- full resume text
- raw bullet text
- personal information
- AI prompts containing candidate content

Use operational metadata:

```text
resumeHash
bulletCount
contentEngineVersion
cacheHit
latency
```

---

# 61. Error Handling

If content analysis fails:

```text
ATS analysis → available
Skill analysis → available
Match analysis → available
Content analysis → unavailable
```

Do not fabricate a content score.

---

# 62. Testing Strategy

Create:

```text
content-intelligence.spec.ts
```

Minimum test areas:

## Bullet extraction

- experience bullets
- project bullets
- summary
- multiline bullets
- bullets with punctuation
- bullets with metrics

## Action detection

```text
Built → strong
Worked on → weak signal
```

## Outcome detection

```text
Reduced latency → outcome
Developed feature → no explicit outcome
```

## Metric extraction

```text
42%
3x
$50K
1M+
25 ms
```

## Metric safety

Verify that extracted metrics always point to source text.

## Scope detection

```text
5 applications
1M users
20-person team
```

## Responsibility classification

```text
"Responsible for maintaining APIs."
→ RESPONSIBILITY
```

## Achievement classification

```text
"Reduced API latency by 30%."
→ ACHIEVEMENT + IMPACT + METRIC
```

## Generic language

Verify signals for:

```text
worked on
helped with
responsible for
```

## Repetition

Verify repeated verbs and phrases are detected.

## Long/short bullets

Verify threshold behavior.

---

# 63. Testing — Evidence Strength

Test:

```text
"Worked on React."
→ LOW
```

```text
"Built React dashboards for internal teams."
→ MEDIUM
```

```text
"Built React dashboards used by 5 teams, reducing reporting time by 35%."
→ HIGH
```

The exact numerical score may differ according to configured weights, but ordering should remain correct.

---

# 64. Testing — Metric Guardrails

Test:

```text
Resume:
"Improved performance."

AI:
"Improved performance by 40%."
```

Expected:

```text
AI claim rejected.
```

---

# 65. Testing — Score Integrity

Test:

```text
Deterministic Content Score:
72
```

AI:

```text
88
```

Expected:

```text
Final Content Score:
72
```

---

# 66. Testing — Match Integration

Test:

```text
Requirement:
React REQUIRED

Candidate:
React MATCHED

Supporting bullet:
"We worked on React."
```

Expected:

```text
Match:
MATCHED

Content Evidence:
LOW

Opportunity:
STRENGTHEN_TECHNICAL_DEPTH / IMPACT
```

---

# 67. Testing — JD Integration

Test:

```text
JD:
GraphQL REQUIRED

Resume:
No GraphQL evidence
```

Expected:

```text
Match:
NOT_DETECTED

Content:
No candidate GraphQL content should be created.
```

---

# 68. Testing — No Fabrication

AI must never introduce:

```text
new technology
new metric
new result
new project
new responsibility
```

unless supported by existing candidate evidence.

---

# 69. Regression Testing

Required baseline:

```text
Phase 1 tests: PASS
Phase 2 tests: PASS
Phase 3 tests: PASS
Phase 4 tests: PASS
Phase 5 tests: PASS
Frontend TypeScript: 0 errors
```

No regressions in:

- ATS scoring
- skill detection
- role normalization
- JD parsing
- match scoring
- AI guardrails

---

# 70. Phase 5 Audit — Required Before Moving to Phase 6

Before declaring Phase 5 complete, perform these specific audits.

## Audit 1 — Experience Year Calculation

Re-check Phase 4:

```text
2020–2023
+
2022–2025
```

must not become:

```text
6 years
```

Overlapping employment periods must not be double-counted.

Also verify that:

```text
"Experienced backend developer"
```

does not become a fabricated numeric duration.

---

## Audit 2 — Metric Fabrication

Search the entire AI/content pipeline for any path that can create a number not present in candidate evidence.

Check:

```text
AI prompts
AI schemas
guardrails
fallbacks
recommendations
frontend display
```

A generated suggestion must never silently become candidate fact.

---

## Audit 3 — Score Ownership

Verify there is exactly one authoritative implementation for each:

```text
ATS Score
Match Score
Content Score
```

AI must never mutate any of them.

Frontend must never recalculate them.

---

## Audit 4 — Evidence Traceability

For every:

```text
metric
impact claim
content signal
match
content opportunity
```

verify that the system can trace the result back to candidate evidence where applicable.

If the system cannot show where a candidate fact came from, it should not be treated as verified fact.

---

## Audit 5 — Candidate vs Requirement Separation

Verify that:

```text
Role requirements
JD requirements
Candidate evidence
```

remain separate throughout the pipeline.

Example:

```text
JD:
GraphQL required

Candidate:
GraphQL not detected
```

must never create:

```text
Candidate skill:
GraphQL
```

---

## Audit 6 — Content Quality vs Keyword Density

Verify that adding more technology names does not automatically increase:

```text
Content Score
```

Example:

```text
React TypeScript Node.js AWS Docker Kubernetes...
```

should not score highly simply because it contains many keywords.

Quality must come from evidence, specificity, ownership, outcome, and impact.

---

## Audit 7 — Duplicate Counting

Verify that one bullet cannot artificially inflate:

```text
skill coverage
impact count
metric count
requirement coverage
content score
```

multiple times.

The same evidence may support multiple legitimate signals, but aggregation must be controlled.

---

## Audit 8 — Metric Context

Check that:

```text
"35%"
```

alone is not considered strong impact.

The system should consider surrounding context:

```text
action
object
metric
outcome
```

---

## Audit 9 — Responsibility vs Achievement

Verify that:

```text
"Maintained APIs."
```

is not treated the same as:

```text
"Reduced API errors by 28% through..."
```

But also verify that responsibility bullets are not automatically classified as bad.

---

## Audit 10 — Role Relevance

Verify that content relevance does not override content quality.

A highly relevant but vague bullet should remain:

```text
Highly relevant
+
Weak evidence
```

not:

```text
Strong content
```

---

## Audit 11 — AI Hallucination

Deliberately test adversarial prompts where the model is encouraged to:

```text
add a realistic percentage
assume the technology used
fill missing experience
make achievements stronger
```

All unsupported facts must be rejected.

---

## Audit 12 — Existing Phase Regression

Run the complete suite:

```text
Phase 1
+
Phase 2
+
Phase 3
+
Phase 4
+
Phase 5
```

No previous behavior should regress.

---

# 71. Phase 5 Success Example

Resume bullet:

```text
"Developed Node.js APIs for the payment platform."
```

Target role:

```text
Backend Engineer
```

JD:

```text
Build scalable APIs and improve system performance.
```

Phase 4:

```text
Node.js:
MATCHED

API requirement:
MATCHED / relevant
```

Phase 5:

```text
Technical Depth:
MEDIUM

Specificity:
MEDIUM

Impact:
LOW

Metric:
NONE

Evidence Strength:
MEDIUM
```

Insight:

```text
The bullet demonstrates relevant backend/API work,
but the current resume does not show the outcome,
scale, or measurable effect of the work.
```

Safe opportunity:

```text
Consider adding a measurable result or scope detail
if you have evidence for one.
```

No metric is invented.

---

# 72. Phase 5 High-Impact Example

Resume:

```text
"Designed and optimized Node.js payment APIs, reducing
p95 latency by 31% across 2M monthly transactions."
```

Phase 5:

```text
Action:
STRONG

Technical Depth:
HIGH

Specificity:
HIGH

Metric:
31%

Scope:
2M monthly transactions

Impact:
HIGH

Evidence Strength:
HIGH
```

This bullet becomes strong evidence for:

```text
Node.js
API Development
Performance
Scale
```

assuming the relevant requirements exist.

---

# 73. Phase 5 Output for Phase 6

Phase 5 should provide structured data such as:

```ts
{
  contentScore: 82,

  strengths: [
    {
      bulletId: "b-12",
      evidenceStrength: 94,
      impact: "HIGH"
    }
  ],

  opportunities: [
    {
      bulletId: "b-07",
      type: "ADD_MEASURABLE_IMPACT",
      relevance: 0.92
    }
  ],

  requirementSupport: [
    {
      requirementId: "req-react",
      matchStatus: "MATCHED",
      evidenceStrength: 61
    }
  ]
}
```

Phase 6 will consume this.

Phase 5 should not decide the final recommendation ordering.

---

# 74. Final Phase Architecture

```text
                    CANDIDATE RESUME
                           │
                           ▼
                ┌────────────────────┐
                │ Resume Parser      │
                └──────────┬─────────┘
                           │
             ┌─────────────┴──────────────┐
             ▼                            ▼
      Candidate Skills              Resume Content
          Phase 2                     Phase 5
             │                            │
             ▼                            ▼
      ┌──────────────┐           ┌────────────────┐
      │ Skill Profile│           │ Bullet Analysis│
      └──────┬───────┘           └───────┬────────┘
             │                           │
             │                    ┌──────┴───────────┐
             │                    │                  │
             │                    ▼                  ▼
             │              Impact Analysis    Content Quality
             │
             ▼
      ┌──────────────────┐
      │ Phase 4 Matching │
      └────────┬─────────┘
               │
               └──────────────┬─────────────────┐
                              ▼                 ▼
                       Requirement Match   Content Support
                              │                 │
                              └────────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │ Phase 5 Unified │
                              │ Content Insight │
                              └────────┬────────┘
                                       ▼
                              Phase 6 Recommendation
```

---

# 75. Definition of Done

Phase 5 is complete only when:

## Bullet Intelligence

- [ ] Resume bullets are normalized
- [ ] Bullet classifications work
- [ ] Action detection works
- [ ] Ownership detection works
- [ ] Specificity detection works
- [ ] Outcome detection works
- [ ] Technical depth detection works
- [ ] Responsibility vs achievement classification works
- [ ] Repetition detection works
- [ ] Generic language detection works
- [ ] Vague claim detection works
- [ ] Bullet length signals work

## Impact Intelligence

- [ ] Metrics are deterministically detected
- [ ] Metric types are classified
- [ ] Metric source evidence is preserved
- [ ] Metric context is evaluated
- [ ] Scope is detected
- [ ] Impact level is calculated
- [ ] No metrics are invented
- [ ] Outcome signals are deterministic

## Content Quality

- [ ] Bullet quality scores are deterministic
- [ ] Section scores are deterministic
- [ ] Resume content score is deterministic
- [ ] Labels are deterministic
- [ ] Keyword density does not artificially inflate quality
- [ ] Duplicate content signals work
- [ ] Content evidence remains traceable

## Match Integration

- [ ] Phase 4 results are consumed
- [ ] Important requirements can be linked to supporting bullets
- [ ] Match status remains separate from content quality
- [ ] Strong vs weak supporting evidence can be distinguished
- [ ] JD-specific requirements can be linked to content
- [ ] No candidate facts are inferred from requirements

## AI

- [ ] AI explains deterministic findings
- [ ] AI output is schema validated
- [ ] AI cannot invent metrics
- [ ] AI cannot invent candidate facts
- [ ] AI cannot change content scores
- [ ] AI cannot create unsupported technologies
- [ ] AI references known bullets/signals only
- [ ] Phase 1 guardrails remain active

## Scoring

- [ ] ATS score remains separate
- [ ] Match score remains separate
- [ ] Content score remains separate
- [ ] Each has one authoritative implementation
- [ ] Score weights are centralized
- [ ] Engine version is tracked

## Performance / Security

- [ ] Bullet analysis is not unnecessarily repeated
- [ ] Cache keys include content engine version
- [ ] Full resume text is not unnecessarily logged
- [ ] AI provider abstraction remains intact
- [ ] Failure of content analysis does not break ATS/matching

## Testing

- [ ] Phase 1 tests pass
- [ ] Phase 2 tests pass
- [ ] Phase 3 tests pass
- [ ] Phase 4 tests pass
- [ ] Phase 5 tests pass
- [ ] AI safety tests pass
- [ ] Metric fabrication tests pass
- [ ] Score integrity tests pass
- [ ] Evidence traceability tests pass
- [ ] Frontend TypeScript = 0 errors

---

# 76. Final Engineering Principle

Phase 5 should become the authoritative **content-quality and impact layer** of Skillezo AI.

The complete responsibility separation should now be:

```text
PHASE 2
"What candidate skills/evidence are actually present?"
        ↓
PHASE 3
"What does the role/JD require?"
        ↓
PHASE 4
"How well does the candidate match those requirements?"
        ↓
PHASE 5
"How strongly does the resume communicate the candidate's
verified experience and impact?"
        ↓
PHASE 6
"What should the candidate improve first?"
        ↓
PHASE 7
"How can we safely optimize the resume?"
```

The most important rule remains:

> **Never manufacture evidence. A missing metric is an opportunity to request evidence, not permission to invent a number. A missing skill is a matching gap, not proof that the candidate cannot perform the skill.**

Phase 5 should produce **verified content intelligence**, not rewritten content. This gives Phase 6 the structured evidence it needs to prioritize improvements safely and gives Phase 7 a trustworthy foundation for optimization and re-scoring.
