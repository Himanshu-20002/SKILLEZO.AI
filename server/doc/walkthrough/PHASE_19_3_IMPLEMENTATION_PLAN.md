# 🧠 SKILLEZO AI — Phase 19.3 Implementation Plan

## Multi-Factor Employability Index & Career GPS Foundation

**Sprint:** 4  
**Day:** 3  
**Phase:** 19.3  
**Status:** ⚪ PLANNED  
**Depends On:** Phase 19.1 + Phase 19.2  
**Primary Goal:** Combine existing ATS intelligence, Skill Gap intelligence, and available candidate/project signals into one deterministic 0–100 Employability Index, then expose structured improvement priorities that become the foundation for Career GPS.

---

# 1. Phase Objective

Phase 19.3 must NOT rebuild Phase 19.1 or 19.2.

It consumes their existing outputs:

```text
Phase 19.1
Resume ATS Score
        │
        ▼
Phase 19.2
Skill Gap Analysis
        │
        ▼
Phase 19.3
Employability Engine
        │
        ├── Employability Score 0–100
        ├── Factor Breakdown
        ├── Strengths
        ├── Weaknesses
        ├── Priority Actions
        └── Career GPS Milestone Data
```

Core principle:

> **Phase 19.3 is an orchestration layer, not another extraction system.**

---

# 2. Scope

## Build

- Employability Index engine
- Deterministic weighted scoring
- ATS score integration
- Technical Readiness integration
- Project Strength integration
- Skill Alignment integration
- Recruiter Visibility integration where existing data supports it
- Factor breakdown
- Strength detection
- Priority actions
- Career GPS milestone-ready output
- Employability API
- Live Employability dashboard
- Career GPS dashboard foundation
- Tests
- TypeScript/build verification

## Do NOT build yet

- LLM-generated career plans
- External job-market APIs
- Course-provider integrations
- Recruiter portal
- Recruiter scoring system
- Complex AI recommendations
- Notifications
- Background workers
- Redis
- Large new database collections

Keep this phase deterministic and lightweight.

---

# 3. Existing Sprint Formula

The Sprint 4 specification defines:

```text
Technical Readiness   40%
Resume Strength       25%
Project Strength      15%
Skill Alignment       10%
Recruiter Visibility  10%
```

Formula:

```text
Employability Score =
    Technical Readiness  × 0.40
  + Resume Strength      × 0.25
  + Project Strength     × 0.15
  + Skill Alignment      × 0.10
  + Recruiter Visibility × 0.10
```

Every factor must be normalized to:

```text
0–100
```

Final score:

```text
0–100
```

---

# 4. Phase 19.1 → 19.3 Contract

Use the existing ATS result.

Recommended:

```text
Resume Strength = Phase 19.1 overall ATS score
```

Do not run ATS analysis twice.

Available supporting data can be used for explanations:

```text
ATS Match
Structure
Impact
Brevity
Readability
```

The Employability Engine should consume the final ATS score rather than duplicate its internals.

---

# 5. Phase 19.2 → 19.3 Contract

Use the existing Skill Gap result.

Recommended:

```text
Technical Readiness = Phase 19.2 overallMatchScore
Skill Alignment     = Phase 19.2 overallMatchScore
```

If the existing Phase 19.2 implementation exposes a more appropriate technical-readiness field, use that exact field instead.

**Important:** Do not recalculate the six-axis skill model in Phase 19.3.

Consume:

```text
overallMatchScore
axes
missingSkills
priorityRecommendations
```

---

# 6. Project Strength

Weight:

```text
15%
```

First inspect the existing project/profile models.

Use only real existing signals, such as:

```text
Project count
Project completeness
Technology coverage
Descriptions
GitHub links
Live/demo links
Impact metrics
Role relevance
```

Do not create a parallel project system.

If reliable project data does not exist, do not fabricate:

```text
Project Strength = 50
```

Instead establish an explicit deterministic fallback/reweighting strategy after inspecting the current schema.

The chosen strategy must be documented in code/tests.

---

# 7. Recruiter Visibility

Weight:

```text
10%
```

Use only recruiter/profile visibility signals that already exist.

Possible existing signals:

```text
Profile completeness
Profile visibility
Application activity
Recruiter interactions
Saved/shortlisted signals
```

Do NOT build the Recruiter Portal here.

Recruiter Portal belongs to the next Day 4 phase.

If meaningful visibility data does not exist yet, establish a safe documented fallback rather than inventing recruiter activity.

Keep this factor isolated so the later Recruiter Portal can improve it without rewriting the Employability Engine.

---

# 8. Missing Data Rule

Distinguish:

```text
0 score
```

from:

```text
data unavailable
```

Example:

```json
{
  "score": null,
  "status": "insufficient_data"
}
```

Do not silently turn missing information into zero.

However, the final Employability Index still requires a deterministic calculation. After inspecting the current data models, choose one consistent strategy:

### Preferred strategy

If a factor is unavailable:

```text
exclude unavailable factor
↓
renormalize available weights
↓
calculate score
```

OR, if the existing product rules require fixed weights, use the existing documented baseline.

Do not decide this by guessing; inspect the current application data first.

---

# 9. Recommended Output Contract

Keep the response compact and stable:

```json
{
  "overallScore": 74,
  "targetRole": "Full-Stack Engineer",

  "factors": {
    "technicalReadiness": {
      "score": 82,
      "weight": 40,
      "status": "available"
    },
    "resumeStrength": {
      "score": 78,
      "weight": 25,
      "status": "available"
    },
    "projectStrength": {
      "score": 70,
      "weight": 15,
      "status": "available"
    },
    "skillAlignment": {
      "score": 72,
      "weight": 10,
      "status": "available"
    },
    "recruiterVisibility": {
      "score": 60,
      "weight": 10,
      "status": "available"
    }
  },

  "strengths": [],

  "priorityActions": [],

  "careerGps": {
    "ready": true,
    "milestones": []
  }
}
```

Use the existing project API response wrapper.

Do not introduce another global response envelope.

---

# 10. Strength Detection

Strengths must be derived from actual scores.

Example:

```text
Backend       91
Frontend      84
Cloud         42
```

Possible output:

```text
Strong Backend Competency
Strong Frontend Competency
Cloud Development Needs Improvement
```

Use deterministic templates.

Do not introduce AI-generated explanations yet.

---

# 11. Priority Action Generation

Combine existing intelligence:

```text
Phase 19.2 missing skills
+
weak radar axes
+
Phase 19.1 ATS weaknesses
+
project weakness
```

Example:

```json
{
  "title": "Improve Cloud Skills",
  "priority": "HIGH",
  "source": "skill-gap",
  "axis": "cloud",
  "relatedSkill": "AWS"
}
```

Recommended priority source order:

```text
Critical Skill Gap
        ↓
Weak Technical Axis
        ↓
ATS Weakness
        ↓
Project Weakness
```

Remove duplicate actions.

Keep action generation deterministic.

---

# 12. Career GPS Foundation

Phase 19.3 should create structured milestone-ready data, not a full learning platform.

Milestone shape:

```ts
{
  id: string;
  title: string;
  description: string;
  source: "skill-gap" | "resume" | "project";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "not_started";
  relatedSkill?: string;
  relatedAxis?: SkillAxis;
}
```

Example:

```text
Missing Skill:
AWS

↓
Career GPS Milestone:

Learn AWS Fundamentals

Priority:
HIGH

Axis:
Cloud

Status:
Not Started
```

No courses.

No external resources.

No AI-generated plans.

No completion tracking yet.

---

# 13. Milestone Ordering

Use:

```text
HIGH
 ↓
MEDIUM
 ↓
LOW
```

Within the same priority:

```text
Largest gap
 ↓
Highest skill weight
 ↓
Stable deterministic order
```

The comparator must live in the engine.

---

# 14. Backend Architecture

Recommended:

```text
server/src/modules/career-plan/

├── employability.engine.ts
├── employability.service.ts
├── employability.controller.ts
├── employability.routes.ts
├── employability.dto.ts
└── employability.validator.ts
```

Reuse existing career-plan infrastructure if equivalent files already exist.

Responsibilities:

```text
employability.engine.ts
    Pure calculation
    No DB
    No HTTP
    No auth

employability.service.ts
    Gather ATS result
    Gather Skill Gap result
    Gather project/profile signals
    Gather visibility signals
    Call engine

employability.controller.ts
    HTTP handling

employability.routes.ts
    Route registration

employability.dto.ts
    Stable API types
```

---

# 15. Engine Input

Keep the engine independent of MongoDB and Express.

Conceptually:

```ts
{
  technicalReadiness: number,
  resumeStrength: number,
  projectStrength: number,
  skillAlignment: number,
  recruiterVisibility: number,
  skillGap?: SkillGapResult,
  ats?: ResumeAtsAnalysis
}
```

The engine must not receive:

```text
MongoDB models
Express request
JWT/user
HTTP response
```

This makes it easy to test.

---

# 16. Engine Output

Return:

```ts
{
  overallScore: number,
  factors: FactorScore[],
  strengths: Strength[],
  priorityActions: PriorityAction[],
  careerGps: CareerGpsDraft
}
```

No database writes.

---

# 17. Service Data Flow

```text
Authenticated User
       │
       ├───────────────┐
       ↓               ↓
Active Resume      Target Role
       │               │
       ↓               ↓
Phase 19.1 ATS     Phase 19.2 Skill Gap
       │               │
       └───────┬───────┘
               ↓
       Project/Profile Data
               ↓
       Existing Visibility Data
               ↓
       Employability Service
               ↓
       Employability Engine
               ↓
        Final JSON Response
```

Avoid unnecessary repeated queries.

Reuse existing service methods.

---

# 18. API

Primary:

```http
GET /api/career-plan/employability
```

Optional:

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
use selected target role
```

Candidate identity must come from authentication.

Never accept `userId` from the frontend.

---

# 19. Career GPS API

If a Career GPS route already exists, reuse it.

Otherwise expose:

```http
GET /api/career-plan/gps
```

It should return the milestone-ready data generated by the Employability Service.

Do not create a separate persistence system yet.

---

# 20. Employability Frontend

Target:

```text
client/app/dashboard/employability-index/page.tsx
```

Replace mock values with live API data.

UI:

```text
Overall Employability Score
        ↓
Factor Breakdown
        ↓
Technical Readiness
Resume Strength
Project Strength
Skill Alignment
Recruiter Visibility
        ↓
Top Strengths
        ↓
Priority Actions
```

Reuse existing dashboard components/styles.

Do not redesign the entire dashboard.

---

# 21. Factor Visualization

Keep it lightweight.

Example:

```text
Overall Score
74 / 100

Technical Readiness     82
████████████████░░░░

Resume Strength         78
███████████████░░░░░

Project Strength        70
██████████████░░░░░░

Skill Alignment         72
██████████████░░░░░░

Recruiter Visibility    60
████████████░░░░░░░░
```

Prefer existing components.

Do not introduce a large charting library just for progress bars.

---

# 22. Target Role Switching

Reuse the role selector from Phase 19.2.

Flow:

```text
Role
 ↓
Skill Gap
 ↓
Technical Readiness
 ↓
Skill Alignment
 ↓
Employability
 ↓
Career GPS priorities
```

Resume Strength should remain unchanged unless Phase 19.1 is explicitly role-aware.

Project/visibility factors should change only if their existing logic is role-aware.

---

# 23. Career GPS Frontend

Target:

```text
client/app/dashboard/career-gps/page.tsx
```

Wire it to live milestone-ready data.

Initial presentation:

```text
Career GPS

Your Next Priorities

1. HIGH — Improve Cloud Skills
   AWS
   Cloud

2. HIGH — Strengthen System Design
   System Design

3. MEDIUM — Improve Resume Impact
   Impact Statements
```

No fake progress.

Initial milestone status:

```text
not_started
```

---

# 24. Mock Data Elimination

Remove mock data from:

```text
/dashboard/employability-index
/dashboard/career-gps
```

Search targeted files/components for:

```text
mock
dummy
sample
hardcoded score
static score
fake recommendation
```

Do not remove unrelated mocks outside this phase.

---

# 25. Database Strategy

Do NOT create a permanent `EmployabilityScore` collection unless existing requirements explicitly require historical persistence.

Initial approach:

```text
Live source data
     ↓
Deterministic calculation
     ↓
Response
```

Future persistence can later support:

```text
Score history
Score trends
Milestone completion
Analytics
```

without blocking the current implementation.

---

# 26. Caching

Do not introduce Redis.

Future cache concept:

```text
employability:{resumeId}:{resumeVersion}:{role}:{profileVersion}
```

Current calculation should remain inexpensive.

---

# 27. Unit Tests

Create:

```text
employability.engine.spec.ts
```

Minimum coverage:

### Formula

- [ ] Correct weighted calculation
- [ ] All factors at 100 → 100
- [ ] All factors at 0 → 0
- [ ] Mixed factor calculation
- [ ] Output clamped to 0–100

### Input safety

- [ ] Negative input normalized safely
- [ ] Input above 100 normalized safely
- [ ] Missing factor handled according to chosen availability strategy

### Strengths

- [ ] Strong factor detection
- [ ] Weak factor detection

### Actions

- [ ] High-priority skill gap generates action
- [ ] Medium-priority gap generates action
- [ ] Duplicate actions removed
- [ ] Correct sorting

### GPS

- [ ] High-priority skill gap generates milestone
- [ ] Milestone preserves skill metadata
- [ ] Milestone preserves axis metadata
- [ ] Milestones sort correctly

Target:

```text
15–20 focused unit tests
```

Do not add brittle tests just to increase coverage.

---

# 28. API Integration Tests

Test:

```text
GET /api/career-plan/employability
```

Cases:

- [ ] Authentication required
- [ ] Candidate ownership
- [ ] Default role
- [ ] Explicit role
- [ ] Missing resume
- [ ] Missing Skill Gap data
- [ ] Project data present
- [ ] Project data unavailable
- [ ] Correct factor weights
- [ ] Correct final score

Also test Career GPS if a separate endpoint exists.

---

# 29. Frontend Verification

Employability:

```text
Open page
 ↓
Loading
 ↓
Live API response
 ↓
Score renders
 ↓
Factor breakdown renders
 ↓
Strengths render
 ↓
Priority actions render
```

Role change:

```text
Change role
 ↓
API request
 ↓
Skill Gap recalculates
 ↓
Employability recalculates
 ↓
Career priorities update
```

Career GPS:

```text
Open GPS
 ↓
Live milestones
 ↓
Priority ordering
 ↓
No fake progress
```

---

# 30. Error & Empty States

Handle:

```text
No resume
No parsed data
No Skill Gap data
No project data
No target role
API failure
Unauthorized
Loading
```

Example:

```text
Your Employability Index needs a completed resume
and skill analysis before it can be calculated.
```

Never show a fabricated score.

---

# 31. Performance Requirements

Avoid:

```text
LLM calls
PDF parsing
external APIs
N+1 queries
large DB writes
background jobs
Redis
new heavy dependencies
```

Ideal:

```text
Existing intelligence services
        ↓
Small profile/project reads
        ↓
One pure calculation
        ↓
JSON response
```

---

# 32. Phase 19.4 Compatibility

The next Sprint 4 phase is the Recruiter Portal.

Keep:

```text
recruiterVisibility
```

as an isolated factor.

Later:

```text
Recruiter Portal
      ↓
Recruiter Signals
      ↓
Employability Service
      ↓
Recruiter Visibility Factor
```

No Employability Engine rewrite should be required.

---

# 33. Future AI Compatibility

AI can later enhance:

```text
Priority Action
      ↓
Personalized explanation
      ↓
Career roadmap
      ↓
Learning resources
```

But the core score must remain deterministic.

Do not make the Employability Index dependent on an LLM.

---

# 34. Exact Implementation Order

## Step 1
Inspect:

```text
Phase 19.1 ATS service/result
Phase 19.2 Skill Gap service/result
Project/Profile models
Recruiter/visibility-related models
Employability page
Career GPS page
```

## Step 2
Confirm exactly what data is available for all five factors.

## Step 3
Define Employability DTO/types.

## Step 4
Implement pure weighted `EmployabilityEngine`.

## Step 5
Write formula and edge-case tests.

## Step 6
Implement factor adapters.

## Step 7
Implement `EmployabilityService`.

## Step 8
Integrate Phase 19.1 ATS.

## Step 9
Integrate Phase 19.2 Skill Gap.

## Step 10
Integrate existing project/profile signals.

## Step 11
Integrate existing recruiter visibility signals if available.

## Step 12
Implement deterministic priority actions.

## Step 13
Implement Career GPS milestone-ready output.

## Step 14
Implement API controller/routes.

## Step 15
Add authentication/ownership checks.

## Step 16
Add API tests.

## Step 17
Connect Employability dashboard.

## Step 18
Connect Career GPS dashboard.

## Step 19
Remove targeted mock data.

## Step 20
Run full tests.

## Step 21
Run TypeScript checks.

## Step 22
Run production builds.

---

# 35. Definition of Done

Phase 19.3 is complete only when:

- [ ] Phase 19.1 ATS result is reused
- [ ] Phase 19.2 Skill Gap result is reused
- [ ] Technical Readiness works
- [ ] Resume Strength works
- [ ] Project Strength works
- [ ] Skill Alignment works
- [ ] Recruiter Visibility has a documented data/fallback strategy
- [ ] Weights total 100%
- [ ] Final score is 0–100
- [ ] Factor breakdown is returned
- [ ] Strengths are generated deterministically
- [ ] Priority actions are generated
- [ ] Duplicate actions are removed
- [ ] Career GPS milestone-ready data is generated
- [ ] API is authenticated
- [ ] Candidate ownership is enforced
- [ ] Employability dashboard uses live API
- [ ] Career GPS dashboard uses live API
- [ ] Target role switching works
- [ ] Targeted mock data is removed
- [ ] Loading/error/empty states work
- [ ] Unit tests pass
- [ ] API tests pass
- [ ] TypeScript passes
- [ ] Production build passes

---

# 36. STOP CONDITION

Do not start the Recruiter Portal until Phase 19.3 passes its Definition of Done.

Do not add:

- Recruiter Kanban
- Recruiter notes
- Candidate pipeline management
- Recruiter scoring
- External job APIs

to this phase.

**Phase 19.3 = Employability Index + Career GPS foundation only.**

---

# 🎯 Final Architecture

```text
                 RESUME
                   │
          ┌────────┴────────┐
          ↓                 ↓
   Phase 19.1          Phase 19.2
   ATS Engine          Skill Gap Engine
          │                 │
          ↓                 ↓
 Resume Strength      Technical Readiness
                         Skill Alignment
          │                 │
          └────────┬────────┘
                   ↓
          Project/Profile Data
                   │
                   ↓
        Recruiter Visibility
                   │
                   ↓
       ┌──────────────────────┐
       │ EMPLOYABILITY ENGINE │
       │       0–100          │
       └──────────┬───────────┘
                  ↓
       ┌──────────────────────┐
       │ Priority Actions     │
       │ Strengths            │
       │ GPS Milestones       │
       └──────────┬───────────┘
                  ↓
       ┌──────────────────────┐
       │ Employability UI     │
       │ Career GPS UI        │
       └──────────────────────┘
```

## Architecture Rule

```text
19.1 → Resume Intelligence
19.2 → Skill Intelligence
19.3 → Career Intelligence
19.4 → Recruiter Intelligence
```

Each phase consumes stable outputs from the previous phase.

**Lightweight now → reusable later → AI-ready without making AI a dependency.**
