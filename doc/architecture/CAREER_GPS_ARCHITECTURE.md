# 🧭 SKILLEZO AI — Career GPS Architecture & Computation Engine

> **Document Type:** System Architecture & Algorithmic Blueprint  
> **Module:** Module 23 • Career GPS & Multi-Factor Employability Engine  
> **Status:** 🟢 Production Ready  
> **Version:** 2.4.0  

---

## 🏛️ 1. High-Level Concept Architecture Diagram

```text
====================================================================================================
                                CAREER GPS CONCEPT ARCHITECTURE
====================================================================================================

+--------------------------------------------------------------------------------------------------+
|                                    1. CANDIDATE DATA SOURCES                                     |
+------------------------------------+------------------------------------+------------------------+
|  [ Candidate Resume PDF ]          |  [ MongoDB Candidate Profile ]     |  [ Target Role Choice ]|
|  - Raw text via pdf-parse          |  - Projects & Tech Stacks          |  - Full-Stack Engineer |
|  - Extracted skills array          |  - GitHub & Demo links             |  - Frontend Engineer   |
|  - Experience & education          |  - Bio & location completeness     |  - Backend / AI / etc. |
+------------------+-----------------+------------------+-----------------+-----------+------------+
                   |                                    |                             |
                   |                                    |                             |
                   v                                    v                             v
+------------------+-----------------+------------------+-----------------+-----------+------------+
|  [ ATS Resume Engine ]             |  [ Profile & Project Evaluator ]   |  [ Role Taxonomy Matrix]  |
|  - Keyword density & brevity       |  - Project count evaluation        |  - 6-axis required skills |
|  - Structure & impact metrics      |  - Live link verification          |  - Required score (0-100)  |
|  OUTPUT: Resume Score (0-100)      |  OUTPUT: Project & Recruiter Pts   |  - Skill importance level |
+------------------+-----------------+------------------+-----------------+-----------+------------+
                   |                                    |                             |
                   \------------------\                 |                 /-----------/
                                      |                 |                 |
                                      v                 v                 v
+--------------------------------------------------------------------------------------------------+
|                               2. INTELLIGENCE & CALCULATION ENGINE                               |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +---------------------------------------+      +-------------------------------------------+   |
|   |         SKILL GAP ENGINE              |      |           EMPLOYABILITY ENGINE            |   |
|   |  - Analyzes candidate skills vs role  |      |   Weighted Formula:                       |   |
|   |  - Detects missing competencies       | ---> |   Score = 0.40(Tech Readiness)            |   |
|   |  - Flags High/Med/Low deficits        |      |         + 0.25(Resume Strength)           |   |
|   |  - Outputs Gap Recommendations        |      |         + 0.15(Project Strength)          |   |
|   +-------------------+-------------------+      |         + 0.10(Skill Alignment)           |   |
|                       |                          |         + 0.10(Recruiter Visibility)      |   |
|                       |                          +---------------------+---------------------+   |
|                       |                                                |                         |
+-----------------------|------------------------------------------------|-------------------------+
                        |                                                |
                        v                                                v
+-----------------------+-------------------+      +---------------------+-------------------------+
|     3. MILESTONE & ROADMAP GENERATOR      |      |           4. TIER CLASSIFIER                  |
|  - Turns skill gaps into learning goals   |      |  - Score >= 88: Top 5%   (Interview Ready)    |
|  - Injects Resume ATS optimization target |      |  - Score >= 75: Top 15%  (Competitive)        |
|  - Injects Tier-1 Job Application goal    |      |  - Score >= 60: Top 30%  (Solid Baseline)     |
|  - Computes Total Estimated Weeks (1-8w)  |      |  - Score < 60:  Developing (Active Roadmap)   |
+-----------------------+-------------------+      +---------------------+-------------------------+
                        |                                                |
                        \-----------------------\        /---------------/
                                                |        |
                                                v        v
+--------------------------------------------------------------------------------------------------+
|                                 5. CLIENT PRESENTATION LAYER                                     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   [/dashboard/career-gps]                                  [/dashboard/ai-career-coach]          |
|   +-------------------------------------------------+      +---------------------------------+   |
|   | Target Role Selector: [Full-Stack Engineer  v]  |      |  AI Workbench - Safe Actions:   |   |
|   |                                                 |      |  - "Add missing Docker skills"  |   |
|   | Current Focus Milestone: [React 19 Server Comp] |      |  - "Generate ATS resume bullets"|   |
|   |                                                 |      |  - "Browse 12 matching jobs"    |   |
|   | 7-Stage Interactive Roadmap:                    |      +---------------------------------+   |
|   | (1) Learn Docker [2w] -> (2) GraphQL APIs [1w]  |                                            |
|   | -> (3) ATS 90+ [1w] -> (4) Apply Tier-1 [1w]    |                                            |
|   |                                                 |                                            |
|   | Salary Progression Chart:                       |                                            |
|   | [Current: 5 LPA] -> [Target: 10 LPA] -> [18 LPA]|                                            |
|   +-------------------------------------------------+                                            |
+--------------------------------------------------------------------------------------------------+
```

---

## 🔄 2. End-to-End Execution Sequence Flowchart

```text
====================================================================================================
                        STEP-BY-STEP DATA PROCESSING FLOW
====================================================================================================

[ Candidate Browser ]
         |
         |  1. Candidate navigates to /dashboard/career-gps
         |  2. Calls GET /api/career-plan/gps?role=Full-Stack+Engineer
         v
[ Express Server (Router) ]
         |
         |  3. Auth middleware validates session token
         v
[ EmployabilityController.getCandidateCareerGps() ]
         |
         v
[ EmployabilityService.getCandidateCareerGps(userId, targetRole) ]
         |
         |----------------------+----------------------+----------------------+
         |                      |                      |                      |
         v                      v                      v                      v
[ MongoDB: Resumes ]   [ MongoDB: Profiles ]  [ ResumeService ATS ]  [ SkillGapService ]
  Fetch user active      Fetch bio, links,      Calculate keyword      Fetch target role
  resume & raw text      projects & skills      density & formatting   benchmark taxonomy
         |                      |                      |                      |
         \----------------------+----------------------+----------------------/
                                |
                                v
                   [ SkillGapEngine.analyzeSkillGap() ]
                   - Compares candidate skills vs role requirements
                   - Matches: React(85), Node(85), Mongo(80)
                   - Gaps: Docker(missing), AWS(missing)
                   - Emits: overallMatchScore (e.g. 68%) + Priority Recommendations
                                |
                                v
                   [ EmployabilityEngine.calculateEmployability() ]
                   - Evaluates 5 mathematical factors
                   - Factor 1: Technical Readiness = 68 * 0.40  = 27.2
                   - Factor 2: Resume Strength     = 82 * 0.25  = 20.5
                   - Factor 3: Project Strength    = 85 * 0.15  = 12.75
                   - Factor 4: Skill Alignment     = 60 * 0.10  = 6.0
                   - Factor 5: Profile Visibility  = 75 * 0.10  = 7.5
                   - Overall Score                 = 74 (Top 30% Tier)
                                |
                                v
                   [ Milestone Synthesis & Priority Sorter ]
                   - Milestone 1 [HIGH]: Learn Docker & Containers (2 Weeks)
                   - Milestone 2 [HIGH]: Master AWS & Cloud Infra (2 Weeks)
                   - Milestone 3 [MED]:  Optimize Resume to 90+ ATS (1 Week)
                   - Milestone 4 [LOW]:  Apply to Curated Tier-1 Jobs (1 Week)
                   - Total Timeline: 6 Weeks
                                |
                                v
[ JSON HTTP Response (200 OK) ]
  {
    targetRole: "Full-Stack Engineer",
    overallScore: 74,
    tierStatus: "Top 30%",
    totalEstimatedWeeks: 6,
    milestones: [...]
  }
         |
         v
[ Frontend React Page (/dashboard/career-gps) ]
  Renders interactive milestones, progress rings, and salary projections!
```

---

## 🧮 3. Mathematical Formula & Weight Distribution

The core calculation logic in `server/src/modules/career-plan/employability.engine.ts`:

$$\mathbf{\text{Employability Score}} = \sum_{i=1}^{5} (w_i \times F_i)$$

```text
+-----------------------------------------------------------------------------------------------+
|  FACTOR                          | WEIGHT | VALUE RANGE | HOW IT IS DETERMINED                |
+----------------------------------+--------+-------------+-------------------------------------+
|  1. Technical Readiness (T)      |  40%   |   0 - 100   | Match % against 6-axis competencies |
|  2. Resume Strength (R)          |  25%   |   0 - 100   | ATS parser composite score          |
|  3. Project Strength (P)         |  15%   |  45 - 100   | Project count + GitHub/demo links   |
|  4. Skill Alignment (S)          |  10%   |  20 - 100   | Ratio: (Skills Acquired / Required) |
|  5. Recruiter Visibility (V)     |  10%   |  30 - 100   | Profile bio, location, contact info |
+-----------------------------------------------------------------------------------------------+
```

### Visual Weight Distribution Chart:
```text
Technical Readiness [ 40% ] ========================================
Resume Strength     [ 25% ] =========================
Project Strength    [ 15% ] ===============
Skill Alignment     [ 10% ] ==========
Recruiter Visibility[ 10% ] ==========
```

---

## 🏆 4. Hiring Readiness Tiers

```text
[ Score: 100 ] -------------------------------------------------------------+
               |  🌟 TOP 5% (Score >= 88)                                   |
               |  Interview-ready for Tier-1 Tech Giants (Google, Uber)     |
[ Score:  88 ] +------------------------------------------------------------+
               |  🚀 TOP 15% (Score 75 - 87)                                |
               |  Highly competitive for funded startups and scale-ups      |
[ Score:  75 ] +------------------------------------------------------------+
               |  📈 TOP 30% (Score 60 - 74)                                |
               |  Solid foundation with 2-3 specific technical gaps to close|
[ Score:  60 ] +------------------------------------------------------------+
               |  🛠️ DEVELOPING (Score < 60)                                |
               |  Foundational phase requiring active roadmap execution     |
[ Score:   0 ] +------------------------------------------------------------+
```

---

## 🗺️ 5. How Milestones Are Generated & Suggested

```text
+----------------------------------------------------------------------------------------------------+
|                                    MILESTONE GENERATION PIPELINE                                   |
+----------------------------------------------------------------------------------------------------+

1. EVALUATE EACH SKILL FROM TAXONOMY:
   Target: Full-Stack Engineer -> Skill: "Docker & Containerization"
   - Candidate has Docker? NO
   - Importance: High
   ==> GENERATES: Milestone 1: "Learn & Apply Docker & Containerization"
                  Priority: HIGH | Estimated: 2 Weeks | Source: skill-gap
                  Action: "Containerize frontend and backend services with multi-stage Dockerfiles."

2. EVALUATE RESUME ATS HEALTH:
   - Candidate ATS Score = 72 (< 85 threshold)
   ==> GENERATES: Milestone 2: "Optimize Resume & Achieve 90+ ATS Score"
                  Priority: MEDIUM | Estimated: 1 Week | Source: resume
                  Action: "Incorporate newly learned technical skills and measurable metrics."

3. TARGET MARKET ACTIVATION:
   - Target goal completion milestone
   ==> GENERATES: Milestone 3: "Apply to Curated Tier-1 Matching Roles"
                  Priority: LOW | Estimated: 1 Week | Source: profile
                  Action: "Submit applications to jobs with >85% compatibility match."

4. TOTAL TIMELINE COMPUTATION:
   Total Weeks = 2 (Docker) + 1 (Resume) + 1 (Apply) = 4 Weeks
```

---

## 🎨 6. UI Layout & Component Wireframe

Inside `client/app/dashboard/career-gps/page.tsx`:

```text
+----------------------------------------------------------------------------------------------------+
|  CAREER GPS DASHBOARD                                        Target Role: [ Full-Stack Engineer v ]|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +---------------------------------------------------+-----------------------------------------+   |
|  | [CURRENT FOCUS MILESTONE]                         | [SALARY PROGRESSION]                    |   |
|  | Title: Learn & Apply Docker & Containerization    |                                         |   |
|  | Progress: [========                  ] 40%        | Entry Baseline:   ₹4 - ₹6 LPA           |   |
|  | Priority: HIGH FOCUS (2 Weeks Estimated)          | Next Target:      ₹8 - ₹12 LPA          |   |
|  | Next Step: Build multi-stage Dockerfile           | Market Standard:  ₹14 - ₹22 LPA         |   |
|  +---------------------------------------------------+-----------------------------------------+   |
|                                                                                                    |
|  +---------------------------------------------------------------------------------------------+   |
|  | 7-STAGE INTERACTIVE ROADMAP TIMELINE                                                        |   |
|  |                                                                                             |   |
|  |  [1] Learn Docker & Containerization   [ In Progress - 40% ]  [ High Focus ] [ Explore -> ] |   |
|  |      Containerize frontend and backend with multi-stage Dockerfile                          |   |
|  |                                                                                             |   |
|  |  [2] Master AWS & Cloud Infrastructure [ Pending           ]  [ High Focus ] [ Explore -> ] |   |
|  |      Deploy scalable services to AWS EC2, S3, or Lambda                                     |   |
|  |                                                                                             |   |
|  |  [3] Optimize Resume & Reach 90+ ATS   [ Pending           ]  [ Medium     ] [ Explore -> ] |   |
|  |      Incorporate quantified impact verbs and keywords into resume                           |   |
|  |                                                                                             |   |
|  |  [4] Apply to Curated Tier-1 Roles     [ Pending           ]  [ Final Step ] [ Explore -> ] |   |
|  |      Submit applications to positions with >85% compatibility match                         |   |
|  +---------------------------------------------------------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
```

---

## 🔗 7. Key Code Reference Table

| Component / Layer | Source File | Core Logic |
| :--- | :--- | :--- |
| **Employability Math Engine** | [`server/src/modules/career-plan/employability.engine.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/career-plan/employability.engine.ts) | Computes 5-factor score, readiness tier, and synthesizes milestones. |
| **Skill Gap Engine** | [`server/src/modules/career-plan/skill-gap.engine.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/career-plan/skill-gap.engine.ts) | Role taxonomy matrix and gap identification. |
| **Career Plan Service** | [`server/src/modules/career-plan/employability.service.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/career-plan/employability.service.ts) | Orchestrates DB queries (Resume, Profile) and calls engines. |
| **API Route Controller** | [`server/src/modules/career-plan/employability.controller.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/career-plan/employability.controller.ts) | Serves `GET /api/career-plan/gps` endpoint. |
| **Frontend GPS Page** | [`client/app/dashboard/career-gps/page.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/career-gps/page.tsx) | Page state, role switcher dropdown, and API integration. |
| **Timeline Component** | [`client/components/dashboard/career-gps/RoadmapTimeline.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/dashboard/career-gps/RoadmapTimeline.tsx) | Stage rendering, status badges (`Completed`, `In Progress`, `Pending`). |
