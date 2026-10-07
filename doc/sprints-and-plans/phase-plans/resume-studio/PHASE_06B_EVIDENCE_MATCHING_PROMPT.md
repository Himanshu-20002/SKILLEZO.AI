# SKILLEZO AI — Phase 6B
# Career ↔ Job Evidence Matching — Implementation Prompt

## ROLE

Implement **Phase 6B — Career ↔ Job Evidence Matching** in the existing SKILLEZO AI codebase.

Phase 6A is complete and frozen. It created the authoritative `JobProfile` with canonical `requirements[]`, importance, source evidence, hashes, analysis metadata, and grounded JD extraction.

Phase 6B connects:

```text
JobProfile.requirements[]
          +
Career Profile canonical facts
          ↓
Career ↔ Job Evidence Matching
          ↓
Requirement Match Results
          ↓
Career Match UI
```

Phase 6B must NOT generate or mutate a resume.

---

# 1. OBJECTIVE

Phase 6A answers:

> What does the job require?

Phase 6B answers:

> What verified career evidence does this candidate have for each requirement?

Example:

```text
React      → PROVEN_RELEVANT
Next.js    → PROVEN_UNDERREPRESENTED
Docker     → PARTIAL_MATCH
AWS        → MISSING
5+ years   → INSUFFICIENT_EVIDENCE
```

The JD is the source of job requirements. `ProfileModel` / Career Profile is the source of candidate truth.

---

# 2. HARD INVARIANTS

Do NOT:

- modify `ProfileModel`
- modify Career Profile facts
- modify Master Resume
- modify ResumeDocument
- modify resume variants
- create Tailored Resume
- generate resume content
- create tailoring proposals
- add missing skills
- create Application records
- implement Auto Apply
- create a competing ATS/matching engine
- infer candidate facts from the JD

Only matching results may be created/updated.

---

# 3. BEFORE CODING

Inspect the existing codebase for:

- existing Job ↔ Resume matching
- role matching
- skill matching
- evidence/provenance utilities
- skill normalization
- competency normalization
- Career GPS intelligence
- existing match/score calculations
- AI Recommendation Orchestrator
- ModelGateway
- existing schemas and repository patterns
- existing JobProfile implementation from Phase 6A

**Reuse existing intelligence whenever possible. Do not duplicate an existing matching engine.**

---

# 4. MATCH RESULT DOMAIN

Create a dedicated MatchResult domain only if an equivalent does not already exist.

Conceptual structure:

```ts
JobMatchResult {
  id
  userId
  jobProfileId

  sourceProfileVersion
  jobAnalysisVersion

  requirementMatches[]

  overallMatch?   // only if existing scoring methodology is reused
  summary?

  generatedAt
  updatedAt
}
```

Each requirement result:

```ts
JobRequirementMatch {
  requirementId
  name
  normalizedName
  category
  importance

  matchState

  evidence: CareerEvidenceReference[]

  relevance?
  confidence?

  explanation?
}
```

Do not duplicate complete Career Profile records. Store references.

---

# 5. MATCH STATES

Use explicit states:

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

Keep the state set small if existing architecture has an equivalent.

### PROVEN_RELEVANT

Direct, credible evidence establishes the requirement.

### PROVEN_UNDERREPRESENTED

Strong Career Profile evidence exists but the current resume presentation underrepresents it. Only use this if existing resume intelligence can safely establish it; otherwise use `PROVEN_RELEVANT`.

### PARTIAL_MATCH

Related evidence exists but does not fully prove the exact requirement.

### RELATED_EVIDENCE

Relevant adjacent evidence exists but does not establish the requested skill/technology/domain.

Example:

```text
JD: Kubernetes
Career: Docker
→ RELATED_EVIDENCE
```

### MISSING

No meaningful candidate evidence.

### INSUFFICIENT_EVIDENCE

Some candidate information exists but is insufficient to establish the requirement.

Example:

```text
JD: 5+ years experience
Career dates: incomplete
→ INSUFFICIENT_EVIDENCE
```

### NEEDS_REVIEW

Use only when automated matching cannot safely determine the relationship.

---

# 6. DETERMINISTIC-FIRST MATCHING

Use this order:

```text
1. Exact normalized match
        ↓
2. Known alias/canonical mapping
        ↓
3. Category-aware structured relationship
        ↓
4. Evidence relevance analysis
        ↓
5. AI semantic reasoning only when necessary
```

Do not call an LLM for every obvious requirement.

Reuse existing normalization utilities.

Examples:

```text
React.js → react
ReactJS → react
Next JS → next.js
NodeJS → node.js
TypeScript → typescript
```

But preserve distinctions:

```text
Java ≠ JavaScript
React ≠ React Native
Next.js ≠ Node.js
PostgreSQL ≠ MySQL
AWS ≠ Azure
```

---

# 7. AI MATCHING RULE

If AI is required for ambiguous semantic matching, its input must contain:

```text
Job requirement
+
Existing candidate evidence
```

Its job is only to determine the relationship.

It must NOT invent candidate evidence.

Every returned evidence reference must point to an existing Career Profile evidence/source ID.

Invalid or nonexistent evidence IDs must be rejected.

Use the existing `ModelGateway` and structured output validation.

Never trust free-form AI output.

---

# 8. CAREER EVIDENCE

Reuse existing Career Profile provenance/evidence structures.

Conceptual reference:

```ts
CareerEvidenceReference {
  sourceType:
    "EXPERIENCE"
    | "PROJECT"
    | "SKILL"
    | "EDUCATION"
    | "COMPETENCY"
    | "PROFILE"

  sourceId
  evidenceId?
  label
  excerpt?
}
```

Do not copy entire career records into MatchResult.

Evidence should remain traceable to the canonical Career Profile.

Prioritize stronger evidence according to existing provenance rules.

---

# 9. REQUIREMENT IMPORTANCE

Never change Phase 6A's original importance.

If:

```text
AWS → REQUIRED
```

and candidate lacks AWS:

```text
importance = REQUIRED
matchState = MISSING
```

Do not downgrade it.

`UNKNOWN` requirements from Phase 6A must also be evaluated and preserved.

Importance and match state are separate dimensions.

---

# 10. MATCHING EXAMPLES

### Exact

```text
JD: React
Career: React
→ PROVEN_RELEVANT
```

### Alias

```text
JD: ReactJS
Career: React.js
→ PROVEN_RELEVANT
```

### Similar but distinct

```text
JD: React
Career: React Native
→ RELATED_EVIDENCE
```

### Different technology

```text
JD: PostgreSQL
Career: MongoDB
→ MISSING
```

### Experience

```text
JD: 5+ years React
Career: React experience with complete dates supporting duration
→ PROVEN_RELEVANT
```

Only infer duration when existing structured dates safely support it.

Never invent years.

### Incomplete dates

```text
JD: 5+ years
Career: incomplete dates
→ INSUFFICIENT_EVIDENCE
```

---

# 11. EDUCATION / DOMAIN / RESPONSIBILITIES

Education:

```text
JD: Bachelor's degree in Computer Science
Career: explicit B.Tech Computer Science
→ PROVEN_RELEVANT
```

Only use facts explicitly supported by Career Profile.

Domain:

```text
JD: FinTech experience
Career: payment-processing project
→ RELATED_EVIDENCE
```

unless the Career Profile explicitly establishes FinTech experience.

Responsibilities should remain conceptually separate from skills.

Do not convert every responsibility into a skill requirement.

---

# 12. VERSIONING AND STALENESS

Every MatchResult must record:

```text
sourceProfileVersion
jobAnalysisVersion
```

A result is current only when:

```text
match.sourceProfileVersion === current Profile.profileVersion
AND
match.jobAnalysisVersion === current JobProfile.analysisVersion
```

Otherwise it is stale.

Conceptually:

```text
Career Profile changes
        ↓
profileVersion increments
        ↓
existing match becomes STALE
```

Likewise if the JobProfile is re-analyzed.

Do not silently display stale evidence as current.

---

# 13. API

Follow existing conventions.

Suggested:

```http
POST /api/job-profiles/:jobProfileId/match
GET  /api/job-profiles/:jobProfileId/match
```

All routes must:

- require `requireAuth`
- enforce ownership
- load JobProfile server-side
- load Career Profile server-side
- never accept candidate facts/evidence from the browser

If equivalent endpoints already exist, extend them instead.

---

# 14. SERVICE

Create a focused service if no equivalent exists:

```text
CareerJobMatchingService
  ├── matchJobToCareerProfile()
  ├── matchRequirement()
  ├── resolveExactMatch()
  ├── resolveRelatedEvidence()
  ├── resolveSemanticMatch()
  └── getMatchResult()
```

Keep controllers thin.

Do not create unnecessary abstractions.

---

# 15. FRONTEND — MAJOR NEW PRODUCT UI

Phase 6B should create a visible new user experience.

Flow:

```text
JobProfile
   ↓
Career Match
   ↓
Requirement-by-requirement evidence
```

Example:

```text
┌──────────────────────────────────────────────────────┐
│ Senior Frontend Engineer                             │
│ Acme Technologies                                    │
│                                                      │
│ Career Match                                         │
│ Requirements matched against your Career Profile    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🟢 React                 Proven Relevant             │
│    Experience + EVENTO project                       │
│                                                      │
│ 🟢 TypeScript            Proven Relevant             │
│    2 evidence items                                  │
│                                                      │
│ 🟡 Docker                Partial Match               │
│    Related container evidence                        │
│                                                      │
│ 🔴 AWS                   Missing                     │
│    No verified career evidence                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Follow the existing SKILLEZO design system.

---

# 16. MATCH SUMMARY

Show useful counts:

```text
Required requirements: 12
Proven: 8
Partial / Related: 2
Missing: 2
```

Do NOT invent a percentage.

If an existing SKILLEZO role/JD scoring methodology already exists, reuse it instead of creating another score.

The primary product value is explainability, not a flashy number.

---

# 17. EVIDENCE DETAIL

Clicking a requirement should reveal its evidence.

Example:

```text
Next.js
PROVEN RELEVANT

Why?
3 career evidence items found.

Experience
Frontend Developer
"Built and deployed Next.js applications..."

Project
EVENTO
"Next.js + TypeScript..."
```

Provide navigation to Career Profile where existing routing supports it.

Do not duplicate entire career records.

For missing:

```text
AWS
MISSING

No verified evidence found in your Career Profile.

SKILLEZO will not treat the JD requirement as a candidate skill.
```

This language should reinforce the no-invention rule.

---

# 18. FILTERS

Keep the first version simple:

```text
All
Proven
Partial
Missing
Needs Review
```

Optional:

```text
Required only
Preferred only
```

Do not overbuild filtering/search/pagination.

---

# 19. LOADING / ERROR / RETRY

Provide clear states:

```text
Matching your career evidence...
```

On failure:

```text
We couldn't complete the career match.

Your Career Profile and Job Profile are unchanged.

[ Try Again ]
```

Never lose existing JobProfile data.

Never expose raw AI errors.

---

# 20. PERFORMANCE

Avoid:

```text
50 requirements
→ 50 LLM calls
```

Prefer:

```text
deterministic matching
+
small controlled semantic batch
```

If AI is needed, prefer one structured call or a small controlled number of batches.

Do not introduce queues/Inngest solely for Phase 6B unless the existing architecture already requires them.

---

# 21. SECURITY

Never accept candidate evidence from the frontend.

Bad:

```text
POST /match
{
  candidateSkills: [...]
}
```

Good:

```text
POST /job-profiles/:id/match
```

Server resolves:

```text
authenticated user
       ↓
Career Profile
       +
JobProfile
       ↓
MatchResult
```

User A must never access User B's JobProfile or MatchResult.

---

# 22. TESTING

## Backend

Test:

### Exact / normalization

- exact skill match
- React.js / ReactJS aliases
- Java vs JavaScript
- React vs React Native
- Next.js vs Node.js

### Evidence

- valid evidence references
- evidence IDs belong to Career Profile
- invalid AI evidence IDs rejected
- hallucinated evidence rejected

### Match states

- PROVEN_RELEVANT
- PROVEN_UNDERREPRESENTED where safely supported
- PARTIAL_MATCH
- RELATED_EVIDENCE
- MISSING
- INSUFFICIENT_EVIDENCE
- UNKNOWN importance retained

### Experience

- complete dates
- incomplete dates
- no fabricated duration

### Education

- explicit matching degree
- non-matching degree
- missing education evidence

### Security

- User A cannot match User B's JobProfile
- User A cannot read User B's MatchResult

### Staleness

- profileVersion change marks result stale
- job analysisVersion change marks result stale
- current versions produce current result

### Invariants

Verify:

```text
ProfileModel unchanged
Master Resume unchanged
Resume variants unchanged
JobProfile unchanged
0 Tailored Resumes created
```

---

# 23. FRONTEND TESTING

Test:

- match loading state
- success state
- failure/retry
- requirement grouping
- filters
- evidence expansion
- missing evidence
- UNKNOWN importance
- stale result warning
- retry
- navigation back to JobProfile
- no fabricated evidence displayed

---

# 24. MANUAL QA

Perform:

```text
Login
 ↓
Resume Portfolio
 ↓
Tailor Resume for This Job
 ↓
Analyze Job
 ↓
Open Career Match
 ↓
Run Match
 ↓
Inspect requirements
 ↓
Open evidence
 ↓
Verify evidence points to Career Profile
 ↓
Change Career Profile
 ↓
Return to Match
 ↓
Verify stale state
 ↓
Re-run Match
 ↓
Verify updated evidence
```

Critical test:

```text
JD:
AWS required

Career Profile:
No AWS

Expected:
AWS → MISSING
```

Never:

```text
AWS → PROVEN
```

---

# 25. ACCEPTANCE CRITERIA

Phase 6B is complete only when:

### Matching

- every JobProfile requirement can be evaluated
- deterministic matching works
- semantic matching is grounded
- exact technologies remain distinct
- evidence is traceable
- missing requirements are explicit
- partial/related evidence is distinguishable
- UNKNOWN requirements are preserved

### Integrity

```text
Career Profile mutated: NO
Master Resume mutated: NO
Resume variants mutated: NO
JobProfile mutated: NO
Tailored Resume created: NO
Phase 6C implemented: NO
```

### Versioning

- source Profile version recorded
- source Job analysis version recorded
- stale results detected

### UX

- user can launch Career Match
- requirement-by-requirement results visible
- evidence inspectable
- missing requirements clearly shown
- loading/error/retry states work
- stale results clearly indicated

### AI

- existing ModelGateway reused
- structured output validated
- AI cannot invent candidate evidence
- invalid evidence references rejected
- deterministic matching used where possible

### Quality

- focused tests pass
- full regression passes
- server typecheck passes
- client typecheck passes
- no PII in logs
- no console errors

---

# 26. VERIFICATION

Run the actual project commands.

At minimum:

```bash
cd server
npx vitest run
npm run type-check
```

and:

```bash
cd client
npx vitest run
npx tsc --noEmit
```

Report exact results:

```text
Backend focused tests: X/X
Backend full regression: X/X
Frontend tests: X/X
Server typecheck: PASS
Client typecheck: PASS
```

---

# 27. FINAL IMPLEMENTATION REPORT

Report:

## Files Created
Important new files.

## Files Modified
Important existing files.

## Domain
MatchResult architecture.

## Matching
- deterministic matching
- normalization
- semantic matching if used
- evidence resolution
- match states

## API
Implemented endpoints.

## UI
Career Match experience.

## Tests
Exact results.

## Type Checks
Exact results.

## Invariants
Explicitly confirm:

```text
Career Profile mutated: NO
Master Resume mutated: NO
Resume variants mutated: NO
JobProfile mutated: NO
Tailored Resume created: NO
Phase 6C implemented: NO
```

## Remaining Issues
Only actual remaining issues.

---

# 28. IMPLEMENTATION PHILOSOPHY

The purpose of Phase 6B is to establish a trustworthy bridge:

```text
                  JOB SIDE
                     │
                 JobProfile
                     │
              requirements[]
                     │
                     ▼
            ┌─────────────────┐
            │ Evidence Matcher│
            └────────┬────────┘
                     ▲
                     │
               Career Profile
                     │
                     ▼
                Match Results
                     │
                     ▼
              User understands
                their job fit
                     │
                     ▼
                    6C
```

The system should be able to answer:

> "This requirement exists in the job. Here is the verified evidence from your Career Profile that supports it."

And:

> "This requirement exists in the job, but SKILLEZO could not find verified evidence for it."

Trust and traceability are more important than a flashy score.

---

# 29. FINAL RULE

Do not implement Phase 6C early.

Do not rewrite the resume.

Do not generate AI resume content.

Do not add missing skills.

Do not mutate Career Profile.

Do not create Tailored Resume variants.

Do not create an independent competing ATS/matching engine if existing SKILLEZO intelligence can be reused.

Implement **Phase 6B only**, test it thoroughly, verify source-domain immutability, and leave the system ready for:

```text
Phase 6C — Tailoring Plan + User Approval
```

# END OF PHASE 6B PROMPT
