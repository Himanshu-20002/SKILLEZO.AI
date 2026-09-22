# SKILLEZO AI — PHASE 1 IMPLEMENTATION PROMPT

## Resume Ingestion → Canonical ResumeDocument

You are the lead software architect and senior full-stack engineer working on the existing SKILLEZO AI codebase.

Phase 0 — Current Architecture Audit has already been completed and locked.

Use:

```text
doc/SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md
```

as the architectural baseline.

This is **PHASE 1 ONLY**.

---

# 1. PHASE 1 OBJECTIVE

Implement a deterministic, zero-hallucination Resume Ingestion Normalization Pipeline:

```text
PDF Upload
    ↓
Upload Validation
    ↓
PDF Parsing
    ↓
IResumeExtractedData + rawText
    ↓
Deterministic Normalization
    ↓
Canonical ResumeDocument AST
    ↓
Schema Validation
    ↓
MongoDB Persistence
    ↓
Open Resume Studio
```

The pipeline must never invent:

* names
* email addresses
* phone numbers
* companies
* job titles
* dates
* skills
* technologies
* metrics
* achievements
* certifications
* responsibilities
* projects
* URLs
* education information

The normalizer may clean formatting and parser artifacts, but it must not create facts.

---

# 2. HARD EXECUTION BOUNDARY

Implement ONLY Resume Ingestion → Canonical ResumeDocument.

## DO NOT IMPLEMENT

```text
❌ ATS scoring redesign
❌ ATS re-scoring redesign
❌ AI bullet rewriting
❌ AI optimization
❌ AI-generated resume content
❌ Resume Builder UI redesign
❌ Resume Studio redesign
❌ PDF rendering changes
❌ JD tailoring
❌ TailorResumeModal
❌ Copilot
❌ Career GPS redesign
❌ Auto Apply
❌ Application snapshot redesign
❌ Resume Gallery
❌ DOCX parsing
❌ New AI gateway
❌ New evidence subsystem
❌ New Resume AST
```

The pipeline stops at:

```text
Upload
→ Parse
→ Deterministic Normalize
→ Validate
→ Persist
→ Open Studio
```

---

# 3. PDF ONLY

Phase 1 officially supports:

```text
PDF
```

The existing:

```text
pdf-parse
```

implementation should be reused.

Do NOT install `mammoth`.

Do NOT implement DOCX parsing.

If DOCX is uploaded, reject it cleanly at the upload/parser boundary with a user-friendly message such as:

```text
PDF resumes are currently supported. DOCX support will be added in a later phase.
```

Do not allow DOCX rejection logic to leak into the canonical normalizer.

---

# 4. INSPECT BEFORE MODIFYING

Before changing anything, inspect the actual current implementation of:

```text
server/src/modules/resume/resume.service.ts

server/src/modules/resume/resume.parser.ts

server/src/modules/resume-intelligence/document/resume-document.normalizer.ts

server/src/modules/resume-intelligence/document/resume-document.schema.ts

server/src/modules/resume-intelligence/document/resume-document.types.ts

server/src/database/models/Resume.model.ts

server/tests/unit/modules/resume-ingestion.spec.ts

server/src/modules/resume-intelligence/document/resume-document.fixture.ts

doc/resume-studio/01-ingestion.md

doc/resume-studio/README.md
```

Also inspect their direct consumers.

Do not assume line numbers from previous plans are still accurate.

The current source code is authoritative.

If the current code differs from the Phase 0 audit, use the actual code and document the discrepancy.

---

# 5. EXISTING ARCHITECTURE MUST BE REUSED

The repository already contains:

```text
ResumeParserService
ResumeDocumentNormalizer
ResumeDocument AST
ResumeDocumentSchema
ResumeModel
ResumeService
ResumeRenderer
ResumePdfDocument
Evidence subsystem
Existing ingestion tests
```

Reuse these.

Do NOT create:

```text
NewResumeNormalizer
NewResumeAST
NewResumeParser
NewEvidenceSystem
```

unless source inspection proves the existing implementation cannot support the required behavior.

---

# 6. NORMALIZER HARDENING

Modify:

```text
resume-document.normalizer.ts
```

to enforce deterministic, conservative normalization.

The normalizer may perform:

```text
- whitespace normalization
- bullet-marker cleanup
- parser artifact cleanup
- safe string trimming
- deterministic date normalization
- deterministic skill deduplication
- deterministic section mapping
- deterministic evidence assignment
```

The normalizer must NOT perform:

```text
- summarization
- rewriting
- inference
- metric generation
- skill inference
- company inference
- role inference
- missing-data generation
- semantic embellishment
```

---

# 7. NO PLACEHOLDER DATA

Remove any fallback such as:

```text
candidate@example.com
Candidate
Unknown
N/A
Not Provided
```

if those values are being inserted as facts.

For example, this is forbidden:

```text
Missing email
    ↓
candidate@example.com
```

Correct behavior:

```text
Missing email
    ↓
email = undefined
    ↓
warning if appropriate
```

If the schema currently requires an email, modify the schema safely so the canonical AST can represent missing email.

Use:

```ts
z.string().email().optional()
```

or the project's equivalent.

Do not use an empty string if optionality is cleaner unless the existing AST conventions require it.

---

# 8. INVALID EMAIL HANDLING

If source text contains:

```text
not-an-email
```

do NOT transform it into a fake valid email.

Correct behavior:

```text
Invalid email
    ↓
No canonical email
    ↓
Optional ingestion warning
```

The original raw source remains available through the raw text/evidence mechanism.

---

# 9. EMPTY SECTION RULE

Partial resumes are valid.

If the source does not contain experience:

```json
"experience": []
```

If the source does not contain projects:

```json
"projects": []
```

If the source does not contain achievements:

```json
"achievements": []
```

Do NOT create:

```text
Unknown company
Unknown role
Sample project
Candidate achievement
```

Every populated AST item must be traceable to actual source content.

---

# 10. SECTION COVERAGE

Inspect the actual `ResumeDocument` schema/types and create tests for every real canonical section.

Do NOT hard-code an assumption that there are exactly "7 sections".

The AST/schema is authoritative.

At minimum verify the actual implementation of:

```text
contact
summary
skills
experience
projects
education
certifications
achievements
```

If certifications and achievements are separate canonical sections, test them separately.

If the actual AST uses a different structure, follow the actual schema and document it.

---

# 11. DATE NORMALIZATION

Implement conservative date normalization.

The key invariant is:

> Never increase temporal precision beyond what the source provides.

Examples:

```text
Source:
2022

AST:
2022
```

```text
Source:
January 2022

AST:
2022-01
```

```text
Source:
Jan 15, 2022

AST:
2022-01-15
```

Never do:

```text
2022
→
2022-01-01
```

unless the source actually contains January 1.

Test at minimum:

```text
2022
Jan 2022
January 2022
01/2022
2022-01
2022-01-15
Present
Current
```

Preserve `Present` / `Current` semantics according to the existing AST representation.

---

# 12. SKILL NORMALIZATION

Skills may be deduplicated deterministically.

Case-insensitive duplicate example:

```text
React
react
REACT
```

should become one canonical entry.

However, do NOT perform substring-based deduplication.

These must remain distinct:

```text
Java
JavaScript

C
C++

Node
Node.js
```

Do not infer related skills.

Do not expand abbreviations unless the source parser already explicitly provides the expanded form.

---

# 13. BULLET NORMALIZATION

Clean obvious parser artifacts only.

Allowed:

```text
• Built feature
- Built feature
▪ Built feature
```

→

```text
Built feature
```

Also safely remove:

* dangling bullet markers
* excessive whitespace
* empty bullet entries
* obvious duplicated parser delimiters

Do NOT rewrite semantic content.

For example:

```text
"Improved application performance"
```

must never become:

```text
"Improved application performance by 35%"
```

No metric may be invented.

Do not aggressively delete duplicated text unless it is clearly a parser artifact.

When uncertain, preserve the source text.

---

# 14. ZERO-HALLUCINATION INVARIANT

For every canonical AST fact, establish:

```text
AST Fact
   ↓
Source Evidence
```

Examples:

```text
AST Skill
    ↓
must appear in source/parser data
```

```text
AST Company
    ↓
must appear in source/parser data
```

```text
AST Metric
    ↓
must appear in source/parser data
```

```text
AST Email
    ↓
must appear as a valid source email
```

If there is no source evidence:

```text
DO NOT CREATE THE FACT
```

---

# 15. EVIDENCE IDs

Reuse the existing evidence system.

Inspect:

```text
server/src/core/ai/evidence/
```

and existing `ResumeEvidence` implementation.

Evidence IDs must be deterministic for identical input.

Do NOT generate random UUIDs for normalized evidence if deterministic identity is required.

Use a stable strategy based on existing architecture.

A conceptual strategy could be:

```text
hash(
    resume/source identity
    +
    section
    +
    item index
    +
    normalized source text
)
```

But first inspect the existing evidence implementation.

Do not invent a competing ID system.

Tests must verify:

```text
same source
    ↓
same evidence ID
```

and:

```text
different source content
    ↓
different evidence identity
```

---

# 16. EVIDENCE PROVENANCE

Existing parsed evidence should preserve the project's existing semantics, such as:

```text
source = PARSED
verified = false
```

Do not introduce a second verification system.

Use existing:

```text
EvidenceType
VerificationStatus
CandidateEvidenceBundle
ResumeEvidence
```

where applicable.

Every evidence object must have confidence within:

```text
0.0 <= confidence <= 1.0
```

If confidence is not actually meaningful for a deterministic parser output, follow the existing evidence model rather than inventing arbitrary confidence scores.

---

# 17. DETERMINISM

The normalizer must be deterministic.

Given identical parser input:

```text
normalize(input)
```

must always produce the same canonical output.

Test:

```text
const a = normalize(input)
const b = normalize(input)

expect(a).toEqual(b)
```

Do NOT use:

```text
Math.random()
Date.now()
random UUIDs
non-deterministic iteration
```

for canonical normalization output.

If timestamps are required by persistence infrastructure, they must not be part of the deterministic normalization comparison.

---

# 18. IMPORTANT — IDEMPOTENCY

Do NOT implement an invalid test such as:

```text
normalize(raw) === normalize(normalize(raw))
```

if `normalize()` accepts parser output but returns a `ResumeDocument`.

Those are different types.

Instead test:

### Determinism

```text
normalize(raw) === normalize(raw)
```

### Canonical stability

If the architecture has a canonicalization function:

```text
canonicalize(document) === canonicalize(document)
```

If the normalizer genuinely supports `ResumeDocument` input, then and only then add a true idempotency test.

Do not force this capability into the normalizer merely to satisfy a test.

---

# 19. FIXTURES

Create or extend fixtures with:

```text
FULL_RESUME_PARSER_OUTPUT

PARTIAL_RESUME_PARSER_OUTPUT

MESSY_RESUME_PARSER_OUTPUT

MINIMAL_RESUME_PARSER_OUTPUT

MALFORMED_PARSER_OUTPUT
```

### FULL

Include:

* contact
* summary
* skills
* experience
* projects
* education
* certifications/achievements according to actual AST

### PARTIAL

Example:

```text
Name
Email
Skills
Education
```

No experience.

No project.

No summary.

### MESSY

Include:

```text
duplicate whitespace
mixed date formats
bullet artifacts
duplicate skills
parser delimiters
```

### MINIMAL

Only a few valid fields.

Verify that the AST remains valid.

### MALFORMED

Include deliberately invalid parser structures.

Verify graceful failure.

Do not silently create fake data from malformed fields.

---

# 20. RESUME SERVICE INTEGRATION

Modify:

```text
resume.service.ts
```

only where required.

The upload flow must remain:

```text
Upload
 ↓
Validate file
 ↓
Parse PDF
 ↓
Extract data
 ↓
Normalize
 ↓
Validate AST
 ↓
Persist Resume
 ↓
Hydrate existing profile if currently part of the flow
 ↓
Return success
```

Do not redesign Profile architecture in this phase.

Do not redesign Career GPS.

---

# 21. STRUCTURED INGESTION LOGGING

Add structured events if the project already has a compatible logging mechanism:

```text
resume_upload_started
resume_parse_succeeded
resume_normalization_succeeded
resume_document_persisted
```

Include useful metadata such as:

```text
resumeId
userId where safe
file type
duration
section counts
warning count
```

Do not log:

```text
raw resume contents
full email
phone
private resume text
sensitive personal information
```

Avoid leaking PII into logs.

---

# 22. INGESTION WARNINGS

Do NOT overload:

```text
ResumeModel.parsingError
```

with non-fatal warnings if that field semantically means parsing failure.

Keep:

```text
parsingError
```

for actual failures.

For successful ingestion with warnings, use the existing telemetry/metadata mechanism if one exists.

If a persistent warning field is genuinely required and does not exist, inspect the model first and add the smallest safe additive structure.

Conceptually:

```ts
{
  code: "SECTION_UNPARSED",
  section: "projects",
  severity: "warning",
  message: "..."
}
```

Warnings must never imply ingestion failure when the canonical AST was successfully persisted.

---

# 23. VALIDATION BEFORE PERSISTENCE

Before writing:

```text
ResumeModel.resumeDocument
```

to MongoDB:

1. Normalize.
2. Validate against canonical schema.
3. Reject invalid AST.
4. Only then persist.

Never persist an invalid canonical AST.

If validation fails:

```text
Do not silently swallow the error.
```

Return/log a structured ingestion failure.

Do not create partial fake data just to make schema validation pass.

---

# 24. PDF-ONLY UPLOAD VALIDATION

Inspect the current upload validation.

Ensure Phase 1 accepts:

```text
application/pdf
```

and valid PDF file extensions according to existing conventions.

DOCX must be rejected.

Do not install:

```text
mammoth
```

for this phase.

---

# 25. TEST SUITE

Expand:

```text
server/tests/unit/modules/resume-ingestion.spec.ts
```

Use the existing test framework and conventions.

Create tests covering:

## Suite 1 — Canonical Normalization

Every actual ResumeDocument section.

Verify:

* correct mapping
* correct field types
* correct empty sections
* no synthetic entries

---

## Suite 2 — Partial & Minimal Resumes

Verify:

```text
missing summary → no fabricated summary
missing experience → []
missing projects → []
missing achievements → []
missing email → undefined
```

---

## Suite 3 — No-Hallucination Safety

Explicitly verify:

```text
No candidate@example.com
No "Candidate"
No "Unknown"
No "N/A"
No fabricated metrics
No fabricated skills
No fabricated companies
No fabricated dates
No fabricated responsibilities
```

Also test source preservation:

```text
Input:
"Improved website performance"

Output must not become:
"Improved website performance by 35%"
```

---

## Suite 4 — Evidence & Provenance

Verify:

```text
source = PARSED
verification state matches existing architecture
confidence bounds are valid
evidence IDs are deterministic
```

---

## Suite 5 — Determinism

Run the same fixture multiple times.

Verify identical canonical output.

Verify identical evidence identities.

---

## Suite 6 — Malformed Input

Verify malformed parser data:

* does not crash unexpectedly
* does not silently invent fields
* produces structured failure/warnings
* does not persist invalid AST

---

## Suite 7 — Date Precision

Explicitly test:

```text
2022
Jan 2022
January 2022
01/2022
2022-01
2022-01-15
Present
Current
```

Verify precision is never increased.

---

## Suite 8 — Skill Deduplication

Test:

```text
React
react
REACT
```

→ one skill.

And:

```text
Java
JavaScript
C
C++
```

remain distinct.

---

## Suite 9 — PDF Integration

Use an actual PDF fixture if the repository already contains one.

Verify:

```text
PDF
 ↓
pdf-parse
 ↓
normalize
 ↓
validate
 ↓
AST
```

Do not require external internet access.

---

# 26. FULL REGRESSION

Run the repository's actual test commands.

Do NOT assume exact test counts.

First inspect:

```text
server/package.json
client/package.json
root package.json
```

and determine the correct commands.

Acceptance condition:

```text
All pre-existing tests pass
+
All new Phase 1 tests pass
+
No Phase 1 regression
```

Do not require an exact number such as:

```text
340 tests
```

because adding tests changes the count.

---

# 27. TYPECHECK

Inspect the repository's actual scripts.

Run the appropriate typecheck command(s).

Do not assume:

```text
npm run type-check
```

exists.

If the project uses separate commands:

```text
server typecheck
client typecheck
```

run the appropriate ones.

Acceptance:

```text
0 Phase 1 type errors
```

---

# 28. MANUAL VERIFICATION

After automated tests pass:

### Test 1 — Real PDF

Upload a real test PDF.

Verify:

```text
Upload
 ↓
Parse
 ↓
Normalize
 ↓
Validate
 ↓
Persist
 ↓
Resume Studio
```

Verify the Studio displays the resulting canonical document.

---

### Test 2 — Minimal PDF

Upload a PDF containing only:

```text
Name
Email
Skills
Education
```

Verify:

```text
experience = []
projects = []
achievements = []
```

and no fabricated data appears.

---

### Test 3 — Missing Email

Upload a resume without email.

Verify:

```text
contact.email === undefined
```

and no placeholder email exists.

---

### Test 4 — Browser

Check:

```text
0 hydration errors
0 unexpected console errors
correct rendering
```

Do not modify the renderer to make this pass.

If the existing renderer cannot render an optional field, fix only the minimum compatibility issue without redesigning rendering.

---

# 29. DATABASE VERIFICATION

Inspect the resulting MongoDB Resume document.

Verify:

```text
resumeDocument
```

contains a valid canonical AST.

Verify:

```text
evidence
```

is present where defined by the existing AST.

Verify no fake data exists.

Verify existing fields such as:

```text
rawText
extractedData
storageKey
status
```

remain compatible.

Do not remove `extractedData` in Phase 1.

---

# 30. DOCUMENTATION

Update:

```text
doc/resume-studio/01-ingestion.md
```

Document:

1. Supported input format
2. PDF parser
3. Parser output
4. Normalization pipeline
5. Canonical AST
6. Section mapping
7. Contact normalization
8. Date normalization
9. Skill normalization
10. Bullet normalization
11. Evidence provenance
12. Deterministic evidence IDs
13. No-hallucination guarantees
14. Validation
15. Persistence
16. Warning handling
17. Error handling
18. Security/PII logging considerations
19. Test coverage and results

Update:

```text
doc/resume-studio/README.md
```

only after all acceptance criteria pass.

Do not mark Phase 1 complete prematurely.

---

# 31. ACCEPTANCE CRITERIA

Phase 1 is complete only if:

```text
[ ] PDF upload works
[ ] Unsupported DOCX is rejected cleanly
[ ] pdf-parse remains the parser
[ ] Parser output is normalized deterministically
[ ] Canonical ResumeDocument is produced
[ ] ResumeDocument passes schema validation
[ ] Invalid AST is never persisted
[ ] Missing email remains missing
[ ] No placeholder email exists
[ ] No placeholder names exist
[ ] No fake metrics exist
[ ] No fake skills exist
[ ] No fake companies exist
[ ] No fake dates exist
[ ] Empty sections remain empty
[ ] Date precision is preserved
[ ] Skills are safely deduplicated
[ ] Evidence provenance is preserved
[ ] Evidence IDs are deterministic
[ ] Confidence values remain within valid bounds
[ ] Non-fatal warnings do not masquerade as parsing failures
[ ] Existing Resume AST remains renderable
[ ] Existing ingestion behavior remains compatible
[ ] Existing tests pass
[ ] New tests pass
[ ] Typecheck passes
[ ] Manual PDF upload passes
[ ] Minimal PDF upload passes
[ ] Browser has no Phase 1 regressions
[ ] Documentation updated
```

---

# 32. IMPORTANT ARCHITECTURAL RULES

Never violate these:

### Rule 1

```text
ResumeDocument = presentation structure
```

### Rule 2

```text
Parser output = source-derived data
```

### Rule 3

```text
Normalizer = deterministic transformation
```

### Rule 4

```text
AI = NOT part of Phase 1 normalization
```

### Rule 5

```text
Missing information = missing information
```

Never replace it with a guess.

### Rule 6

```text
Lower source precision
    must remain
lower AST precision
```

### Rule 7

```text
Existing working infrastructure
    must be reused
```

### Rule 8

```text
When uncertain:
preserve source information
rather than invent or delete it.
```

---

# 33. FINAL REPORT

When implementation is complete, provide:

```text
PHASE 1 STATUS: COMPLETE / BLOCKED

Files changed:
- ...

Files created:
- ...

Normalizer changes:
- ...

Schema changes:
- ...

Ingestion changes:
- ...

Evidence changes:
- ...

Tests:
- Existing:
- New:
- Passed:
- Failed:

Typecheck:
- ...

Manual verification:
- PDF:
- Minimal PDF:
- Missing email:
- Studio rendering:

Known warnings:
- ...

Deferred:
- DOCX
- ATS redesign
- AI rewriting
- Tailoring
- Studio redesign

PHASE 2 READY:
YES / NO
```

Do not start Phase 2 automatically.

---

# FINAL COMMAND

Implement **Phase 1 only**.

Do not redesign unrelated architecture.

Do not install DOCX dependencies.

Do not introduce AI into normalization.

Do not modify ATS logic.

Do not modify PDF rendering.

Do not build tailoring.

Do not rewrite Resume Studio.

Do not create a second Resume AST.

Do not create a second evidence system.

Make the smallest safe changes necessary to produce a deterministic, validated, zero-hallucination canonical ResumeDocument from PDF parser output.

**INSPECT → REUSE → HARDEN → TEST → VERIFY → DOCUMENT → STOP.**
