# SKILLEZO AI --- Phase 1: Career Profile Foundation & Domain Alignment

## Execution Mode

You are the lead software architect and senior full-stack engineer
working on the existing SKILLEZO AI codebase.

Phase 0 has already been completed and locked.

Use the Phase 0 audit:

``` text
doc/SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md
```

as the authoritative implementation baseline.

The repository already contains substantial working infrastructure. **Do
not rebuild existing systems.**

The core rule for this phase is:

> INSPECT → REUSE → EXTEND → TEST → ONLY THEN REMOVE OLD CODE.

------------------------------------------------------------------------

# 1. Phase 1 Objective

Establish the **Career Profile as the canonical source of truth for
career data** while preserving all existing functionality and
maintaining backward compatibility.

This phase is about **domain/model alignment only**.

At the end of Phase 1, the system must have a clear and enforceable
distinction between:

``` text
CAREER DATA
    ↓
Career Profile
```

and:

``` text
RESUME PRESENTATION
    ↓
ResumeDocument AST
```

The Career Profile owns the user's career facts.

The ResumeDocument owns how those facts are presented in a resume.

------------------------------------------------------------------------

# 2. Critical Existing Architecture

Phase 0 confirmed that the following already exist and must be reused:

## Existing Profile

``` text
ProfileModel
ProfileRepository
ProfileService
ProfileController
Profile APIs
```

The existing Profile already contains:

-   userId
-   headline
-   phone
-   bio
-   targetRole
-   targetRoleId
-   location
-   links
-   skills
-   experience
-   projects
-   education

The existing Profile service also hydrates profile information from
parsed resumes.

Do NOT create a second `CareerProfileModel`.

Instead:

> Evolve the existing ProfileModel into the canonical Career Profile.

------------------------------------------------------------------------

# 3. Existing Resume Infrastructure

Phase 0 confirmed the following already exist:

``` text
ResumeModel
ResumeRepository
ResumeService
ResumeParserService
ResumeDocumentNormalizer
ResumeDocument AST
ResumeRenderer
ResumePdfDocument
ATS Engine
Resume Intelligence
```

The existing ResumeDocument AST must remain the canonical **resume
presentation model**.

Do not replace it.

Do not create another resume document format.

Do not migrate the renderer to a new AST.

------------------------------------------------------------------------

# 4. Existing Evidence Infrastructure

Phase 0 confirmed that an evidence subsystem already exists:

``` text
server/src/core/ai/evidence/
```

It already contains concepts such as:

``` text
EvidenceType
VerificationStatus
CandidateEvidenceBundle
EvidenceCollector
ActionProposal.evidenceIds
```

Do NOT create a second evidence architecture.

Do NOT create duplicate CareerEvidence models if the existing
architecture can be extended.

Instead:

``` text
Existing Evidence System
        ↓
Career Profile
        ↓
AI Recommendations
        ↓
Resume / Tailoring
```

Reuse and extend the existing evidence layer.

------------------------------------------------------------------------

# 5. Target Domain Architecture

After Phase 1, the conceptual ownership must be:

``` text
                    USER
                     |
                     v
              CAREER PROFILE
              SOURCE OF TRUTH
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
   EXPERIENCE      SKILLS       PROJECTS
       |             |             |
       +-------------+-------------+
                     |
                     v
             CAREER EVIDENCE
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
 MASTER RESUME   CAREER GPS    JOB MATCHING
```

Resume presentation remains separate:

``` text
Career Profile
      |
      v
ResumeDocument AST
      |
      v
Resume Renderer
      |
      v
PDF
```

------------------------------------------------------------------------

# 6. Phase 1 Scope

Implement only the following:

### A. Career Profile domain alignment

### B. Evidence metadata integration

### C. Profile completeness foundation

### D. Profile versioning foundation

### E. Safe Profile ↔ Resume ingestion alignment

### F. Resume model variant foundation

### G. Target job metadata foundation

### H. Backward-compatible migrations

### I. Tests for all new invariants

Do NOT implement:

-   Resume Studio redesign
-   Resume Gallery
-   Tailoring UI
-   Tailor analyze/commit endpoints
-   Application AST snapshots
-   Career GPS migration
-   Auto-apply
-   New ATS engine
-   New AI provider
-   New resume renderer

Those belong to later phases.

------------------------------------------------------------------------

# 7. Step 1 --- Inspect Before Editing

Before changing code, inspect the exact current implementation of:

``` text
Profile.model.ts
ProfileRepository
ProfileService
ProfileController
Profile DTOs
Profile routes
Resume.model.ts
ResumeRepository
ResumeService
ResumeParserService
ResumeDocument types
ResumeDocumentNormalizer
Evidence subsystem
ActionProposal.model.ts
Application.model.ts
CareerPlan / SkillGap services
Relevant tests
```

Confirm actual field names and types.

Do not assume the Phase 0 audit is more accurate than the current
source.

If the code differs from the audit:

``` text
CURRENT SOURCE CODE = AUTHORITATIVE
```

Document the discrepancy.

------------------------------------------------------------------------

# 8. Step 2 --- Career Profile Model Enhancement

Extend the existing `ProfileModel`.

Do NOT create:

``` text
CareerProfileModel
```

unless the existing Profile architecture is proven technically incapable
of supporting the required domain.

The default implementation must be additive.

------------------------------------------------------------------------

# 9. Career Profile Metadata

Add or verify the following concepts where appropriate:

``` ts
profileCompleteness
profileVersion
lastSyncedResumeId
lastSyncedAt
```

Use actual project conventions for naming.

Do not blindly copy these names if equivalent fields already exist.

------------------------------------------------------------------------

# 10. Profile Completeness

Create a deterministic profile completeness foundation.

The score should be based on meaningful career information, not simply
the number of database fields populated.

At minimum consider:

``` text
Contact Information
Professional Summary
Skills
Experience
Projects
Education
Links
```

The implementation must be deterministic.

Do NOT use an LLM to calculate profile completeness.

Example conceptual output:

``` ts
{
  score: 82,
  sections: {
    contact: true,
    summary: true,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    links: false
  }
}
```

Adapt to the existing project's DTO conventions.

Do not duplicate completeness logic in multiple services.

Create one reusable calculation path.

------------------------------------------------------------------------

# 11. Profile Versioning

Introduce a lightweight versioning foundation.

The purpose is to make it possible to reason about:

``` text
Career Profile v1
Career Profile v2
Career Profile v3
```

This is NOT a full historical versioning system yet.

Do not build:

-   version history UI
-   rollback UI
-   audit timeline
-   complete profile snapshots

unless already present.

For Phase 1, establish a safe version increment mechanism when canonical
career data is materially changed.

Avoid incrementing the version for:

-   reads
-   score calculations
-   rendering
-   unrelated metadata updates

Use the existing project's persistence conventions.

------------------------------------------------------------------------

# 12. Evidence Integration

Integrate the existing evidence infrastructure with Profile data.

The goal is:

``` text
Profile Career Fact
       ↓
Evidence Metadata
```

Where technically appropriate, profile career facts should be able to
identify:

``` text
source
verification status
evidence references
```

Use the existing evidence terminology and types.

Do not introduce conflicting enums such as:

``` text
IMPORTED
USER_VERIFIED
USER_EDITED
NEEDS_REVIEW
```

if the existing project already uses:

``` text
VERIFIED
UNVERIFIED
REVIEW_REQUIRED
```

Instead, determine whether the existing statuses can represent the
required semantics.

If an additional status is truly required, document why before adding
it.

------------------------------------------------------------------------

# 13. Source References

Career information imported from a resume should eventually be traceable
to its source.

Reuse existing evidence/source structures if available.

A conceptual source reference may contain:

``` text
sourceType
sourceDocumentId
section
sourceText
createdAt
```

Do not introduce redundant source-reference schemas.

If the existing evidence system already supports equivalent information,
connect to it instead.

------------------------------------------------------------------------

# 14. Resume → Profile Hydration

The existing method:

``` text
ProfileService.hydrateFromParsedResume()
```

must remain the primary ingestion path unless source inspection proves
otherwise.

Preserve its current non-destructive behavior.

Existing user-entered information must NOT be overwritten by a resume
upload.

Desired conceptual behavior:

``` text
Existing Profile
       +
Parsed Resume
       ↓
Safe Merge
       ↓
Updated Career Profile
```

Rules:

### Existing verified/user-entered data

Prefer existing canonical data.

### Empty profile field

Populate from parsed resume.

### New skill

Append only if not already represented.

### Existing skill

Merge intelligently without creating duplicates.

### Existing experience

Avoid blindly duplicating the same company/role.

### Existing project

Avoid blindly duplicating the same project.

### Conflicting data

Do not silently overwrite canonical user data.

Flag or preserve the conflict according to existing project conventions.

------------------------------------------------------------------------

# 15. Important: Resume Is Not the Career Source of Truth

After this phase, establish the architectural rule:

``` text
Resume.extractedData
        ≠
Canonical Career Data
```

Existing `Resume.extractedData` may remain for:

-   ingestion/debugging
-   backward compatibility
-   parser output
-   historical compatibility

But new career intelligence should progressively depend on:

``` text
Profile
```

rather than treating every Resume record as another source of truth.

Do not remove `extractedData` in Phase 1.

------------------------------------------------------------------------

# 16. Resume Variant Foundation

Extend the existing `ResumeModel` additively.

Introduce or verify a concept equivalent to:

``` ts
variantType:
  MASTER
  TAILORED
```

Use the project's existing enum conventions.

For the current phase:

``` text
MASTER
```

is the default for existing resumes unless repository evidence requires
another classification.

Existing resume records must continue working.

------------------------------------------------------------------------

# 17. Parent Resume Relationship

Add or verify:

``` text
parentResumeId
```

This establishes the future relationship:

``` text
MASTER RESUME
      |
      +---- Tailored Resume A
      |
      +---- Tailored Resume B
      |
      +---- Tailored Resume C
```

For Master resumes:

``` text
parentResumeId = null
```

For Tailored resumes:

``` text
parentResumeId = master/parent resume id
```

Do not implement the tailoring creation workflow yet.

This is only the domain foundation.

------------------------------------------------------------------------

# 18. Target Job Metadata

Add a future-compatible target job structure to Resume only if it fits
the current model conventions.

Conceptually:

``` ts
targetJob: {
  targetRole,
  targetCompany,
  jobDescriptionText,
  targetMatchScore
}
```

Use appropriate validation and optionality.

Important:

This metadata must be optional.

Master resumes should not require a target job.

Only tailored variants will eventually use it.

Do NOT implement job tailoring in this phase.

------------------------------------------------------------------------

# 19. Resume Scores

The existing SKILLEZO system has multi-pillar resume scoring.

Preserve existing score behavior.

If the Resume model already has equivalent fields, reuse them.

If the model needs persistent score metadata, use the existing
conventions.

Conceptually:

``` text
ATS Compatibility Score
Role & JD Match Score
Impact & Content Score
```

Do not redesign the scoring engines.

Do not change scoring formulas.

Do not replace deterministic ATS logic with AI.

------------------------------------------------------------------------

# 20. Master Resume Semantics

Phase 1 must establish a clear technical distinction:

``` text
Master Resume
    ↓
Canonical career presentation
```

versus:

``` text
Tailored Resume
    ↓
Job-specific derived presentation
```

However:

**Do NOT implement the full Master Resume generation pipeline yet.**

That belongs to Phase 2.

For Phase 1, only establish the data model and ownership foundation.

------------------------------------------------------------------------

# 21. Existing Resume Compatibility

All existing resumes must remain readable.

Existing documents must not become invalid.

Do not require existing records to be manually migrated.

Use safe defaults for newly introduced optional fields.

Examples:

``` text
Existing Resume
    ↓
variantType defaults to MASTER
```

Only use this exact behavior if it matches the actual schema design.

------------------------------------------------------------------------

# 22. Database Migration Safety

This phase must be backward compatible.

Before modifying schemas:

1.  Inspect existing production-like documents.
2.  Identify fields that may be missing.
3.  Ensure new fields are optional or safely defaulted.
4.  Avoid destructive migrations.
5.  Avoid changing existing field meaning.
6.  Avoid changing existing IDs.
7.  Avoid changing existing relationships.
8.  Avoid deleting existing data.

If a migration script is genuinely required, create it separately and
make it idempotent.

Do not run destructive migrations.

------------------------------------------------------------------------

# 23. Repository Layer

If repositories already exist:

``` text
ProfileRepository
ResumeRepository
```

extend them rather than bypassing them.

Do not introduce direct Mongoose queries inside controllers.

Maintain:

``` text
Controller
    ↓
Service
    ↓
Repository
    ↓
Model
```

------------------------------------------------------------------------

# 24. API Changes

Only introduce API changes required for Phase 1.

Existing endpoints should remain backward compatible.

Potential areas:

``` text
GET /api/profile/me
PATCH /api/profile/me
POST /api/profile/skills
POST /api/resumes/upload
GET /api/resumes
GET /api/resumes/:id
```

Do not create tailoring endpoints yet.

Do not create application snapshot endpoints yet.

Do not break existing response shapes unnecessarily.

If DTOs need new fields, add them without removing existing fields.

------------------------------------------------------------------------

# 25. Profile API Response

Ensure the profile response can eventually expose:

``` text
profileCompleteness
profileVersion
verification/evidence metadata where supported
```

Do not expose internal database structures unnecessarily.

Use proper DTOs.

Do not expose raw AI/internal evidence internals unless already part of
the API contract.

------------------------------------------------------------------------

# 26. Resume API Response

Ensure resume responses can eventually expose:

``` text
variantType
parentResumeId
targetJob
scores
```

only where appropriate and only after confirming the existing response
architecture.

Do not leak raw MongoDB implementation details.

------------------------------------------------------------------------

# 27. Career GPS

Do NOT migrate Career GPS completely in Phase 1.

Do not change:

``` text
SkillGapEngine
EmployabilityEngine
CareerPlan
```

logic unless required to maintain compatibility with the new Profile
changes.

The audit found Career GPS currently consumes both Profile and Resume.
Keep that behavior temporarily.

Phase 1 should only ensure:

``` text
Career Profile
    ↓
is structurally capable of becoming
the canonical source for Career GPS
```

Full migration belongs later.

------------------------------------------------------------------------

# 28. AI Architecture

Do not redesign AI.

Continue using the existing:

``` text
ModelGateway
Gemini/OpenAI providers
Zod structured output
Evidence subsystem
ActionProposal
```

Do not create another AI gateway.

Do not create another evidence collector.

Do not create another resume optimization engine.

------------------------------------------------------------------------

# 29. Frontend Scope

Phase 1 frontend changes must be minimal.

Allowed:

-   Display profile completeness if the existing profile page
    architecture supports it.
-   Display newly available metadata safely.
-   Update TypeScript interfaces/types.
-   Fix API response typing.
-   Add small verification/source indicators only if required.

Do NOT:

-   redesign Career Profile UI
-   redesign Resume Studio
-   create Resume Gallery
-   create Tailoring UI
-   create new dashboard navigation
-   create complex onboarding
-   build new visual systems

Those belong to later phases.

------------------------------------------------------------------------

# 30. Tests --- Mandatory

Every Phase 1 change must have tests.

At minimum add/extend tests for:

## Test 1 --- Existing profile compatibility

``` text
Existing Profile
    ↓
Load
    ↓
No regression
```

------------------------------------------------------------------------

## Test 2 --- Profile completeness

Test:

``` text
Empty profile
Partial profile
Complete profile
```

Ensure deterministic output.

------------------------------------------------------------------------

## Test 3 --- Resume hydration

``` text
Existing Profile
+
Resume
↓
Hydrate
```

Verify:

-   existing values are preserved
-   missing values are populated
-   skills are not duplicated
-   experience is not blindly duplicated
-   projects are not blindly duplicated

------------------------------------------------------------------------

## Test 4 --- Evidence preservation

Imported profile information must retain available evidence/source
metadata according to the existing evidence architecture.

------------------------------------------------------------------------

## Test 5 --- Resume variant defaults

Existing Resume records should safely behave as Master where
appropriate.

------------------------------------------------------------------------

## Test 6 --- Tailored parent relationship

Schema validation must support:

``` text
MASTER
parentResumeId = null
```

and future:

``` text
TAILORED
parentResumeId = valid resume
```

No tailoring workflow is required yet.

------------------------------------------------------------------------

## Test 7 --- Target job optionality

Master resume must not require:

``` text
targetJob
```

------------------------------------------------------------------------

## Test 8 --- Existing Resume AST

Existing ResumeDocument AST records must continue to:

``` text
load
validate
render
export
```

without regression.

------------------------------------------------------------------------

## Test 9 --- Existing API compatibility

Existing profile/resume API tests must continue passing.

------------------------------------------------------------------------

# 31. Required Invariants

After Phase 1, these architectural invariants must hold:

### Invariant A

``` text
Career Profile = canonical career data
```

### Invariant B

``` text
ResumeDocument = presentation structure
```

### Invariant C

``` text
Resume.extractedData ≠ canonical career source
```

### Invariant D

``` text
Master Resume does not require a target job
```

### Invariant E

``` text
Tailored Resume can reference a parent Resume
```

### Invariant F

``` text
Existing resumes remain compatible
```

### Invariant G

``` text
Existing application records remain compatible
```

### Invariant H

``` text
Existing ResumeDocument AST remains renderable
```

### Invariant I

``` text
AI changes must remain evidence-grounded
```

------------------------------------------------------------------------

# 32. Do Not Implement These Yet

Explicitly do NOT implement:

``` text
❌ Career Profile redesign
❌ Resume Studio redesign
❌ Resume Gallery
❌ TailorResumeModal
❌ /tailor/analyze
❌ /tailor/commit
❌ Application AST snapshots
❌ Historical PDF viewer
❌ Career GPS full migration
❌ Auto Apply
❌ New ATS engine
❌ New Resume AST
❌ New AI Gateway
❌ New Evidence subsystem
❌ Destructive schema migration
❌ Deletion of Resume.extractedData
```

------------------------------------------------------------------------

# 33. Required Documentation

Create:

``` text
doc/SKILLEZO_PHASE_1_IMPLEMENTATION.md
```

The document must include:

## 1. Changes Made

List exact files changed.

## 2. Profile Model Changes

Document every new/modified field.

## 3. Evidence Integration

Explain how existing evidence infrastructure is connected.

## 4. Resume Model Changes

Document:

``` text
variantType
parentResumeId
targetJob
score metadata
```

or the equivalent actual implementation.

## 5. Migration Strategy

Explain backward compatibility.

## 6. API Changes

Document changed DTOs/endpoints.

## 7. Test Changes

List all new/modified tests.

## 8. Architecture Invariants

Confirm each invariant.

## 9. Deferred Work

Explicitly list what remains for Phase 2+.

------------------------------------------------------------------------

# 34. Git-Safe Implementation

Before changing a file:

-   inspect it
-   understand its consumers
-   make the smallest safe modification

Avoid large unrelated formatting changes.

Do not rename files unnecessarily.

Do not reorganize directories unless required.

Do not modify unrelated modules.

Keep the diff focused.

------------------------------------------------------------------------

# 35. Completion Criteria

Phase 1 is complete only when:

-   Existing ProfileModel has been safely evolved.
-   No second CareerProfileModel was unnecessarily created.
-   Existing evidence subsystem is reused.
-   Profile completeness foundation exists.
-   Profile version foundation exists.
-   Resume variant foundation exists.
-   Parent resume relationship exists.
-   Optional target job metadata exists where appropriate.
-   Existing resumes remain compatible.
-   Existing ResumeDocument AST remains untouched as the canonical
    presentation model.
-   Resume → Profile hydration remains non-destructive.
-   Duplicate career data is not blindly introduced.
-   Existing APIs remain compatible.
-   Career GPS remains functional.
-   Existing AI infrastructure remains intact.
-   All relevant tests pass.
-   New invariants are tested.
-   `doc/SKILLEZO_PHASE_1_IMPLEMENTATION.md` is created.
-   No Phase 2+ functionality is prematurely implemented.

------------------------------------------------------------------------

# 36. Final Verification

Run the complete existing test suite.

The Phase 0 audit reported:

``` text
38 test suites
338 passing tests
```

Use the current repository as the source of truth and report the actual
current result.

If the test count differs from the Phase 0 audit, do not fake or
normalize the number.

Report:

``` text
Existing tests:
Passed:
Failed:
Skipped:
New tests:
Total:
```

If failures existed before Phase 1, distinguish:

``` text
Pre-existing failure
```

from:

``` text
Phase 1 regression
```

------------------------------------------------------------------------

# 37. Final Output

At completion, provide a concise implementation summary:

``` text
PHASE 1 STATUS: COMPLETE

Career Profile:
- ...

Evidence:
- ...

Resume Model:
- ...

Compatibility:
- ...

APIs:
- ...

Tests:
- ...

Files Changed:
- ...

Deferred:
- ...

PHASE 2 READY: YES / NO
```

Do not automatically begin Phase 2.

------------------------------------------------------------------------

# FINAL INSTRUCTION

Implement **Phase 1 only**.

The objective is not to build new UI.

The objective is to establish a clean, backward-compatible domain
foundation where:

``` text
                    CAREER PROFILE
                   SOURCE OF TRUTH
                          |
             +------------+------------+
             |            |            |
             v            v            v
         EXPERIENCE     SKILLS      PROJECTS
             |
             v
       EXISTING EVIDENCE
          SUBSYSTEM
             |
             v
       FUTURE RESUME ENGINE
             |
             v
        MASTER RESUME
             |
             v
       FUTURE TAILORING
             |
             v
      TAILORED RESUME
             |
             v
       FUTURE APPLICATION
```

Do not rebuild what already works.

Do not remove existing functionality.

Do not proceed into Phase 2.

**Inspect → Reuse → Extend → Test → Document → Stop.**
