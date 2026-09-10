# SKILLEZO --- PHASE 0

# RESUME STUDIO --- ARCHITECTURE FREEZE & FOUNDATION

## ROLE

You are working as a senior full-stack architect and engineer on the
existing **Skillezo** project.

This is **Phase 0 only**.

Your job is NOT to build the complete Resume Studio yet.

Your job is to inspect the existing Skillezo codebase, understand what
already exists from Phases 1--7, define the new Resume Studio
foundation, create the canonical data architecture, and prepare the
project so every future phase can be implemented safely and
incrementally.

**DO NOT blindly rewrite existing functionality.**

**DO NOT remove working Phase 1--7 functionality.**

**DO NOT start implementing future phases prematurely.**

This phase must leave the application in a stable, working,
browser-testable state.

------------------------------------------------------------------------

# 1. PRODUCT DIRECTION

The current Resume Intelligence experience has become too complicated
and exposes too much internal AI machinery.

The new direction is:

# Resume Studio

The candidate experience should eventually become:

``` text
UPLOAD → UNDERSTAND → SCORE EACH SECTION → IMPROVE → RE-SCORE → BUILD → TAILOR TO JOB → EXPORT → ATS VALIDATE
```

The candidate should NOT need to understand AI phases, deterministic
scoring internals, recommendation orchestrators, internal intelligence
pillars, or individual analyzer implementations.

Those remain internal engineering capabilities.

The user should instead see:

-   Resume Score
-   Section Scores
-   What is wrong
-   Why it matters
-   How to improve it
-   AI-generated improvement
-   Evidence requirements
-   Before/After score
-   Resume Builder
-   Job-specific tailoring
-   PDF export

------------------------------------------------------------------------

# 2. EXISTING AI PHASES MUST BE PRESERVED

The existing seven-phase intelligence must NOT be discarded.

Treat them as the underlying AI/intelligence engine.

``` text
                    SKILLEZO AI ENGINE
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
     Understand         Evaluate         Optimize
          │                │                │
      Phase 1–2         Phase 3–5        Phase 6–7
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                    RESUME STUDIO
```

Reuse existing intelligence wherever possible.

Do not duplicate existing functionality simply because the UI is
changing.

------------------------------------------------------------------------

# 3. PHASE 0 OBJECTIVE

Create the architectural foundation for:

1.  ResumeDocument
2.  Resume sections
3.  Resume versions
4.  Resume evidence
5.  Resume scores
6.  Resume suggestions
7.  Target role
8.  Job description
9.  Resume templates
10. Resume Studio route/page foundation
11. Development/test fixture
12. Clear boundaries between parsed resume data, AI analysis,
    deterministic scoring, user-approved modifications, and
    rendering/export

At the end of Phase 0, the project should be ready for Phase 1 without
architectural rework.

------------------------------------------------------------------------

# 4. FIRST TASK --- INSPECT THE EXISTING PROJECT

Before changing anything, thoroughly inspect the repository.

Identify:

-   framework/version
-   Next.js architecture
-   App Router / Pages Router
-   TypeScript configuration
-   package manager
-   database
-   ORM
-   authentication
-   API architecture
-   existing resume upload flow
-   existing resume parser
-   existing Resume Intelligence components
-   existing AI services
-   existing scoring services
-   existing Phase 1--7 implementations
-   existing resume database models
-   existing state management
-   existing validation
-   existing testing setup
-   existing UI component system
-   existing design system
-   existing routes
-   existing environment variables
-   existing error handling
-   existing logging

Do NOT assume names. Search the actual repository.

Create a concise internal architecture assessment before implementation.

------------------------------------------------------------------------

# 5. IMPORTANT --- DO NOT REBUILD WHAT ALREADY EXISTS

Before creating any new service/model/component, search for equivalent
functionality.

For example, if the project already has:

``` text
Resume
ResumeUpload
ResumeParser
ResumeAnalysis
ResumeScore
ResumeRecommendation
```

do not create duplicates such as:

``` text
ResumeDocument2
ResumeParserNew
ResumeAnalysisNew
```

Instead determine whether the existing implementation can safely evolve
into the new architecture.

Prefer:

``` text
existing → extend/refactor safely
```

over:

``` text
existing → abandon
new parallel implementation
```

------------------------------------------------------------------------

# 6. CANONICAL DATA MODEL

The most important architectural decision in Phase 0 is:

# ResumeDocument = Single Source of Truth

The AI must NOT directly manipulate the final PDF.

The PDF must NOT become the source of truth.

The UI must NOT maintain an independent resume representation.

Everything should ultimately operate on ResumeDocument.

Conceptually:

``` ts
ResumeDocument {
  id
  userId

  contact
  summary
  skills[]
  experience[]
  projects[]
  education[]
  achievements[]

  evidence[]

  targetRole?
  targetJobDescription?

  metadata
  version
  createdAt
  updatedAt
}
```

Adapt this to the existing database architecture instead of blindly
copying the example.

------------------------------------------------------------------------

# 7. SECTION MODEL

The canonical sections are:

``` text
CONTACT
SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
ACHIEVEMENTS
```

Every section should be independently addressable.

We eventually need to support:

``` text
section.score
section.status
section.strengths
section.weaknesses
section.suggestions
```

Do not implement the full scoring system yet. Phase 0 only needs the
architectural capability to support it.

------------------------------------------------------------------------

# 8. FACT / EVIDENCE ARCHITECTURE

A major product rule:

# AI MUST NOT INVENT RESUME FACTS

The system must eventually distinguish between:

``` text
Candidate-provided fact
Parsed fact
AI inference
Candidate-confirmed fact
AI suggestion
```

Create the architecture necessary to support evidence provenance.

Conceptual example:

``` ts
ResumeEvidence {
  id
  resumeId
  type
  source
  value
  confidence
  verified
  sectionId?
  itemId?
  createdAt
}
```

Possible source values:

``` text
USER
PARSED
IMPORTED
CONFIRMED
```

Do not invent unnecessary fields if the existing architecture has a
better equivalent.

------------------------------------------------------------------------

# 9. AI VS DETERMINISTIC RESPONSIBILITIES

Freeze this architectural boundary.

## AI CAN

-   interpret resume content
-   identify weaknesses
-   suggest improvements
-   rewrite content
-   identify possible missing evidence
-   compare language against target roles
-   recommend stronger phrasing

## AI CANNOT

-   fabricate experience
-   fabricate employers
-   fabricate projects
-   fabricate metrics
-   fabricate users served
-   fabricate revenue
-   fabricate performance improvements
-   arbitrarily assign final scores

The deterministic scoring system remains responsible for final numerical
scoring.

Architecture:

``` text
AI
 ↓
Suggestion
 ↓
Candidate approval
 ↓
ResumeDocument update
 ↓
Deterministic scorer
 ↓
New score
```

NOT:

``` text
AI
 ↓
"Your score is 94"
```

------------------------------------------------------------------------

# 10. RESUME VERSIONING FOUNDATION

Resume Studio will eventually need:

``` text
Master Resume
      │
      ├── Full Stack version
      ├── Frontend version
      ├── Backend version
      └── Job-specific versions
```

Phase 0 should establish the architecture for versioning.

Do NOT implement the complete version-management UI.

Only establish the underlying model/API design needed to support:

``` text
ResumeDocument
   ↓
ResumeVersion
```

Candidate changes should eventually be reversible.

------------------------------------------------------------------------

# 11. TARGET ROLE FOUNDATION

The Resume Studio architecture must support:

``` text
targetRole
```

Examples:

``` text
Full-Stack Engineer
Frontend Engineer
Backend Engineer
```

The target role should remain optional at the data-model level if
appropriate.

Do not hard-code one role into the architecture.

------------------------------------------------------------------------

# 12. JOB DESCRIPTION FOUNDATION

Support an optional:

``` text
targetJobDescription
```

This is separate from:

``` text
targetRole
```

Example:

``` text
Target Role:
Full-Stack Engineer

Job Description:
[pasted JD]
```

The future system will use:

``` text
Target Role
+
Job Description
+
ResumeDocument
```

for matching and tailoring.

Phase 0 only needs the architecture.

------------------------------------------------------------------------

# 13. RESUME TEMPLATE FOUNDATION

Eventually:

``` text
ResumeDocument
      ↓
Template
      ↓
Renderer
      ↓
PDF
```

Templates should NOT own resume data.

Potential templates:

``` text
Classic
Modern
Minimal
Engineering
Executive
```

All consume the same ResumeDocument.

Phase 0 should establish the interface/contract.

Do NOT build all templates now.

------------------------------------------------------------------------

# 14. PDF ARCHITECTURE DECISION

The selected PDF strategy is:

# @react-pdf/renderer

Do NOT introduce LaTeX in Phase 0.

Do NOT install unnecessary PDF infrastructure yet unless required for a
minimal architectural proof.

Intended architecture:

``` text
ResumeDocument
      ↓
React Resume Template
      ↓
@react-pdf/renderer
      ↓
PDF
```

The interactive editor will remain normal React/HTML.

Important:

``` text
EDITOR = React/HTML
PDF = React-PDF
```

Do NOT make the entire editor dependent on PDF rendering.

The PDF renderer will be implemented in a later phase.

------------------------------------------------------------------------

# 15. ROUTE FOUNDATION

Create or adapt the appropriate route for:

``` text
/resume-studio
```

Follow the existing Skillezo routing architecture.

The initial Phase 0 page should be intentionally simple.

It should prove:

``` text
ResumeDocument
        ↓
Resume Studio
```

works.

------------------------------------------------------------------------

# 16. DEVELOPMENT FIXTURE

Create a safe development/test fixture based on the structure of a real
resume.

If practical, use the existing uploaded/test resume data already
available in the project.

Do NOT hard-code private user information into production code.

Use a clearly marked development fixture.

The fixture should contain:

``` text
Contact
Summary
Skills
Experience
Projects
Education
Achievements
```

Purpose: verify the new data model and UI.

------------------------------------------------------------------------

# 17. PHASE 0 UI

Create only a minimal Resume Studio shell.

Example:

``` text
Resume Studio

Full Stack Engineer Resume

Resume Score
-- / 100

Resume Sections

✓ Contact
-- Summary
-- Skills
-- Experience
-- Projects
-- Education
-- Achievements
```

This is NOT the final UI.

Do not spend Phase 0 time polishing visual design.

Use the existing Skillezo design system/components.

------------------------------------------------------------------------

# 18. DO NOT IMPLEMENT YET

Do NOT implement these in Phase 0:

-   full section scoring
-   AI rewriting
-   AI Copilot
-   resume builder
-   drag-and-drop layout
-   PDF generation
-   React-PDF templates
-   LaTeX
-   JD tailoring
-   advanced recommendations
-   complete version-management UI
-   ATS PDF validator
-   template marketplace
-   unnecessary animations
-   complex dashboards

These belong to later phases.

------------------------------------------------------------------------

# 19. PERFORMANCE REQUIREMENTS

Resume Studio must be designed lightweight from the beginning.

Avoid:

-   duplicate resume state
-   unnecessary global state
-   loading every AI service on initial page load
-   running expensive AI analysis automatically
-   generating PDFs on every keystroke
-   rendering hidden templates
-   unnecessary client-side dependencies

Prefer:

``` text
server-side data fetching where appropriate
+
small client components
+
lazy loading for expensive future modules
+
explicit AI actions
```

Do not introduce a dependency unless it solves a real problem.

------------------------------------------------------------------------

# 20. API CONTRACT FOUNDATION

Define clear boundaries for future APIs.

Conceptually:

``` text
GET    /api/resume
POST   /api/resume
PATCH  /api/resume

GET    /api/resume/:id
PATCH  /api/resume/:id

GET    /api/resume/:id/sections
GET    /api/resume/:id/score

POST   /api/resume/:id/analyze
POST   /api/resume/:id/improve
POST   /api/resume/:id/versions
```

IMPORTANT:

Do not blindly create all of these endpoints.

Inspect existing API architecture first.

Only create what Phase 0 actually needs.

Document future endpoint contracts separately if they are not yet
implemented.

------------------------------------------------------------------------

# 21. VALIDATION

Use the existing validation approach.

If the project already uses Zod or another schema system, reuse it.

The ResumeDocument schema should validate:

``` text
required fields
optional fields
arrays
dates
section structures
evidence references
version metadata
target role
JD
```

No `any` shortcuts.

No weakly typed escape hatches.

------------------------------------------------------------------------

# 22. ERROR HANDLING

Phase 0 must define how Resume Studio handles:

``` text
No resume
Invalid resume
Malformed data
Missing section
Old resume format
Database failure
Unauthorized access
Invalid ResumeDocument
```

Do not expose internal stack traces to the user.

Use existing Skillezo error-handling conventions.

------------------------------------------------------------------------

# 23. SECURITY

Verify:

-   resume ownership
-   user authorization
-   server-side validation
-   no cross-user resume access
-   no client-controlled userId trust
-   safe handling of uploaded resume data
-   no sensitive data accidentally logged
-   no AI prompt injection from resume text causing unauthorized actions

Resume text should be treated as untrusted input.

------------------------------------------------------------------------

# 24. TEST STRATEGY

Phase 0 must be testable.

Add/update tests for:

### Data model

``` text
✓ valid ResumeDocument
✓ invalid ResumeDocument rejected
✓ optional fields handled
```

### Serialization

``` text
✓ ResumeDocument can be stored
✓ ResumeDocument can be loaded
✓ no data loss
```

### Authorization

``` text
✓ owner can access
✓ unauthorized user cannot access
```

### UI

``` text
✓ /resume-studio loads
✓ fixture renders
✓ all seven sections appear
✓ no runtime errors
```

------------------------------------------------------------------------

# 25. BROWSER TEST --- REQUIRED

Do not finish Phase 0 without testing in the actual browser.

Run the application.

Open:

``` text
/resume-studio
```

Verify:

``` text
✓ page loads
✓ no console errors
✓ no hydration errors
✓ ResumeDocument loads
✓ all seven sections appear
✓ section data is correct
✓ target role displays
✓ existing Skillezo navigation still works
✓ existing Resume Intelligence still works
✓ existing upload/parser functionality still works
```

If Playwright or another browser test framework already exists, use it.

If not, manually test through the browser and document the result.

------------------------------------------------------------------------

# 26. REGRESSION TEST

This is mandatory.

Before declaring Phase 0 complete, verify existing functionality still
works.

Especially:

``` text
Resume upload
Resume parsing
Existing Resume Intelligence
Existing AI phases
Authentication
Navigation
Existing dashboard
```

Do NOT break the current application while introducing Resume Studio.

------------------------------------------------------------------------

# 27. FILE / CODE ORGANIZATION

Follow the existing project architecture.

Do NOT create arbitrary folders just to match this prompt.

Prefer logical separation such as:

``` text
resume/
  domain/
  schemas/
  services/
  scoring/
  ai/
  versions/
  templates/
  pdf/
```

ONLY if this matches the existing architecture.

The important separation is conceptual:

``` text
Domain
AI
Scoring
Persistence
UI
Rendering
```

------------------------------------------------------------------------

# 28. DOCUMENTATION TO CREATE

Create:

``` text
/docs/resume-studio/00-architecture.md
```

It must document:

1.  Current architecture discovered
2.  Existing Resume Intelligence capabilities
3.  What is being reused
4.  What is being changed
5.  ResumeDocument definition
6.  Section model
7.  Evidence model
8.  Versioning model
9.  Target role model
10. JD model
11. Template contract
12. AI/deterministic boundary
13. API boundaries
14. Security rules
15. Performance rules
16. Future phase dependencies
17. Decisions made
18. Explicitly deferred functionality

Also create/update:

``` text
/docs/resume-studio/README.md
```

with:

``` text
Phase 0 — Architecture Freeze       [CURRENT]
Phase 1 — Resume Ingestion
Phase 2 — Section Engine
Phase 3 — Section Scoring
Phase 4 — Resume Studio UI
Phase 5 — Section AI Editor
Phase 6 — AI Rewrite + Re-score
Phase 7 — Resume Builder
Phase 8 — Templates
Phase 9 — React-PDF Rendering
Phase 10 — PDF/Browser Testing
Phase 11 — ATS PDF Validator
Phase 12 — Master Resume
Phase 13 — JD Tailoring
Phase 14 — Final Optimization
Phase 15 — Resume Copilot
```

Mark only Phase 0 as active.

------------------------------------------------------------------------

# 29. GIT / CHECKPOINT PRINCIPLE

Before implementation:

Inspect git status.

Do not overwrite unrelated work.

After Phase 0, provide a clear summary of:

``` text
Files added
Files changed
Files removed
Models added/changed
APIs added/changed
Tests added
Dependencies added
```

If the project uses git commits, create a logical checkpoint only if
consistent with the existing workflow.

Recommended checkpoint:

``` text
feat(resume-studio): phase 0 architecture foundation
```

Do not commit if the project workflow explicitly avoids automatic
commits.

------------------------------------------------------------------------

# 30. DEFINITION OF DONE

Phase 0 is complete ONLY when all of these are true:

``` text
[ ] Existing project architecture inspected
[ ] Existing Phase 1–7 functionality identified
[ ] Existing reusable functionality identified
[ ] ResumeDocument architecture defined
[ ] Resume section model defined
[ ] Evidence architecture defined
[ ] Version architecture defined
[ ] Target role architecture defined
[ ] JD architecture defined
[ ] Template contract defined
[ ] AI vs deterministic boundaries defined
[ ] React-PDF decision documented
[ ] Resume Studio route exists
[ ] Minimal Resume Studio shell works
[ ] Development fixture works
[ ] Validation exists
[ ] Authorization is respected
[ ] Tests pass
[ ] Browser test passes
[ ] Existing functionality regression-tested
[ ] Documentation created
[ ] No unnecessary future features implemented
[ ] No LaTeX introduced
[ ] No duplicate architecture created
[ ] TypeScript has no new errors
[ ] No runtime errors
```

------------------------------------------------------------------------

# 31. FINAL OUTPUT REQUIRED FROM YOU

When implementation is complete, report:

## A. Architecture discovered

Briefly explain the existing relevant architecture.

## B. What was reused

List existing Phase 1--7 systems/components/services that were
preserved.

## C. What changed

List every meaningful change.

## D. ResumeDocument

Show the final TypeScript/schema structure.

## E. Files changed

Provide the exact paths.

## F. Dependencies

List any newly added dependency and why it was necessary.

## G. Tests

Report:

``` text
Unit tests:
Integration tests:
Browser tests:
TypeScript:
Lint:
```

## H. Browser verification

State exactly what was tested.

## I. Known limitations

Only genuine remaining limitations.

## J. Phase 1 readiness

Explain exactly what Phase 1 can now build on.

------------------------------------------------------------------------

# 32. IMPORTANT WORKING STYLE

Work incrementally.

Do not make a giant speculative implementation.

Use this sequence:

``` text
INSPECT
   ↓
PLAN
   ↓
IMPLEMENT FOUNDATION
   ↓
RUN TYPECHECK
   ↓
RUN TESTS
   ↓
RUN APPLICATION
   ↓
TEST IN BROWSER
   ↓
FIX
   ↓
REGRESSION TEST
   ↓
DOCUMENT
   ↓
REPORT
```

If you discover a conflict between the existing implementation and this
specification:

1.  Do NOT silently destroy the existing implementation.
2.  Inspect the existing architecture.
3.  Choose the least disruptive migration path.
4.  Document the decision in `/docs/resume-studio/00-architecture.md`.

If something is unnecessary for Phase 0, do not build it.

If an existing implementation already solves a requirement, reuse it.

If a requirement cannot safely be implemented without knowing more about
the existing architecture, inspect the repository first rather than
guessing.

------------------------------------------------------------------------

# PHASE 0 SUCCESS CONDITION

At the end of this phase, Skillezo should have:

``` text
A CLEAN ARCHITECTURAL FOUNDATION
              +
A CANONICAL RESUME DOCUMENT
              +
A WORKING RESUME STUDIO SHELL
              +
CLEAR AI / SCORING / RENDERING BOUNDARIES
              +
BROWSER-VERIFIED IMPLEMENTATION
              +
DOCUMENTED FOUNDATION FOR PHASE 1
```

Do not move into Phase 1 implementation.

Stop after Phase 0 and provide the completion report.
