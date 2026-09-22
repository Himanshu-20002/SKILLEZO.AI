# SKILLEZO AI --- Phase 2 Implementation Prompt

## Career Profile Foundation → Canonical Source of Truth

You are implementing **Phase 2 of SKILLEZO AI**.

Phase 1 is COMPLETE and FROZEN.

Phase 1 delivered: - Deterministic PDF-only resume ingestion - Canonical
`ResumeDocument` AST normalization - No fabricated candidate facts -
Partial experience preservation - Source-preservation invariants -
Deterministic evidence IDs - Source provenance - Date precision
preservation - Skill deduplication - Real PDF integration - Storage
failure cleanup - Full regression passing - Server and client TypeScript
compilation passing

Do NOT modify Phase 1 behavior unless a genuine compatibility issue is
discovered.

------------------------------------------------------------------------

# 1. PHASE 2 OBJECTIVE

Build the **Career Profile Foundation**.

The goal is to establish the existing `ProfileModel` as the candidate's
**canonical career source of truth**, while keeping `ResumeDocument` as
the canonical presentation/document AST.

Architecture:

``` text
Resume Upload
     ↓
ResumeDocument AST
     ↓
Profile Hydration
     ↓
CAREER PROFILE
     ├── Master Resume
     ├── Career GPS
     └── Job Engine
```

Core ownership:

``` text
Career Profile = canonical career facts
ResumeDocument = canonical resume presentation/layout
Tailored Resume = derived presentation snapshot
Application = immutable historical snapshot
```

Do NOT merge these responsibilities.

------------------------------------------------------------------------

# 2. FIRST STEP --- READ THE CURRENT REPOSITORY

Before writing code, inspect:

``` text
doc/SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md

server/src/modules/profile/
server/src/modules/resume/
server/src/modules/resume-intelligence/
server/src/core/ai/evidence/
```

Also inspect: - ProfileModel - ProfileService - ResumeModel -
ResumeDocument types/schema - ResumeDocumentNormalizer - ResumeService -
Existing evidence services/types - Profile routes/controllers - Existing
resume upload flow - Existing tests

Verify the current repository before implementing anything. Do not
blindly follow the audit if code has changed.

------------------------------------------------------------------------

# 3. DO NOT CREATE CareerProfileModel

There is already an existing `ProfileModel`.

Evolve it.

Do NOT create: - `CareerProfileModel` - `CandidateCareerProfile` -
`MasterProfile` - a second career repository

The intended ownership is:

``` text
ProfileModel
    ↓
Career Profile
```

------------------------------------------------------------------------

# 4. CAREER PROFILE DOMAIN

The Career Profile represents durable candidate facts.

Use the existing ProfileModel schema for:

### Identity / Contact

-   fullName
-   email
-   phone
-   location
-   links

### Professional Identity

-   headline
-   bio / summary
-   targetRole
-   targetRoleId

### Career Facts

-   skills
-   experience
-   projects
-   education

Do not duplicate these facts into another model.

------------------------------------------------------------------------

# 5. PROFILE VERSIONING

Inspect the existing implementation first.

If profile versioning does not already exist, introduce the smallest
compatible mechanism, such as:

``` text
profileVersion: number
```

Increment it only when canonical career facts materially change.

Do NOT increment for: - page visits - UI state - previews - rendering -
ATS scoring - non-persistent UI changes

Document what counts as a meaningful profile mutation.

------------------------------------------------------------------------

# 6. PROFILE COMPLETENESS

Add a deterministic completeness mechanism only if one does not already
exist.

It should be explainable and non-AI-driven.

Conceptually:

``` text
profileCompleteness:
  score
  missingFields[]
  sectionStatus
```

Possible sections: - identity - contact - summary - skills -
experience - projects - education - links

Derive required fields from existing product/domain rules. Do not invent
arbitrary weights without documenting them.

Completeness must never block resume ingestion.

------------------------------------------------------------------------

# 7. SOURCE / PROVENANCE

Reuse the existing evidence subsystem:

``` text
server/src/core/ai/evidence/
```

Do NOT create another evidence architecture.

Conceptually:

``` text
Career Profile Fact
      ↓
Evidence ID(s)
      ↓
Source Resume / Source Text
      ↓
Verification State
```

For parsed facts, reuse existing semantics such as:

``` text
source = PARSED
verified = false
sourceDocumentId = source resume/document
```

Do not automatically mark parsed facts verified.

Do not build a full evidence-management UI in this phase unless it
already exists and only needs compatibility changes.

------------------------------------------------------------------------

# 8. RESUME → PROFILE HYDRATION

Phase 1 already produces the canonical ResumeDocument.

Phase 2 must make the flow:

``` text
ResumeDocument
      ↓
ProfileService
      ↓
ProfileModel
```

Reuse the existing:

``` text
ProfileService.hydrateFromParsedResume()
```

or its current equivalent.

Do NOT create a second hydration pipeline.

Ensure hydration is: - source-grounded - deterministic -
non-destructive - provenance-aware - safe for repeated ingestion

Missing incoming values must NOT erase valid existing profile values.

------------------------------------------------------------------------

# 9. MERGE STRATEGY

Define a deterministic merge policy between:

``` text
Existing Profile Fact
```

and:

``` text
Incoming Parsed Resume Fact
```

Possible outcomes:

``` text
create
update
retain
ignore
flag
```

Never blindly replace the entire ProfileModel with the latest resume.

Example:

``` text
Existing:
phone = manually entered
headline = manually entered

Resume:
phone = missing
headline = missing
```

Result:

``` text
phone = existing
headline = existing
```

Absence in a resume is not evidence that the profile fact should be
deleted.

------------------------------------------------------------------------

# 10. CONFLICT HANDLING

If Profile and Resume contain conflicting values, do not silently choose
one unless an existing product rule already defines precedence.

Example:

``` text
Profile:
headline = Frontend Engineer

Resume:
headline = Full Stack Engineer
```

Use existing domain behavior if available.

Otherwise implement a minimal deterministic conflict representation
rather than an AI resolution system.

Possible concept:

``` text
profileConflict:
  field
  existingValue
  incomingValue
  source
  status
```

Do NOT build a complete conflict-resolution product in Phase 2.

------------------------------------------------------------------------

# 11. MANUAL PROFILE DATA MUST BE PRESERVED

Example:

``` text
Profile:
React
Next.js
TypeScript
GraphQL

Resume:
React
Next.js
```

Do NOT delete:

``` text
TypeScript
GraphQL
```

The latest resume may simply be incomplete.

The resume enriches the Career Profile; it does not automatically
replace it.

------------------------------------------------------------------------

# 12. EXPERIENCE / PROJECT / EDUCATION DEDUPLICATION

Repeated ingestion must not continuously create duplicate records.

Use deterministic identity signals already supported by the schema.

Possible experience identity:

``` text
company + title + normalized dates
```

Use the safest available identity from the existing implementation.

Do NOT use array index.

Do NOT use fuzzy AI matching.

If identity cannot be established safely:

``` text
preserve both
```

rather than silently deleting information.

Apply the same principle to: - projects - education

------------------------------------------------------------------------

# 13. SKILL MERGING

Reuse Phase 1 normalization behavior.

Case-insensitive duplicates:

``` text
React
react
REACT
```

→ one canonical skill.

Keep distinct:

``` text
Java
JavaScript

C
C++

Node
Node.js
```

Do not use substring matching.

Do not merge `Node` and `Node.js` unless an existing canonical taxonomy
explicitly defines them as equivalent.

------------------------------------------------------------------------

# 14. MASTER RESUME SEMANTICS

Establish:

``` text
Career Profile
      ↓
Master Resume
```

The Master Resume is a presentation derived from the Career Profile.

Do NOT build the complete Master Resume generation engine in this phase
if it belongs to later Resume Studio work.

If an existing default/master Resume record exists, evolve it safely.

Do NOT create another source of truth.

------------------------------------------------------------------------

# 15. RESUME VARIANT SEMANTICS

Inspect the existing Resume model.

If needed for the domain contract, establish:

``` text
variantType:
  MASTER
  TAILORED
```

and only where supported:

``` text
parentResumeId
targetJobId
targetJobSnapshot
```

Do NOT implement tailored resume generation now.

Tailoring belongs to a later phase.

------------------------------------------------------------------------

# 16. MASTER / TAILORED ISOLATION

The intended relationship is:

``` text
Career Profile
    ↓
Master Resume
    ↓
Tailored Resume
```

A Tailored Resume must never modify the Master Resume or Career Profile.

Do not implement full tailoring in Phase 2; only establish the ownership
contract and compatible data fields if necessary.

------------------------------------------------------------------------

# 17. PROFILE HYDRATION SAFETY

Hydration must be:

-   deterministic
-   idempotent where possible
-   non-destructive
-   source-grounded
-   provenance-aware

Repeated processing of the same ResumeDocument must not continuously
create duplicates.

------------------------------------------------------------------------

# 18. API / SERVICE BOUNDARIES

Inspect existing Profile APIs before changing them.

Do not create duplicate endpoints.

If existing APIs already support profile retrieval/update, extend them
only when necessary.

Keep controllers thin.

Business rules belong in services.

Canonical path:

``` text
Resume ingestion
    ↓
ProfileService
    ↓
ProfileModel
```

------------------------------------------------------------------------

# 19. TEST REQUIREMENTS

Add or expand tests covering:

### Suite 1 --- Profile Hydration

ResumeDocument correctly hydrates ProfileModel.

### Suite 2 --- Missing Data Safety

Missing incoming fields do not erase existing profile fields.

### Suite 3 --- No Fabrication

No placeholder values are introduced.

### Suite 4 --- Skill Merge

Case-insensitive duplicate skills merge safely.

### Suite 5 --- Experience Deduplication

Repeated ingestion does not create duplicate experiences.

### Suite 6 --- Project Deduplication

Repeated ingestion does not create duplicate projects.

### Suite 7 --- Education Deduplication

Repeated ingestion does not create duplicate education records.

### Suite 8 --- Manual Data Preservation

Manually entered profile data survives resume ingestion.

### Suite 9 --- Conflict Handling

Conflicting values follow the defined deterministic policy.

### Suite 10 --- Provenance

Parsed facts retain appropriate source/evidence references.

### Suite 11 --- Idempotency

Hydrating the same ResumeDocument twice does not continuously mutate the
profile.

### Suite 12 --- Profile Versioning

Version changes only on meaningful canonical fact mutations.

### Suite 13 --- Completeness

Completeness calculation is deterministic.

### Suite 14 --- Regression

All existing tests continue to pass.

------------------------------------------------------------------------

# 20. CRITICAL REPEATED-UPLOAD TEST

Explicitly test:

``` text
Upload Resume A
    ↓
Profile hydrated
    ↓
Upload Resume A again
    ↓
Profile hydrated again
```

Expected:

``` text
No duplicate skills
No duplicate experience
No duplicate projects
No duplicate education
No destructive overwrites
No unnecessary profile version increments
```

------------------------------------------------------------------------

# 21. CRITICAL MANUAL-PROFILE TEST

Test:

``` text
Profile:
Skill = GraphQL
Phone = manually entered
Headline = manually entered

Resume:
Skill = React
Phone = missing
Headline = missing
```

Expected:

``` text
Skills:
GraphQL
React

Phone:
manual value retained

Headline:
manual value retained
```

------------------------------------------------------------------------

# 22. PROFILE COMPLETENESS

Completeness must be:

``` text
deterministic
explainable
stable
```

Conceptual structure:

``` text
{
  score: number,
  missingFields: string[],
  sections: {
    identity: ...,
    contact: ...,
    skills: ...,
    experience: ...,
    education: ...,
    projects: ...
  }
}
```

Do not use an LLM.

Do not block ingestion.

------------------------------------------------------------------------

# 23. DOCUMENTATION

Update Phase 2 documentation with:

1.  Career Profile ownership
2.  ProfileModel responsibilities
3.  ResumeDocument responsibilities
4.  Resume → Profile hydration
5.  Merge rules
6.  Conflict behavior
7.  Skill merge behavior
8.  Experience/project/education deduplication
9.  Evidence/provenance
10. Profile versioning
11. Profile completeness
12. Master Resume relationship
13. Deferred future work

Clearly document:

``` text
Career Profile = source of truth
ResumeDocument = presentation AST
Master Resume = canonical presentation
Tailored Resume = derived snapshot
Application = immutable historical snapshot
```

------------------------------------------------------------------------

# 24. HARD EXECUTION BOUNDARIES

Phase 2 MUST NOT implement:

-   Full Resume Studio redesign
-   Resume Builder redesign
-   AI bullet rewriting
-   ATS redesign
-   JD tailoring
-   Tailored Resume generation
-   Application snapshot redesign
-   Career GPS migration
-   Auto Apply
-   DOCX parsing
-   New evidence subsystem
-   New Resume AST
-   Large UI redesign
-   LLM-based profile merging
-   LLM-based completeness scoring

Phase 2 is the **Career Profile Foundation only**.

------------------------------------------------------------------------

# 25. IMPLEMENTATION SAFETY

Before modifying each file:

1.  Read the current implementation.
2.  Identify existing behavior.
3.  Preserve backward compatibility.
4.  Reuse existing types/services.
5.  Make the smallest architectural change necessary.
6.  Add tests alongside behavior changes.

Do not perform broad refactoring unrelated to Phase 2.

Do not rewrite stable Phase 1 components.

------------------------------------------------------------------------

# 26. VERIFICATION

Before declaring Phase 2 complete:

### Server

Run the actual repository test command discovered from `package.json`.

Run the actual server typecheck command.

### Client

Run the actual client typecheck command.

### Regression

All existing tests must pass.

Do NOT use a fixed historical test count as the acceptance criterion.

Success means:

``` text
Existing tests: PASS
New Phase 2 tests: PASS
TypeScript: 0 errors
No Phase 1 regressions
```

------------------------------------------------------------------------

# 27. MANUAL VERIFICATION

Verify:

### Case 1 --- New Resume

Empty profile + resume upload.

Expected: - ResumeDocument created - Profile populated -
Evidence/provenance attached where supported

### Case 2 --- Existing Profile

Existing manually entered data + resume missing those fields.

Expected: - Existing information remains

### Case 3 --- Duplicate Resume

Upload same resume twice.

Expected: - No uncontrolled duplication

### Case 4 --- Conflicting Information

Profile and resume contain different values.

Expected: - Defined deterministic conflict behavior - No silent
destructive overwrite

### Case 5 --- Missing Sections

Resume contains only name, skills and education.

Expected: - Profile remains valid - Existing profile information is
preserved

### Case 6 --- Profile Completeness

Modify profile fields.

Expected: - Completeness updates deterministically

------------------------------------------------------------------------

# 28. FINAL ACCEPTANCE CRITERIA

Phase 2 is complete only when:

1.  `ProfileModel` is the canonical Career Profile source of truth.
2.  No duplicate Career Profile model is introduced.
3.  ResumeDocument remains the canonical presentation AST.
4.  Resume ingestion hydrates Career Profile through the existing
    service architecture.
5.  Missing resume fields do not erase existing profile data.
6.  Manual profile data is preserved.
7.  Duplicate skills are handled deterministically.
8.  Duplicate experiences/projects/education are prevented safely.
9.  Ambiguous records are preserved rather than silently deleted.
10. Evidence/provenance uses the existing evidence architecture.
11. Parsed facts are not automatically marked verified.
12. Profile versioning is deterministic.
13. Profile completeness is deterministic.
14. Master Resume semantics are established without implementing full
    tailoring.
15. Tailored Resume generation remains deferred.
16. No Phase 1 regression is introduced.
17. All existing and new tests pass.
18. Server and client TypeScript compile successfully.
19. Documentation accurately reflects ownership and data flow.
20. No unrelated architecture is introduced.

------------------------------------------------------------------------

# 29. FINAL OUTPUT REQUIRED FROM ANTIGRAVITY

After implementation, produce:

``` text
PHASE 2 WALKTHROUGH
```

Include:

1.  Files modified
2.  Files created
3.  Existing architecture reused
4.  Career Profile ownership changes
5.  Hydration/merge behavior
6.  Evidence/provenance behavior
7.  Profile versioning
8.  Completeness behavior
9.  Master Resume relationship
10. Tests added
11. Full regression results
12. TypeScript results
13. Known limitations
14. Deferred work

Do not claim completion unless actual repository verification passes.

------------------------------------------------------------------------

# PHASE 2 STATUS

Before implementation:

``` text
PLANNED — READY FOR IMPLEMENTATION
```

After implementation:

``` text
COMPLETED — VERIFIED
```

only when all acceptance criteria and regression checks pass.
