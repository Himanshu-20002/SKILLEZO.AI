Yes bro. This is the right time to stop coding randomly and create the complete implementation documentation first.

We should build this as a controlled, testable sequence, where every phase:

Has a clear objective.
Has a defined input/output contract.
Builds on the previous phase.
Is implemented in the actual Skillezo app.
Is tested in the browser immediately.
Has backend/API tests where applicable.
Is not allowed to break completed phases.
Ends with a working checkpoint before moving forward.

I also checked the current React-PDF documentation: the current @react-pdf/renderer 4.x line supports React 19, Next.js, browser/server rendering, PDF download/blob generation, custom fonts, SVG and page-break control. The current release line is 4.9.x.

So React-PDF remains the optimal direction for our architecture, with one important optimization: we should keep the interactive editor as normal React/HTML and use React-PDF specifically for the PDF renderer/export. That prevents us from making the whole editor depend on PDF rendering.

Skillezo Resume Studio — Master Development Plan
Product architecture
                         SKILLEZO
                            │
                            ▼
                  ┌──────────────────┐
                  │  RESUME STUDIO   │
                  └────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          ANALYZE       IMPROVE        BUILD
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                         MATCH
                           │
                           ▼
                        EXPORT

Underneath:

                 RESUME DOCUMENT
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    AI ENGINE       SCORING        BUILDER
        │              │              │
   Phases 1-7       Section       Templates
                    scores            │
        │              │              ▼
        └──────────────┼─────── React Editor
                       │              │
                       │              ▼
                       │       React-PDF Renderer
                       │              │
                       └──────────────▼
                                  PDF
PHASE 0 — Architecture Freeze

Do this before touching the current UI.

Goal

Create the foundation for Resume Studio without destroying the existing seven-phase implementation.

Documentation

Define:

ResumeDocument
ResumeSection
ResumeVersion
ResumeScore
ResumeEvidence
ResumeSuggestion
TargetRole
JobDescription
ResumeTemplate

The most important object is:

ResumeDocument

Everything should eventually operate on it.

Rule

ResumeDocument = single source of truth.

AI does not directly modify the PDF.

AI proposes structured changes.

Candidate accepts them.

Renderer produces the document.

Browser checkpoint

Create a developer/test page:

/resume-studio/dev

with a hardcoded sample ResumeDocument.

If that renders correctly, Phase 0 passes.

PHASE 1 — Resume Ingestion

This phase uses the existing parsing infrastructure.

Input
PDF
DOCX
Output
ResumeDocument

Example:

{
  "contact": {},
  "summary": {},
  "skills": [],
  "experience": [],
  "projects": [],
  "education": [],
  "achievements": []
}
Important

Do not redesign parsing unnecessarily.

We already have the existing Phase 1 foundation.

The objective is to make the parsed result conform to the new ResumeDocument contract.

Browser test

Upload:

webuxhimanshu_resume.pdf

Verify:

Contact extracted
Summary extracted
Skills extracted
Projects extracted
Education extracted
Achievements extracted

The uploaded resume is a very good fixture because it contains all of these sections.

Acceptance
Upload PDF
     ↓
Parse
     ↓
ResumeDocument
     ↓
No missing major sections
PHASE 2 — Resume Section Engine

Now we build the core of the new experience.

Create seven section cards:

Contact
Summary
Skills
Experience
Projects
Education
Achievements

Each gets:

score
status
strengths
weaknesses
suggestions

Example:

Experience

61 / 100

🔴 Needs improvement

3 issues detected

[ Improve ]
Browser checkpoint

The user can click:

Experience

and see its diagnostics.

No AI rewrite yet.

Just reliable evaluation.

PHASE 3 — Section Scoring Engine

Now implement the actual scoring model.

Contact
completeness
ATS safety
link quality
Summary
target-role alignment
clarity
specificity
keyword relevance
Skills
target-role coverage
organization
relevance
duplication
Experience
impact
technical depth
ownership
metrics
action language
role relevance
Projects
technical complexity
problem/solution
stack
impact
scale
role relevance
Education
completeness
format
relevance
Achievements
specificity
quantification
credibility
relevance
CRITICAL RULE

The AI must not control the numeric score.

This carries forward the important constraint from the earlier architecture.

AI can say:

potentialImpact: "high"

but it cannot say:

scoreBoost: +17

The scoring engine calculates the score deterministically after verified changes.

So:

AI
 ↓
Suggestion
 ↓
Candidate accepts
 ↓
ResumeDocument changes
 ↓
Deterministic scorer
 ↓
New score

Not:

AI says score = 91
PHASE 4 — Resume Studio UI

Now replace the complicated current Resume Intelligence dashboard.

New screen
Resume Studio

Himanshu Kumar
Full Stack Engineer

Resume Score
82 / 100

ATS Readiness       91
Job Match           78
Content Quality     73
Impact              64

────────────────────────────

Resume Sections

✓ Contact             100
✓ Summary              84
⚠ Skills               76
🔴 Experience           61
⚠ Projects             73
✓ Education             96
⚠ Achievements         68

[ Improve Resume ]
Browser test

Everything must be clickable.

No dead cards.

PHASE 5 — Section AI Editor

Now the important part.

Click:

Experience → Improve

The editor opens.

CURRENT

Developed full-stack features using
React, Next.js and Node.js.

────────────────────────

AI SUGGESTION

Built production-ready full-stack
features using React, Next.js and
Node.js, improving application
performance and scalability.

[ Accept ]
[ Edit ]
[ Reject ]
[ Regenerate ]

But we introduce:

Evidence Lock

If AI wants to add:

reduced latency by 35%

but no evidence exists:

⚠ Evidence required

How much did latency improve?

[ Enter evidence ]

[ Skip metric ]

No invented numbers.

This is one of the most important pieces of the entire system.

PHASE 6 — AI Rewrite + Re-score

Now connect the previous phases.

Before

Experience 61

       ↓

AI improvement

       ↓

Candidate accepts

       ↓

ResumeDocument updated

       ↓

Scorer runs again

       ↓

Experience 84

Show:

61 → 84
+23 points

And explain:

+ Technical specificity
+ Stronger ownership
+ Better role alignment
+ Better evidence

This is where the old Phase 7 becomes genuinely useful.

PHASE 7 — Resume Builder

Now we build the visual editor.

Layout
┌────────────────────────────────────────────┐
│ Resume Builder                             │
├──────────────┬─────────────────────────────┤
│ SECTIONS     │                             │
│              │       RESUME PREVIEW        │
│ Contact      │                             │
│ Summary      │       HIMANSHU KUMAR        │
│ Skills       │       Full Stack Developer  │
│ Experience   │                             │
│ Projects     │       SUMMARY               │
│ Education    │       ...                   │
│ Achievements │                             │
│              │       EXPERIENCE            │
│              │       ...                   │
│ TEMPLATE     │                             │
│              │                             │
│ Classic      │                             │
│ Modern       │                             │
│ Minimal      │                             │
└──────────────┴─────────────────────────────┘

The editor itself should be standard React/HTML.

Do not render the entire editing UI through React-PDF.

PHASE 8 — Resume Templates

Create a template system:

ResumeDocument
      │
      ├── Classic
      ├── Modern
      ├── Minimal
      ├── Engineering
      └── Executive

All templates consume the exact same data.

This prevents template-specific data duplication.

PHASE 9 — React-PDF Rendering

Now bring in:

@react-pdf/renderer

The library officially supports browser and server rendering and React-based PDF components.

We create:

ResumePdfDocument
ResumePdfPage
ResumePdfHeader
ResumePdfSummary
ResumePdfSkills
ResumePdfExperience
ResumePdfProjects
ResumePdfEducation
ResumePdfAchievements

Then:

ResumeDocument
      ↓
Template
      ↓
React-PDF
      ↓
PDF

React-PDF also supports PDFDownloadLink, blobs, and controlled PDF updates, which fits the export workflow well.

PHASE 10 — Browser PDF Testing

This is where we actually test it in the browser before moving forward.

Test:

1 page
✓ No overflow
✓ No missing text
✓ Good spacing
✓ Correct page breaks
2 pages
✓ Experience doesn't break badly
✓ Section headings stay with content
✓ No orphan headings
Long resume
✓ Pagination works
✓ No crash
✓ No missing sections

React-PDF performs its own layout and pagination rather than simply printing HTML, so we need to test page-breaking behavior explicitly.

For our resumes, documents are small, so browser rendering should be perfectly reasonable. The React-PDF team specifically warns about very large documents; their guidance recommends moving large browser renders to a Web Worker when they become expensive.

We don't need that complexity for normal 1–3 page resumes initially.

PHASE 11 — ATS PDF Validator

This is a very important Skillezo differentiator.

After generating PDF:

PDF
 ↓
Extract text
 ↓
Compare against ResumeDocument
 ↓
Validate

Check:

✓ Candidate name
✓ Email
✓ Phone
✓ Summary
✓ Skills
✓ Experience
✓ Projects
✓ Education
✓ Achievements
✓ Keywords
✓ Reading order
✓ Missing text
✓ Page count

Then:

PDF Quality

98 / 100

✓ All content preserved
✓ Correct reading order
✓ No missing sections
✓ ATS-safe structure
✓ One page

This is much more valuable than saying:

"Our PDF looks ATS-friendly."

We verify our own generated PDF.

PHASE 12 — Master Resume

Now introduce:

MASTER RESUME

The candidate has one canonical resume.

Master Resume
       │
       ├── Full Stack Engineer
       ├── Frontend Engineer
       └── Backend Engineer

These are versions, not independent resumes.

All factual evidence comes from the Master Resume.

PHASE 13 — JD Tailoring

Now reconnect the existing job intelligence.

User:

Target Role:
Full Stack Engineer

Optional:

Paste Job Description

This preserves your established behavior: target role is the default analysis context, while a pasted JD is optional.

Then:

JD
 ↓
Role requirements
 ↓
Resume matching
 ↓
Section priorities
 ↓
AI suggestions
 ↓
Candidate approval
 ↓
Targeted Resume
PHASE 14 — Final Resume Optimization Loop

This becomes the complete system:

UPLOAD
   ↓
PARSE
   ↓
STRUCTURE
   ↓
SCORE
   ↓
IDENTIFY WEAK SECTIONS
   ↓
AI IMPROVE
   ↓
EVIDENCE CHECK
   ↓
CANDIDATE APPROVES
   ↓
RE-SCORE
   ↓
BUILD
   ↓
TAILOR
   ↓
RENDER PDF
   ↓
ATS VALIDATE
   ↓
DOWNLOAD

That's the actual Resume Intelligence product.

PHASE 15 — Resume Copilot

Only after everything above works.

Then:

✨ Ask Skillezo

"Improve my experience section."

"Make this resume one page."

"Why is my score low?"

"Tailor this to this job."

"Add my new project."

"Make the summary stronger."

The Copilot operates on:

ResumeDocument

rather than creating another disconnected AI system.

🔥 The development rule I want us to follow

For every phase, we create 4 documents.

/docs/resume-studio/
│
├── 00-architecture.md
├── 01-ingestion.md
├── 02-section-engine.md
├── 03-scoring.md
├── 04-studio-ui.md
├── 05-ai-editor.md
├── 06-rescore.md
├── 07-builder.md
├── 08-templates.md
├── 09-react-pdf.md
├── 10-pdf-testing.md
├── 11-ats-validator.md
├── 12-master-resume.md
├── 13-jd-tailoring.md
├── 14-final-optimization.md
└── 15-resume-copilot.md

And every phase document has the exact same structure:

# Phase X

## Objective

## Why we're building it

## Dependencies

## Existing Skillezo functionality reused

## Data model

## Backend changes

## API contracts

## Frontend changes

## AI behavior

## Deterministic logic

## UI states

## Error states

## Security / validation

## Browser test plan

## Backend test plan

## Acceptance criteria

## Performance requirements

## Definition of Done

This prevents Antigravity/AI coding from wandering away from the architecture.

🧪 Most important: browser-first development

We shouldn't do:

Write 5,000 lines
       ↓
Hope it works
       ↓
Open browser
       ↓
Everything broken

Instead:

Phase 1
 ↓
Implement
 ↓
Browser
 ↓
Test
 ↓
Fix
 ↓
Commit/checkpoint
 ↓
Phase 2

Every phase must end with:

✅ Browser verified
✅ API verified
✅ Existing functionality verified
✅ TypeScript clean
✅ Tests passing
✅ No regression

Only then move forward.

Performance rules

We should keep Resume Studio lightweight from day one.

Don't do
giant client-side AI bundles
unnecessary PDF rendering on every keystroke
rendering PDF whenever a text field changes
loading every template simultaneously
putting all diagnostics into the initial page
making the dashboard perform expensive analysis repeatedly
Do
Editor
 ↓
local/optimistic state
 ↓
debounced persistence

PDF:

User clicks Preview/Download
        ↓
Generate PDF

not:

Every keystroke
 ↓
Generate PDF

For controlled PDF updates, React-PDF provides usePDF, which can explicitly trigger document recomputation rather than forcing uncontrolled regeneration.

🏁 Our first milestone

I would not start with the PDF renderer.

The optimal order is:

MILESTONE 1
ResumeDocument
        ↓
Section extraction
        ↓
Section scores
        ↓
New Resume Studio UI
        ↓
Browser test

Then:

MILESTONE 2
AI section editor
        ↓
Evidence lock
        ↓
Accept/reject
        ↓
Re-score
        ↓
Browser test

Then:

MILESTONE 3
Resume Builder
        ↓
Templates
        ↓
React-PDF
        ↓
PDF preview/download
        ↓
Browser test

Then:

MILESTONE 4
ATS PDF validation
        ↓
Master Resume
        ↓
JD tailoring

Then:

MILESTONE 5
Resume Copilot
The final Skillezo Resume Studio
                    SKILLEZO
                       │
                       ▼
                ┌──────────────┐
                │ RESUME STUDIO│
                └──────┬───────┘
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
    ANALYZE         IMPROVE           BUILD
       │               │                │
   7 sections      AI + Evidence     Templates
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                     MATCH
                       │
                       ▼
                    EXPORT
                       │
                       ▼
                ATS PDF VALIDATION
                       │
                       ▼
                  JOB-READY RESUME

This is the architecture I would lock in before we write the next Antigravity prompt.

And I would keep React-PDF, not LaTeX, as the rendering layer: the current library is actively maintained, supports React 19/Next.js, browser + server rendering, custom fonts and controlled PDF generation.

The next step should be to create PHASE 0 — Architecture Freeze as the master implementation specification, then we execute one phase at a time in the actual browser, rather than giving Antigravity the entire project at once.