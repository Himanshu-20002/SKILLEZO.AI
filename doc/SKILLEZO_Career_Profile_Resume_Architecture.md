# SKILLEZO — Career Profile & Resume Intelligence Architecture

## Document Status

- **Document Type:** Product Architecture, Domain Model, UX Architecture & Integration Strategy
- **Status:** Proposed Architecture
- **Scope:** Career Profile, Resume Studio, Master Resume, Tailored Resume Variants, Career GPS, Job Matching and Applications
- **Primary Principle:** The **Career Profile is the single source of truth** for the candidate's career data.
- **Design Goal:** Maximum user value with minimum manual data entry, while keeping AI grounded, explainable and user-controlled.

---

# 1. Executive Vision

SKILLEZO should not be designed primarily as an AI resume builder.

It should function as a **Career Operating System**.

The candidate uploads an existing resume once. SKILLEZO extracts the candidate's career information and automatically creates a structured **Career Profile**.

The Career Profile then becomes the canonical source of truth for the rest of the platform.

```text
                         USER
                          |
                          v
                +-------------------+
                |   RESUME UPLOAD   |
                |      PDF/DOCX      |
                +---------+---------+
                          |
                          v
                +-------------------+
                |  RESUME INGESTION |
                |     + PARSING     |
                +---------+---------+
                          |
                          v
              +-------------------------+
              |      CAREER PROFILE     |
              |                         |
              |   SOURCE OF TRUTH       |
              +-----------+-------------+
                          |
          +---------------+----------------+
          |               |                |
          v               v                v
   Resume Engine     Career GPS       Job Engine
          |               |                |
          v               v                v
   Master Resume     Skill Gap       Job Matching
          |
          v
   Tailoring Engine
          |
          v
   Tailored Resume
          |
          v
    Application
          |
          v
 Application Snapshot
```

The user should not need to manually recreate information that already exists in their uploaded resume.

The ideal onboarding experience is:

```text
UPLOAD
  ↓
AI EXTRACTS
  ↓
USER REVIEWS
  ↓
CAREER PROFILE READY
  ↓
USE SKILLEZO
```

Not:

```text
UPLOAD
  ↓
FILL 50 FIELDS
  ↓
FILL ANOTHER 50 FIELDS
  ↓
USER DROPS OFF
```

---

# 2. Core Architectural Principles

## 2.1 Career Profile Is the Source of Truth

The Career Profile is the canonical representation of the candidate's career.

It contains:

- Identity
- Contact information
- Professional summary
- Experience
- Projects
- Skills
- Education
- Certifications
- Achievements
- Career evidence
- Preferences and metadata where appropriate

Everything else should consume or derive from this information.

```text
                    CAREER PROFILE
                    SOURCE OF TRUTH
                           |
        +------------------+------------------+
        |                  |                  |
        v                  v                  v
    Resume Engine      Career Engine      Job Engine
        |                  |                  |
        v                  v                  v
    Resumes             Career GPS        Job Matching
```

---

## 2.2 Resume Is a Presentation of the Profile

A resume should not be the ultimate source of career truth.

Instead:

```text
Career Profile
      |
      v
Resume Configuration
      |
      v
Resume Document
```

The same Career Profile can generate multiple resumes.

---

## 2.3 Tailored Resumes Are Derived Snapshots

A tailored resume is created from:

```text
Career Profile
      +
Target Job / JD
      +
Approved AI Recommendations
      |
      v
Tailored Resume Snapshot
```

A tailored resume must not silently mutate the Career Profile.

---

## 2.4 Applications Are Historical Snapshots

Once a candidate applies to a job, the exact resume used for that application should be preserved.

Changing the Career Profile later must not silently change historical applications.

```text
Career Profile
      |
      +----> Current Master Resume
      |
      +----> New Tailored Resume
      |
      +----> Application Snapshot
```

---

## 2.5 AI Is Suggestion-Driven, Not Truth-Generating

AI can:

- Extract
- Organize
- Suggest
- Rephrase
- Prioritize
- Match
- Analyze
- Recommend

AI must not invent:

- Employers
- Job titles
- Technologies
- Metrics
- Achievements
- Responsibilities
- Education
- Certifications
- Experience

unless the user explicitly provides and confirms them.

---

# 3. Complete Product Architecture

```text
                              SKILLEZO
                                  |
       +--------------------------+--------------------------+
       |                          |                          |
       v                          v                          v
 CAREER PROFILE              RESUME SYSTEM              JOB SYSTEM
       |                          |                          |
       |                    +-----+-----+                    |
       |                    |           |                    |
       |                    v           v                    v
       |                 MASTER      TAILORING          JOB DISCOVERY
       |                 RESUME       ENGINE                  |
       |                    |           |                     |
       |                    |           v                     v
       |                    |       VARIANTS              JOB MATCH
       |                    |                                 |
       +----------+---------+---------------------------------+
                  |
                  v
             CAREER GPS
                  |
       +----------+----------+
       |          |          |
       v          v          v
    SKILLS     ROLE GAP    ROADMAP
       |
       v
 APPLICATION SYSTEM
       |
       +----------+----------+
       |                     |
       v                     v
 APPLICATIONS            INTERVIEWS
       |
       v
 OUTCOMES / INSIGHTS
       |
       +--------------------------+
                                  |
                                  v
                         CAREER INTELLIGENCE
```

---

# 4. Career Profile Domain

## 4.1 Purpose

The Career Profile stores the candidate's structured career information independently from any particular resume layout.

It should be optimized for:

- Reuse
- AI analysis
- Job matching
- Resume generation
- Career GPS
- Skill intelligence
- Application intelligence

---

# 5. Career Profile Data Model

Conceptual structure:

```typescript
interface CareerProfile {
  id: string;
  userId: string;

  identity: IdentityProfile;

  professionalSummary?: ProfessionalSummary;

  experiences: CareerExperience[];

  projects: CareerProject[];

  skills: CareerSkill[];

  education: EducationRecord[];

  certifications: CertificationRecord[];

  achievements: CareerAchievement[];

  evidence: CareerEvidence[];

  preferences?: CareerPreferences;

  profileCompleteness: number;

  status: CareerProfileStatus;

  createdAt: Date;
  updatedAt: Date;
}
```

---

# 6. Identity Profile

```typescript
interface IdentityProfile {
  fullName: string;

  email?: string;

  phone?: string;

  location?: {
    city?: string;
    state?: string;
    country?: string;
  };

  linkedinUrl?: string;

  githubUrl?: string;

  portfolioUrl?: string;

  otherLinks?: string[];
}
```

The system should populate this automatically from the uploaded resume where available.

The user can edit it later.

---

# 7. Experience Model

```typescript
interface CareerExperience {
  id: string;

  companyName: string;

  role: string;

  employmentType?: string;

  location?: string;

  startDate?: Date;

  endDate?: Date;

  isCurrent?: boolean;

  responsibilities: CareerEvidence[];

  achievements: CareerEvidence[];

  technologies: string[];

  description?: string;

  sourceReferences: SourceReference[];

  verificationStatus: VerificationStatus;
}
```

The important architectural decision is that experience bullets should be represented as **evidence**, rather than just plain text.

---

# 8. Project Model

```typescript
interface CareerProject {
  id: string;

  name: string;

  description?: string;

  role?: string;

  technologies: string[];

  responsibilities: CareerEvidence[];

  achievements: CareerEvidence[];

  projectUrl?: string;

  repositoryUrl?: string;

  sourceReferences: SourceReference[];

  verificationStatus: VerificationStatus;
}
```

---

# 9. Skills Model

```typescript
interface CareerSkill {
  id: string;

  name: string;

  category?: string;

  proficiency?: string;

  yearsOfExperience?: number;

  lastUsedAt?: Date;

  evidenceIds: string[];

  sourceReferences: SourceReference[];

  verificationStatus: VerificationStatus;
}
```

Skills should ideally be linked to actual evidence.

Example:

```text
Skill:
PostgreSQL

Evidence:
- Project A
- Company B
- Resume source

Verification:
User confirmed
```

This makes skill intelligence much more reliable.

---

# 10. Career Evidence Layer

This is one of the most important architectural concepts.

## 10.1 Why Evidence Exists

The AI should not freely invent stronger resume statements.

Instead, it should work from evidence.

```text
Career Profile
      |
      v
Career Evidence
      |
      +---- Experience
      +---- Project
      +---- Achievement
      +---- Skill
      +---- Certification
```

Example:

```text
Achievement

Text:
"Reduced API response time by 35%"

Source:
User uploaded resume

Verification:
USER_VERIFIED

AI Usage:
ALLOWED
```

---

# 11. Evidence Verification States

Recommended:

```typescript
enum VerificationStatus {
  IMPORTED = "IMPORTED",
  USER_VERIFIED = "USER_VERIFIED",
  USER_EDITED = "USER_EDITED",
  NEEDS_REVIEW = "NEEDS_REVIEW"
}
```

AI-generated claims that have no supporting source should never automatically become trusted evidence.

---

# 12. Source References

Every extracted item should be traceable to its origin.

```typescript
interface SourceReference {
  sourceType:
    | "UPLOADED_RESUME"
    | "USER_INPUT"
    | "USER_EDIT"
    | "IMPORTED_PROFILE";

  sourceDocumentId?: string;

  sourceSection?: string;

  sourceText?: string;

  createdAt: Date;
}
```

This allows the UI to show:

```text
Source:
Imported from Resume.pdf

[View Source]
```

This is valuable for trust and debugging.

---

# 13. First-Time User Flow

## Step 1 — Upload

```text
Welcome to SKILLEZO

Build your career profile in seconds.

Upload your existing resume and
we'll organize your experience,
skills, projects and achievements.

[ Upload Resume ]

or

[ Build From Scratch ]
```

---

## Step 2 — AI Processing

```text
Analyzing your resume...

✓ Personal information
✓ Experience
✓ Projects
✓ Skills
✓ Education
✓ Achievements

Organizing career evidence...

██████████████████░░ 91%
```

---

## Step 3 — Extraction Summary

```text
We've built your Career Profile

Experience          4
Projects            7
Skills             32
Achievements        14
Education           2

⚠ 3 items need your attention

[ Review Profile ]
```

---

## Step 4 — Profile Review

```text
Career Profile                     94% Complete

✓ Personal
✓ Experience
✓ Projects
✓ Skills
✓ Education
⚠ Achievements
⚠ Certifications

[Finish Profile]
```

---

## Step 5 — Ready

```text
Your Career Profile is ready ✓

Your information is now organized
and ready to power:

• Resume generation
• Job matching
• Career GPS
• Skill gap analysis
• Tailored resumes

[ Open Resume Studio ]
```

---

# 14. Career Profile UX

The Career Profile should not be a huge single form.

Use a section-based workspace:

```text
+----------------------+----------------------------------+
| CAREER PROFILE       |                                  |
|                      | CURRENT SECTION                 |
| ✓ Personal           |                                  |
| ✓ Summary            | Personal Information            |
| ✓ Experience         |                                  |
| ✓ Projects           | Name                             |
| ✓ Skills             | Himanshu Kumar                   |
| ✓ Education          |                                  |
| ⚠ Achievements       | Email                            |
| ⚠ Certifications     | himanshu@example.com             |
|                      |                                  |
|                      | Location                         |
|                      | Delhi, India                     |
|                      |                                  |
|                      | LinkedIn                         |
|                      | linkedin.com/in/...              |
|                      |                                  |
|                      | [Save Changes]                   |
+----------------------+----------------------------------+
```

---

# 15. Career Profile Completeness

Completeness should be useful, not cosmetic.

Example:

```text
CAREER PROFILE
94% Complete

✓ Identity
✓ Experience
✓ Skills
✓ Projects
✓ Education
⚠ 2 achievements need verification
```

The system should identify actionable missing information.

Avoid forcing users to reach 100% before using SKILLEZO.

---

# 16. Master Resume Architecture

The Master Resume is a generated presentation of the Career Profile.

```text
Career Profile
      |
      v
Master Resume Configuration
      |
      v
Canonical ResumeDocument AST
      |
      v
A4 Renderer
```

The Master Resume should contain the most complete useful representation of the candidate's career.

It should not be treated as an immutable career database.

---

# 17. Resume Document Model

Existing canonical AST architecture should remain the rendering source of truth for resume layout.

Conceptually:

```typescript
interface ResumeDocument {
  metadata: ResumeMetadata;

  sections: ResumeSection[];

  layout: ResumeLayout;

  typography: ResumeTypography;

  styling: ResumeStyling;
}
```

The Career Profile and ResumeDocument serve different purposes:

```text
Career Profile
= WHAT THE CANDIDATE HAS DONE

ResumeDocument
= HOW THAT INFORMATION IS PRESENTED
```

---

# 18. Resume Types

```typescript
enum ResumeType {
  MASTER = "MASTER",
  TAILORED = "TAILORED"
}
```

A resume record can reference:

```typescript
interface Resume {
  id: string;

  userId: string;

  type: ResumeType;

  careerProfileVersion: number;

  parentResumeId?: string;

  title: string;

  targetJob?: TargetJobContext;

  resumeDocument: ResumeDocument;

  builderConfig: ResumeBuilderConfig;

  scores?: ResumeScores;

  createdAt: Date;

  updatedAt: Date;
}
```

---

# 19. Target Job Context

```typescript
interface TargetJobContext {
  targetRole: string;

  targetCompany?: string;

  jobDescriptionText?: string;

  extractedKeywords?: string[];

  targetMatchScore?: number;

  jobId?: string;
}
```

---

# 20. Resume Scores

The Resume Studio should maintain separate scores rather than one generic score.

```typescript
interface ResumeScores {
  atsCompatibilityScore?: number;

  roleMatchScore?: number;

  impactContentScore?: number;

  lastCalculatedAt?: Date;
}
```

UI:

```text
ATS Compatibility      92
Role & JD Match        88
Impact & Content       84
```

Do not reduce the candidate's resume quality to one opaque number.

---

# 21. Resume Studio Architecture

The Resume Studio should be a focused workspace.

It should not feel like an admin dashboard.

Recommended layout:

```text
+--------------------------------------------------------------------------+
| ← Resumes   Full-Stack Engineer — Stripe     Saved ✓   Preview   Export |
+------------------+---------------------------------------+---------------+
|                  |                                       |               |
| RESUME           |                                       | AI INSIGHTS   |
| PORTFOLIO        |                                       |               |
|                  |                                       | ATS 92        |
| ⭐ MASTER        |                                       | Match 88      |
| Master Resume    |               A4 RESUME                | Impact 84     |
|                  |                                       |               |
| TARGETED         |                                       | ───────────   |
|                  |                                       | IMPROVEMENTS  |
| Full Stack       |                                       |               |
| Stripe           |                                       | ⚠ 3 items    |
| ATS 92           |                                       | [Review]      |
|                  |                                       |               |
| Frontend         |                                       |               |
| Google           |                                       |               |
| ATS 89           |                                       |               |
|                  |                                       |               |
| DevOps           |                                       |               |
| AWS              |                                       |               |
| ATS 86           |                                       |               |
|                  |                                       |               |
| + New Variant    |                                       |               |
+------------------+---------------------------------------+---------------+
|                         Page 1 / 2        100%       -   +               |
+--------------------------------------------------------------------------+
```

---

# 22. Resume Studio Zones

## Zone A — Top Header

```text
← Resumes
Resume Name
Saved Status
Undo
Redo
Preview
Export PDF
```

---

## Zone B — Resume Portfolio Sidebar

Contains:

- Master Resume
- Tailored variants
- ATS / Match scores
- Create Variant

The Master should be visually distinct.

```text
⭐ MASTER PROFILE
Master Resume
```

---

## Zone C — Central Resume Canvas

The A4 resume should dominate the screen.

The user can:

- Edit text
- Reorder sections
- Edit bullets
- Change content
- Preview pages
- Select content for AI actions

---

## Zone D — AI Insights

Default right panel:

```text
AI INSIGHTS

Resume Health

ATS Compatibility
92

Role Match
88

Impact & Content
84

────────────────

IMPROVEMENTS

⚠ Strengthen API evidence
⚠ Add PostgreSQL evidence
⚠ Improve project metrics

[Review]
```

---

# 23. Design Panel

The right panel should have:

```text
AI INSIGHTS | DESIGN
```

Design controls:

- Template
- Typography
- Spacing
- Margins
- Section spacing
- Accent style
- Layout density

Do not mix design controls into the AI panel.

---

# 24. Inline AI Editing

Selecting resume text should provide contextual actions:

```text
+----------------------------------------------+
| ✨ Improve | Shorten | Add Impact | Rewrite |
+----------------------------------------------+
```

Example:

```text
Original:
Built REST APIs using Node.js.

AI Proposal:
Designed and deployed REST APIs using
Node.js and Express for production workflows.

[Accept] [Edit] [Reject]
```

AI changes must remain user-approved.

---

# 25. Master Resume Safety Rule

The system must never allow tailoring AI to directly overwrite the Career Profile.

Correct:

```text
Career Profile
      |
      v
AI Analysis
      |
      v
Proposal
      |
      v
User Approval
      |
      v
Tailored Resume
```

Incorrect:

```text
Career Profile
      |
      v
AI
      |
      v
Overwrite Profile
```

---

# 26. Tailoring Architecture

The tailoring system should follow:

```text
CAREER PROFILE
      +
TARGET JOB
      |
      v
JOB ANALYSIS
      |
      v
EVIDENCE MATCHING
      |
      v
TAILORING PROPOSAL
      |
      v
USER REVIEW
      |
      v
APPROVAL
      |
      v
TAILORED RESUME SNAPSHOT
      |
      v
ATS / MATCH SCORING
```

---

# 27. Tailoring UX

The backend may have five internal steps, but the frontend should compress them into a simple three-step experience.

```text
1. Target Job
      ↓
2. Analyze
      ↓
3. Review & Create
```

---

# 28. Step 1 — Target Job

```text
Create Job-Specific Resume

Target Role
[ Full-Stack Engineer ]

Company
[ Stripe ]

Job Description
+----------------------------------+
| Paste job description...         |
|                                  |
+----------------------------------+

[ Analyze Job → ]
```

---

# 29. Step 2 — Job Analysis

```text
JOB ANALYSIS

Current Match
78%

Strong Matches
✓ React
✓ TypeScript
✓ Next.js
✓ Node.js

Needs Attention
⚠ PostgreSQL
⚠ API Security

Recommended Changes
3

[Review Recommendations →]
```

---

# 30. Step 3 — Review Changes

```text
TAILORING REVIEW

3 recommended changes

SUMMARY
Current → Proposed

[✓ Accept] [Edit] [Keep Original]

SKILLS
Recommended order

[✓ Accept]

EXPERIENCE
Bullet 2

Original → Proposed

[✓ Accept] [Edit] [Keep Original]

[Create Tailored Resume]
```

---

# 31. AI Proposal DTO

Conceptually:

```typescript
interface TailoringProposal {
  targetKeywords: string[];

  matchedKeywords: string[];

  missingKeywords: string[];

  proposedSummary?: string;

  proposedSkillReordering?: string[];

  proposedBulletOptimizations: BulletOptimization[];

  prospectiveScores?: ResumeScores;
}
```

```typescript
interface BulletOptimization {
  section: string;

  itemId: string;

  original: string;

  proposed: string;

  evidenceIds: string[];

  prospectiveScoreDelta?: number;
}
```

The `evidenceIds` field is important because every AI proposal should be grounded in Career Profile evidence.

---

# 32. Tailored Resume Creation

After approval:

```text
Career Profile
      |
      v
Create ResumeDocument
      |
      v
Apply Approved Changes
      |
      v
Calculate Scores
      |
      v
Save Tailored Resume
```

The new tailored resume stores:

- Career Profile version
- Parent/source resume where useful
- Target Job
- Approved changes
- Resume AST
- Scores
- Creation timestamp

---

# 33. Snapshot and Versioning Model

This is critical.

## Career Profile

Always represents the latest career truth.

## Resume

Represents a snapshot generated from a Career Profile version.

## Application

Represents the exact resume snapshot submitted to a company.

```text
Career Profile v7
      |
      +---- Master Resume v7
      |
      +---- Stripe Resume v7
      |
      +---- Google Resume v7
                    |
                    v
              Application #123
                    |
                    v
              Snapshot locked
```

If the Career Profile becomes v8:

```text
Career Profile v8
      |
      +---- New Master Resume
      +---- New Tailored Resume
```

Existing applications remain unchanged.

---

# 34. Sync Strategy

When the Career Profile changes:

The system should detect affected resumes.

Example:

```text
Career Profile changed

Experience:
Added new achievement

Affected:
✓ Master Resume
✓ Full-Stack Variant

Existing applications:
🔒 Locked
```

For tailored resumes, provide:

```text
Career Profile has changed.

Your resume may be outdated.

[Review Changes]
[Keep Existing Version]
```

Never silently mutate an application snapshot.

---

# 35. Resume Gallery

The Gallery is separate from the editing canvas.

```text
RESUME GALLERY

MASTER RESUME

+----------------------------------+
| ⭐ MASTER                        |
| Master Resume                    |
| Career Profile based             |
|                                  |
| [Open Studio]                    |
+----------------------------------+

TARGETED RESUMES

+---------------+ +---------------+
| Stripe        | | Google        |
| Full Stack    | | Frontend      |
| ATS 92        | | ATS 89        |
|               | |               |
| Open          | | Open          |
+---------------+ +---------------+

+-------------------------------+
| + Create Job-Specific Resume  |
+-------------------------------+
```

---

# 36. Career GPS Architecture

Career GPS consumes the Career Profile rather than depending on a particular resume.

```text
Career Profile
      |
      +---- Skills
      +---- Experience
      +---- Evidence
      +---- Projects
      |
      v
Career Intelligence
      |
      +---- Skill Gap
      +---- Role Benchmark
      +---- Readiness
      +---- Recommendations
      +---- Career Roadmap
```

---

# 37. Career GPS UX

```text
CAREER GPS

Target Role
Full-Stack Engineer

Readiness
78%

Technical Skills
84%

Experience
72%

Evidence Strength
69%

────────────────────────────

NEXT BEST ACTIONS

1. Strengthen PostgreSQL evidence
   Impact: High

2. Improve two project achievements
   Impact: Medium

3. Build evidence for API security
   Impact: High
```

Career GPS should answer:

> Where am I?

> What am I missing?

> What should I do next?

---

# 38. Job Engine

The Job Engine should consume Career Profile data.

```text
Career Profile
      |
      v
Job Description
      |
      v
Job Intelligence
      |
      +---- Required Skills
      +---- Role Requirements
      +---- Experience Requirements
      +---- Matching Evidence
      |
      v
Job Match
```

The user should be able to go directly from:

```text
Job
 ↓
Analyze
 ↓
Tailor Resume
 ↓
Apply
```

---

# 39. Applications Architecture

Applications should connect:

```text
User
 |
 +-- Job
 |
 +-- Resume Snapshot
 |
 +-- Application Status
 |
 +-- Timeline
 |
 +-- Interview
 |
 +-- Outcome
```

Example:

```text
Stripe
Senior Full-Stack Engineer

Resume Used:
Full-Stack Engineer — Stripe

ATS Match:
92%

Applied:
19 Sep 2026

Status:
● Applied

Timeline

19 Sep   Applied
   ↓
        Recruiter Response
   ↓
        Interview
   ↓
        Offer / Rejected
```

---

# 40. Application Snapshot Rule

When an application is submitted:

```text
Application
    |
    +-- jobSnapshot
    +-- resumeSnapshot
    +-- careerProfileVersion
    +-- submittedAt
```

The exact submitted resume must remain reproducible.

---

# 41. Backend Domain Architecture

Recommended module structure:

```text
server/src/modules/

├── auth/
│
├── career-profile/
│   ├── career-profile.model.ts
│   ├── career-profile.repository.ts
│   ├── career-profile.service.ts
│   ├── career-profile.routes.ts
│   ├── evidence.service.ts
│   └── profile-ingestion.service.ts
│
├── resume/
│   ├── resume.model.ts
│   ├── resume.repository.ts
│   ├── resume.service.ts
│   ├── resume.routes.ts
│   ├── resume-render.service.ts
│   ├── resume-tailor.service.ts
│   └── resume-version.service.ts
│
├── career/
│   ├── career-gps.service.ts
│   ├── skill-gap.service.ts
│   ├── role-benchmark.service.ts
│   └── career.routes.ts
│
├── jobs/
│   ├── job.model.ts
│   ├── job.repository.ts
│   ├── job.service.ts
│   ├── job-matching.service.ts
│   └── job.routes.ts
│
├── applications/
│   ├── application.model.ts
│   ├── application.repository.ts
│   ├── application.service.ts
│   └── application.routes.ts
│
├── ai/
│   ├── gemini.gateway.ts
│   ├── ai-orchestrator.ts
│   ├── prompts/
│   ├── extraction/
│   ├── matching/
│   └── tailoring/
│
└── analytics/
```

---

# 42. Frontend Architecture

Recommended:

```text
client/

├── app/
│
├── components/
│   │
│   ├── career-profile/
│   │   ├── CareerProfileShell.tsx
│   │   ├── ProfileSidebar.tsx
│   │   ├── IdentitySection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── EvidencePanel.tsx
│   │   └── ProfileCompleteness.tsx
│   │
│   ├── resume-studio/
│   │   ├── ResumeStudio.tsx
│   │   ├── StudioHeader.tsx
│   │   ├── ResumePortfolioSidebar.tsx
│   │   ├── ResumeCanvas.tsx
│   │   ├── AIInsightsPanel.tsx
│   │   ├── DesignPanel.tsx
│   │   ├── InlineAIEditor.tsx
│   │   ├── ResumeSectionEditor.tsx
│   │   └── TailorResumeFlow.tsx
│   │
│   ├── career-gps/
│   │
│   ├── jobs/
│   │
│   └── applications/
│
├── services/
│   ├── career-profile.service.ts
│   ├── resume.service.ts
│   ├── career.service.ts
│   ├── jobs.service.ts
│   └── applications.service.ts
│
└── stores/
    ├── career-profile.store.ts
    ├── resume-studio.store.ts
    └── application.store.ts
```

---

# 43. API Architecture

## Career Profile

```text
GET    /api/career-profile
POST   /api/career-profile/ingest
PATCH  /api/career-profile
GET    /api/career-profile/completeness
GET    /api/career-profile/evidence
PATCH  /api/career-profile/evidence/:id
```

---

## Resume

```text
GET    /api/resumes
GET    /api/resumes/:id
POST   /api/resumes
PATCH  /api/resumes/:id
DELETE /api/resumes/:id

GET    /api/resumes/gallery
```

---

## Tailoring

```text
POST /api/resumes/:id/tailor/analyze
POST /api/resumes/:id/tailor/commit
```

---

## Career GPS

```text
GET  /api/career/gps
POST /api/career/gps/analyze
GET  /api/career/skill-gaps
GET  /api/career/recommendations
```

---

## Jobs

```text
GET  /api/jobs
GET  /api/jobs/:id
POST /api/jobs/:id/analyze
POST /api/jobs/:id/match
```

---

## Applications

```text
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PATCH  /api/applications/:id
POST   /api/applications/:id/status
```

---

# 44. AI Architecture

All AI should go through a centralized gateway.

```text
                    AI ORCHESTRATOR
                          |
        +-----------------+-----------------+
        |                 |                 |
        v                 v                 v
    Extraction        Matching          Tailoring
        |                 |                 |
        +-----------------+-----------------+
                          |
                          v
                    Gemini Gateway
```

The AI layer should never directly write arbitrary database records.

Instead:

```text
AI
 ↓
Structured DTO
 ↓
Validation
 ↓
Business Service
 ↓
Database
```

---

# 45. AI Output Validation

Every AI response should be:

```text
AI Response
    ↓
Schema Validation
    ↓
Evidence Validation
    ↓
Business Rule Validation
    ↓
Persist / Present
```

For example:

```text
AI says:
"Managed a team of 20 engineers"

Evidence check:
No supporting evidence

Result:
REJECT / NEEDS USER CONFIRMATION
```

---

# 46. Resume Tailoring Safety

Tailoring must obey:

```text
1. Do not invent facts.
2. Do not invent metrics.
3. Do not invent technologies.
4. Do not invent responsibilities.
5. Do not change verified career evidence without user approval.
6. Every AI-generated change must be reviewable.
7. The Career Profile remains unchanged unless the user explicitly edits it.
```

---

# 47. Storage Architecture

Use different storage responsibilities.

```text
MongoDB
│
├── CareerProfile
├── CareerEvidence
├── Resume
├── Job
├── Application
└── AI analysis metadata

Object Storage
│
├── Original uploaded PDF
├── Original DOCX
└── Other user files

Client Renderer
│
└── Resume PDF generation
```

Derived resume variants should primarily store their structured ResumeDocument rather than duplicate original files unnecessarily.

---

# 48. Resume Rendering

The canonical ResumeDocument remains the source for deterministic rendering.

```text
ResumeDocument AST
       |
       v
React PDF Renderer
       |
       +---- Browser Preview
       |
       +---- PDF Export
```

This maintains consistent:

- Fonts
- Spacing
- A4 geometry
- Section positioning
- Page layout

---

# 49. Data Ownership

Use clear ownership.

```text
CAREER PROFILE
Owns:
Career truth

RESUME
Owns:
Presentation

JOB
Owns:
Job requirements

TAILORED RESUME
Owns:
Job-specific presentation

APPLICATION
Owns:
Historical submission

CAREER GPS
Owns:
Derived career intelligence
```

Avoid duplicating the same canonical career facts unnecessarily across domains.

---

# 50. Change Propagation

Example:

```text
User edits Career Profile
        |
        v
Profile Version increments
        |
        +----> Master Resume marked "needs sync"
        |
        +----> Tailored resumes marked "may be outdated"
        |
        +----> Career GPS recalculated
        |
        +----> Job matching can refresh
        |
        +----> Existing Applications remain LOCKED
```

---

# 51. Resume Sync UX

If a profile changes:

```text
Your Career Profile was updated.

2 resumes may now be outdated.

[Review Changes]
```

Then:

```text
Career Profile
      ↓
Changed:
New achievement added

Master Resume
✓ Sync

Stripe Resume
⚠ Review

Google Application
🔒 Locked
```

---

# 52. Global Navigation

Keep the main product navigation simple.

```text
SKILLEZO

🏠 Overview

👤 Career Profile

📄 Resumes

🔎 Jobs

📬 Applications

🧭 Career GPS

📊 Insights

────────────────

⚙ Settings
```

Do not expose internal AI engines as navigation items.

Avoid:

```text
ATS
AI Analyzer
Skill Analyzer
Resume Analyzer
AI Recommendations
Role Matcher
```

Those are capabilities, not destinations.

---

# 53. Overview Dashboard

The Overview should answer:

1. Where am I?
2. What is working?
3. What is missing?
4. What should I do next?

Example:

```text
Good evening

Career Profile
94% Complete

Target Role
Full-Stack Engineer

────────────────────────────────

PROFILE       RESUME       SKILLS       APPLICATIONS
94%           92           84              14

────────────────────────────────

NEXT BEST ACTION

Strengthen PostgreSQL evidence

Potential impact:
Higher role match

[Fix This]

────────────────────────────────

APPLICATION ACTIVITY

Applications       14
Interviews          3
Responses           5

────────────────────────────────

YOUR RESUMES

Master
Full-Stack — Stripe
Frontend — Google
```

---

# 54. Product Workflow

The ideal end-to-end user journey:

```text
1. User signs up
        ↓
2. Uploads resume
        ↓
3. AI extracts career data
        ↓
4. User reviews extraction
        ↓
5. Career Profile created
        ↓
6. Master Resume generated
        ↓
7. User enters Resume Studio
        ↓
8. User searches/selects job
        ↓
9. Job analyzed
        ↓
10. Career evidence matched
        ↓
11. AI proposes tailoring
        ↓
12. User approves changes
        ↓
13. Tailored Resume created
        ↓
14. User applies
        ↓
15. Application snapshot locked
        ↓
16. Application tracked
        ↓
17. Outcome feeds Career Intelligence
```

---

# 55. Long-Term Intelligence Loop

The platform can eventually become a learning system for the user's career.

```text
                 CAREER PROFILE
                       |
                       v
                  JOB MATCHING
                       |
                       v
                 RESUME TAILORING
                       |
                       v
                  APPLICATION
                       |
                       v
                    OUTCOME
                       |
                       v
             CAREER INTELLIGENCE
                       |
                       v
              PROFILE INSIGHTS
                       |
                       v
                 CAREER GPS
```

For example:

```text
100 Applications
        |
        v
12 Interviews
        |
        v
Analysis

Strong:
React experience

Weak:
Cloud experience

Recommendation:
Strengthen AWS evidence
```

This is where SKILLEZO can eventually move beyond resume generation.

---

# 56. Implementation Roadmap

## Phase 1 — Career Profile Foundation

- Create CareerProfile domain
- Create structured models
- Resume ingestion pipeline
- AI extraction
- Evidence model
- Source references
- Profile completeness
- User review/edit UI

---

## Phase 2 — Profile → Master Resume

- Career Profile → ResumeDocument mapping
- Master Resume generation
- Resume Studio integration
- A4 renderer
- PDF export
- Profile version tracking

---

## Phase 3 — Resume Gallery

- Master Resume card
- Variant cards
- Gallery
- Resume switching
- Resume metadata
- Score display

---

## Phase 4 — Tailoring Engine

- Target job input
- JD analysis
- Career evidence matching
- Tailoring proposal
- Approval UI
- Resume variant creation
- ATS / Role Match / Impact scoring

---

## Phase 5 — Career GPS

- Role benchmarks
- Skill gap
- Evidence gap
- Readiness
- Recommendations
- Career roadmap

---

## Phase 6 — Jobs

- Job discovery
- Job ingestion
- Job analysis
- Job matching
- Tailor-from-job workflow

---

## Phase 7 — Applications

- Application creation
- Resume snapshot
- Application status
- Timeline
- Interview tracking
- Historical resume preservation

---

## Phase 8 — Intelligence Feedback Loop

- Application outcomes
- Interview outcomes
- Skill gap learning
- Resume performance
- Career recommendations
- Profile improvement suggestions

---

# 57. Non-Breaking Migration Strategy

The current Master/Variant Resume architecture can evolve without throwing away the existing ResumeDocument AST.

Recommended migration:

```text
CURRENT

Resume
 ├── resumeDocument
 ├── variantType
 └── parentResumeId

             ↓

TARGET

CareerProfile
      |
      ├── Resume
      │    └── resumeDocument
      │
      ├── Career GPS
      ├── Job Matching
      └── Applications
```

The existing `resumeDocument` remains responsible for layout and rendering.

The new Career Profile becomes responsible for canonical career data.

---

# 58. Critical Architectural Rules

## Rule 1

**Career Profile is the source of truth.**

## Rule 2

**ResumeDocument is the source of truth for resume layout.**

## Rule 3

**AI never silently modifies Career Profile.**

## Rule 4

**AI-generated resume changes require user approval when they alter substantive career claims.**

## Rule 5

**Every important career claim should have evidence/source information.**

## Rule 6

**Tailored resumes are snapshots, not live mirrors of the Career Profile.**

## Rule 7

**Applications preserve the exact submitted resume snapshot.**

## Rule 8

**Existing application history must never silently change.**

## Rule 9

**User should never have to re-enter information already extracted from their resume.**

## Rule 10

**Internal architecture should remain complex; user experience should remain simple.**

---

# 59. Final Architecture

```text
                              SKILLEZO
                                  |
                                  v
                        +-------------------+
                        |       USER        |
                        +---------+---------+
                                  |
                                  v
                        +-------------------+
                        | RESUME INGESTION  |
                        +---------+---------+
                                  |
                                  v
              +---------------------------------------+
              |            CAREER PROFILE             |
              |                                       |
              |          ⭐ SOURCE OF TRUTH            |
              |                                       |
              | Identity                               |
              | Experience                             |
              | Projects                               |
              | Skills                                 |
              | Education                              |
              | Certifications                         |
              | Achievements                           |
              | Evidence                               |
              +----------------+----------------------+
                               |
          +--------------------+----------------------+
          |                    |                      |
          v                    v                      v
   +--------------+     +-------------+       +--------------+
   | RESUME       |     | CAREER GPS  |       | JOB ENGINE   |
   | ENGINE       |     |             |       |              |
   +------+-------+     +------+------+       +------+-------+
          |                    |                     |
          v                    v                     v
   +--------------+      Skill Gap             Job Matching
   | MASTER       |      Role Gap              Job Analysis
   | RESUME       |      Roadmap               Job Discovery
   +------+-------+                               |
          |                                       |
          v                                       v
   +--------------+                         +-------------+
   | TAILORING    | <-----------------------| TARGET JOB  |
   | ENGINE       |                         +-------------+
   +------+-------+
          |
          v
   +--------------+
   | USER APPROVAL|
   +------+-------+
          |
          v
   +--------------+
   | TAILORED     |
   | RESUME       |
   | SNAPSHOT     |
   +------+-------+
          |
          v
   +--------------+
   | APPLICATION  |
   | SNAPSHOT     |
   +------+-------+
          |
          v
   +--------------+
   | APPLICATION  |
   | OUTCOME      |
   +------+-------+
          |
          v
   +--------------+
   | CAREER       |
   | INTELLIGENCE |
   +--------------+
          |
          +--------------------+
                               |
                               v
                       CAREER PROFILE
                         INSIGHTS
```

---

# 60. Final Product Philosophy

The fundamental architecture should be:

```text
             CAREER PROFILE
              = THE TRUTH
                    |
          +---------+---------+
          |                   |
          v                   v
       RESUMES             CAREER GPS
          |                   |
          v                   v
     JOB-SPECIFIC          CAREER
      PRESENTATION       INTELLIGENCE
          |
          v
      APPLICATION
          |
          v
       OUTCOME
```

The user's mental model should remain extremely simple:

> **"I upload my resume once. SKILLEZO understands my career. I keep my profile updated when something changes. SKILLEZO uses that information to build the right resume, find matching jobs, and help me improve my career."**

That is the core architecture the entire SKILLEZO platform should grow around.
