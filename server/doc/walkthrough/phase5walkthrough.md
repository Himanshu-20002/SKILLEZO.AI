# Phase 5 Implementation Walkthrough — Dependent Mongoose Models (Profile, Competency, CompanyMember)

## Overview
Phase 5 continues the Mongoose persistence layer implementation by creating the three dependent models (`Profile`, `Competency`, and `CompanyMember`) as specified in `DATABASE_SCHEMA.md`.

---

## Key Achievements

### 1. Created Dependent Mongoose Models
- **`Profile` Model** ([Profile.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/Profile.model.ts))
  - Candidate professional profile with embedded subdocuments for `skills`, `education`, `experience`, `links`, and `location`.
  - Linked to `User` via `userId` (1:1 constraint enforced via unique index) and `Role` via `targetRoleId`.
  - Reuses centralized enums: `SkillSource` and `EmploymentType`.

- **`Competency` Model** ([Competency.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/Competency.model.ts))
  - Role skill requirements model linked to `Role` via `roleId`.
  - Enforces compound uniqueness on `{ roleId: 1, skillName: 1 }`.
  - Reuses centralized enum: `CompetencyImportance`.

- **`CompanyMember` Model** ([CompanyMember.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/CompanyMember.model.ts))
  - Normalizes the N:M relationship between platform `User` and `Company`.
  - Links to `User` via `userId` & `invitedBy`, and to `Company` via `companyId`.
  - Enforces compound uniqueness on `{ userId: 1, companyId: 1 }`.
  - Reuses centralized enums: `CompanyMemberRole` and `CompanyMemberStatus`.

- **Barrel Export** ([index.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/index.ts))
  - Updated barrel file to export all 6 active models (`UserModel`, `RoleModel`, `CompanyModel`, `ProfileModel`, `CompetencyModel`, `CompanyMemberModel`).

---

## Data Model & Index Summary Table

| Model | Collection | Primary Unique Indexes | Other Field Indexes | Centralized Enums Used |
| :--- | :--- | :--- | :--- | :--- |
| **Profile** | `profiles` | `{ userId: 1 }` | `{ targetRoleId: 1 }`, `{ "skills.name": 1 }` | `SkillSource`, `EmploymentType` |
| **Competency** | `competencies` | `{ roleId: 1, skillName: 1 }` | `{ roleId: 1 }`, `{ skillName: 1 }` | `CompetencyImportance` |
| **CompanyMember** | `company_members` | `{ userId: 1, companyId: 1 }` | `{ userId: 1 }`, `{ companyId: 1 }`, `{ companyId: 1, role: 1 }` | `CompanyMemberRole`, `CompanyMemberStatus` |

---

## Verification Results

### 1. Schema & Validation Tests
- **Embedded Subdocuments**: `location`, `skills`, `education`, `experience`, `links` embedded correctly without extraneous `_id` fields.
- **Relationships & ObjectIds**: References (`userId`, `targetRoleId`, `roleId`, `companyId`, `invitedBy`) correctly accept ObjectIds.
- **Enum Rejection**: Invalid values for `SkillSource`, `EmploymentType`, `CompetencyImportance`, `CompanyMemberRole`, and `CompanyMemberStatus` are properly rejected by Mongoose validation.

### 2. Automated Type Check & Build
- `npm run type-check`: Passed with **0 errors**.
- `npm run build`: Successfully compiled TypeScript output to `./dist/`.

---

## Architectural Compliance Audit
- **Strict Layering**: Contains persistence definitions only.
- **Zero Business Logic**: No calculation hooks, controllers, services, repositories, or HTTP routes were added.
- **Centralized Enums**: 100% derived from `src/constants/enums.ts`.
- **Zero Schema Drift**: Aligned line-by-line with `DATABASE_SCHEMA.md`.
