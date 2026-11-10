# 📋 SKILLEZO.AI — AI Mock Interview Coach: Comprehensive Activity & Task Tracker

**Document:** AI Mock Interview Coach Master Activity & Task Checklist  
**Location:** `doc/sprints-and-plans/AI_MOCK_INTERVIEW_COACH_ACTIVITY_TRACKER.md`  
**Last Updated:** Monday, November 09, 2026 (Mid-Day Sync)  
**System Stack:** Next.js 16 (App Router) + React 19 + Express 5 + MongoDB Mongoose 9 + Vitest v4 + Tailwind CSS + Better Auth  

---

## 📊 High-Level Progress Overview

| Capability Domain | Status | Completed / Total Tasks | Percentage |
| :--- | :---: | :---: | :---: |
| **1. Architecture, Security & Data Foundation** | 🟢 Complete | 8 / 8 Tasks | 100% |
| **2. Role Catalog & Question Engine** | 🟢 Complete | 8 / 8 Tasks | 100% |
| **3. Candidate Setup Portal & Wizard UI** | 🟢 Complete | 7 / 7 Tasks | 100% |
| **4. Interactive Text Interview Arena** | 🟡 In Progress / Next Up | 0 / 8 Tasks | 0% |
| **5. AI Evaluation & Scoring Engine** | ⚪ Scheduled | 0 / 7 Tasks | 0% |
| **6. Interview Analytics & Readiness Report** | ⚪ Scheduled | 0 / 6 Tasks | 0% |
| **7. Browser Voice & Speech System** | ⚪ Backlog | 0 / 6 Tasks | 0% |
| **8. Candidate Intelligence & Profile Synergy** | ⚪ Backlog | 0 / 5 Tasks | 0% |
| **9. Production Hardening, Quotas & Rollout** | ⚪ Backlog | 0 / 5 Tasks | 0% |
| **Total Project Metrics** | 🟡 **Active Delivery** | **23 / 60 Tasks Done** | **38.3% Completed** |

---

## ✅ SECTION 1: WORK COMPLETED TO DATE

### 1.1 Architecture, Security & Data Foundation
- [x] **Inspect Codebase & Establish Non-Redundancy Rules**: Reused existing Better Auth (`requireAuth`), `BaseRepository`, Express middleware, and MongoDB connections without writing parallel auth/database utilities.
- [x] **Master Architecture Specification**: Authored comprehensive architectural blueprint at [`doc/architecture/AI_MOCK_INTERVIEW_COACH_FULL_ARCHITECTURE.md`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/doc/architecture/AI_MOCK_INTERVIEW_COACH_FULL_ARCHITECTURE.md) covering entity relationships, server-driven flow, and security rules.
- [x] **Domain Types & Schemas**: Created domain enums (`InterviewSessionStatus`, `InterviewType`, `SeniorityLevel`, `InterviewDifficulty`, `ReadinessLevel`) and custom error classes in `server/src/modules/interview-coach/domain/`.
- [x] **6 Core Database Models**:
  - `InterviewSession.model.ts`: Tracks state, target role, format, timing, and overall score.
  - `InterviewTemplate.model.ts`: Stores role blueprints, competencies, and durations.
  - `InterviewQuestion.model.ts`: Stores calibrated questions with sequential indexing.
  - `InterviewAnswer.model.ts`: Stores candidate answers, timestamps, drafts, and word counts.
  - `InterviewEvaluation.model.ts`: Stores per-question AI scoring, strengths, and rubrics.
  - `InterviewReport.model.ts`: Stores readiness level, radar breakdown, and action items.
  - Registered all models in central model index (`models/index.ts`).
- [x] **Data Repositories Layer**:
  - `InterviewSessionRepository.ts`: Extends `BaseRepository` with `findByUser`, `findByUserAndId`, `updateStatus`.
  - `InterviewTemplateRepository.ts`: Extends `BaseRepository` with `findBySlug`, `findActive`, `seedTemplatesIfEmpty`.
  - `InterviewQuestionRepository.ts`: Extends `BaseRepository` with `findBySessionId`, `findNextUnanswered`, `bulkInsert`.
- [x] **Candidate Data Isolation**: Enforced query-level tenant isolation using candidate user IDs on all queries (`findByUserAndId`).
- [x] **Zod Validation Pipeline**: Created `createSessionInputSchema`, `sessionParamSchema`, and `listSessionsQuerySchema` with Express validation middleware.
- [x] **Foundational Automated Test Suite**: Built 29 unit and integration tests verifying schema validation, repository methods, and route authorization.

### 1.2 Role Catalog & AI Question Generation Engine
- [x] **10-Role Template Catalog**: Built `InterviewTemplateService` pre-seeded with 10 industry roles:
  1. React Developer (React 19, Server Components, State, SSR)
  2. .NET Developer (C#, ASP.NET Core, EF Core, Microservices)
  3. MERN Developer (Node.js, Express, MongoDB Indexing, REST APIs)
  4. Python Developer (FastAPI, Django REST, Asyncio, PostgreSQL ORM)
  5. Java Developer (JVM Internals, Spring Boot 3, JPA/Hibernate, Kafka)
  6. Data Analyst (Advanced SQL, Window Functions, Pandas, BI Dashboards)
  7. AI/ML Specialist (Transformers, LLM Prompting, RAG, Embeddings, MLOps)
  8. Cloud Engineer (AWS/GCP/Azure Networks, IAM, Serverless, Terraform)
  9. DevOps Engineer (Docker, Kubernetes Ingress/Pods, CI/CD, Prometheus)
  10. Business Analyst (Requirements, User Stories/Gherkin, BPMN, Agile)
- [x] **Google Gemini AI Provider Integration**: Built `InterviewAIService` wrapping platform `GeminiProvider` with model cascading (`gemini-flash-lite-latest` $\rightarrow$ `gemini-3.1-flash-lite` $\rightarrow$ `gemini-3.5-flash`).
- [x] **Seniority & Duration Question Calibration**: Engineered prompts generating 3 questions (15m), 5 questions (30m), or 7 questions (45m) across Entry, Junior, Mid, Senior, and Lead tiers.
- [x] **Zod Output Parsing**: Implemented `GeneratedQuestionPlanSchema` guaranteeing structured questions with sequential indices, categories, and 2-5 `expectedConcepts`.
- [x] **Deterministic Offline Fallback Shield**: Engineered offline question generator ensuring 100% session creation uptime if external AI is unreachable or rate-limited.
- [x] **Session Creation API**: Implemented `POST /api/interviews/sessions` returning HTTP 201 with session metadata and bulk-inserted questions.
- [x] **Question Retrieval API**: Implemented `GET /api/interviews/sessions/:sessionId/questions` with candidate ownership checks.
- [x] **Template Catalog API**: Implemented `GET /api/interviews/templates` returning active blueprints and competencies.

### 1.3 Candidate Setup Portal & Frontend UI
- [x] **Global Sidebar Navigation**: Added "AI Mock Interview" with `Sparkles` icon and purple gradient `AI` badge in `client/components/layout/Sidebar.tsx` (desktop and mobile drawer).
- [x] **Candidate Portal Dashboard**: Built `/dashboard/interview-coach` page with hero statistics, active session cards, and start interview triggers.
- [x] **Interactive 4-Step Setup Wizard**:
  - Step 1: Role search & selection grid with competency tags.
  - Step 2: Seniority pill selector (5 levels) + Interview format selector (Technical, Behavioral, HR, Managerial).
  - Step 3: Duration selector (15m, 30m, 45m) + Difficulty levels (Easy, Medium, Hard).
  - Step 4: Pulsing AI generation visualizer with real-time feedback.
- [x] **Question Plan Inspection Modal**: Created `QuestionPlanModal.tsx` allowing candidates to inspect questions, duration, and expected concepts.
- [x] **Client-Side TypeScript Contracts**: Created `client/types/interview-coach.ts` mirroring backend domain contracts.
- [x] **Empty State & History Cards**: Delivered status badges (`Pending`, `In Progress`, `Completed`) with session details and timestamps.
- [x] **Automated Suite Expansion**: Added 12 additional tests for the question engine, bringing the verified test count to **41/41 passing tests** with **0 TypeScript errors**.

---

## ⏳ SECTION 2: WORK THAT NEEDS TO BE DONE (UPCOMING ROADMAP)

### 2.1 Interactive Text Interview Arena (Immediate Next Milestone)
- [ ] **Candidate Interview Workspace Page**:
  - Build active interview arena at `client/app/dashboard/interview-coach/session/[sessionId]/page.tsx`.
  - Display active question prompt, sequential progress indicator (e.g. "Question 2 of 5"), and category/difficulty badges.
- [ ] **Live Countdown Timer & Clock Warning**:
  - Implement per-question timer with progress bar and visual warnings (< 60s amber, < 20s red pulse).
  - Support automatic submission or grace period when time expires.
- [ ] **Autosave Draft Responses**:
  - Save candidate response drafts to `localStorage` in real-time to prevent accidental data loss on browser refresh.
  - Provide periodic background draft sync to backend.
- [ ] **Answer Submission API Endpoint**:
  - Implement `POST /api/interviews/sessions/:sessionId/answers`.
  - Validate payload (`questionId`, `candidateAnswer`, `timeSpentSeconds`).
  - Calculate word count and record submission timestamp in `InterviewAnswer`.
- [ ] **Question Progression State Machine**:
  - Transition session status from `pending` to `in_progress` upon question 1 start.
  - Advance pointer to next question upon submission.
  - Transition session status to `completed` upon final question submission.
- [ ] **Adaptive Follow-Up Questioning**:
  - Trigger `InterviewAIService.generateFollowUpQuestion` when an answer is brief or lacks expected concepts.
  - Mark dynamic follow-ups with `isFollowUp: true` and link to parent question.
- [ ] **Session Reconnect & Refresh Resiliency**:
  - Candidate re-opening an active session automatically resumes at the current unanswered question with draft intact.
- [ ] **Automated Testing Suite for Text Arena**:
  - Write unit and integration tests covering answer submission, progression, time limits, and session completion.

### 2.2 AI Evaluation & Scoring Engine (Next Milestone)
- [ ] **Multi-Dimension Scoring Rubric**:
  - Define evaluation rubric scoring 5 core dimensions:
    1. Technical Accuracy & Relevance (30%)
    2. Depth & Problem-Solving Approach (25%)
    3. Structural Clarity & Organization (20%)
    4. Concept Coverage / Expected Keywords (15%)
    5. Communication & Tone (10%)
- [ ] **AI Semantic Evaluator (`InterviewEvaluationService`)**:
  - Submit candidate answer alongside `expectedConcepts` and question prompt to Gemini.
  - Return structured feedback: numerical dimension scores, key strengths, improvement areas, and concept matches.
- [ ] **Deterministic Scoring Aggregator**:
  - Compute weighted category scores and overall session score (0-100) mathematically in Node.js (preventing AI hallucinated final scores).
  - Map final score to Readiness Levels (`needs_practice`, `developing`, `interview_ready`, `role_model`).
- [ ] **Answer Evaluation Persistence**:
  - Save structured evaluation documents into `interview_evaluations` collection.
- [ ] **Background Asynchronous Evaluation Queue**:
  - Run evaluations asynchronously post-submission so the candidate doesn't face blocked UI navigation.
- [ ] **Automated Tests for Evaluation Engine**:
  - Verify deterministic score calculation, fallback scoring for unparseable AI responses, and weight distributions.

### 2.3 Interview Analytics & Candidate Readiness Report
- [ ] **Readiness Report Generation Service**:
  - Aggregate answer evaluations into comprehensive `InterviewReport` document.
  - Calculate competency strengths, weak spots, and specific actionable next steps.
- [ ] **Candidate Report Dashboard View (`/dashboard/interview-coach/report/[sessionId]`)**:
  - Large readiness level banner with score pill and target role metadata.
  - Competency radar / bar chart breakdown visualizing dimension mastery.
  - Question-by-question accordion showing candidate answer, AI critique, and model answer suggestions.
- [ ] **Session Performance History & Trends**:
  - Show score progression graphs across multiple mock interviews over time.
- [ ] **PDF Export or Print-Friendly View**:
  - Generate downloadable summary for candidates to review offline before real interviews.

### 2.4 Browser-Based Voice Interview System (Backlog Milestone)
- [ ] **Browser Speech Recognition (Web Speech API / STT)**:
  - Add real-time speech-to-text input with candidate editable transcript confirmation before submitting.
- [ ] **Spoken Question Voice Synthesis (TTS)**:
  - Add text-to-speech audio playback for interviewer questions with natural pauses.
- [ ] **Speech Analytics Indicators**:
  - Calculate speaking pace (Words Per Minute — WPM), filler word frequency (e.g., "um", "ah", "like"), and total talk time.
- [ ] **Microphone Permission & Browser Fallback**:
  - Graceful fallback to text mode if microphone access is denied or browser is unsupported.

### 2.5 Candidate Intelligence & Profile Synergy (Backlog Milestone)
- [ ] **Resume Studio Integration**:
  - Auto-extract candidate resume skills from SKILLEZO Resume Studio to formulate tailored interview questions.
- [ ] **Skill Gap Analysis Integration**:
  - Prioritize mock interview questions targeting identified candidate skill gaps.
- [ ] **Interview Performance $\rightarrow$ Skill Gap Refresh**:
  - Allow candidates to update their verified skill confidence scores after strong mock interview performances.

### 2.6 Production Hardening, Quotas & Rollout
- [ ] **Candidate Practice Quotas & Rate Limiting**:
  - Set limits on active daily/weekly interview sessions to manage Gemini API token consumption.
- [ ] **Prompt Injection & Input Sanitization**:
  - Sanitize candidate responses to prevent jailbreak attempts against evaluation prompts.
- [ ] **Performance & Accessibility Audit**:
  - Ensure full keyboard navigation, screen reader accessibility (ARIA labels), and mobile responsiveness.

---

## 📈 Summary Checklist Tracking

```
[====================>--------------------------------] 38.3% Completed
Total Tasks: 60 | Done: 23 | In-Progress/Next: 8 | Remaining Backlog: 29
```

- **Next Immediate Priority:** Build candidate text interview arena (`/dashboard/interview-coach/session/[sessionId]`), countdown timer, and answer submission endpoint (`POST /api/interviews/sessions/:sessionId/answers`).

