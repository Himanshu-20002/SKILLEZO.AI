# Skillezo Resume Studio — Phase 7 Implementation Prompt
## Resume Builder + Templates + Presentation Controls

You are implementing **Phase 7 of Skillezo Resume Studio**.

This phase turns the Phase 6 visual resume renderer into a real, candidate-facing **Resume Builder** where users can choose a template and control presentation/layout while keeping `ResumeDocument` as the canonical source of resume content.

---

## 1. FIRST: INSPECT THE EXISTING REPO

Before changing anything:

1. Read:
   - `doc/resume-studio/README.md`
   - all existing Resume Studio phase docs
   - Phase 6 implementation/report if present
2. Inspect the actual current implementation of:
   - `ResumeDocument`
   - Resume Studio page
   - Phase 4 UI
   - Phase 5 AI editor
   - Phase 6 renderer
   - existing resume APIs/services/types
3. Reuse existing architecture and naming wherever possible.
4. Do NOT create duplicate systems where an equivalent abstraction already exists.
5. Adapt this prompt to the actual repository instead of blindly creating duplicate files.

Phase 7 must preserve all completed Phase 0–6 behavior.

---

## 2. PHASE 7 GOAL

Build the first real **Resume Builder** experience.

The candidate should be able to:

- open Builder mode from Resume Studio
- see their real resume rendered live
- choose between a small set of professional templates
- change presentation settings
- reorder sections
- control basic typography and spacing
- preview changes instantly
- switch templates without losing resume content
- save builder preferences safely
- return to Analysis and Visual Resume modes without losing state

The experience should feel like a polished product, NOT an internal engineering dashboard.

---

## 3. CORE ARCHITECTURE

Maintain this invariant:

```text
ResumeDocument = canonical resume CONTENT
        |
        v
ResumeRenderer = visual rendering engine
        |
        v
ResumeBuilder = presentation/editor controls
```

Do NOT create:

```text
VisualResumeDocument
BuilderResumeDocument
TemplateResumeDocument
PreviewResumeDocument
AIResumeDocument
```

The builder controls **presentation**, not a second copy of resume content.

---

## 4. CONTENT VS PRESENTATION BOUNDARY

### ResumeDocument owns content

Examples:

- name
- contact details
- summary
- skills
- experience
- projects
- education
- achievements
- evidence
- target role
- target JD

### Builder configuration owns presentation

A suitable configuration may contain concepts such as:

```ts
ResumeBuilderConfig {
  templateId
  fontFamily
  baseFontSize
  headingSize
  lineHeight
  sectionSpacing
  pageMargin
  sectionOrder[]
  density
  accentStyle
}
```

Adapt this to the repository's existing architecture.

IMPORTANT:

Do not duplicate actual resume text inside builder configuration.

Bad:

```ts
builder.experience = [...]
builder.summary = "..."
```

Good:

```ts
builder.sectionOrder = [...]
builder.templateId = "classic"
builder.fontFamily = "Inter"
```

---

## 5. TEMPLATE SYSTEM

Create a small, extensible template architecture.

Do NOT build a marketplace.

Do NOT create dozens of templates.

Start with approximately **3 polished ATS-conscious templates**.

Example:

```text
Classic
Modern
Compact
```

Names may be changed if the existing product language suggests better names.

Architecture should allow:

```text
ResumeBuilder
    |
    +-- TemplateRegistry
          |
          +-- ClassicTemplate
          +-- ModernTemplate
          +-- CompactTemplate
```

Each template must consume the same `ResumeDocument`.

Avoid duplicating section rendering logic unnecessarily.

---

## 6. TEMPLATE REQUIREMENTS

Every template must:

- be professional
- be readable
- be print-friendly
- be ATS-conscious
- work with real resume content
- gracefully handle missing sections
- handle long and short content
- not rely on decorative graphics for essential information
- not hide content
- not use unsafe HTML
- not create visual overlap

Avoid:

- excessive cards
- dashboard styling
- huge decorative headers
- progress bars for skills
- skill percentages
- icons replacing essential text
- multi-column layouts that make reading/ATS extraction unreliable
- unnecessary visual decoration

The result must look like a real professional resume.

---

## 7. BUILDER UI

Create a dedicated Builder experience inside Resume Studio.

Recommended structure:

```text
Resume Studio
------------------------------------------------
[Analyze] [Build] [Preview]

------------------------------------------------
Builder

Left / Main
-----------------------------------------------
|                                            |
|              LIVE A4 RESUME                |
|                                            |
|              REAL CONTENT                  |
|                                            |
-----------------------------------------------

Right / Controls
-----------------------------------------------
Template
  ○ Classic
  ○ Modern
  ○ Compact

Sections
  ☰ Summary
  ☰ Skills
  ☰ Experience
  ☰ Projects
  ☰ Education
  ☰ Achievements

Typography
  Font
  Size
  Line height

Spacing
  Section spacing
  Page margins

Appearance
  Accent style
  Density
-----------------------------------------------
```

The exact UI may differ based on the existing Phase 6 design.

The interface should remain visually clean and understandable.

---

## 8. SECTION ORDER

Allow the user to reorder the seven resume sections.

Supported sections:

```text
contact
summary
skills
experience
projects
education
achievements
```

Use a proper drag-and-drop interaction if the existing frontend stack supports it cleanly.

Otherwise implement an accessible move-up/move-down interaction.

Requirements:

- keyboard accessible
- mobile usable
- order immediately reflected in preview
- persisted in builder configuration
- no content duplication

Contact/header should remain structurally first unless the architecture explicitly supports otherwise.

---

## 9. TYPOGRAPHY CONTROLS

Provide controlled options rather than unrestricted CSS editing.

### Font family

Offer a small curated list of professional fonts available in the application.

Do not load dozens of external fonts.

### Font size

Use bounded presets, for example:

```text
Small
Default
Large
```

or a constrained numeric range.

### Line height

Use bounded presets:

```text
Compact
Comfortable
Relaxed
```

Do not allow arbitrary CSS.

---

## 10. SPACING CONTROLS

Provide controlled presentation options:

- section spacing
- page margins
- density

Example:

```text
Density:
Compact
Balanced
Comfortable
```

The goal is to let candidates fit content professionally without creating broken layouts.

---

## 11. ACCENT / VISUAL STYLE

Provide subtle styling controls.

For example:

```text
Neutral
Professional
Minimal Accent
```

Do NOT create a large color-picker system in Phase 7 unless the existing architecture makes it trivial and safe.

Avoid visually loud resumes.

The default should remain professional and ATS-conscious.

---

## 12. LIVE PREVIEW

The Phase 6 renderer must become the live rendering engine for Builder mode.

When the candidate changes:

- template
- section order
- font
- size
- spacing
- margins
- density
- accent style

the preview should update immediately.

No page refresh.

No duplicated rendering engine.

Recommended flow:

```text
Builder Control
      |
      v
Builder Config State
      |
      v
ResumeRenderer
      |
      v
Live Resume Preview
```

---

## 13. RESPONSIVE UX

Desktop:

```text
Controls + large A4 preview
```

Mobile:

```text
Controls
   ↓
Resume preview
```

Do not force a tiny A4 document beside a narrow control panel on mobile.

The mobile experience must remain usable.

---

## 14. MULTI-PAGE RESUME HANDLING

The builder must support resumes longer than one page.

Do NOT:

- clip content
- hide overflowing content
- force all content into one page
- shrink text to unreadable sizes

The renderer should naturally flow into additional pages/print areas.

Page-break behavior should be sensible around sections.

For example:

- avoid splitting headings from their content where practical
- avoid awkward isolated headings at page bottoms
- avoid breaking individual bullets unnecessarily where practical

Do not attempt a complete PDF pagination engine in this phase.

---

## 15. SAVE / PERSISTENCE

Builder settings should persist.

Preferred architecture:

```text
ResumeDocument
+
ResumeBuilderConfig
```

where the configuration belongs to the resume/user but does not duplicate content.

Before creating new persistence models:

- inspect existing Resume model
- inspect existing settings/versioning patterns
- reuse existing mechanisms where appropriate

Persistence must support:

```text
load resume
→ load builder config
→ render
```

and:

```text
change setting
→ update local UI immediately
→ persist safely
```

Use debounced persistence if appropriate.

Do not make every slider interaction generate a heavy backend request.

---

## 16. VERSION / CONCURRENCY SAFETY

Do not interfere with Phase 5 optimistic concurrency behavior.

Builder presentation changes must not accidentally overwrite newer `ResumeDocument` content.

If builder config and ResumeDocument are stored together, use the repository's existing versioning strategy carefully.

A builder setting update must never erase:

- AI-approved content
- manually edited content
- evidence
- contact information
- experience
- projects
- any other ResumeDocument field

---

## 17. ANALYSIS ↔ BUILDER INTEGRATION

Resume Studio should now provide a clear product flow:

```text
Analyze
   ↓
Understand weaknesses
   ↓
Improve with Evidence-Locked AI
   ↓
Build / Design
   ↓
Preview
   ↓
Future PDF Export
```

The user should be able to move between:

```text
Analysis
Builder
Visual Resume
```

without losing context.

If a section is selected in Analysis, Builder should be able to focus/highlight that section in the preview where practical.

Do not rebuild the Phase 4/5 analysis UI.

Do not move scoring logic into the builder.

---

## 18. SCORE SEPARATION

Scores must remain outside the actual resume.

The builder may show resume health context around the editor if useful:

```text
Resume score: 72
```

But NEVER render inside the resume:

```text
72/100
ATS Score
Evidence Locked
AI Improved
Section Score
```

The actual resume must remain candidate-ready.

---

## 19. TEMPLATE SWITCHING SAFETY

Switching templates must never change:

- ResumeDocument content
- evidence
- scores
- AI suggestions
- approved improvements

Example:

```text
Template A
    ↓
Template B
    ↓
Template C
```

must only change presentation.

The same ResumeDocument should render through all templates.

---

## 20. ACCESSIBILITY

Builder controls must support:

- keyboard navigation
- visible focus states
- semantic buttons
- labels for controls
- accessible drag/drop or move controls
- adequate contrast
- screen-reader-friendly controls

Do not rely solely on icons.

---

## 21. PERFORMANCE

The resume preview should feel instant.

Avoid:

- unnecessary full-page rerenders
- expensive calculations on every interaction
- loading huge font libraries
- duplicated DOM trees
- unnecessary API calls

Use React memoization/state isolation where it actually improves performance.

Do not prematurely over-engineer.

---

## 22. SECURITY

Treat all ResumeDocument content as untrusted user content.

Never inject raw HTML from:

- summary
- experience
- projects
- skills
- achievements
- imported resume data
- AI output

Render content through normal React text rendering and safe component boundaries.

Builder configuration must be validated.

Template IDs must be allowlisted.

Do not allow arbitrary CSS from the user to be persisted/rendered.

---

## 23. API / TYPES

Create or extend APIs only where necessary.

Possible conceptual endpoints:

```text
GET  /api/resumes/:resumeId/builder
PUT  /api/resumes/:resumeId/builder
```

But first inspect the existing API architecture.

Builder API responses should contain presentation configuration, not duplicate ResumeDocument content.

Validate all incoming configuration server-side.

Example validation rules:

```text
templateId → known template only
fontSize → bounded
lineHeight → bounded
spacing → bounded
margin → bounded
sectionOrder → known section IDs only
density → known enum
accentStyle → known enum
```

Never trust client validation alone.

---

## 24. TESTING

Add unit tests for:

### Template registry

- known templates resolve
- unknown template rejected or falls back safely

### Builder config validation

- valid config accepted
- invalid template rejected
- invalid section ID rejected
- duplicate section rejected
- invalid numeric values rejected
- unsafe values rejected

### Section ordering

- supported order renders correctly
- missing sections handled
- content unchanged

### Renderer

Every template should render:

- contact
- summary
- skills
- experience
- projects
- education
- achievements

Test long content and missing content.

### Persistence

Test:

```text
save config
→ reload
→ same config
```

and ensure content remains unchanged.

### Regression

Run all existing Resume Studio tests.

Do NOT reduce or replace previous test coverage just to make Phase 7 pass.

---

## 25. BROWSER VERIFICATION

After implementation, actually open the Resume Studio UI.

Verify:

1. Resume Studio loads.
2. Builder mode opens.
3. Real resume content appears.
4. Classic template works.
5. Modern template works.
6. Compact template works.
7. Switching templates preserves content.
8. Reordering sections updates preview.
9. Typography changes update preview.
10. Spacing changes update preview.
11. Mobile layout works.
12. Long resume content does not get clipped.
13. Analysis → Builder works.
14. Builder → Visual Resume works.
15. Phase 5 AI-approved changes appear in Builder.
16. Refreshing the page preserves builder configuration.
17. No console errors.
18. No broken network requests.
19. No unsafe HTML warnings.
20. Actual resume still looks like a professional resume rather than a dashboard.

Use the real development fixture/data where available, not only an artificial empty state.

---

## 26. UX QUALITY BAR

This is extremely important.

The Builder should feel:

- simple
- premium
- focused
- professional
- obvious
- fast

It should NOT feel:

- like a developer tool
- like an admin panel
- like a configuration screen
- overloaded with sliders
- full of technical terminology

Prefer:

```text
Template
Style
Sections
Spacing
```

over:

```text
Template Registry
Renderer Configuration
Layout Engine
CSS Parameters
```

The user should understand the interface without knowing how the renderer works.

---

## 27. DO NOT BUILD THESE IN PHASE 7

Hard boundary.

Do NOT implement:

- PDF export
- PDF generation
- PDF download
- ATS PDF validation
- job description matching
- resume tailoring
- AI resume rewriting
- AI scoring
- AI-generated templates
- template marketplace
- public template sharing
- collaborative editing
- drag-and-drop arbitrary page positioning
- freeform canvas editing
- arbitrary CSS editor
- arbitrary HTML editor
- portfolio website builder
- cover letter builder

Phase 5 already owns Evidence-Locked AI improvement.

Phase 6 owns visual rendering.

Phase 7 owns **building and controlling resume presentation**.

---

## 28. PRODUCT FLOW AFTER PHASE 7

The intended architecture becomes:

```text
                 ResumeDocument
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Intelligence      AI Editor      Builder
        │              │              │
   Score/Analysis   Approved Edits   Templates
                                       │
                                  Style Controls
                                       │
                                  Section Order
                                       │
                                       ↓
                              ResumeRenderer
                                       │
                                       ↓
                               Visual Resume
                                       │
                                       ↓
                              Future PDF Export
                                       │
                                       ↓
                              Future ATS Validation
```

This is the foundation for later export and ATS validation.

---

## 29. DEFINITION OF DONE

Phase 7 is complete only when:

- [ ] Builder mode exists inside Resume Studio.
- [ ] ResumeDocument remains the only canonical content model.
- [ ] Builder configuration is separate from resume content.
- [ ] At least 3 polished templates work.
- [ ] Templates use the same underlying ResumeDocument.
- [ ] Section ordering works.
- [ ] Typography controls work.
- [ ] Spacing controls work.
- [ ] Basic visual style controls work.
- [ ] Live preview updates instantly.
- [ ] Multi-page content is handled without clipping.
- [ ] Builder settings persist.
- [ ] Switching templates preserves all content.
- [ ] Phase 5 AI changes flow into the builder.
- [ ] Analysis / Builder / Visual modes integrate cleanly.
- [ ] Mobile UX works.
- [ ] Accessibility requirements are met.
- [ ] Security requirements are met.
- [ ] Existing Phase 0–6 tests still pass.
- [ ] New Phase 7 tests pass.
- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Browser verification passes.
- [ ] No console errors.
- [ ] No duplicate resume content model was introduced.

---

## 30. FINAL HARD STOP

When all Phase 7 acceptance criteria are complete:

**STOP.**

Do not begin PDF work.

Do not implement ATS validation.

Do not implement JD matching.

Do not add future-phase features "while you're here."

Provide a final implementation report containing:

1. Files created
2. Files modified
3. Builder architecture
4. Template architecture
5. Builder configuration schema
6. API changes
7. UI/UX changes
8. Tests added
9. Full test results
10. TypeScript/lint results
11. Browser verification results
12. Git commit hash
13. Any known limitations
14. Confirmation that ResumeDocument remains canonical
15. Confirmation that future-phase work was NOT implemented

## Guiding principle

> **Phase 7 turns the Visual Resume Renderer into a real Resume Builder — without ever turning presentation state into a second resume content model.**

The long-term pipeline must remain:

```text
ResumeDocument
      ↓
Resume Intelligence
      ↓
Evidence-Locked AI
      ↓
Resume Builder
      ↓
ResumeRenderer
      ↓
Visual Resume
      ↓
Future PDF Export
      ↓
Future ATS Validation
```
