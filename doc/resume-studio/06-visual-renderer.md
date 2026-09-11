# Phase 6: Visual Resume Renderer & Section Preview
## Resume Studio — Turn Resume Intelligence Into a Real Visual Resume

---

## 1. Overview & Architecture

Phase 6 introduces the dedicated visual presentation layer for Skillezo Resume Studio. It transforms the canonical `ResumeDocument` into a real, professional, ATS-conscious, print-friendly visual resume with interactive section navigation and live reactive preview updates.

```
                  ResumeDocument (Single Source of Truth)
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ↓                         ↓                         ↓
7-Section Intelligence      Evidence-Locked AI        Visual Resume Renderer
(Deterministic Scoring)     (Section Improvement)     (A4 Document Preview)
                                    │                         │
                                    └───────────────┬─────────┘
                                                    ↓
                                         Live Reactive Preview
                                        (Updates upon approval)
```

---

## 2. Core Principles & Boundaries

### A. Canonical Data Invariant
- The renderer consumes `ResumeDocument` directly.
- **Zero duplicate content models**: No `VisualResumeDocument`, `AIResumeDocument`, or `PreviewResumeDocument`.
- Derives all visual sections strictly from the document.

### B. Pure Presentation Layer
- **Zero Pollution**: Scores (e.g. `68/100`), tiers, weights, AI badges, evidence tags, and deduction rules are **never** rendered inside the resume document itself.
- Visuals strictly resemble a real-world, desktop/print-ready ATS document.

### C. PDF Separation
- Phase 6 implements the HTML/CSS presentation layer. Full PDF export (e.g., `@react-pdf/renderer`) is cleanly decoupled and deferred to Phase 9+.

---

## 3. Component Hierarchy

All visual renderer components are organized under `client/components/resume-studio/renderer/`:

```
client/components/resume-studio/renderer/
├── ResumeRenderer.tsx          # Master paper container, scroll-sync, highlight controller
├── ResumeHeader.tsx            # Contact details, target role, verified links (GitHub, LinkedIn)
├── SummarySection.tsx          # Professional summary paragraph
├── SkillsSection.tsx           # Technical skills grouped by domain category
├── ExperienceSection.tsx       # Roles, companies, dates, impact bullet points
├── ProjectsSection.tsx         # Projects, tech stack, bullet points, live/repo links
├── EducationSection.tsx        # Institutions, degrees, dates, GPA, honors
├── AchievementsSection.tsx     # Certifications, issuers, dates, credentials
└── index.ts                    # Barrel export
```

---

## 4. Interactive Section Navigation & Highlighting

Candidates can seamlessly navigate between analysis and the visual resume:
1. **Section Selection**: Selecting any section (e.g., `Work Experience`) in the Studio overview or detail view highlights the section in the visual document with a subtle focus ring (`ring-2 ring-indigo-500/40 bg-indigo-50/30`).
2. **Interactive Clicks**: Clicking on any section directly inside the visual resume selects that section in the studio and provides a one-click gateway to the Evidence-Locked AI Improvement workspace.
3. **Smooth Scroll Sync**: Automatically scrolls the focused section into viewport view.

---

## 5. View Modes in Resume Studio

Resume Studio now provides 3 viewing experiences:
1. **Analysis & AI (`viewMode = 'analysis'`)**: Candidate overview health dashboard and section-by-section AI improvement workspace.
2. **Visual Resume (`viewMode = 'visual'`)**: Dedicated full visual resume canvas with quick jump navigation bar across all 7 sections.
3. **Split View (`viewMode = 'split'`)**: Side-by-side desktop layout with Analysis on the left and Live Resume Preview on the right, updating reactively in real time.

---

## 6. Live Synchronization

When a candidate approves an AI improvement in Phase 5:
1. The updated `ResumeDocument` is saved in state / backend.
2. The visual renderer instantly re-renders the modified section without page refreshes.
3. The deterministic score is re-analyzed and displayed in the studio notification banner.
