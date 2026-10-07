# 🧠 SKILLEZO AI — Phase 19.1 Implementation Plan

## Resume Intelligence — ATS Compatibility & Resume Scoring

**Sprint:** 4  
**Day:** 1  
**Phase:** 19.1  
**Scope:** Backend + Frontend integration for Resume Intelligence  
**Goal:** Replace mock Resume Intelligence data with a lightweight, deterministic, scalable ATS analysis based on the candidate's existing parsed resume data.

---

# 1. Phase Objective

Build the first intelligence layer of Skillezo:

```text
Existing Resume
      ↓
Parsed Resume Data
      ↓
Resume ATS Engine
      ↓
ATS Score + Breakdown + Missing Keywords + Recommendations
      ↓
Resume Intelligence UI
```

This phase must be:

- Lightweight
- Deterministic
- Fast
- Reusable by later phases
- Independent of an external LLM
- Compatible with Phase 19.2 Skill Gap Engine
- Compatible with Phase 19.3 Employability Index
- Compatible with future AI recommendation features

---

# 2. Important Scope Boundary

## Build in Phase 19.1

- ATS compatibility score
- Keyword/category matching
- Resume structure checks
- Brevity/readability checks
- Impact statement checks
- Missing keyword detection
- Actionable improvement recommendations
- Live backend API
- Live Resume Intelligence frontend

## Do NOT build yet

- External Greenhouse API integration
- External Lever API integration
- External Workday API integration
- External Taleo API integration
- LLM-powered resume rewriting
- Course/learning recommendations
- Skill-gap engine
- Employability index
- Career GPS
- New resume storage system
- Recruiter functionality

The ATS engine should be **ATS-platform-agnostic**. Greenhouse, Lever, Workday, and Taleo are reference targets for common ATS-friendly practices, not external integrations in this phase.

---

# 3. Existing Data — Reuse First

Before changing schemas, inspect the existing Resume module.

Reuse the existing:

```text
Resume.model.ts
Resume repository
Resume service
Resume parser
Resume extractedData
Resume rawText
Resume version
Resume storageKey
```

The existing implementation already supports resume PDF extraction, parsed resume data, skill matching and resume CRUD.

**Do not duplicate resume parsing or create another resume collection.**

Expected source data:

```text
Resume
├── rawText
├── extractedData
│   ├── personalInfo
│   ├── skills
│   ├── education
│   ├── experience
│   └── projects (if currently available)
├── version
├── originalFileName
└── storageKey
```

If a field is not currently available, do not invent a new schema just for ATS scoring unless it is genuinely required.

---

# 4. Architecture

Use the existing architecture:

```text
Route
  ↓
Auth Middleware
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
ATS Engine
  ↓
Resume Repository
```

Recommended structure:

```text
server/src/modules/resume/

├── resume.controller.ts
├── resume.dto.ts
├── resume.routes.ts
├── resume.service.ts
├── resume.validator.ts
└── resume.ats.ts
```

If an existing file already provides the appropriate responsibility, extend it instead of creating unnecessary files.

---

# 5. ATS Engine Design

Create a pure calculation layer:

```text
resume.ats.ts
```

The core engine should:

```text
input:
  normalized resume data
  optional target keywords/categories

output:
  ATSAnalysis
```

The engine should NOT:

- access MongoDB
- access HTTP request objects
- access authentication
- call an LLM
- write to MongoDB
- contain controller logic

This makes the engine easy to test and reuse.

---

# 6. ATS Score

Return a normalized score:

```text
0–100
```

Initial scoring model:

```text
Keyword Match       40%
Structure            20%
Brevity              15%
Impact               15%
Readability          10%
                     ───
                     100%
```

Keep these weights in one configuration object.

Example:

```ts
const ATS_WEIGHTS = {
  keywordMatch: 0.40,
  structure: 0.20,
  brevity: 0.15,
  impact: 0.15,
  readability: 0.10,
};
```

Do not scatter scoring constants throughout the code.

---

# 7. Keyword Matching

Normalize text before comparison.

Normalization should handle:

```text
case
whitespace
punctuation
common aliases where safe
```

Examples:

```text
JavaScript → javascript
Java Script → javascript
Node.js → nodejs
nodejs → nodejs
TypeScript → typescript
```

Do not build an enormous synonym engine in this phase.

Create a small reusable normalization utility that can later be reused by Phase 19.2 Skill Gap.

---

# 8. Keyword Categories

Initial categories:

```text
Frontend
Backend
Database
Cloud
DevOps
```

Keep category definitions centralized.

Example:

```ts
const KEYWORD_TAXONOMY = {
  frontend: [...],
  backend: [...],
  database: [...],
  cloud: [...],
  devops: [...],
};
```

The taxonomy must be easy to extend.

Do not hard-code category logic inside the scoring functions.

---

# 9. Target Keywords

ATS scoring needs a reference set.

Phase 19.1 should support:

```text
resume + target role
```

If the candidate has a target role already stored in Profile, use it.

If the target role has no competency definition yet, use the lightweight built-in taxonomy for supported role/category keywords.

Do NOT build the full Competency engine here.

Phase 19.2 will move role requirements into the reusable Competency system.

Design the ATS engine so the keyword source can later change from:

```text
Built-in taxonomy
```

to:

```text
Competency repository
```

without rewriting the scorer.

---

# 10. Category Scores

Return category-level keyword analysis:

```json
{
  "frontend": {
    "matched": 5,
    "total": 7,
    "score": 71
  },
  "backend": {
    "matched": 4,
    "total": 5,
    "score": 80
  },
  "database": {
    "matched": 2,
    "total": 4,
    "score": 50
  },
  "cloud": {
    "matched": 1,
    "total": 4,
    "score": 25
  },
  "devops": {
    "matched": 2,
    "total": 4,
    "score": 50
  }
}
```

Keep this generic so Phase 19.2 can reuse the same category/axis model.

---

# 11. Missing Keywords

Return only useful missing keywords.

Example:

```json
{
  "missingKeywords": [
    {
      "keyword": "typescript",
      "category": "frontend",
      "priority": "high"
    },
    {
      "keyword": "docker",
      "category": "devops",
      "priority": "medium"
    }
  ]
}
```

Priority should initially be deterministic:

```text
high:
  important role/category keyword

medium:
  useful supporting keyword

low:
  optional keyword
```

Do not pretend to know a keyword is required unless the reference taxonomy supports it.

---

# 12. Resume Structure Score

Evaluate basic ATS-friendly structure using data already parsed from the resume.

Possible checks:

```text
Personal information present
Skills present
Experience present
Education present
Projects present when applicable
Clear section structure
```

Return:

```json
{
  "structure": {
    "score": 85,
    "checks": [
      {
        "name": "Skills section",
        "passed": true
      },
      {
        "name": "Experience section",
        "passed": true
      }
    ]
  }
}
```

Avoid attempting complex visual PDF layout analysis in Phase 19.1.

---

# 13. Brevity Score

Use parsed text and available section data.

Check for:

- Extremely short resume
- Excessively long resume
- Excessive repeated content
- Very large blocks of text

Keep the algorithm simple.

Do not enforce a rigid page count because page count is unreliable from extracted text alone.

---

# 14. Impact Score

Detect basic evidence of measurable impact.

Look for:

```text
numbers
percentages
currency
scale
performance improvements
time reductions
growth
metrics
```

Examples of useful patterns:

```text
40%
2x
30 users
₹5L
reduced by 25%
increased conversion by 18%
```

The score should represent the **presence of measurable outcomes**, not judge whether the claim is truthful.

---

# 15. Readability Score

Keep this lightweight.

Possible checks:

```text
sentence length
very large text blocks
excessive repetition
basic section completeness
```

Do not add a heavyweight NLP dependency just for this phase.

---

# 16. Recommendations

Recommendations should be generated from detected weaknesses.

Example:

```text
If keyword score is low:
"Add more role-relevant technical keywords from your target role."

If impact score is low:
"Add measurable outcomes to project and experience descriptions."

If structure score is low:
"Add or improve clearly labeled resume sections."

If brevity score is low:
"Reduce repetitive or low-value content."
```

Return structured recommendations:

```json
{
  "recommendations": [
    {
      "type": "KEYWORDS",
      "priority": "HIGH",
      "message": "Add more role-relevant technical keywords."
    }
  ]
}
```

Do not generate long AI-like paragraphs.

---

# 17. Response Contract

Create a stable DTO.

Example:

```json
{
  "resumeId": "64-character-or-object-id",
  "resumeVersion": 3,
  "score": 78,
  "level": "GOOD",
  "breakdown": {
    "keywordMatch": 82,
    "structure": 90,
    "brevity": 70,
    "impact": 68,
    "readability": 85
  },
  "categories": {
    "frontend": {
      "score": 80,
      "matched": 4,
      "total": 5
    },
    "backend": {
      "score": 90,
      "matched": 5,
      "total": 6
    },
    "database": {
      "score": 60,
      "matched": 3,
      "total": 5
    },
    "cloud": {
      "score": 40,
      "matched": 2,
      "total": 5
    },
    "devops": {
      "score": 50,
      "matched": 2,
      "total": 4
    }
  },
  "missingKeywords": [],
  "recommendations": []
}
```

Use the project's existing:

```json
{
  "success": true,
  "data": {}
}
```

response wrapper.

Do not introduce another response format.

---

# 18. API

Implement:

```http
GET /api/resumes/:resumeId/ats-score
```

Authentication:

```text
requireAuth
```

Authorization:

```text
Candidate can only analyze their own resume.
```

Do not accept:

```text
userId
```

from the client.

The authenticated user ID must come from:

```text
req.user.id
```

Use the existing ObjectId validation convention for `resumeId`.

---

# 19. Optional Active Resume Endpoint

If the existing frontend naturally works with an active/current resume, a convenience endpoint may be added:

```http
GET /api/resumes/me/ats-score
```

Only add this if it reduces frontend complexity.

Do not create duplicate controllers/services for the two routes.

Both should call the same service method.

---

# 20. Caching Strategy

Do NOT introduce Redis or another caching system in Phase 19.1.

The ATS calculation should be fast enough to calculate on demand.

Future optimization path:

```text
Resume version
      ↓
ATS calculation
      ↓
cache by resumeId + version
```

The response should expose:

```text
resumeVersion
```

so future caching can safely invalidate when the resume changes.

---

# 21. Frontend Integration

Target:

```text
client/app/dashboard/resume-intelligence/page.tsx
```

and:

```text
client/services/resume.service.ts
```

Add a typed API method:

```ts
getResumeAtsScore(resumeId)
```

Do not duplicate fetch logic inside the page.

---

# 22. UI

Keep the existing design.

Replace mock data with live API data.

Display:

```text
ATS Score
├── Overall score
├── Score level
├── Category breakdown
├── Missing keywords
├── Resume strengths
└── Improvement recommendations
```

Example:

```text
ATS Compatibility
78 / 100
GOOD

Keyword Match       82
Structure            90
Brevity              70
Impact               68
Readability          85

Missing Keywords
[TypeScript] [Docker]

Recommended Improvements
• Add measurable outcomes
• Add missing role-relevant keywords
```

Do not redesign the entire dashboard.

---

# 23. Loading & Error States

Frontend must handle:

```text
Loading
No resume
Resume parsing incomplete
Unauthorized
Resume not found
API error
Empty analysis
```

Do not display fake fallback numbers.

If the API fails:

```text
"Unable to analyze resume. Please try again."
```

not:

```text
ATS Score: 78
```

---

# 24. Performance Requirements

The engine should operate in memory against already parsed resume data.

Avoid:

```text
multiple DB queries
N+1 queries
re-parsing PDF
external API calls
LLM calls
large dependencies
```

Target flow:

```text
1 DB read
   ↓
ATS calculation
   ↓
response
```

No database write is required for the initial implementation.

---

# 25. Testing

Create/extend:

```text
resume.ats.spec.ts
```

Minimum coverage:

### Keyword matching

- [ ] Exact keyword match
- [ ] Case-insensitive match
- [ ] Basic normalization
- [ ] Missing keywords
- [ ] Category calculation

### Scoring

- [ ] Score is always 0–100
- [ ] Weight calculation is correct
- [ ] Empty resume handled safely
- [ ] Strong resume produces higher score
- [ ] Weak resume produces lower score

### Structure

- [ ] Missing section lowers score
- [ ] Complete sections improve score

### Impact

- [ ] Numeric achievements detected
- [ ] No metrics produces lower impact score

### API

- [ ] Auth required
- [ ] Candidate cannot access another user's resume
- [ ] Invalid resumeId rejected
- [ ] Missing resume returns correct error
- [ ] Successful response uses standard wrapper

Target:

```text
10–15 focused tests
```

Do not chase artificial 100% line coverage if it makes the tests brittle.

---

# 26. Type Safety

After implementation:

```bash
npx tsc --noEmit
```

must pass.

Avoid:

```ts
any
```

unless there is a documented unavoidable boundary.

Use DTO/types for the API response.

---

# 27. Build Verification

Run:

```bash
npm test
npx tsc --noEmit
npm run build
```

Use the project's actual package scripts if their names differ.

Existing tests must remain green.

---

# 28. Definition of Done

Phase 19.1 is complete only when:

- [ ] Existing Resume data is reused
- [ ] No duplicate resume parsing
- [ ] ATS engine is pure and deterministic
- [ ] ATS score returns 0–100
- [ ] Keyword matching works
- [ ] Category scores work
- [ ] Missing keywords work
- [ ] Structure score works
- [ ] Brevity score works
- [ ] Impact score works
- [ ] Readability score works
- [ ] Recommendations are generated
- [ ] API is authenticated
- [ ] Resume ownership is enforced
- [ ] Standard response wrapper is used
- [ ] Frontend uses live API
- [ ] Mock ATS data is removed
- [ ] Loading/error states work
- [ ] 10–15 focused tests pass
- [ ] TypeScript passes
- [ ] Production build passes

---

# 29. Compatibility With Phase 19.2

Phase 19.2 will implement:

```text
Skill Gap Engine
```

Therefore Phase 19.1 must expose reusable concepts:

```text
normalized skills
categories
matched keywords
missing keywords
target role
resume version
```

Do not make ATS-specific data structures impossible to reuse.

Future architecture:

```text
Resume
  ↓
Normalization
  ↓
┌──────────────────┐
│ Shared Skill Data│
└────────┬─────────┘
         │
    ┌────┴─────┐
    ↓          ↓
   ATS      Skill Gap
    │          │
    └────┬─────┘
         ↓
  Employability
```

---

# 30. Compatibility With Phase 19.3

Phase 19.3 will consume:

```text
ATS Score
Skill Alignment
Technical Readiness
```

Therefore do not hide the component scores.

The ATS API must return:

```text
overall score
+
breakdown
```

rather than only:

```json
{
  "score": 78
}
```

---

# 31. Future AI Extension

Do not implement LLM integration now.

Future architecture:

```text
Deterministic ATS Engine
          ↓
Weaknesses
          ↓
Optional AI Recommendation Service
          ↓
Natural-language suggestions
```

The deterministic engine remains the source of truth.

This keeps API costs low and results predictable.

---

# 32. Implementation Order

Follow this exact order.

## Step 1
Inspect existing Resume model/service/repository/parser.

## Step 2
Identify exact parsed fields available.

## Step 3
Create/reuse skill normalization utility.

## Step 4
Create ATS types/DTO.

## Step 5
Create centralized ATS weights.

## Step 6
Create keyword taxonomy.

## Step 7
Implement pure ATS engine.

## Step 8
Write engine unit tests.

## Step 9
Add Resume service method.

## Step 10
Add controller + route + validation.

## Step 11
Test authenticated ownership behavior.

## Step 12
Add frontend service method.

## Step 13
Replace mock Resume Intelligence data.

## Step 14
Add loading/error/empty states.

## Step 15
Run complete test/type/build verification.

## Step 16
Update API documentation.

---

# 33. Final Verification

Before declaring Phase 19.1 complete, verify this real flow:

```text
Candidate Login
      ↓
Existing Resume
      ↓
GET /api/resumes/:resumeId/ats-score
      ↓
Live ATS Analysis
      ↓
Resume Intelligence Dashboard
```

Then verify:

```text
Change Resume
      ↓
Resume version changes
      ↓
ATS score recalculates
      ↓
UI reflects new result
```

No mock values.

No external AI dependency.

No duplicate resume data.

No unnecessary database writes.

---

# 🚦 STOP CONDITION

Do not start Phase 19.2 until Phase 19.1 satisfies the Definition of Done.

Do not add:

- Courses
- AI rewriting
- Skill-gap calculations
- Employability calculations
- Career GPS
- Recruiter features

to Phase 19.1.

**Phase 19.1 = Resume Intelligence only.**

---

# 🎯 Phase 19.1 Deliverable

At the end of this phase, Skillezo should have:

```text
LIVE RESUME INTELLIGENCE

Resume
  ↓
ATS Engine
  ↓
┌──────────────────────────┐
│ ATS Score: 78/100        │
│                          │
│ Keyword Match: 82       │
│ Structure: 90            │
│ Brevity: 70              │
│ Impact: 68               │
│ Readability: 85          │
│                          │
│ Missing Keywords         │
│ Recommendations          │
└──────────────────────────┘
```

**Lightweight now → reusable in Phase 19.2 → composable into Phase 19.3 → extensible with AI later.**
