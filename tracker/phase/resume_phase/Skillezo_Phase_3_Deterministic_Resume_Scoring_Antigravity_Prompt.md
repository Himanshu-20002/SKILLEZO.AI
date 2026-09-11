# SKILLEZO — PHASE 3
# DETERMINISTIC RESUME SCORING ENGINE

## EXECUTION MODE

You are working as a senior full-stack engineer on the existing **Skillezo** project.

**Phase 0 — Architecture Freeze is complete.**

**Phase 1 — Resume Ingestion → Canonical ResumeDocument is complete and approved.**

**Phase 2 — Resume Section Engine (7 Section Intelligence) is complete and approved.**

This is **Phase 3 only**.

Your job is to build the production-ready **Deterministic Resume Scoring Engine** that converts the structured signals produced by Phase 2 into transparent, reproducible section scores and an overall resume score.

The central objective is:

```text
ResumeDocument
      ↓
Phase 2 Section Analysis
      ↓
Phase 3 Deterministic Scoring
      ↓
Explainable Section Scores
      ↓
Overall Resume Score
```

The score must be:

- deterministic
- explainable
- evidence-aware
- rule-based
- reproducible
- versioned
- bounded to 0–100
- independent of AI
- independent of target job/JD unless an explicitly existing compatibility contract requires otherwise

---

# 1. HARD SCOPE BOUNDARY

Phase 3 owns:

```text
SECTION SCORING
OVERALL RESUME SCORING
SCORE BREAKDOWNS
SCORING RULES
SCORING EXPLANATIONS
SCORE VERSIONING
SCORE API
SCORING TESTS
```

Phase 3 does NOT own:

```text
AI REWRITING
AI SUGGESTIONS
AI CHAT
JOB MATCHING
JD ANALYSIS
JOB-SPECIFIC SCORING
RESUME TAILORING
RESUME BUILDER
TEMPLATES
PDF GENERATION
PDF VALIDATION
ATS PDF EXPORT
COPILOT
```

Do not implement future phases.

---

# 2. FIRST TASK — INSPECT THE REAL REPOSITORY

Before coding, inspect the current repository.

Read:

```text
doc/resume-studio/00-architecture.md
doc/resume-studio/01-ingestion.md
doc/resume-studio/02-section-engine.md
doc/resume-studio/README.md
```

Inspect:

```text
server/src/modules/resume-intelligence/document/
server/src/modules/resume-intelligence/sections/
server/src/modules/resume/
server/src/database/models/
```

Especially inspect:

```text
resume-document.types.ts
resume-document.schema.ts
resume-document.normalizer.ts
section.types.ts
section.schema.ts
resume-section.engine.ts
```

Also inspect the actual Phase 2 tests and any existing ATS/resume scoring implementations.

Search for existing:

```text
score
scoring
ATS
resumeScore
sectionScore
```

Do NOT create a second scoring system if one already exists.

If an existing score engine conflicts with this Phase 3 architecture, preserve compatibility where necessary and document the migration boundary.

---

# 3. CORE ARCHITECTURE

Phase 2 produces:

```text
ResumeSectionAnalysisResult
```

Phase 3 consumes that result.

The desired architecture is:

```text
ResumeDocument
      ↓
Section Engine
      ↓
ResumeSectionAnalysisResult
      ↓
Scoring Engine
      ↓
ResumeScoreResult
```

The scoring engine must NOT independently reparse resume text.

It should consume structured signals from Phase 2.

If a scoring rule needs a fact that Phase 2 does not currently expose:

1. inspect whether the fact already exists in ResumeDocument
2. prefer extending Phase 2 with a deterministic signal
3. avoid duplicating extraction logic in Phase 3
4. document the change

Do not silently create a second analysis implementation.

---

# 4. MOST IMPORTANT RULE — NO ARBITRARY NUMBERS

Do NOT create scores such as:

```text
Contact = 92
Summary = 78
Skills = 84
```

without a documented mathematical reason.

Every score must come from explicit scoring rules.

The scoring system must be inspectable.

For every section:

```text
raw signals
      ↓
rule evaluations
      ↓
component points
      ↓
section score
```

A developer should be able to answer:

> Why did this resume receive 71 instead of 82?

without asking an AI model.

---

# 5. SCORE CONTRACT

Create a canonical scoring contract following existing project conventions.

Conceptually:

```ts
ResumeScoreResult {
  resumeId
  engineVersion
  calculatedAt

  sections: {
    CONTACT: SectionScore
    SUMMARY: SectionScore
    SKILLS: SectionScore
    EXPERIENCE: SectionScore
    PROJECTS: SectionScore
    EDUCATION: SectionScore
    ACHIEVEMENTS: SectionScore
  }

  overall: OverallScore
}
```

A section score should conceptually contain:

```ts
SectionScore {
  score: number
  maxScore: 100
  components: ScoreComponent[]
  strengths[]
  weaknesses[]
  deductions[]
}
```

Adapt to the actual repository types.

Do not blindly create duplicate types if equivalent contracts already exist.

---

# 6. SCORE EXPLAINABILITY

Every score must have a breakdown.

Example:

```text
EXPERIENCE — 72/100

Completeness       22/25
Structure          18/20
Evidence           17/25
Consistency        15/15
--------------------------
Total              72/100
```

The actual categories and weights must be determined from the repository and documented scoring policy.

Do not copy the example numbers simply because they appear here.

The important requirement is:

```text
score = sum(documented deterministic components)
```

---

# 7. SCORE COMPONENT CONTRACT

Each component should provide enough information to explain itself.

Conceptually:

```ts
ScoreComponent {
  id
  label
  score
  maxScore
  weight
  signal
  rule
  reason
  evidenceIds[]
}
```

Possible example:

```text
id: experience.metrics
label: Measurable evidence
score: 15
maxScore: 20
reason: "3 of 5 experience bullets contain quantitative evidence"
evidenceIds: [...]
```

Adapt to the actual architecture.

Do not expose internal implementation details that are meaningless to the frontend.

---

# 8. SCORE BOUNDARIES

All section scores must be:

```text
0 ≤ score ≤ 100
```

Overall score must also be:

```text
0 ≤ overall ≤ 100
```

Use deterministic clamping only as a safety boundary.

Do not use clamping to hide incorrect scoring math.

For example:

```text
Math.min(100, Math.max(0, score))
```

is acceptable as a final guard.

But if the raw score regularly exceeds 100, fix the weighting/rule calculation.

---

# 9. WEIGHTING MODEL

Do NOT choose weights casually.

Before implementation:

1. inspect existing Skillezo scoring conventions
2. inspect any existing ATS/resume score implementation
3. inspect Phase 0/1/2 documentation for intended score philosophy
4. identify whether a previous scoring contract already exists
5. preserve compatibility where necessary

Then define a documented Phase 3 scoring model.

The model must clearly define:

```text
section weights
component weights
maximum contribution
minimum contribution
missing-section behavior
```

The weights must sum correctly.

For example:

```text
Contact        X%
Summary        X%
Skills         X%
Experience     X%
Projects       X%
Education      X%
Achievements   X%
```

Do NOT assume every section deserves equal weight.

However, do not optimize for a specific job role in this phase.

This is the **general resume score**.

---

# 10. IMPORTANT — GENERAL RESUME SCORE

Phase 3's primary score is:

```text
GENERAL RESUME SCORE
```

It should answer:

> How structurally complete, clear, evidence-backed, and professionally prepared is this resume as a standalone document?

It should NOT answer:

> How well does this resume match a particular job?

That belongs to matching/JD intelligence.

Do not use:

```text
targetRole
targetJobDescription
job keywords
job requirements
```

in the Phase 3 general score.

---

# 11. CONTACT SCORING

Build a deterministic score from Phase 2 signals.

Possible dimensions:

```text
name presence
email validity
phone presence/validity
location presence
professional link quality
```

Do not automatically penalize every candidate for missing every possible social link.

For example:

```text
LinkedIn absent
```

should not automatically mean:

```text
Contact = 0
```

Define reasonable maximum contributions.

The exact weights must be documented.

The scoring rules should be transparent.

Example rule style:

```text
Valid email → +X
Valid phone → +X
Name → +X
Location → +X
At least one professional link → +X
```

Do not copy these values literally; derive and document the final policy.

---

# 12. SUMMARY SCORING

Use Phase 2 signals such as:

```text
hasSummary
wordCount
sentenceCount
length calibration
first-person language
repetition signals
extraction warnings
```

Score structural quality, not subjective writing quality.

Avoid pretending deterministic heuristics can fully understand writing quality.

For example:

```text
summary missing
```

can receive a documented deduction.

But:

```text
summary sounds boring
```

is not a deterministic Phase 3 rule.

AI writing quality belongs later.

---

# 13. SKILLS SCORING

Use Phase 2 signals such as:

```text
skillCount
categoryDistribution
duplicateSkills
uncategorizedSkills
```

Potential dimensions:

```text
presence
breadth
organization
duplication cleanliness
taxonomy coverage
```

Do NOT compare skills against jobs.

Do NOT add missing skills.

Do NOT reward a candidate merely for having hundreds of skills.

Avoid a simple:

```text
more skills = higher score
```

The scoring model should include sensible diminishing returns or bounded contribution if skill count is used.

Document the rule mathematically.

---

# 14. EXPERIENCE SCORING

This is one of the most important sections.

Use Phase 2 signals such as:

```text
experienceCount
entriesWithCompany
entriesWithTitle
entriesWithDates
entriesWithBullets
bulletCount
shortBullets
longBullets
actionVerb signals
metric signals
missing fields
```

Potential deterministic dimensions:

```text
completeness
structure
bullet depth
action-oriented language signal
quantitative evidence signal
consistency
```

Important:

```text
metricDetected = signal
```

does NOT mean:

```text
metricQuality = high
```

Do not reward fake-looking numbers.

Do not verify whether a metric is true.

The score should measure the presence/structure of evidence, not claim that the evidence is truthful.

---

# 15. PROJECT SCORING

Use:

```text
projectCount
description presence
technology presence
bullet depth
repo/demo link presence
date presence
```

Do not score projects against a target job.

Do not judge whether the technology stack is fashionable.

Do not call an AI model.

Potential dimensions:

```text
completeness
technical detail
evidence depth
links
structure
```

Use bounded contributions so candidates with 20 tiny projects do not automatically outperform candidates with 3 substantial projects.

---

# 16. EDUCATION SCORING

Use:

```text
educationCount
degree
institution
field
dates
GPA
honors
```

Do NOT assume GPA is mandatory.

Do NOT heavily penalize missing GPA.

Do NOT infer academic quality.

The score should primarily evaluate:

```text
completeness
clarity
structure
```

not prestige.

---

# 17. ACHIEVEMENTS SCORING

Use:

```text
achievementCount
certificationCount
awardCount
issuer presence
dates
verification URLs
description presence
```

Do not reward arbitrary quantity without bounds.

Do not assume certificates are valuable simply because they exist.

Do not verify credentials in this phase.

Score structural completeness and evidence availability.

---

# 18. OVERALL SCORE

The overall score must be a deterministic weighted aggregation of section scores.

Conceptually:

```text
overall =
  contactScore × contactWeight
+ summaryScore × summaryWeight
+ skillsScore × skillsWeight
+ experienceScore × experienceWeight
+ projectsScore × projectsWeight
+ educationScore × educationWeight
+ achievementsScore × achievementsWeight
```

Ensure:

```text
sum(sectionWeights) = 1
```

or equivalent percentage total:

```text
100%
```

Do not use a hidden adjustment.

Do not let AI influence the result.

Do not introduce manual “quality multipliers”.

---

# 19. MISSING SECTION BEHAVIOR

Define this explicitly.

For example:

```text
Missing summary
```

must result in a deterministic score according to the scoring policy.

It should NOT:

```text
throw
```

and it should NOT:

```text
fabricate a score based on average sections
```

Likewise:

```text
No achievements
```

must be handled intentionally.

The weighting model must make the behavior understandable.

Document all missing-section rules.

---

# 20. EMPTY RESUME

A minimal valid ResumeDocument must be scoreable.

Example:

```text
empty/mostly empty document
```

should return a valid:

```text
ResumeScoreResult
```

with bounded scores.

It must not crash.

It must not produce:

```text
NaN
Infinity
undefined
```

---

# 21. MATHEMATICAL SAFETY

Explicitly test for:

```text
NaN
Infinity
negative scores
scores > 100
division by zero
empty arrays
missing optional fields
null values
```

The scoring engine must remain stable for malformed-but-schema-valid edge cases.

---

# 22. EVIDENCE LINKING

Score components should retain relevant evidence IDs where possible.

Example:

```text
Experience metrics component
      ↓
metric signal
      ↓
evidenceIds
```

This allows the future UI to explain:

```text
Why did I get this score?
```

Do not create evidence for scoring itself.

Scoring only references existing evidence.

---

# 23. SCORE EXPLANATIONS

Generate deterministic explanations.

Good:

```text
"4 of 5 experience entries contain structured bullets."
"Email and phone are present."
"Summary contains 82 words across 4 sentences."
"2 project entries have repository/demo links."
```

Bad:

```text
"Your resume is impressive."
"Recruiters will love this."
"You are highly employable."
"This resume is guaranteed to pass ATS."
```

Do not make hiring predictions.

Do not claim ATS guarantees.

---

# 24. SCORE LABELS

If the frontend needs qualitative labels such as:

```text
Needs Work
Developing
Good
Strong
Excellent
```

derive them from documented deterministic thresholds.

Do not let AI choose the label.

Document the thresholds.

Do not use overly precise labels that imply scientific certainty.

The score is a product heuristic, not a hiring probability.

---

# 25. SCORE VERSIONING

Create an explicit engine version.

Example:

```text
resume-score-v1
```

Use the project's versioning conventions if one exists.

The version must be returned with the result.

This is important because changing scoring rules changes historical scores.

Do not silently change scoring math without changing the version.

---

# 26. PURE ENGINE REQUIREMENT

Prefer:

```ts
calculateScore(sectionAnalysis)
```

over:

```ts
calculateScore(resumeId)
```

inside the pure scoring layer.

The core engine should not:

- query MongoDB
- call APIs
- call AI
- mutate ResumeDocument
- mutate analysis
- depend on browser state

Architecture:

```text
Repository / Service
        ↓
ResumeDocument
        ↓
Section Engine
        ↓
Scoring Engine
        ↓
Score Result
```

Keep infrastructure outside the pure scoring logic.

---

# 27. NO DOCUMENT MUTATION

Test that:

```text
ResumeDocument before scoring
=
ResumeDocument after scoring
```

Also verify:

```text
SectionAnalysis before scoring
=
SectionAnalysis after scoring
```

The scoring engine is read-only.

---

# 28. NO AI / NETWORK

For new Phase 3 scoring:

```text
AI calls = 0
network calls = 0
```

The engine should run entirely from already available local data.

Do not introduce Gemini/OpenRouter/OpenAI calls.

---

# 29. NO JD / ROLE

The scoring engine must work with:

```text
ResumeDocument only
```

or:

```text
ResumeDocument + SectionAnalysis
```

It must not require:

```text
targetRole
targetJobDescription
```

---

# 30. API

Inspect existing Resume Intelligence routes first.

If appropriate, expose a score endpoint following repository conventions.

Conceptually:

```text
GET /api/resumes/:resumeId/score
```

Do NOT use this exact route if the project's actual API conventions indicate another route.

The API should:

```text
authenticate
 ↓
authorize resume ownership
 ↓
load canonical ResumeDocument
 ↓
run Section Engine if required
 ↓
run Scoring Engine
 ↓
validate ScoreResult
 ↓
return result
```

Never trust a client-provided:

```text
userId
resumeDocument
sectionAnalysis
score
```

---

# 31. PERSISTENCE / CACHING

Inspect existing architecture before persisting scores.

Preferred conceptual model:

```text
ResumeDocument
   = source of truth

SectionAnalysis
   = derived

ResumeScoreResult
   = derived
```

If score persistence already exists:

reuse it.

If introducing persistence:

- make it clearly derived
- include engine version
- make it regeneratable
- avoid duplicating resume facts
- invalidate/recalculate when ResumeDocument changes if the architecture requires caching

Do not create a second source of truth.

---

# 32. CLIENT INTEGRATION

Phase 3 should expose enough data for Resume Studio to eventually display:

```text
Overall Resume Score
Contact score
Summary score
Skills score
Experience score
Projects score
Education score
Achievements score
```

Also expose:

```text
score breakdown
strengths
weaknesses
reasons
```

For Phase 3, a minimal integration is enough.

Do not redesign the entire UI.

Do not implement editing.

Do not implement AI buttons.

---

# 33. UI LANGUAGE

The scoring UI should communicate that the score is:

```text
deterministic
explainable
section-based
```

But do NOT expose internal engineering language such as:

```text
weighted signal vector
rule normalization pipeline
deterministic coefficient matrix
```

to ordinary candidates.

Candidate-facing language should be simple:

```text
Resume Score
82 / 100

Strong
Your experience and project sections are well structured.

Needs attention
Your achievements section has limited supporting detail.
```

Do not claim:

```text
82% chance of getting hired
```

or:

```text
82% ATS pass probability
```

---

# 34. SCORE BREAKDOWN UX

Where the existing UI permits it, structure data for:

```text
Overall
  ↓
Section
  ↓
Components
  ↓
Reason
  ↓
Evidence
```

Example:

```text
Experience — 72

Structure        18/20
Completeness     22/25
Evidence         17/25
Consistency      15/15

Why:
• 4 entries have structured bullets
• 3 bullets contain quantitative evidence
• 1 position is missing an end date
```

The exact values must come from the scoring engine.

Do not hard-code UI numbers.

---

# 35. TEST FIXTURES

Create or extend fixtures for:

## A. Strong structured resume

Expected:

- high section scores
- high overall score

## B. Partial resume

Expected:

- missing sections represented
- deterministic deductions

## C. Minimal resume

Expected:

- valid result
- bounded scores
- no crash

## D. Messy resume

Expected:

- duplicate/invalid structural signals affect relevant components
- no fabricated data

## E. Evidence-rich resume

Expected:

- evidence-linked score components

## F. Empty/minimal schema-valid ResumeDocument

Expected:

```text
valid result
no NaN
no Infinity
```

Do not hard-code personal real-world data into production fixtures.

---

# 36. TEST THE MATH

For every scoring section, include tests that verify exact expected outputs for controlled inputs.

Example:

```text
Input signals:
name = true
email = true
phone = true
location = false
professionalLink = true

Expected:
Contact component totals = documented value
```

Do not only test:

```text
score >= 0
```

Test the actual mathematics.

---

# 37. PROPERTY / INVARIANT TESTS

Where practical, test:

```text
0 ≤ section score ≤ 100
0 ≤ overall score ≤ 100
```

and:

```text
same input → same score
```

Also:

```text
scoring does not mutate input
```

and:

```text
no AI/network dependency
```

---

# 38. MONOTONICITY TESTS

Be careful with this.

For rules where adding a clearly positive structural signal should not lower the score, test monotonic behavior.

Example:

```text
valid email present
```

should not reduce Contact score compared with:

```text
email absent
```

Likewise:

```text
adding a valid structured experience bullet
```

should not unexpectedly reduce Experience score.

However, do NOT blindly enforce monotonicity where the scoring model intentionally includes balance/diminishing-return rules.

Document any exceptions.

---

# 39. REGRESSION TESTS

Phase 0–2 must remain fully functional.

Verify:

```text
✓ ResumeDocument tests
✓ Resume ingestion tests
✓ Section Engine tests
✓ Existing Resume Intelligence tests
✓ Existing ATS tests
✓ Existing matching tests
✓ Existing optimization tests
✓ Existing recommendation tests
```

Run the full test suite.

Do not accept regressions.

---

# 40. TYPECHECK / LINT

Run:

```text
server npx tsc --noEmit
client npx tsc --noEmit
```

and project-standard lint.

Expected:

```text
0 TypeScript errors
0 new lint errors
```

---

# 41. BROWSER VERIFICATION — MANDATORY

Run the actual Skillezo application.

Verify:

```text
/dashboard/resume-studio
/dashboard/resume-studio/dev
```

and the score API/UI integration.

Use at least:

```text
complete resume
partial resume
messy resume
```

Verify:

```text
✓ score loads
✓ seven section scores load
✓ overall score loads
✓ breakdown is understandable
✓ missing sections behave correctly
✓ scores remain 0–100
✓ no NaN/Infinity
✓ no console errors
✓ no hydration errors
✓ existing Resume Studio still works
```

---

# 42. PERFORMANCE

Scoring should be:

```text
in-memory
deterministic
fast
```

Avoid:

```text
AI calls
network requests
unnecessary DB calls
reparsing resume text
```

For a normal resume:

```text
Section Analysis
+
Scoring
```

should feel effectively instantaneous.

Do not prematurely introduce workers or queues.

---

# 43. SECURITY

Verify:

```text
✓ authentication
✓ resume ownership authorization
✓ no client-controlled userId trust
✓ score cannot be client-supplied as authoritative
✓ ResumeDocument remains immutable
✓ analysis remains immutable
✓ no sensitive resume content unnecessarily logged
```

The score is derived data and must never be trusted from the client.

---

# 44. DOCUMENTATION

Create:

```text
doc/resume-studio/03-scoring.md
```

Document:

1. Phase 3 objective
2. Architecture
3. Score contract
4. Section weights
5. Component weights
6. Exact formulas/rules
7. Missing-section behavior
8. Overall score formula
9. Score labels/thresholds
10. Evidence linking
11. Engine version
12. API
13. Persistence/caching
14. Security
15. Performance
16. Test strategy
17. Browser verification
18. Known limitations
19. Phase 4 readiness

Update:

```text
doc/resume-studio/README.md
```

Mark Phase 3 completed ONLY after all acceptance criteria pass.

Do not mark Phase 4+ complete.

---

# 45. SCORING POLICY MUST BE EXPLICIT

Before considering the implementation complete, the documentation must contain an explicit table similar to:

```text
SECTION       WEIGHT
--------------------
Contact       XX%
Summary       XX%
Skills        XX%
Experience     XX%
Projects      XX%
Education     XX%
Achievements  XX%
--------------------
TOTAL         100%
```

Then for each section:

```text
SECTION COMPONENT      MAX CONTRIBUTION
----------------------------------------
Component A            XX
Component B            XX
Component C            XX
----------------------------------------
TOTAL                  100
```

The exact numbers must be justified by the product's existing architecture and intended general-resume scoring behavior.

Do not invent arbitrary weights just to make tests pass.

---

# 46. SCORING PHILOSOPHY

The general score should reward:

```text
completeness
clarity
structure
evidence presence
consistency
professional readiness
```

It should NOT directly reward:

```text
job keyword overlap
specific technologies
company prestige
school prestige
number of certificates without bound
number of skills without bound
AI-generated wording
```

The score should measure resume/document quality, not candidate worth.

---

# 47. IMPORTANT — NO FABRICATION

The scoring engine must never add or alter:

```text
skills
metrics
companies
projects
education
certifications
dates
links
bullet text
```

It only reads the canonical document and derived analysis.

---

# 48. IMPORTANT — NO AI SCORE OVERRIDE

Never allow:

```text
AI score = 87
```

or:

```text
AI recommends +12
```

to modify the deterministic score.

AI does not control:

```text
section score
overall score
score weight
deduction
bonus
```

Future AI suggestions must modify the ResumeDocument only after candidate approval.

Then:

```text
ResumeDocument changes
      ↓
Section Engine reruns
      ↓
Scoring Engine reruns
      ↓
New deterministic score
```

This is a critical architecture boundary.

---

# 49. FUTURE IMPROVEMENT LOOP

Phase 3 should make this future flow possible:

```text
CURRENT RESUME
      ↓
SECTION ANALYSIS
      ↓
DETERMINISTIC SCORE
      ↓
AI IDENTIFIES IMPROVEMENT OPPORTUNITY
      ↓
CANDIDATE APPROVES CHANGE
      ↓
ResumeDocument UPDATED
      ↓
SECTION ANALYSIS RE-RUN
      ↓
DETERMINISTIC SCORE RE-RUN
      ↓
BEFORE → AFTER SCORE
```

Phase 3 itself only implements up to:

```text
ResumeDocument
 ↓
Section Analysis
 ↓
Score
```

---

# 50. DEFINITION OF DONE

Phase 3 is complete ONLY when:

```text
[ ] Phase 0 inspected
[ ] Phase 1 inspected
[ ] Phase 2 inspected
[ ] Existing scoring/ATS architecture inspected
[ ] No duplicate scoring engine created unnecessarily
[ ] Canonical scoring contract implemented
[ ] Seven section scores implemented
[ ] Overall score implemented
[ ] Explicit weights documented
[ ] Explicit component rules documented
[ ] Missing-section behavior documented
[ ] Score explanations implemented
[ ] Evidence IDs linked where applicable
[ ] Score engine versioned
[ ] Scores bounded 0–100
[ ] NaN/Infinity impossible
[ ] Empty documents supported
[ ] Section analysis remains immutable
[ ] ResumeDocument remains immutable
[ ] No AI calls
[ ] No network dependency in scoring core
[ ] No JD dependency
[ ] No target-role dependency
[ ] No job-match logic
[ ] No rewriting
[ ] No builder
[ ] No PDF
[ ] API integrated
[ ] Client integration verified
[ ] Strong fixture tested
[ ] Partial fixture tested
[ ] Messy fixture tested
[ ] Empty fixture tested
[ ] Exact score mathematics tested
[ ] Invariants tested
[ ] Monotonicity tested where applicable
[ ] Full regression suite passes
[ ] Server TypeScript = 0 errors
[ ] Client TypeScript = 0 errors
[ ] Lint = clean
[ ] Browser verification complete
[ ] No console errors
[ ] Documentation created
[ ] Phase 0 intact
[ ] Phase 1 intact
[ ] Phase 2 intact
[ ] Phase 4+ NOT implemented
```

---

# 51. REQUIRED FINAL REPORT

When finished, report exactly:

## A. Existing Scoring Architecture

What existed before Phase 3 and what was reused.

## B. New Scoring Architecture

Explain the final deterministic scoring pipeline.

## C. Score Contract

Show the actual final TypeScript/schema contract.

## D. Section Weights

Provide the exact seven section weights and verify they total 100%.

## E. Section Formulas

For each section, provide the exact component rules and maximum contributions.

## F. Overall Formula

Show exactly how the overall score is calculated.

## G. Score Explainability

Explain how reasons, deductions, strengths and evidence IDs are generated.

## H. Score Version

State the engine version.

## I. Files Changed

Give exact file paths.

## J. Database Changes

State whether score persistence/caching was added, reused, or intentionally avoided.

## K. API Changes

List actual endpoints changed/created.

## L. Dependencies

List any dependencies added and why.

## M. Tests

Report:

```text
Unit tests:
Integration tests:
Regression tests:
Invariant tests:
TypeScript:
Lint:
```

## N. Browser Verification

State exactly what was tested.

## O. Performance

State whether scoring is in-memory and whether AI/network calls are involved.

## P. Security

State authorization and immutability verification.

## Q. Known Limitations

Only genuine limitations.

## R. Phase 4 Readiness

Explain why the scoring engine is ready for the next Resume Studio phase.

---

# 52. REQUIRED WORKFLOW

Follow this exact sequence:

```text
INSPECT
   ↓
UNDERSTAND PHASE 0–2
   ↓
INSPECT EXISTING SCORING/ATS
   ↓
DEFINE SCORING POLICY
   ↓
DEFINE SCORE CONTRACT
   ↓
IMPLEMENT SECTION SCORERS
   ↓
IMPLEMENT OVERALL AGGREGATION
   ↓
IMPLEMENT EXPLANATIONS
   ↓
IMPLEMENT API INTEGRATION
   ↓
TYPECHECK
   ↓
UNIT TEST
   ↓
MATH / INVARIANT TEST
   ↓
INTEGRATION TEST
   ↓
RUN APPLICATION
   ↓
BROWSER TEST
   ↓
REGRESSION TEST
   ↓
FIX
   ↓
DOCUMENT
   ↓
FINAL REPORT
```

After every meaningful implementation step:

- inspect the diff
- run relevant tests
- check TypeScript
- verify no unrelated files changed

If scoring weights or rules are ambiguous:

1. inspect existing architecture
2. inspect existing tests
3. inspect Phase 0–2 documentation
4. choose the least disruptive coherent policy
5. document the exact decision

Do not silently invent scoring behavior.

---

# 53. FINAL HARD STOP

Do NOT proceed into Phase 4.

The Phase 3 endpoint is:

```text
                ResumeDocument
                       ↓
              Section Analysis
                       ↓
             Deterministic Scoring
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
  7 Section Scores              Overall Score
        ↓                             ↓
  Explainable Rules             Explainable Rules
        └──────────────┬──────────────┘
                       ↓
                 Score Result
```

The result must be trustworthy enough that a candidate can ask:

> **“Why is my resume 76?”**

and Skillezo can answer using deterministic rules and actual resume evidence.

That is the entire purpose of Phase 3.

**STOP after Phase 3 and provide the required final report.**
