# Skillezo.AI — Frontend Architecture & Component Documentation Directory

Welcome to the central frontend documentation for **SKILLEZO.AI** (`client/`). This directory catalogs all client-side subsystems, Next.js route layouts, state hooks, and React UI components.

---

## 🧭 Component-to-Documentation Directory

Find the exact documentation for any section, component, or UI feature below:

| UI Subsystem / Section | Main Components | Key Documentation |
| :--- | :--- | :--- |
| **Resume Studio** | `ResumeStudioWorkspace`, `LiveResumeCanvas`, `ResumeEditorPanel`, `ResumePreviewPanel`, `ResumeSectionNavigator`, `ResumeRenderer` | [`resume-studio/`](./resume-studio/) |
| **Resume Diff & Comparison** | `ResumeComparisonDialog`, `ResumeSideBySideView`, `ResumeUnifiedDiffView`, `ResumeEvidenceDrawer` | [`resume-studio/14_RESUME_COMPARISON_DIALOG.md`](./resume-studio/14_RESUME_COMPARISON_DIALOG.md) |
| **Resume Tailoring Insights** | `TailoringInsightsPanel`, `TailoringSectionGroup`, `TailoringInsightCard`, `TailoringSummaryMetrics` | [`resume-studio/13_TAILORING_INSIGHTS_MODAL.md`](./resume-studio/13_TAILORING_INSIGHTS_MODAL.md) |
| **Resume Section Engine** | `AchievementsSection`, `EducationSection`, `ExperienceSection`, `ProjectsSection`, `SkillsSection`, `SummarySection` | [`resume-studio/03_SECTION_ENGINE_COMPONENTS.md`](./resume-studio/03_SECTION_ENGINE_COMPONENTS.md) |
| **AI Editor & Evidence Lock**| `SectionAiWorkspace`, `CoachFloatingWidget` | [`resume-studio/06_AI_EDITOR_EVIDENCE_LOCK.md`](./resume-studio/06_AI_EDITOR_EVIDENCE_LOCK.md) |
| **Resume Variants & Portfolio**| `MasterResumeCard`, `ResumeVariantCard`, `CreateVariantModal`, `ResumeVariantSwitcher` | [`resume-studio/07_PORTFOLIO_AND_VARIANTS.md`](./resume-studio/07_PORTFOLIO_AND_VARIANTS.md) |
| **AI Career Coach** | `CoachFloatingWidget`, `CoachChatPanel`, action suggestion pills | [`ai-coach/COACH_UI_WORKBENCH.md`](./ai-coach/COACH_UI_WORKBENCH.md) |
| **Candidate Dashboard** | `DashboardLayout`, `EmployabilityGauge`, `ScoreBreakdown`, `StrengthsAndGaps`, `ActionList` | [`overview/STUDENT_PORTAL_CORE.md`](./overview/STUDENT_PORTAL_CORE.md) |
| **Dashboard Job Center** | `JobSearch`, `JobCard`, `JobDetailsDrawer`, `AppliedJobsTracker`, `ApplicationTimeline` | [`job-portal/JOB_PORTAL_UI.md`](./job-portal/JOB_PORTAL_UI.md) |
| **Dashboard Skill Gap** | `SkillRadarChart`, `CompetencyTable`, `RoleSelector`, `PriorityRecommendations` | [`overview/STUDENT_PORTAL_CORE.md`](./overview/STUDENT_PORTAL_CORE.md) |
| **Dashboard Verification** | `VerificationCard`, `AssessmentModal`, `CertificateModal`, `VerificationTable` | [`overview/STUDENT_PORTAL_CORE.md`](./overview/STUDENT_PORTAL_CORE.md) |
| **Recruiter Portal** | `RecruiterLayout`, `KanbanColumn`, `ApplicantCard`, `CandidateReviewDrawer`, `CreateJobModal` | [`recruiter/RECRUITER_APPLICATION_MANAGEMENT.md`](./recruiter/RECRUITER_APPLICATION_MANAGEMENT.md) |
| **Job Tailoring Workspace** | `JobTailoringWorkspace`, `JobIntakeForm`, `ProposalCard`, `TailoringIntensitySelector` | [`job-portal/JOB_PORTAL_UI.md`](./job-portal/JOB_PORTAL_UI.md) |
| **Client Authentication** | `LoginForm`, `RegisterForm`, `OnboardingFlow`, Better-Auth client | [`auth/CLIENT_AUTH_WALKTHROUGH.md`](./auth/CLIENT_AUTH_WALKTHROUGH.md) |

---

## 📂 Subfolder Structure

- [`overview/`](./overview/): High-level frontend implementation status, developer tasks, student portal core specs, and phase overviews.
- [`resume-studio/`](./resume-studio/): Complete end-to-end documentation of the Resume Studio, including the 3-zone workspace, section renderers, diff comparison dialog, tailoring modal, and PDF export.
- [`ai-coach/`](./ai-coach/): Floating coach widget, chat streaming, action approval drawers, and context-aware suggestions.
- [`job-portal/`](./job-portal/): External job discovery, search, saved jobs, and AI tailoring intake flows.
- [`recruiter/`](./recruiter/): Recruiter talent pipeline, Kanban applicant tracking, and candidate deep-dive review drawer.
- [`auth/`](./auth/): Better-Auth client session handling, protected routes, and onboarding steps.
