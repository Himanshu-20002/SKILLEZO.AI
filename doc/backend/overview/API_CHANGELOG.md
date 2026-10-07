# SKILLEZO Backend — API Changelog

This document logs version changes and module releases across the SKILLEZO backend API documentation system.

---

## [Phase 12] — 2026-08-11
### Added
- **Company Module API**:
  - `POST /api/companies`: Create company & automatic `OWNER` membership assignment.
  - `GET /api/companies/me`: Retrieve active memberships for user.
  - `GET /api/companies/:companyId`: Retrieve public company profile.
  - `PATCH /api/companies/:companyId`: Update company details (`OWNER` or `ADMIN` role required).
- **Company Ownership Foundation**: `CompanyMemberRepository` integration for domain authorization.
- **API Documentation System**: Published complete frontend integration documentation.

---

## [Phase 11] — 2026-08-11
### Added
- **Candidate Profile API**:
  - `POST /api/profile`: Create initial candidate profile.
  - `GET /api/profile/me`: Retrieve current user's profile.
  - `PATCH /api/profile/me`: Partial profile update.
  - `PATCH /api/profile/me/skills`: Section update for skills.
  - `PATCH /api/profile/me/education`: Section update for education.
  - `PATCH /api/profile/me/experience`: Section update for work experience.
  - `PATCH /api/profile/me/links`: Section update for social/portfolio links.
  - `PATCH /api/profile/me/target-role`: Update target career role.

---

## [Phase 1-10] — 2026-08-10
### Added
- Core Express web application initialization.
- MongoDB / Mongoose connection pipeline (`db.ts`).
- Better Auth authentication integration (`/api/auth/*`).
- Centralized error middleware (`error.middleware.ts`), Zod validation middleware (`validate.middleware.ts`), and health endpoints (`/api/health`, `/api/health/ready`).
