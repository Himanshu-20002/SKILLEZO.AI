# SKILLEZO AI — PHASE 5.5
# Resume Studio UX Transformation & Product Experience Upgrade

## STATUS

Phase 5.5 — Resume Studio UX Transformation

This phase is a **frontend/product UX transformation** of the existing Resume Studio.

The objective is NOT to rebuild Resume Studio, replace its architecture, or add another backend system.

The objective is:

> **Transform the current Resume Studio from a simple resume editor into a polished, modern, professional Resume Workspace while preserving 100% of the existing functionality, data flow, domain boundaries, APIs, AI systems, ATS systems, rendering system, and Phase 1–5 invariants.**

The current Studio works technically, but visually and experientially it still feels like a conventional editor.

The new experience should feel like a premium career/resume workspace.

---

# 1. CRITICAL RULE — DO NOT BREAK EXISTING FUNCTIONALITY

Before modifying anything:

1. Inspect the complete existing Resume Studio implementation.
2. Inspect:
   - `useResumeStudio`
   - `ResumeStudioHeader`
   - `ResumeEditorPanel`
   - `ResumePreviewPanel`
   - `ResumeInsightsPanel`
   - `ResumeStudioWorkspace`
   - `LiveResumeCanvas`
   - `ResumeRenderer`
   - `ResumeBuilderControls`
   - `SectionAiWorkspace`
   - `AtsDiagnosticsView`
   - existing modal components
   - resume service/API calls
   - existing types
   - existing URL state
3. Understand every existing interaction.
4. Create a component/interaction map before changing UI.
5. Reuse existing business logic wherever possible.

### DO NOT:

- rewrite the backend
- change ResumeModel semantics
- change ProfileModel semantics
- change Career Profile ownership
- replace ResumeDocument AST
- replace ResumeRenderer
- replace ATS algorithms
- replace AI systems
- replace ModelGateway
- replace evidence architecture
- replace `useResumeStudio`
- create another resume state-management system
- introduce another Resume collection
- change Master Resume invariants
- change Tailored Variant semantics
- remove existing features because they do not fit the new UI

---

# 2. EXISTING ARCHITECTURE MUST REMAIN

The existing hierarchy remains:

```text
Career Profile
      ↓
Master Resume
      ↓
Resume Portfolio
      ↓
Master / Variants
      ↓
Resume Studio
```

Inside Studio:

```text
ResumeModel
      ↓
ResumeDocument AST
      ↓
ResumeRenderer
      ↓
LiveResumeCanvas
```

Career facts remain owned by:

```text
ProfileModel
```

Presentation remains owned by:

```text
ResumeModel
templateConfig / builderConfig
```

AI remains evidence-grounded.

ATS remains the existing implementation.

The Studio is being transformed at the **UX/presentation layer**.

---

# 3. PRODUCT OBJECTIVE

The current Studio feels like:

```text
Resume Editor
```

Transform it into:

```text
Resume Workspace
```

The user should feel like they are:

> Building, improving, reviewing, and preparing a professional resume.

Not simply editing fields.

The workspace should make three things immediately clear:

```text
1. WHAT AM I EDITING?
2. WHAT DOES MY RESUME LOOK LIKE?
3. WHAT SHOULD I IMPROVE?
```

---

# 4. TARGET EXPERIENCE

Use the provided UX concept as the visual/product direction.

The target structure is approximately:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ← Resumes   ⭐ Master Resume        Saved ✓      Preview  Export     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ RESUME NAVIGATION       A4 RESUME                 AI INSIGHTS       │
│                                                                     │
│ ⭐ MASTER               ┌───────────────┐          ATS 92            │
│                         │               │                            │
│ Full Stack              │               │          Match 88          │
│ Stripe                  │    RESUME     │                            │
│ ATS 92                  │               │          Impact 84         │
│                         │               │                            │
│ Frontend                │               │          ─────────         │
│ Google                  │               │          3 Improvements   │
│ ATS 89                  │               │                            │
│                         └───────────────┘          [Review]           │
│ DevOps                                                               │
│ AWS                                                                    │
│ ATS 86                                                               │
│                                                                     │
│ + New Variant                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                         Page 1 / 2                                   │
└─────────────────────────────────────────────────────────────────────┘
```

This is a **visual direction**, not a requirement to literally copy the ASCII layout.

Use the existing application's design system and components.

---

# 5. CORE UX PRINCIPLE

The new Studio should have three persistent zones:

## LEFT — Resume Navigation / Structure

The left area should provide context and navigation.

It should allow the user to understand:

- current resume
- Master vs Variant
- resume sections
- section status
- section navigation
- important actions

Example:

```text
RESUME

⭐ Master Resume

SECTIONS

✓ Profile
✓ Summary
⚠ Experience
✓ Projects
✓ Education
⚠ Skills
✓ Links

DOCUMENT

2 pages
ATS 92
```

Do NOT duplicate data unnecessarily.

If the existing Studio already has section health/status data, reuse it.

---

# 6. CENTER — RESUME CANVAS

The center should remain the visual focus.

Use:

- `LiveResumeCanvas`
- `ResumeRenderer`
- `ResumeDocument`

Do not rebuild the rendering engine.

Improve the presentation around it.

The canvas should feel like a professional document workspace.

Add where technically appropriate:

- A4 page framing
- subtle page shadow
- page spacing
- page count
- zoom controls
- fit-to-width
- scroll position preservation
- section highlighting
- cleaner empty space
- clear document boundaries
- professional toolbar treatment

The actual resume content must continue to be rendered by the existing renderer.

---

# 7. RIGHT — AI / RESUME INTELLIGENCE

The right panel should become a more useful intelligence surface.

Reuse:

- `AtsDiagnosticsView`
- `SectionAiWorkspace`
- existing AI services
- existing ATS calculations
- existing scoring
- existing recommendations

Do not create new AI logic.

The panel should visually communicate:

```text
RESUME HEALTH

ATS
92

ROLE MATCH
88

IMPACT
84
```

If the existing system has different score semantics, use the actual existing scores.

### IMPORTANT

Do NOT invent scores.

Do NOT introduce a fake unified "Resume Quality Score".

Keep the existing explainable scoring model.

---

# 8. AI INSIGHTS UX

Transform the existing AI area from a passive panel into an actionable workspace.

Example:

```text
AI INSIGHTS

3 improvements available

⚠ Experience
Your bullet could be more impactful

[ Review ]

⚠ Skills
Some relevant skills may be missing

[ Review ]

✓ Summary
Strong alignment

[ View ]
```

Clicking an insight should navigate to the appropriate section.

Reuse existing AI proposal/review mechanisms.

Do not create a parallel proposal system.

---

# 9. CONTEXTUAL SECTION EDITING

The Studio should feel more interactive.

When a user selects:

```text
Experience
```

the UI should make Experience the active context.

When a user selects:

```text
Projects
```

the editor should switch context accordingly.

Use the existing:

- `selectedSection`
- `activeSubMode`

state where appropriate.

Do not create duplicate state.

---

# 10. SECTION EDITOR EXPERIENCE

Improve the visual treatment of the existing editor.

The current editor functionality must remain.

Transform the presentation into clearer cards/blocks.

Example:

```text
EXPERIENCE

Senior Software Engineer
Company Name
2024 — Present

Achievements

• Built ...
• Improved ...
• Reduced ...

+ Add achievement

AI ACTIONS

[ Improve impact ]
[ Make concise ]
[ Review ]
```

These buttons must connect to existing functionality where available.

Do NOT implement fake actions.

If an action doesn't currently exist, do not invent backend behavior just to make the UI look complete.

---

# 11. MASTER RESUME EXPERIENCE

Master Resume must remain visually distinct.

Use the existing Master semantics.

Example:

```text
⭐ MASTER RESUME

Canonical career presentation

Profile synced ✓

[ Open Career Profile ]
[ Sync ]
```

Do not allow Studio presentation edits to modify Career Profile facts.

Preserve the existing invariant:

```text
Presentation edit
        ↓
ResumeModel
        ✕
ProfileModel
```

---

# 12. VARIANT EXPERIENCE

For a tailored variant:

```text
🎯 FULL STACK ENGINEER

Variant

Based on Master Resume

Target:
Full Stack Engineer
Stripe

Saved ✓
```

Make it visually obvious that this is a variant.

Do not imply that it is the canonical source.

The variant remains an independent presentation artifact.

---

# 13. TOP HEADER

Redesign the existing header.

Target structure:

```text
← Resumes

⭐ Master Resume
or
🎯 Full Stack Engineer

        Saved ✓
        Preview
        Export
        ⋮
```

Existing functionality must remain available:

- back to portfolio
- resume selector
- save state
- stale Master state
- sync
- PDF export
- upload
- delete where permitted
- existing modals

Do not remove existing actions.

You may reorganize them.

---

# 14. SAVE EXPERIENCE

Preserve the existing:

```text
saved
saving
unsaved
error
```

state.

Improve the visual treatment.

Examples:

```text
✓ Saved
```

```text
Saving...
```

```text
Unsaved changes
```

```text
⚠ Save failed
```

Do not change the underlying autosave implementation unless necessary for a UI bug.

---

# 15. MASTER STALE STATE

Preserve the existing Master stale logic.

When ProfileModel has changed:

```text
Career Profile Updated

New career facts are available.

[ Sync Master ]
```

This must remain connected to the existing synchronization implementation.

Do not replace the backend logic.

---

# 16. RESUME SELECTOR

The current resume selector should become more useful.

Instead of a generic dropdown, provide clear grouping:

```text
MASTER

⭐ Master Resume
   ATS 92

VARIANTS

Full Stack — Stripe
   ATS 92

Frontend — Google
   ATS 89

DevOps — AWS
   ATS 86

+ Create Variant
```

Only show information already available from existing portfolio/resume data.

Do not perform additional expensive API calls unnecessarily.

---

# 17. PREVIEW MODE

The header should provide a focused preview experience.

Example:

```text
[ Edit ] [ Preview ]
```

Preview mode should allow the user to focus on the actual resume without the editing UI overwhelming the document.

Reuse:

```text
LiveResumeCanvas
```

Do not build another renderer.

---

# 18. RESPONSIVE UX

Desktop:

```text
Left Navigation | Resume | AI Insights
```

Tablet:

```text
Navigation
Resume + Insights
```

Mobile:

```text
[ Resume ] [ Edit ] [ Insights ]
```

The resume itself should remain readable.

Do not simply stack three huge panels vertically.

---

# 19. VISUAL DESIGN DIRECTION

The design should feel:

- premium
- professional
- calm
- modern
- information-dense but not cluttered
- career-focused
- minimal
- polished

Avoid:

- excessive gradients
- excessive glassmorphism
- huge cards
- oversized headings
- unnecessary animations
- excessive colors
- dashboard-style visual noise
- generic SaaS template appearance

The resume itself should remain the visual hero.

Use the existing SKILLEZO design system where available.

Do not introduce an unrelated design language.

---

# 20. COLOR SYSTEM

Use color semantically.

Examples:

```text
Master → subtle gold/accent
Success → existing success color
Warning → existing warning color
Error → existing error color
AI → existing AI accent
Neutral → existing surface colors
```

Do not introduce random new colors.

Do not hardcode dozens of colors.

Reuse Tailwind/design tokens already present in the project.

---

# 21. MICRO-INTERACTIONS

Add subtle interactions where useful:

- section selection
- panel transitions
- hover states
- save state transitions
- AI insight expansion
- resume selection
- active section highlighting
- preview focus
- modal transitions

Keep animations fast and subtle.

Do not add animation everywhere.

Respect reduced-motion preferences.

---

# 22. DO NOT OVERBUILD

This phase is NOT:

- AI Job Tailoring
- JD ingestion
- Application tracking
- Career GPS redesign
- Career Profile redesign
- Resume Gallery redesign
- new AI architecture
- new ATS engine
- new ResumeDocument AST
- new renderer
- DOCX support
- new database models
- new resume APIs

This is:

> **Resume Studio UX transformation.**

---

# 23. FUNCTIONALITY PRESERVATION CHECKLIST

Before completion, verify every existing action still works.

## Resume lifecycle

- [ ] Load Master Resume
- [ ] Load variant
- [ ] Switch resume
- [ ] Create variant through existing Portfolio flow
- [ ] Delete variant
- [ ] Master cannot be deleted
- [ ] Rename variant
- [ ] Back to Portfolio

## Editing

- [ ] Edit resume presentation
- [ ] Change template
- [ ] Change typography
- [ ] Change spacing
- [ ] Change colors/theme
- [ ] Change section ordering
- [ ] Hide/show sections
- [ ] Edit supported content fields
- [ ] Existing controls continue working

## Saving

- [ ] Autosave
- [ ] Saved state
- [ ] Saving state
- [ ] Unsaved state
- [ ] Error state

## Master

- [ ] Master detection
- [ ] Master badge
- [ ] Stale detection
- [ ] Sync Master
- [ ] Profile changes preserved
- [ ] Presentation formatting preserved after sync

## AI

- [ ] Existing AI Optimize
- [ ] Existing Section AI
- [ ] Existing proposal workflow
- [ ] Existing evidence constraints
- [ ] Existing accept/reject behavior

## ATS

- [ ] ATS diagnostics
- [ ] Existing score
- [ ] Existing recommendations
- [ ] Existing issue navigation
- [ ] Refresh/recalculation behavior

## Export

- [ ] PDF export
- [ ] Existing PDF behavior
- [ ] Existing renderer
- [ ] Correct page count

## Upload

- [ ] Existing upload flow
- [ ] Existing ingestion behavior
- [ ] Existing validation
- [ ] Existing errors

---

# 24. STATE MANAGEMENT RULE

Continue using:

```text
useResumeStudio
```

as the primary Studio orchestration layer.

Do not create:

```text
useResumeStudioV2
useResumeEditor
useResumeWorkspaceState
```

unless there is a genuine architectural requirement.

Prefer adding small selectors/helpers to the existing hook if needed.

UI components should remain presentational wherever possible.

---

# 25. URL STATE

Preserve:

```text
?resumeId=<id>
```

Deep linking must continue to work.

If adding new URL state, keep it minimal.

Possible:

```text
?resumeId=<id>&view=preview
```

only if it provides real value and does not create routing complexity.

---

# 26. PERFORMANCE

Do not sacrifice performance for visual effects.

Requirements:

- avoid unnecessary rerenders
- keep `LiveResumeCanvas` stable
- avoid remounting the entire resume on panel interaction
- lazy-load heavy AI/modals where already appropriate
- preserve existing autosave debounce
- avoid duplicate API requests
- preserve existing loading behavior

The Studio should feel faster, not slower.

---

# 27. ACCESSIBILITY

Maintain:

- keyboard navigation
- visible focus states
- semantic buttons
- accessible dialogs
- proper labels
- tooltips where icons are ambiguous
- sufficient contrast
- reduced motion support
- screen-reader meaningful labels

Do not use icon-only controls without accessible labels.

---

# 28. IMPLEMENTATION STRATEGY

Work in this order.

## Step 1 — Audit

Inspect the current Studio implementation.

Document:

```text
Component
↓
Responsibility
↓
Existing state
↓
Existing actions
↓
Existing API calls
```

Do not modify code yet.

---

## Step 2 — UX Structure

Implement the new workspace shell:

```text
StudioHeader
ResumeNavigation
ResumeCanvas
ResumeIntelligence
```

Reuse existing components internally.

---

## Step 3 — Resume Canvas Experience

Improve the visual presentation of:

```text
LiveResumeCanvas
```

without modifying the renderer.

---

## Step 4 — Resume Navigation

Create a polished navigation layer for:

- Master
- Variants
- Sections
- document status

Reuse existing state.

---

## Step 5 — Intelligence Panel

Transform the existing AI/ATS area into:

```text
Resume Intelligence
```

while continuing to use existing systems.

---

## Step 6 — Contextual Editing

Improve selected-section editing and visual hierarchy.

---

## Step 7 — Responsive Layout

Implement:

```text
Desktop
Tablet
Mobile
```

without losing functionality.

---

## Step 8 — Polish

Add:

- transitions
- hover states
- empty states
- loading states
- save states
- tooltips
- keyboard support
- visual consistency

---

# 29. COMPONENT ARCHITECTURE

Prefer the existing component architecture.

If necessary, evolve it toward:

```text
client/components/resume-studio/

ResumeStudioHeader
ResumeStudioWorkspace
ResumeStudioSidebar
ResumeStudioCanvas
ResumeStudioInsights
ResumeSectionNavigator
ResumeSectionEditor
ResumeHealth
ResumeScoreCard
ResumeInsightCard
ResumeStudioToolbar
```

Do not split components purely to reduce file size.

Each component should have a clear UX responsibility.

---

# 30. IMPORTANT: DO NOT CREATE DUPLICATE LOGIC

Before implementing any feature:

Search the repository.

If functionality already exists:

```text
use it
```

Do not recreate it.

Examples:

If ATS calculation exists:
reuse it.

If AI proposal exists:
reuse it.

If PDF export exists:
reuse it.

If resume saving exists:
reuse it.

If Master sync exists:
reuse it.

If section navigation exists:
reuse or improve it.

---

# 31. TESTING

Add/update frontend tests for the new UX.

At minimum verify:

## Rendering

- Master Studio renders
- Variant Studio renders
- correct badge appears
- correct resume name appears
- navigation renders
- intelligence panel renders
- canvas renders

## Interactions

- resume selection works
- section selection works
- preview mode works
- existing edit actions still work
- existing AI actions still work
- ATS navigation works
- export still works
- sync still works
- delete protection still works

## State

- saved state
- saving state
- unsaved state
- error state
- stale Master state

## Responsive

Test:

- desktop
- tablet
- mobile

---

# 32. REGRESSION REQUIREMENT

Run:

```bash
cd server
npx vitest run
npm run type-check
```

and:

```bash
cd client
npx tsc --noEmit
```

Run the existing client test suite.

Do not accept any regression.

The Phase 5 baseline must remain green.

---

# 33. MANUAL QA

## Master

```text
Open Portfolio
→ Open Master
→ Edit presentation
→ Save
→ Reload
→ Verify changes persist
```

## Variant

```text
Portfolio
→ Create Variant
→ Open Variant
→ Edit
→ Save
→ Reload
→ Verify variant persists
```

## Master safety

```text
Edit Master presentation
→ Verify ProfileModel is untouched
```

## Sync

```text
Update Career Profile
→ Open Studio
→ Verify stale state
→ Sync
→ Verify facts update
→ Verify formatting remains
```

## AI

```text
Open section
→ AI Optimize
→ Review proposal
→ Accept/Reject
→ Verify existing workflow
```

## ATS

```text
Open ATS
→ View issue
→ Navigate to relevant section
```

## Export

```text
Export PDF
→ Verify PDF
→ Verify layout
→ Verify page count
```

---

# 34. SUCCESS CRITERIA

Phase 5.5 is successful only if BOTH are true:

## Architecture

Existing architecture remains intact.

AND

## User Experience

A user opening the Studio immediately notices that it is substantially different and more polished than the previous Studio.

The result must NOT feel like:

> "Same Studio, different sidebar."

It must feel like:

> **"This is a professional Resume Workspace."**

---

# 35. FINAL QUALITY BAR

Before declaring COMPLETE, compare the old and new Studio.

Ask:

## Visual

- Does the Studio feel substantially more premium?
- Is the resume clearly the visual centerpiece?
- Is the hierarchy obvious?
- Is Master vs Variant immediately understandable?
- Is AI/ATS information easier to understand?

## UX

- Can the user find sections faster?
- Can the user understand what needs attention?
- Can the user move between editing and preview naturally?
- Are actions easier to discover?
- Does the workspace feel less cluttered?

## Functionality

- Did anything disappear?
- Did any existing workflow change unexpectedly?
- Did any API behavior change?
- Did any domain invariant break?

If the answer to the last three is yes, fix it before completion.

---

# 36. DO NOT STOP AT COMPONENT REFACTORING

This is extremely important.

Do NOT report success because:

```text
"Created 5 new components."
```

Do NOT report success because:

```text
"Moved the sidebar."
```

Do NOT report success because:

```text
"Added a new Resume Portfolio."
```

The objective is a **visible product UX transformation**.

The user should be able to open Resume Studio and immediately see the difference.

---

# 37. DELIVERABLES

Implement the complete UX transformation.

Then provide:

```text
1. Files changed
2. Components created/modified
3. UX improvements
4. Functionality preserved
5. Tests added/updated
6. Regression results
7. Type-check results
8. Manual QA results
9. Any intentionally deferred items
```

Also update:

```text
doc/resume-studio/05.5-resume-studio-ux-transformation.md
```

with:

- UX architecture
- component responsibilities
- interaction model
- responsive behavior
- preserved functionality
- testing results
- known limitations

---

# FINAL INSTRUCTION

**Transform the existing Resume Studio.**

Do not rebuild the product.

Do not replace the architecture.

Do not remove functionality.

Do not create fake functionality.

Do not introduce a second state-management system.

Do not redesign the backend.

Do not redesign the AI engine.

Do not redesign the ATS engine.

Do not replace the renderer.

Instead:

> **Take the existing, functioning Resume Studio and turn it into a polished, modern, highly usable Resume Workspace with a strong three-zone experience: Resume Navigation → Resume Canvas → Resume Intelligence.**

The final result should be visually and experientially different from the current Studio while remaining completely compatible with the architecture and functionality delivered in Phases 1–5.

**Implement. Test. Verify. Then report.**
