# SKILLEZO AI — Phase 4 Implementation Prompt
## Resume Studio UX & Architecture Refactor

You are working on the existing **SKILLEZO AI** codebase.

Phase 1 — Resume Ingestion → Canonical `ResumeDocument` — is COMPLETE and FROZEN.

Phase 2 — Career Profile Foundation / `ProfileModel` as the sole canonical source of truth — is COMPLETE and FROZEN.

Phase 3 — Master Resume Generation & Resume Studio UI Integration — is COMPLETE and FROZEN.

Your task is to implement:

# PHASE 4 — RESUME STUDIO UX & ARCHITECTURE REFACTOR

The goal is to turn the existing Resume Studio into a clean, maintainable, production-ready workspace while preserving all existing functionality and the domain boundaries established in Phases 1–3.

This phase is primarily a **frontend architecture + UX refactor**.

Do NOT redesign the backend domain model.

Do NOT create another source of truth.

Do NOT implement Resume Gallery, Tailored Resume generation, JD tailoring, Application snapshots, or Career GPS redesign in this phase.

---

# 1. CORE ARCHITECTURE

The Studio must follow:

```text
                    CAREER PROFILE
                    ProfileModel
                 SOURCE OF TRUTH
                         │
                         │ career facts
                         ▼
                  MASTER RESUME
               ResumeModel / MASTER
                         │
                         │ ResumeDocument
                         ▼
                  RESUME STUDIO
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       CONTENT         DESIGN         INSIGHTS
          │              │              │
          ▼              ▼              ▼
    Career Facts     Presentation     ATS / AI
```

The boundaries are non-negotiable.

## Career facts

Owned by:

```text
ProfileModel
```

Examples:

- name/contact facts
- headline
- bio
- target role
- skills
- experience
- projects
- education
- links

## Resume presentation

Owned by the Master Resume presentation layer:

- layout
- template
- typography
- colors
- spacing
- margins
- section ordering
- visual styling
- builder configuration

## AI / diagnostics

Existing systems remain responsible for:

- ATS diagnostics
- Role/JD matching
- Impact/content analysis
- AI suggestions

Do not create duplicate implementations.

---

# 2. FIRST TASK — AUDIT CURRENT STUDIO

Before modifying anything, inspect the actual repository.

Focus especially on:

```text
client/app/dashboard/resume-studio/page.tsx
client/components/**
client/services/resume.service.ts
client/types/resume.ts
```

and all components imported by Resume Studio.

Identify:

1. Current page responsibilities.
2. Data-fetching responsibilities.
3. Resume editing responsibilities.
4. Preview responsibilities.
5. ATS responsibilities.
6. AI responsibilities.
7. Upload responsibilities.
8. Modal responsibilities.
9. URL/query-state responsibilities.
10. Save/update responsibilities.
11. Loading/error handling.
12. Existing state management.
13. Existing reusable UI components.
14. Existing design tokens and styling conventions.

Do not assume the current architecture from documentation.

Use the actual implementation as the source of truth.

---

# 3. CURRENT FUNCTIONALITY MUST BE PRESERVED

This is a refactor, not a feature-removal exercise.

Before implementation, make a checklist of existing Studio capabilities and preserve them.

At minimum inspect and preserve:

- Resume loading
- Master Resume loading
- Resume preview
- Resume editing
- Resume saving
- Resume deletion where currently supported
- Resume upload/import where currently supported
- Resume selection
- URL-driven view state
- ATS diagnostics
- Role/JD matching
- Impact/content analysis
- AI optimization
- Section AI
- existing modals
- existing PDF preview/export
- existing renderer
- authentication behavior
- error handling

If a current feature is broken before Phase 4, do not silently claim Phase 4 fixed it unless you actually fix and test it.

---

# 4. TARGET STUDIO ARCHITECTURE

Refactor the Studio into focused responsibilities.

The exact filenames must follow the repository's existing conventions, but the architecture should conceptually become:

```text
ResumeStudioPage
│
├── ResumeStudioHeader
│   ├── Back
│   ├── Resume identity
│   ├── Save state
│   ├── Sync state
│   ├── Preview
│   └── Export
│
├── ResumeStudioWorkspace
│
│   ├── ResumeEditorPanel
│   │   ├── Content sections
│   │   ├── Presentation controls
│   │   └── Section actions
│   │
│   ├── ResumePreviewPanel
│   │   └── Existing ResumeRenderer
│   │
│   └── ResumeInsightsPanel
│       ├── ATS
│       ├── Match
│       ├── Impact
│       └── AI suggestions
│
└── Existing dialogs/modals
```

Do not blindly create every component above if the existing project already has equivalent components.

Reuse and extract.

---

# 5. PAGE COMPONENT RESPONSIBILITY

`resume-studio/page.tsx` should become primarily an orchestration/container component.

It should NOT continue containing all:

- editor logic
- preview logic
- AI logic
- ATS logic
- modal rendering
- complex transformations
- duplicated API logic

Move focused responsibilities into appropriate components/hooks/services.

The page should primarily coordinate:

```text
load
state
selection
actions
layout
```

---

# 6. DATA LAYER

Do not introduce a second global state system.

Reuse the project's existing architecture.

If a dedicated Studio hook/state abstraction is useful, create a focused one such as:

```text
useResumeStudio()
```

or the repository's equivalent.

The state model should conceptually separate:

```text
server state
    ↓
Master Resume / ResumeDocument

local UI state
    ↓
active section
active panel
modal state
preview mode
temporary presentation edits

derived state
    ↓
ATS
stale status
dirty status
validation
```

Avoid maintaining conflicting copies of the same career facts.

---

# 7. IMPORTANT — CAREER FACT VS PRESENTATION EDITING

This is the most important architectural rule of Phase 4.

Before changing an editor, determine what it edits.

## Career fact examples

```text
Company
Job title
Experience bullet
Skill
Project
Education
Phone
Location
Summary
```

These belong to:

```text
ProfileModel
```

## Presentation examples

```text
Font
Font size
Template
Color
Spacing
Margins
Section order
Layout
```

These belong to:

```text
Master Resume presentation state
```

Do not silently allow:

```text
Studio editor
      ↓
ResumeDocument
      ↓
persistent career fact
```

to become another source of truth.

If the current Studio still edits career facts directly inside ResumeDocument, migrate the behavior safely toward ProfileModel.

---

# 8. CAREER FACT EDITING STRATEGY

Do not attempt a risky full rewrite of every content editor if the current Studio architecture makes that unsafe.

For each content editor:

1. Identify current write path.
2. Identify whether it changes career facts.
3. Identify whether a Profile API already exists.
4. If an existing Profile API exists, reuse it.
5. Update ProfileModel through the existing service.
6. Rebuild/synchronize the Master Resume when required.
7. Preserve presentation configuration.

The intended future flow is:

```text
User edits Experience
        ↓
Profile API
        ↓
ProfileModel updated
        ↓
profileVersion changes
        ↓
Master Resume becomes stale
        ↓
Studio indicates update
        ↓
Sync
        ↓
ResumeDocument updated
```

However, do not force an awkward UX if the current product architecture supports an equivalent safer flow.

Document any remaining migration work for a later phase.

---

# 9. PRESENTATION EDITING

Presentation changes should not modify Career Profile facts.

Examples:

```text
Change font
Change template
Change color
Change spacing
Change margins
Reorder sections
```

These should update Master Resume presentation configuration.

They should NOT:

- increment `profileVersion`
- create a new ProfileModel
- change career facts
- trigger profile hydration
- create another Master Resume

---

# 10. MASTER RESUME STATE

The Studio must understand:

```text
variantType = MASTER
sourceProfileVersion
profileVersion
isStale
```

Display the state clearly.

### Synced

Example:

```text
⭐ Master Resume
Synced with Career Profile
```

### Stale

Example:

```text
⚠ Career Profile Updated

New career information is available.

[Sync Master Resume]
```

### Saving presentation

Example:

```text
Saving...
Saved
```

Do not make the UI noisy.

Use the project's existing toast/badge/status patterns.

---

# 11. TARGET UI STRUCTURE

The Studio should move toward a professional three-part workspace:

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Resumes   ⭐ Master Resume     Saved ✓    Preview  Export │
├───────────────────────┬──────────────────────┬───────────────┤
│                       │                      │               │
│   EDITOR / CONTROLS   │     A4 PREVIEW      │  AI INSIGHTS  │
│                       │                      │               │
│   Content             │                      │  ATS          │
│   Experience          │       Resume         │  Match        │
│   Skills              │       Preview        │  Impact       │
│   Projects            │                      │               │
│   Education           │                      │  Suggestions  │
│                       │                      │               │
└───────────────────────┴──────────────────────┴───────────────┘
```

This is a target architectural/UX direction.

Do not copy the diagram literally if the existing application's design system uses a different layout.

The implementation must feel native to the existing SKILLEZO UI.

---

# 12. RESPONSIVE BEHAVIOR

The Studio must work across:

- desktop
- laptop
- tablet
- smaller screens

On smaller screens, do not attempt to maintain three columns if it makes the experience unusable.

Use an intentional responsive strategy such as:

```text
Desktop:
Editor | Preview | Insights

Tablet:
Editor / Preview tabs
Insights drawer

Mobile:
Preview
Content
Insights
```

Reuse existing responsive components and breakpoints.

---

# 13. HEADER

Refactor the Studio header into a focused component.

It should communicate:

- navigation/back
- current resume
- Master/Tailored status where applicable
- save state
- sync state
- preview controls
- export controls if already supported

For the Master Resume:

```text
⭐ Master Resume
```

must be immediately understandable.

Do not add unnecessary controls.

---

# 14. EDITOR PANEL

Create a clean editing/navigation experience for existing sections.

At minimum support the sections already supported by the current Studio:

- Summary
- Experience
- Skills
- Projects
- Education
- Contact
- any additional existing ResumeDocument sections

Do not remove existing supported sections.

Use existing section editor components where possible.

The goal is to improve organization, not rewrite content logic unnecessarily.

---

# 15. PREVIEW PANEL

Reuse the existing:

```text
ResumeRenderer
```

and current preview/canvas system.

Do NOT build a second rendering engine.

The preview must reflect:

- ResumeDocument content
- presentation settings
- section ordering
- typography
- spacing
- layout

Preview rendering should not mutate ProfileModel.

Preview rendering should not increment versions.

---

# 16. INSIGHTS PANEL

Use existing AI/ATS functionality.

The panel should conceptually expose:

```text
ATS Compatibility
Role / JD Match
Impact & Content
AI Suggestions
```

Do not create new scoring algorithms.

Do not change existing scoring semantics unless required for integration.

Do not fabricate scores.

If data is unavailable, show an appropriate empty/loading state.

---

# 17. ATS / AI PERFORMANCE

Avoid triggering expensive analysis on every keystroke.

Use the existing mechanisms.

Prefer:

```text
User stops editing
        ↓
debounced analysis
```

or an existing explicit Analyze/Refresh action.

Do not add new LLM calls merely for UI rendering.

---

# 18. SAVE MODEL

Audit the current save behavior.

Clearly distinguish:

### Career Profile save

```text
ProfileModel
profileVersion
```

from:

### Presentation save

```text
Master Resume
ResumeDocument presentation
builderConfig
template/layout
```

Do not increment `profileVersion` for pure presentation changes.

Do not accidentally overwrite profile facts with stale Studio state.

---

# 19. DIRTY STATE

Implement or preserve a clear dirty-state model.

The Studio should know:

```text
Saved
Saving...
Unsaved changes
Save failed
```

If the existing system already handles this, refactor it rather than replacing it.

Do not show false "Saved" state before the backend confirms persistence.

---

# 20. UNSAVED CHANGES

Handle navigation safely.

If the user has unsaved presentation changes and tries to leave:

```text
You have unsaved changes.
[Stay] [Discard]
```

Only add a browser-level beforeunload warning where technically necessary.

Do not interrupt navigation unnecessarily.

---

# 21. PROFILE SYNC FLOW

The Studio must integrate Phase 3 sync behavior cleanly.

### When profile is current

```text
⭐ Master Resume
Synced with Career Profile
```

### When profile is newer

```text
Career Profile Updated

Your Career Profile contains newer information.

[Sync Master Resume]
```

After synchronization:

```text
Profile facts updated
Presentation settings preserved
Master Resume synced
```

The sync operation must reuse:

```text
POST /api/resumes/master/sync
```

or the project's equivalent existing API.

Do not create a second synchronization API.

---

# 22. LOADING STATES

Every major Studio region must handle loading gracefully.

At minimum:

- page loading
- resume loading
- preview loading
- ATS loading
- AI loading
- sync loading
- save loading

Prefer skeletons/placeholders consistent with the existing design system.

Avoid full-page spinners when only one panel is loading.

---

# 23. ERROR STATES

Handle:

- failed resume load
- failed save
- failed sync
- failed ATS analysis
- failed AI analysis
- renderer failure
- unauthorized state
- network failure

Errors should be:

- understandable
- actionable
- non-technical

Never expose stack traces.

---

# 24. EMPTY STATES

Support:

### Empty Profile

```text
Your Career Profile is still empty.

Add experience, skills, education and projects
to build your Master Resume.

[Open Career Profile]
```

### Empty Experience

```text
No experience added yet.
```

### No AI analysis

```text
Analyze your resume to see insights.
```

Do not fabricate content.

---

# 25. URL / ROUTING STATE

Preserve existing URL behavior.

If the Studio currently supports:

```text
?view=
?section=
?resume=
```

or equivalent query parameters, do not break them.

If refactoring them, centralize parsing rather than duplicating URL logic across components.

---

# 26. ACCESSIBILITY

Improve or preserve accessibility.

At minimum:

- keyboard navigation
- visible focus states
- semantic buttons
- labels for controls
- tooltips only where useful
- aria labels for icon-only controls
- accessible dialogs
- sufficient text contrast according to existing design standards

Do not use icons without accessible names.

---

# 27. PERFORMANCE

Phase 4 must not make the Studio slower.

Use:

- dynamic imports where already appropriate
- memoization only where justified
- stable callbacks where needed
- lazy loading for heavy AI/preview components
- avoid unnecessary full-page re-renders
- avoid repeated API calls

Do not optimize blindly.

Measure or inspect actual render/data-flow behavior.

---

# 28. COMPONENT BOUNDARIES

Prefer focused components.

For example:

```text
resume-studio/
├── ResumeStudioHeader
├── ResumeStudioWorkspace
├── ResumeEditorPanel
├── ResumePreviewPanel
├── ResumeInsightsPanel
├── ResumeSyncBanner
├── ResumeSaveStatus
├── ResumeSectionNavigation
└── hooks/
    └── useResumeStudio
```

These are conceptual examples.

Follow the project's existing folder/component conventions.

Do not create dozens of tiny components without value.

---

# 29. NO DUPLICATE SERVICES

Do not create parallel versions of:

```text
ResumeService
ProfileService
ATSService
AIService
Renderer
```

Reuse the existing implementations.

Only extract a service if the current responsibility genuinely belongs there.

---

# 30. NO NEW GLOBAL STATE LIBRARY

Do not introduce Redux/Zustand/etc. solely for Phase 4 if the project already has an established state approach.

Use the current architecture.

If existing state management is insufficient, create the smallest local abstraction necessary.

---

# 31. DO NOT CHANGE THE MASTER RESUME DOMAIN

The following must remain true:

```text
ProfileModel
    = canonical career facts

ResumeModel MASTER
    = presentation artifact

ResumeDocument
    = canonical resume presentation AST
```

Do not reverse these relationships.

---

# 32. DO NOT BUILD THESE FEATURES

Phase 4 must NOT implement:

- Resume Gallery
- multiple Tailored Resume variants
- JD-to-resume tailoring
- AI auto-apply
- application snapshots
- Career GPS redesign
- new job engine
- new evidence architecture
- new profile model
- DOCX architecture
- new resume renderer
- complete backend rewrite

These belong to later phases.

---

# 33. PREPARE FOR PHASE 5

The architecture should make Phase 5 easy.

Phase 5 will introduce:

```text
Resume Portfolio
    │
    ├── ⭐ Master Resume
    │
    ├── Tailored Resume
    │
    ├── Tailored Resume
    │
    └── + New Variant
```

Phase 4 should therefore avoid hardcoding the Studio around only one resume forever.

However, do NOT implement the Gallery now.

Use abstractions that can later support:

```text
MASTER
TAILORED
```

without breaking the current Studio.

---

# 34. TESTING

Add focused tests for the refactor.

## Component / Unit Tests

Where the existing frontend test setup supports them:

1. Studio loads Master Resume.
2. Master Resume status displays correctly.
3. Stale profile status displays correctly.
4. Sync action works.
5. Save state works.
6. Dirty state works.
7. Error states render correctly.
8. Empty profile state renders correctly.
9. Editor panel renders existing sections.
10. Preview panel renders ResumeDocument.
11. Insights panel renders existing ATS/AI data.
12. URL state remains compatible.
13. Presentation edits do not modify ProfileModel.
14. Profile synchronization does not destroy presentation configuration.

## Backend Regression

Do not change backend behavior unnecessarily.

Run the complete existing server test suite.

Require:

```text
All existing tests pass.
All new Phase 4 tests pass.
Zero regressions.
```

Do NOT hardcode a test count.

---

# 35. TYPE CHECKING

Run the project's actual commands.

At minimum:

```bash
npm run type-check
```

for the server if applicable.

For client:

```bash
npx tsc --noEmit
```

or the repository's actual equivalent.

Do not claim zero errors without running the command.

---

# 36. BUILD / LINT

Run the project's existing:

```text
build
lint
```

commands where available.

Do not invent scripts.

Inspect `package.json` first.

---

# 37. MANUAL QA

After implementation manually verify:

## Scenario A — Open Studio

```text
Open Resume Studio
        ↓
Master Resume loads
        ↓
Preview renders
        ↓
Header shows Master status
```

## Scenario B — Presentation edit

```text
Change font/template/layout
        ↓
Save
        ↓
Refresh Studio
        ↓
Presentation remains
```

## Scenario C — Career Profile update

```text
Change Profile fact
        ↓
profileVersion changes
        ↓
Master becomes stale
        ↓
Studio displays sync state
        ↓
Sync Master Resume
        ↓
New profile fact appears
        ↓
Presentation remains intact
```

## Scenario D — ATS

```text
Open ATS
        ↓
Existing diagnostics load
        ↓
No duplicate API requests
        ↓
Score displays correctly
```

## Scenario E — AI

```text
Open AI insights
        ↓
Existing AI functionality works
        ↓
No new unsupported claims
```

## Scenario F — Unsaved changes

```text
Make presentation change
        ↓
Dirty state appears
        ↓
Navigate away
        ↓
Safe navigation behavior
```

## Scenario G — Refresh

```text
Edit
Save
Refresh browser
        ↓
Saved state restored
```

---

# 38. VISUAL QA

Compare the implemented Studio against the intended direction:

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Resumes   ⭐ Master Resume     Saved ✓    Preview  Export │
├───────────────────────┬──────────────────────┬───────────────┤
│                       │                      │               │
│   EDITOR / CONTROLS   │     A4 PREVIEW      │  AI INSIGHTS  │
│                       │                      │               │
│   Content             │       Resume         │  ATS          │
│   Experience          │       Preview        │  Match        │
│   Skills              │                      │  Impact       │
│   Projects            │                      │               │
│   Education           │                      │  Suggestions  │
│                       │                      │               │
└───────────────────────┴──────────────────────┴───────────────┘
```

This is a UX direction, not a requirement to reproduce the exact pixels.

Maintain the existing SKILLEZO visual language.

---

# 39. ACCEPTANCE CRITERIA

Phase 4 is complete only when:

- [ ] Existing Resume Studio functionality is preserved.
- [ ] Studio page responsibilities are reduced and organized.
- [ ] Data loading is separated from presentation components.
- [ ] Editor responsibilities are separated.
- [ ] Preview responsibilities are separated.
- [ ] Insights responsibilities are separated.
- [ ] Existing ResumeRenderer is reused.
- [ ] Master Resume remains the primary Studio document.
- [ ] ProfileModel remains the sole canonical career-fact source.
- [ ] Presentation configuration remains owned by Master Resume presentation state.
- [ ] Career fact editing does not create a competing ResumeDocument source of truth.
- [ ] Presentation edits do not modify ProfileModel.
- [ ] Profile synchronization does not destroy presentation settings.
- [ ] Master Resume stale state is visible.
- [ ] Master Resume sync works.
- [ ] Save/dirty states are accurate.
- [ ] Loading states are handled.
- [ ] Error states are handled.
- [ ] Empty states are handled.
- [ ] Existing ATS functionality works.
- [ ] Existing AI functionality works.
- [ ] Existing URL/routing behavior is preserved.
- [ ] Responsive behavior works.
- [ ] Accessibility is preserved/improved.
- [ ] No duplicate global state system is introduced.
- [ ] No duplicate backend service architecture is introduced.
- [ ] No Resume Gallery is implemented.
- [ ] No JD tailoring is implemented.
- [ ] No application snapshot redesign is implemented.
- [ ] No Career GPS redesign is implemented.
- [ ] All tests pass.
- [ ] Type checking passes.
- [ ] Build/lint passes where applicable.
- [ ] Manual QA scenarios pass.
- [ ] Documentation is updated.

---

# 40. DOCUMENTATION

Create or update:

```text
doc/resume-studio/04-studio-ux-architecture.md
```

Document:

1. Current Studio architecture after refactor.
2. Component responsibilities.
3. Career Profile vs Master Resume ownership.
4. Career fact editing flow.
5. Presentation editing flow.
6. Save/dirty model.
7. Sync/stale model.
8. ATS/AI integration.
9. Responsive behavior.
10. Accessibility considerations.
11. Performance considerations.
12. Phase 5 preparation.
13. Known limitations.

Include this conceptual architecture:

```text
                     CAREER PROFILE
                     ProfileModel
                          │
                          │ career facts
                          ▼
                   MASTER RESUME
                 ResumeModel MASTER
                          │
                          │ ResumeDocument
                          ▼
                  ┌─────────────────┐
                  │  RESUME STUDIO  │
                  └───────┬─────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          CONTENT       PREVIEW      INSIGHTS
             │            │            │
             ▼            ▼            ▼
        Profile facts   Renderer    ATS / AI
        Presentation    AST         Existing
        controls
```

---

# 41. IMPLEMENTATION SAFETY RULE

Before changing existing Studio behavior:

1. Inspect the existing implementation.
2. Identify the current write path.
3. Identify existing reusable components.
4. Identify existing state management.
5. Preserve existing APIs unless change is necessary.
6. Make the smallest safe architectural change.
7. Add regression tests.
8. Verify the actual UI manually.
9. Do not claim completion based only on TypeScript compilation.

Do not rewrite the Studio simply because a cleaner architecture is possible.

Refactor incrementally.

---

# 42. FINAL OUTPUT REQUIRED FROM ANTIGRAVITY

At the end provide a concise implementation report:

1. Files created.
2. Files modified.
3. Components extracted.
4. State/data-flow changes.
5. Career fact vs presentation boundary changes.
6. Master Resume integration.
7. ATS/AI integration.
8. Responsive/accessibility changes.
9. Tests added.
10. Full test results.
11. Type-check results.
12. Build/lint results.
13. Manual QA results.
14. Known limitations.
15. Explicit confirmation that Phase 5 Resume Gallery/Variants was NOT implemented.

Do not claim Phase 4 complete unless the acceptance criteria have actually been verified.

# END OF PHASE 4
