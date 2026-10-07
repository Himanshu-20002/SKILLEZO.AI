# SKILLEZO AI — Phase 6 (Step 1: Student Portal Dashboard)

## Context

The SKILLEZO AI frontend foundation has already been completed.

The following already exists and MUST be reused:

- Enterprise Dashboard Layout
- Sidebar
- Topbar
- Mobile Sidebar
- User Menu
- Breadcrumb
- Shared Dashboard Components
- Shared Student Components
- Notification System
- Profile Module
- Skill Verification Module
- Glassmorphic Design System
- Mock Data Architecture
- TypeScript Interfaces

Do NOT recreate or redesign any of these.

The objective is to convert the existing Dashboard Home into the Student Portal Dashboard.

----------------------------------------------------

## Objective

Transform the current dashboard homepage into a modern enterprise Student Portal Dashboard that acts as the student's Career Command Center.

The dashboard should answer three questions:

1. Where am I today?
2. What should I do next?
3. How close am I to getting hired?

Every widget should help the student progress toward employment.

----------------------------------------------------

# Dashboard Layout

Use a responsive grid similar to enterprise SaaS products like:

- LinkedIn Learning
- Coursera
- HackerRank
- Eightfold AI
- Workday Learning

Maintain the existing glassmorphism design.

----------------------------------------------------

# Section 1 — Hero Banner

Display

- Welcome back
- Student Name
- Profile Photo
- Target Role
- Learning Streak
- Open to Work Badge
- Profile Completion %

Actions

- Edit Profile
- Upload Resume

----------------------------------------------------

# Section 2 — Career Health Overview

Display KPI cards

- Career Readiness
- Resume Score
- ATS Score
- Skills Verified
- Assessments Completed
- Job Matches

Each card should contain

- Icon
- Score
- Trend
- Status
- Progress

Reuse

ScoreCard

KPIWidget

ProgressRing

----------------------------------------------------

# Section 3 — Quick Actions

Display action cards

- Upload Resume
- Continue Learning
- Start Assessment
- View Skill Gap
- Browse Jobs
- View Career Roadmap

These should be the primary CTAs.

----------------------------------------------------

# Section 4 — Resume Intelligence Summary

Compact dashboard widget

Display

- Resume Score
- ATS Score
- Missing Keywords
- Missing Skills
- Resume Updated Date

CTA

Improve Resume

----------------------------------------------------

# Section 5 — Skill Gap Summary

Display

Current Skills

Target Role

Skill Match %

Top Missing Skills

Recommended Course

CTA

View Full Analysis

----------------------------------------------------

# Section 6 — Learning Progress

Display

- Active Courses
- Completed Courses
- Weekly Learning Hours
- Learning Progress

Reuse

ProgressBar

----------------------------------------------------

# Section 7 — Upcoming Assessments

Display

Upcoming Assessments

Completed

Average Score

Upcoming Deadline

Buttons

Continue

View All

----------------------------------------------------

# Section 8 — Recommended Jobs

Display

4–6 job cards

Each card contains

- Company
- Role
- Match %
- Location
- Salary
- Employment Type

Buttons

View

Save

----------------------------------------------------

# Section 9 — Career Roadmap

Display a vertical timeline

Profile

↓

Resume

↓

Skill Verification

↓

Assessment

↓

Projects

↓

Interview Ready

↓

Job Ready

Reuse Timeline component.

----------------------------------------------------

# Section 10 — AI Recommendations

Display recommendation cards.

Examples

Improve Resume

Complete Docker Assessment

Finish React Course

Build One Backend Project

Every recommendation should display

Estimated Career Readiness Increase

----------------------------------------------------

# Section 11 — Recent Activity

Timeline

Examples

Resume Uploaded

Assessment Completed

Certificate Earned

Profile Updated

Job Applied

----------------------------------------------------

# Section 12 — Notifications Preview

Display

Recent notifications

Button

View All Notifications

Reuse existing notification system.

----------------------------------------------------

# Section 13 — Portfolio Snapshot

Display

Projects

Certificates

Verified Skills

Achievements

GitHub Activity

----------------------------------------------------

# Section 14 — Upcoming Events

Display

Career Webinar

Hackathon

Interview

Coding Contest

Workshop

----------------------------------------------------

# Component Structure

Create new reusable components inside

components/dashboard/student/dashboard/

Examples

StudentHero.tsx

CareerHealthOverview.tsx

QuickActions.tsx

ResumeSummaryWidget.tsx

SkillGapWidget.tsx

LearningWidget.tsx

AssessmentWidget.tsx

RecommendedJobsWidget.tsx

CareerRoadmapWidget.tsx

AIRecommendationWidget.tsx

RecentActivityWidget.tsx

NotificationsWidget.tsx

PortfolioWidget.tsx

EventsWidget.tsx

----------------------------------------------------

# Mock Data

Create

mock/student-dashboard.ts

Use strongly typed interfaces.

Do NOT hardcode values inside components.

----------------------------------------------------

# Responsive Design

Desktop

Laptop

Tablet

Mobile

Widgets should stack naturally on smaller screens.

----------------------------------------------------

# Animations

Use Framer Motion.

Implement

- Page entrance
- Card hover
- Progress animation
- Timeline animation
- Widget fade
- Loading skeletons

----------------------------------------------------

# Important

DO NOT

- redesign the dashboard shell
- modify the sidebar
- recreate shared components
- duplicate code
- change routing

Only enhance the Dashboard Home using the existing architecture.

----------------------------------------------------

# Verification

Run

npm run lint

npx tsc --noEmit

npm run build

----------------------------------------------------

# Expected Deliverables

The dashboard should become the student's central workspace, showing career readiness, learning progress, resume health, assessments, job opportunities, AI recommendations, and next actions while fully reusing the existing enterprise architecture and remaining ready for backend integration.