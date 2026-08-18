# Phase 18 Walkthrough — Recruiter Application Management, Candidate Review & Hiring Pipeline

## Overview
Phase 18 extends SKILLEZO's candidate application workflow into the recruiter/company domain. Authorized company members can list applications submitted to their organization's jobs, view detailed submission data, stream submitted resume artifacts from private storage, and manage recruiter-controlled status state machine transitions with append-only status histories.

---

## Key Implementation Highlights

### 1. Multi-Tier Authorization Chain
* Formulated `assertRecruiterAuthorization(userId)` in [recruiter-application.service.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/recruiter-application/recruiter-application.service.ts):
  `req.user.id` ➔ `CompanyMember` (active `owner` / `admin` / `recruiter`) ➔ `Company` ➔ `Job.companyId` ➔ `Application.jobId`.
* Guarantees recruiters cannot view or modify applications submitted to jobs owned by other companies.

### 2. Recruiter Application Repository Extensions
* Extended [ApplicationRepository.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/database/repositories/application/ApplicationRepository.ts):
  - `findCompanyApplications(companyJobIds, options)`: Returns paginated applications filtered by company jobs and optional status.
  - `findCompanyApplicationById(applicationId, companyJobIds)`: Scopes application retrieval strictly to company job IDs.

### 3. Recruiter Resume Download Streaming
* Implemented `streamApplicationResume` in [recruiter-application.service.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/recruiter-application/recruiter-application.service.ts) and [recruiter-application.controller.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/recruiter-application/recruiter-application.controller.ts):
  - Resolves `resumeSnapshot.storageKey`.
  - Streams private attachment directly using `IResumeStorageService` without exposing internal filesystem paths or raw storage keys.

### 4. Recruiter Status State Machine & Timeline
* Enforced status transition state machine rules in [recruiter-application.service.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/recruiter-application/recruiter-application.service.ts):
  - `applied` ➔ `under_review`, `shortlisted`, `rejected`
  - `under_review` ➔ `shortlisted`, `rejected`
  - `shortlisted` ➔ `interview`, `rejected`
  - `interview` ➔ `offered`, `rejected`
  - `offered` ➔ `hired`, `rejected`
* Candidate-controlled terminal status `withdrawn` cannot be overwritten or modified by recruiters.
* All valid transitions append an entry to `statusHistory` storing timestamp and recruiter `changedBy` identity.

---

## Endpoints Implemented

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/recruiter/applications` | Required | List company job applications (paginated) |
| `GET` | `/api/recruiter/applications/:applicationId` | Required | View application details & `resumeSnapshot` |
| `GET` | `/api/recruiter/applications/:applicationId/status-history` | Required | View application timeline history |
| `GET` | `/api/recruiter/applications/:applicationId/resume` | Required | Securely stream submitted resume file |
| `PATCH` | `/api/recruiter/applications/:applicationId/status` | Required | Update recruiter pipeline status |

---

## Verification Results

### Build Check
* Executed `npm run build`: Compiled cleanly with `tsc && tsc-alias` with **0 TypeScript errors**.

### Service Logic Verification
* Ran mock test suite validating:
  - Recruiter authorization assertion and company scope.
  - Snapshot details retrieval and file streaming.
  - Recruiter status transition handling (`APPLIED` ➔ `UNDER_REVIEW`).
