# SKILLEZO — PHASE 6
# Visual Resume Renderer + Section Preview
## Resume Studio — Turn Resume Intelligence Into a Real Visual Resume

---

# 0. MISSION

Phases 0–5 are complete.

The system now has:

```text
ResumeDocument
      ↓
7-Section Analysis
      ↓
Deterministic Scoring
      ↓
Candidate-Friendly Resume Studio
      ↓
Evidence-Locked AI Section Improvement
      ↓
Candidate Approval
      ↓
Updated ResumeDocument
```

Phase 6 introduces the missing visual layer:

> **Render the canonical ResumeDocument as an actual professional resume inside Resume Studio.**

The candidate must now be able to SEE the resume, not just see scores and text fields.

The core goal is:

```text
ResumeDocument
      ↓
Visual Resume Renderer
      ↓
Live Resume Preview
```

This phase is about **visual rendering and section preview**, not the complete builder.

---

# 1. WHAT PHASE 6 MUST DELIVER

The candidate should be able to:

1. Open Resume Studio.
2. See their actual resume rendered visually.
3. See every ResumeDocument section in resume format.
4. See approved Phase 5 AI changes immediately reflected in the preview.
5. Navigate between analysis and the visual resume.
6. Preview individual sections.
7. Understand how the structured ResumeDocument becomes a real resume.
8. Prepare the architecture for the future template/builder phase.

The renderer must consume the canonical ResumeDocument.

---

# 2. HARD BOUNDARY

Phase 6 is ONLY:

## Visual Resume Renderer + Section Preview

DO NOT implement:

- full drag-and-drop builder
- template marketplace
- multiple complete templates
- arbitrary layout editor
- typography editor
- spacing editor
- color customization system
- PDF export
- PDF generation
- PDF validation
- ATS PDF validation
- LaTeX
- Typst
- JD matching
- JD tailoring
- Copilot
- AI rewriting
- new AI provider
- new scoring engine

Those belong to later phases.

---

# 3. FIRST — INSPECT THE REPOSITORY

Before coding, inspect:

- `doc/resume-studio/README.md`
- all Resume Studio phase documentation
- Phase 0 architecture
- Phase 1 ResumeDocument normalization
- Phase 2 section contracts
- Phase 3 scoring
- Phase 4 UX
- Phase 5 AI editor
- existing ResumeDocument types/schema
- current Resume Studio page
- existing design system
- existing UI components
- existing font setup
- existing PDF/renderer dependencies if any
- package versions
- Next.js architecture
- React version

Do not blindly follow this prompt if the repository has an established canonical implementation.

Repository code and documentation are the source of truth.

---

# 4. CANONICAL DATA RULE

The renderer must consume:

```text
ResumeDocument
```

as the single source of truth.

Do NOT create:

```text
VisualResumeDocument
AIResumeDocument
BuilderResumeDocument
PreviewResumeDocument
```

that duplicates content.

The renderer should be a pure presentation layer over the canonical document.

Conceptually:

```text
ResumeDocument
       │
       ├──────────────→ Analysis
       │
       ├──────────────→ AI Editor
       │
       └──────────────→ Visual Renderer
```

---

# 5. RENDERER ARCHITECTURE

Create a reusable renderer component/module.

Conceptually:

```text
ResumeRenderer
    │
    ├── ResumeHeader
    ├── SummarySection
    ├── SkillsSection
    ├── ExperienceSection
    ├── ProjectsSection
    ├── EducationSection
    └── AchievementsSection
```

Adapt names to the actual repository architecture.

Avoid one enormous `page.tsx` containing the entire resume renderer.

The renderer should be reusable later by:

- Resume Studio preview
- Builder
- template system
- PDF renderer
- export pipeline

---

# 6. IMPORTANT FUTURE COMPATIBILITY

The renderer should be designed so that later phases can provide:

```text
ResumeDocument
+
Template/Layout Configuration
        ↓
ResumeRenderer
        ↓
Visual Resume
```

For Phase 6, use ONE clean default professional layout.

Do not build the full template engine yet.

---

# 7. DEFAULT RESUME DESIGN

Create one professional, ATS-conscious visual layout.

The design should be:

- clean
- minimal
- professional
- highly readable
- print-friendly
- desktop-first
- responsive
- not overly decorative

Avoid:

- excessive colors
- skill progress bars
- rating stars
- profile percentages
- decorative charts
- giant icons
- excessive sidebars
- photos unless already part of the canonical document and explicitly supported
- unnecessary graphics

The content should look like a real professional resume.

---

# 8. TARGET VISUAL STRUCTURE

The preview should look approximately like:

```text
┌──────────────────────────────────────────────────────────┐
│                                                          │
│ HIMANSHU KUMAR                                           │
│ Full Stack Developer                                     │
│ Delhi, India · email · phone · GitHub · LinkedIn        │
│                                                          │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│ SUMMARY                                                  │
│ Full Stack Developer with experience...                  │
│                                                          │
│ SKILLS                                                   │
│ Frontend: React · Next.js · TypeScript · ...             │
│ Backend: Node.js · Express · MongoDB · ...               │
│                                                          │
│ EXPERIENCE                                               │
│ Software Developer — Company                             │
│ 2025 – Present                                           │
│ • Built...                                               │
│ • Developed...                                           │
│                                                          │
│ PROJECTS                                                 │
│ GuardOps                                                 │
│ Next.js · TypeScript · PostgreSQL                        │
│ • Built...                                               │
│                                                          │
│ EDUCATION                                                │
│ Bachelor of Technology in Computer Science               │
│ University · 2022–2026                                   │
│                                                          │
│ ACHIEVEMENTS                                             │
│ • ...                                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

This is a structural reference.

Use the actual ResumeDocument content.

---

# 9. SECTION ORDER

The default renderer should use the canonical section structure.

Do not invent new sections.

Expected sections:

1. Contact
2. Summary
3. Skills
4. Experience
5. Projects
6. Education
7. Achievements

Adapt ordering only if the existing ResumeDocument or architecture already defines a canonical ordering.

---

# 10. CONTACT RENDERING

Render available contact information:

- name
- professional title if represented
- location
- email
- phone
- GitHub
- LinkedIn
- portfolio
- other supported professional links

Do not invent missing information.

Do not display empty placeholders.

Do not show raw internal evidence metadata.

Links should be clean and readable.

---

# 11. SUMMARY RENDERING

Render the actual canonical summary.

Do not:

- rewrite it
- shorten it
- improve it
- score it
- call AI

Phase 6 only displays the current ResumeDocument.

---

# 12. SKILLS RENDERING

Render the existing structured skills.

Use clean categories where the ResumeDocument already provides them.

Example:

```text
Frontend
React · Next.js · TypeScript · Tailwind CSS

Backend
Node.js · Express · REST APIs · MongoDB
```

Do not add technologies.

Do not invent categories if the canonical document does not support them.

---

# 13. EXPERIENCE RENDERING

Render each experience entry with:

- job title
- company
- location if available
- dates
- bullets

Preserve the actual content.

Phase 5-approved changes must appear here automatically because the renderer reads ResumeDocument.

---

# 14. PROJECT RENDERING

Render each project with:

- project name
- description
- technologies
- dates if available
- bullets
- repository link
- live/demo link

Do not invent links.

Do not invent technologies.

---

# 15. EDUCATION RENDERING

Render:

- degree
- field
- institution
- dates
- GPA if present
- honors if present

Do not invent GPA or honors.

Do not render empty fields.

---

# 16. ACHIEVEMENTS RENDERING

Render:

- achievement
- certification
- award
- issuer
- date
- verification URL if supported

Do not invent credentials.

---

# 17. SECTION PREVIEW

The candidate must be able to visually inspect an individual section.

Example:

```text
Resume Studio
      ↓
Experience
      ↓
Visual Preview
```

When selecting Experience, visually highlight the corresponding section in the resume preview.

For example:

```text
┌──────────────────────────────────────────────┐
│ Resume Preview                               │
│                                              │
│ SUMMARY                                      │
│ ...                                          │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ EXPERIENCE                         ←     │ │
│ │ Software Developer                       │ │
│ │ Company · 2025–Present                   │ │
│ │ • Built...                               │ │
│ │ • Developed...                           │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ PROJECTS                                     │
│ ...                                          │
└──────────────────────────────────────────────┘
```

The selected section should be visually indicated without excessive decoration.

---

# 18. ANALYSIS + PREVIEW EXPERIENCE

Integrate the Phase 4/5 experience with the new renderer.

Preferred conceptual layout:

```text
┌──────────────────────┬──────────────────────────┐
│ Resume Analysis      │ Live Resume              │
│                      │                          │
│ Experience           │ HIMANSHU KUMAR          │
│ 68 / 100             │ Full Stack Developer     │
│                      │                          │
│ ✓ Action writing     │ SUMMARY                  │
│ ✓ Structure          │ ...                      │
│ ⚠ Metrics            │                          │
│                      │ EXPERIENCE               │
│ [Improve with AI]    │ ...                      │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

However:

Do NOT force a dense two-column layout on mobile.

On mobile:

```text
Analysis
   ↓
Resume Preview
```

---

# 19. SCORE + VISUAL SECTION RELATIONSHIP

Phase 6 may visually connect:

```text
Experience — 68/100
```

to:

```text
Experience section in the resume preview
```

For example, clicking the Experience score can scroll/highlight the Experience section.

But do NOT put:

```text
68/100
```

inside the actual resume document itself.

The score is Resume Studio UI metadata.

The resume should remain a professional resume.

---

# 20. VERY IMPORTANT — DO NOT POLLUTE THE RESUME

Never render these inside the resume:

- score
- tier
- weight
- priority
- "needs attention"
- AI badge
- evidence badge
- scoring rules
- ATS score
- internal IDs

The preview must look like an actual resume.

---

# 21. RESPONSIVE PREVIEW

The preview must work on:

- desktop
- laptop
- tablet
- mobile

On desktop, make the resume visually resemble a page.

On mobile, scale/reflow it intelligently.

Do NOT make the candidate pinch-zoom through an unusably tiny resume.

The preview should remain readable.

---

# 22. PAGE PROPORTIONS

Use a sensible resume page ratio.

The visual preview should feel like:

```text
A4 / Letter-style professional document
```

Do not hard-code the UI to one physical paper size if the future architecture expects configurable page sizes.

For Phase 6, one sensible default is sufficient.

---

# 23. PRINT-FRIENDLY CSS

Even though PDF export is deferred, the HTML preview should be structurally compatible with future print/export.

Use:

- predictable spacing
- page-like dimensions
- print-safe typography
- no dependent hover content
- no essential information hidden by CSS

Do NOT implement the PDF exporter yet.

---

# 24. FONT STRATEGY

Inspect existing project fonts first.

Use a professional, readable font.

Avoid loading large unnecessary font packages.

If custom fonts already exist in the project, reuse them.

Do not introduce multiple font families unnecessarily.

---

# 25. TEMPLATE ARCHITECTURE — FUTURE READY

Do NOT implement the full template system.

But structure the renderer so that later it can accept something conceptually like:

```ts
ResumeTemplateConfig {
  id
  typography
  spacing
  colors
  sectionStyle
  headerStyle
  layout
}
```

Do NOT add every field unless the repository architecture requires it.

For Phase 6:

```text
DefaultTemplate
        ↓
ResumeRenderer
        ↓
ResumeDocument
```

The template config should be minimal and internal if necessary.

---

# 26. IMPORTANT — NO DUPLICATE CONTENT STATE

Do NOT store rendered text separately.

Do not create:

```text
previewSummary
previewExperience
previewSkills
```

The renderer should derive everything directly from ResumeDocument.

---

# 27. LIVE UPDATE

When Phase 5 approves an AI improvement:

```text
ResumeDocument changes
        ↓
Renderer re-renders
```

The candidate should see the updated section immediately.

No page refresh should be required if the existing state architecture supports reactive updates.

Do not introduce complex state management solely for this.

---

# 28. VISUAL CHANGE FEEDBACK

When an approved section changes, it is acceptable to briefly highlight the updated section.

Example:

```text
Experience
Updated
```

Then return to the normal resume appearance.

Do not add distracting animations.

---

# 29. SECTION NAVIGATION

The Resume Studio should allow:

```text
Contact
Summary
Skills
Experience
Projects
Education
Achievements
```

to navigate/highlight the corresponding visual section.

Do not create a second navigation system unrelated to the existing Resume Studio.

---

# 30. ACCESSIBILITY

Ensure:

- semantic structure
- accessible section navigation
- keyboard support
- visible focus
- readable text
- meaningful labels
- appropriate ARIA
- no color-only state indicators

---

# 31. PERFORMANCE

The renderer must be lightweight.

Do not add:

- heavy canvas rendering
- WebGL
- large chart libraries
- expensive animation systems
- unnecessary dependencies

Standard React/HTML/CSS is preferred.

If a PDF renderer is already installed, do not automatically use it for the interactive editor preview unless the existing architecture specifically requires it.

Interactive preview should remain responsive.

---

# 32. IMPORTANT PDF SEPARATION

Phase 6 is NOT PDF export.

The architecture should be:

```text
ResumeDocument
      │
      ├──→ HTML Resume Renderer
      │
      └──→ Future PDF Renderer
```

Do not couple the candidate-facing interactive editor to PDF generation.

---

# 33. SECURITY

Resume content is user-controlled data.

Render it safely.

Do not use unsafe HTML injection for resume fields unless the project has an established sanitized rendering pipeline.

Prefer normal React text rendering.

URLs must be validated/canonicalized according to existing utilities.

---

# 34. EMPTY STATES

If a section has no content:

Do not render an ugly empty box.

Either:

- omit the empty section from the resume, or
- follow the existing ResumeDocument rendering rules.

The final resume should look intentional.

---

# 35. LONG CONTENT

Handle long:

- summaries
- project descriptions
- experience bullets
- skill lists
- achievement descriptions

without breaking the layout.

Avoid:

- clipped text
- overlapping content
- huge whitespace
- horizontal overflow

---

# 36. BROWSER ACCEPTANCE FLOW

Use a real uploaded ResumeDocument.

Test:

```text
Open Resume Studio
        ↓
See Resume Health
        ↓
Open Resume Preview
        ↓
See complete professional resume
        ↓
Click Experience
        ↓
Experience section highlights
        ↓
Open AI editor
        ↓
Approve an improvement
        ↓
Return to preview
        ↓
Updated Experience appears
```

Also verify:

```text
Summary
Skills
Projects
Education
Achievements
Contact
```

render correctly.

---

# 37. IMPORTANT VISUAL QUALITY TEST

Ask:

> Does this actually look like a resume?

If the answer is no, fix it.

It should NOT look like:

- dashboard
- profile card
- web landing page
- AI chat
- analytics report

It should look like a professional resume document.

---

# 38. ATS-CONSCIOUS VISUAL DESIGN

The default layout should remain structurally simple and ATS-conscious:

Prefer:

- normal text
- standard headings
- straightforward sections
- readable hierarchy
- standard links
- simple columns or single-column layout where appropriate

Avoid depending on:

- images
- charts
- icons for essential information
- text embedded inside graphics
- decorative visualizations

Do NOT claim ATS compatibility as a measured score.

ATS validation belongs to a later phase.

---

# 39. TESTING

Add tests for:

### Renderer

- all sections render
- optional fields are handled
- empty sections don't break layout
- links render correctly
- long content does not crash

### Data integrity

- renderer reflects ResumeDocument
- no duplicate content model exists
- updated ResumeDocument appears in preview

### Section navigation

- selecting a section highlights the corresponding section
- keyboard navigation works

### Regression

Run ALL existing Phase 0–5 tests.

---

# 40. TYPE CHECKING

Run:

```bash
npx tsc --noEmit
```

for client and server using repository conventions.

Do not use `any` to bypass issues.

---

# 41. BROWSER VERIFICATION

Actually inspect the rendered resume in a browser.

Verify:

### Desktop

- professional page appearance
- correct spacing
- readable typography
- complete content
- no clipping

### Mobile

- readable content
- no page-level horizontal overflow
- useful section navigation

### Real data

- actual ResumeDocument content appears
- no fake data
- no placeholder content presented as real

---

# 42. DOCUMENTATION

Create/update the appropriate Phase 6 documentation.

Document:

- renderer architecture
- ResumeDocument → renderer flow
- section rendering
- section highlighting
- responsive behavior
- future template compatibility
- PDF separation
- accessibility
- performance
- Phase 6 boundaries

Update:

```text
doc/resume-studio/README.md
```

to reflect the actual Phase 6 status.

Do not mark Phase 6 complete until browser verification passes.

---

# 43. GIT

Before completion:

1. Inspect changed files.
2. Remove debug code.
3. Remove temporary data.
4. Ensure no mock resume is being rendered for real users.
5. Ensure Phase 3 scoring is untouched.
6. Ensure Phase 5 AI logic is untouched except where required for renderer integration.
7. Commit Phase 6.
8. Report commit hash.
9. Push according to repository conventions.

---

# 44. FINAL REPORT

Report:

## Implementation

- renderer components
- section components
- preview integration
- section highlighting/navigation
- ResumeDocument integration
- responsive behavior

## Architecture

Confirm:

```text
ResumeDocument
      ↓
ResumeRenderer
```

and:

```text
No duplicate resume content model
```

## Testing

Report:

- Phase 6 tests
- full regression tests
- client TypeScript
- server TypeScript
- lint/build

## Browser

Report:

- desktop verification
- mobile verification
- real resume verification
- section navigation
- Phase 5 approved content reflected in preview

## Git

Report:

- commit hash
- push status

---

# 45. STRICT BOUNDARY VERIFICATION

Before completion explicitly confirm:

```text
ResumeDocument canonical: YES
HTML visual renderer: YES
Section preview: YES
Section highlighting: YES
Live reflection of approved changes: YES

AI rewriting added: NO
New AI provider: NO
Scoring engine modified: NO
Client-side scoring: NO
Resume builder: NO
Drag-and-drop: NO
Template marketplace: NO
Full template system: NO
PDF export: NO
ATS validation: NO
JD matching: NO
Copilot: NO
```

---

# 46. HARD STOP

When Phase 6 is complete:

STOP.

Do NOT continue into Phase 7.

The next phase will later introduce:

```text
Visual Resume Builder
+
Template System
+
Layout Controls
+
Typography
+
Spacing
+
Section Ordering
```

But Phase 6 must first establish a stable visual renderer.

---

# FINAL PRINCIPLE

Phase 6 turns:

```text
STRUCTURED RESUME DATA
```

into:

```text
A REAL VISUAL RESUME
```

The same canonical ResumeDocument must power everything:

```text
                  ResumeDocument
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Analysis      AI Editor     Renderer
                                      │
                                      ↓
                               Visual Resume
                                      │
                                      ↓
                              Future Builder
                                      │
                                      ↓
                                Future PDF
```

Do not create separate versions of the resume.

Build the renderer correctly now so every future visual/template/export feature can use it.
