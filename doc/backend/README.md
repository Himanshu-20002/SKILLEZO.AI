# Skillezo.AI — Backend Architecture & Module Documentation Directory

Welcome to the central backend documentation for **SKILLEZO.AI** (`server/`). This directory catalogs all Express.js API modules, PostgreSQL/Prisma schemas, deterministic intelligence engines, security layers, and AI orchestrators.

---

## 🧭 Module-to-Documentation Directory

Find the exact documentation for any server subsystem or API module below:

| Module / Subsystem | Source Location | Key Documentation |
| :--- | :--- | :--- |
| **Auth & Security** | `server/src/modules/auth` | [`auth-security/AUTHENTICATION_ARCHITECTURE.md`](./auth-security/AUTHENTICATION_ARCHITECTURE.md) |
| **Better-Auth Integration** | `server/src/modules/auth/better-auth` | [`auth-security/BETTER_AUTH_IDENTITY_MIGRATION.md`](./auth-security/BETTER_AUTH_IDENTITY_MIGRATION.md) |
| **Database & Schema** | `server/src/database` | [`database/DATABASE_SCHEMA.md`](./database/DATABASE_SCHEMA.md) |
| **Resume Parsing & API** | `server/src/modules/resume` | [`resume-intelligence/RESUME_API.md`](./resume-intelligence/RESUME_API.md) |
| **Resume Intelligence Engine**| `server/src/modules/resume-intelligence` | [`resume-intelligence/DETERMINISTIC_SCORING_ENGINE.md`](./resume-intelligence/DETERMINISTIC_SCORING_ENGINE.md) |
| **AI Orchestrator & Tools**| `server/src/core/ai` | [`ai-orchestrator/AI_ORCHESTRATOR_GATEWAY.md`](./ai-orchestrator/AI_ORCHESTRATOR_GATEWAY.md) |
| **Controlled Tool Registry** | `server/src/core/ai/tools` | [`ai-orchestrator/CONTROLLED_TOOL_REGISTRY.md`](./ai-orchestrator/CONTROLLED_TOOL_REGISTRY.md) |
| **Job Tailoring & Diff** | `server/src/modules/job-tailoring` | [`job-matching-tailoring/TAILORED_RESUME_GENERATION.md`](./job-matching-tailoring/) |
| **Job Matching & Benchmarks**| `server/src/modules/job-match` | [`job-matching-tailoring/RESUME_JOB_MATCHING_INTELLIGENCE.md`](./job-matching-tailoring/RESUME_JOB_MATCHING_INTELLIGENCE.md) |
| **Career Plan & GPS** | `server/src/modules/career-plan` | [`api-modules/CAREER_PLAN_API.md`](./api-modules/CAREER_PLAN_API.md) |
| **Jobs & External Ingestion**| `server/src/modules/jobs`, `job-ingestion`| [`api-modules/JOB_API.md`](./api-modules/JOB_API.md) |
| **Applications Pipeline** | `server/src/modules/application` | [`api-modules/APPLICATIONS_API.md`](./api-modules/APPLICATIONS_API.md) |
| **Recruiter Applications** | `server/src/modules/recruiter-application` | [`api-modules/RECRUITER_APPLICATIONS_API.md`](./api-modules/RECRUITER_APPLICATIONS_API.md) |
| **Company & Members** | `server/src/modules/company`, `company-member`| [`api-modules/COMPANY_API.md`](./api-modules/COMPANY_API.md) |
| **User & Candidate Profile**| `server/src/modules/profile`, `users` | [`api-modules/PROFILE_API.md`](./api-modules/PROFILE_API.md) |
| **Evidence Verification** | `server/src/modules/verification` | [`resume-intelligence/EVIDENCE_SKILL_INTELLIGENCE.md`](./resume-intelligence/EVIDENCE_SKILL_INTELLIGENCE.md) |

---

## 📂 Subfolder Structure

- [`overview/`](./overview/): Backend architecture patterns, layer architecture, API conventions, and changelog.
- [`auth-security/`](./auth-security/): Better-Auth session management, role-based authorization (RBAC), and security middleware.
- [`database/`](./database/): Schema definitions, entity relationship diagrams (ERD), and Prisma model guides.
- [`resume-intelligence/`](./resume-intelligence/): Deterministic 5-pillar scoring algorithms, AST bullet normalizers, and evidence locking.
- [`ai-orchestrator/`](./ai-orchestrator/): Controlled AI tool registry, safe action execution, LLM gateway prompts, and response streaming.
- [`job-matching-tailoring/`](./job-matching-tailoring/): Benchmark matching, semantic similarity algorithms, and resume diffing.
- [`api-modules/`](./api-modules/): Dedicated endpoint specifications for every Express REST module.
- [`integration/`](./integration/): Client-to-server request/response flows, session headers, and caching mechanisms.
- [`walkthroughs/`](./walkthroughs/): In-depth historical engineering walkthroughs for core phases (Auth, Resume Intelligence, Skill Gap, Employability GPS).
