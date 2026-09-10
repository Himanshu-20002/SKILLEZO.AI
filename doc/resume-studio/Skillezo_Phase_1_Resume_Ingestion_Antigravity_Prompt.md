# SKILLEZO — PHASE 1
# RESUME INGESTION → CANONICAL ResumeDocument

## EXECUTION MODE

You are working as a senior full-stack engineer on the existing **Skillezo** project.

**Phase 0 is complete and frozen.**

This is **Phase 1 only**.

Your job is to build a reliable, production-ready **Resume Ingestion Normalization Pipeline** that converts existing raw resume parser output into the canonical `ResumeDocument` defined and frozen in Phase 0.

Do NOT redesign Resume Studio.

Do NOT implement section scoring.

Do NOT implement AI rewriting.

Do NOT implement the Resume Builder.

Do NOT implement PDF rendering.

Do NOT implement JD tailoring.

Do NOT implement Resume Copilot.

Do NOT introduce LaTeX.

Do NOT rewrite working Phase 1–7 intelligence.

The single objective of this phase is:

> **Take an uploaded/parsed resume and reliably transform it into a validated canonical ResumeDocument without losing supported information or inventing facts.**

---

# 1. PHASE 0 CONTRACT — DO NOT BREAK IT

Phase 0 established:

```text
ResumeDocument = Single Source of Truth
```

The architecture is:

```text
UPLOAD
   ↓
EXISTING PARSER
   ↓
RAW PARSER OUTPUT
   ↓
PHASE 1 NORMALIZER / MAPPER
   ↓
ResumeDocument
   ↓
VALIDATION
   ↓
PERSISTENCE
```

The canonical sections are:

```text
CONTACT
SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
ACHIEVEMENTS
```

The following boundaries are frozen:

```text
AI
 ↓
Suggestions / interpretation
```

and:

```text
Deterministic systems
 ↓
Validation / scoring / structural decisions
```

AI must never be used merely to force malformed parser output into a valid-looking resume.

---

# 2. FIRST TASK — INSPECT BEFORE CODING

Before modifying anything, inspect the repository thoroughly.

Specifically locate and understand:

### Existing parser

Find:

- PDF parser
- DOCX parser
- text extraction
- section extraction
- parser output types
- parser schemas
- parser confidence fields
- parser error handling
- existing normalization
- existing resume persistence

### Existing Resume Intelligence

Find:

- ResumeDocument files created in Phase 0
- schemas
- types
- repositories
- services
- existing resume models
- existing upload endpoints
- existing analysis endpoints
- existing fixtures
- existing tests

### Existing database

Determine:

- ORM
- current resume tables/models
- relationships
- migration strategy
- JSON/JSONB support
- transaction conventions
- repository/service conventions

### Existing client

Determine:

- upload UI
- resume dashboard
- Resume Intelligence UI
- Resume Studio
- loading/error states
- API client
- query/cache layer
- state management

Do not assume filenames or architecture.

Search the real repository first.

---

# 3. DO NOT DUPLICATE EXISTING INGESTION

If the project already has:

```text
ResumeUpload
ResumeParser
ResumeParserService
ResumeExtraction
ResumeAnalysis
```

reuse them.

The desired architecture is:

```text
Existing parser
      ↓
Phase 1 normalization adapter
      ↓
ResumeDocument
```

NOT:

```text
Existing parser
      ↓
New parser
      ↓
Another parser
      ↓
ResumeDocument
```

Do not create `ParserV2`, `ResumeParserNew`, or duplicate ingestion pipelines unless the existing implementation is genuinely unusable.

If a migration is necessary, document why.

---

# 4. DEFINE THE NORMALIZATION BOUNDARY

The core new component should conceptually be:

```text
RawResumeParserOutput
            ↓
ResumeDocumentNormalizer
            ↓
Validated ResumeDocument
```

Use the project's existing naming conventions.

The normalizer must be:

- deterministic
- testable
- side-effect controlled
- schema validated
- safe against malformed input
- idempotent where practical

A given raw parser output should produce the same normalized result unless an explicit normalization rule changes.

---

# 5. RAW PARSER OUTPUT MUST REMAIN DISTINCT

Do NOT pretend raw parser output is already ResumeDocument.

Maintain a clear boundary:

```text
Raw Parser Model
      ≠
ResumeDocument
```

The parser is responsible for extraction.

The normalizer is responsible for canonical mapping.

The canonical schema is responsible for structural validation.

---

# 6. NORMALIZATION PIPELINE

Implement the following conceptual pipeline:

```text
Raw Parser Output
       ↓
Input validation
       ↓
Field normalization
       ↓
Section classification / mapping
       ↓
Evidence assignment
       ↓
Canonical object construction
       ↓
ResumeDocument schema validation
       ↓
Persistence
```

Each stage should have a clear responsibility.

Do not put everything into one giant function.

---

# 7. CONTACT NORMALIZATION

Map available contact information into the canonical contact object.

Support, where available:

```text
name
email
phone
location
linkedin
github
portfolio
other relevant professional links
```

Normalize:

### Email

- trim whitespace
- normalize obvious formatting noise
- validate syntax
- preserve the original value when necessary for provenance
- do NOT invent an email

### Phone

- trim
- normalize obvious whitespace/separator noise
- preserve country code when available
- do NOT invent or guess digits

### Name

- trim
- normalize repeated whitespace
- preserve candidate-provided capitalization where practical
- do NOT infer a person's name from unrelated text unless the existing parser explicitly identifies it

### URLs

Normalize obvious:

```text
https://linkedin.com/in/...
linkedin.com/in/...
```

into a canonical URL representation if the existing architecture supports it.

Do NOT fabricate URLs.

---

# 8. SUMMARY NORMALIZATION

Map the existing parser's summary/profile/objective section into:

```text
summary
```

Rules:

- preserve factual content
- remove extraction artifacts
- normalize whitespace
- preserve meaningful sentence boundaries
- do not rewrite language
- do not improve the writing in Phase 1
- do not inject keywords
- do not use an LLM merely to clean ordinary parser output

Phase 1 is ingestion, NOT optimization.

---

# 9. SKILLS NORMALIZATION

Map extracted skills into:

```text
skills[]
```

Preserve the candidate's actual skills.

Normalize:

- whitespace
- duplicates caused by parsing
- obvious casing variations where safe

Example:

```text
React
react
REACT
```

may normalize to one canonical representation if the existing schema permits it.

Do NOT merge semantically different skills merely because they look similar.

For example:

```text
Java
JavaScript
```

must remain distinct.

Do not add skills because they are common for the target role.

Do not infer skills from a project unless the existing evidence model explicitly permits such provenance.

---

# 10. EXPERIENCE NORMALIZATION

Map each detected experience entry into the canonical experience structure.

Preserve, where available:

```text
job title
company
location
start date
end date
current status
description
bullets
```

Do NOT:

- rewrite bullets
- add metrics
- invent responsibilities
- convert a project into employment
- guess missing dates
- fabricate employer names

If a field is missing, preserve it as missing/null according to the canonical schema.

Do not insert placeholder facts such as:

```text
N/A Company
2024–2025
```

unless the canonical schema explicitly requires a representation for unknown values.

---

# 11. PROJECT NORMALIZATION

Map project entries into:

```text
projects[]
```

Preserve:

```text
project name
description
technologies
bullets
links
dates
```

Do NOT:

- improve project descriptions
- invent metrics
- invent GitHub URLs
- invent live demos
- infer deployment status
- create technology claims not supported by the parser/evidence

Project information should remain factual.

---

# 12. EDUCATION NORMALIZATION

Map education entries into:

```text
education[]
```

Preserve, where available:

```text
degree
field
institution
location
start date
end date
GPA
coursework
additional education details
```

Do not invent:

- GPA
- dates
- coursework
- honors

---

# 13. ACHIEVEMENT NORMALIZATION

Map achievements/certifications/awards into the canonical achievements structure.

Preserve factual information.

Do not rewrite.

Do not transform ordinary claims into achievements merely because they sound impressive.

Do not invent award names, rankings, certificates or numbers.

---

# 14. EVIDENCE / PROVENANCE

This is a critical Phase 1 requirement.

Every canonical fact should have provenance where the Phase 0 model supports it.

For parser-derived content:

```text
source = PARSED
```

For user-provided content:

```text
source = USER
```

For imported third-party information:

```text
source = IMPORTED
```

For explicitly verified candidate information:

```text
source = CONFIRMED
```

Do not mark parser-derived information as `CONFIRMED` automatically.

Example:

```text
Parsed phone number
    ↓
ResumeEvidence
source = PARSED
verified = false
```

Only explicit candidate confirmation can upgrade the provenance.

---

# 15. EVIDENCE GRANULARITY

Prefer evidence references that can eventually point to the specific canonical fact.

For example:

```text
Experience
  └── bullet
       └── evidenceId
```

or:

```text
Skill
  └── evidenceId
```

Use the existing Phase 0 model.

Do not over-engineer a new graph database or complex provenance engine.

The objective is traceability, not complexity.

---

# 16. NO HALLUCINATION RULE

Phase 1 must never use AI to invent missing data.

If parser output says:

```text
Built a web application
```

do NOT transform it into:

```text
Built a scalable web application serving 50,000 users
```

If no metric exists, no metric should be created.

If parser output contains:

```text
React, Next.js
```

do not automatically add:

```text
TypeScript
Node.js
PostgreSQL
```

unless those are independently supported by extracted evidence.

---

# 17. PARSER ARTIFACT CLEANING

The normalizer should safely clean common extraction artifacts such as:

```text
duplicate whitespace
broken line wrapping
obvious repeated headers/footers
encoding artifacts
empty bullets
empty sections
duplicate entries
```

But be conservative.

Do NOT aggressively “clean” text if doing so could remove meaningful candidate content.

When uncertain:

```text
preserve
```

rather than:

```text
delete
```

---

# 18. SECTION CLASSIFICATION

If the parser already provides section labels:

Use them.

If the parser returns a generic block structure:

Create a deterministic mapping layer using explicit rules already supported by the project.

Possible mappings:

```text
Profile / Objective / About → SUMMARY
Technical Skills / Skills → SKILLS
Employment / Work History → EXPERIENCE
Projects / Personal Projects → PROJECTS
Education / Academic → EDUCATION
Awards / Certifications / Achievements → ACHIEVEMENTS
```

Do not build an LLM classifier in Phase 1 unless the existing architecture already depends on one and it is impossible to normalize reliably without it.

Prefer deterministic mapping.

---

# 19. ORDER PRESERVATION

Preserve the meaningful order from the source resume where possible.

For example:

```text
Experience:
1. Most recent job
2. Previous job
3. Earlier job
```

should not be randomly reordered.

Likewise:

```text
Projects
Education
Achievements
```

should retain source order unless the canonical model explicitly defines another order.

Do not optimize ordering in Phase 1.

---

# 20. DATES

Normalize dates safely.

Support formats such as:

```text
Jan 2024
January 2024
2024
01/2024
2024-01
Present
```

Do not invent month/day precision when the source only provides a year.

For example:

```text
2024
```

must not become:

```text
2024-01-01
```

unless the canonical model explicitly stores precision separately.

Preserve date precision where possible.

---

# 21. EMPTY / PARTIAL RESUMES

A resume does NOT need every section to exist.

For example:

```text
Contact ✓
Summary ✗
Skills ✓
Experience ✗
Projects ✓
Education ✓
Achievements ✗
```

can still be a valid ResumeDocument if the canonical schema permits optional sections.

Do not fabricate missing sections.

The future scoring engine will determine whether missing sections are a problem.

Phase 1 only represents reality.

---

# 22. PARSER FAILURE HANDLING

Handle:

```text
empty PDF
corrupt PDF
image-only PDF
unsupported document
empty parser result
partial parser result
malformed parser output
schema mismatch
database failure
```

Return structured errors according to existing Skillezo conventions.

Do not expose stack traces.

Do not silently save a broken ResumeDocument.

---

# 23. OCR / IMAGE-ONLY DOCUMENTS

Inspect whether the current parser already supports OCR/image-only resumes.

If it does:

reuse it.

If it does not:

DO NOT introduce a large OCR system in Phase 1 unless it is already part of the existing product architecture.

Instead document:

```text
Unsupported / deferred:
image-only resume OCR
```

Do not expand scope.

---

# 24. DATABASE / PERSISTENCE

Map the normalized document into the existing persistence architecture.

Prefer:

```text
parse
 ↓
normalize
 ↓
validate
 ↓
persist
```

not:

```text
parse
 ↓
persist raw garbage
 ↓
try to fix later
```

If a transaction is appropriate, use the project's existing transaction conventions.

Do not duplicate resume records unnecessarily.

If the current database model can safely store the canonical document, extend it rather than creating a parallel storage system.

---

# 25. IDEMPOTENCY

Where practical:

```text
same parser output
+
same normalization rules
=
same ResumeDocument content
```

Running normalization twice must not duplicate:

```text
skills
experience
projects
evidence
```

Do not create duplicate evidence records unnecessarily.

---

# 26. API BOUNDARY

Inspect existing upload/parser endpoints first.

If an endpoint already performs:

```text
upload → parse
```

do not create another upload endpoint.

Add the smallest safe normalization boundary.

Conceptually:

```text
POST /resume/upload
        ↓
parser
        ↓
normalizer
        ↓
validator
        ↓
ResumeDocument
```

Use the project's existing route naming and service conventions.

---

# 27. CLIENT FLOW

The existing upload UI should eventually be capable of:

```text
Select resume
      ↓
Upload
      ↓
Parse
      ↓
Normalize
      ↓
Validate
      ↓
Save
      ↓
Open Resume Studio
```

For Phase 1, implement only the ingestion integration required to make this flow work with ResumeDocument.

Do NOT redesign the Resume Studio UI.

Do NOT build editing controls yet.

---

# 28. DEV FIXTURE

Extend the Phase 0 fixture system.

Create fixtures for at least:

### Full resume

Contains:

```text
Contact
Summary
Skills
Experience
Projects
Education
Achievements
```

### Partial resume

Missing multiple sections.

### Messy resume

Contains:

```text
duplicate whitespace
duplicate skills
odd date formats
broken line wraps
```

### Minimal resume

Only:

```text
Name
Email
Skills
Education
```

### Invalid parser output

Malformed data that should be rejected safely.

Do not use real personal information in production fixtures.

---

# 29. USE THE EXISTING SAMPLE RESUME AS A VALIDATION CASE

The existing test resume contains:

- Contact
- Summary
- Technical Skills
- Projects
- Education
- Achievements

and is therefore useful for validating the canonical mapping.

The Phase 1 implementation should preserve the factual content rather than rewrite it.

Do not hard-code the actual personal information into production source code.

---

# 30. TESTING REQUIREMENTS

Phase 1 must have comprehensive automated tests.

At minimum:

## Normalization tests

```text
✓ complete parser output → valid ResumeDocument
✓ partial parser output → valid partial ResumeDocument
✓ duplicate skills normalized
✓ whitespace normalized
✓ dates normalized safely
✓ URLs normalized safely
✓ missing values remain missing
```

## Evidence tests

```text
✓ parsed facts receive PARSED provenance
✓ user facts receive USER provenance
✓ imported facts receive IMPORTED provenance
✓ parser facts are not automatically CONFIRMED
✓ confidence bounds are validated
```

## Safety tests

```text
✓ no fabricated metrics
✓ no fabricated skills
✓ no fabricated employers
✓ no fabricated dates
✓ no fabricated links
```

## Round-trip tests

```text
Raw parser output
      ↓
ResumeDocument
      ↓
serialize
      ↓
deserialize
      ↓
same canonical content
```

## Idempotency

```text
normalize(raw)
=
normalize(normalize(raw))
```

where applicable to the chosen architecture.

---

# 31. REAL FILE TESTS

If existing test infrastructure supports fixture files, test with real:

```text
PDF
DOCX
```

fixtures.

Test:

```text
upload
→ parser
→ normalizer
→ schema validation
→ persistence
```

Do not rely only on mocked parser objects.

---

# 32. BROWSER TEST — MANDATORY

Phase 1 is not complete until it is tested in the real browser.

Open the existing Skillezo resume upload flow.

Upload a valid development/test resume.

Verify:

```text
✓ upload succeeds
✓ parser succeeds
✓ normalization succeeds
✓ ResumeDocument validation succeeds
✓ resume is persisted
✓ user is redirected/opened into Resume Studio
✓ all available sections appear
✓ no duplicated sections
✓ no duplicated skills
✓ no console errors
✓ no hydration errors
```

Then test a partial resume.

Then test a malformed/unsupported resume if the UI supports that case.

Document the results.

---

# 33. REGRESSION TEST

Verify that Phase 0 remains intact:

```text
✓ ResumeDocument schema
✓ Phase 0 dev fixture
✓ /dashboard/resume-studio
✓ /dashboard/resume-studio/dev
✓ /resume-studio redirect
```

Also verify existing functionality:

```text
✓ authentication
✓ dashboard
✓ existing Resume Intelligence
✓ existing parser
✓ existing AI systems
```

No regressions are acceptable.

---

# 34. PERFORMANCE REQUIREMENTS

Resume ingestion should be efficient.

Avoid:

- unnecessary LLM calls
- duplicate parsing
- duplicate database writes
- repeated schema validation of identical data
- giant client bundles
- expensive client-side normalization

Normalization should preferably happen server-side.

The client should receive the validated canonical result.

Do not introduce an AI call just to normalize simple whitespace, dates, URLs, or sections.

---

# 35. SECURITY REQUIREMENTS

Verify:

```text
✓ authenticated user
✓ resume belongs to requesting user
✓ no client-controlled userId trust
✓ uploaded files validated
✓ unsupported files rejected safely
✓ file size limits respected if already defined
✓ malicious text treated as untrusted
✓ parser output treated as untrusted
✓ no sensitive content logged unnecessarily
```

Do not expose internal parser errors or raw stack traces.

---

# 36. OBSERVABILITY

Reuse existing logging conventions.

Useful events include:

```text
resume_upload_started
resume_parse_succeeded
resume_parse_failed
resume_normalization_succeeded
resume_normalization_failed
resume_document_persisted
```

Do not log full resume contents unless the existing security/privacy architecture explicitly permits it.

Prefer IDs, status and timing metadata.

---

# 37. DOCUMENTATION

Create:

```text
/docs/resume-studio/01-ingestion.md
```

Document:

1. Existing parser architecture discovered
2. Raw parser output contract
3. Normalization architecture
4. ResumeDocument mapping
5. Field-level mapping rules
6. Evidence/provenance behavior
7. Date normalization
8. URL normalization
9. Section classification
10. Error handling
11. Persistence behavior
12. Idempotency behavior
13. API changes
14. Security
15. Performance
16. Test strategy
17. Browser verification
18. Known limitations
19. Deferred work

Update:

```text
/docs/resume-studio/README.md
```

Change:

```text
Phase 1 — Resume Ingestion
```

from pending to completed ONLY after all acceptance criteria pass.

Do NOT mark future phases completed.

---

# 38. DO NOT CHANGE SCORING

This is critical.

Phase 1 must NOT introduce:

```text
ATS score
section score
job match score
content score
impact score
```

Those belong to later phases.

If the current application displays old scores, preserve the existing behavior.

Do not mix the new ingestion pipeline with new scoring logic.

---

# 39. DO NOT CHANGE AI OPTIMIZATION

Do NOT introduce:

```text
AI rewrite
AI bullet improvement
AI summary rewriting
AI keyword insertion
AI job tailoring
```

The output of Phase 1 is factual canonical resume data.

Later phases consume it.

---

# 40. DO NOT BUILD PDF

Do not add:

```text
@react-pdf/renderer
```

unless it already exists and is required by existing functionality.

Phase 1 has no PDF generation responsibility.

The pipeline ends at:

```text
Validated ResumeDocument
```

---

# 41. FINAL ARCHITECTURE AFTER PHASE 1

The desired state is:

```text
                    RESUME UPLOAD
                          │
                          ▼
                  EXISTING PARSER
                          │
                          ▼
                Raw Parser Output
                          │
                          ▼
              PHASE 1 NORMALIZER
                          │
                          ▼
                 Evidence Mapping
                          │
                          ▼
               ResumeDocument Schema
                          │
                   ┌──────┴──────┐
                   ▼             ▼
              Persistence     Validation
                   │
                   ▼
             Resume Studio
```

Future phases then consume the canonical document:

```text
ResumeDocument
      │
      ├── Phase 2 → Section Intelligence
      ├── Phase 3 → Deterministic Scoring
      ├── Phase 4 → Studio UX
      ├── Phase 5 → AI Section Editor
      ├── Phase 6 → Improve + Re-score
      ├── Phase 7 → Builder
      ├── Phase 8 → Templates
      ├── Phase 9 → React-PDF
      └── Later → ATS Validation / Master Resume / JD Tailoring / Copilot
```

---

# 42. DEFINITION OF DONE

Phase 1 is complete ONLY when:

```text
[ ] Existing parser fully inspected
[ ] Existing upload flow fully inspected
[ ] Existing persistence fully inspected
[ ] Existing Phase 0 ResumeDocument fully inspected
[ ] Raw parser output contract identified
[ ] Normalizer implemented
[ ] Canonical mapping implemented
[ ] All seven section mappings handled
[ ] Evidence provenance implemented correctly
[ ] No facts invented
[ ] No metrics invented
[ ] No skills invented
[ ] No employers invented
[ ] No dates invented
[ ] No links invented
[ ] Parser artifacts safely cleaned
[ ] Partial resumes supported
[ ] Invalid parser output safely rejected
[ ] Normalization is deterministic
[ ] Duplicate data prevented
[ ] Persistence integrated
[ ] Authorization verified
[ ] Automated tests pass
[ ] Real PDF/DOCX fixture tests pass where supported
[ ] Browser upload test passes
[ ] Partial resume browser test passes
[ ] Regression tests pass
[ ] TypeScript has 0 new errors
[ ] Lint has 0 new errors
[ ] No runtime errors
[ ] Documentation created
[ ] Phase 0 remains intact
[ ] No Phase 2+ functionality implemented
```

---

# 43. REQUIRED FINAL REPORT

When finished, report exactly:

## A. Existing ingestion architecture

What already existed and how it works.

## B. Normalization architecture

What was added and why.

## C. ResumeDocument mapping

Show the final mapping structure.

## D. Evidence/provenance

Explain how source information is preserved.

## E. Files changed

Give exact file paths.

## F. Database changes

List migrations/models/schema changes.

## G. API changes

List actual endpoints changed/created.

## H. Dependencies

List dependencies added, if any, and why.

## I. Tests

Report:

```text
Unit tests:
Integration tests:
Fixture tests:
Browser tests:
TypeScript:
Lint:
```

## J. Browser verification

State exactly what was tested.

## K. Regression verification

State which existing features were verified.

## L. Known limitations

Only genuine limitations.

## M. Phase 2 readiness

Explain why the resulting ResumeDocument is ready for Section Intelligence.

---

# 44. WORKING STYLE

Follow this exact workflow:

```text
INSPECT
   ↓
MAP EXISTING SYSTEM
   ↓
DEFINE NORMALIZATION BOUNDARY
   ↓
IMPLEMENT SMALL PIECES
   ↓
TYPECHECK
   ↓
UNIT TEST
   ↓
INTEGRATION TEST
   ↓
RUN APPLICATION
   ↓
BROWSER TEST
   ↓
REGRESSION TEST
   ↓
FIX
   ↓
DOCUMENT
   ↓
FINAL REPORT
```

Do not implement the whole phase in one giant speculative change.

After each meaningful change:

- inspect the diff
- run relevant tests
- check TypeScript
- verify no unrelated files were modified

If you encounter architectural ambiguity:

1. inspect existing code
2. prefer existing conventions
3. choose the least disruptive solution
4. document the decision

Do not guess when the repository can answer the question.

---

# 45. HARD SCOPE BOUNDARY

Phase 1 ends at:

```text
UPLOAD
 ↓
PARSE
 ↓
NORMALIZE
 ↓
VALIDATE
 ↓
PERSIST
 ↓
OPEN RESUME STUDIO
```

Phase 1 does NOT include:

```text
SCORE
REWRITE
OPTIMIZE
BUILD
RENDER
TAILOR
COPILOT
```

Those are future phases.

---

# PHASE 1 SUCCESS CONDITION

At the end of Phase 1:

```text
ANY SUPPORTED RESUME
        ↓
EXISTING PARSER
        ↓
RELIABLE NORMALIZATION
        ↓
CANONICAL ResumeDocument
        ↓
VALIDATED + PERSISTED
        ↓
READY FOR PHASE 2
```

The most important outcome is **data integrity**.

If information cannot be confidently extracted or normalized:

```text
PRESERVE IT
or
MARK IT UNKNOWN
```

Never invent it.

Do not move into Phase 2 implementation.

Stop after Phase 1 and provide the required completion report.
