# SKILLEZO — PHASE 4
# Resume Studio UX Foundation & Actionable Analysis
## Antigravity Implementation Prompt

---

## ROLE

You are implementing **Phase 4 of Skillezo Resume Studio**.

You are working inside the existing Skillezo repository. This is a production-oriented implementation task, not a prototype.

Your job is to implement **only Phase 4**, while preserving all completed work from Phases 0–3.

Before changing anything, inspect the repository, existing documentation, current branch/state, and the actual implementation of Phases 0–3.

Do not assume filenames, schemas, routes, components, or architecture from this prompt are identical to the repository. The repository and its canonical Resume Studio documentation are the source of truth.

---

# 1. PHASE 4 OBJECTIVE

Phase 3 established:

```text
ResumeDocument
      ↓
Resume Section Analysis
      ↓
Deterministic Resume Scoring
      ↓
Resume Studio UI
```

Phase 4 must turn the current score-oriented Resume Studio into a **clear, actionable analysis experience**.

The candidate should be able to understand:

1. How strong the resume currently is.
2. Which sections need attention first.
3. Why each section received its score.
4. Which specific signals/rules are causing weakness.
5. What kind of improvement would help.
6. What action the candidate can take next.

Phase 4 is an **UX and analysis presentation foundation**.

It is NOT the AI improvement phase.

It is NOT the editing phase.

It is NOT the resume builder phase.

It is NOT the PDF export phase.

---

# 2. HARD PHASE BOUNDARY

## DO NOT IMPLEMENT

Do not implement any of the following in Phase 4:

- AI/LLM calls
- Gemini/OpenAI/OpenRouter calls
- AI-generated resume rewriting
- AI suggestions
- automatic rewriting
- resume editing
- content mutation
- drag-and-drop resume builder
- template builder
- PDF generation
- LaTeX
- Typst
- PDF rendering
- ATS PDF validation
- job-description matching
- JD tailoring
- job-specific scoring
- Copilot
- automatic score manipulation
- invented resume facts
- invented metrics
- invented achievements
- changes to deterministic scoring formulas
- changes to section weights
- changes to scoring engine behavior
- replacing Phase 3 scores with UI-calculated scores

If a feature belongs to a later phase, leave it untouched.

---

# 3. NON-NEGOTIABLE ARCHITECTURAL RULE

Phase 3 scoring is now a **frozen contract**.

The UI must consume the existing deterministic scoring API.

The frontend must NOT independently calculate:

- overall score
- section scores
- component scores
- section weights
- rating tiers
- score percentages

Do not duplicate scoring logic in React.

Use the existing API/contracts.

Expected conceptual flow:

```text
ResumeDocument
      ↓
Phase 2 Section Analysis
      ↓
Phase 3 Deterministic Scoring
      ↓
Phase 4 Presentation / UX
```

Phase 4 may transform API data into display models, but it must not alter the underlying scores.

---

# 4. FIRST STEP — REPOSITORY AUDIT

Before implementation, inspect:

### Architecture/docs

- `doc/resume-studio/README.md`
- `doc/resume-studio/00-architecture.md`
- all existing Resume Studio phase documentation
- sprint/tracker documentation
- any Phase 3 scoring documentation

### Existing implementation

Find the actual implementations for:

- `ResumeDocument`
- Phase 1 ingestion/normalization
- Phase 2 section analysis
- Phase 3 scoring
- Resume Studio page
- resume service
- score API
- section-analysis API
- client types
- existing Resume Studio components

Do not create duplicate contracts if they already exist.

Do not create duplicate services if an existing service already provides the required data.

---

# 5. CURRENT PHASE 4 UX TARGET

The Resume Studio should evolve toward this information hierarchy:

```text
┌───────────────────────────────────────────────────────────┐
│ Resume Studio                                             │
│ Resume: [My Resume ▼]                         [Refresh]   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                  RESUME HEALTH                             │
│                                                           │
│                       82 / 100                             │
│                         Strong                             │
│                                                           │
│  Your strongest area: Projects                             │
│  Highest priority: Experience                             │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                  SECTION ANALYSIS                         │
│                                                           │
│  Contact        92   Excellent                            │
│  Summary        78   Strong                               │
│  Skills         84   Strong                               │
│  Experience     71   Developing      ← Priority           │
│  Projects       88   Strong                               │
│  Education      96   Excellent                            │
│  Achievements   64   Developing      ← Priority           │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│              SELECTED SECTION                            │
│                                                           │
│  Experience                                      71 / 100 │
│                                                           │
│  Role completeness                            ✓ / ⚠       │
│  Bullet density                               ✓ / ⚠       │
│  Action verbs                                 ✓ / ⚠       │
│  Measurable evidence                          ✓ / ⚠       │
│                                                           │
│  Why this score?                                          │
│  Plain-language explanation based on deterministic        │
│  scoring components and section analysis.                 │
│                                                           │
│  What to improve                                          │
│  Show clearer impact and measurable evidence in          │
│  experience bullets.                                      │
│                                                           │
│  [View Section]                                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

This is a UX direction, not permission to invent unsupported data.

Use the actual Phase 2/3 contracts.

---

# 6. UX PRINCIPLES

The interface must feel:

- clean
- modern
- professional
- calm
- focused
- easy to scan
- candidate-oriented
- actionable
- visually consistent with the existing Skillezo dashboard

Avoid:

- excessive cards
- excessive gradients
- giant decorative graphics
- unnecessary animations
- dashboard clutter
- meaningless badges
- repeated information
- fake AI-looking UI
- arbitrary percentages
- redundant score displays
- complicated navigation

The goal is:

> "I immediately understand what is good, what is weak, and what I should work on."

Not:

> "I am looking at a dashboard full of numbers."

---

# 7. INFORMATION ARCHITECTURE

Restructure the Resume Studio page into these conceptual areas:

## A. Resume Header

Show:

- Resume Studio title
- active resume name
- resume switcher if multiple resumes exist
- optional refresh/re-analyze action if supported by the existing architecture

Do not create a new analysis job system.

---

## B. Resume Health / Overall Score

Use the existing Phase 3 overall score.

Display:

- overall score
- existing deterministic rating tier
- concise deterministic/plain-language explanation
- strongest section
- weakest/highest-priority section

Do not calculate a new score.

"Strongest" and "priority" must be derived from the existing section scores using deterministic UI logic only.

If multiple sections tie, handle the tie deterministically.

---

## C. Section Overview

Display all seven sections:

1. Contact
2. Summary
3. Skills
4. Experience
5. Projects
6. Education
7. Achievements

For each show:

- section name
- exact score
- existing weight
- existing rating/tier where available
- clear visual status

The section cards should be compact.

Avoid displaying every scoring component at this level.

---

# 8. SECTION PRIORITIZATION

Introduce a simple deterministic UI concept:

### "Priority"

The purpose is to help the candidate decide what to inspect first.

Priority must be based ONLY on existing deterministic score data.

Suggested approach:

- lowest scoring section = highest priority
- next-lowest = next priority
- strong sections = lower priority

Do NOT create a new hidden scoring formula.

Do NOT call it an "ATS priority score."

Do NOT imply hiring probability.

Do NOT imply that a lower score means rejection.

Use neutral language such as:

- Highest priority
- Worth reviewing
- Strong area
- Already strong

If the scoring data already provides a more appropriate concept, use that instead.

---

# 9. SECTION DETAIL EXPERIENCE

When a candidate selects a section, show a detailed analysis panel/drawer/page section.

It should contain:

### Section header

```text
Experience
71 / 100
Developing
```

### Components

Use the existing deterministic Phase 3 component breakdown.

Example:

```text
Role completeness
18 / 25

Bullet density
20 / 25

Action verbs
19 / 25

Measurable evidence
14 / 25
```

Use actual values from the API.

Never invent component names.

Never hard-code scores.

---

# 10. COMPONENT EXPLANATIONS

Every displayed component explanation must originate from existing deterministic scoring/analyzer data.

The UI may make the wording easier to scan, but it must not change the factual meaning.

Prefer:

```text
Measurable evidence
14 / 25

Some experience bullets contain measurable evidence,
but several bullets could communicate impact more clearly.
```

Avoid:

```text
Recruiters won't consider this resume.
```

Avoid:

```text
You have a 38% chance of getting shortlisted.
```

Avoid:

```text
ATS will reject this section.
```

Those claims are unsupported.

---

# 11. "WHAT TO IMPROVE" FOUNDATION

Phase 4 should introduce an actionable improvement area WITHOUT generating AI content.

This can be deterministic guidance based on existing signals.

Examples:

### If measurable evidence is weak

```text
What to improve

Strengthen experience bullets with clearer measurable
evidence where the original resume contains supported
facts.
```

### If role completeness is weak

```text
What to improve

Make sure each experience entry clearly communicates
the role, organization, and timeline.
```

### If links are weak

```text
What to improve

Review project repository and live-demo links for
completeness and consistency.
```

Important:

These are **guidance statements**, not AI rewrites.

Do not invent numbers.

Do not tell the candidate to add a metric that does not exist.

Prefer:

> "Add measurable evidence where you have real evidence."

Never:

> "Add a 30% improvement."

unless that exact fact already exists in ResumeDocument.

---

# 12. SECTION ACTIONS

Each section should expose a clear next action.

Examples:

```text
Review Experience
Review Skills
Review Projects
Review Education
Review Achievements
```

If the existing application architecture already has an appropriate navigation target, use it.

If editing does not exist yet, do NOT fake an editor.

It is acceptable for an action to open a read-only detail view in Phase 4.

Do not create placeholder buttons that pretend later functionality exists.

---

# 13. EMPTY / LOADING / ERROR STATES

Implement polished states for:

## Loading

Use a lightweight skeleton.

Do not block the entire dashboard unnecessarily.

## No resume

Keep the existing sample preview behavior if already implemented.

Clearly distinguish:

```text
Sample Preview
```

from real resume analysis.

Do not present fixture scores as if they were real candidate scores.

## API error

Display:

```text
We couldn't load your resume analysis.
Please try again.
```

Provide a retry action.

Do not silently replace failed API data with fake scores.

## Partial data

Gracefully handle missing optional sections/components.

Do not crash because an optional field is absent.

---

# 14. MULTIPLE RESUME SUPPORT

Preserve the existing resume switcher.

When switching resumes:

1. update the active resume
2. fetch/use the corresponding deterministic score
3. update section overview
4. update selected section
5. clear stale selected-section data if necessary

Prevent stale data from Resume A appearing under Resume B.

Use proper loading/error handling.

---

# 15. RESPONSIVE DESIGN

The Resume Studio must work well on:

- desktop
- laptop
- tablet
- mobile

Desktop may use a two-column analysis layout.

Mobile should collapse naturally into a single-column flow.

Do not create horizontal overflow.

Section detail should remain usable on small screens.

---

# 16. ACCESSIBILITY

Implement:

- semantic buttons
- keyboard-accessible section selection
- visible focus states
- meaningful labels
- appropriate ARIA where required
- sufficient text contrast
- no information conveyed by color alone

Expandable drawers/panels must be keyboard accessible.

---

# 17. PERFORMANCE

Keep Phase 4 lightweight.

Do not add:

- large animation libraries
- heavy charting libraries
- unnecessary dependencies
- client-side duplicate scoring
- polling
- WebSockets
- background analysis jobs

Prefer existing project dependencies and components.

Use memoization only where it provides actual value.

---

# 18. ANIMATION

Use subtle existing Skillezo motion patterns if they already exist.

Good:

- small fade
- slight expand/collapse
- smooth section transition

Avoid:

- continuous animations
- animated score counters everywhere
- excessive parallax
- expensive canvas/WebGL
- distracting effects

The analysis experience should feel professional, not gamified.

---

# 19. DATA CONTRACT RULES

Before coding, inspect the exact types returned by:

```text
GET /api/resumes/:resumeId/score
GET /api/resumes/:resumeId/section-analysis
```

Use the existing:

- `ResumeScoreResult`
- `ResumeSectionAnalysisResult`
- related component types

or the actual repository equivalents.

Do not duplicate these types.

Do not weaken them with `any`.

Do not use unsafe casts to make the UI compile.

---

# 20. DETERMINISTIC UI DERIVED DATA

It is acceptable to derive presentation-only information such as:

```text
highest scoring section
lowest scoring section
priority order
selected section
expanded component
```

from the existing API response.

It is NOT acceptable to derive:

```text
new score
new weight
new ATS score
new hiring score
new probability
new rating formula
```

---

# 21. SCORE VISUALIZATION

Use a simple visual hierarchy.

Preferred:

```text
82 / 100
Strong
```

and compact progress indicators.

Avoid creating elaborate gauges if they add little value.

Do not use color alone to represent score state.

The exact score should always remain readable as text.

---

# 22. DO NOT OVER-DESIGN

The previous Resume Studio UI was too dashboard-like and fragmented.

Avoid creating:

```text
10+ cards
20+ badges
multiple nested panels
multiple score rings
multiple navigation systems
```

Instead, create a clear flow:

```text
Overall health
      ↓
What needs attention
      ↓
7 section overview
      ↓
Selected section
      ↓
Why the score is what it is
      ↓
What to review next
```

---

# 23. TESTING REQUIREMENTS

Add/update tests for the Phase 4 presentation logic.

At minimum test:

### Overall

- real API score is displayed
- no client-side score recalculation
- rating tier is preserved

### Section overview

- all seven sections render
- correct score is shown
- correct weight is shown
- section ordering is stable

### Priority

- lowest score becomes highest-priority section
- ties are deterministic
- strong sections are not incorrectly labeled as weak

### Selection

- selecting a section shows its components
- component values match API data
- switching sections does not leak stale data

### Multiple resumes

- switching resume updates displayed analysis
- stale analysis is not shown during transition
- failed resume fetch displays an error

### Empty state

- no resume shows sample mode only if the existing fixture behavior is valid
- fixture scores are clearly labeled
- no-resume state does not masquerade as real analysis

### Error state

- API failure is handled
- retry works
- no fake fallback is shown after a real API failure

### Accessibility

Test important interactive elements where the existing test setup supports it.

---

# 24. REGRESSION TESTING

Do NOT run only Phase 4 tests.

Run the complete existing test suite.

Verify:

```text
Phase 0 tests
Phase 1 tests
Phase 2 tests
Phase 3 tests
Phase 4 tests
```

No previous test may regress.

Also run:

```bash
npx tsc --noEmit
```

for client and server using the repository's actual commands.

Run the project's existing lint/build commands where practical.

---

# 25. BROWSER VERIFICATION

Actually open the Resume Studio in a browser.

Verify:

### Real resume

- real uploaded resume is detected
- real score appears
- score matches API
- all seven sections appear
- component breakdown works
- section selection works

### Multiple resumes

- switcher works
- data updates correctly
- no stale data appears

### No resume

- sample mode is clearly labeled

### API error

- error state is understandable
- retry works

### Responsive

Verify desktop and mobile layouts.

---

# 26. VISUAL QUALITY CHECK

Before declaring completion, inspect the page as a product designer.

Ask:

1. Can I understand the resume's health within 5 seconds?
2. Can I identify the weakest section immediately?
3. Can I understand why that section is weak?
4. Can I see what I should review next?
5. Is the page too crowded?
6. Are there unnecessary cards?
7. Are scores readable?
8. Does the page feel like one coherent workflow?
9. Does it still look like Skillezo?
10. Is anything pretending to be AI or editing functionality that does not exist yet?

If yes to any problem, fix it within Phase 4.

---

# 27. DOCUMENTATION

Update/create the appropriate Phase 4 documentation according to the repository's existing structure.

Expected documentation should explain:

- Phase 4 objective
- Resume Studio UX architecture
- data flow
- section prioritization behavior
- component presentation
- empty/error/loading states
- multiple-resume behavior
- accessibility considerations
- explicit Phase 4 boundaries
- what is intentionally deferred to later phases

Do not rewrite unrelated architecture documents unnecessarily.

---

# 28. GIT / CHANGE CONTROL

At completion:

1. Inspect changed files.
2. Remove unused imports.
3. Remove dead code.
4. Ensure no debug logs remain.
5. Ensure no temporary fixtures were accidentally used for real data.
6. Ensure no backend scoring logic changed.
7. Ensure no AI calls were introduced.
8. Commit the Phase 4 changes.
9. Report the commit hash.

Do not modify unrelated features.

---

# 29. REQUIRED FINAL REPORT

After implementation, report exactly:

## Phase 4 Status

- Implementation status
- Files/components changed
- UX changes
- Data/API integration
- Tests run and results
- TypeScript result
- Lint/build result
- Browser verification result
- Git commit hash

## Boundary Verification

Explicitly confirm:

```text
AI/LLM calls: 0
Resume editing: 0
PDF builder: 0
PDF export: 0
JD tailoring: 0
Scoring engine changes: 0
Phase 3 score contract preserved: YES
```

## Known Limitations

List only real limitations discovered during implementation.

---

# 30. HARD STOP

When Phase 4 is complete:

**STOP.**

Do not continue into Phase 5.

Do not implement:

- AI resume improvement
- AI rewriting
- editing
- approval workflow
- resume builder
- templates
- PDF export

Those belong to later phases.

The expected final architecture is:

```text
PHASE 0
Canonical Architecture
        ↓
PHASE 1
Resume Ingestion
        ↓
PHASE 2
7-Section Analysis
        ↓
PHASE 3
Deterministic Scoring
        ↓
PHASE 4
Actionable Resume Studio UX
        ↓
       STOP
        ↓
Future phases
AI Improvement
Editing
Builder
PDF
ATS Validation
JD Matching
Tailoring
Copilot
```

---

# FINAL PRINCIPLE

Phase 4 should make the existing intelligence **understandable and actionable without changing the intelligence itself**.

The candidate should finish the page knowing:

> "My resume is X/100."

> "These are my strongest sections."

> "These are the sections worth reviewing."

> "This is exactly why my Experience section scored 71."

> "These are the specific areas I should improve."

But the system should NOT yet tell them:

> "Here is the AI rewrite."

That belongs to the next appropriate phase.

**Implement Phase 4 only. Inspect first. Preserve Phases 0–3. Test everything. Verify in browser. Then stop.**
