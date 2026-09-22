# SKILLEZO AI — Phase 3 Implementation Prompt
## Master Resume Generation & Resume Studio UI Integration

You are working on the existing **SKILLEZO AI** codebase.

Phase 1 (Resume Ingestion → canonical `ResumeDocument`) is COMPLETE and FROZEN.

Phase 2 (Career Profile Foundation → `ProfileModel` as the sole canonical source of truth) is COMPLETE and FROZEN.

Your task is to implement **Phase 3: Master Resume Generation & Resume Studio UI Integration**.

---

# 1. PHASE 3 OBJECTIVE

Make the Career Profile foundation visible and usable through the existing Resume Studio.

The core flow must become:

```text
Career Profile (`ProfileModel`)
        ↓
Master Resume Generation / Synchronization
        ↓
Canonical `ResumeDocument` AST
        ↓
Existing Resume Renderer
        ↓
Resume Studio UI
```

The Master Resume is a **presentation artifact derived from the Career Profile**.

`ProfileModel` remains the **sole canonical source of persistent candidate facts**.

Do NOT create a second source of truth.

Do NOT create a new `CareerProfileModel`.

Do NOT replace the existing `ResumeDocument` AST.

Do NOT rebuild the existing renderer unless a concrete compatibility issue requires a minimal change.

---

# 2. EXISTING ARCHITECTURE TO PRESERVE

Before making changes, inspect the current repository and reuse existing implementations.

Important existing concepts include:

- `ProfileModel`
- `ProfileService`
- `ResumeModel`
- `ResumeDocument`
- `ResumeDocumentNormalizer`
- `ResumeRenderer`
- `ResumePdfDocument`
- existing Resume Studio
- existing resume APIs
- existing ATS diagnostics
- existing AI optimization/proposal flow
- existing evidence subsystem
- existing authentication and authorization
- existing logging conventions
- existing tests

Do not duplicate any of these systems.

If an existing service already performs part of the required behavior, extend it rather than creating a parallel implementation.

---

# 3. NON-NEGOTIABLE DOMAIN CONTRACT

The following ownership rules must remain true after Phase 3.

## Career Profile

`ProfileModel` owns persistent career facts:

- contact information
- headline
- bio/summary facts
- target role
- location
- links
- skills
- experience
- projects
- education
- other persistent candidate facts already supported by the existing model

## Master Resume

`ResumeModel` with:

```ts
variantType: "MASTER"
```

is a presentation artifact.

It may contain:

- ResumeDocument AST
- layout
- styling
- section ordering
- formatting
- presentation-specific configuration
- generated resume metadata

It must NOT become a competing canonical store of candidate facts.

## Tailored Resume

Tailored resumes are NOT the focus of Phase 3.

Do not implement full JD tailoring in this phase.

## Application

Application snapshot behavior is NOT the focus of Phase 3.

Do not redesign application snapshots in this phase.

---

# 4. PHASE 3 SCOPE

Implement the following:

1. Master Resume generation from `ProfileModel`
2. Master Resume synchronization
3. Master Resume API/service layer
4. Resume Studio integration
5. Master Resume loading
6. Master Resume preview
7. Safe profile → resume synchronization
8. Clear UI distinction between Career Profile data and presentation
9. Existing ResumeDocument renderer integration
10. Tests
11. Documentation

---

# 5. FIRST TASK — AUDIT BEFORE CODING

Before changing code, inspect:

### Backend

- `Profile.model.ts`
- `profile.service.ts`
- `Resume.model.ts`
- `ResumeDocument` types/interfaces
- `ResumeDocumentNormalizer`
- resume service
- resume controller/routes
- existing resume APIs
- existing renderer
- PDF generation
- authentication middleware
- evidence types
- existing logging utilities
- existing tests

### Frontend

Inspect:

- Resume Studio page
- Resume Studio components
- resume hooks
- resume API clients
- preview/canvas components
- section editor components
- ATS components
- optimization UI
- resume state management
- routing
- loading/error states

Do not assume the architecture from documentation alone.

Use the actual repository implementation as the source of truth.

---

# 6. MASTER RESUME GENERATION

Create or extend an appropriate backend service responsible for generating the Master Resume presentation from the Career Profile.

Prefer an existing resume service if one already provides suitable functionality.

Conceptually:

```ts
ProfileModel
    ↓
Master Resume Builder
    ↓
ResumeDocument AST
```

The builder must map ProfileModel facts into the existing canonical `ResumeDocument` structure.

It must preserve:

- experience bullets
- project bullets
- skills
- education
- links
- summary/bio
- contact information
- relevant profile facts

Do not invent candidate information.

Do not use an LLM to fabricate missing content.

Do not generate placeholder candidate facts such as:

```text
Unknown Company
Software Engineer
N/A
Unknown University
```

Missing profile information should remain missing.

---

# 7. RESUME DOCUMENT RULE

The existing `ResumeDocument` AST remains the canonical representation for resume presentation.

Do NOT introduce:

```text
MasterResumeDocument
CareerResumeDocument
ProfileResumeDocument
NewResumeSchema
```

unless the repository already contains such a type and it is genuinely required.

Prefer the existing:

```text
ResumeDocument
```

with:

```text
variantType: MASTER
```

at the Resume model level.

---

# 8. MASTER RESUME CREATION

Implement a safe operation equivalent to:

```text
Create/Get Master Resume
```

Expected behavior:

### If no Master Resume exists

Generate one from the current ProfileModel and persist it as:

```ts
variantType: "MASTER"
```

### If a Master Resume exists

Return the existing Master Resume.

Do NOT create duplicate Master Resumes.

There should normally be one active Master Resume per candidate.

Use the existing `isDefault` / status semantics where appropriate rather than introducing duplicate concepts.

---

# 9. MASTER RESUME SYNCHRONIZATION

Implement an explicit synchronization mechanism.

Conceptually:

```text
Profile changed
      ↓
Sync Master Resume
      ↓
Read ProfileModel
      ↓
Generate updated ResumeDocument
      ↓
Persist presentation artifact
```

Synchronization must be deterministic.

Given the same ProfileModel state, generation should produce the same logical ResumeDocument content.

Do not modify Career Profile during synchronization.

Do not mutate unrelated Resume records.

Do not create a new Resume record for every synchronization.

Prefer updating the existing Master Resume.

---

# 10. IMPORTANT — USER PRESENTATION CUSTOMIZATION

Do not accidentally erase presentation preferences.

Separate:

### Canonical career facts

Owned by:

```text
ProfileModel
```

from:

### Presentation configuration

Owned by:

```text
Master Resume / ResumeDocument builder configuration
```

Examples of presentation configuration:

- template
- typography
- spacing
- section order
- margins
- layout
- styling
- visual configuration

A profile synchronization must not blindly destroy these settings.

If the current implementation already stores these settings in:

```text
builderConfig
```

or ResumeDocument styling/layout fields, preserve them.

---

# 11. PROFILE → MASTER RESUME MAPPING

Define a deterministic mapping.

Example:

```text
Profile.headline
        ↓
ResumeDocument.summary / headline area

Profile.bio
        ↓
ResumeDocument.summary

Profile.experience[]
        ↓
ResumeDocument.experience[]

Profile.skills[]
        ↓
ResumeDocument.skills[]

Profile.projects[]
        ↓
ResumeDocument.projects[]

Profile.education[]
        ↓
ResumeDocument.education[]

Profile.links
        ↓
ResumeDocument.contact / links
```

Use the actual existing ResumeDocument schema rather than inventing fields.

Where the existing AST has fields that ProfileModel does not provide, leave them empty or preserve valid presentation data where appropriate.

---

# 12. EVIDENCE AND PROVENANCE

Do not discard evidence relationships during generation.

If the ProfileModel contains:

```ts
evidenceIds
```

those relationships must remain traceable.

The Master Resume is derived from the profile and must not invent evidence.

Do not claim that a resume statement is verified unless the underlying profile/evidence supports it.

Do not create fake evidence IDs.

---

# 13. VERSIONING

Respect Phase 2 `profileVersion`.

Important rule:

```text
Profile fact change
        ↓
profileVersion changes
        ↓
Master Resume may require synchronization
```

But:

```text
Completeness recalculation only
        ↓
NO profileVersion increment
```

And:

```text
Opening Resume Studio
        ↓
NO profileVersion change
```

And:

```text
Rendering a resume
        ↓
NO profileVersion change
```

Do not create unnecessary profile mutations.

---

# 14. MASTER RESUME STALENESS

Implement a deterministic way to determine whether the Master Resume is synchronized with the current ProfileModel.

Prefer an existing version/hash mechanism if available.

If a new field is necessary, use a simple deterministic representation such as:

```text
sourceProfileVersion
```

on the Master Resume.

Example:

```ts
sourceProfileVersion: number
```

Meaning:

```text
Master Resume generated from ProfileModel.profileVersion = 7
```

Then:

```text
Profile.profileVersion = 8
Master.sourceProfileVersion = 7
```

means:

```text
Master Resume is stale
```

Do not introduce a complex synchronization framework.

---

# 15. BACKEND API

Inspect existing resume routes before creating new endpoints.

Prefer REST semantics consistent with the current project.

Potential operations:

```text
GET    /resume/master
POST   /resume/master/sync
```

But DO NOT blindly create these exact routes if the repository already has equivalent routes.

Reuse existing route conventions.

Expected behavior:

### GET Master Resume

- authenticated
- returns the candidate's Master Resume
- creates it only if the existing product architecture explicitly supports lazy creation
- otherwise returns a clear not-found state

### Sync Master Resume

- authenticated
- reads current ProfileModel
- regenerates Master Resume presentation
- preserves presentation configuration
- updates source profile version
- returns the updated Master Resume

All operations must be scoped to the authenticated user.

No cross-user access.

---

# 16. DTOs

Do not expose raw Mongoose documents directly if the existing project uses DTOs.

Follow existing DTO conventions.

The Master Resume DTO should contain only what the frontend needs, including as appropriate:

- resume id
- title
- variantType
- status
- version
- ResumeDocument
- builderConfig
- sourceProfileVersion
- timestamps

Do not expose internal database fields unnecessarily.

---

# 17. RESUME STUDIO UI INTEGRATION

This is the first major visible UI phase.

The existing Resume Studio must start operating around the Master Resume.

Do NOT rewrite the entire Studio.

Integrate incrementally.

The UI should clearly identify:

```text
Master Resume
```

and make its source relationship understandable.

For example:

```text
Master Resume
Synced with Career Profile
Profile version: 7
```

If stale:

```text
Master Resume
Needs sync
Career Profile has newer information
[Sync Resume]
```

Do not over-design this.

Keep it consistent with the existing SKILLEZO UI.

---

# 18. RESUME STUDIO LOADING FLOW

On entering Resume Studio:

```text
Open Studio
     ↓
Authenticate
     ↓
Load Master Resume
     ↓
If missing → create/load according to backend contract
     ↓
Render ResumeDocument
```

Do not fetch ProfileModel repeatedly from every component.

Prefer a single page-level/data-layer load and pass normalized state downward.

Avoid duplicate network requests.

---

# 19. MASTER RESUME PREVIEW

Reuse:

```text
ResumeRenderer
```

and existing preview/canvas infrastructure.

Do not create a second renderer.

The preview should render the current Master Resume's:

```text
ResumeDocument
```

including:

- contact
- summary
- experience
- skills
- projects
- education
- styling
- layout

Use existing PDF/preview infrastructure wherever possible.

---

# 20. CAREER PROFILE → STUDIO RELATIONSHIP

The UI should make the conceptual boundary clear.

Recommended interaction:

```text
Career Profile
     ↓
Source of Truth
     ↓
Master Resume
     ↓
Presentation
```

If the user changes a career fact in the profile:

```text
Profile changes
      ↓
Master Resume becomes stale
      ↓
Studio shows sync state
      ↓
User syncs
      ↓
Master Resume updates
```

Do not silently overwrite presentation customizations.

---

# 21. IMPORTANT — DO NOT BUILD THESE YET

Phase 3 must NOT implement:

### No full AI rewriting

Do not add new LLM-powered resume rewriting.

### No JD tailoring

Do not implement:

```text
Resume + Job Description → Tailored Resume
```

That is a later phase.

### No application snapshot redesign

Do not change application immutability architecture.

### No Resume Gallery

Do not build the complete multi-resume gallery yet.

### No DOCX generation

Do not add DOCX export unless already present and unrelated changes are required.

### No Career GPS redesign

Do not migrate Career GPS in this phase.

### No ATS redesign

Keep existing ATS behavior working.

### No new evidence architecture

Reuse Phase 1/2 evidence infrastructure.

---

# 22. RESUME EDITING SEMANTICS

This is critical.

Before changing existing Studio editing behavior, determine whether an edit is:

### Career fact

Example:

```text
Company
Job title
Experience bullet
Skill
Project
Education
```

These should ultimately belong to ProfileModel.

### Presentation

Example:

```text
Font
Spacing
Layout
Section ordering
Template
Margins
Styling
```

These belong to the Master Resume presentation layer.

Do not silently create a second persistent career-fact store inside ResumeModel.

If the existing Studio currently writes career facts directly into ResumeDocument, identify the path and refactor only enough to prevent the Master Resume from becoming a competing source of truth.

Do not perform a risky full Studio rewrite in this phase.

If complete redirection of every editor is too large for Phase 3, document the remaining editor migration as explicit Phase 4 work rather than implementing an unsafe partial model.

---

# 23. STATE MANAGEMENT

Follow the existing frontend state architecture.

Do not introduce a new global state library.

Avoid duplicated sources such as:

```text
profileState
resumeState
masterResumeState
studioResumeState
```

containing conflicting copies of the same career facts.

Prefer:

```text
Career Profile → canonical facts

Master Resume → presentation artifact

Studio local state → temporary editing/presentation state
```

---

# 24. ERROR HANDLING

Handle:

- profile not found
- master resume not found
- malformed ResumeDocument
- synchronization failure
- authentication failure
- authorization failure
- renderer failure
- network failure
- stale Master Resume
- empty/partial profile

The UI should show actionable errors.

Do not expose stack traces or sensitive backend details.

---

# 25. EMPTY PROFILE BEHAVIOR

A user may have:

```text
ProfileModel with minimal data
```

The system must still work.

Do not fabricate resume content.

For example:

```text
No experience added yet
```

is acceptable UI guidance.

Do not generate:

```text
Software Engineer at XYZ
```

without evidence.

---

# 26. TESTING REQUIREMENTS

Add focused tests for:

### Backend

1. Master Resume creation
2. Existing Master Resume reuse
3. No duplicate Master Resumes
4. Profile → ResumeDocument mapping
5. Deterministic generation
6. Source profile version tracking
7. Stale Master Resume detection
8. Synchronization
9. Presentation configuration preservation
10. Empty profile safety
11. No candidate-fact fabrication
12. Authentication
13. Authorization
14. Existing resume regression

### Frontend

Test where the existing test architecture supports it:

1. Master Resume loading
2. Loading state
3. Empty profile state
4. Sync action
5. stale state
6. error state
7. preview rendering
8. no duplicate API requests where practical

Do not hardcode an expected total number of repository tests.

Run:

```bash
npm test
npm run type-check
```

and the appropriate client validation command already used by the repository.

---

# 27. IDEMPOTENCY REQUIREMENTS

These operations should be safe to repeat:

```text
GET Master Resume
Sync Master Resume
Open Resume Studio
Refresh Resume Studio
```

Repeated synchronization with an unchanged ProfileModel must not:

- create duplicate resumes
- change profileVersion
- fabricate data
- duplicate bullets
- duplicate skills
- destroy presentation configuration

---

# 28. PERFORMANCE

Avoid unnecessary regeneration.

Do not regenerate the Master Resume on every render.

Use:

```text
sourceProfileVersion
```

or equivalent deterministic state to determine whether synchronization is needed.

Do not create expensive AI calls for this phase.

Master Resume generation should be deterministic and inexpensive.

---

# 29. SECURITY

Every Master Resume operation must be scoped to the authenticated user.

Never allow:

```text
GET /resume/master/:otherUserId
```

style access without explicit authorization architecture.

Verify ownership through the existing auth/session middleware.

Do not leak another user's:

- profile
- resume
- evidence
- contact information
- career history

---

# 30. DOCUMENTATION

Create or update:

```text
doc/resume-studio/03-master-resume-generation.md
```

Document:

- ownership model
- ProfileModel → Master Resume flow
- ResumeDocument role
- synchronization behavior
- sourceProfileVersion
- stale detection
- API endpoints
- UI behavior
- editing semantics
- limitations
- Phase 4 follow-up work

Include a simple architecture diagram:

```text
                 ┌─────────────────────┐
                 │    Career Profile   │
                 │     ProfileModel    │
                 │   SOURCE OF TRUTH   │
                 └──────────┬──────────┘
                            │
                            │ deterministic generation
                            ▼
                 ┌─────────────────────┐
                 │    Master Resume    │
                 │   ResumeModel       │
                 │ variantType=MASTER  │
                 └──────────┬──────────┘
                            │
                            │ ResumeDocument
                            ▼
                 ┌─────────────────────┐
                 │   Resume Renderer   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Resume Studio    │
                 │        UI           │
                 └─────────────────────┘
```

---

# 31. IMPLEMENTATION SAFETY RULE

Before modifying any existing Studio behavior:

1. Identify the current data flow.
2. Identify what currently writes ResumeDocument.
3. Identify what currently writes ProfileModel.
4. Identify whether existing Studio edits are treated as career facts or presentation.
5. Preserve existing functionality.
6. Make the smallest architectural change necessary.
7. Add regression tests.

Do not perform a broad rewrite merely because the architecture can be improved.

---

# 32. ACCEPTANCE CRITERIA

Phase 3 is complete only when all of the following are true:

- [ ] ProfileModel remains the sole canonical career-fact source.
- [ ] No `CareerProfileModel` or duplicate source-of-truth model exists.
- [ ] Master Resume is represented by existing `ResumeModel` with `variantType: MASTER`.
- [ ] Master Resume can be created from ProfileModel.
- [ ] Existing Master Resume is reused rather than duplicated.
- [ ] Profile → ResumeDocument mapping is deterministic.
- [ ] No candidate facts are fabricated.
- [ ] Existing evidence relationships remain traceable.
- [ ] Master Resume tracks its source Profile version.
- [ ] Stale Master Resumes can be detected.
- [ ] Master Resume synchronization works.
- [ ] Presentation configuration survives synchronization.
- [ ] Existing ResumeRenderer is reused.
- [ ] Resume Studio loads the Master Resume.
- [ ] Resume Studio visibly communicates Master Resume/sync state.
- [ ] Empty/partial profiles are handled safely.
- [ ] Authentication and authorization are enforced.
- [ ] Existing ATS/AI functionality continues working.
- [ ] No JD tailoring is introduced.
- [ ] No application snapshot redesign is introduced.
- [ ] No Career GPS redesign is introduced.
- [ ] No second evidence architecture is introduced.
- [ ] Repeated synchronization is idempotent.
- [ ] Tests pass.
- [ ] Type checking passes.
- [ ] Documentation is updated.

---

# 33. FINAL VERIFICATION

After implementation run the repository's actual validation commands.

At minimum:

```bash
npm test
npm run type-check
```

For the client, run the existing TypeScript/build/lint command defined by the project.

Verify manually:

### Scenario A — New user

```text
Minimal Profile
      ↓
Open Resume Studio
      ↓
Master Resume created
      ↓
Resume renders correctly
```

### Scenario B — Existing Master Resume

```text
Existing Master Resume
      ↓
Open Studio
      ↓
Same Master Resume loaded
      ↓
No duplicate created
```

### Scenario C — Profile change

```text
Profile v1
Master sourceProfileVersion = 1

Profile changes
Profile v2

Master sourceProfileVersion = 1
      ↓
Studio detects stale state
      ↓
User clicks Sync
      ↓
Master sourceProfileVersion = 2
```

### Scenario D — Presentation customization

```text
Master Resume
      ↓
User changes layout/template
      ↓
Profile synchronization
      ↓
Presentation configuration preserved
```

### Scenario E — Partial profile

```text
Profile has:
- name
- skills
- no experience

      ↓

Master Resume renders
      ↓

No fabricated experience
```

### Scenario F — Repeat sync

```text
Sync
Sync
Sync

      ↓

No duplicates
No profileVersion changes
No duplicated bullets
No destroyed styling
```

---

# 34. OUTPUT REQUIRED FROM ANTIGRAVITY

At the end of implementation provide a concise implementation report containing:

1. Files created
2. Files modified
3. Backend changes
4. Frontend changes
5. API changes
6. Master Resume synchronization behavior
7. Tests added
8. Test results
9. Type-check results
10. Known limitations
11. Phase 4 recommendations

Do not claim completion unless the acceptance criteria have actually been verified.

# END OF PHASE 3
