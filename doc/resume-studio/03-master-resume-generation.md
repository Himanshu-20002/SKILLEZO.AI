# Phase 3: Master Resume Generation & Resume Studio UI Integration

## 1. Executive Summary & Architectural Tenet

In SKILLEZO AI Phase 3, the **Master Resume** is established as the canonical presentation artifact derived directly and deterministically from the candidate's **Career Profile** (`ProfileModel`).

```
┌─────────────────────────────────────────────────────────────┐
│                 ProfileModel (Canonical Truth)              │
│       headline, bio, contact, skills, experience, edu       │
│                  profileVersion: N                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
               MasterResumeBuilder.buildFromProfile()
               • Deterministic 1-to-1 fact mapping
               • Zero fact fabrication
               • Zero skill category/proficiency inference
               • Phase 1 evidence ID preservation
               • Presentation customization preservation
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             ResumeModel (variantType: "MASTER")             │
│   • Presentation AST: ResumeDocument                        │
│   • Presentation Config: templateConfig, builderConfig      │
│   • Database Invariant: unique partial index on MASTER      │
│   • Staleness Check: sourceProfileVersion < profileVersion  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Resume Studio UI Integration                │
│   • Primary Load: getMasterResume() on mount                │
│   • Header Status: ⭐ Master Resume • Synced                │
│   • Staleness Alert: "Career Profile Updated" Banner        │
│   • Action: [Sync Profile] button with instant re-render    │
└─────────────────────────────────────────────────────────────┘
```

### Core Invariants & Boundaries:
1. **Single Canonical Source of Truth**: `ProfileModel` remains the sole persistent store for career facts.
2. **Master Resume Presentation Identity**: `ResumeModel.variantType === "MASTER"` is the authoritative identifier. Exactly one Master Resume exists per user.
3. **Database-Level Uniqueness**: Enforced via MongoDB unique partial index on `{ userId: 1, variantType: 1 }` with `partialFilterExpression: { variantType: "MASTER" }`.
4. **Concurrency Safety**: If simultaneous requests attempt to create a Master Resume, duplicate key collisions (`E11000`) are handled gracefully to return the winner.
5. **Deterministic Mapping (No Inference)**: Does NOT infer skill categories or proficiency levels during Master Resume generation. If absent in `ProfileModel`, they remain absent/default according to schema.
6. **Strict Presentation Preservation**: Synchronizing Master Resume updates career facts while strictly preserving presentation configs (`templateConfig`, typography, margins, colors, and `builderConfig`).

---

## 2. Database Schema & Indexing

### Resume Schema Updates (`server/src/database/models/Resume.model.ts`):
- Added `sourceProfileVersion?: number | null;`: Tracks the Career Profile version at the time of Master Resume generation/synchronization.
- Made file-storage fields optional (`storageKey`, `mimeType`, `fileSize`, `originalFileName`) so profile-generated resumes do not require dummy disk files.
- Enforced partial unique index:
  ```ts
  resumeSchema.index(
    { userId: 1, variantType: 1 },
    {
      unique: true,
      partialFilterExpression: { variantType: "MASTER" },
    }
  );
  ```

### Repository Enhancements (`server/src/database/repositories/resume/ResumeRepository.ts`):
- `findMasterByUserId(userId: string): Promise<IResume | null>`: Queries `{ userId, variantType: "MASTER" }`.

---

## 3. Master Resume Builder

### Module: `server/src/modules/resume-intelligence/master-resume/master-resume.builder.ts`

- **Deterministic Fact Mapping**:
  - `contact`: Full name, verified email, phone, location string, and links (LinkedIn, GitHub, Portfolio).
  - `summary`: Bio, target role, and years of experience.
  - `skills`: Mapped with zero inference. If `category` or `proficiency` is absent in `ProfileModel`, it remains `undefined`. Phase 1 `evidenceIds` are preserved.
  - `experience`: Company name, job title, start/end dates, current status, bullet points, and technology tags with `evidenceIds` intact.
  - `projects`: Title, description, tech stack, repo/demo URLs, and `evidenceIds`.
  - `education`: Institution, degree, field of study, graduation dates, and `evidenceIds`.
- **Presentation Preservation**:
  - When `existingDoc` is supplied, `templateConfig` (templateId, colors, fonts, margins) and custom achievements are retained.
- **Evidence Ledger**:
  - Documents have an internal `evidence` ledger populated from profile item provenance.

---

## 4. Resume Service & REST API

### Endpoints:
- `GET /api/resumes/master`:
  - Retrieves existing Master Resume or lazily generates it from candidate profile.
  - Returns `{ resume, isStale: boolean, profileVersion: number }`.
  - Concurrency-safe: handles concurrent lazy generation via `E11000` recovery.
- `POST /api/resumes/master/sync`:
  - Re-generates Master Resume presentation AST from current `ProfileModel`.
  - Preserves user styling and `builderConfig`.
  - Sets `sourceProfileVersion = profile.profileVersion` and increments `resume.version`.
  - Returns `{ resume, isStale: false, profileVersion: number }`.

### Route Order Protection (`server/src/modules/resume/resume.routes.ts`):
- Mounted `/master` and `/master/sync` prior to parameterized `/:resumeId` routes to avoid express route parameter collisions.

---

## 5. Resume Studio UI Integration

### File: `client/app/dashboard/resume-studio/page.tsx`

1. **Initial Ingestion**:
   - `loadInitialData()` queries `resumeService.getMasterResume()` alongside `getUserResumes()`.
   - Master Resume is prioritized as the primary active canvas document upon entering Resume Studio.
2. **Master Indicator & Badge**:
   - Selector displays `⭐ [Title] (Master)`.
   - Header badge displays `⭐ Master Resume`.
3. **Staleness Detection & Notification**:
   - When `isMasterStale` is true:
     - Header sync button: `[Sync Profile]` with `RefreshCw` icon.
     - Top amber banner: *"Career Profile Updated: New profile facts are available. Sync your Master Resume to reflect the latest profile data while preserving all your formatting customizations."*
4. **Interactive Synchronization**:
   - Clicking `[Sync Master Resume]` triggers `resumeService.syncMasterResume()`.
   - Updates `resumeDoc`, refreshes `LiveResumeCanvas`, re-computes ATS score, and clears stale state with user feedback toast.

---

## 6. Verification & Test Suite

### Unit Test Suite: `server/tests/unit/modules/master-resume.spec.ts`
- **12 Comprehensive Tests**:
  1. `MasterResumeBuilder`: Deterministic fact mapping to `ResumeDocument` AST.
  2. `MasterResumeBuilder`: Zero inference of missing skill categories/proficiencies.
  3. `MasterResumeBuilder`: Phase 1 evidence ID preservation across all entities.
  4. `MasterResumeBuilder`: Presentation customization preservation from existing documents.
  5. `MasterResumeBuilder`: Zero fact fabrication (no placeholder strings).
  6. `ResumeService`: Lazy Master Resume creation with `variantType: "MASTER"` and `isDefault: true`.
  7. `ResumeService`: Reuse of existing Master Resume without duplicate creation.
  8. `ResumeService`: Staleness detection (`sourceProfileVersion < profileVersion`).
  9. `ResumeService`: Concurrency handling (catching `E11000` and returning the winner).
  10. `ResumeService`: Preserving layout/styling on profile synchronization.
  11. `ResumeService`: Synchronization idempotency.
  12. `ResumeService`: Multi-request concurrency test (5 simultaneous creation requests resolving to the identical Master Resume).

### System Regression:
- **Server**: 40 test files, 375 tests passing, 0 failures.
- **Client**: `npx tsc --noEmit` clean, 0 TypeScript errors.
- **Server**: `npm run type-check` clean, 0 TypeScript errors.
