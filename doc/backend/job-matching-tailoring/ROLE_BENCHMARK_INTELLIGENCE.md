# SKILLEZO AI — Phase 3 Implementation Plan
## Role Benchmark + Optional Job Description Intelligence

**Project:** Skillezo AI — Resume Intelligence  
**Phase:** 3  
**Depends on:** Phase 1 — AI Intelligence Foundation + Phase 2 — Evidence & Skill Intelligence  
**Status:** Implementation Plan

---

# 1. Phase 3 Objective

Build a deterministic, reusable **Role Benchmark Intelligence layer** and an optional **Job Description Intelligence layer**.

The system must support two analysis modes:

### Default mode — Role Benchmark

```text
Resume
  ↓
Resume Parser
  ↓
Skill Intelligence
  ↓
Target Role
  ↓
Role Benchmark
  ↓
Resume Intelligence Analysis
```

### Optional JD mode

```text
Resume
  ↓
Resume Parser
  ↓
Skill Intelligence
  ↓
Target Role
  ↓
Role Benchmark
  +
Optional Job Description
  ↓
Job Requirement Profile
  ↓
Resume Intelligence Analysis
```

The Job Description must be **optional**.

If a JD is supplied, it must **add employer/job-specific requirements** rather than replace the general role benchmark.

---

# 2. Core Architectural Rule

Continue the architecture established in Phases 1 and 2:

> **Deterministic systems calculate and validate facts, requirements, evidence, classifications, and authoritative scores. AI explains, prioritizes, summarizes, and generates language.**

AI must never:

- invent candidate experience
- invent candidate skills
- invent years of experience
- invent certifications
- convert an absent resume skill into a claim that the candidate lacks the skill
- change the authoritative ATS score
- override deterministic skill evidence
- create fake JD requirements
- fabricate employer requirements

AI may:

- classify ambiguous JD language
- summarize responsibilities
- identify semantic relationships
- explain why a requirement matters
- prioritize recommendations
- generate human-readable explanations

---

# 3. Phase 3 Scope

## In Scope

### Role Benchmark Intelligence

- canonical role profiles
- seniority profiles
- role-specific skill expectations
- required vs preferred role skills
- role responsibilities
- experience expectations
- education expectations
- certification expectations
- domain expectations
- benchmark keywords
- role normalization
- role aliases
- role profile versioning

### Optional Job Description Intelligence

- JD input validation
- JD text normalization
- structured JD extraction
- required skills
- preferred skills
- responsibilities
- experience requirements
- education requirements
- certifications
- seniority
- domain
- keywords
- evidence linked to JD text
- JD extraction confidence
- requirement normalization
- JD version/hash caching

### Integration

- Phase 2 skill catalog
- Phase 2 skill normalizer
- Phase 2 evidence model
- Phase 2 skill profile
- Phase 1 AI context
- Phase 1 AI guardrails
- existing ATS analysis
- existing frontend analysis flow

---

# 4. Explicitly Out of Scope

Do NOT implement these in Phase 3.

## Full Resume ↔ Job Matching

Do not build:

- complete JD match score
- semantic resume-to-JD scoring
- requirement-by-requirement candidate match scoring
- weighted job compatibility score

These belong to **Phase 4**.

## Resume Optimization

Do not build:

- automatic resume rewriting
- automatic skill insertion
- automatic bullet replacement
- before/after optimization scoring

These belong to **Phase 7**.

## Resume Copilot

Do not build:

- conversational resume editing
- interactive rewrite workflow
- chat-based resume modifications

These belong to **Phase 8**.

## Candidate Skill Invention

Never automatically add a skill to the candidate's profile merely because it appears in:

- role benchmark
- JD
- responsibilities
- preferred skills

Absence of evidence is **NOT evidence of absence**.

---

# 5. Required Architecture

Create a dedicated role intelligence module.

Suggested structure:

```text
server/src/modules/resume/
│
├── role/
│   ├── role.types.ts
│   ├── role.catalog.ts
│   ├── role.normalizer.ts
│   ├── role.benchmark.ts
│   ├── role.service.ts
│   └── role.constants.ts
│
├── job/
│   ├── job.types.ts
│   ├── job.parser.ts
│   ├── job.normalizer.ts
│   ├── job.extractor.ts
│   ├── job.schemas.ts
│   ├── job.service.ts
│   └── job.constants.ts
│
└── intelligence/
    └── ...
```

Exact directory placement may follow the existing project conventions, but responsibilities must remain separated.

---

# 6. Role Profile

Create a canonical `RoleProfile`.

Suggested shape:

```ts
interface RoleProfile {
  roleId: string;
  title: string;

  aliases: string[];

  seniority: {
    level: string;
    minYears?: number;
    maxYears?: number;
  };

  requiredSkills: RoleSkillRequirement[];
  preferredSkills: RoleSkillRequirement[];

  responsibilities: string[];

  experienceRequirements: ExperienceRequirement[];

  education?: EducationRequirement[];

  certifications?: CertificationRequirement[];

  domains?: string[];

  keywords: string[];

  version: string;
}
```

Do not duplicate skill definitions inside the role catalog.

All skills must reference the **Phase 2 canonical skill catalog**.

Example:

```ts
{
  skillId: "react",
  importance: "REQUIRED"
}
```

not:

```ts
{
  skill: "React"
}
```

This keeps Phase 2 as the single source of truth for skills.

---

# 7. Initial Role Catalog

At minimum support the roles already established in Phase 2:

```text
Full-Stack Engineer
Frontend Engineer
Backend Engineer
DevOps & Cloud Engineer
AI/ML Engineer
Mobile Developer
```

Each role should support common aliases.

Example:

```text
Full Stack Developer
Full-Stack Developer
Full Stack Engineer
Full-Stack Engineer
Software Engineer — Full Stack
```

All aliases must normalize to one canonical role.

---

# 8. Role Normalization

Create:

```ts
normalizeRole(input: string): NormalizedRole
```

Example:

```text
"full stack developer"
        ↓
"Full-Stack Engineer"
```

Normalization should:

- trim whitespace
- normalize casing
- remove unnecessary punctuation
- resolve aliases
- map common title variations
- preserve unknown titles

Unknown roles must not crash the analysis.

For unsupported roles, return a safe fallback:

```ts
{
  roleId: "generic-software-engineer",
  confidence: "LOW"
}
```

or an equivalent generic benchmark.

Do not silently pretend an unknown role is a specific role.

---

# 9. Seniority Intelligence

Support common seniority levels:

```text
Intern
Entry
Junior
Mid
Senior
Lead
Staff
Principal
Manager
```

Normalize common forms:

```text
Jr.
Junior
Sr.
Senior
SDE II
SDE III
Tech Lead
Lead Engineer
Staff Engineer
Principal Engineer
```

The normalized seniority should be reusable by later phases.

Example:

```ts
interface SeniorityProfile {
  level:
    | "INTERN"
    | "ENTRY"
    | "JUNIOR"
    | "MID"
    | "SENIOR"
    | "LEAD"
    | "STAFF"
    | "PRINCIPAL"
    | "MANAGER";

  minYears?: number;
  maxYears?: number;
}
```

Do not infer a candidate's actual seniority solely from the target role.

Candidate seniority must remain based on resume evidence.

---

# 10. Role Benchmark Skill Requirements

Role benchmarks must distinguish:

```text
REQUIRED
PREFERRED
```

Example:

```text
Frontend Engineer

Required:
- JavaScript
- TypeScript
- React
- HTML
- CSS

Preferred:
- Next.js
- Testing Library
- Jest
- Playwright
```

These must reference canonical Phase 2 skill IDs.

Do not create a second skill taxonomy.

---

# 11. Role Benchmark Evidence

Role benchmark requirements are **benchmark evidence**, not candidate evidence.

Keep these conceptually separate:

```text
Candidate Evidence
    ↓
Resume

Benchmark Evidence
    ↓
Role Profile

JD Evidence
    ↓
Job Description
```

Never allow JD or benchmark text to become candidate evidence.

---

# 12. Job Requirement Profile

Create a normalized representation of a pasted job description.

Suggested shape:

```ts
interface JobRequirementProfile {
  jobId: string;

  title?: string;

  seniority?: SeniorityProfile;

  requiredSkills: JobSkillRequirement[];

  preferredSkills: JobSkillRequirement[];

  responsibilities: JobResponsibility[];

  experienceRequirements: ExperienceRequirement[];

  educationRequirements: EducationRequirement[];

  certificationRequirements: CertificationRequirement[];

  domains: string[];

  keywords: string[];

  evidence: JobRequirementEvidence[];

  sourceHash: string;

  parserVersion: string;

  extractionConfidence: number;
}
```

This object becomes the primary contract consumed by Phase 4.

---

# 13. Job Skill Requirement

Suggested structure:

```ts
interface JobSkillRequirement {
  skillId: string;
  requirementType: "REQUIRED" | "PREFERRED";
  confidence: number;
  evidenceIds: string[];
}
```

Example:

```ts
{
  skillId: "typescript",
  requirementType: "REQUIRED",
  confidence: 0.98,
  evidenceIds: ["jd-001"]
}
```

The skill must always resolve through the Phase 2 skill catalog.

---

# 14. JD Evidence Model

Create a JD-specific evidence model.

Example:

```ts
interface JobRequirementEvidence {
  evidenceId: string;

  sourceSection:
    | "TITLE"
    | "SUMMARY"
    | "REQUIREMENTS"
    | "RESPONSIBILITIES"
    | "QUALIFICATIONS"
    | "PREFERRED"
    | "OTHER";

  sourceText: string;

  extractionMethod:
    | "EXACT"
    | "ALIAS"
    | "SEMANTIC"
    | "PATTERN";

  confidence: number;

  requirementType:
    | "REQUIRED"
    | "PREFERRED"
    | "INFORMATIONAL";
}
```

This must remain separate from `ResumeEvidence`.

---

# 15. Job Description Input

The existing resume intelligence flow should accept:

```ts
{
  targetRole: string;

  jobDescription?: string;
}
```

Valid examples:

```ts
{
  targetRole: "Frontend Engineer"
}
```

and:

```ts
{
  targetRole: "Frontend Engineer",
  jobDescription: "We are looking for a React developer..."
}
```

The JD must not be mandatory.

---

# 16. JD Validation

Before parsing:

- trim input
- reject empty strings
- enforce maximum length
- normalize excessive whitespace
- normalize line breaks
- reject obviously malformed payloads

Recommended initial maximum:

```text
30,000–50,000 characters
```

Choose one project-wide limit and document it.

Never allow unbounded JD input.

---

# 17. JD Section Detection

Implement deterministic section detection where practical.

Recognize headings such as:

```text
Requirements
Qualifications
What You'll Need
Must Have
Required Skills
Preferred Qualifications
Nice to Have
Responsibilities
What You'll Do
About the Role
```

Normalize headings before classification.

If section detection fails, the parser must still safely process the JD as unstructured text.

---

# 18. Required vs Preferred Classification

This is one of the most important Phase 3 requirements.

Examples:

```text
"3+ years of React experience"
→ REQUIRED
```

```text
"Experience with TypeScript is preferred"
→ PREFERRED
```

```text
"Nice to have: Next.js"
→ PREFERRED
```

```text
"Must have AWS experience"
→ REQUIRED
```

Support deterministic keyword/pattern classification first.

Use AI only when deterministic classification is ambiguous.

AI classification must return structured output and confidence.

---

# 19. Do Not Treat All JD Skills as Required

Never implement:

```ts
allDetectedSkills = requiredSkills
```

A JD may contain:

- required skills
- preferred skills
- contextual technologies
- technologies mentioned only in responsibilities
- unrelated technologies
- company stack references

Classify them separately.

---

# 20. Experience Requirement Extraction

Support common patterns:

```text
3+ years of experience
5 years experience
2–4 years
minimum 4 years
at least 3 years
```

Normalize to:

```ts
interface ExperienceRequirement {
  minYears?: number;
  maxYears?: number;
  category?: string;
  requirementType: "REQUIRED" | "PREFERRED";
  evidenceIds: string[];
}
```

Example:

```text
"3+ years of backend development"

→

{
  minYears: 3,
  category: "backend development",
  requirementType: "REQUIRED"
}
```

Do not convert vague language like:

```text
"strong experience"
"extensive experience"
```

into a numeric years requirement.

---

# 21. Education Extraction

Recognize common education requirements:

```text
Bachelor's degree
B.Tech
B.E.
Computer Science degree
Master's degree
Equivalent experience
```

Normalize them into structured requirements.

Do not infer candidate education from job requirements.

---

# 22. Certification Extraction

Recognize certification requirements when explicitly stated.

Examples:

```text
AWS Certified Solutions Architect
CKA
Azure certification
Google Cloud certification
```

Use canonical identifiers where possible.

Do not automatically add certifications to the candidate profile.

---

# 23. Responsibility Extraction

Extract job responsibilities into structured objects.

Example:

```ts
interface JobResponsibility {
  text: string;
  evidenceId: string;
  confidence: number;
}
```

Responsibilities should remain separate from requirements.

Example:

```text
"Build scalable REST APIs"

This is a responsibility.

It does NOT automatically mean:

```text
Required Skill = REST
Required Skill = Node.js
Required Skill = Express.js
```

unless the JD explicitly or confidently establishes those requirements.

---

# 24. Domain Extraction

Identify broad job domains where supported.

Examples:

```text
FinTech
E-commerce
Healthcare
SaaS
Cybersecurity
Cloud Infrastructure
AI
Data Engineering
Mobile
```

Domain information is contextual.

Do not treat a domain as a candidate skill.

---

# 25. Keyword Extraction

Extract normalized job keywords separately from skills.

Examples:

```text
scalable
distributed systems
microservices
performance
accessibility
CI/CD
testing
security
```

A keyword is not automatically a skill.

The Phase 4 matcher may later use both skill requirements and keywords.

---

# 26. AI-Assisted JD Extraction

AI can be used for ambiguous semantic extraction.

Example:

```text
JD:
"We're seeking an engineer comfortable working across
modern frontend frameworks and component-driven systems."
```

AI may identify the semantic category, but must not invent:

```text
React
Vue
Angular
```

unless the text supports those technologies.

AI output must always be:

1. schema validated
2. confidence scored
3. linked to source text
4. normalized through deterministic systems
5. rejected if unsupported

---

# 27. AI Output Contract

Create a dedicated Zod schema for JD extraction.

Example conceptual output:

```ts
{
  title?: string;

  seniority?: {
    level: string;
    confidence: number;
  };

  requiredSkills: [
    {
      rawText: string;
      normalizedSkillId: string;
      confidence: number;
      evidenceText: string;
    }
  ];

  preferredSkills: [];

  responsibilities: [];

  experienceRequirements: [];

  educationRequirements: [];

  certificationRequirements: [];

  domains: [];

  keywords: [];
}
```

The AI must not return candidate information.

---

# 28. Deterministic Normalization After AI

Even when AI identifies:

```text
"Amazon Web Services"
```

the final normalized requirement must use:

```text
AWS
```

through the Phase 2 normalizer.

Likewise:

```text
NodeJS
Node.js
Node JS
```

must resolve to the canonical Phase 2 skill.

Never create parallel AI-only skill names.

---

# 29. Role Benchmark + JD Combination

When no JD is supplied:

```text
Analysis Requirements =
Role Benchmark
```

When JD is supplied:

```text
Analysis Requirements =
Role Benchmark
+
Job Requirement Profile
```

Do NOT replace the role benchmark with the JD.

This is critical.

---

# 30. Requirement Source Tracking

Every requirement should identify its source.

Example:

```ts
type RequirementSource =
  | "ROLE_BENCHMARK"
  | "JOB_DESCRIPTION";
```

A requirement can also carry:

```ts
sourceIds: string[];
```

Example:

```text
React

ROLE_BENCHMARK
+ 
JOB_DESCRIPTION
```

This will make Phase 4 matching much easier.

---

# 31. Requirement Deduplication

If the same skill appears in:

```text
Role Benchmark:
React — REQUIRED

JD:
React — REQUIRED
```

do not create two unrelated skill records.

Represent it as one normalized skill requirement with multiple sources.

Example:

```ts
{
  skillId: "react",
  sources: [
    "ROLE_BENCHMARK",
    "JOB_DESCRIPTION"
  ],
  requirementType: "REQUIRED"
}
```

If the sources disagree:

```text
Role benchmark = PREFERRED
JD = REQUIRED
```

the JD-specific requirement should remain REQUIRED for the employer-specific context.

Do not mutate the role catalog itself.

---

# 32. Candidate vs Requirement Separation

The system must preserve these separate concepts:

```text
Candidate Skill Profile
        ≠
Role Benchmark
        ≠
Job Requirement Profile
```

Example:

```text
Candidate:
React detected with evidence

Role:
React required

JD:
React required
```

This is valid.

But:

```text
JD:
GraphQL required

Candidate:
GraphQL not detected
```

must NOT become:

```text
Candidate:
GraphQL missing
```

unless a later matching engine explicitly computes that relationship.

Phase 3 should only prepare the data.

---

# 33. Phase 2 Integration

Consume:

```text
skill.catalog.ts
skill.normalizer.ts
skill.detector.ts
skill.gap.ts
```

Do not duplicate:

- skill aliases
- skill IDs
- skill categories
- skill hierarchy
- normalization rules

The Phase 2 skill catalog remains the single source of truth.

---

# 34. Phase 1 AI Context Integration

Extend the AI context with normalized role/JD intelligence.

Conceptually:

```ts
interface ResumeAIContext {
  ...

  targetRole?: RoleProfile;

  jobRequirements?: JobRequirementProfile;

  skillsProfile?: ResumeSkillProfile;
}
```

Do not inject raw oversized JD text into every AI request if the structured profile is sufficient.

When raw evidence is required, pass only relevant excerpts.

---

# 35. AI Context Size Control

Avoid sending:

```text
Entire Resume
+
Entire JD
+
Entire Role Catalog
+
Entire Skill Catalog
```

to the model unnecessarily.

The context builder should provide only:

- candidate facts
- candidate evidence
- normalized role benchmark
- normalized JD requirements
- relevant evidence
- relevant skill relationships

This controls cost, latency, and hallucination risk.

---

# 36. Hashing and Cache Versioning

Extend the deterministic hash used in Phase 2.

The analysis hash should account for:

```text
Resume content
+
Target role
+
Role profile version
+
Optional JD content
+
JD parser version
+
Skill engine version
+
ATS engine version
+
AI engine version
```

Conceptually:

```text
analysisHash =
SHA256(
  resumeHash +
  roleId +
  roleVersion +
  jdHash +
  jdParserVersion +
  skillEngineVersion +
  atsEngineVersion +
  aiEngineVersion
)
```

If no JD exists, use a stable empty/null representation.

---

# 37. JD Hashing

Create a deterministic hash from normalized JD text.

Example:

```ts
sourceHash = sha256(normalizedJobDescription)
```

The same JD should produce the same hash.

Whitespace-only changes should not unnecessarily invalidate the cache after normalization.

---

# 38. Versioning

Create explicit versions:

```ts
ROLE_ENGINE_VERSION = "1.0.0";
JD_ENGINE_VERSION = "1.0.0";
```

Continue using:

```ts
SKILL_ENGINE_VERSION
ATS_ENGINE_VERSION
AI_ENGINE_VERSION
```

from previous phases.

Any behavior-changing catalog/parser update must increment its corresponding version.

---

# 39. API Contract

Extend the existing analysis endpoint without breaking current consumers.

Suggested request:

```ts
{
  targetRole: string;
  jobDescription?: string;
}
```

Response should expose normalized intelligence internally and only expose the necessary fields publicly.

Conceptually:

```ts
{
  roleProfile: {...},

  jobRequirements: {...} | null,

  skillsProfile: {...},

  ats: {...},

  ai: {...}
}
```

Do not expose internal implementation details unless useful to the frontend.

---

# 40. Backward Compatibility

Existing request:

```ts
{
  targetRole: "Backend Engineer"
}
```

must continue working.

Existing request flows without a target role should either:

- continue using the existing fallback behavior, or
- use a safe generic role benchmark.

Do not break existing frontend clients.

---

# 41. Frontend Integration

The existing resume intelligence UI should remain functional.

Add:

```text
Target Role
```

as the primary input if it is not already present.

Add an optional:

```text
Paste Job Description
```

field.

UX:

```text
Target Role *
[ Frontend Engineer ]

Job Description
[ Optional — paste the job description here ]

[ Analyze Resume ]
```

Do not force users to paste a JD.

---

# 42. Frontend UX Principle

The UI should clearly communicate:

```text
Role-based analysis works without a JD.
```

Optional helper text:

```text
Paste a job description for employer-specific requirements.
```

Do not imply:

```text
Paste JD to unlock analysis
```

because role benchmarking is the default system behavior.

---

# 43. Frontend Result Presentation

Phase 3 may expose:

### Role Benchmark

```text
Target Role
Frontend Engineer

Seniority Benchmark
Senior

Core Skills
React
TypeScript
JavaScript
HTML
CSS
```

### Optional Job Requirements

```text
Job-specific requirements detected

Required
React
TypeScript
REST APIs

Preferred
Next.js
Playwright
```

Do not display a final JD match percentage yet.

That belongs to Phase 4.

---

# 44. Security

Validate all external inputs.

For JD text:

- maximum length
- safe string handling
- no executable interpretation
- no unsafe HTML rendering
- sanitize before rendering
- avoid logging full private JDs unnecessarily

Do not store raw JD text permanently unless the existing product data model explicitly requires it.

Prefer storing:

```text
normalized profile
hash
version
```

when possible.

---

# 45. Privacy

Treat pasted job descriptions as potentially sensitive business content.

Do not:

- log full JD text
- expose JD content in errors
- send JD to multiple providers unnecessarily
- retain provider payloads unnecessarily

If AI processing is enabled, provider selection should continue through the Phase 1 provider abstraction.

---

# 46. Error Handling

If JD parsing fails:

```text
Resume analysis should still work.
```

Fallback:

```text
Resume
+
Role Benchmark
```

and return a non-fatal warning such as:

```text
Job description could not be fully analyzed.
Role-based analysis is still available.
```

If role normalization fails:

```text
Use safe generic benchmark
```

rather than crashing.

---

# 47. Deterministic First, AI Second

Preferred processing order:

```text
1. Normalize role
2. Load role benchmark
3. Normalize JD
4. Detect JD sections
5. Deterministically extract requirements
6. Normalize skills using Phase 2
7. Use AI only for ambiguous semantic extraction
8. Validate AI output
9. Merge normalized requirements
10. Build analysis context
11. Run existing deterministic ATS
12. Run AI explanation/recommendation layer
```

This keeps the system reliable.

---

# 48. Testing Strategy

Add dedicated Phase 3 tests.

Minimum coverage should include:

## Role normalization

```text
"Frontend Developer"
→ Frontend Engineer

"Senior Backend Developer"
→ Backend Engineer + Senior
```

## Role aliases

Test all supported role aliases.

## Unknown roles

Verify safe fallback behavior.

## JD parsing

Test:

- plain JD
- structured JD
- multiline JD
- missing sections
- unusual headings
- very long JD
- empty JD

## Required vs preferred

Test:

```text
must have
required
essential
preferred
nice to have
bonus
plus
```

## Skill normalization

Test:

```text
NodeJS
Node.js
Amazon Web Services
AWS Cloud
TypeScript
TS
```

## Evidence

Verify every extracted requirement can point to source text.

## Experience

Test:

```text
3+ years
3 years
2-4 years
minimum 5 years
```

## Education

Test common degree formats.

## Certifications

Test explicit certification requirements.

## Deduplication

Test:

```text
Role:
React REQUIRED

JD:
React REQUIRED
```

Result must contain one normalized React requirement with both sources.

## Source conflict

Test:

```text
Role:
Next.js PREFERRED

JD:
Next.js REQUIRED
```

Result:

```text
Next.js REQUIRED
sources = ROLE_BENCHMARK + JOB_DESCRIPTION
```

without modifying the role catalog.

---

# 49. AI Safety Tests

Test that AI cannot introduce unsupported candidate facts.

Examples:

```text
JD mentions GraphQL
→ Candidate GraphQL evidence must remain absent
```

```text
AI says candidate has AWS
→ Reject unless resume evidence supports AWS
```

```text
AI changes ATS score
→ Reject / ignore
```

```text
AI invents certification
→ Reject
```

---

# 50. Regression Testing

All previous tests must continue passing.

Required baseline:

```text
Phase 1 tests: PASS
Phase 2 tests: PASS
Phase 3 tests: PASS
Frontend TypeScript: 0 errors
```

Do not consider Phase 3 complete if existing ATS behavior regresses.

---

# 51. Performance

JD parsing should be efficient enough for interactive analysis.

Avoid:

- repeated skill catalog scans
- repeated normalization
- repeated AI calls
- sending identical JD content to AI multiple times

Use:

```text
hash-based caching
```

where appropriate.

---

# 52. Provider Independence

JD intelligence must not become coupled to Gemini or OpenAI.

Continue using:

```text
AI Provider Interface
        ↓
Gemini Provider
OpenAI Provider
Future Providers
```

The JD service should depend on an abstract AI service, not directly on a provider.

---

# 53. Observability

Log operational metadata, not sensitive content.

Useful fields:

```text
roleId
roleVersion
jdHash
jdParserVersion
skillEngineVersion
analysisHash
provider
latency
cacheHit
extractionSuccess
```

Avoid logging:

```text
full resume text
full JD text
candidate personal data
provider prompts
```

unless explicitly required for secure debugging.

---

# 54. Data Flow — Final Phase 3 Architecture

```text
                    ┌──────────────────┐
                    │     Resume       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Resume Parser    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Skill Intelligence│
                    │    Phase 2       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Candidate Skill  │
                    │     Profile      │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      ┌──────────────────┐        ┌──────────────────┐
      │   Target Role    │        │ Optional JD       │
      └────────┬─────────┘        └────────┬─────────┘
               │                           │
               ▼                           ▼
      ┌──────────────────┐        ┌──────────────────┐
      │ Role Normalizer  │        │ JD Parser        │
      └────────┬─────────┘        └────────┬─────────┘
               │                           │
               ▼                           ▼
      ┌──────────────────┐        ┌──────────────────┐
      │ Role Benchmark   │        │ Job Requirement  │
      │    Profile       │        │     Profile      │
      └────────┬─────────┘        └────────┬─────────┘
               │                           │
               └──────────────┬────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Unified Context  │
                    │                  │
                    │ Candidate        │
                    │ + Role           │
                    │ + Optional JD     │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    ▼                  ▼
           ┌────────────────┐  ┌────────────────┐
           │ Deterministic  │  │ AI Intelligence│
           │ ATS / Facts    │  │ Explanation    │
           └────────────────┘  └────────────────┘
```

---

# 55. Important Boundary With Phase 4

Phase 3 must produce clean inputs for Phase 4.

Phase 4 should be able to consume:

```ts
CandidateSkillProfile
RoleProfile
JobRequirementProfile
```

and calculate:

```text
Resume ↔ Role
Resume ↔ JD
Requirement coverage
Skill matches
Skill gaps
Keyword coverage
Priority
```

Do not implement those calculations in Phase 3.

The clean separation should be:

```text
Phase 2
"What skills does the candidate have?"

Phase 3
"What does this role/JD require?"

Phase 4
"How well does the candidate match those requirements?"
```

This separation is mandatory.

---

# 56. Definition of Done

Phase 3 is complete only when all of the following are true:

## Role Intelligence

- [ ] Canonical RoleProfile exists
- [ ] Supported roles are versioned
- [ ] Role aliases normalize correctly
- [ ] Seniority normalization works
- [ ] Required/preferred role skills are structured
- [ ] Role requirements reference Phase 2 skill IDs
- [ ] Unknown roles have safe fallback behavior

## JD Intelligence

- [ ] JD input is optional
- [ ] JD length is validated
- [ ] JD normalization works
- [ ] Sections can be detected
- [ ] Required skills are extracted
- [ ] Preferred skills are extracted
- [ ] Skills use Phase 2 normalization
- [ ] Responsibilities are extracted
- [ ] Experience requirements are extracted
- [ ] Education requirements are extracted
- [ ] Certification requirements are extracted
- [ ] Domains are extracted
- [ ] Keywords are extracted
- [ ] Requirement evidence is stored
- [ ] Extraction confidence is available

## AI

- [ ] AI is only used where useful
- [ ] AI output is schema validated
- [ ] AI cannot create candidate facts
- [ ] AI cannot modify authoritative ATS scores
- [ ] Unsupported AI claims are rejected
- [ ] Provider abstraction remains intact

## Integration

- [ ] Role benchmark works without JD
- [ ] JD adds employer-specific requirements
- [ ] Role benchmark is not replaced by JD
- [ ] Candidate evidence remains separate
- [ ] Requirement evidence remains separate
- [ ] Phase 1 context still works
- [ ] Phase 2 skill intelligence remains the source of truth
- [ ] Hash/versioning includes Phase 3 engines
- [ ] Existing APIs remain backward compatible
- [ ] Frontend supports optional JD input

## Testing

- [ ] Phase 1 tests pass
- [ ] Phase 2 tests pass
- [ ] Phase 3 tests pass
- [ ] Edge cases pass
- [ ] AI safety tests pass
- [ ] Frontend TypeScript has 0 errors
- [ ] No authoritative score regression exists

---

# 57. Phase 3 Success Criteria

After implementation, the system should behave like this:

### Example A — No JD

Input:

```text
Target Role:
Frontend Engineer

Resume:
React
TypeScript
Next.js
```

System produces:

```text
Role Benchmark:
Frontend Engineer

Required:
React
TypeScript
JavaScript
HTML
CSS

Preferred:
Next.js
Testing
```

Candidate evidence remains:

```text
React ✓
TypeScript ✓
Next.js ✓
```

No JD is needed.

---

### Example B — JD Supplied

Input:

```text
Target Role:
Frontend Engineer

JD:
Must have React and TypeScript.
Experience with Next.js preferred.
3+ years of frontend development required.
```

System produces:

```text
Role Benchmark
+
Job Requirement Profile
```

Job requirements:

```text
Required:
React
TypeScript
3+ years frontend experience

Preferred:
Next.js
```

The system does NOT yet calculate:

```text
87% match
```

That is Phase 4.

---

### Example C — JD Skill Not In Resume

JD:

```text
GraphQL required.
```

Resume:

```text
React
TypeScript
```

Phase 3 must produce:

```text
JD requirement:
GraphQL REQUIRED

Candidate:
GraphQL evidence NOT DETECTED
```

It must NOT label the candidate:

```text
"You do not know GraphQL."
```

That conclusion belongs to a later matching/intelligence layer.

---

# 58. Final Engineering Principle

Do not make Phase 3 another scoring engine.

Phase 3 is the **requirement intelligence layer**.

The architecture must remain:

```text
PHASE 1
AI Foundation
        ↓
PHASE 2
Candidate Evidence + Skill Intelligence
        ↓
PHASE 3
Role Benchmark + Optional JD Requirements
        ↓
PHASE 4
Resume ↔ Job Matching
        ↓
PHASE 5
Impact + Content Intelligence
        ↓
PHASE 6
AI Recommendation Orchestrator
        ↓
PHASE 7
Resume Optimization + Re-score
        ↓
PHASE 8
Resume Copilot
```

The most important rule remains:

> **Never let AI invent candidate facts, and never let AI become the authoritative scoring engine.**

Phase 3 should create clean, deterministic, evidence-linked requirement objects so Phase 4 can perform reliable matching without rebuilding or duplicating the intelligence created in Phases 1–3.
