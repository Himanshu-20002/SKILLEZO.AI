# 🚀 SKILLEZO AI --- Phase 2 Implementation Plan

## Evidence + Skill Intelligence Engine

> **Phase:** 2\
> **Status:** Ready for implementation\
> **Depends on:** Phase 1 --- AI Intelligence Foundation\
> **Date:** September 09, 2026\
> **Implementation rule:** Phase 2 must extend Phase 1 without breaking
> or replacing any existing parser, ATS, AI, API, database, or frontend
> behavior.

------------------------------------------------------------------------

# 1. Phase 2 Goal

Phase 2 upgrades Skillezo from a basic skill-detection system into an
**Evidence-Aware Skill Intelligence Engine**.

The current system already has:

-   100+ technology extraction through the parser
-   48 benchmark skills in the ATS engine
-   Skill alias normalization
-   Target-role analysis
-   Phase 1 AI context and evidence contracts
-   AI guardrails
-   Structured AI output
-   Gemini/OpenAI provider abstraction
-   Deterministic fallback

Do **not** rebuild these systems.

Instead, Phase 2 should create a maintainable intelligence layer that
understands:

``` text
Skill
├── Canonical identity
├── Display name
├── Aliases
├── Category
├── Parent skill
├── Related skills
├── Evidence
├── Detection confidence
└── Role relevance metadata
```

The objective is to make every skill-related result:

> **normalized, traceable, explainable, and reusable by future phases.**

------------------------------------------------------------------------

# 2. Phase 2 Architectural Principle

The same hybrid rule from Phase 1 remains mandatory:

> **Deterministic systems establish what is present, where it appears,
> and how confidently it was detected. AI may explain, prioritize, and
> reason about that evidence, but AI does not establish unsupported
> candidate facts.**

Therefore:

### Deterministic Skill Engine

Owns:

-   Skill identity
-   Alias normalization
-   Skill detection
-   Evidence references
-   Detection confidence
-   Skill categories
-   Skill relationships
-   Skill-gap detection against a known benchmark
-   Counts/frequencies
-   Score inputs

### AI Layer

Uses the deterministic skill intelligence to:

-   Explain skill gaps
-   Explain why a skill matters
-   Prioritize recommendations
-   Generate personalized learning/improvement suggestions
-   Improve wording
-   Reason over evidence

AI must not independently create a candidate skill profile that
contradicts the deterministic engine.

------------------------------------------------------------------------

# 3. Phase 2 Scope

Phase 2 includes:

1.  Skill Knowledge Base
2.  Canonical skill normalization
3.  Alias management
4.  Skill categories
5.  Skill relationships
6.  Evidence-aware skill detection
7.  Skill confidence
8.  Skill frequency tracking
9.  Resume skill profile
10. Role-aware skill gap foundation
11. Integration with Phase 1 AI context
12. Integration with existing ATS engine
13. Deterministic skill-gap output
14. Migration of existing 48-skill benchmark into the new system
15. Tests and regression protection
16. `impactScoreBoost` correction and contract cleanup

Phase 2 does **not** include:

-   Full Job Description parsing
-   Resume ↔ JD matching
-   Advanced role benchmark generation
-   Full impact intelligence
-   AI resume optimization
-   Automatic resume rewriting workflow
-   Resume Copilot

Those belong to later phases.

------------------------------------------------------------------------

# 4. Current → Target Architecture

## Current

``` text
Resume Parser
     ↓
100+ extracted skills
     ↓
48 hardcoded benchmark skills
     ↓
Keyword Match Score
```

## Phase 2

``` text
Resume Parser
     ↓
Raw Skill Mentions
     ↓
Skill Intelligence Engine
     │
     ├── Canonicalization
     ├── Alias Resolution
     ├── Category
     ├── Relationships
     ├── Evidence
     ├── Confidence
     └── Frequency
     ↓
Resume Skill Profile
     ↓
Role Skill Benchmark
     ↓
Deterministic Skill Gap
     ↓
Existing ATS Scoring
     ↓
Phase 1 AI Context
     ↓
AI Explanation / Recommendations
```

------------------------------------------------------------------------

# 5. Preserve Phase 1

The following Phase 1 components are contracts and must remain
compatible:

``` text
server/src/core/ai/ai.types.ts
server/src/core/ai/ai.context.ts
server/src/core/ai/ai.schemas.ts
server/src/core/ai/ai.guardrails.ts
server/src/core/ai/ai.service.ts
server/src/core/ai/providers/
```

Do not rename or remove Phase 1 interfaces unless a backward-compatible
migration is provided.

The existing:

``` text
ResumeAIContext
ResumeEvidence
AIRecommendation
AIBulletRewriteResponse
EngineVersions
```

remain the foundation.

Phase 2 should enrich them rather than create competing representations.

------------------------------------------------------------------------

# 6. New Skill Intelligence Module

Recommended backend structure:

``` text
server/src/modules/skill-intelligence/
├── skill.types.ts
├── skill.catalog.ts
├── skill.normalizer.ts
├── skill.detector.ts
├── skill.evidence.ts
├── skill.profile.ts
├── skill.gap.ts
├── skill.service.ts
└── index.ts
```

If the project already has a suitable skill module, extend it rather
than creating a duplicate module.

------------------------------------------------------------------------

# 7. Skill Entity Model

Create a canonical skill definition.

Example:

``` typescript
interface SkillDefinition {
  id: string;

  canonicalName: string;

  displayName: string;

  aliases: string[];

  category:
    | "FRONTEND"
    | "BACKEND"
    | "DATABASE"
    | "CLOUD"
    | "DEVOPS"
    | "LANGUAGE"
    | "TESTING"
    | "MOBILE"
    | "AI_ML"
    | "SECURITY"
    | "TOOLS"
    | "OTHER";

  parentSkillId?: string;

  relatedSkillIds: string[];

  detectionPatterns?: string[];

  active: boolean;
}
```

Example:

``` json
{
  "id": "skill_aws",
  "canonicalName": "AWS",
  "displayName": "Amazon Web Services",
  "aliases": [
    "AWS",
    "Amazon Web Services",
    "AWS Cloud"
  ],
  "category": "CLOUD",
  "relatedSkillIds": [
    "skill_ec2",
    "skill_s3",
    "skill_lambda",
    "skill_rds"
  ],
  "active": true
}
```

------------------------------------------------------------------------

# 8. Canonical Skill Identity

The engine must have exactly one canonical identity for equivalent
aliases.

Example:

``` text
AWS
Amazon Web Services
AWS Cloud
```

→

``` text
AWS
```

Likewise:

``` text
TS
TypeScript
Typescript
```

→

``` text
TypeScript
```

And:

``` text
Node
Node.js
NodeJS
Node js
```

→

``` text
Node.js
```

The frontend should display a canonical skill, not every alias detected
in the resume.

------------------------------------------------------------------------

# 9. Alias Normalization

Create:

``` text
SkillNormalizer
```

Responsibilities:

``` text
raw mention
    ↓
normalize text
    ↓
alias lookup
    ↓
canonical skill
```

Example:

``` typescript
normalizeSkill("nodejs")
```

returns:

``` typescript
{
  skillId: "skill_nodejs",
  canonicalName: "Node.js"
}
```

Normalization should handle:

-   Case differences
-   Punctuation
-   Common abbreviations
-   Known aliases
-   Common spelling variants
-   Technology naming conventions

Do not use fuzzy matching aggressively enough to create false positives.

------------------------------------------------------------------------

# 10. Avoid False Positive Skill Detection

This is a critical requirement.

For example:

``` text
"SQL"
```

should not be detected merely because a random substring happens to
contain `sql`.

Skill detection must use:

-   Word boundaries
-   Alias patterns
-   Context-aware patterns where necessary
-   Technology-specific matching rules

Examples:

``` text
"React" → React ✓

"React Native" → React Native ✓
                   React may optionally be inferred only
                   according to explicit catalog rules.

"typescript" → TypeScript ✓
```

Avoid substring-based matching that creates false positives.

------------------------------------------------------------------------

# 11. Skill Evidence Model

Every detected skill must be traceable.

Example:

``` typescript
interface SkillEvidence {
  skillId: string;

  canonicalName: string;

  evidenceId: string;

  sourceSection:
    | "summary"
    | "skills"
    | "experience"
    | "projects"
    | "education"
    | "certifications";

  sourceText: string;

  sourceIndex?: number;

  detectionMethod:
    | "EXACT"
    | "ALIAS"
    | "PATTERN";

  confidence: number;
}
```

Example:

``` json
{
  "skillId": "skill_nodejs",
  "canonicalName": "Node.js",
  "evidenceId": "experience_0_bullet_2",
  "sourceSection": "experience",
  "sourceText": "Built REST APIs using Node.js and Express.",
  "detectionMethod": "EXACT",
  "confidence": 0.99
}
```

------------------------------------------------------------------------

# 12. Evidence Must Flow Into Phase 1

Phase 1 already has:

``` typescript
ResumeEvidence
```

Do not create a completely separate evidence universe.

Instead, enrich the existing evidence model.

For example:

``` typescript
interface ResumeEvidence {
  id: string;

  section: ResumeEvidenceSection;

  text: string;

  sourceIndex?: number;

  detectedSkills?: SkillEvidence[];

  detectedMetrics?: string[];

  confidence?: number;
}
```

The exact interface may be adapted to the existing implementation, but
there must be one coherent evidence model.

------------------------------------------------------------------------

# 13. Resume Skill Profile

Create a deterministic profile representing the skills detected in one
resume.

Example:

``` typescript
interface ResumeSkillProfile {
  resumeId: string;

  skills: ResumeSkill[];

  categorySummary: SkillCategorySummary[];

  totalUniqueSkills: number;

  generatedAt: Date;

  engineVersion: string;
}
```

Each skill:

``` typescript
interface ResumeSkill {
  skillId: string;

  canonicalName: string;

  category: string;

  frequency: number;

  evidenceIds: string[];

  confidence: number;

  sections: string[];
}
```

------------------------------------------------------------------------

# 14. Skill Frequency

Frequency should be calculated from meaningful mentions.

Example:

``` text
React
4 mentions

Next.js
7 mentions

Node.js
2 mentions
```

This can support UI signals such as:

``` text
React 4x
Next.js 7x
Node.js 2x
```

But frequency must not be treated as proof of expertise.

Do not display:

``` text
React = Expert
```

merely because it appears four times.

------------------------------------------------------------------------

# 15. Confidence Model

Create a deterministic confidence score.

Example:

``` text
Exact skill heading mention       High
Exact experience mention         High
Known alias                      High
Pattern/context match             Medium
Weak contextual inference         Low
```

Suggested range:

``` text
0.00 → 1.00
```

Example:

``` text
React
confidence = 0.99

AWS
confidence = 0.00
```

A detected skill should be included only when it passes the configured
detection threshold.

------------------------------------------------------------------------

# 16. Skill Categories

The current five categories should remain compatible:

``` text
Frontend
Backend
Database
Cloud
DevOps
```

Phase 2 can expand them into a broader taxonomy:

``` text
Frontend
Backend
Database
Cloud
DevOps
Languages
Testing
Mobile
AI/ML
Security
Tools
Other
```

Do not change the existing UI category behavior unexpectedly.

Existing categories must continue working.

------------------------------------------------------------------------

# 17. Parent / Child Skill Relationships

Support hierarchical relationships.

Example:

``` text
Cloud
│
├── AWS
│   ├── EC2
│   ├── S3
│   ├── Lambda
│   └── RDS
│
├── Azure
└── GCP
```

Another:

``` text
JavaScript
│
├── React
├── Next.js
├── Node.js
└── Express.js
```

Relationships should help future role matching but must not
automatically claim that knowledge of a parent means knowledge of every
child.

For example:

``` text
AWS
```

does NOT automatically mean:

``` text
Lambda
S3
EC2
RDS
```

unless those are explicitly detected.

------------------------------------------------------------------------

# 18. Related Skills

Support related-but-distinct skills.

Example:

``` text
React
├── Next.js
├── Redux
└── React Query
```

Related does not mean equivalent.

The engine must distinguish:

``` text
Alias
```

from:

``` text
Related Skill
```

Example:

``` text
Node.js
NodeJS
```

= same skill.

``` text
Node.js
Express.js
```

= related skills.

------------------------------------------------------------------------

# 19. Existing 48-Skill Benchmark Migration

The current 48 skills must be migrated into the new catalog.

Do not delete the existing list first.

Create a mapping:

``` text
Existing ATS skill
        ↓
Canonical Skill ID
```

Example:

``` text
React       → skill_react
Next.js     → skill_nextjs
Node.js     → skill_nodejs
AWS         → skill_aws
Docker      → skill_docker
```

The existing ATS engine should consume the canonical catalog after
migration.

This prevents two different definitions of:

``` text
React
AWS
Docker
```

from existing in the application.

------------------------------------------------------------------------

# 20. ATS Engine Integration

Current:

``` text
resume.ats.ts
```

must continue owning score calculations.

The ATS engine can call:

``` text
SkillIntelligenceService
```

for normalized skill data.

Architecture:

``` text
resume.ats.ts
       ↓
SkillIntelligenceService
       ↓
ResumeSkillProfile
       ↓
Keyword / Skill Match Calculation
```

Do not move scoring logic into the skill catalog.

The skill catalog defines skills.

The ATS engine calculates scores.

------------------------------------------------------------------------

# 21. Skill Gap Engine

Create deterministic skill-gap analysis.

Input:

``` text
ResumeSkillProfile
+
Target Role Skill Requirements
```

Output:

``` typescript
interface SkillGap {
  skillId: string;

  canonicalName: string;

  category: string;

  status:
    | "MATCHED"
    | "NOT_DETECTED"
    | "PARTIAL";

  priority?: "HIGH" | "MEDIUM" | "LOW";

  evidenceIds: string[];
}
```

Important:

If a skill is absent:

``` text
NOT_DETECTED
```

not:

``` text
CANDIDATE_DOES_NOT_KNOW
```

The resume only tells us what is present in the document.

------------------------------------------------------------------------

# 22. Role-Based Default Analysis

The default Skillezo experience remains:

``` text
Resume
+
Target Role
↓
Role Skill Benchmark
↓
Skill Intelligence
↓
Skill Gap
```

Example:

``` text
Target Role:
Full-Stack Engineer
```

Output:

``` text
Matched
──────────────
React
Next.js
Node.js
REST APIs
TypeScript

Not detected
──────────────
AWS
PostgreSQL
Docker
CI/CD
Redis
```

This works without a Job Description.

------------------------------------------------------------------------

# 23. Optional Job Description Compatibility

Phase 2 must preserve the Phase 1 optional field:

``` typescript
jobDescription?: {
  rawText: string;
}
```

But do not implement full JD intelligence yet.

The Phase 2 skill engine should simply be capable of receiving a future
job-specific skill requirement set.

Phase 3 will build the actual JD parser and requirement extraction.

Therefore:

``` text
Phase 2
Skill Intelligence
       ↑
future requirement source

Phase 3
JD Intelligence
       ↓
provides requirements
```

This keeps the architecture extensible without expanding Phase 2 beyond
scope.

------------------------------------------------------------------------

# 24. AI Context Upgrade

Update the Phase 1 `ResumeAIContext` to include the richer skill
profile.

Example:

``` typescript
skills: {
  detected: ResumeSkill[];
  categories: SkillCategorySummary[];
  matchedTargetSkills: string[];
  notDetectedTargetSkills: string[];
}
```

The AI should receive evidence references.

Example:

``` json
{
  "canonicalName": "Node.js",
  "category": "BACKEND",
  "frequency": 2,
  "confidence": 0.99,
  "evidenceIds": [
    "experience_0_bullet_1",
    "project_0_bullet_2"
  ]
}
```

This enables evidence-grounded AI reasoning.

------------------------------------------------------------------------

# 25. AI Guardrail Integration

Extend the Phase 1 guardrails.

If AI produces:

``` text
"You have strong AWS experience."
```

but no AWS evidence exists:

``` text
Reject / normalize the claim.
```

Safer output:

``` text
"AWS is not detected in the supplied resume evidence."
```

If AI says:

``` text
"You should learn AWS."
```

the engine should be able to distinguish between:

``` text
Skill not detected
```

and:

``` text
Candidate should learn this skill
```

The second statement requires a recommendation context and should not be
presented as a factual assessment.

------------------------------------------------------------------------

# 26. `impactScoreBoost` Correction

This must be addressed in Phase 2.

Phase 1 currently exposes:

``` typescript
impactScoreBoost
```

inside `AIRecommendation`.

This field must **not be treated as an authoritative score change**.

## New rule

AI may provide:

``` text
potentialImpact:
HIGH | MEDIUM | LOW
```

or an equivalent qualitative estimate.

The AI must not directly modify deterministic ATS scores.

### Bad flow

``` text
AI
 ↓
"impactScoreBoost = 7"
 ↓
Impact Score 42 → 49
```

Do NOT implement this.

### Correct flow

``` text
AI
 ↓
"Quantify this achievement"
 ↓
User supplies verified information
 ↓
Resume content changes
 ↓
Deterministic ATS engine runs again
 ↓
New Impact Score calculated
```

Example:

``` text
Before
Impact Score: 42

AI recommendation:
Add a verified latency reduction metric.

User adds:
"Reduced API latency by 32%."

Re-analysis

After
Impact Score: 61
```

The `61` comes from the deterministic engine.

AI did not calculate it.

------------------------------------------------------------------------

# 27. Backward Compatibility for `impactScoreBoost`

Do not immediately break the existing frontend if it currently expects:

``` typescript
impactScoreBoost
```

Phase 2 should introduce a compatibility strategy.

Preferred approach:

``` typescript
impactScoreBoost?: number | null;
```

and treat it as:

> **legacy/display-only estimate**

It must not be used to mutate the official score.

Add a newer field:

``` typescript
potentialImpact?: "HIGH" | "MEDIUM" | "LOW";
```

or an equivalent typed impact indicator.

Later, during the optimization phase, the legacy field can be deprecated
and removed once the frontend no longer depends on it.

------------------------------------------------------------------------

# 28. Skill Recommendation Rule

The system must distinguish three states:

### Detected

``` text
React ✓
```

### Not detected

``` text
AWS —
```

### Recommended

``` text
AWS
High priority for target role
```

These are not the same.

Example:

``` text
AWS is not detected in the resume.
AWS is a high-priority skill for the selected target role.
```

This is valid.

But:

``` text
You don't know AWS.
```

is not valid.

------------------------------------------------------------------------

# 29. Skill Scoring

Phase 2 should provide normalized inputs to the ATS engine.

Example:

``` text
Target Role
     ↓
Required Skills
     ↓
Candidate Skill Profile
     ↓
Matched Skills
Not Detected Skills
Partial Skills
     ↓
ATS Keyword Match
```

Do not create a second overall score inside Skill Intelligence.

One score owner:

``` text
resume.ats.ts
```

Skill Intelligence supplies structured evidence and match data.

------------------------------------------------------------------------

# 30. Suggested API Surface

Prefer a service-first architecture.

Potential internal methods:

``` typescript
SkillIntelligenceService.normalizeSkill()
SkillIntelligenceService.detectSkills()
SkillIntelligenceService.buildResumeSkillProfile()
SkillIntelligenceService.getSkillEvidence()
SkillIntelligenceService.getSkillGaps()
SkillIntelligenceService.getCanonicalSkill()
```

Do not expose all internal methods as public HTTP endpoints.

If the frontend needs skill details, add only the necessary API
endpoint.

Potential:

``` text
GET /api/resumes/:id/skills
GET /api/resumes/:id/skills/gaps
```

Existing APIs must continue working.

------------------------------------------------------------------------

# 31. Database Strategy

Do not create unnecessary database complexity.

For Phase 2, the skill catalog can initially be:

``` text
versioned static configuration
```

or a database-backed catalog if the project already uses one.

Recommended initial approach:

``` text
skill.catalog.ts
```

with clear versioning.

Later, when Skillezo needs an admin-managed skill catalog, migrate the
catalog to MongoDB.

Do not add a database collection merely for the sake of adding one.

------------------------------------------------------------------------

# 32. Engine Versioning

Update engine versions.

Example:

``` typescript
AI_ENGINE_VERSION = "1.0.0";
ATS_ENGINE_VERSION = "1.1.0";
SKILL_ENGINE_VERSION = "1.0.0";
```

If ATS behavior changes because of the skill catalog migration,
increment the ATS engine version according to the project's versioning
policy.

The skill engine version must be included in relevant cache/input
hashes.

Updated conceptual hash:

``` text
SHA256(
  resumeId
  +
  resumeVersion
  +
  targetRole
  +
  optionalJD
  +
  AI_ENGINE_VERSION
  +
  ATS_ENGINE_VERSION
  +
  SKILL_ENGINE_VERSION
)
```

This prevents stale AI results after skill-engine changes.

------------------------------------------------------------------------

# 33. Caching Compatibility

Phase 1 already supports deterministic input hashing.

Phase 2 must extend the hash to include:

``` text
SKILL_ENGINE_VERSION
```

and any versioned role benchmark data that materially changes the
result.

If the skill catalog changes:

``` text
SKILL_ENGINE_VERSION
changes
      ↓
new hash
      ↓
new analysis
```

Never serve an old skill analysis after a catalog-breaking change.

------------------------------------------------------------------------

# 34. Frontend Changes

Do not redesign the Resume Intelligence page.

The current:

``` text
Keyword & Skill Gap Matrix
```

should continue to work.

Upgrade its data source.

Current conceptual data:

``` text
React 4x
Next.js 7x
Node.js 2x
```

should now come from:

``` text
ResumeSkillProfile
```

rather than directly from raw regex results.

------------------------------------------------------------------------

# 35. Skill Matrix Improvements

The existing UI can eventually show:

``` text
MATCHED KEYWORDS

✓ React       4x
✓ Next.js     7x
✓ TypeScript  2x
✓ Node.js     2x
✓ REST APIs   2x
```

and:

``` text
NOT DETECTED TARGET SKILLS

• AWS
• PostgreSQL
• Docker
• CI/CD
```

Future phases can add:

``` text
Evidence
Priority
JD relevance
```

Do not overload the UI in Phase 2.

------------------------------------------------------------------------

# 36. Evidence Interaction

When a user clicks a skill:

``` text
React
```

the system should be capable of showing:

``` text
Detected in 4 places

Experience
→ Bullet 2
→ Bullet 4

Projects
→ Project 1

Skills
→ Technical Skills
```

This is an important trust feature.

It answers:

> "Why does Skillezo think I have this skill?"

------------------------------------------------------------------------

# 37. No Automatic Skill Addition

Phase 2 must NOT modify the candidate's resume.

If:

``` text
AWS
```

is not detected, the engine must not automatically add:

``` text
AWS
```

to the resume.

Future optimization phases may suggest adding it if the candidate
confirms actual experience.

The user remains the authority over their factual resume.

------------------------------------------------------------------------

# 38. Tests

Add comprehensive unit tests.

## Skill Catalog

Test:

``` text
canonical skill lookup
alias lookup
category lookup
parent/child relationship
related skill relationship
inactive skill handling
```

## Normalization

Test:

``` text
AWS → AWS
Amazon Web Services → AWS
AWS Cloud → AWS

TS → TypeScript
typescript → TypeScript

NodeJS → Node.js
Node.js → Node.js
```

## Detection

Test:

``` text
exact detection
alias detection
word boundary
case-insensitive detection
false positive prevention
multiple mentions
multiple sections
```

## Evidence

Test:

``` text
correct evidence ID
correct source section
correct source text
correct detection method
correct confidence
```

## Skill Profile

Test:

``` text
unique skills
frequency
category summary
evidence aggregation
confidence calculation
```

## Skill Gap

Test:

``` text
matched
not detected
partial
priority
```

## ATS Regression

Verify existing scores remain consistent unless a deliberate benchmark
change is expected.

------------------------------------------------------------------------

# 39. Required Regression Tests

Existing tests must remain green:

``` text
resume.parser.spec.ts
resume.ats.spec.ts
resume.service.spec.ts
ai.engine.spec.ts
```

Target:

``` text
All existing tests PASS
+
All Phase 2 tests PASS
+
Frontend TypeScript = 0 errors
```

No existing feature may regress.

------------------------------------------------------------------------

# 40. Phase 2 Security Requirements

Verify:

-   Resume ownership is enforced
-   Skill data cannot expose another user's resume evidence
-   Client cannot modify canonical skill definitions
-   Client cannot inject fake skill evidence
-   Client cannot override deterministic scores
-   AI cannot promote unsupported skills into verified candidate skills
-   Malformed skill IDs are rejected safely

------------------------------------------------------------------------

# 41. Performance Requirements

Skill detection should remain deterministic and fast.

Avoid:

``` text
One LLM request per skill
```

Avoid:

``` text
One LLM request per resume bullet
```

Phase 2 skill normalization/detection should be local/deterministic.

AI should receive the aggregated skill profile.

Example:

``` text
100 raw mentions
       ↓
10 canonical skills
       ↓
10 structured skill records
       ↓
ONE AI context
```

This keeps AI costs under control.

------------------------------------------------------------------------

# 42. Phase 2 Data Flow

Final Phase 2 flow:

``` text
                       RESUME
                          │
                          ▼
                 Existing Parser
                          │
                          ▼
                 Raw Skill Mentions
                          │
                          ▼
              ┌──────────────────────┐
              │ Skill Intelligence   │
              │                      │
              │ Normalize            │
              │ Canonicalize         │
              │ Categorize            │
              │ Detect               │
              │ Attach Evidence      │
              │ Calculate Confidence │
              │ Calculate Frequency  │
              └──────────┬───────────┘
                         │
                         ▼
                Resume Skill Profile
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
        Existing ATS          Target Role
               │                   │
               └─────────┬─────────┘
                         ▼
                  Skill Gap Engine
                         │
                         ▼
                Deterministic Score
                         │
                         ▼
                 Phase 1 AI Context
                         │
                         ▼
                    AI Service
                         │
                         ▼
               Explain / Recommend
```

------------------------------------------------------------------------

# 43. Definition of Done

Phase 2 is complete only when:

## Skill Intelligence

-   [ ] Canonical skill catalog exists
-   [ ] Existing 48 benchmark skills migrated
-   [ ] 100+ parser technologies map into canonical skills where
    supported
-   [ ] Alias normalization works
-   [ ] Categories work
-   [ ] Parent/child relationships work
-   [ ] Related skills work
-   [ ] False-positive detection is tested
-   [ ] Skill confidence exists
-   [ ] Skill frequency exists

## Evidence

-   [ ] Every detected skill has evidence
-   [ ] Evidence references Phase 1 evidence IDs
-   [ ] Evidence identifies source section
-   [ ] Evidence identifies source text
-   [ ] Detection method is recorded
-   [ ] Confidence is recorded

## ATS

-   [ ] Existing ATS engine remains the score owner
-   [ ] Keyword matching uses canonical skills
-   [ ] Existing four pillars continue working
-   [ ] Existing target-role analysis continues working
-   [ ] No duplicate scoring engine exists

## AI

-   [ ] Phase 1 AI context contains enriched skill data
-   [ ] AI can reference skill evidence
-   [ ] AI cannot promote unsupported skills to verified skills
-   [ ] AI guardrails continue working
-   [ ] AI fallback continues working
-   [ ] AI provider abstraction remains unchanged

## `impactScoreBoost`

-   [ ] `impactScoreBoost` is no longer treated as an authoritative
    score change
-   [ ] AI cannot mutate official ATS/Impact scores
-   [ ] Deterministic re-analysis remains the source of truth
-   [ ] A qualitative `potentialImpact` field is available if needed
-   [ ] Existing frontend compatibility is preserved during migration

## Caching / Versioning

-   [ ] Skill engine version exists
-   [ ] Skill engine version participates in input hashing
-   [ ] Stale cached analyses are invalidated after engine changes

## Frontend

-   [ ] Existing Keyword & Skill Gap Matrix still works
-   [ ] Existing UI remains functional
-   [ ] Skill counts come from normalized skill intelligence
-   [ ] No unnecessary redesign is introduced

## Testing

-   [ ] Existing backend tests remain green
-   [ ] Phase 2 tests pass
-   [ ] Frontend TypeScript has 0 errors
-   [ ] Security tests pass
-   [ ] No regression in existing Resume Intelligence behavior

------------------------------------------------------------------------

# 44. Phase 2 Implementation Boundary

Implement **ONLY Phase 2**.

Do not implement:

``` text
❌ Full JD parser
❌ Resume ↔ JD matching
❌ New overall scoring model
❌ Full impact engine
❌ AI resume optimizer
❌ Automatic resume editing
❌ Resume Copilot
❌ Large frontend redesign
```

Phase 2 should finish with:

``` text
                    TRUSTED SKILL DATA
                           │
                           ▼
                 EVIDENCE-AWARE PROFILE
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        DETERMINISTIC ATS          PHASE 1 AI
              │                         │
              ▼                         ▼
          SCORE INPUTS             REASONING
                                      │
                                      ▼
                               RECOMMENDATIONS
```

------------------------------------------------------------------------

# 45. Final Phase 2 Principle

At the end of Phase 2, Skillezo should be able to confidently answer:

> **"What skills does this resume actually demonstrate, where does it
> demonstrate them, how confidently were they detected, and which
> target-role skills are not detected?"**

It should **not yet** try to answer:

> "What exact job should this person apply to?"

or:

> "How should I optimize this resume for a specific employer?"

Those belong to later phases.

The output of Phase 2 becomes the trusted foundation for:

``` text
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
AI Optimization + Re-score
        ↓
Phase 8
Resume Copilot
```

**Phase 2 must make these future phases easier, not create a parallel
architecture that has to be replaced later.**
