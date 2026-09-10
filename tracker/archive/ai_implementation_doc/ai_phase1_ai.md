# SKILLEZO AI --- Resume Intelligence Engine Implementation Plan

> **Status:** Planning / Phase 1 ready for implementation\
> **Date:** September 09, 2026\
> **Principle:** Every phase must extend and remain backward-compatible
> with the previous phase. Do not rebuild working Resume Intelligence,
> ATS, parser, scoring, or UI foundations.

------------------------------------------------------------------------

# 1. Product Direction

Skillezo will evolve the existing Resume Intelligence system into a
**Hybrid Resume Intelligence & Optimization Engine**.

The engine will combine:

### Deterministic Intelligence

Responsible for facts, extraction, validation, scoring, matching, and
repeatable calculations.

-   Resume parsing
-   Entity extraction
-   Section detection
-   Skill normalization
-   ATS checks
-   Keyword detection
-   Metrics detection
-   Role benchmarks
-   Job-description matching
-   Score calculations
-   Evidence validation

### Generative AI Intelligence

Responsible for reasoning and language tasks.

-   Explain diagnostics
-   Prioritize improvements
-   Generate personalized recommendations
-   Rewrite resume content
-   Suggest better wording
-   Ask for missing information when required
-   Generate job-specific optimization suggestions

## Core rule

> **Deterministic systems calculate and validate. AI explains,
> prioritizes, recommends, and generates.**

AI must never invent candidate facts, skills, companies, metrics,
achievements, education, certifications, or experience.

------------------------------------------------------------------------

# 2. Important Product Decision: Job Description Is Optional

The Resume Intelligence experience must work in two modes.

## Mode A --- Default: Role-Based Resume Analysis

The user selects a target job role.

Example:

``` text
Target Role: Full-Stack Engineer
```

Skillezo analyzes the resume against the internal role benchmark.

``` text
Resume
  +
Target Role
  ↓
Role Benchmark
  ↓
Resume Intelligence Analysis
```

The system can evaluate:

-   ATS readiness
-   Skill coverage
-   Role-relevant keywords
-   Missing target skills
-   Experience quality
-   Measurable impact
-   Section quality
-   Resume length
-   Content quality
-   Role alignment
-   Improvement opportunities

This is the **default experience**.

------------------------------------------------------------------------

## Mode B --- Optional: Paste Job Description

The user can optionally provide a specific job description.

``` text
Target Role: Full-Stack Engineer

[ Optional: Paste Job Description ]
```

If a JD is provided:

``` text
Resume
  +
Target Role
  +
Job Description
  ↓
JD Intelligence
  ↓
Job-Specific Resume Match
  ↓
Prioritized Optimization
```

The JD should become an additional source of requirements, not replace
the role benchmark.

### Important

If a JD is provided, the engine should compare:

``` text
Role Benchmark
       +
Specific JD
       +
Candidate Resume
```

This allows Skillezo to identify:

1.  Skills expected for the role
2.  Skills explicitly requested by the employer
3.  Skills present in the resume
4.  Skills missing from the resume
5.  Skills that are important but not relevant to this specific JD
6.  Which improvements have the highest value

------------------------------------------------------------------------

# 3. Target Architecture

``` text
                         RESUME FILE
                             │
                             ▼
                    ┌─────────────────┐
                    │ Resume Parser    │
                    │ EXISTING         │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Resume Evidence │
                    │ Layer           │
                    │ PHASE 1         │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       Existing ATS Core              AI Intelligence
       EXISTING                         PHASE 1+
              │                             │
              │                     ┌───────┴────────┐
              │                     │                │
              │                 Explain         Recommend
              │                     │                │
              └──────────────┬──────┴────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Role Benchmark  │
                    │ PHASE 2         │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Optional JD     │
                    │ Intelligence    │
                    │ PHASE 3         │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Match Engine    │
                    │ PHASE 3         │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Optimization    │
                    │ Loop            │
                    │ PHASE 4+        │
                    └─────────────────┘
```

------------------------------------------------------------------------

# 4. Existing System That Must Remain Intact

The following existing capabilities are foundations and must continue
working after every phase.

## Existing Backend

-   `server/src/modules/resume/resume.parser.ts`
-   `server/src/modules/resume/resume.ats.ts`
-   `server/src/core/ai/ai.service.ts`
-   `server/src/database/models/Resume.model.ts`

## Existing Frontend

-   `client/app/dashboard/resume-intelligence/page.tsx`
-   `client/components/dashboard/resume-intelligence/ATSCompatibility.tsx`
-   `client/components/dashboard/resume-intelligence/PillarDetailInspector.tsx`
-   `client/components/dashboard/resume-intelligence/ResumeScoreCard.tsx`
-   `client/components/dashboard/resume-intelligence/ResumeUploader.tsx`
-   `client/components/dashboard/resume-intelligence/ResumePreview.tsx`
-   `client/components/dashboard/resume-intelligence/AIRecommendations.tsx`

## Existing behavior that must not regress

-   Resume upload
-   PDF parsing
-   Resume extraction
-   Contact extraction
-   Skill extraction
-   Experience extraction
-   Education extraction
-   Project extraction
-   Existing ATS scoring
-   Existing four-pillar audit
-   Existing resume preview
-   Existing target-role analysis
-   Existing deterministic fallback
-   Existing authentication
-   Existing resume version/storage behavior

------------------------------------------------------------------------

# 5. Master Implementation Roadmap

Each phase depends on and extends the previous phase.

``` text
PHASE 1
AI Intelligence Foundation
        ↓
PHASE 2
Evidence + Skill Intelligence
        ↓
PHASE 3
Role Benchmark + JD Intelligence
        ↓
PHASE 4
Resume ↔ Job Matching
        ↓
PHASE 5
Impact & Content Intelligence
        ↓
PHASE 6
AI Recommendation Orchestrator
        ↓
PHASE 7
AI Resume Optimization + Re-score
        ↓
PHASE 8
Resume Copilot / Conversational Intelligence
```

Do not implement later phases before the previous contract is stable.

------------------------------------------------------------------------

# PHASE 1 --- AI INTELLIGENCE FOUNDATION

## Goal

Upgrade the existing Generative AI service from a basic
critique/rewriter into a **structured, evidence-aware AI intelligence
layer** without changing the existing deterministic scoring engine.

This phase is intentionally focused.

We are **not** building the complete JD matcher, skill knowledge graph,
or resume optimizer yet.

The goal is to create the AI foundation that every later phase can
safely use.

------------------------------------------------------------------------

# 6. Phase 1 Objectives

Phase 1 must provide:

1.  A standardized AI input contract
2.  A standardized AI output contract
3.  Resume context preparation
4.  Deterministic diagnostic context injection
5.  Evidence-aware AI reasoning
6.  Structured recommendations
7.  Safe bullet rewriting
8.  Hallucination prevention
9.  Provider abstraction
10. AI fallback behavior
11. AI request logging/observability
12. Backward compatibility with current `ai.service.ts`

------------------------------------------------------------------------

# 7. Phase 1 --- AI Input Pipeline

The AI must not receive only raw resume text.

Create an AI context builder.

Suggested location:

``` text
server/src/core/ai/
├── ai.service.ts
├── ai.context.ts
├── ai.types.ts
├── ai.schemas.ts
├── ai.guardrails.ts
└── providers/
    ├── gemini.provider.ts
    └── openai.provider.ts
```

The exact naming can follow the existing project conventions if
equivalent files already exist.

------------------------------------------------------------------------

# 8. AI Context Builder

Create a normalized AI context from existing data.

Input:

``` text
Resume extractedData
+
Resume rawText
+
Existing ATS diagnostics
+
Target role
+
Optional JD
```

Phase 1 may support the optional JD field in the contract, but full JD
intelligence belongs to Phase 3.

Example:

``` typescript
interface ResumeAIContext {
  resume: {
    candidate: CandidateContext;
    summary?: string;
    skills: SkillContext[];
    experience: ExperienceContext[];
    projects: ProjectContext[];
    education: EducationContext[];
    certifications: CertificationContext[];
  };

  targetRole?: string;

  diagnostics: {
    atsScore: number;
    keywordMatchScore: number;
    impactScore: number;
    structureScore: number;
    brevityScore: number;
    readabilityScore: number;

    missingSkills: string[];
    detectedMetrics: string[];
    weakAreas: string[];
  };

  jobDescription?: {
    rawText: string;
  };
}
```

The context builder should sanitize and normalize the data before
sending it to an LLM.

------------------------------------------------------------------------

# 9. AI Evidence Model

Every important resume statement should be traceable back to resume
content.

Phase 1 should establish the concept even if the complete evidence
engine is expanded later.

Example:

``` typescript
interface ResumeEvidence {
  id: string;
  section:
    | "summary"
    | "experience"
    | "projects"
    | "skills"
    | "education"
    | "certifications";

  text: string;

  sourceIndex?: number;

  detectedSkills?: string[];
  detectedMetrics?: string[];
}
```

Example:

``` json
{
  "id": "experience_0_bullet_2",
  "section": "experience",
  "text": "Built REST APIs using Node.js and Express.",
  "detectedSkills": ["Node.js", "Express.js", "REST APIs"],
  "detectedMetrics": []
}
```

The AI can then reference the evidence.

------------------------------------------------------------------------

# 10. AI Guardrails

Implement hard rules.

## Rule 1 --- Never invent facts

The AI must not create:

-   Employers
-   Job titles
-   Technologies
-   Metrics
-   Revenue
-   Users
-   Certifications
-   Degrees
-   Awards
-   Achievements
-   Dates
-   Responsibilities

unless present in the supplied resume evidence or explicitly supplied by
the user.

------------------------------------------------------------------------

## Rule 2 --- Metrics require evidence

If a bullet has no metric:

Bad:

``` text
Reduced latency by 40%.
```

when no 40% value exists.

Good:

``` text
Consider adding a verified latency reduction percentage if you have one.
```

------------------------------------------------------------------------

## Rule 3 --- Missing skills are recommendations, not facts

If AWS is missing:

``` text
AWS is not detected in the resume.
```

Do not say:

``` text
You don't know AWS.
```

The resume only proves what is or isn't detected in the document.

------------------------------------------------------------------------

## Rule 4 --- Preserve meaning during rewrites

The AI must not change:

-   seniority
-   responsibility level
-   technology actually used
-   employment dates
-   company identity
-   project ownership
-   factual outcomes

------------------------------------------------------------------------

# 11. Structured AI Output

The AI should never be allowed to return an uncontrolled paragraph when
the frontend needs structured data.

Create a schema.

Example:

``` typescript
interface AIRecommendation {
  id: string;

  category:
    | "ATS"
    | "SKILLS"
    | "EXPERIENCE"
    | "IMPACT"
    | "SUMMARY"
    | "STRUCTURE"
    | "GENERAL";

  priority: "HIGH" | "MEDIUM" | "LOW";

  title: string;

  problem: string;

  whyItMatters: string;

  recommendation: string;

  evidenceIds: string[];

  requiresUserInput: boolean;

  suggestedAction?: string;
}
```

AI response:

``` json
{
  "recommendations": [
    {
      "id": "rec_001",
      "category": "IMPACT",
      "priority": "HIGH",
      "title": "Quantify your backend achievement",
      "problem": "The experience bullet describes the work but no measurable outcome was detected.",
      "whyItMatters": "Quantified outcomes make achievements easier to evaluate.",
      "recommendation": "Add a verified performance, usage, scale, revenue, or efficiency metric if available.",
      "evidenceIds": [
        "experience_0_bullet_2"
      ],
      "requiresUserInput": true
    }
  ]
}
```

------------------------------------------------------------------------

# 12. AI Recommendation Types

Phase 1 should support these categories:

### ATS

Examples:

-   Formatting issue
-   Missing contact information
-   Parsing concern
-   Section issue

### SKILLS

Examples:

-   Target skill not detected
-   Keyword coverage improvement
-   Skill visibility

### EXPERIENCE

Examples:

-   Weak bullet
-   Responsibility-only statement
-   Generic wording
-   Missing specificity

### IMPACT

Examples:

-   No measurable outcome
-   Missing scale
-   Weak achievement evidence

### SUMMARY

Examples:

-   Too generic
-   Weak role alignment
-   Missing strongest skills

### STRUCTURE

Examples:

-   Missing section
-   Poor ordering
-   Excessive length

------------------------------------------------------------------------

# 13. AI Recommendation Prioritization

Phase 1 should establish the output contract, but the final
deterministic priority engine can be expanded in later phases.

For now, AI priority must be constrained by diagnostic severity.

Recommended behavior:

``` text
Deterministic severity
        +
Role relevance
        +
Evidence strength
        ↓
AI recommendation priority
```

The AI must not downgrade a critical deterministic issue simply because
it prefers a wording change.

------------------------------------------------------------------------

# 14. AI Bullet Rewriter

Keep the existing bullet rewriter but upgrade its contract.

Input:

``` typescript
interface RewriteRequest {
  bullet: ResumeEvidence;
  targetRole?: string;
  relevantSkills?: string[];
  diagnostics?: {
    impactScore?: number;
    missingMetrics?: boolean;
  };
}
```

Output:

``` typescript
interface RewriteResponse {
  original: string;

  rewritten: string;

  improvements: string[];

  preservedFacts: string[];

  missingInformation: string[];

  requiresUserVerification: boolean;
}
```

Example:

``` json
{
  "original": "Built REST APIs using Node.js.",
  "rewritten": "Built REST APIs using Node.js and Express.",
  "improvements": [
    "Uses stronger technical specificity"
  ],
  "preservedFacts": [
    "Node.js",
    "REST APIs"
  ],
  "missingInformation": [
    "Scale",
    "Performance impact",
    "User volume"
  ],
  "requiresUserVerification": true
}
```

If the original contains enough verified evidence, the AI can produce a
stronger achievement-style rewrite.

------------------------------------------------------------------------

# 15. AI Provider Architecture

Keep provider abstraction.

``` text
AIService
   │
   ├── GeminiProvider
   │
   └── OpenAIProvider
```

Application code must not directly depend on provider-specific SDK
calls.

Example:

``` typescript
interface AIProvider {
  generateStructured<T>(
    prompt: string,
    schema: unknown
  ): Promise<T>;

  generateText(
    prompt: string
  ): Promise<string>;
}
```

The provider should be selected through configuration.

------------------------------------------------------------------------

# 16. Fallback Strategy

Existing deterministic fallback must remain.

The system should behave safely if:

-   API key is missing
-   Provider is unavailable
-   Request times out
-   Provider returns invalid JSON
-   Provider response fails schema validation
-   AI service is disabled

Flow:

``` text
AI Request
    ↓
Provider
    ↓
Success?
 ┌──┴───┐
YES    NO
 │      │
 ▼      ▼
Validate Fallback
 │
 ▼
Structured Result
```

Never break the Resume Intelligence page because AI is unavailable.

------------------------------------------------------------------------

# 17. AI Response Validation

Every structured AI response must pass schema validation before reaching
the frontend.

``` text
LLM
 ↓
JSON parse
 ↓
Schema validation
 ↓
Guardrail validation
 ↓
Business-rule validation
 ↓
Frontend
```

If validation fails:

``` text
Retry once with correction prompt
        ↓
If still invalid
        ↓
Safe fallback
```

Do not send malformed AI output directly to React.

------------------------------------------------------------------------

# 18. Prompt Architecture

Do not keep one massive prompt.

Separate system responsibilities.

Suggested structure:

``` text
SYSTEM PROMPT
  ↓
AI ROLE
  ↓
SAFETY / FACTUALITY RULES
  ↓
OUTPUT SCHEMA
  ↓
RESUME CONTEXT
  ↓
DETERMINISTIC DIAGNOSTICS
  ↓
TARGET ROLE
  ↓
OPTIONAL JD
  ↓
TASK
```

The AI should be explicitly instructed:

``` text
Use only supplied resume evidence.
Never invent candidate facts.
Treat missing information as unknown.
Do not convert absence of evidence into proof that the candidate lacks a skill.
Return only the requested structured schema.
```

------------------------------------------------------------------------

# 19. Phase 1 AI Operations

Create a small set of explicit operations.

``` text
analyzeResume
generateRecommendations
rewriteBullet
improveSummary
explainDiagnostic
```

Do not create a generic:

``` text
askAI()
```

for all business logic.

Each operation should have:

-   Typed input
-   Typed output
-   Prompt
-   Schema
-   Guardrails
-   Fallback
-   Logging

------------------------------------------------------------------------

# 20. API Design

Keep existing endpoints working.

Add AI endpoints only where needed.

Suggested:

``` text
POST /api/resumes/:id/ai/analyze
POST /api/resumes/:id/ai/recommendations
POST /api/resumes/:id/ai/rewrite-bullet
POST /api/resumes/:id/ai/improve-summary
POST /api/resumes/:id/ai/explain
```

All endpoints must:

-   Require authentication
-   Verify resume ownership
-   Reuse the existing resume parser/ATS data
-   Never trust client-provided scores
-   Never allow one user to access another user's resume
-   Validate request bodies
-   Validate AI responses

------------------------------------------------------------------------

# 21. Frontend Phase 1

Do not redesign the entire Resume Intelligence page.

Extend the current UI.

Existing:

``` text
4-Pillar Audit
        ↓
Pillar Detail
        ↓
AI Recommendations
```

Upgrade AI Recommendations to consume structured recommendations.

Recommended card:

``` text
┌─────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY                        │
│                                         │
│ Quantify your experience achievement    │
│                                         │
│ Problem                                │
│ No measurable outcome detected.         │
│                                         │
│ Why it matters                          │
│ Recruiters can evaluate impact more     │
│ easily when outcomes are quantified.    │
│                                         │
│ Evidence                                │
│ Experience → Bullet #2                  │
│                                         │
│ [Improve with AI]                       │
└─────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 22. Target Role UI

The target role remains the default driver.

Example:

``` text
Target Role
[ Full-Stack Engineer ▼ ]

Optional
[ + Paste Job Description ]
```

The user should never be forced to provide a JD.

### Default:

``` text
Role selected
      ↓
Analyze resume
      ↓
Role benchmark
      ↓
Recommendations
```

### Optional JD:

``` text
Role selected
      +
JD pasted
      ↓
Role benchmark
      +
JD requirements
      ↓
Job-specific recommendations
```

------------------------------------------------------------------------

# 23. Do NOT Implement Full JD Matching in Phase 1

Phase 1 may accept:

``` text
jobDescription?: string
```

inside the AI context contract.

But do not build:

-   Full JD parser
-   Required/preferred classification
-   JD weighting
-   Employer-specific scoring
-   Resume-to-JD score
-   JD skill taxonomy
-   JD semantic matcher

Those belong to Phase 3/4.

This prevents Phase 1 from becoming too large.

------------------------------------------------------------------------

# 24. Phase 1 Database Changes

Avoid large schema changes.

If AI history is not already stored, create a minimal model or extend
the existing version system.

Potential model:

``` text
ResumeAIAnalysis
```

Fields:

``` typescript
{
  resumeId,
  userId,

  analysisType,
  provider,
  model,

  targetRole,

  inputHash,

  recommendations,

  createdAt,

  latencyMs,

  status
}
```

Do not store sensitive raw prompts/responses unnecessarily.

Use an input hash for caching identical analysis requests.

------------------------------------------------------------------------

# 25. Caching

AI analysis should not run repeatedly for the exact same resume state.

Generate:

``` text
inputHash =
hash(
  resumeVersion
  +
targetRole
  +
optionalJD
  +
engineVersion
)
```

If the same analysis already exists:

``` text
Return cached result
```

If resume changes:

``` text
New version
 ↓
New hash
 ↓
New analysis
```

------------------------------------------------------------------------

# 26. Engine Versioning

Introduce explicit engine versions.

Example:

``` text
ATS_ENGINE_VERSION = "1.0.0"
AI_ENGINE_VERSION  = "1.0.0"
SKILL_ENGINE_VERSION = "1.0.0"
```

This matters because score/recommendation behavior will change as the
engine evolves.

Store the engine version with analysis results.

------------------------------------------------------------------------

# 27. Testing Requirements

Phase 1 is not complete until all tests pass.

## Unit tests

Add tests for:

``` text
AI context builder
AI schema validation
AI guardrails
AI recommendation normalization
AI bullet rewrite validation
Provider fallback
Input hashing
```

## Security tests

Verify:

``` text
User A cannot analyze User B's resume
User A cannot rewrite User B's resume
Client cannot override server scores
Invalid AI response is rejected
Missing provider key does not crash the API
```

## Regression tests

Existing tests must continue passing:

``` text
resume.parser.spec.ts
resume.ats.spec.ts
resume.service.spec.ts
```

Target:

``` text
Existing 52/52 tests remain green
+
All new Phase 1 tests green
+
Frontend TypeScript = 0 errors
```

------------------------------------------------------------------------

# 28. Phase 1 Definition of Done

Phase 1 is complete only when all of these are true:

-   [ ] Existing resume upload still works
-   [ ] Existing parsing still works
-   [ ] Existing ATS scoring still works
-   [ ] Existing four-pillar audit still works
-   [ ] Existing target-role analysis still works
-   [ ] AI receives structured context
-   [ ] AI receives deterministic diagnostics
-   [ ] AI outputs structured recommendations
-   [ ] AI output passes schema validation
-   [ ] AI cannot invent metrics/facts
-   [ ] Bullet rewrites preserve factual evidence
-   [ ] AI failure does not break the page
-   [ ] Gemini/OpenAI provider abstraction works
-   [ ] Deterministic fallback works
-   [ ] AI analysis can be cached
-   [ ] Analysis is versioned
-   [ ] Resume ownership is enforced
-   [ ] New tests pass
-   [ ] Existing tests remain green
-   [ ] TypeScript has 0 errors
-   [ ] No unnecessary UI redesign
-   [ ] Optional JD field does not break default role-based analysis

------------------------------------------------------------------------

# PHASE 2 --- EVIDENCE + SKILL INTELLIGENCE

After Phase 1 is stable:

## Build

``` text
Resume Evidence Graph
        +
Expanded Skill Taxonomy
        +
Skill Alias Normalization
        +
Skill Relationships
```

Upgrade:

``` text
48-skill benchmark
```

into a maintainable skill intelligence system.

Example:

``` text
AWS
├── Amazon Web Services
├── AWS Cloud
├── EC2
├── S3
├── Lambda
└── RDS
```

Phase 2 must consume the Phase 1 AI context/evidence contracts rather
than replacing them.

------------------------------------------------------------------------

# PHASE 3 --- ROLE BENCHMARK + OPTIONAL JD INTELLIGENCE

Build:

``` text
Role Profiles
      +
Job Description Parser
```

Default:

``` text
Resume + Role
```

Optional:

``` text
Resume + Role + JD
```

Extract:

-   Required skills
-   Preferred skills
-   Responsibilities
-   Seniority
-   Experience requirements
-   Technologies
-   Domain terms
-   Certifications
-   Education requirements

------------------------------------------------------------------------

# PHASE 4 --- RESUME ↔ JOB MATCH ENGINE

Build:

``` text
ResumeProfile
       +
RoleProfile
       +
Optional JobProfile
       ↓
Match Engine
```

Output:

``` text
Overall Match
Required Skill Match
Preferred Skill Match
Experience Match
Keyword Match
Seniority Match
Missing Critical Skills
```

The JD remains optional.

------------------------------------------------------------------------

# PHASE 5 --- IMPACT + CONTENT INTELLIGENCE

Upgrade the existing impact detector.

Analyze each bullet for:

``` text
Action strength
Technical specificity
Ownership
Outcome
Metrics
Scale
Business impact
Clarity
Relevance
```

Produce evidence-backed improvement opportunities.

------------------------------------------------------------------------

# PHASE 6 --- AI RECOMMENDATION ORCHESTRATOR

Combine:

``` text
ATS
+
Skill Intelligence
+
Role Benchmark
+
JD Match
+
Content Intelligence
+
Impact Intelligence
```

into one prioritized:

# AI Action Plan

Example:

``` text
HIGH
1. Add evidence for backend impact
2. Address missing required PostgreSQL skill
3. Improve role alignment in summary

MEDIUM
4. Strengthen project descriptions
5. Improve keyword coverage

LOW
6. Minor wording improvements
```

------------------------------------------------------------------------

# PHASE 7 --- AI RESUME OPTIMIZATION LOOP

Allow users to approve improvements.

``` text
Original Resume
      ↓
Analyze
      ↓
Score
      ↓
Recommendations
      ↓
AI Rewrite
      ↓
User Approves
      ↓
New Resume Version
      ↓
Re-analyze
      ↓
Compare Scores
```

Example:

``` text
Before: 72

After:
ATS        82 → 89
Keywords  68 → 81
Impact     41 → 63
Structure  94 → 94

Overall: 72 → 82
```

The score must be recalculated by the deterministic engine, never
fabricated by AI.

------------------------------------------------------------------------

# PHASE 8 --- RESUME COPILOT

Only after the core engine is stable.

Users can ask:

``` text
Why is my resume score low?

What should I fix first?

Optimize my resume for this job.

Rewrite this experience.

What skills am I missing?

How can I make this resume more senior?

Why am I a weak match for this role?
```

The Copilot must call the underlying deterministic and AI services
rather than maintaining a separate scoring system.

------------------------------------------------------------------------

# 29. Final Architecture After All Phases

``` text
                         SKILLEZO
                  RESUME INTELLIGENCE
                           │
                           ▼
                  ┌─────────────────┐
                  │ Resume Parser   │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ Evidence Layer  │
                  └────────┬────────┘
                           │
       ┌───────────────────┼────────────────────┐
       ▼                   ▼                    ▼
  ATS Engine         Skill Engine         Content Engine
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ Role Benchmark  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Optional JD     │
                  │ Intelligence    │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ Match Engine    │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ Scoring Engine  │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ AI Orchestrator │
                  ├─────────────────┤
                  │ Explain         │
                  │ Recommend       │
                  │ Prioritize      │
                  │ Rewrite         │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ Optimization    │
                  │ Loop            │
                  └────────┬────────┘
                           ▼
                      New Version
                           │
                           ▼
                       Re-score
```

------------------------------------------------------------------------

# 30. Implementation Discipline

For every phase:

1.  Inspect the current implementation first.
2.  Reuse existing services and schemas.
3.  Do not duplicate scoring logic.
4.  Do not duplicate parser logic.
5.  Do not create parallel resume models unnecessarily.
6.  Preserve existing APIs unless a migration is required.
7.  Add backward-compatible fields.
8.  Add tests before/alongside behavior changes.
9.  Run the full backend test suite.
10. Run frontend TypeScript validation.
11. Verify the existing UI manually.
12. Verify AI failure/fallback behavior.
13. Document all new contracts.
14. Only move to the next phase after the current phase passes its
    Definition of Done.

------------------------------------------------------------------------

# 31. PHASE 1 IMPLEMENTATION COMMAND

For the first implementation sprint, implement **ONLY PHASE 1**.

Do not implement Phase 2+ functionality.

The immediate objective is:

> **Turn the existing `ai.service.ts` into a structured,
> provider-independent, evidence-aware AI intelligence layer while
> preserving all existing Resume Intelligence functionality.**

After Phase 1 is fully tested and stable, proceed to Phase 2.
