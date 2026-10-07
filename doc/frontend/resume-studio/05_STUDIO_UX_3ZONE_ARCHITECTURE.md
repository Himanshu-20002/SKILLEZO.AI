# Phase 4: Resume Studio UX & Architecture Refactor

## 1. Executive Summary & Architecture Overview

In SKILLEZO AI Phase 4, the **Resume Studio** frontend and backend domain boundaries underwent a comprehensive architectural refactor. The monolithic 1,690-line `client/app/dashboard/resume-studio/page.tsx` was decomposed into a modular, single-responsibility component tree governed by an orchestration hook (`useResumeStudio`), while preserving 100% of existing functionality, ATS scoring algorithms, AI workspaces, and presentation controls.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                Resume Studio Page Container                            │
│                       (client/app/dashboard/resume-studio/page.tsx)                    │
│                                           │                                            │
│                      Consumes: useResumeStudio() Custom Hook                           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│   ResumeStudioHeader    │    │    ResumeSyncBanner     │    │  ResumeStudioWorkspace  │
│ • Resume switcher       │    │ • Triggered when        │    │ • Responsive coordinate │
│ • ⭐ Master indicator   │    │   isMasterStale === true│    │ • Desktop: 2-col/split  │
│ • Save pill (debounced) │    │ • One-click sync        │    │ • Mobile: tab navigation│
│ • Sync button & status  │    │ • Non-destructive diff  │    │ • Floating mobile pill  │
└─────────────────────────┘    └─────────────────────────┘    └────────────┬────────────┘
                                                                           │
                  ┌────────────────────────────────────────────────────────┼────────────────────────────────────────┐
                  ▼                                                        ▼                                        ▼
┌───────────────────────────────────────────┐    ┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│             ResumeEditorPanel             │    │         ResumePreviewPanel        │    │        ResumeInsightsPanel        │
│ • Sub-mode tabs (AI Optimize vs Visual)   │    │ • Section Jump Navigator          │    │ • ATS Diagnostics View            │
│ • Section Health Cards with alerts        │    │ • Live Resume Canvas (A4 page)    │    │ • Score breakdown (Impact, Brevity│
│ • Section AI Workspace integration        │    │ • Real-time reactive updates      │    │   Style, Structure, Skills)       │
│ • Resume Builder Controls                 │    │ • Print / PDF Export viewport     │    │ • AI Recommendations list         │
└───────────────────────────────────────────┘    └───────────────────────────────────┘    └───────────────────────────────────┘
```

---

## 2. Architectural Boundaries & Data Invariants

### 2.1 The Single Source of Truth: `ProfileModel`
- **Career Facts**: Candidate contact info, headline, summary, work experiences, skills, projects, and education belong exclusively to `ProfileModel`.
- **Presentation Artifact**: `ResumeModel` (specifically `variantType: "MASTER"`) holds presentation data (`templateConfig`, typography, margins, colors, section ordering, visibility, and bullet selections).
- **Editing Migration Protocol**: Direct edits to career facts (e.g. experience dates, skills, company names) mutate `ProfileModel` and increment `profileVersion`. Presentation modifications (styling, layout, template) save to `ResumeModel.templateConfig` via debounced endpoints.

### 2.2 Domain Invariants Validated by Backend Suite
1. **Presentation Configuration Isolation**: Saving builder or template options in `ResumeModel` never mutates or corrupts `ProfileModel`.
2. **Deterministic Staleness Detection**: When `ProfileModel` is updated (increasing `profileVersion`), the Master Resume is flagged as stale (`sourceProfileVersion < profileVersion`) without destroying existing presentation styling.
3. **Synchronize Without Formatting Loss**: Triggering Master Resume synchronization updates career facts from `ProfileModel` while strictly preserving custom templates, typography, and margins.
4. **Concurrency Safety**: Handled via MongoDB unique partial index with retry recovery, ensuring exactly one Master Resume exists per user.
5. **Direct Fact Updates**: Mutating `ProfileModel` updates canonical career facts, maintaining audit provenance and evidence IDs.

---

## 3. Orchestration: `useResumeStudio` Custom Hook

Located at `client/hooks/useResumeStudio.ts`, this hook isolates all state management, network side-effects, debounced saves, and derived calculations:

### 3.1 State Slices Managed
| State Category | Slices Managed | Notes |
| :--- | :--- | :--- |
| **Server State** | `resumes`, `activeResume`, `profile`, `atsResult`, `isMasterStale` | Hydrated on mount from Master Resume endpoint |
| **UI State** | `activeViewMode`, `activeSubMode`, `selectedSection`, `isUploading`, `isSyncing` | Controls responsive layout and workspace panels |
| **Save State** | `saveState: 'saved' \| 'saving' \| 'unsaved' \| 'error'`, `lastSavedAt` | Debounced auto-save with visual feedback indicator |
| **Modal State** | `showTailorModal`, `showFullReviewModal`, `selectedRecommendation` | Seamless integration with existing modal flows |

### 3.2 Debounced Auto-Save
- When the user modifies template configurations (colors, fonts, margins, templates), `saveState` transitions to `'unsaved'`.
- A 1,000ms debounce timer triggers `PUT /api/resumes/:id/builder-config`.
- Upon successful response, `saveState` transitions to `'saved'` and timestamps `lastSavedAt`.

---

## 4. Modular Component Architecture

All components reside in `client/components/resume-studio/`:

1. **`ResumeStudioHeader.tsx`**:
   - Resume selection dropdown with Master badge (`⭐ Master Resume`).
   - Live Save status pill (`Saved`, `Saving...`, `Unsaved changes`, `Save error`).
   - Out-of-sync alert pill with direct `[Sync Now]` CTA.
   - Action buttons: Upload new resume, Download PDF, and Delete.

2. **`ResumeSyncBanner.tsx`**:
   - Amber alert banner rendered at the top of the workspace when `isMasterStale === true`.
   - Explains that canonical profile facts were updated and offers a one-click sync action.

3. **`ResumeStudioWorkspace.tsx`**:
   - Responsive coordinator supporting three viewport configurations:
     - **Desktop Wide (>= 1280px)**: Two-panel side-by-side split layout (Editor/Controls on left, Live A4 Preview on right, with collapsible/toggleable ATS Insights).
     - **Tablet / Laptop (768px - 1279px)**: Balanced two-column view with collapsible sidebars.
     - **Mobile (< 768px)**: Segmented tab bar and floating bottom switcher pill (`Editor`, `Preview`, `ATS Score`).

4. **`ResumeEditorPanel.tsx`**:
   - Sub-mode navigation tabs: `AI Optimize` vs `Visual Styling`.
   - Interactive Section Health Cards with score indicators and "Needs Attention" badges.
   - Embeds `SectionAiWorkspace` for inline AI improvements without page refreshes.
   - Embeds `ResumeBuilderControls` for template, font, spacing, and accent color selection.

5. **`ResumePreviewPanel.tsx`**:
   - Section Jump navigation bar allowing instant scrolling to specific sections in the preview.
   - Wraps `LiveResumeCanvas` with realistic A4 paper dimensions, margins, and print styling.

6. **`ResumeInsightsPanel.tsx`**:
   - Houses the existing `AtsDiagnosticsView` without modifying its diagnostic engine, scoring weights, or prompt formulations.

---

## 5. Verification & Test Coverage

### 5.1 Backend Invariant Test Suite
- Test file: `server/tests/unit/modules/master-resume-invariants.spec.ts`
- Verified:
  - 5/5 invariant tests passing.
  - Strict preservation of formatting during synchronization.
  - Zero cross-contamination between presentation saves and career profile facts.

### 5.2 Full Regression Test Suite
- Ran complete test suite across all 41 server test files.
- **Result**: `41 passed (41)`, `380 tests passed (380)`, `0 failed`, `0 regressions`.

### 5.3 TypeScript Compilation Checks
- `server`: `npm run type-check` (`tsc --noEmit`) -> **0 errors**.
- `client`: `npx tsc --noEmit` -> **0 errors**.

---

## 6. Forward Compatibility: Phase 5 Preparation

This refactor establishes the foundation for **Phase 5: Resume Variants & Multi-Resume Portfolio Management**:
1. **Multi-Variant Ready**: `ResumeStudioHeader`'s resume dropdown seamlessly scales to list targeted variants (`FRONTEND`, `BACKEND`, `LEADERSHIP`) alongside the canonical Master Resume.
2. **Clean Separation of Concerns**: Future multi-variant diff viewers or job-description targeters only need to interact with `useResumeStudio` and `ResumeEditorPanel` without affecting page layout or preview rendering.
3. **Snapshot Immutability**: Tailored resumes can snapshot canonical career facts at generation time while sharing the same preview and export pipeline.
