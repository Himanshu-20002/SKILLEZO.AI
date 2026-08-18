# 💼 SKILLEZO AI — MODULE 28
# SMART JOB CENTER / JOB PORTAL

Implement Module 28 — Smart Job Center as a complete Student Portal frontend module.

Route:

/dashboard/job-center

The goal is to create a professional AI-powered job portal where students can:

1. Discover relevant jobs
2. Search and filter jobs
3. See AI skill-match scores
4. Inspect complete job details
5. Save/bookmark jobs
6. Apply using their AI Resume
7. Track applications
8. View recommended jobs based on their profile
9. Understand why a job matches them
10. Manage their complete job-search activity from one place

This must feel like a REAL modern job portal, not a simple dashboard table.

==================================================
IMPORTANT — EXISTING APPLICATION
==================================================

The existing SKILLEZO AI Student Portal is already implemented.

DO NOT redesign the existing application.

DO NOT modify:

- Existing Dashboard shell
- Existing Sidebar
- Existing Topbar
- Existing Profile dropdown
- Existing authentication
- Existing theme system
- Existing typography
- Existing spacing system
- Existing global layout
- Existing buttons
- Existing cards
- Existing navigation
- Existing responsive behavior

Reuse the existing design system and components wherever possible.

The Job Center must visually belong to the existing SKILLEZO AI Student Portal.

Do not create a completely different UI style.

==================================================
FRONTEND ONLY
==================================================

This implementation is frontend only.

Use realistic mock data.

DO NOT implement:

- Backend APIs
- Database
- Real job APIs
- Real company APIs
- Real authentication
- Real payment
- Real resume upload backend
- Real job application submission
- Real email notifications

All interactions should work using frontend state and mock data.

The UI should behave realistically even though the data is mocked.

==================================================
CORE JOB CENTER EXPERIENCE
==================================================

The page should be structured around:

JOB DISCOVERY
      ↓
SEARCH & FILTER
      ↓
AI MATCH SCORE
      ↓
JOB DETAILS
      ↓
SAVE / APPLY
      ↓
APPLICATION TRACKING

==================================================
PAGE STRUCTURE
==================================================

Create the main page:

/dashboard/job-center

Recommended structure:

--------------------------------------------------
1. Page Header
--------------------------------------------------

Title:

Smart Job Center

Subtitle:

Find jobs matched to your skills, experience, and career goals.

Show a compact profile/job-readiness summary.

Example:

Target Role:
Full-Stack Engineer

Profile Match:
86%

Resume Status:
AI Resume Ready

Primary CTA:

Complete Profile

--------------------------------------------------
2. Job Portal Summary Cards
--------------------------------------------------

Create 4 compact metrics:

Recommended Jobs
128

High Match Jobs
24

Saved Jobs
12

Applications
8

These values should come from mock data.

Do NOT over-design these cards.

Keep them consistent with the existing dashboard.

==================================================
3. AI RECOMMENDATION SECTION
==================================================

At the top of the job listings, create:

"AI Recommended For You"

Subtitle:

Jobs selected based on your skills, experience, resume, and target role.

Show 3–4 highly matched jobs.

Example:

Senior React Developer
92% Match

Full-Stack Engineer
89% Match

Frontend Engineer
87% Match

Each card should clearly communicate WHY it is recommended.

Example:

✓ React
✓ Next.js
✓ TypeScript
✓ Node.js

Missing:

AWS

Add a small link/button:

Why this matches

Clicking it opens the detailed match explanation.

==================================================
4. JOB SEARCH
==================================================

Create:

JobSearch.tsx

Search input:

"Search jobs, companies, or skills..."

Search should filter mock jobs by:

- Job title
- Company
- Skills
- Location

Add search icon.

Search should update results dynamically.

Include clear search/reset behavior.

==================================================
5. JOB FILTERS
==================================================

Create:

JobFilters.tsx

Filters:

WORK MODE

- Remote
- Hybrid
- On-site

EMPLOYMENT TYPE

- Full-Time
- Part-Time
- Contract
- Internship

EXPERIENCE

- 0–1 years
- 1–3 years
- 3–5 years
- 5+ years

MATCH SCORE

- 85%+
- 70–85%
- All Jobs

SALARY

Use a range selector:

₹6 LPA
to
₹30+ LPA

LOCATION

Include:

- Bangalore
- Hyderabad
- Pune
- Mumbai
- Delhi NCR
- Chennai
- Remote

SKILLS

Examples:

React
Node.js
Next.js
Python
Java
AWS
Docker
SQL

Provide:

Apply Filters

Clear All

On mobile, filters should open inside a drawer/sheet instead of taking large screen space.

==================================================
6. JOB SORTING
==================================================

Add sorting control:

Sort by:

- AI Match
- Latest
- Salary: High to Low
- Salary: Low to High
- Most Relevant

Default:

AI Match

Display:

"128 jobs found"

==================================================
7. JOB LISTING
==================================================

Create:

JobCard.tsx

Each job card must contain:

Company logo/avatar

Verified Employer badge

Job title

Company name

Department

Location

Work Mode

Employment Type

Salary

Experience

AI Match Score

Required Skills

Posted time

Save button

View Details button

Apply button

Example:

--------------------------------

92% SKILL MATCH

Senior Full-Stack Engineer

TechNova Solutions
✓ Verified Employer

Bangalore • Hybrid

₹12–18 LPA
3–5 Years
Full-Time

React
Node.js
TypeScript
AWS
PostgreSQL

Posted 2 days ago

♡ Save

View Details

Apply with AI Resume

--------------------------------

The match score should be visually prominent.

==================================================
8. AI MATCH SCORE
==================================================

Create:

MatchScoreBadge.tsx

Examples:

95%
Excellent Match

91%
Strong Match

84%
Good Match

72%
Potential Match

Match score tiers:

85–100:
Excellent Match

70–84:
Good Match

Below 70:
Potential Match

Do not make the interface feel overly gamified.

The score should look professional.

==================================================
9. WHY THIS JOB MATCHES
==================================================

When the user clicks:

"Why this matches"

open a small modal/popover.

Display:

AI Match Analysis

Overall Match:
92%

Skill Match:
95%

Experience Match:
88%

Role Match:
94%

Location Match:
100%

Matched Skills:

✓ React
✓ TypeScript
✓ Node.js
✓ PostgreSQL

Skill Gaps:

⚠ AWS
⚠ Kubernetes

Recommendation:

"Your profile is highly aligned with this role. Adding AWS experience could improve your match further."

This is simulated AI output.

==================================================
10. JOB DETAILS DRAWER
==================================================

Create:

JobDetailsDrawer.tsx

When the user clicks:

View Details

open a right-side drawer on desktop.

On mobile:

open full-screen.

The drawer must contain:

--------------------------------------------------
JOB HEADER
--------------------------------------------------

Company Logo

Senior Full-Stack Engineer

TechNova Solutions

✓ Verified Employer

92% Skill Match

Bangalore • Hybrid

₹12–18 LPA

--------------------------------------------------
JOB DESCRIPTION
--------------------------------------------------

Display realistic job description.

--------------------------------------------------
RESPONSIBILITIES
--------------------------------------------------

- Build scalable frontend applications
- Develop REST APIs
- Collaborate with product and design teams
- Improve application performance
- Participate in code reviews

--------------------------------------------------
REQUIRED SKILLS
--------------------------------------------------

React
Next.js
TypeScript
Node.js
PostgreSQL
AWS

--------------------------------------------------
SKILL MATCH
--------------------------------------------------

Matched Skills:

React ✓
Next.js ✓
TypeScript ✓
Node.js ✓

Missing:

AWS
Kubernetes

--------------------------------------------------
EXPERIENCE
--------------------------------------------------

3–5 years

--------------------------------------------------
EDUCATION
--------------------------------------------------

Bachelor's degree or equivalent experience

--------------------------------------------------
COMPANY
--------------------------------------------------

Company overview.

Company size.

Industry.

Location.

--------------------------------------------------
PERKS
--------------------------------------------------

Health Insurance
Flexible Work
Learning Budget
Paid Leave
Performance Bonus

--------------------------------------------------
APPLICATION
--------------------------------------------------

Primary CTA:

Apply with AI Resume

Secondary:

Save Job

Share Job

==================================================
11. APPLY WITH AI RESUME
==================================================

The primary application CTA should be:

"Apply with AI Resume"

When clicked, open an application confirmation modal.

Modal:

Apply to Senior Full-Stack Engineer

Your AI Resume:

Shweta_Resume.pdf

ATS Score:

86/100

Job Match:

92%

Resume Match:

88%

Show:

✓ Resume ready
✓ Profile complete
✓ Skills verified

CTA:

Submit Application

Secondary:

Review Resume

Since this is frontend-only, clicking Submit Application should simulate successful submission.

Do not connect to a real employer.

After submission:

Application Submitted ✓

Application status:

Submitted

The job should automatically appear in:

Applied Jobs.

==================================================
12. SAVE JOBS
==================================================

Create bookmarking functionality.

Every JobCard should have:

Save

When clicked:

Saved

The job should move into the Saved Jobs collection.

Use frontend state.

Persist during the current session using localStorage if appropriate.

Do not create backend persistence.

==================================================
13. SAVED JOBS TAB
==================================================

Create:

SavedJobsTab.tsx

Provide a tab/navigation area:

Recommended
All Jobs
Saved Jobs
Applied Jobs

Saved Jobs should display:

Saved jobs count.

Each saved job should retain:

- Job title
- Company
- Match score
- Salary
- Location
- Work mode
- Saved date
- Apply button
- Remove button

Empty state:

"No saved jobs yet."

CTA:

Explore Recommended Jobs

==================================================
14. APPLIED JOBS TAB
==================================================

Create:

AppliedJobsTracker.tsx

Display application tracking.

Statuses:

Submitted
Under Review
Shortlisted
Interview Scheduled
Offer
Rejected

Each application should show:

Job title
Company
Applied date
Match score
Current status
Next step

Example:

Senior React Developer

TechNova Solutions

Applied:
Aug 4, 2026

Match:
92%

Status:

Interview Scheduled

Next Step:

Technical Interview

CTA:

View Job

==================================================
15. APPLICATION TIMELINE
==================================================

When an application is opened, show:

Application Timeline

✓ Application Submitted
Aug 4

✓ Resume Reviewed
Aug 5

✓ Shortlisted
Aug 6

● Technical Interview
Aug 10

○ Final Decision
Pending

This is mock data.

Use a clean timeline.

==================================================
16. APPLICATION STATUS FILTER
==================================================

Add filter:

All
Submitted
Under Review
Shortlisted
Interview
Offer
Rejected

Allow users to quickly filter applications.

==================================================
17. JOB ALERT / RECOMMENDATION AREA
==================================================

Add a compact section:

"Stay Ahead"

Example:

You have 7 new jobs matching your profile since yesterday.

CTA:

View New Matches

Optional secondary action:

Set Job Preferences

Do NOT implement a full notification system.

This is only a frontend UI element.

==================================================
18. NO RESULTS STATE
==================================================

If filters/search return zero results:

Show:

"No jobs match your current filters."

Suggestions:

- Remove salary filter
- Expand location
- Lower match score threshold
- Clear filters

CTA:

Clear All Filters

==================================================
19. LOADING STATE
==================================================

Create skeleton loading states for:

Job cards
Job recommendation cards
Application tracker

Use the existing skeleton component if available.

==================================================
20. ERROR STATE
==================================================

Create a simple frontend error state if job data fails to load.

Example:

Unable to load jobs.

Try Again

Since data is mocked, this can be simulated.

==================================================
21. PAGINATION
==================================================

Do NOT render 100+ job cards on one page.

Use mock pagination.

Example:

12 jobs per page.

Controls:

Previous
1
2
3
Next

Or use "Load More" if that matches the existing application style.

==================================================
22. RESPONSIVE DESIGN
==================================================

DESKTOP:

Use a two-column job portal layout where appropriate.

Example:

Main Content
+
Filter Sidebar

JOB DETAILS:

Right-side drawer.

TABLET:

Collapse filters into horizontal controls.

MOBILE:

Stack all content.

Search full width.

Filters open in a drawer/sheet.

Job cards become compact vertical cards.

Job details become full-screen.

Application tracker becomes mobile cards instead of a wide table.

Do not create horizontal overflow.

==================================================
23. DARK MODE / LIGHT MODE
==================================================

Must support the existing:

Dark Mode
Light Mode

Do not hardcode colors.

Use existing theme tokens/classes.

Do not change the global theme implementation.

==================================================
24. MOCK DATA
==================================================

Create:

mock/job-center.ts

Include at least:

20 realistic job listings.

Use different companies, roles, salaries, locations, skills, and match scores.

Example roles:

Senior React Developer
Frontend Engineer
Full-Stack Developer
Node.js Developer
Software Engineer
Next.js Developer
Backend Engineer
AI/ML Engineer
DevOps Engineer
Java Developer

Each job should have:

id
title
company
companyLogo
verified
department
location
workMode
employmentType
salaryMin
salaryMax
experienceMin
experienceMax
skills
description
responsibilities
education
perks
matchScore
matchedSkills
missingSkills
postedDate

==================================================
25. MOCK APPLICATION DATA
==================================================

Create at least:

8 applications.

Use different statuses:

Submitted
Under Review
Shortlisted
Interview Scheduled
Offer
Rejected

Each application should include:

id
jobId
appliedDate
status
timeline
nextStep

==================================================
26. TYPES
==================================================

Create:

types/job-center.ts

Include strongly typed interfaces:

Job

JobFilter

JobMatch

JobApplication

ApplicationStatus

ApplicationTimelineEvent

JobSearchState

SavedJob

Do not use:

any

unless absolutely required by an existing library.

==================================================
27. COMPONENT STRUCTURE
==================================================

Create:

components/dashboard/job-center/

JobSearch.tsx
JobFilters.tsx
JobCard.tsx
JobMatchScore.tsx
JobDetailsDrawer.tsx
JobMatchBreakdown.tsx
ApplyJobModal.tsx
SavedJobsTab.tsx
AppliedJobsTracker.tsx
ApplicationTimeline.tsx
JobEmptyState.tsx
JobSkeleton.tsx
index.ts

Reuse existing UI primitives whenever available.

Do not duplicate existing components.

==================================================
28. PAGE STRUCTURE
==================================================

Create/modify:

app/dashboard/job-center/page.tsx

The page should manage:

- Search state
- Filter state
- Sorting
- Selected job
- Drawer state
- Saved jobs
- Application state
- Active tab
- Pagination

If the existing application already has a state-management pattern, follow it.

Do not introduce Redux/Zustand/etc. unnecessarily.

==================================================
29. CONNECTION WITH PREVIOUS CAREER MODULES
==================================================

IMPORTANT:

The Job Center should integrate conceptually with the earlier Career Intelligence modules.

Use mock/shared data where available from:

Module 20:
AI Resume Intelligence

Module 21:
Skill Gap Analysis

Module 22:
Employability Index

Module 23:
Career GPS

The Job Center should use:

Target Role
Candidate Skills
Resume ATS Score
Skill Gaps
Employability Score

to generate realistic job matches.

Example:

Target Role:
Full-Stack Engineer

Candidate Skills:
React
Node.js
TypeScript
PostgreSQL

Skill Gaps:
AWS
Kubernetes

ATS Score:
86

Employability:
78

Then a job requiring:

React
Node.js
TypeScript
PostgreSQL
AWS

could produce:

92% Match

Do not create a completely disconnected candidate profile.

If the existing project already has a shared career-intelligence data layer, reuse it.

==================================================
30. AI MATCHING LOGIC
==================================================

Implement a simple deterministic frontend scoring model.

Example concept:

Skill Match = 50%
Experience Match = 20%
Role Match = 15%
Location/Work Mode = 10%
Resume Alignment = 5%

The exact implementation can be simplified, but it must be deterministic.

Do not call an AI API.

The UI should simply present the result as:

AI Match Score

Do not claim this is a real production AI model.

==================================================
31. VERIFIED EMPLOYER
==================================================

Use a subtle:

✓ Verified Employer

badge.

Do not imply actual external verification.

This is mock frontend data.

==================================================
32. ACCESSIBILITY
==================================================

Ensure:

- Buttons have accessible labels
- Bookmark buttons have aria-label
- Drawer can be closed with Escape if existing UI primitives support it
- Keyboard navigation works
- Focus states are visible
- Form controls have labels
- Color is not the only indicator of status

==================================================
33. PERFORMANCE
==================================================

Avoid unnecessary re-renders.

Use derived filtering rather than duplicating job datasets.

Do not add unnecessary dependencies.

Use existing chart/UI libraries already installed.

==================================================
34. NAVIGATION
==================================================

Use:

/dashboard/job-center

Do not redesign the sidebar.

If Job Center already exists in the sidebar, connect the existing navigation item.

If it does not exist, add ONLY the required navigation entry using the existing navigation architecture.

==================================================
35. VERIFICATION
==================================================

After implementation run:

npx tsc --noEmit

npm run lint

npm run build

Fix all errors.

Expected result:

✓ TypeScript: 0 errors
✓ ESLint: 0 errors
✓ Build: successful
✓ No broken routes
✓ No console errors

==================================================
36. FINAL QA CHECKLIST
==================================================

Verify:

✓ Job Center route works

✓ Search works

✓ Search by title works

✓ Search by company works

✓ Search by skill works

✓ Work mode filter works

✓ Employment type filter works

✓ Experience filter works

✓ Salary filter works

✓ Match score filter works

✓ Location filter works

✓ Skill filter works

✓ Sorting works

✓ Pagination works

✓ Job cards render correctly

✓ AI match score displays correctly

✓ Why this matches works

✓ Job details drawer opens

✓ Job details drawer closes

✓ Mobile job details works

✓ Save job works

✓ Saved Jobs tab works

✓ Remove saved job works

✓ Apply with AI Resume works

✓ Application modal works

✓ Submit application updates state

✓ Applied Jobs tab works

✓ Application statuses display correctly

✓ Application timeline works

✓ Application filtering works

✓ Empty states work

✓ Loading skeleton works

✓ Dark Mode works

✓ Light Mode works

✓ Mobile responsive layout works

✓ Existing dashboard remains unchanged

✓ Existing sidebar remains unchanged

✓ Existing topbar remains unchanged

✓ Existing navigation remains unchanged

==================================================
IMPORTANT IMPLEMENTATION RULE
==================================================

Do NOT implement the entire application in one giant component.

Break the Job Center into reusable components.

Do NOT duplicate job data.

Do NOT hardcode filtering logic separately in multiple components.

Keep page-level state centralized where appropriate.

Keep mock data separate from UI components.

Keep types separate from mock data.

==================================================
DESIGN DIRECTION
==================================================

The final interface should feel like:

"LinkedIn Jobs + AI career matching + modern student career dashboard"

but it must remain visually consistent with SKILLEZO AI.

Prioritize:

Professional
Clean
Trustworthy
Modern
Data-rich
Easy to scan
Career-focused

Avoid:

Excessive gradients
Huge decorative graphics
Overly rounded UI everywhere
Unnecessary animations
Clutter
Too many badges
Fake AI gimmicks

The primary focus is:

FIND JOB
UNDERSTAND MATCH
APPLY
TRACK APPLICATION

==================================================
IMPLEMENTATION SCOPE
==================================================

Implement ONLY:

MODULE 28 — SMART JOB CENTER

Do NOT implement:

Module 29 — Progress & Growth Analytics
Module 30 — Wallet & Credits
Any other future module.

Do not modify unrelated pages.

Finish with:

1. Type check
2. Lint
3. Production build
4. Route verification
5. Responsive verification

The final result should be a production-quality FRONTEND PROTOTYPE of the SKILLEZO AI Job Portal.