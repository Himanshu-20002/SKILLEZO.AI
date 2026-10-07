# SKILLEZO — PHASE 4 UI CORRECTION
## Resume Studio — Simplify the Candidate Experience

---

## OBJECTIVE

The current Phase 4 implementation is technically correct, but the actual `/dashboard/resume-studio` experience is still too complicated.

It currently feels like an **internal scoring/debugging dashboard** rather than a **candidate-facing Resume Studio**.

We need a genuine UX simplification.

The goal is NOT to expose more scoring information.

The goal is to make the existing intelligence understandable and actionable.

The candidate should immediately understand:

1. How good their resume is.
2. Which section needs attention.
3. Why it needs attention.
4. What they should review.
5. Where they will eventually improve it.

---

# 1. HARD BOUNDARY

This is a **frontend UX correction only**.

DO NOT modify:

- ResumeDocument architecture
- Phase 1 ingestion
- Phase 2 section analysis
- Phase 3 scoring engine
- scoring formulas
- scoring weights
- score API
- section-analysis API
- evidence architecture
- authentication

DO NOT introduce:

- AI
- LLM
- Gemini
- OpenAI
- OpenRouter
- AI rewriting
- resume editing
- document mutation
- builder
- templates
- PDF generation
- LaTeX
- Typst
- ATS validation
- JD matching
- job-specific scoring
- Copilot

Phase 3 scoring remains completely frozen.

---

# 2. FIRST: INSPECT THE ACTUAL UI

Before coding:

1. Open `/dashboard/resume-studio`.
2. Inspect the actual rendered page.
3. Compare it mentally with the previous Phase 0/3 experience.
4. Identify why it still feels complicated.
5. Then redesign the information hierarchy.

Do NOT rely only on the previous Phase 4 completion report.

The actual browser UI is the source of truth for this correction.

---

# 3. CORE PRODUCT PRINCIPLE

The backend can be sophisticated.

The candidate UI should be simple.

Think:

```text
UNDERSTAND
    ↓
IDENTIFY
    ↓
REVIEW
    ↓
IMPROVE LATER
```

NOT:

```text
SCORE
WEIGHT
RULE
POINTS
PERCENTAGE
EVIDENCE
DEDUCTION
RULE FORMULA
BADGE
CARD
CARD
CARD
```

---

# 4. REMOVE "EVERYTHING IS A CARD"

The current page uses too many visually prominent containers.

Do not make every piece of information a card.

Create a clear visual hierarchy:

### Primary

- Resume health
- Needs attention

### Secondary

- Resume sections

### Detail

- Selected section analysis

Use whitespace, typography, dividers, and hierarchy instead of turning every item into a floating card.

---

# 5. SIMPLIFY THE HEADER

Current header contains too much product/technical labeling.

Use a simple candidate-facing header:

```text
Resume Studio

Improve your resume section by section.

[ My Resume ▼ ]
```

Keep the existing resume switcher.

Do not prominently show:

- "Canonical"
- "Live Candidate Analysis"
- technical verification labels
- Developer View

Developer View may remain accessible through a developer-only route if already required, but it should not be part of the normal candidate-facing experience.

---

# 6. SIMPLIFY RESUME HEALTH

The overall score should remain.

But it should feel human and simple.

Target:

```text
Your Resume

63 / 100
Good

You have a solid foundation.
Experience is your biggest opportunity to improve.

Strongest
Technical Skills

Needs attention
Work Experience
```

Do NOT show:

- score formulas
- weighting math
- deduction math
- internal rule names
- evidence ledger
- technical diagnostic terminology

The score comes directly from Phase 3.

Do not recalculate it on the client.

---

# 7. MAKE "NEEDS ATTENTION" THE MAIN ACTION

The weakest section should be the main actionable element.

Example:

```text
Needs attention

Work Experience

31 / 100

Your experience section has the biggest opportunity
for improvement.

• Strengthen action-oriented bullets
• Add measurable impact where real evidence exists

[Review Experience]
```

The exact observations must come from existing deterministic analysis data.

Do not invent facts.

Do not invent metrics.

Do not promise ATS outcomes.

Do not imply rejection or hiring probability.

---

# 8. SIMPLIFY THE 7 SECTIONS

Do NOT show seven giant dashboard cards.

Use a compact section list.

Example:

```text
Your Resume

Contact              75
Summary              80
Skills               90
Experience           31
Projects             75
Education            60
Achievements         70
```

Each row should be:

- compact
- readable
- clickable
- easy to scan

The score should be visually more important than the weight.

The weight should be removed from the primary UI or made extremely subtle.

Candidates do NOT need to understand:

> Experience = 30% of general score.

That is an internal scoring implementation detail.

---

# 9. REMOVE "CANONICAL"

Do not display:

```text
Canonical 7 Sections
```

Use:

```text
Your Resume
```

or:

```text
Resume Sections
```

"Canonical" is an engineering term.

It should not appear in the primary candidate UI.

---

# 10. REMOVE "VERIFIED" TECHNICAL LANGUAGE

Do not expose phrases such as:

```text
verified resume evidence
verified company
evidence deduction ledger
deterministic diagnostic evaluation
```

The underlying evidence architecture must remain intact.

The UI should use natural language.

Instead of:

```text
Deterministic diagnostic evaluation based on verified resume evidence.
```

use:

```text
See what's strong and what you can improve.
```

---

# 11. DO NOT SHOW DEEP-DIVE BY DEFAULT

The current design places:

```text
7 sections
+
Deep Dive
```

side by side.

This makes the interface dense.

Use a simple flow:

```text
Resume Overview
      ↓
Select a section
      ↓
Section Analysis
```

When a candidate selects Experience, show a focused Experience analysis.

Do not force the candidate to process the entire section list and all scoring rules simultaneously.

---

# 12. SECTION DETAIL SHOULD BE SIMPLE

When the candidate selects Experience:

```text
← Back to Resume

Work Experience

31 / 100
Needs attention

What needs attention

Your experience section has limited action-oriented
language and measurable evidence.

Review areas

Action-oriented writing
Needs attention

Measurable impact
Needs attention

Bullet detail
Needs attention

What is working

Your experience entry has basic role structure.

[Improve this section]
```

The button must NOT implement Phase 5.

If no editing exists yet, it may remain disabled/future-facing or be replaced with a clear future-state treatment.

Do not create fake functionality.

---

# 13. HIDE INTERNAL SCORING DETAILS

Do NOT display these by default:

```text
19 / 25 pts
76%

Rule: All positions include verified company, title and dates (+25)

Rule: Avg 2-6 bullets per role (+25), avg >9 (+12)
```

These are internal scoring implementation details.

They make the product feel like a developer tool.

If transparency is required, place it behind an optional:

```text
View scoring details
```

disclosure.

Default experience remains simple.

---

# 14. WHAT TO REVIEW / IMPROVEMENT AREAS

This should NOT look like AI.

Do NOT use:

- sparkle icons
- "AI Insight"
- "AI Recommendation"
- generated-by-AI labels
- typing animations

Use:

```text
What to review
```

or:

```text
Improvement areas
```

These should be deterministic guidance derived from existing Phase 2/3 information.

Examples:

```text
Strengthen action-oriented bullets
Review measurable impact
Add clearer bullet detail
```

Only recommend adding measurable evidence where the candidate actually has real evidence.

Never invent:

- percentages
- revenue
- user counts
- performance improvements
- achievements

---

# 15. OVERALL SCORE VISUAL

Do not make the radial score the dominant visual element.

Prefer:

```text
63 / 100
Good
```

Use simple typography and possibly a subtle progress indicator.

Avoid:

- giant radial gauges
- multiple score rings
- animated counters
- decorative charts

The number should support the explanation.

---

# 16. COLOR

Use color sparingly.

The current combination of:

- emerald
- blue
- amber
- rose

plus multiple badges creates a dashboard-like feel.

Use mostly neutral UI.

Use one subtle positive state and one attention state.

Never communicate important meaning by color alone.

---

# 17. TARGET OVERVIEW

The default overview should feel approximately like:

```text
Resume Studio

Improve your resume section by section.

[ My Resume ▼ ]


YOUR RESUME

63 / 100
Good

Solid foundation. Experience is your biggest
opportunity right now.

Strongest
Technical Skills

Needs attention
Work Experience


────────────────────────────────────


NEEDS ATTENTION

Work Experience

31 / 100

Your experience section has the biggest opportunity
for improvement.

• Strengthen action-oriented bullets
• Add measurable impact where real evidence exists

[Review Experience]


────────────────────────────────────


YOUR RESUME

Contact                  75
Summary                  80
Skills                   90
Experience               31
Projects                 75
Education                60
Achievements             70
```

This is a UX reference, not a requirement to reproduce the exact layout.

---

# 18. TARGET SECTION DETAIL

When clicking Experience:

```text
← Back

Work Experience

31 / 100
Needs attention


What needs attention

Your experience section has limited action-oriented
language and measurable evidence.


Review areas

Action-oriented writing
Needs attention

Measurable impact
Needs attention

Bullet detail
Needs attention


What is working

Your experience entry has basic role structure.


[Improve this section]
```

Keep it focused.

The candidate should not need to understand how the scoring engine works.

---

# 19. DATA INTEGRATION

Continue consuming the existing APIs:

```text
GET /api/resumes/:resumeId/score

GET /api/resumes/:resumeId/section-analysis
```

Use the existing contracts/types.

Do NOT:

- mock the data
- duplicate scoring logic
- calculate scores in React
- change weights
- create a new scoring endpoint

Presentation-only derived values are allowed:

- strongest section
- lowest-scoring section
- priority ordering
- selected section

These must be derived from existing API values.

---

# 20. MULTIPLE RESUMES

Preserve the current resume switcher.

When switching resumes:

1. Change active resume.
2. Load its analysis.
3. Update overall score.
4. Update section list.
5. Update selected section.
6. Prevent stale data from the previous resume appearing.

---

# 21. LOADING STATE

Use a lightweight skeleton.

Do not make the entire page feel blocked.

---

# 22. EMPTY STATE

If no real resume exists:

```text
Build your resume analysis

Upload a resume to see your real section scores,
strengths, and improvement areas.

[Upload Resume]

Sample Preview
```

Sample data must be clearly labeled.

Never make fixture scores look like real candidate scores.

---

# 23. ERROR STATE

If the score/analysis API fails:

```text
Resume analysis unavailable

We couldn't load your resume analysis.

[Try Again]
```

Do not silently display fake scores after a real API failure.

---

# 24. RESPONSIVE DESIGN

Desktop:

```text
Resume Health
      ↓
Needs Attention
      ↓
Resume Sections
```

Mobile:

```text
Resume Health

Needs Attention

Your Resume

Contact
Summary
Skills
Experience
Projects
Education
Achievements
```

Selecting a section opens its focused analysis.

No horizontal scrolling.

No cramped desktop-style side-by-side deep dive on mobile.

---

# 25. ACCESSIBILITY

Preserve:

- keyboard accessibility
- visible focus states
- semantic buttons
- accessible section selection
- meaningful labels
- appropriate ARIA
- sufficient contrast

Do not rely only on color.

---

# 26. PERFORMANCE

Do not add heavy dependencies.

Do not add:

- chart libraries
- animation frameworks
- polling
- WebSockets
- duplicate scoring
- expensive visualization systems

Use existing project components/dependencies wherever possible.

---

# 27. ACCEPTANCE CRITERIA

Phase 4 UX correction is complete only if:

### 1. Visual difference

The page clearly looks and feels different from the old dashboard.

### 2. Five-second comprehension

A normal student can understand the resume state within approximately five seconds.

### 3. Priority

The candidate immediately sees which section needs attention.

### 4. Action

The priority section has an obvious review action.

### 5. Simplicity

The candidate does not need to understand scoring formulas, weights, or evidence ledgers.

### 6. Detail

Selecting a section provides useful analysis without overwhelming the candidate.

### 7. No fake AI

Nothing visually pretends to be AI functionality.

### 8. Data integrity

All displayed scores originate from the existing Phase 3 API.

### 9. Responsive

Desktop and mobile layouts both work properly.

---

# 28. TESTING

After implementation:

Run the complete existing Resume Studio test suite.

Run:

```bash
npx tsc --noEmit
```

for client and server using the repository's actual commands.

Run lint/build according to repository conventions.

Then actually open the browser and verify:

- real resume
- overall score
- seven sections
- priority section
- section navigation
- detail view
- multiple resumes
- loading state
- error state
- no-resume state
- responsive layout

Do not claim completion based only on tests.

---

# 29. FINAL VISUAL REVIEW

Before reporting completion, ask:

> Does this look like a candidate product or an engineering dashboard?

It must look like a candidate product.

Ask:

> Is there too much information?

If yes, remove it.

Ask:

> Does every element help the candidate understand or act?

If no, remove it.

Ask:

> Can I identify what I should work on immediately?

If no, fix the hierarchy.

---

# 30. FINAL HARD STOP

This remains Phase 4.

Do NOT start Phase 5.

Do NOT add:

- AI rewriting
- AI suggestions
- editing
- document mutation
- resume builder
- templates
- PDF
- ATS validation
- JD matching

The goal is:

```text
LESS DATA
MORE CLARITY
MORE ACTION
```

The scoring engine may remain complex behind the scenes.

The candidate experience must remain simple.

After the simplified UI is browser-verified:

1. Run all tests.
2. Run TypeScript.
3. Run lint/build.
4. Verify browser.
5. Report changed files.
6. Report verification results.
7. Report commit hash.
8. STOP.

---

# SUCCESS CRITERION

If I open `/dashboard/resume-studio` and think:

> "This is still basically a scoring dashboard."

then Phase 4 is NOT complete.

If I open it and immediately think:

> "I know how strong my resume is, what needs attention, why it needs attention, and what I should review next."

then Phase 4 is complete.
