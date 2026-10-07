# SKILLEZO AI — Phase 6 (Student Portal Core)

## Objective

Implement the complete Student Portal frontend for SKILLEZO AI by building all core student-facing modules using reusable components, strongly typed mock data, and the existing enterprise design system.

This phase is **frontend only**.

Do NOT implement:

- Backend APIs
- Database
- Authentication logic
- AI integration
- File uploads
- Payment gateway
- Real chat functionality

Use mock data for all modules.

Maintain the architecture, coding standards, responsiveness, and UI consistency established in previous phases.

---

# User Review Required

## IMPORTANT

Implement one module at a time.

After each module:

- Verify functionality
- Verify responsiveness
- Run lint
- Run TypeScript checks
- Run production build
- Wait for review before continuing

---

# Module 18 — Dashboard Enhancement

Update

app/dashboard/page.tsx

Create

components/dashboard/home/

- CareerReadinessCard.tsx
- SkillProgressCard.tsx
- RecommendedActions.tsx
- LearningProgress.tsx
- UpcomingAssessments.tsx
- RecommendedJobs.tsx
- WeeklyProgress.tsx

Features

- Career Readiness Score
- Weekly Progress
- Learning Progress
- Upcoming Assessments
- Recommended Jobs
- AI Recommendations (Mock)
- Personalized Quick Actions
- Recent Activities

---

# Module 19 — Career Profile

Create

app/dashboard/career-profile/

page.tsx

Create

components/dashboard/career-profile/

- CareerHeader.tsx
- ResumeOverview.tsx
- ExperienceSection.tsx
- EducationSection.tsx
- SkillsSection.tsx
- CertificationsSection.tsx
- PortfolioSection.tsx
- SocialLinks.tsx

Features

- Resume Overview
- Work Experience
- Education
- Skills
- Certifications
- Portfolio
- GitHub
- LinkedIn
- Career Preferences

---

# Module 20 — Resume Intelligence

Create

app/dashboard/resume-intelligence/

page.tsx

Components

- ResumeUploader.tsx
- ResumePreview.tsx
- ResumeScoreCard.tsx
- ATSCompatibility.tsx
- KeywordAnalysis.tsx
- MissingSkills.tsx
- AIRecommendations.tsx

Features

- Resume Upload UI
- Resume Preview
- Resume Score
- ATS Compatibility
- Keyword Match
- Missing Skills
- Resume Suggestions

Mock results only.

---

# Module 21 — Skill Gap Analysis

Create

app/dashboard/skill-gap-analysis/

page.tsx

Components

- SkillRadar.tsx
- GapAnalysis.tsx
- RecommendedLearning.tsx
- TargetRoleCard.tsx
- ProgressTracker.tsx

Features

- Current Skills
- Required Skills
- Skill Gap %
- Missing Technologies
- Learning Recommendations
- Progress Visualization

---

# Module 22 — Employability Index

Create

app/dashboard/employability-index/

page.tsx

Components

- EmployabilityScore.tsx
- TechnicalScore.tsx
- CommunicationScore.tsx
- RecruiterVisibility.tsx
- Recommendations.tsx

Features

- Overall Employability Score
- Technical Readiness
- Communication
- Projects Score
- Resume Strength
- Recruiter Visibility
- Improvement Suggestions

---

# Module 23 — Career GPS

Create

app/dashboard/career-gps/

page.tsx

Components

- CareerRoadmap.tsx
- CareerTimeline.tsx
- SalaryProgression.tsx
- SuggestedRoles.tsx
- LearningMilestones.tsx

Features

- Career Roadmap
- Target Role
- Salary Growth
- Skills Timeline
- Learning Milestones
- Career Recommendations

---

# Module 24 — Learning Hub

Create

app/dashboard/learning-hub/

page.tsx

Components

- CourseCard.tsx
- ContinueLearning.tsx
- RecommendedCourses.tsx
- Certificates.tsx
- LearningStats.tsx

Features

- My Courses
- Continue Learning
- Learning Progress
- Recommended Courses
- Certificates
- Bookmarks

---

# Module 25 — Projects

Create

app/dashboard/projects/

page.tsx

Components

- ProjectCard.tsx
- ProjectGallery.tsx
- TechnologyBadges.tsx
- RepositoryCard.tsx

Features

- Project Portfolio
- Project Details
- Technologies Used
- GitHub Repository
- Live Demo Button
- Upload Project (UI Only)

---

# Module 26 — Assessments

Create

app/dashboard/assessments/

page.tsx

Components

- AssessmentCard.tsx
- AssessmentFilters.tsx
- AssessmentDetails.tsx
- ProgressIndicator.tsx

Features

- Assessment List
- Categories
- Difficulty
- Duration
- Progress
- Assessment Details
- Previous Attempts
- Results Summary

---

# Module 27 — AI Career Coach

Create

app/dashboard/ai-career-coach/

page.tsx

Components

- ChatWindow.tsx
- SuggestedPrompts.tsx
- ConversationCard.tsx

Features

- AI Chat Interface
- Suggested Questions
- Resume Advice
- Career Guidance
- Interview Tips
- Learning Suggestions

Use mock conversations only.

---

# Module 28 — Job Center

Create

app/dashboard/job-center/

page.tsx

Components

- JobCard.tsx
- JobFilters.tsx
- JobSearch.tsx
- SavedJobs.tsx

Features

- Job Listing
- Search
- Filters
- Saved Jobs
- Applied Jobs
- Job Details
- Recommended Jobs

---

# Module 29 — Progress & Analytics

Create

app/dashboard/progress-analytics/

page.tsx

Components

- ProgressCharts.tsx
- SkillGrowth.tsx
- WeeklyReport.tsx
- MonthlyReport.tsx
- ActivityTimeline.tsx

Features

- Learning Progress
- Skill Growth
- Assessment Performance
- Weekly Analytics
- Monthly Analytics
- Activity History

Charts should use placeholder/mock data.

---

# Module 30 — Wallet & Subscription

Create

app/dashboard/wallet/

page.tsx

Components

- CurrentPlan.tsx
- BillingHistory.tsx
- PaymentMethods.tsx
- UpgradePlan.tsx
- InvoiceList.tsx

Features

- Current Subscription
- Plan Details
- Billing History
- Payment Methods
- Upgrade Plan
- Invoice History

UI only.

---

# Shared Components

Create

components/dashboard/student/

Include reusable components:

- ScoreCard
- ProgressRing
- ProgressBar
- AnalyticsCard
- Timeline
- CourseCard
- ProjectCard
- JobCard
- ResumeCard
- AssessmentCard
- EmptyIllustration
- KPIWidget

---

# Mock Data Layer

Extend

mock/

Create

- career.ts
- resume.ts
- learning.ts
- projects.ts
- assessments.ts
- jobs.ts
- analytics.ts
- wallet.ts

Use strong TypeScript interfaces.

---

# Responsive Design

Verify

- Desktop
- Laptop
- Tablet
- Mobile

Optimize

- Sidebar
- Tables
- Cards
- Charts
- Navigation
- Dialogs

---

# Animations

Use Framer Motion.

Implement

- Page transitions
- Card hover animations
- Progress animations
- Dialog animations
- Loading skeletons
- Empty state transitions

---

# Coding Standards

- Next.js 15 App Router
- React 19
- TypeScript Strict Mode
- Functional Components
- Reusable architecture
- Server Components wherever possible
- Client Components only when required
- Tailwind CSS only
- No duplicated code
- Strong typing
- Clean folder structure
- Accessibility-friendly components
- Maintain existing enterprise design system

---

# Verification

Run after every completed module

npm run lint

npx tsc --noEmit

npm run build

---

# Manual Verification Checklist

✓ Dashboard enhancements render correctly

✓ Career Profile is complete

✓ Resume Intelligence UI works with mock data

✓ Skill Gap Analysis displays correctly

✓ Employability Index renders scores

✓ Career GPS roadmap is responsive

✓ Learning Hub displays course cards

✓ Projects module renders correctly

✓ Assessments module supports filtering

✓ AI Career Coach interface is responsive

✓ Job Center displays listings

✓ Progress & Analytics charts render

✓ Wallet & Subscription UI functions

✓ Responsive layout verified on desktop, tablet, and mobile

✓ Zero TypeScript errors

✓ Zero ESLint errors

✓ Production build succeeds

---

# Expected Deliverables

By the end of Phase 6, the Student Portal frontend should include:

- Enhanced Dashboard
- Career Profile
- Resume Intelligence
- Skill Gap Analysis
- Employability Index
- Career GPS
- Learning Hub
- Projects
- Assessments
- AI Career Coach
- Job Center
- Progress & Analytics
- Wallet & Subscription
- Shared Student Portal Component Library
- Strongly Typed Mock Data
- Responsive Enterprise UI
- Production-ready frontend prepared for backend integration in the next phase.