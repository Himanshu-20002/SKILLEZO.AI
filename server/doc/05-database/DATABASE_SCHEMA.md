# SKILLEZO — Database Schema Specification

**Status:** Final — Backend Implementation Baseline
**Database:** MongoDB Atlas
**ODM:** Mongoose
**Architecture:** Controller → Service → Repository → Model
**Version:** 1.0

---

# 1. Purpose

This document is the database source of truth for the SKILLEZO MVP.

```text
ERD
 ↓
DATABASE_SCHEMA.md
 ↓
Mongoose Models
 ↓
Repositories
 ↓
Services
 ↓
Controllers
 ↓
API Routes
```

The ERD defines the original core entities and relationships.

This specification additionally finalizes implementation details required by MongoDB and the SKILLEZO product, including:

* candidate skills
* education
* work experience
* recruiter/company membership
* resume extraction structure
* career gap analysis structure
* enums
* indexes
* uniqueness constraints
* timestamps
* soft deletion
* ownership rules
* data validation

---

# 2. Final Collections

The MVP database contains:

```text
users
profiles
resumes
roles
competencies
career_plans
companies
company_members
jobs
applications
```

Total: 10 collections.

Candidate skills, education, and experience are embedded inside `profiles`.

---

# 3. Global MongoDB Conventions

## Authentication & Entity IDs

Authentication Provider: **Better Auth**

- **Authenticated User ID**: `String` (managed by Better Auth)
- **Domain Entity IDs**: `MongoDB ObjectId` (e.g. `_id` for Profile, Resume, Role, Competency, Company, CompanyMember, Job, Application, CareerPlan)

User Reference Fields (Better Auth User ID → `String`):
```ts
userId
createdBy
invitedBy
changedBy
```

Domain Entity Reference Fields (Domain Object → `ObjectId`):
```ts
companyId
roleId
jobId
resumeId
targetRoleId
sourceResumeId
```

---

## Timestamps

Every collection uses `{ timestamps: true }`, producing `createdAt` and `updatedAt`.

---

# 4. Collection Definitions

### Users (`users`)
Managed by Better Auth for authentication identity.
- Fields: `_id` (String), `email` (String, Unique), `role` (enum: candidate, recruiter, admin), `emailVerified` (Boolean), `accountStatus` (enum: active, suspended, deactivated).

### Profiles (`profiles`)
Candidate professional identity.
- Fields: `_id` (ObjectId), `userId` (String, Unique Index), `targetRoleId` (ObjectId | null), `bio` (String), `skills` (Array), `education` (Array), `experience` (Array), `links` (Object: github, linkedin, portfolio), `location` (Object: city, state, country).

### Companies (`companies`)
Employer organizations.
- Fields: `_id` (ObjectId), `name` (String), `slug` (String, Unique Index), `description` (String), `industry` (String), `website` (String), `logoUrl` (String), `location` (Object), `companySize` (enum), `verificationStatus` (enum: pending, verified, rejected), `createdBy` (String).

### Company Members (`company_members`)
Associates users to companies with specific roles.
- Fields: `_id` (ObjectId), `userId` (String), `companyId` (ObjectId), `role` (enum: owner, admin, recruiter, viewer), `status` (enum: active, invited, suspended, removed), `invitedBy` (String | null), `joinedAt` (Date | null).
- Compound Index: `{ userId: 1, companyId: 1 }` (Unique).
