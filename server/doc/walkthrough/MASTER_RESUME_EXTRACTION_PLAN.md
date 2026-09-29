# Architecture & Implementation Plan: Resume Extraction & Single Master Resume Baseline

## 1. Executive Summary & Vision

### 1.1 The Core Requirement
- **No Redundant Upload Documents**: The initial uploaded resume file (e.g. `webuxhimanshu_resume.pdf`) is **not** preserved as a standalone duplicate file in the database or UI.
- **Direct Extraction into Master Baseline**: The backend parses the uploaded resume, extracts all structured data (contact info, professional summary, work experience, education, skills, projects, and certifications), and hydrates the candidate's canonical **Career Profile** (`ProfileModel`).
- **Single Master Resume in Studio**: The system synthesizes the **one and only Master Resume** (`title: "Master Resume"`, `variantType: "MASTER"`), loaded into Resume Studio ready to view, edit, reorder, style, and improve.
- **Unified Baseline for Downstream AI**: This single Master Resume serves as the immutable candidate baseline for **Skill Gap Analysis**, **Employability Index**, and **Career GPS**.
- **Role-Tailored Variants Only for Jobs**: Subsequent resumes created or tailored to specific jobs are generated as **Tailored Variants** (`variantType: "TAILORED"`), leaving the Master Baseline intact.

---

## 2. Ingestion & Architecture Flow

```
   [Candidate Uploads Initial Resume] (e.g. webuxhimanshu_resume.pdf)
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 1. Text & Section Extraction (Parser Service)         │
│    - Extracts: Personal Info, Summary, Skills,        │
│      Experience, Projects, Education, Certifications   │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 2. Hydrate Canonical Career Profile (ProfileModel)     │
│    - profileService.hydrateFromParsedResume(...)       │
│    - Single source of truth for candidate career facts │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 3. Synthesize Single Canonical Master Resume           │
│    - title: "Master Resume"                            │
│    - variantType: "MASTER" (Strictly 1 in Database)    │
│    - isDefault: true                                   │
│    - AST built deterministically via MasterResumeBuilder│
│    - Transient upload cleaned up (no duplicate document)│
└──────────────────────┬─────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│ Resume Studio Workspace   │   │ Downstream Intelligence       │
│ ├─ Visual AST Preview     │   │ ├─ Skill Gap Analysis         │
│ ├─ Section-by-Section Edit│   │ ├─ Employability Index        │
│ ├─ AI Suggest & Improve   │   │ └─ Career GPS Roadmap         │
│ └─ Edits Sync to Profile  │   │ (Permanently locked to Master)│
└───────────────────────────┘   └───────────────────────────────┘
```

---

## 3. The 4 Core Implementation Tasks

### Task 1: Initial Upload to Master Resume Synthesis
In `server/src/modules/resume/resume.service.ts`:
- Modify `uploadResume`:
  1. Check if candidate already has a Master Resume (`await this.resumeRepository.findMasterByUserId(userId)`).
  2. If **no Master Resume exists**:
     - Parse the uploaded file buffer to extract raw text and structured data (`IResumeExtractedData`).
     - Hydrate `ProfileModel` via `this.profileService.hydrateFromParsedResume(...)`.
     - Build the canonical `ResumeDocument` AST using `MasterResumeBuilder.buildFromProfile(...)`.
     - Create/persist the document as `title: "Master Resume"`, `variantType: "MASTER"`, `isDefault: true`, `sourceProfileVersion: profile.profileVersion`.
     - Do **not** create a separate `webuxhimanshu_resume` document. The extracted data *is* the Master Resume.
  3. If a Master Resume **already exists**:
     - If uploaded as a variant or targeting a job: create as `variantType: "TAILORED"` with `parentResumeId: master._id`.
     - If uploaded with `replaceMaster: true`: update the existing Master Resume and re-hydrate `ProfileModel` without creating a duplicate record.

### Task 2: Database Self-Healing for Existing User (`webux`)
In `server/src/modules/resume/resume.service.ts` (`getOrCreateMasterResume` and `getResumePortfolio`):
- Run an idempotent auto-healing check:
  1. Query all resumes for `userId` with `variantType: "MASTER"`.
  2. If multiple master documents exist:
     - Identify the canonical master (`title === "Master Resume"`).
     - For secondary duplicate uploads (like `webuxhimanshu_resume`):
       - If `webuxhimanshu_resume` has parsed data not yet in the profile, merge it.
       - Delete the redundant duplicate document from MongoDB (`this.resumeRepository.deleteById(dupId)`).
  3. Ensure MongoDB partial unique index is enforced:
     ```typescript
     resumeSchema.index(
       { userId: 1, variantType: 1 },
       { unique: true, partialFilterExpression: { variantType: "MASTER" } }
     );
     ```

### Task 3: Lock Downstream Intelligence to Master Resume Baseline
In downstream services, prevent job-tailored variants from corrupting global candidate benchmarks:
1. **`SkillGapService.ts`**:
   - Replace `ResumeModel.findOne({ userId }).sort({ updatedAt: -1 })` with:
     ```typescript
     const activeResume = (await ResumeModel.findOne({ userId, variantType: "MASTER" }).lean())
       || (await ResumeModel.findOne({ userId, isDefault: true }).lean());
     ```
2. **`EmployabilityService.ts`**:
   - Query `findMasterByUserId(userId)` so candidate employability index (0-100) evaluates the full master baseline, not a single targeted variant.
3. **`Career GPS` / `EmployabilityEngine`**:
   - Anchored to the master profile baseline.

### Task 4: UI Simplification in Resume Studio
1. **`ResumeVariantSwitcher.tsx`**:
   - Dropdown displays exactly **1 Master Resume** card:
     - Title: `Master Resume`
     - Subtitle: `Baseline • Career Profile`
   - All other resumes render under `TAILORED VARIANTS`.
2. **`AtsPortfolioSection.tsx`**:
   - Slot 1: Fixed Master Resume card in accent amber styling, showing score and "Open in Studio" button.
   - Slot 2..N: Role-tailored variants (`Premjeet-vivek`, etc.) in the grid with rename/delete/edit actions.
   - No ghost or duplicate cards appear.

---

## 5. Verification Plan

1. **Automated Vitest Suites**:
   - Run `npx vitest run tests/unit/modules/master-resume.spec.ts` (12 tests)
   - Run `npx vitest run tests/unit/modules/resume-portfolio.spec.ts` (9 tests)
   - Run `npx vitest run tests/unit/modules/master-resume-invariants.spec.ts` (5 tests)
   - Run `npx vitest run tests/unit/modules/resume.service.spec.ts` (6 tests)
2. **Type Safety**:
   - Run `npx tsc --noEmit` on both `server` and `client`.
3. **Browser & Database Validation**:
   - Check that for user `webux`, the switcher displays 1 Master Resume and 3 Variants.
   - Check that the portfolio displays 1 Master card and 3 Variant cards.
   - Verify that clicking "Edit" on the Master Resume loads the full extracted sections in Resume Studio.
