# Skillezo.AI — Master Documentation & Architecture Compass

Welcome to the central documentation hub of **SKILLEZO.AI**. This index provides instant, organized navigation to all frontend UI components, backend Express modules, system architecture blueprints, and sprint plans across the repository.

---

## 🏛️ Top-Level Navigation Map

```
doc/
├── README.md                      # [You Are Here] Central Documentation Index
│
├── architecture/                  # Global blueprints & integration maps
│   ├── SYSTEM_INTEGRATION_MASTER_MAP.md
│   ├── CAREER_GPS_ARCHITECTURE.md
│   ├── MASTER_RESUME_AND_TAILORED_VARIANTS_ARCHITECTURE.md
│   ├── ZERO_COST_REDIS_AND_CACHE_SCALING_PLAN.md
│   └── CAREER_PROFILE_RESUME_ARCHITECTURE.md
│
├── frontend/                      # Client UI, Next.js routes & components
│   ├── README.md                  # Frontend Architecture & Component Directory
│   ├── overview/                  # Implementation status & Student Portal specs
│   ├── resume-studio/             # 3-Zone Studio, Section Engine, Diff, Renderer
│   ├── ai-coach/                  # Floating coach widget, chat & workbench UI
│   ├── job-portal/                # External job intake, matching & tailoring
│   ├── recruiter/                 # Recruiter Kanban, review drawer & pipeline
│   └── auth/                      # Better-Auth client, onboarding & protected routes
│
├── backend/                       # Server API, Express modules & engines
│   ├── README.md                  # Backend Architecture & Module Directory
│   ├── overview/                  # Layer architecture, API conventions & changelog
│   ├── auth-security/             # Better-Auth, sessions, RBAC & security
│   ├── database/                  # Schema design, migrations & model guides
│   ├── resume-intelligence/       # Deterministic scoring, ATS & bullet parsing
│   ├── ai-orchestrator/           # Tool registry, LLM gateway & safe actions
│   ├── job-matching-tailoring/    # Benchmark matching, tailoring & diff engine
│   ├── api-modules/               # Detailed API specs for all 16 server modules
│   ├── integration/               # Client-server request/response flows
│   └── walkthroughs/              # Historical phase walkthroughs (Phases 1-19)
│
└── sprints-and-plans/             # Sprint backlogs & technical phase roadmaps
    ├── sprints/                   # Sprints 1 through 8 active and planning docs
    └── phase-plans/               # Historical phase execution plans & prompts
        ├── backend-phases/        # Server phase plans (Phases 1-18)
        ├── frontend-phases/       # Client phase plans (Phases 1-6)
        └── resume-studio/         # Resume Studio phase blueprints (Phases 0-7)
```

---

## 🔍 Fast Finder: "Where is the documentation for...?"

### 1. Frontend Components & UI Features

| Feature / UI Section | Description | Documentation |
| :--- | :--- | :--- |
| **Resume Studio (Overview)** | 3-Zone workspace, state hooks, reactive grid | [`frontend/resume-studio/00_STUDIO_ARCHITECTURE.md`](./frontend/resume-studio/00_STUDIO_ARCHITECTURE.md) |
| **Resume Canvas & Sections** | In-place editing, bullet normalizer, section reordering | [`frontend/resume-studio/03_SECTION_ENGINE_COMPONENTS.md`](./frontend/resume-studio/03_SECTION_ENGINE_COMPONENTS.md) |
| **Resume Diff & Comparison** | Side-by-side & unified diff viewer between variants | [`frontend/resume-studio/14_RESUME_COMPARISON_DIALOG.md`](./frontend/resume-studio/14_RESUME_COMPARISON_DIALOG.md) |
| **Tailoring Insights Modal** | ATS keyword breakdown, added skills & tailored metrics | [`frontend/resume-studio/13_TAILORING_INSIGHTS_MODAL.md`](./frontend/resume-studio/13_TAILORING_INSIGHTS_MODAL.md) |
| **Resume Visual Renderer** | Pixel-accurate paper renderer & print styling | [`frontend/resume-studio/09_VISUAL_RENDERER_AND_PREVIEW.md`](./frontend/resume-studio/09_VISUAL_RENDERER_AND_PREVIEW.md) |
| **AI Coach Widget** | Global floating AI assistant, quick action chips | [`frontend/ai-coach/COACH_UI_WORKBENCH.md`](./frontend/ai-coach/COACH_UI_WORKBENCH.md) |
| **Candidate Dashboard** | Employability index gauge, stats, quick actions | [`frontend/overview/STUDENT_PORTAL_CORE.md`](./frontend/overview/STUDENT_PORTAL_CORE.md) |
| **Recruiter Portal & Kanban** | Candidate talent pipeline, review drawer, job builder | [`frontend/recruiter/RECRUITER_APPLICATION_MANAGEMENT.md`](./frontend/recruiter/RECRUITER_APPLICATION_MANAGEMENT.md) |
| **Recruiter Portal Action Plan** | Critical hydration fixes, dynamic credentials & pipeline tasks | [`frontend/recruiter/RECRUITER_PORTAL_ACTION_PLAN.md`](./frontend/recruiter/RECRUITER_PORTAL_ACTION_PLAN.md) |
| **External Job Discovery** | Job search, filtering, and tailoring intake dialog | [`frontend/job-portal/JOB_PORTAL_UI.md`](./job-portal/JOB_PORTAL_UI.md) |

---

### 2. Backend Modules & AI Engines

| Backend Subsystem | Description | Documentation |
| :--- | :--- | :--- |
| **AI Career Intelligence Spec**| Master 12-layer AI Career Intelligence architecture & prompt | [`backend/ai-orchestrator/AI_CAREER_INTELLIGENCE_SPEC.md`](./backend/ai-orchestrator/AI_CAREER_INTELLIGENCE_SPEC.md) |
| **Deterministic Scoring** | 5-pillar mathematical ATS & resume scoring formula | [`backend/resume-intelligence/DETERMINISTIC_SCORING_ENGINE.md`](./backend/resume-intelligence/DETERMINISTIC_SCORING_ENGINE.md) |
| **Resume Ingestion & AST** | PDF text extraction, section segmentation, normalization | [`backend/resume-intelligence/RESUME_INGESTION_ENGINE.md`](./backend/resume-intelligence/RESUME_INGESTION_ENGINE.md) |
| **AI Tool Registry** | Strictly typed tool registry for LLM agents | [`backend/ai-orchestrator/CONTROLLED_TOOL_REGISTRY.md`](./backend/ai-orchestrator/CONTROLLED_TOOL_REGISTRY.md) |
| **Career Coach API** | Contextual prompt chaining, conversation state | [`backend/ai-orchestrator/CAREER_COACH_API.md`](./backend/ai-orchestrator/CAREER_COACH_API.md) |
| **Job Tailoring Engine** | Tailored variant generation & diff engine | [`backend/job-matching-tailoring/RESUME_JOB_MATCHING_INTELLIGENCE.md`](./backend/job-matching-tailoring/RESUME_JOB_MATCHING_INTELLIGENCE.md) |
| **Authentication & RBAC** | Better-Auth identity provider, sessions, cookie policy | [`backend/auth-security/AUTHENTICATION_ARCHITECTURE.md`](./backend/auth-security/AUTHENTICATION_ARCHITECTURE.md) |
| **Database Schema** | PostgreSQL schema, Prisma models, relations, indices | [`backend/database/DATABASE_SCHEMA.md`](./database/DATABASE_SCHEMA.md) |
| **REST API Reference** | Full endpoint docs (Applications, Jobs, Company, Profile) | [`backend/api-modules/`](./backend/api-modules/) |

---

### 3. Global Architecture & Infrastructure

| Blueprint / Strategy | Description | Documentation |
| :--- | :--- | :--- |
| **Master Integration Map** | Full end-to-end client-server architecture map | [`architecture/SYSTEM_INTEGRATION_MASTER_MAP.md`](./architecture/SYSTEM_INTEGRATION_MASTER_MAP.md) |
| **Career GPS Architecture** | Longitudinal skill mapping & milestone progression | [`architecture/CAREER_GPS_ARCHITECTURE.md`](./architecture/CAREER_GPS_ARCHITECTURE.md) |
| **Variants Architecture** | Master profile inheritance model for tailored resumes | [`architecture/MASTER_RESUME_AND_TAILORED_VARIANTS_ARCHITECTURE.md`](./architecture/MASTER_RESUME_AND_TAILORED_VARIANTS_ARCHITECTURE.md) |
| **Redis & Cache Scaling** | Zero-cost cache strategy & cache-invalidation rules | [`architecture/ZERO_COST_REDIS_AND_CACHE_SCALING_PLAN.md`](./architecture/ZERO_COST_REDIS_AND_CACHE_SCALING_PLAN.md) |

---

### 4. Sprints & Phase Roadmaps

Technical sprint specifications and engineering phase roadmaps are located under [`sprints-and-plans/`](./sprints-and-plans/):
- **Sprint Specifications (Sprints 1 through 8):** [`sprints-and-plans/sprints/`](./sprints-and-plans/sprints/)
- **Phase Implementation Roadmaps & Prompts:** [`sprints-and-plans/phase-plans/`](./sprints-and-plans/phase-plans/)

