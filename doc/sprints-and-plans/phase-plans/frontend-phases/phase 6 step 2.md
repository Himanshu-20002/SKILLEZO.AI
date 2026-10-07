
# SKILLEZO AI — Career Intelligence Phase
## Modules 20–23

Implement the next four Student Portal frontend modules in STRICT sequential order.

Modules:

MODULE 20
AI Resume Intelligence
Route:
/dashboard/resume-intelligence

MODULE 21
Skill Gap Analysis
Route:
/dashboard/skill-gap-analysis

MODULE 22
Employability Index
Route:
/dashboard/employability-index

MODULE 23
Career GPS Roadmap
Route:
/dashboard/career-gps

==================================================
IMPORTANT EXISTING APPLICATION RULES
==================================================

The existing SKILLEZO AI Student Portal is already implemented.

DO NOT redesign the existing application.

DO NOT modify:

- Existing Dashboard
- Existing Sidebar
- Existing Topbar
- Existing Profile dropdown
- Existing navigation
- Existing theme system
- Existing Dark Mode
- Existing Light Mode
- Existing typography
- Existing spacing system
- Existing cards
- Existing buttons
- Existing global layout
- Existing responsive shell

Reuse the existing design system and components.

The new modules must look like they belong to the SAME application.

Do not add unnecessary UI elements.

Do not change existing pages.

Do not create duplicate components.

This is FRONTEND ONLY.

Use realistic mock data.

No backend API.
No database.
No authentication changes.
No real AI API.
No payment integration.

==================================================
CORE ARCHITECTURE
==================================================

These four modules must NOT behave like four completely unrelated pages.

They form one connected Career Intelligence system:

Student Profile
      ↓
AI Resume Intelligence
      ↓
Skill Gap Analysis
      ↓
Employability Index
      ↓
Career GPS Roadmap

Use a shared mock career-data layer so information can flow between modules.

Create:

mock/career-intelligence.ts

and strongly typed interfaces under:

types/career-intelligence.ts

Do NOT duplicate the same candidate data inside every page.

==================================================
MODULE 20
AI RESUME INTELLIGENCE
==================================================

Route:

/dashboard/resume-intelligence

Purpose:

Create the student's resume intelligence workspace.

--------------------------------------------------
1. Page Header
--------------------------------------------------

Title:

AI Resume Intelligence

Subtitle:

Analyze your resume against your target career role.

Display:

- Resume status
- Last analyzed date
- ATS compatibility score
- Target role

Primary action:

Upload Resume

Secondary action:

Analyze Resume

These are frontend/mock interactions only.

--------------------------------------------------
2. Resume Upload Area
--------------------------------------------------

Create a drag-and-drop style upload zone.

Supported UI labels:

PDF
DOCX

Display:

- Upload icon
- Drag & drop message
- Browse Files button
- Supported format text
- Maximum file size text

Do not actually upload files to a backend.

The interaction should simulate a successful upload.

--------------------------------------------------
3. Resume Preview
--------------------------------------------------

After mock upload, display an interactive resume preview.

Include:

- Candidate name
- Professional summary
- Experience
- Skills
- Education
- Certifications
- Projects

Use mock parsed resume data.

--------------------------------------------------
4. ATS Compatibility Gauge
--------------------------------------------------

Create a prominent 0–100 ATS score gauge.

Example:

ATS Compatibility
86/100

Status:

Strong

Show supporting metrics:

- Keyword Match
- Formatting
- Skills Alignment
- Experience Relevance
- Section Completeness

Use the existing visual language.

--------------------------------------------------
5. Keyword Match Matrix
--------------------------------------------------

Create a table/card showing:

Keyword
Resume Status
Importance

Example:

React
Matched
High

Next.js
Matched
High

AWS
Partial
Medium

Docker
Missing
High

--------------------------------------------------
6. Missing Skills

Display missing skills detected against the selected target role.

Example:

Docker
AWS
Kubernetes

Each skill should have:

- Skill name
- Priority
- Reason
- Add to Skill Gap button

--------------------------------------------------
7. AI Suggestions

Create recommendation cards.

Example:

Improve Cloud Experience

Estimated ATS Boost
+6 points

Recommendation:

Add measurable AWS deployment experience to your recent project.

Additional examples:

- Strengthen professional summary
- Add missing keywords
- Quantify project achievements
- Improve experience descriptions

These are simulated AI recommendations.

--------------------------------------------------
8. Resume Score Improvement

Show:

Current Score: 86

Potential Score: 94

Estimated Improvement: +8

This is mock presentation only.

==================================================
MODULE 21
SKILL GAP ANALYSIS
==================================================

Route:

/dashboard/skill-gap-analysis

Purpose:

Compare the student's current capabilities against requirements for a target role.

--------------------------------------------------
1. Header
--------------------------------------------------

Title:

Skill Gap Analysis

Subtitle:

Understand what skills you need to become job-ready.

--------------------------------------------------
2. Target Role Selector
--------------------------------------------------

Create selector options:

Full-Stack Engineer
AI/ML Specialist
DevOps Engineer

Default:

Full-Stack Engineer

Changing the role should update the mock analysis data.

--------------------------------------------------
3. Skill Overview

Display:

Skills Acquired
Skills Required
Skills Missing
Overall Match

Example:

72% Role Match

--------------------------------------------------
4. Skill Radar Chart

Create a radar chart using the existing chart library if already available.

Categories:

Frontend
Backend
Database
Cloud
DevOps
System Design

Show:

Current Level
Required Level

Do not install unnecessary chart libraries if an existing chart library is already present.

--------------------------------------------------
5. Competency Match Table

Columns:

Skill
Current Level
Required Level
Gap
Priority
Status

Example:

React
Advanced
Advanced
0
Low
Matched

AWS
Beginner
Intermediate
1
High
Gap

Docker
Intermediate
Advanced
1
Medium
Gap

--------------------------------------------------
6. Priority Recommendations

Create recommendation cards:

HIGH PRIORITY

AWS
Reason:
Required for target role.

MEDIUM PRIORITY

Docker

LOW PRIORITY

Advanced System Design

Each recommendation should include:

- Skill
- Current level
- Required level
- Priority
- Suggested next action

--------------------------------------------------
7. Connection With Resume Intelligence

Use the mock output from Module 20.

Skills marked as missing in Resume Intelligence should appear in Skill Gap Analysis where appropriate.

Do not create a separate unrelated dataset.

==================================================
MODULE 22
EMPLOYABILITY INDEX
==================================================

Route:

/dashboard/employability-index

Purpose:

Provide a consolidated career-readiness score.

--------------------------------------------------
1. Main Employability Gauge
--------------------------------------------------

Display:

Employability Index

Example:

78/100

Status:

Strong Candidate

Use a large visual gauge consistent with the existing dashboard style.

--------------------------------------------------
2. Score Breakdown

Create separate cards/meters:

Technical Readiness
82%

Resume Strength
86%

Project Strength
74%

Skill Alignment
72%

Recruiter Visibility
68%

--------------------------------------------------
3. Career Readiness Summary

Display:

Current Tier:

Top 15%

Target:

Top 5%

Show a visual progress indicator.

--------------------------------------------------
4. Strengths

Example:

✓ Strong frontend skills
✓ Verified technical credentials
✓ Good resume keyword alignment
✓ Relevant project experience

--------------------------------------------------
5. Improvement Areas

Example:

⚠ Improve cloud skills
⚠ Add production-level projects
⚠ Improve recruiter visibility
⚠ Complete missing skill verification

--------------------------------------------------
6. Action List

Create prioritized actions.

Example:

1. Complete AWS skill verification
2. Add 2 production-ready projects
3. Improve resume ATS score
4. Complete system design assessment

Each action should indicate:

Priority
Estimated impact

--------------------------------------------------
7. Data Relationship

The Employability Index should use mock values derived from:

- Resume Intelligence
- Skill Gap Analysis
- Existing Profile
- Existing Verified Skills
- Existing Projects

Do NOT introduce another disconnected candidate dataset.

The score calculation can be a frontend mock calculation.

Clearly keep it deterministic.

==================================================
MODULE 23
CAREER GPS ROADMAP
==================================================

Route:

/dashboard/career-gps

Purpose:

Turn the student's career readiness information into a visual career roadmap.

--------------------------------------------------
1. Header
--------------------------------------------------

Title:

Career GPS

Subtitle:

Your personalized path from profile completion to job readiness.

--------------------------------------------------
2. Career Goal

Display:

Target Role:

Senior Full-Stack Engineer

Target Salary:

₹XX LPA

Target Timeline:

6 Months

Use mock data.

--------------------------------------------------
3. Career Roadmap

Create a horizontal timeline on desktop and vertical timeline on mobile.

Stages:

1. Profile
2. Resume Audit
3. Skill Verification
4. Skill Gap Closure
5. Projects
6. Interview Preparation
7. Job Ready

Each stage should show:

- Status
- Completion percentage
- Short description
- Action button

Example:

PROFILE

Completed

100%

RESUME AUDIT

In Progress

82%

SKILL VERIFICATION

In Progress

74%

SKILL GAP CLOSURE

Pending

52%

PROJECTS

In Progress

68%

INTERVIEW PREP

Locked

0%

JOB READY

Locked

0%

--------------------------------------------------
4. Current Milestone

Highlight the student's current milestone.

Example:

Current Focus

Close your highest-priority skill gaps.

Progress:

68%

Next Action:

Complete AWS fundamentals.

--------------------------------------------------
5. Salary Progression

Create a simple salary progression chart.

Example:

Current
₹6 LPA

Next Target
₹9 LPA

Target Role
₹14 LPA

Use the existing chart system.

--------------------------------------------------
6. Milestone Tracker

Display:

Completed
In Progress
Upcoming

Allow the student to visually understand their journey.

--------------------------------------------------
7. Career GPS Relationship

The roadmap should use data from:

Profile
Resume Intelligence
Skill Gap Analysis
Employability Index

Example:

If Resume ATS score is low:

Resume Audit remains incomplete.

If skill gaps remain:

Skill Gap Closure remains active.

If employability score improves:

Roadmap progress increases.

Keep this logic frontend/mock only.

==================================================
SHARED COMPONENTS
==================================================

Create reusable components where appropriate.

Suggested structure:

components/dashboard/career/

CareerPageHeader.tsx
ScoreGauge.tsx
MetricCard.tsx
SkillMatchTable.tsx
RecommendationCard.tsx
CareerTimeline.tsx
MilestoneCard.tsx
ProgressIndicator.tsx
CareerChart.tsx

Do NOT duplicate existing shared components.

If an equivalent component already exists in the project, reuse it instead.

==================================================
SHARED DATA
==================================================

Create:

mock/career-intelligence.ts

Containing:

careerProfile

resumeAnalysis

skillGapAnalysis

employabilityIndex

careerRoadmap

Do not hardcode these values independently inside each page.

==================================================
TYPE SAFETY
==================================================

Create strongly typed interfaces.

Examples:

CareerProfile

ResumeAnalysis

ResumeKeyword

ResumeSuggestion

SkillGap

SkillCompetency

EmployabilityScore

EmployabilityMetric

CareerMilestone

CareerRoadmap

Do NOT use:

any

unknown

untyped objects

unless absolutely required by an existing library API.

==================================================
THEME REQUIREMENTS
==================================================

All four modules must support:

Dark Mode
Light Mode

The existing Light Mode must remain visually consistent with the dashboard shown previously.

Do NOT create separate hardcoded light/dark designs.

Use the existing theme tokens/classes.

Do NOT change the theme implementation.

==================================================
RESPONSIVE REQUIREMENTS
==================================================

Desktop:

Professional dashboard layouts.

Tablet:

Adapt columns naturally.

Mobile:

Stack content vertically.

Radar charts and timelines must remain usable on smaller screens.

Do not modify the existing dashboard shell.

==================================================
NAVIGATION
==================================================

Add these routes to the existing Student Portal navigation ONLY if the navigation architecture already supports adding these modules.

Do not redesign the sidebar.

Routes:

/dashboard/resume-intelligence
/dashboard/skill-gap-analysis
/dashboard/employability-index
/dashboard/career-gps

Use existing navigation styling.

==================================================
IMPLEMENTATION ORDER
==================================================

IMPORTANT:

Implement ONLY ONE MODULE AT A TIME.

ORDER:

STEP 1
Module 20 — AI Resume Intelligence

STOP.

Verify Module 20.

Then implement:

STEP 2
Module 21 — Skill Gap Analysis

STOP.

Verify Module 21.

Then implement:

STEP 3
Module 22 — Employability Index

STOP.

Verify Module 22.

Then implement:

STEP 4
Module 23 — Career GPS Roadmap

STOP.

Verify Module 23.

Do not jump ahead to Modules 24–30.

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT implement:

AI Learning Hub
Portfolio & Projects Engine
Interactive Assessments
AI Career Coach
Smart Job Center
Progress Analytics
Wallet
Payments
Subscription system
Real AI APIs
Backend APIs
Database
Real resume parsing
Real ATS engine

Those belong to future phases.

==================================================
QUALITY CHECK
==================================================

After each module:

npm run lint

npx tsc --noEmit

npm run build

Check:

✓ No TypeScript errors
✓ No ESLint errors
✓ No broken routes
✓ No console errors
✓ Dark Mode works
✓ Light Mode works
✓ Responsive layout works
✓ Existing Dashboard unchanged
✓ Existing Sidebar unchanged
✓ Existing Topbar unchanged
✓ Existing Profile dropdown unchanged
✓ Existing navigation styling unchanged
✓ No duplicate components
✓ No unnecessary dependencies
✓ No backend integration

==================================================
FINAL EXPECTATION
==================================================

The final result after Modules 20–23 should feel like ONE connected SKILLEZO AI Career Intelligence system:

PROFILE
   ↓
AI RESUME INTELLIGENCE
   ↓
SKILL GAP ANALYSIS
   ↓
EMPLOYABILITY INDEX
   ↓
CAREER GPS

The four modules should share the same candidate data model and design system.

Do not change anything outside the scope of these four modules.

Do not implement future modules.