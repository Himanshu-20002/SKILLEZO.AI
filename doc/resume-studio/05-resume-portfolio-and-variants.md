# Phase 5: Resume Portfolio, Gallery & Variant Management

## 1. Executive Summary & Architecture Overview

Phase 5 introduces the **Resume Portfolio & Variant Management** subsystem in SKILLEZO AI. It establishes a dedicated portfolio view (`/dashboard/resumes`) showcasing the candidate's canonical **Master Resume** alongside tailored, role-specific **Variants**. 

Variants are fully independent presentation and content documents derived from the Master Resume, tailored to specific roles and target companies, without introducing risky database mutations to the single source of truth (`ProfileModel` and Master Resume).

```
                                  ┌────────────────────────┐
                                  │      ProfileModel      │
                                  │ (Single Source of Truth)│
                                  └───────────┬────────────┘
                                              │ canonical career facts
                                              ▼
                                  ┌────────────────────────┐
                                  │      Master Resume     │
                                  │(variantType: "MASTER") │
                                  │   (Unique Per User)    │
                                  │  [Protected from Del]  │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │ Typed Deep Clone (Non-destructive AST Copy)   │
                      ▼                                               ▼
          ┌────────────────────────┐                      ┌────────────────────────┐
          │     Variant: FinTech   │                      │   Variant: AI / ML     │
          │(variantType: "TAILORED")│                     │(variantType: "TAILORED")│
          │  parentResumeId: master │                     │  parentResumeId: master │
          │ targetCompany: "Stripe" │                     │ targetCompany: "OpenAI"│
          │ targetJobTitle: "Lead" │                     │ targetJobTitle: "Staff"│
          └────────────────────────┘                      └────────────────────────┘
```

---

## 2. Core Architectural Principles & Invariants

### 2.1 The Master Resume: Grounded Canonical Anchor
- **Uniqueness**: Exactly one Master Resume exists per user, guaranteed by the MongoDB partial unique index `{ userId: 1, variantType: 1 }` where `variantType: "MASTER"`.
- **Undeletable Anchor**: Master Resume cannot be deleted via the UI or API (`DELETE /api/resumes/:resumeId` rejects Master deletion with `HTTP 400`).
- **Staleness Tracking**: Tracks `sourceProfileVersion` against `profile.profileVersion`. If career facts are updated, `isMasterStale` signals synchronization without mutating derived variants.

### 2.2 Role Variants: Independent Presentation Artifacts
- **Typed Deep Cloning**: Variants are spawned by cloning the Master Resume's canonical `ResumeDocument` AST and `builderConfig` via a deterministic cloner (`resume-document.cloner.ts`), rather than using lossy or unsafe JSON stringification.
- **Independence**: Once created, modifications to a variant's bullet selections, ordering, summaries, or template configurations do not touch the Master Resume or other variants.
- **Lightweight Portfolio API**: `GET /api/resumes/portfolio` uses a lean projection returning strictly metadata (`id`, `displayName`, `variantType`, `targetJobTitle`, `targetCompany`, `parentResumeId`, `updatedAt`, `isMasterStale`). Heavy ASTs and builder configurations are fetched only upon opening the Resume Studio.
- **Decoupled Job Domain**: In Phase 5, the client Create Variant modal accepts `displayName`, `targetJobTitle`, and `targetCompany` directly, avoiding artificial coupling to premature job board or JD entities.

---

## 3. Backend Endpoints & Domain Specifications

### 3.1 `GET /api/resumes/portfolio`
Returns lightweight portfolio metadata for the authenticated user.

- **Response Body (`ResumePortfolioResponseDTO`)**:
```json
{
  "success": true,
  "data": {
    "master": {
      "id": "65fc123...",
      "displayName": "Master Resume",
      "variantType": "MASTER",
      "targetJobTitle": "Staff Software Engineer",
      "targetCompany": "",
      "parentResumeId": null,
      "updatedAt": "2026-09-22T08:00:00.000Z",
      "createdAt": "2026-09-20T08:00:00.000Z",
      "sourceProfileVersion": 3,
      "isMasterStale": false,
      "isDefault": true
    },
    "variants": [
      {
        "id": "65fc456...",
        "displayName": "Fintech Platform Lead",
        "variantType": "TAILORED",
        "targetJobTitle": "Staff Backend Engineer",
        "targetCompany": "Stripe",
        "parentResumeId": "65fc123...",
        "updatedAt": "2026-09-22T09:30:00.000Z",
        "createdAt": "2026-09-22T09:30:00.000Z",
        "sourceProfileVersion": 3,
        "isMasterStale": false,
        "isDefault": false
      }
    ]
  }
}
```

### 3.2 `POST /api/resumes/variants`
Creates a tailored variant cloned from the candidate's Master Resume.

- **Request Body (`CreateVariantDTO`)**:
```json
{
  "displayName": "Senior Distributed Systems Engineer - Databricks",
  "targetJobTitle": "Distributed Systems Engineer",
  "targetCompany": "Databricks"
}
```
- **Execution Flow**:
  1. Resolves candidate's existing Master Resume (or creates one on demand if missing).
  2. Executes `cloneResumeDocument(master.resumeDocument, { targetJobTitle, targetCompany })`.
  3. Executes `cloneBuilderConfig(master.builderConfig)`.
  4. Saves new `ResumeModel` with `variantType: "TAILORED"` and `parentResumeId: master._id`.
  5. Master Resume and Career Profile are left completely untouched.

### 3.3 `PATCH /api/resumes/:resumeId`
Reuses existing update endpoint to rename variants. Accepts `displayName`, which maps cleanly to `title`, as well as `targetJobTitle` and `targetCompany`.

### 3.4 `DELETE /api/resumes/:resumeId`
Deletes a variant. If the target resume is identified as `variantType === "MASTER"`, the operation is aborted and returns `HTTP 400: "Cannot delete Master Resume. Master Resume is the canonical source for all variants."`

---

## 4. Frontend Portfolio Architecture

### 4.1 Modular Component Tree (`client/components/portfolio/`)

| Component | Role & Responsibilities |
| :--- | :--- |
| `PortfolioHeader` | Page header, title, variant count badge, and "Create Variant" primary action button. |
| `MasterResumeCard` | Highlighted canonical card with gold accents, "⭐ Canonical Master" badge, staleness alert with sync button, metadata timestamps, and "Open in Studio" action. Master card has NO delete button. |
| `ResumeVariantCard` | Modern card displaying variant title, role/company target tags, last updated date, "Open in Studio" CTA, rename modal trigger, and delete confirmation trigger. |
| `CreateVariantModal` | Accessible modal form collecting variant display name, target job title, and target company. Features live character counts and validation. |
| `RenameVariantModal` | Lightweight modal for updating variant display name. |
| `DeleteVariantModal` | Destructive confirmation modal preventing accidental removal of variants. |
| `PortfolioSkeleton` | Glassmorphic skeleton loader for smooth initial load states. |
| `PortfolioEmptyState` | Helpful onboarding state if no resumes or variants exist. |

### 4.2 Portfolio Orchestration Hook (`useResumePortfolio`)
Located at `client/hooks/useResumePortfolio.ts`, this hook remains thin and declarative:
- Manages portfolio data fetching (`portfolio`, `loading`, `error`).
- Controls modal visibility (`isCreateOpen`, `isRenameOpen`, `isDeleteOpen`, `activeVariant`).
- Handles action dispatching with automatic refetching (`handleCreateVariant`, `handleRenameVariant`, `handleDeleteVariant`, `handleSyncMaster`).

### 4.3 Studio Integration & Deep-Linking
When a user clicks "Open in Studio" from any portfolio card:
1. The route navigates to `/dashboard/resume-studio?resumeId=<resumeId>`.
2. `useResumeStudio(initialResumeId)` loads the specified resume directly into the Studio workspace.
3. `ResumeStudioHeader` displays a link back to the portfolio ("← Resumes") and indicates whether the active resume is Master or a Tailored Variant.
4. If a variant is loaded, variant-specific controls are enabled while preserving all Studio features (builder, ATS diagnostics, AI suggestions).

---

## 5. Test Suite Verification & Quality Assurance

### 5.1 Backend Domain Invariants (`server/tests/unit/modules/resume-portfolio.spec.ts`)
- `getResumePortfolio`: Returns Master Resume and tailored variants in separate lightweight structures.
- `createResumeVariant`: Clones Master Resume deeply into an independent variant with `parentResumeId`.
- `createResumeVariant`: Rejects creation if Master Resume cannot be resolved.
- `updateResume`: Supports renaming via `displayName` mapped to `title`.
- `deleteResume`: Protects Master Resume from deletion (`HTTP 400`).
- `deleteResume`: Allows safe deletion of tailored variants.
- `cloneResumeDocument`: Verifies full AST cloning, bullet preservation, metric retention, and independence of mutations.

**Test Results**:
- `resume-portfolio.spec.ts`: **9 / 9 passed**
- Full backend regression suite: **42 test files passed, 389 / 389 tests passed with 0 regressions**.

### 5.2 Frontend Client Contracts (`client/tests/portfolio.service.spec.ts`)
- `getResumePortfolio`: Fetches lightweight portfolio summary without heavy AST payload.
- `createResumeVariant`: Posts variant input without requiring `targetJobId`.
- `renameResume`: Reuses `PATCH /api/resumes/:resumeId` with trimmed title.
- `deleteResume`: Dispatches `DELETE /api/resumes/:resumeId`.

**Test Results**:
- Client test suite: **3 test files passed, 15 / 15 tests passed with 0 regressions**.
