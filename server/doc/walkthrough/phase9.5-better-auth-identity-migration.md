# Phase 9.5 — Better Auth Identity Preparation & Domain Identity Migration

## 1. Executive Summary & Rationale

SKILLEZO backend architecture has selected **Option A** for authentication and identity management:
- **Better Auth** owns authentication identity, user credentials, sessions, OAuth providers, accounts, and email verification.
- **SKILLEZO Application** owns domain entities and business rules (Profiles, Resumes, Roles, Competencies, Companies, Company Memberships, Jobs, Applications, Career Plans).

Phase 9.5 prepares the database schema, Mongoose models, validators, and repository layer for Better Auth compatibility **without** installing Better Auth packages or creating authentication routes/services/controllers.

---

## 2. Before vs. After Architecture

### Before Architecture (Phase 9)
```text
Authenticated User Identity: Application-managed Mongoose ObjectId (_id: ObjectId)
Credentials Ownership: User.model.ts (passwordHash: String)
User Reference Fields: Profile.userId, Resume.userId, Company.createdBy, etc. → MongoDB ObjectId
Populate Dependencies: ref: "User" across Mongoose schemas
```

### After Architecture (Phase 9.5 Baseline)
```text
Authenticated User Identity: Better Auth string identifier (user.id: string)
Credentials Ownership: Better Auth engine (removed passwordHash from User.model.ts)
User Reference Fields: Profile.userId, Resume.userId, Company.createdBy, CompanyMember.userId, CompanyMember.invitedBy, Job.createdBy, CareerPlan.userId, Application.userId, Application.statusHistory[].changedBy → String
Populate Dependencies: Removed ref: "User" on user fields (explicit string IDs)
Domain References: companyId, roleId, jobId, resumeId, targetRoleId, sourceResumeId → MongoDB ObjectId (Unchanged)
```

---

## 3. High-Level System Flow

```text
                    CLIENT
                      │
                      ▼
                 EXPRESS API
                      │
                      ▼
             Future Better Auth
                      │
                      ▼
              Authenticated User
                      │
                user.id: string
                      │
                      ▼
             SKILLEZO Application
                      │
             ┌────────┴────────┐
             ▼                 ▼
         Controller          Service
                               │
                               ▼
                         Repository
                               │
                               ▼
                         Mongoose Model
                               │
                               ▼
                            MongoDB
```

### Identity Structure & Relationships
```text
                Better Auth
                    │
                    │ user.id = string
                    ▼
              Authentication
                 Identity
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
     Profile      Resume       Company
        │           │            │
        │           │            └── createdBy: string
        │           │
        │           └── userId: string
        │
        └── userId: string
```

---

## 4. Authentication ID vs. Domain Entity ID Distinction

| Category | Identifier Type | Format | Ownership / Authority | Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Identity** | `string` | Managed by Better Auth | Better Auth engine | `userId`, `createdBy`, `invitedBy`, `changedBy` |
| **Domain Entity ID** | `MongoDB ObjectId` | 24-character hexadecimal | SKILLEZO Mongoose Models | `Profile._id`, `Company._id`, `Role._id`, `Job._id`, `Application._id`, `CareerPlan._id`, `Competency._id`, `Resume._id` |
| **Domain-to-Domain Reference** | `MongoDB ObjectId` | 24-character hexadecimal | SKILLEZO Mongoose Models | `CompanyMember.companyId`, `Job.companyId`, `Job.roleId`, `Application.jobId`, `Application.resumeId`, `CareerPlan.roleId`, `CareerPlan.sourceResumeId`, `Profile.targetRoleId` |

---

## 5. User Model Ownership Decision

`User.model.ts` is retained as a lightweight domain representation/projection matching the collection created by Better Auth (`users`), without competing with Better Auth for credential persistence.

- `_id`: `string` (allows Better Auth string IDs as primary keys).
- `passwordHash`: **Removed**.
- Retained fields: `email`, `role`, `emailVerified`, `accountStatus`, `lastLoginAt`, `createdAt`, `updatedAt`.
- Mongoose schema option `_id: false` set to allow explicit string primary key assignment without Mongoose auto-generating an `ObjectId`.

---

## 6. Model Refactoring Matrix

| Model File | Field | Previous Type | New Type | Mongoose Reference | Index Preserved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `User.model.ts` | `_id` | `Types.ObjectId` | `string` | N/A | Primary Key |
| `User.model.ts` | `passwordHash` | `string` | **REMOVED** | N/A | N/A |
| `Profile.model.ts` | `userId` | `Types.ObjectId` | `string` | Removed `ref: "User"` | `{ userId: 1 }` (UNIQUE) |
| `Profile.model.ts` | `targetRoleId` | `Types.ObjectId` | `Types.ObjectId` | `ref: "Role"` | `{ targetRoleId: 1 }` |
| `Resume.model.ts` | `userId` | `Types.ObjectId` | `string` | Removed `ref: "User"` | `{ userId: 1, createdAt: -1 }` |
| `Company.model.ts` | `createdBy` | `Types.ObjectId` | `string` | Removed `ref: "User"` | Unchanged |
| `CompanyMember.model.ts` | `userId` | `Types.ObjectId` | `string` | Removed `ref: "User"` | `{ userId: 1, companyId: 1 }` (UNIQUE) |
| `CompanyMember.model.ts` | `invitedBy` | `Types.ObjectId \| null` | `string \| null` | Removed `ref: "User"` | Unchanged |
| `CompanyMember.model.ts` | `companyId` | `Types.ObjectId` | `Types.ObjectId` | `ref: "Company"` | `{ companyId: 1, role: 1 }` |
| `Job.model.ts` | `createdBy` | `Types.ObjectId` | `string` | Removed `ref: "User"` | `{ createdBy: 1 }` |
| `Job.model.ts` | `companyId` | `Types.ObjectId` | `Types.ObjectId` | `ref: "Company"` | `{ companyId: 1, status: 1 }` |
| `Job.model.ts` | `roleId` | `Types.ObjectId` | `Types.ObjectId` | `ref: "Role"` | `{ roleId: 1, status: 1 }` |
| `CareerPlan.model.ts` | `userId` | `Types.ObjectId` | `string` | Removed `ref: "User"` | `{ userId: 1, roleId: 1, createdAt: -1 }`, `{ userId: 1, status: 1 }` |
| `CareerPlan.model.ts` | `roleId` | `Types.ObjectId` | `Types.ObjectId` | `ref: "Role"` | Unchanged |
| `CareerPlan.model.ts` | `sourceResumeId` | `Types.ObjectId \| null` | `Types.ObjectId \| null` | `ref: "Resume"` | Unchanged |
| `Application.model.ts` | `userId` | `Types.ObjectId` | `string` | Removed `ref: "User"` | `{ userId: 1, jobId: 1 }` (UNIQUE), `{ userId: 1, status: 1 }` |
| `Application.model.ts` | `statusHistory[].changedBy` | `Types.ObjectId \| null` | `string \| null` | Removed `ref: "User"` | Unchanged |
| `Application.model.ts` | `jobId` | `Types.ObjectId` | `Types.ObjectId` | `ref: "Job"` | `{ jobId: 1, status: 1 }` |
| `Application.model.ts` | `resumeId` | `Types.ObjectId \| null` | `Types.ObjectId \| null` | `ref: "Resume"` | Unchanged |

---

## 7. Core Validation Updates

In `server/src/core/validators/common.validators.ts`:
- **`objectIdSchema`**: Retained for domain entity ObjectId validations.
- **`userIdSchema`**: Added for validating authenticated user IDs as string without constraining to 24-character hex format:
  ```ts
  export const userIdSchema = z.string().trim().min(1, "User ID is required");
  ```

---

## 8. Repository Layer Changes

- **`UserRepository.ts`**:
  - Signatures updated from `string | Types.ObjectId` to `string`.
  - Removed `updatePassword()` method.
  - Removed `passwordHash` select projection from `findByEmail()`.
- **`ProfileRepository.ts`**:
  - Method parameters (`findByUserId`, `updateSkills`, `updateEducation`, `updateExperience`, `updateTargetRole`, `updateLinks`) updated to `userId: string`.
  - Domain role parameter `findProfilesByRole(targetRoleId: string | Types.ObjectId)` retained.
- **`CompanyRepository.ts`**:
  - `findCreatedBy(userId: string)` signature updated.

---

## 9. Risk Assessment & Mitigations

| Identified Risk | Impact | Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Accidental Global ObjectId Conversion** | Breaking domain relationships | Strict audit performed; domain references (`roleId`, `companyId`, `jobId`, `resumeId`) remain `Types.ObjectId`. | Verified |
| **Attempted Mongoose Populate on User IDs** | Runtime errors / null returns | Removed `ref: "User"` on string fields. User references are treated as explicit string IDs. | Verified |
| **Schema Index Drops** | Performance degradation / constraint failure | All compound and unique indexes on `userId`, `createdBy`, and `jobId` were explicitly preserved in Mongoose schema declarations. | Verified |
| **Password Logic Creep** | Architectural violation | `passwordHash` and password modification methods fully removed from SKILLEZO domain repository and model. | Verified |

---

## 10. Verification Results

- **TypeScript Type Check (`npx tsc --noEmit`)**: Passed cleanly with **0 errors**.
- **Build (`npm run build`)**: Passed cleanly (`tsc && tsc-alias`).
- **User Reference Audit**: All 9 user-referencing fields (`Profile.userId`, `Resume.userId`, `Company.createdBy`, `CompanyMember.userId`, `CompanyMember.invitedBy`, `Job.createdBy`, `CareerPlan.userId`, `Application.userId`, `Application.statusHistory[].changedBy`) confirmed as `string`.
- **Domain ObjectId Audit**: All domain entity references (`companyId`, `roleId`, `jobId`, `resumeId`, `targetRoleId`, `sourceResumeId`) confirmed as `Types.ObjectId`.
- **Authentication Isolation Audit**: 
  - ❌ Better Auth package **NOT** installed yet.
  - ❌ **No** authentication routes created.
  - ❌ **No** authentication controllers or services created.
  - ❌ **No** auth middleware created.

---

## 11. Final Checklist Confirmation

- [x] Better Auth identity contract documented
- [x] User authentication responsibility separated
- [x] User references migrated to String
- [x] Domain ObjectIds preserved
- [x] User ID validation separated from ObjectId validation
- [x] Repository User ID types updated
- [x] PasswordHash ownership removed
- [x] No duplicate User identity introduced
- [x] No Mongoose Better Auth `populate()` dependency introduced
- [x] Existing business indexes preserved
- [x] `DATABASE_SCHEMA.md` updated
- [x] Phase 9.5 documentation created
- [x] TypeScript passes
- [x] Build passes
- [x] Health endpoints remain functional

---

**STATUS**: Ready for **PHASE 10 — Better Auth Installation & Configuration**
