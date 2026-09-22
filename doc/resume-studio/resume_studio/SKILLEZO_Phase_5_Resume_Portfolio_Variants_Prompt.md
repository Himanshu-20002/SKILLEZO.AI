# SKILLEZO AI — Phase 5: Resume Portfolio, Gallery & Variant Management

## Objective

Implement Phase 5 on top of the completed Phase 1–4 architecture.

Phase 1–4 are frozen:
- Phase 1 — Resume ingestion and evidence-grounded parsing
- Phase 2 — Career Profile as canonical source of truth
- Phase 3 — Deterministic Master Resume generation
- Phase 4 — Resume Studio UX and architecture refactor

Phase 5 introduces the **Resume Portfolio / Gallery** and the lifecycle for independent resume variants.

The goal is to move from a single Resume Studio experience to:

```text
Career Profile
      ↓
Master Resume
      ↓
Resume Portfolio
 ┌────┼─────────────┐
 ↓    ↓             ↓
Master Variant A   Variant B
       ↓             ↓
       └── Resume Studio
```

Do not redesign the entire Resume Studio again. Phase 4 already completed that architecture.

---

# 1. NON-NEGOTIABLE ARCHITECTURE

## Career Profile remains the source of truth

`ProfileModel` remains the canonical source of persistent career facts.

Never make a resume variant another source of truth.

```text
ProfileModel
    ↓
Master Resume
    ↓
Resume Variants
```

Presentation edits must never silently mutate `ProfileModel`.

## Master remains unique

Preserve the existing Master Resume invariant:

```ts
variantType: "MASTER"
```

and the existing unique partial index.

There must be exactly one Master Resume per user.

## Variants are presentation artifacts

A variant may have:
- its own display name
- target role
- target company
- parent Master Resume
- its own ResumeDocument
- its own presentation configuration

A variant must not become the canonical store for:
- skills
- experience
- education
- projects
- contact information
- career facts

---

# 2. STRICT PHASE 5 BOUNDARY

Implement:

- Resume Portfolio / Gallery
- Master Resume card
- Resume Variant cards
- Create Variant
- Rename Variant
- Delete Variant
- Portfolio metadata
- Master/Variant navigation
- Independent variant presentation state
- Studio integration

Do NOT implement:

- Job Description ingestion
- AI tailoring
- AI-generated tailored bullets
- keyword injection
- job matching redesign
- application tracking
- application snapshots
- Career GPS redesign
- recruiter portal changes
- new ResumeDocument AST
- new renderer
- DOCX architecture
- new AI orchestration
- major ProfileModel redesign
- another Studio rewrite

For Phase 5, `TAILORED` means a derived resume variant/container. It does not imply AI tailoring yet.

---

# 3. AUDIT FIRST

Before coding, inspect:

```text
server/src/database/models/Resume.model.ts
server/src/database/repositories/resume/
server/src/modules/resume/
server/src/modules/resume-intelligence/
client/app/dashboard/resume-studio/
client/components/resume-studio/
client/hooks/useResumeStudio.ts
client/services/resume.service.ts
client/types/resume.ts
```

Also inspect Phase 1–4 documentation and tests.

Identify existing:
- Resume fields
- CRUD APIs
- Master lifecycle
- save/delete behavior
- ResumeDocument AST
- presentation configuration
- selector behavior
- routing/query state
- modal infrastructure

Reuse existing implementations. Do not rewrite working Phase 1–4 systems.

---

# 4. DATA MODEL

Use the existing `ResumeModel`.

Do not create a separate `ResumeVariant` collection unless the existing model genuinely cannot support the lifecycle.

Existing semantics:

```ts
variantType?: "MASTER" | "TAILORED";
parentResumeId?: Types.ObjectId;
targetJobId?: Types.ObjectId;
targetJobTitle?: string;
targetCompany?: string;
```

If a display-name field is required, add the smallest additive field possible, for example:

```ts
displayName?: string;
```

Reuse an existing equivalent field if available.

Do not create competing Profile/Career Facts/Resume Variant sources of truth.

---

# 5. MASTER AND VARIANT SEMANTICS

## Master

```text
variantType = MASTER
parentResumeId = null
```

The Master is generated/synchronized from Career Profile.

## Variant

```text
variantType = TAILORED
parentResumeId = Master Resume ID
```

A Phase 5 variant is a derived presentation artifact.

---

# 6. CREATE VARIANT

Implement a safe service operation such as:

```ts
createResumeVariant(userId, input)
```

It must:

1. Authenticate the user.
2. Resolve the user's Master Resume.
3. Create a new `TAILORED` variant.
4. Set `parentResumeId` to the Master ID.
5. Deep-copy the current Master ResumeDocument/presentation state.
6. Preserve evidence provenance.
7. Preserve template/layout configuration.
8. Assign a sensible display name.
9. Accept optional target role/company/job ID if already supported.
10. Never modify Master.
11. Never modify ProfileModel.

Conceptually:

```text
Master Resume
      │
      │ deep copy
      ▼
Variant Resume
```

After creation:

```text
Edit Master  → Variant unchanged
Edit Variant → Master unchanged
```

Do not store a mutable reference to the Master's document.

---

# 7. BACKEND API

Follow existing REST conventions and reuse routes where appropriate.

Expected capabilities:

## Portfolio

```http
GET /api/resumes/portfolio
```

Return lightweight metadata:
- id
- display name
- variant type
- target role/company
- parent resume ID
- updatedAt
- source profile version where applicable
- Master stale state where applicable

Avoid returning full ResumeDocument payloads for every card.

## Create Variant

```http
POST /api/resumes/variants
```

Example:

```json
{
  "displayName": "Frontend Engineer Resume",
  "targetJobTitle": "Frontend Engineer",
  "targetCompany": "Example Corp"
}
```

Validate all fields.

## Rename

Reuse an existing PATCH/update endpoint if it already safely supports metadata updates.

## Delete

Reuse the existing delete endpoint where possible.

Rules:
- Master cannot be deleted through normal variant deletion.
- Variants can be deleted if owned by the user.
- Never delete ProfileModel data.
- Never delete another user's resume.

Do not create duplicate API abstractions unnecessarily.

---

# 8. AUTHORIZATION

Every portfolio operation must verify ownership.

```text
Authenticated user
      ↓
Ownership check
      ↓
Resume belongs to user?
      ↓
yes → operation
no  → reject
```

Never trust a client-supplied user ID.

Test:
- user A cannot read user B's portfolio
- user A cannot edit user B's variant
- user A cannot delete user B's variant
- user A cannot alter/delete user B's Master

---

# 9. CLIENT TYPES AND SERVICE

Update `client/types/resume.ts` only where necessary.

Use:

```ts
type ResumeVariantType = "MASTER" | "TAILORED";
```

Add a lightweight portfolio type if needed:

```ts
interface ResumePortfolioItem {
  id: string;
  displayName: string;
  variantType: "MASTER" | "TAILORED";
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  parentResumeId?: string | null;
  updatedAt?: string;
  sourceProfileVersion?: number | null;
  isMasterStale?: boolean;
}
```

Adapt to existing conventions.

Extend `client/services/resume.service.ts` with only required operations:

```ts
getResumePortfolio()
createResumeVariant()
renameResume()
deleteResume()
```

Reuse existing methods when possible.

---

# 10. PORTFOLIO PAGE

Create a dedicated page following existing dashboard conventions, preferably:

```text
/dashboard/resumes
```

The page is the **Resume Portfolio**.

It should not simply be the existing Studio dropdown moved to another route.

---

# 11. PORTFOLIO UI

Target a polished product experience:

```text
┌─────────────────────────────────────────────────────────┐
│ Resumes                                  + Create Resume │
│ Manage your professional resumes                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ MASTER RESUME                                           │
│ ┌───────────────────────────────────────────────┐       │
│ │                                               │       │
│ │              Resume Preview                   │       │
│ │                                               │       │
│ │ ⭐ MASTER                                     │       │
│ │ Synced / Needs Sync                           │       │
│ │                                               │       │
│ │ [Open in Studio]                              │       │
│ └───────────────────────────────────────────────┘       │
│                                                         │
│ YOUR RESUME VARIANTS                                    │
│                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ Preview      │ │ Preview      │ │ + Create     │     │
│ │              │ │              │ │ Variant      │     │
│ │ Frontend     │ │ Full Stack   │ │              │     │
│ │ Engineer     │ │ Developer    │ │ [Create]     │     │
│ │              │ │              │ │              │     │
│ │ [Open]       │ │ [Open]       │ │              │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
└─────────────────────────────────────────────────────────┘
```

Use the existing design system/tokens.

Do not introduce a new design system.

---

# 12. MASTER CARD

Clearly display:

```text
⭐ Master Resume
Canonical presentation
Synced / Needs Sync
Last updated
```

Actions:

```text
Open in Studio
Sync if stale
```

No normal Delete action for Master.

Preserve Phase 3 sync semantics.

---

# 13. VARIANT CARD

Display:

```text
Resume Name
Variant
Target Role
Target Company
Last Updated
```

Actions:

```text
Open
Rename
Delete
```

Use a confirmation dialog for deletion.

---

# 14. CREATE VARIANT UX

Create a focused modal/dialog:

```text
Create Resume Variant

Name
[ Frontend Engineer Resume ]

Target Role
[ Frontend Engineer ]

Target Company
[ Example Corp ]

[Cancel] [Create Resume]
```

On creation:

```text
Create
  ↓
API
  ↓
Variant created
  ↓
Portfolio refresh
  ↓
Open Studio
```

Do not add JD upload or AI tailoring controls.

---

# 15. PREVIEW THUMBNAILS

Reuse the existing renderer where practical.

Do not create another rendering engine.

Portfolio cards should have:
- consistent aspect ratio
- readable preview
- loading skeleton
- graceful error state

Do not render full-resolution PDF documents for every card if avoidable.

Prefer lightweight preview data.

---

# 16. MASTER STALE STATE

Preserve:

```text
Profile.profileVersion > Master.sourceProfileVersion
```

as the stale condition.

Show:

```text
Needs Sync
```

and provide:

```text
Sync Master
```

Do not overwrite Master presentation configuration during sync.

Reuse Phase 3 synchronization behavior.

---

# 17. VARIANT STALENESS

Do not build a complex automatic variant synchronization system in Phase 5.

If existing backend semantics safely expose a variant source profile version, it may be displayed.

Otherwise leave variant stale semantics for a later phase.

Do not create an incomplete sync architecture.

---

# 18. OPENING A RESUME

Open the existing Resume Studio.

Prefer:

```text
/dashboard/resume-studio?resumeId=<id>
```

if compatible with existing routing.

The Studio must:
1. Load the requested resume.
2. Verify ownership through the backend.
3. Display Master/Variant identity.
4. Preserve existing Studio functionality.
5. Edit only the selected resume's presentation state.

Do not duplicate Studio logic.

---

# 19. MINIMAL STUDIO INTEGRATION

Phase 4 already refactored Studio.

Only make the minimal integration changes.

Example header:

```text
← Back to Resumes

⭐ Master Resume
Synced
```

or:

```text
← Back to Resumes

Frontend Engineer Resume
Variant
Frontend Engineer · Example Corp
```

Add a clear:

```text
Back to Portfolio
```

Do not perform another Studio-wide rewrite.

---

# 20. PORTFOLIO STATE

Do not turn `useResumeStudio()` into a global portfolio store.

If useful, create:

```text
useResumePortfolio()
```

Responsibilities:
- load portfolio
- create variant
- rename
- delete
- refresh

Keep it focused.

Server/domain state remains authoritative.

---

# 21. PERFORMANCE

Avoid:
- N+1 API calls
- loading complete ResumeDocuments for every card
- duplicate portfolio requests
- unnecessary global state
- rendering every full resume at full resolution

Preferred flow:

```text
Portfolio API
      ↓
lightweight metadata
      ↓
Portfolio cards
      ↓
Full ResumeDocument only when opened
```

Verify duplicate requests rather than claiming an absolute zero count.

---

# 22. RESPONSIVE DESIGN

Desktop:
- Master featured card
- multi-column variant grid

Tablet:
- two-column grid

Mobile:
- one-column cards

Critical actions must not depend on hover.

---

# 23. EMPTY STATE

If only a Master exists:

```text
Your Resume Portfolio

Your Master Resume is ready.

Create different resume versions for different roles
while keeping your Career Profile as the source of truth.

[Open Master Resume]
[Create Resume Variant]
```

Never use fake sample resumes.

---

# 24. LOADING / ERROR STATES

Implement:
- loading skeleton
- create loading
- rename loading
- delete loading
- sync loading
- empty state
- API error state
- retry where appropriate

Prevent duplicate submissions.

---

# 25. ACCESSIBILITY

Implement:
- semantic headings
- keyboard-accessible actions
- accessible dialogs
- visible focus states
- proper button labels
- screen-reader labels for badges
- confirmation dialog for destructive actions
- no hover-only critical actions

---

# 26. BACKEND TESTS

Add focused tests for:

## Portfolio
- Master included
- variants included
- user isolation

## Variant creation
- variantType is `TAILORED`
- parentResumeId points to Master
- ResumeDocument is copied
- presentation state is independent
- Master unchanged
- Profile unchanged

## Editing
- rename works
- variant presentation edits do not mutate Master
- variant presentation edits do not mutate Profile

## Deletion
- variant can be deleted
- Master cannot be deleted through variant deletion
- ownership is enforced

## Concurrency
- existing Master creation safety remains intact
- variant creation cannot mutate/duplicate Master

Do not create misleading UI tests in the server suite.

---

# 27. CLIENT TESTS

Use the existing client testing infrastructure.

Test:
- portfolio loading
- Master card
- variant cards
- create dialog
- create flow
- rename flow
- delete confirmation
- loading/error states
- navigation to Studio
- empty state
- important responsive behavior where practical

---

# 28. REGRESSION VERIFICATION

Run the actual repository test suites.

Do not hardcode expected test counts.

Required:

```text
All server tests pass
All client tests pass
Server type-check passes
Client type-check passes
Build succeeds
Lint succeeds where configured
```

Report actual results.

Any pre-existing failure must be clearly separated from Phase 5 failures.

---

# 29. MANUAL QA

## Master
- [ ] Master appears prominently.
- [ ] Master badge is visible.
- [ ] Master cannot be accidentally deleted.
- [ ] Master opens Studio.
- [ ] Stale Master shows sync state.
- [ ] Sync preserves formatting.

## Variants
- [ ] Create works.
- [ ] Variant appears immediately.
- [ ] Correct Master parent is stored.
- [ ] Variant opens Studio.
- [ ] Variant can be renamed.
- [ ] Variant can be deleted.
- [ ] Variant editing does not modify Master.
- [ ] Variant editing does not modify Profile.

## Portfolio
- [ ] No fake data.
- [ ] Loading state works.
- [ ] Empty state works.
- [ ] Errors are handled.
- [ ] Responsive layout works.
- [ ] Correct resume ID is preserved when navigating.

## Regression
- [ ] Resume Studio works.
- [ ] PDF export works.
- [ ] AI Optimize works.
- [ ] ATS diagnostics work.
- [ ] Section AI works.
- [ ] Upload works.
- [ ] Existing delete behavior works.
- [ ] Master sync works.

---

# 30. DOCUMENTATION

Create:

```text
doc/resume-studio/05-resume-portfolio-and-variants.md
```

Document:
1. Portfolio architecture
2. Master semantics
3. Variant semantics
4. Parent-child relationship
5. Variant creation lifecycle
6. Ownership/security
7. API endpoints
8. Profile/Master/Variant boundaries
9. Deletion rules
10. Phase 6 integration boundary

Include:

```text
Career Profile
      │
      ▼
Master Resume
      │
      ├──────────────┐
      ▼              ▼
Variant A        Variant B
      │              │
      └──────┬───────┘
             ▼
       Resume Studio
```

---

# 31. DEFINITION OF DONE

Phase 5 is complete only when:

- [ ] Resume Portfolio page exists.
- [ ] Master Resume is prominently represented.
- [ ] Master uniqueness invariant remains intact.
- [ ] Variants can be created.
- [ ] Variants point to the Master as parent.
- [ ] Variant presentation state is independent.
- [ ] Variants can be renamed.
- [ ] Variants can be deleted safely.
- [ ] Master cannot be accidentally deleted.
- [ ] Ownership/security is enforced.
- [ ] Portfolio uses lightweight metadata.
- [ ] Opening a resume launches the existing Resume Studio.
- [ ] Studio identifies Master vs Variant.
- [ ] Presentation edits do not mutate Career Profile.
- [ ] No AI tailoring is introduced.
- [ ] Phase 1–4 behavior remains intact.
- [ ] Backend tests pass.
- [ ] Client tests pass.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Documentation exists.
- [ ] Manual QA passes.

---

# FINAL INSTRUCTION

Implement Phase 5 completely.

Before coding, audit the existing Phase 1–4 implementation and reuse established patterns.

Prefer:

```text
Reuse > Extend > Refactor > Rewrite
```

Do not invent architecture that already exists.

Do not change working AI, ATS, ResumeDocument, ProfileModel, Master Resume, or Resume Studio behavior unless required for Portfolio/Variant integration.

The final product should feel like:

```text
                 SKILLEZO AI
                      │
              ┌───────▼────────┐
              │ Resume Portfolio│
              └───────┬────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   ⭐ Master Resume        Resume Variants
          │                       │
          │                       ├── Frontend Resume
          │                       ├── Full Stack Resume
          │                       └── Other Variants
          │
          └──────────┬────────────┘
                     ▼
               Resume Studio
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Editor      Preview    Insights
```

Build this as a production-quality Phase 5 implementation while preserving every Phase 1–4 invariant.
