# SKILLEZO Backend Documentation Master Index

Welcome to the structured documentation index for the SKILLEZO backend platform.

---

## 📌 Architecture & Integration Overview

- 🚀 [API Overview & Global Architecture](./01-overview/API_OVERVIEW.md)
- 💻 [Frontend Integration & Client Guidelines](./04-integration/FRONTEND_INTEGRATION.md)
- 🔐 [Authentication Architecture (Better Auth)](./02-auth/AUTHENTICATION.md)
- 🛡️ [Authorization & RBAC Access Matrix](./02-auth/AUTHORIZATION.md)
- 🔄 [System End-to-End API Flow Diagrams](./04-integration/API_FLOWS.md)

---

## 📖 Complete API Reference Specifications

### Candidate Domain

- 👤 [Candidate Profile API](./03-api/profile/PROFILE_API.md) — Profile management, experience & skills.
- 📄 [Resume Management API](./03-api/resume/RESUME_API.md) — Upload, private file storage & download streaming (Phase 16).
- 📑 [Application Management API](./03-api/application/APPLICATIONS_API.md) — Native job applications & Jooble external redirection (Phase 17).
- 🎯 [Career Pathway API](./03-api/career-plan/CAREER_PLAN_API.md) — Competency goal tracking.

### Recruiter & Company Domain

- 🏢 [Company Organization API](./03-api/company/COMPANY_API.md) — Company profiles & verification.
- 👥 [Company Member Management API](./phase13-company-member-management.md) — Team invites & role management (Phase 13).
- 💼 [Native Job Management API](./03-api/job/JOB_API.md) — Native job posting lifecycle & candidate matching.
- 🌐 [External Job Ingestion API](./phase14-external-job-ingestion.md) — Jooble scraper & ingestion pipeline (Phase 14).
- 🔍 [Job Discovery & Search API](./phase15-job-discovery-search.md) — Search API with Mongo/Elastic search filters (Phase 15).

---

## 🗄️ Database & Technical Infrastructure

- 📊 [Database Schema Reference](./05-database/DATABASE_SCHEMA.md)
- 🏛️ [Database Connection Architecture](./05-database/DATABASE_ARCHITECTURE.md)
- ⚡ [Layer Architecture (Controller-Service-Repository)](./06-architecture/LAYER_ARCHITECTURE.md)
- 🏗️ [Backend Architecture Overview](./06-architecture/BACKEND_ARCHITECTURE.md)

---

## 📜 Development Audit & Completed Phases

| Phase | System Module | Status | Specification File |
|---|---|---|---|
| **Phase 1–9.5** | Core Foundation & Auth Migration | `COMPLETED` | [Phase 9.5 Migration](./07-phases/phase9.5-better-auth-identity-migration.md) |
| **Phase 10A-C** | Better Auth Middleware Setup | `COMPLETED` | [Phase 10C Auth Middleware](./07-phases/phase10c-auth-middleware.md) |
| **Phase 11** | Candidate Profile Module | `COMPLETED` | [Phase 11 Profile](./07-phases/phase11-profile-module.md) |
| **Phase 12** | Company Organization Module | `COMPLETED` | [Phase 12 Company](./07-phases/phase12-company-module.md) |
| **Phase 13** | Company Member & Team Hierarchy | `COMPLETED` | [Phase 13 Member Management](./phase13-company-member-management.md) |
| **Phase 14** | External Job Ingestion Pipeline | `COMPLETED` | [Phase 14 External Ingestion](./phase14-external-job-ingestion.md) |
| **Phase 15** | Job Discovery & Multi-criteria Search | `COMPLETED` | [Phase 15 Job Search](./phase15-job-discovery-search.md) |
| **Phase 16** | Secure Resume Storage & Management | `COMPLETED` | [Phase 16 Resume Management](./phase16-resume-management.md) |
| **Phase 17** | Candidate Application Workflow | `COMPLETED` | [Phase 17 Application Workflow](./application/application-management.md) |
