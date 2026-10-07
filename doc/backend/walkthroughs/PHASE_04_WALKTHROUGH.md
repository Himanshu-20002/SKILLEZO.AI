# Phase 4 Implementation Walkthrough — Core Mongoose Models (User, Role, Company)

## Overview
Phase 4 established the foundational Mongoose persistence layer for the SKILLEZO backend. It created the three core root models (`User`, `Role`, and `Company`) strict to the database schema defined in `DATABASE_SCHEMA.md`.

---

## Key Achievements

### 1. Created Core Mongoose Models
- **`User` Model** ([User.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/User.model.ts))
  - Manages authentication and account-level metadata (`email`, `passwordHash`, `role`, `emailVerified`, `accountStatus`, `lastLoginAt`).
  - Configured `passwordHash` with `select: false` to ensure credentials never leak in standard queries.
  - Normalizes `email` with `trim` and `lowercase`.
  - Reuses centralized enums: `UserRole` (`candidate`, `recruiter`, `admin`) and `AccountStatus` (`active`, `suspended`, `deactivated`).
  - Set required indexes: `{ email: 1 }` (unique), `{ role: 1 }`, `{ accountStatus: 1 }`.

- **`Role` Model** ([Role.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/Role.model.ts))
  - Defines standardized career roles (`name`, `slug`, `description`, `status`).
  - Normalizes `slug` (`trim`, `lowercase`).
  - Reuses centralized enum: `RoleStatus` (`active`, `inactive`).
  - Set required indexes: `{ name: 1 }`, `{ slug: 1 }` (unique), `{ status: 1 }`.

- **`Company` Model** ([Company.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/Company.model.ts))
  - Represents employer organizations (`name`, `slug`, `description`, `industry`, `website`, `logoUrl`, `location`, `companySize`, `verificationStatus`, `createdBy`).
  - Implements embedded `location` subdocument (`city`, `state`, `country`) with `_id: false`.
  - Links to `User` model via `createdBy` (`Schema.Types.ObjectId`).
  - Reuses centralized enums: `CompanySize` and `CompanyVerificationStatus`.
  - Set required indexes: `{ slug: 1 }` (unique), `{ name: 1 }`, `{ industry: 1 }`, `{ verificationStatus: 1 }`, `{ "location.city": 1 }`.

- **Barrel Export** ([index.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/models/index.ts))
  - Exported `UserModel`, `RoleModel`, and `CompanyModel` for consistent imports across future modules.

---

## Data Model & Index Summary Table

| Model | Collection | Primary Unique Indexes | Other Field Indexes | Centralized Enums Used |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `users` | `{ email: 1 }` | `{ role: 1 }`, `{ accountStatus: 1 }` | `UserRole`, `AccountStatus` |
| **Role** | `roles` | `{ slug: 1 }` | `{ name: 1 }`, `{ status: 1 }` | `RoleStatus` |
| **Company** | `companies` | `{ slug: 1 }` | `{ name: 1 }`, `{ industry: 1 }`, `{ verificationStatus: 1 }`, `{ "location.city": 1 }` | `CompanySize`, `CompanyVerificationStatus` |

---

## Verification Results

### 1. Schema & Validation Tests
- **Normalization**: `email` and `slug` values automatically transformed to lowercase and trimmed.
- **Defaults**: Default values assigned correctly (`role: candidate`, `emailVerified: false`, `accountStatus: active`, `lastLoginAt: null`).
- **Enum Rejection**: Invalid enum values for `role`, `status`, and `companySize` were properly rejected by Mongoose validation.
- **Subdocuments**: `location` embedded without internal `_id`.

### 2. Automated Type Check & Build
- `npm run type-check`: Passed with **0 errors**.
- `npm run build`: Successfully compiled TypeScript output to `./dist/`.

---

## Architectural Compliance Audit
- **Dependencies**: No business logic, hooks, controllers, services, repositories, or HTTP routes were added.
- **Enums**: Derived 100% from centralized definitions in `src/constants/enums.ts`.
- **Schema Drift**: Zero drift against `DATABASE_SCHEMA.md`.
