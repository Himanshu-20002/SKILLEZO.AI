# Phase 7: Resume Builder + Templates + Presentation Controls
## Resume Studio — Turn Resume Intelligence Into a Live Configurable Resume Builder

---

## 1. Overview & Architecture

Phase 7 expands the Phase 6 visual resume presentation layer into an interactive candidate-facing **Resume Builder**. Candidates can choose ATS-conscious templates, reorder sections, and adjust typography and spacing while keeping `ResumeDocument` as the sole canonical source of resume content.

```
                 ResumeDocument (Single Source of Truth)
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Intelligence      AI Editor      Builder
        │              │              │
   Score/Analysis   Approved Edits   Templates (Classic, Modern, Compact)
                                       │
                                  Style Controls (Typography, Spacing, Margins)
                                       │
                                  Section Reordering
                                       │
                                       ↓
                              ResumeRenderer
                                       │
                                       ↓
                              Visual Resume
                                       │
                                       ↓
                              Future PDF Export (Phase 9+)
```

---

## 2. Core Invariant: Content vs. Presentation

- **ResumeDocument owns content**: Candidate name, contact details, summaries, work experience, projects, skills, education, certifications, facts, and evidence.
- **ResumeBuilderConfig owns presentation**: Template ID, font family, base font size, line height, section spacing, page margins, section order, density preset, accent style.
- **Zero Duplicate Content Models**: No `VisualResumeDocument`, `BuilderResumeDocument`, or `PreviewResumeDocument`.

---

## 3. Templates Included

1. **Classic Executive (`classic`)**:
   - Traditional academic & executive hierarchy with clean dividing rules and formal structure.
   - Serif headings, prominent role titles, balanced margins.
2. **Modern Professional (`modern`)**:
   - Clean sans-serif design with subtle accent borders and crisp contemporary typography.
   - Tech-forward category organization, border accents.
3. **Compact High-Density (`compact`)**:
   - Space-optimized layout with inline metadata designed to fit extensive experience cleanly onto fewer pages without clipping.

---

## 4. Presentation Controls

- **Section Reordering**: Reorder body sections (`summary`, `skills`, `experience`, `projects`, `education`, `achievements`) with accessible Move Up / Move Down controls. Header/contact remains anchored first.
- **Typography**: Curated font families (`sans`, `serif`, `mono`), bounded font sizes (`small`, `default`, `large`), line heights (`compact`, `comfortable`, `relaxed`).
- **Spacing & Layout**: Section spacing (`compact`, `balanced`, `comfortable`), page margins (`compact`, `normal`, `wide`), density presets (`compact`, `balanced`, `comfortable`).
- **Accent Styles**: `neutral` (slate), `professional` (navy/indigo), `minimal` (teal).

---

## 5. API & Persistence

- `GET /api/resumes/:resumeId/builder`: Retrieves saved builder configuration.
- `PUT /api/resumes/:resumeId/builder`: Validates with Zod schema and persists configuration safely without touching or overwriting `ResumeDocument`.
- Auto-save: Client applies debounced persistence (600ms) with visual status indicators.
