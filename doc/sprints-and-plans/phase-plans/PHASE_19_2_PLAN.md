# 🧠 SKILLEZO AI — Phase 19.2 Implementation Plan

## Dynamic Skill Gap Analysis & 6-Axis Career Radar

**Sprint:** 4  
**Day:** 2  
**Phase:** 19.2  
**Status:** ⚪ PLANNED  
**Depends On:** Phase 19.1 — Resume Intelligence & ATS Engine  
**Primary Goal:** Build a lightweight, reusable Skill Gap Engine that compares the candidate's normalized resume skills against a target role and produces six-axis competency scores, matched skills, missing skills, priorities, and data for the live Skill Gap dashboard.

---

# 1. Phase Objective

Extend the Phase 19.1 intelligence pipeline:

```text
Resume
  ↓
Normalized Candidate Skills
  ↓
Skill Gap Engine
  ↓
Target Role Competency
  ↓
6-Axis Analysis
  ↓
Matched Skills + Missing Skills + Priorities
  ↓
Skill Gap API
  ↓
Live Skill Gap Dashboard
```

The engine must be lightweight, deterministic, fast, reusable by Phase 19.3, independent of an LLM, and compatible with the existing Resume and Competency models.

---

# 2. Scope

## Build

- Role competency definitions
- Candidate skill normalization/reuse
- Role-to-skill comparison
- Six-axis competency scoring
- Overall skill alignment score
- Missing skill detection
- Matched skill detection
- Skill priority calculation
- Target role selection
- Skill Gap API
- Live Skill Gap frontend
- Radar chart
- Tests
- TypeScript/build verification

## Do NOT build yet

- Employability Index
- Career GPS
- LLM recommendations
- Course marketplace
- Learning-resource APIs
- Recruiter scoring
- Recruiter notes
- Resume rewriting
- External job-provider APIs
- Complex AI inference

---

# 3. Phase 19.1 Compatibility Rule

Do not duplicate the skill normalization logic created in Phase 19.1.

If normalization is currently private to `resume.ats.ts`, extract/reuse only the minimal shared utility required by both phases.

Expected flow:

```text
Raw Resume Skill
      ↓
Shared Normalization
      ↓
Normalized Skill
      ↓
Skill Gap Engine
```

Do not rewrite the ATS engine.

---

# 4. Six-Axis Model

The engine evaluates:

```text
1. Frontend
2. Backend
3. Database
4. Cloud
5. DevOps
6. System Design
```

Use one shared type:

```ts
type SkillAxis =
  | "frontend"
  | "backend"
  | "database"
  | "cloud"
  | "devops"
  | "systemDesign";
```

Do not duplicate axis strings across backend and frontend.

---

# 5. Competency Data Source

Use the existing:

```text
server/src/database/models/Competency.model.ts
```

as the long-term source of truth.

Do not hard-code role logic inside `SkillGapService`.

Conceptually:

```text
Role
  ↓
Competency Definition
  ├── required skills
  ├── skill weights
  └── axis/category
```

Example:

```json
{
  "roleName": "Full-Stack Engineer",
  "requiredSkills": [
    {
      "name": "React",
      "axis": "frontend",
      "weight": 1
    },
    {
      "name": "Node.js",
      "axis": "backend",
      "weight": 1
    }
  ]
}
```

Use the exact existing schema shape where possible. Do not modify the schema unless genuinely required.

---

# 6. Role Profiles

The Phase 19.1 UI already exposes:

```text
Full-Stack Engineer
Frontend Engineer
Backend Engineer
AI/ML Specialist
DevOps & Cloud Engineer
Mobile App Developer
```

Support these through competency data.

Do NOT implement role-specific calculation branches such as:

```ts
if (role === "Full-Stack Engineer") { ... }
```

Adding a role should eventually be a data change, not an engine code change.

---

# 7. Candidate Skill Source

Primary source:

```text
Resume.extractedData.skills
```

Use `Resume.rawText` only as a fallback if required by the current data structure.

Do not re-parse the PDF.

Do not create another resume extraction pipeline.

---

# 8. Skill Matching

For every required role skill:

```text
Required Skill
      ↓
Normalize
      ↓
Compare with Candidate Skills
      ↓
Matched / Missing
```

Example:

```text
Required:
React
TypeScript
Node.js
Docker
AWS

Candidate:
React
Node.js
MongoDB

Matched:
React
Node.js

Missing:
TypeScript
Docker
AWS
```

Matching must be deterministic.

---

# 9. Axis Score

For each axis:

```text
Matched weighted skills
----------------------- × 100
Required weighted skills
```

Example:

```text
Frontend

React      weight 2
TypeScript weight 1
Next.js    weight 1

Candidate:
React
Next.js

Score:
3 / 4 = 75
```

Clamp every axis to:

```text
0–100
```

If the existing Competency model provides axis weights, use them instead of inventing new weights.

---

# 10. Overall Skill Alignment

Initial approach:

```text
Average of six axis scores
```

If the current Competency model already defines axis weights, use those.

Example:

```text
Frontend       80
Backend        90
Database       70
Cloud          40
DevOps         50
System Design  60

Overall = 65
```

Keep the formula centralized and testable.

---

# 11. Missing Skill Priority

Missing skills receive:

```text
HIGH
MEDIUM
LOW
```

Priority should be deterministic using:

- Skill weight
- Role relevance
- Axis weakness

Example:

```text
AWS
Axis: Cloud
Role weight: High
Cloud score: 35
→ HIGH

Docker
Axis: DevOps
Role weight: Medium
DevOps score: 55
→ MEDIUM
```

Do not use an LLM for priority.

---

# 12. Response Contract

Return compact structured data:

```json
{
  "role": "Full-Stack Engineer",
  "overallScore": 72,
  "axes": {
    "frontend": {
      "score": 80,
      "matched": 4,
      "required": 5
    },
    "backend": {
      "score": 90,
      "matched": 5,
      "required": 6
    },
    "database": {
      "score": 70,
      "matched": 3,
      "required": 4
    },
    "cloud": {
      "score": 40,
      "matched": 2,
      "required": 5
    },
    "devops": {
      "score": 50,
      "matched": 2,
      "required": 4
    },
    "systemDesign": {
      "score": 60,
      "matched": 3,
      "required": 5
    }
  },
  "matchedSkills": [],
  "missingSkills": [
    {
      "skill": "AWS",
      "axis": "cloud",
      "priority": "HIGH",
      "weight": 2
    }
  ]
}
```

Use the existing project response wrapper. Do not introduce another response envelope.

---

# 13. Backend Architecture

Recommended:

```text
server/src/modules/career-plan/

├── skill-gap.engine.ts
├── skill-gap.service.ts
├── skill-gap.controller.ts
├── skill-gap.routes.ts
├── skill-gap.dto.ts
└── skill-gap.validator.ts
```

Responsibilities:

```text
skill-gap.engine.ts
    Pure calculation
    No DB
    No HTTP
    No auth

skill-gap.service.ts
    Resume lookup
    Competency lookup
    Engine orchestration

skill-gap.controller.ts
    HTTP request/response

skill-gap.routes.ts
    Endpoint registration

skill-gap.validator.ts
    Query/parameter validation
```

Reuse existing files if equivalent responsibilities already exist.

---

# 14. Engine Input/Output

Keep the engine independent of MongoDB.

Input:

```ts
{
  candidateSkills: string[],
  competency: CompetencyDefinition
}
```

Output:

```ts
{
  overallScore: number,
  axes: AxisAnalysis[],
  matchedSkills: MatchedSkill[],
  missingSkills: MissingSkill[]
}
```

This keeps unit tests simple and fast.

---

# 15. Service Flow

```text
Authenticated User
       ↓
SkillGapService
       ↓
Find candidate resume/profile
       ↓
Find target role competency
       ↓
Normalize candidate skills
       ↓
SkillGapEngine
       ↓
Return analysis
```

Avoid unnecessary database queries.

Target:

```text
Resume/Profile lookup
+
Competency lookup
+
In-memory calculation
```

Use existing repository patterns.

---

# 16. API

Primary endpoint:

```http
GET /api/career-plan/skill-gap
```

Query:

```text
?role=Full-Stack%20Engineer
```

Behavior:

```text
No role
    ↓
use candidate target role

Role provided
    ↓
validate role
    ↓
calculate requested role
```

Candidate identity must come from authentication.

Never accept `userId` from the client.

---

# 17. Authorization

Use existing auth conventions:

```text
requireAuth
    ↓
req.user.id
    ↓
candidate-owned resume/profile
```

Do not trust candidate identifiers supplied in query/body.

---

# 18. Unknown Role

If the role has no competency definition:

- Return the project's standard not-found/error response.
- Do not silently return score `0`.
- Do not fabricate a competency definition.

---

# 19. Frontend Integration

Target:

```text
client/app/dashboard/skill-gap-analysis/page.tsx
```

Add a typed API service method:

```ts
getSkillGap(role?: string)
```

Do not put raw API calls directly in the page.

---

# 20. Radar Chart

Connect live API values for:

```text
Frontend
Backend
Database
Cloud
DevOps
System Design
```

The existing radar visualization should consume these values.

No mock scores.

---

# 21. Role Switcher

When the role changes:

```text
Selected Role
     ↓
API request
     ↓
Competency lookup
     ↓
New six-axis scores
     ↓
New missing skills
     ↓
Radar updates
```

The backend remains the source of truth.

Do not fake-recalculate scores in the browser.

---

# 22. Missing Skills UI

Display:

```text
Critical Skill Gaps

HIGH
AWS
Docker

MEDIUM
Kubernetes
Redis

LOW
GraphQL
```

Sort by:

```text
priority
↓
weight
```

Keep the UI compact.

Reuse the collapsible pattern from Phase 19.1 where appropriate.

---

# 23. Course Suggestions — Deferred

Do not build a course system in this phase.

Return:

```text
skill
axis
priority
weight
```

Later:

```text
Missing Skill
      ↓
Learning Resource Service
      ↓
Courses / Tutorials / Resources
```

This prevents the Skill Gap Engine from becoming coupled to a learning platform.

---

# 24. Database Strategy

Do not persist every calculation.

Initial approach:

```text
Resume
+
Competency
→
Skill Gap calculation
```

on demand.

Do not create a `SkillGapAnalysis` collection unless a later requirement proves persistence is needed for:

- history
- analytics
- expensive calculations
- career-plan persistence

---

# 25. Caching

Do not add Redis in Phase 19.2.

The calculation should be inexpensive.

Future cache key:

```text
skill-gap:{resumeId}:{resumeVersion}:{role}
```

The design should retain enough resume/version context to support future safe invalidation.

---

# 26. Testing

Create or extend:

```text
skill-gap.engine.spec.ts
```

Minimum tests:

### Normalization
- [ ] Case-insensitive skills
- [ ] Basic aliases
- [ ] Duplicate candidate skills

### Matching
- [ ] Exact match
- [ ] Missing skill
- [ ] Partial candidate skill set
- [ ] No candidate skills
- [ ] Full skill match

### Axis scores
- [ ] 100% axis score
- [ ] 0% axis score
- [ ] Weighted skill score
- [ ] Six-axis calculation

### Overall score
- [ ] Correct calculation
- [ ] Score stays within 0–100

### Priority
- [ ] High priority gap
- [ ] Medium priority gap
- [ ] Low priority gap

### Edge cases
- [ ] Empty competency
- [ ] Duplicate competency skills
- [ ] Invalid/unsupported axis handled safely

Target:

```text
12–18 focused tests
```

Do not add brittle tests just to inflate coverage.

---

# 27. API Tests

Cover:

```text
GET /api/career-plan/skill-gap
```

Test:

- [ ] Authentication required
- [ ] Candidate ownership
- [ ] Default target role
- [ ] Explicit role
- [ ] Unknown role
- [ ] Missing resume
- [ ] Standard response wrapper
- [ ] Correct six-axis output

---

# 28. Frontend Verification

Verify:

```text
Open Skill Gap page
        ↓
Loading state
        ↓
Live API response
        ↓
Radar renders
        ↓
Missing skills render
        ↓
Switch role
        ↓
New API request
        ↓
Radar updates
        ↓
Missing skills update
```

No hard-coded scores should remain.

---

# 29. Error & Empty States

Handle:

```text
No resume
No parsed skills
No target role
Unknown role
API failure
Unauthorized
Loading
```

Never display fabricated scores.

Example:

```text
No analyzed resume found.
Upload or select a resume to generate your skill gap analysis.
```

---

# 30. Performance Requirements

Avoid:

```text
PDF re-parsing
LLM calls
external APIs
N+1 queries
unnecessary DB writes
large runtime dependencies
```

Expected:

```text
Small DB reads
      ↓
Competency data
      ↓
In-memory matching
      ↓
JSON response
```

Keep competency definitions compact.

---

# 31. Phase 19.3 Compatibility

Phase 19.3 — Employability Index — will consume:

```text
overallScore
axis scores
matched skills
missing skills
priority
```

Therefore these fields must remain stable.

Future pipeline:

```text
ATS Score
     +
Skill Gap
     +
Profile/Projects
     +
Recruiter Signals
     ↓
Employability Engine
```

Do not make Phase 19.3 depend on MongoDB-specific objects from Phase 19.2.

---

# 32. Career GPS Compatibility

A later phase can transform:

```text
HIGH priority missing skill
        ↓
Career Milestone
```

Example:

```text
Missing:
AWS

Priority:
HIGH

Axis:
Cloud
```

Later becomes:

```text
Milestone:
Learn AWS fundamentals
```

Phase 19.2 should only provide the structured gap.

---

# 33. Exact Implementation Order

## Step 1
Inspect:

```text
Competency.model.ts
Resume.model.ts
Phase 19.1 ResumeAtsEngine
```

## Step 2
Confirm the exact Competency schema and existing role data.

## Step 3
Reuse/extract Phase 19.1 skill normalization.

## Step 4
Define shared Skill Gap types/DTOs.

## Step 5
Define the six axes.

## Step 6
Implement pure `SkillGapEngine`.

## Step 7
Write engine unit tests.

## Step 8
Implement repository/service integration.

## Step 9
Implement controller and route.

## Step 10
Add authentication and ownership checks.

## Step 11
Add API integration tests.

## Step 12
Add frontend service method.

## Step 13
Replace Skill Gap mock data.

## Step 14
Connect radar chart.

## Step 15
Connect role switcher.

## Step 16
Connect missing-skill priority UI.

## Step 17
Verify loading/error/empty states.

## Step 18
Run full test suite.

## Step 19
Run TypeScript checks.

## Step 20
Run production builds.

---

# 34. Definition of Done

Phase 19.2 is complete only when:

- [ ] Phase 19.1 normalization is reused
- [ ] Existing Resume data is reused
- [ ] Existing Competency model is reused
- [ ] Six axes are supported
- [ ] Role-based competency lookup works
- [ ] Skill matching works
- [ ] Missing skills work
- [ ] Skill priorities work
- [ ] Axis scores are 0–100
- [ ] Overall alignment score works
- [ ] API is authenticated
- [ ] Candidate ownership is enforced
- [ ] Unknown roles are handled correctly
- [ ] Frontend uses live API
- [ ] Radar uses live scores
- [ ] Role switcher triggers live analysis
- [ ] Mock Skill Gap data is removed
- [ ] Loading/error/empty states work
- [ ] 12–18 engine tests pass
- [ ] API tests pass
- [ ] TypeScript passes
- [ ] Production build passes
- [ ] API documentation is updated

---

# 35. STOP CONDITION

Do not start Phase 19.3 until Phase 19.2 passes its Definition of Done.

Do not add:

- Employability scoring
- Career GPS milestones
- LLM recommendations
- Course integrations
- Recruiter features

to this phase.

**Phase 19.2 = Dynamic Skill Gap Analysis + 6-Axis Radar only.**

---

# 🎯 Final Deliverable

At the end of Phase 19.2:

```text
                    TARGET ROLE
                         ↓
                 Competency Profile
                         ↓
                 Skill Gap Engine
                         ↓
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
   Axis Scores       Matched Skills    Missing Skills
       ↓                                  ↓
   6-Axis Radar                       Priority
       │                                  │
       └────────────────┬─────────────────┘
                        ↓
                Skill Alignment Score
                        ↓
                 Phase 19.3 Input
```

The result should be a **small deterministic intelligence service**, not another large subsystem.

**Lightweight now → reusable in Phase 19.3 → extensible with AI later.**
