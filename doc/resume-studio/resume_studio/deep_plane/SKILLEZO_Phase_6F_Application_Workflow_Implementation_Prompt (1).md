# SKILLEZO AI — Phase 6F
# Application Workflow, Immutable Application Snapshot & Application Tracking

## PURPOSE
Implement Phase 6F as the post-tailoring application workflow for SKILLEZO AI.

This phase begins only after Job Intelligence (6A), Career ↔ Job Evidence Matching (6B), Tailoring Plan + Approval (6C), Tailored Resume Generation (6D), and Tailored Resume Studio / Comparison / Evidence (6E) are complete and frozen.

IMPORTANT:
- Inspect the existing repository and reuse established architecture/contracts.
- Do NOT invent replacement architectures when an existing service, repository, DTO, auth, validation, routing, or UI pattern already exists.
- Preserve all frozen invariants from Phases 1–6E.
- Do not implement Auto Apply in Phase 6F.
- Do not implement interview intelligence, follow-up intelligence, offer intelligence, or later roadmap features in this phase.
- Do not claim completion without actual verification.

---

# 1. PHASE 6F OBJECTIVE

Build the Application Workflow layer that allows a user to take a Job Profile and its selected Tailored Resume into a durable Application record.

Core flow:

```text
Career Profile
     ↓
Job Intelligence (6A)
     ↓
Career ↔ Job Match (6B)
     ↓
Tailoring Plan (6C)
     ↓
Tailored Resume (6D)
     ↓
Comparison + Evidence (6E)
     ↓
[Apply to This Job]
     ↓
Application Record
     ↓
Immutable Application/Resume Snapshot
     ↓
Application Tracking + Timeline
```

The system must answer:
- What job did I apply to?
- When did I apply?
- Which exact Tailored Resume did I use?
- What exact resume state was used?
- What is the current application status?
- What happened to the application over time?

---

# 2. HARD ARCHITECTURAL INVARIANTS

## 2.1 Master Resume Immutability

Creating or updating an Application must never mutate:
- `ProfileModel`
- Master Resume
- Career Profile facts

Application tracking updates must remain downstream of those sources of truth.

## 2.2 Tailored Resume Safety

- The Application references the Tailored Resume used at creation time.
- The Application captures the exact source/version identity required to understand what was used.
- Later edits to the Tailored Resume must NOT silently rewrite historical application state.

## 2.3 Immutable Historical Snapshot

At application creation, persist a historical snapshot sufficient to reconstruct the resume state used at that time.

Minimum snapshot should include the current canonical resume representation and the presentation information required to reproduce it, using the repository's existing structures.

Preserve applicable fields for:
- summary
- skills
- experience
- projects
- education
- links / other canonical sections
- section order / layout where needed
- target metadata relevant to the Tailored Resume

Do not create a second competing resume AST if the existing `ResumeDocument` is already canonical.

## 2.4 Job Context

Use the existing `JobProfile` as the canonical analyzed-job record. Store only the minimum historical job identity required for Application history; do not duplicate the entire JobProfile unless the existing architecture requires it.

## 2.5 User Ownership

Every Application is user-scoped.
Every read, create, update, timeline mutation, and delete operation must enforce authenticated ownership server-side.

## 2.6 No Fabrication

Never invent:
- company
- title
- job URL
- location
- salary
- requirements
- application dates
- resume facts

Nullable fields remain nullable.

## 2.7 No Auto Apply

Phase 6F must NOT:
- submit forms automatically
- authenticate into employer systems
- use browser automation
- send applications automatically
- claim employer submission unless the user explicitly records it

“Apply” in this phase means creating/tracking the Application record and optionally marking it as applied.

---

# 3. FIRST: REPOSITORY AUDIT

Before changing code, inspect the current implementation for:

SERVER
- Existing `ApplicationModel`, repository, service, types, validators, routes
- `JobProfile` model/repository/service
- Resume repository/service
- Tailored Resume generation/versioning
- `requireAuth` and authentication patterns
- Request validation
- Error handling
- Repository transactions/session patterns
- Logging conventions

CLIENT
- Existing Application screens/components
- Job Profile workspace
- Tailored Resume Studio entry points
- Resume Portfolio
- API service conventions
- Hooks/state patterns
- Dialog/modal primitives
- Status badge patterns
- Route conventions

TESTS
- Existing Application tests
- Server unit/integration conventions
- Client hook/component conventions

IMPORTANT:
If an Application model already exists, evolve it instead of creating a second Application model.

Do not proceed with schema design until the existing Application implementation has been audited.

---

# 4. PRODUCT BOUNDARY

INCLUDE:
- Create Application from JobProfile + Tailored Resume
- Immutable historical resume snapshot
- Application metadata
- Application status
- Application timeline/history
- Applications dashboard
- Application detail
- Status updates
- Timeline note support where appropriate
- Delete with ownership checks
- Loading/empty/error states
- Deep-link-safe routing

EXCLUDE:
- Auto Apply
- Browser automation
- External ATS integrations
- Email sending
- WhatsApp messaging
- Interview preparation
- Offer analysis
- AI follow-up generation
- AI application scoring
- New job discovery
- New tailoring engine
- New resume rendering engine
- DOCX generation
- New cover-letter subsystem

Do not expand the scope merely to make Phase 6F look larger.

---

# 5. DOMAIN MODEL

Use existing domain types/enums whenever available. Do not create duplicate semantic enums.

Conceptual Application entity:

```text
Application
├── id
├── userId
├── jobProfileId
├── resumeId
├── resumeVariantType
├── resumeSnapshot
├── historical job identity metadata
├── appliedAt
├── status
├── source
├── notes / timeline
├── createdAt
└── updatedAt
```

Align exact types with the repository.

## 5.1 Application Status

Reuse an existing enum if present.

If none exists, use a conservative lifecycle such as:

```text
DRAFT
APPLIED
SCREENING
INTERVIEW
OFFER
REJECTED
WITHDRAWN
```

Semantics:
- `DRAFT`: record exists but submission has not been confirmed.
- `APPLIED`: user explicitly records that the application was submitted.
- `SCREENING`: user records screening stage.
- `INTERVIEW`: user records interview stage.
- `OFFER`: user records offer stage.
- `REJECTED`: user records rejection.
- `WITHDRAWN`: user records withdrawal.

Do not infer status from external systems in Phase 6F.

## 5.2 Source

If consistent with existing architecture, support a small source enum such as `MANUAL` and `JOB_ENGINE`.
Do not create source categories that do not have product meaning.

## 5.3 Timeline Events

Use append-oriented historical records.

Conceptual event:

```text
ApplicationTimelineEvent
├── id
├── type
├── status
├── note
├── occurredAt
└── createdAt
```

Suggested types:
- `CREATED`
- `APPLIED`
- `STATUS_CHANGED`
- `NOTE_ADDED`

Keep metadata typed and narrow. Do not use `Record<string, any>`.

---

# 6. IMMUTABLE SNAPSHOT DESIGN

Application creation should follow:

```text
Current Tailored Resume
        ↓
Validate ownership + identity
        ↓
Capture exact canonical resume state
        ↓
Persist Application + snapshot atomically
```

The client must NOT supply the historical snapshot.

The server must construct it from the authoritative stored Tailored Resume.

Use an existing typed deep-clone/serialization-safe mechanism where possible.

If versioning already exists, use that exact version/revision marker.
If not, use the repository's stable identifiers and timestamps without inventing a fake version.

## 6.1 Snapshot Integrity

Once an Application is `APPLIED`:
- `resumeSnapshot` is immutable
- source `resumeId` is immutable
- historical job identity fields are immutable
- `appliedAt` is immutable

Tracking fields may remain mutable:
- current status
- timeline
- notes
- `updatedAt`

Use optimistic concurrency/versioning when the existing architecture supports it.

---

# 7. CREATE APPLICATION FLOW

Primary entry point in Tailored Resume Studio:

```text
[Apply to This Job]
```

Only show when the active resume is a Tailored Resume with valid JobProfile target context.

Flow:

1. User clicks `Apply to This Job`.
2. Open accessible confirmation dialog.
3. Show:
   - company
   - role
   - source Tailored Resume
   - target URL when available
   - concise resume identity
   - statement that the application records the exact resume snapshot
4. User confirms.
5. Server validates:
   - authenticated user
   - JobProfile ownership
   - Resume ownership
   - Tailored Resume eligibility
   - target context consistency when canonical fields exist
   - readable/valid source resume
6. Server creates Application + snapshot atomically where supported.
7. UI shows success and provides Application Detail navigation.

Never create a fake target when metadata is missing.

## Duplicate / Idempotency Protection

Protect against double-clicks and repeated mutation requests.

Use the repository's established idempotency/concurrency strategy where available.

A duplicate guard may consider user + JobProfile + active source Tailored Resume, but do not unnecessarily forbid legitimate repeat applications.

Inspect existing semantics before deciding the exact uniqueness constraint.

---

# 8. APPLY CONFIRMATION LANGUAGE

Clearly distinguish creating a tracker record from submitting externally.

Preferred copy:

> This will save an application record using the current version of [Tailored Resume].

Primary CTA:

`Create Application`

Success:

`Application saved`

Do NOT say `Application submitted` unless the user explicitly records that submission occurred.

---

# 9. MARK AS APPLIED

Support:

```text
DRAFT → APPLIED
```

On explicit `Mark as Applied`:
- set `appliedAt` only if null
- set `status = APPLIED`
- append `APPLIED` event
- preserve the snapshot

`appliedAt` must never be overwritten by later status changes.

---

# 10. STATUS TRANSITIONS

Use a centralized server-side transition validator.

Conservative baseline (adjust only after repository audit):

```text
DRAFT      → APPLIED, WITHDRAWN
APPLIED    → SCREENING, INTERVIEW, REJECTED, WITHDRAWN
SCREENING  → INTERVIEW, REJECTED, WITHDRAWN
INTERVIEW  → OFFER, REJECTED, WITHDRAWN
OFFER      → REJECTED, WITHDRAWN
REJECTED   → terminal
WITHDRAWN  → terminal
```

Invalid transitions must return a typed validation error.

Do not rely on the client to enforce lifecycle rules.

---

# 11. TIMELINE

Every meaningful lifecycle mutation should leave a historical event.

Example:

```text
Created
  ↓
Applied
  ↓
Screening
  ↓
Interview
  ↓
Offer
```

Rules:
- Prior events are never rewritten merely to show the current state.
- Sort newest-first in the UI while preserving true `occurredAt`.
- Never fabricate dates.
- User notes remain separate from canonical Career Profile facts.

---

# 12. SERVER ARCHITECTURE

Follow the existing backend modular layering.

Expected conceptual layers:

```text
Model
Repository
Validator
Service
Controller
Routes
DTO / response types
```

Do not place domain logic entirely in controllers.

Suggested service operations:
- `createApplication()`
- `getApplicationById()`
- `listApplications()`
- `updateApplicationStatus()`
- `addApplicationTimelineNote()`
- `deleteApplication()`

Suggested internal helpers:
- ownership assertions
- source-context validation
- snapshot builder
- historical job metadata builder
- transition validator
- duplicate detection/idempotency handling

Keep the service deterministic.

---

# 13. API DESIGN

Reuse current API conventions. Only add routes that do not conflict with existing routes.

Suggested endpoints:

```text
POST   /api/applications
GET    /api/applications
GET    /api/applications/:applicationId
PATCH  /api/applications/:applicationId/status
POST   /api/applications/:applicationId/timeline
DELETE /api/applications/:applicationId
```

Optional filter:

```text
GET /api/applications?jobProfileId=<id>
```

Every endpoint must:
- require authentication
- validate input
- enforce ownership
- return stable typed DTOs

## 13.1 Create Request

Conceptual request:

```json
{
  "jobProfileId": "...",
  "resumeId": "...",
  "source": "MANUAL"
}
```

Do NOT accept `resumeSnapshot` from the client.

## 13.2 Status Request

```json
{
  "status": "SCREENING"
}
```

Server performs transition validation + timeline creation.

## 13.3 Timeline Note Request

```json
{
  "note": "Recruiter called and asked for availability."
}
```

Validate length and sanitize according to existing conventions.

Notes are user content and must never become canonical resume evidence.

---

# 14. RESPONSE PAYLOAD SAFETY

Application list endpoints must be metadata-only.

Do NOT return full resume snapshots in the list response.

Suggested list DTO:

```text
id
jobProfileId
resumeId
resumeVariantType
companyName
jobTitle
jobUrl
status
appliedAt
createdAt
updatedAt
```

Full historical snapshot should be loaded only on Application Detail / Snapshot view when necessary.

---

# 15. APPLICATIONS DASHBOARD

Route:

```text
/dashboard/applications
```

Purpose:
A focused tracker for active and historical applications.

Recommended layout:

Header:
`Applications`
`Track every application and the exact resume version you used.`

Summary:
- Total
- Applied
- Screening
- Interview
- Offers

Filters:
- All
- Active
- Applied
- Interview
- Offer
- Closed

Do not overbuild search/pagination/analytics in 6F unless existing product conventions require them.

Application card should display:

```text
Company
Frontend Engineer

⭐ Frontend Engineer — Tailored
Applied Sep 28, 2026

[Interview]
```

Clicking opens Application Detail.

---

# 16. APPLICATION DETAIL

Route:

```text
/dashboard/applications/[applicationId]
```

Sections:
1. Job Identity
2. Current Status
3. Application Timeline
4. Resume Used
5. Notes

The Resume Used section should identify the exact source Tailored Resume and snapshot capture metadata.

CTA:

`View Resume Snapshot`

IMPORTANT:
The historical view must use the immutable Application Snapshot, not the current mutable Tailored Resume.

---

# 17. HISTORICAL RESUME VIEW

Reuse the existing `ResumeRenderer` / canonical rendering path where compatible.

The snapshot view is strictly read-only.

No:
- save
- autosave
- AI editing
- tailoring actions
- Master mutation

Display a clear label:

`Application Snapshot`

Optionally show capture date from the actual stored value.

---

# 18. RESUME STUDIO INTEGRATION

Tailored Resume Studio Header:

```text
[Compare with Master]   [Apply to This Job]
```

Master Resume:
- no Apply CTA

Tailored Resume:
- Apply CTA only when valid JobProfile target context exists

After successful creation:
- show `Application Created`
- provide navigation to Application Detail

Do not remove or interfere with any 6E.1–6E.4 comparison/evidence behavior.

---

# 19. JOB PROFILE INTEGRATION

Where the existing Job Profile UI supports resume actions, it may expose:

```text
[Tailor Resume]
[Open Tailored Resume]
[Apply]
```

When an Application already exists, surface its current status and link instead of creating confusing duplicate actions.

Do not rebuild Job Intelligence.

---

# 20. RESUME PORTFOLIO INTEGRATION

Resume Portfolio remains a resume portfolio, not an Applications dashboard.

Tailored Resume cards may expose `Apply` when a valid JobProfile target context exists.

Preserve Phase 5 metadata-only Portfolio retrieval boundaries.

---

# 21. CLIENT STATE + HOOKS

Follow current client state conventions.

Create a thin `useApplications` hook if consistent with existing architecture.

Responsibilities may include:
- application list loading
- selected application
- status mutation
- timeline mutation
- delete
- refresh

Do not duplicate server state across unrelated components.

For create flow:
- prevent duplicate requests
- disable CTA during submission
- preserve typed server errors
- navigate only after confirmed success

---

# 22. CONCURRENCY / STALE RESPONSE SAFETY

Use the same request-safety principles established in Phase 6E.

Protect against:
- rapid Application A → B navigation
- stale list response after delete
- stale status response after a newer mutation
- duplicate create clicks

Bind async results to the active Application identity.

Use request IDs / mutation tokens where necessary.

---

# 23. ERROR STATES

Handle:
- unauthorized
- forbidden / ownership mismatch
- not found
- invalid status transition
- duplicate application conflict
- invalid resume state
- invalid JobProfile state
- server/network failure

Never expose raw stack traces.

Use clear user-facing messages such as:
- `This tailored resume is no longer available.`
- `You already have an active application for this job.`
- `That status change is not available from the current stage.`

---

# 24. DELETE BEHAVIOR

Deleting an Application must:
- require ownership
- require explicit user action
- never delete the Tailored Resume
- never delete the JobProfile
- never mutate the Master Resume

Choose hard delete vs soft delete according to existing project conventions. Do not add an elaborate archive subsystem unless the existing architecture already has one.

---

# 25. SECURITY / DATA INTEGRITY

Mandatory:
- `requireAuth` on every application endpoint
- ownership checks server-side
- client-provided resume snapshot rejected/ignored
- client-provided `appliedAt` cannot override server semantics
- status transition validation server-side
- no cross-user JobProfile access
- no cross-user Resume access
- no cross-user Application access

Never rely on hidden UI state for authorization.

---

# 26. TRANSACTION / ATOMICITY

Application creation should be atomic wherever MongoDB transaction support and existing repository patterns permit.

Desired invariant:

```text
Either:
  Application + immutable snapshot are both persisted

Or:
  neither is persisted
```

Do not leave partially created Applications with missing snapshots.

If the current deployment cannot safely use a transaction, implement the safest deterministic equivalent supported by the current architecture and document it in the walkthrough.

---

# 27. LOGGING

Follow the project's logging conventions.

Log only high-level lifecycle events without PII.

Examples:
- `[ApplicationService] created application`
- `[ApplicationService] status changed`
- `[ApplicationService] application deleted`

Never log:
- full resume text
- personal phone/email
- private notes
- full job descriptions

---

# 28. TESTING STRATEGY

Do not hardcode an expected total test count. Report the actual commands/results.

## 28.1 Server Tests

At minimum cover:
1. valid creation
2. unauthenticated rejection
3. cross-user JobProfile rejection
4. cross-user Resume rejection
5. Master Resume rejection when Tailored is required
6. immutable snapshot creation
7. client cannot inject snapshot
8. snapshot detached from source
9. later Tailored edits do not mutate snapshot
10. duplicate-create protection
11. valid DRAFT → APPLIED
12. invalid status transition rejection
13. `appliedAt` set only on APPLIED
14. `appliedAt` remains stable
15. APPLIED timeline event
16. STATUS_CHANGED timeline event
17. NOTE validation/persistence
18. cross-user timeline protection
19. deleting Application does not delete Resume
20. deleting Application does not delete JobProfile
21. metadata-only list DTO
22. detail response
23. historical snapshot loading
24. malformed ids
25. server TypeScript

Add tests for additional failure modes found during implementation.

## 28.2 Client Tests

At minimum cover:
1. Apply CTA only on valid Tailored context
2. Apply CTA hidden on Master
3. confirmation dialog target data
4. duplicate-submit prevention
5. successful creation state
6. dashboard loading
7. dashboard empty state
8. dashboard populated state
9. filters
10. detail status rendering
11. timeline rendering
12. successful status update
13. safe invalid-transition error
14. stale response protection
15. delete confirmation
16. read-only historical snapshot
17. no mutation actions on snapshot
18. deep-link behavior

Test behavior rather than implementation details.

---

# 29. MANUAL BROWSER QA

Run all of the following after automated tests.

## FLOW A — CREATE APPLICATION
1. Open valid Tailored Resume.
2. Click `Apply to This Job`.
3. Verify company/title/resume identity.
4. Create Application.
5. Verify success.
6. Open Application Detail.

## FLOW B — MARK AS APPLIED
1. Open DRAFT Application.
2. Mark as Applied.
3. Verify APPLIED status.
4. Verify actual appliedAt.
5. Verify APPLIED timeline event.

## FLOW C — PROGRESS
Test a valid lifecycle path such as:

```text
DRAFT → APPLIED → SCREENING → INTERVIEW → OFFER
```

Verify timeline after every transition.

## FLOW D — IMMUTABILITY
1. Create Application.
2. Edit current Tailored Resume.
3. Open historical Application Snapshot.
4. Verify historical content remains unchanged.

## FLOW E — MASTER SAFETY
1. Open Master Resume.
2. Verify Apply CTA is absent.

## FLOW F — CROSS-USER SAFETY
Verify unauthorized ids return safe errors.

## FLOW G — DUPLICATE PROTECTION
Double-click Create Application and retry after refresh where applicable.
Verify no accidental duplicate is created according to final uniqueness semantics.

## FLOW H — DEEP LINK
Open an Application Detail URL directly and verify correct loading/ownership/content.

---

# 30. UX REQUIREMENTS

Use explicit human language.

Preferred terms:
- `Apply to This Job`
- `Create Application`
- `Application saved`
- `Mark as Applied`
- `Resume Used`
- `Application Snapshot`
- `Application Timeline`

Avoid:
- `Auto Apply`
- `Submitted automatically`
- `AI Applied`

Visual hierarchy:
1. Job identity
2. Status
3. Timeline
4. Resume used
5. Notes

Do not clutter the first 6F version with vanity analytics.

---

# 31. ACCESSIBILITY

Preserve established accessibility standards.

Mandatory:
- keyboard-accessible dialogs
- proper focus management
- semantic buttons and links
- visible labels
- accessible status messaging
- aria attributes where needed
- no status communication by color alone

Reuse existing accessible dialog primitives.

---

# 32. PERFORMANCE

Applications list:
- metadata-only
- no full resume snapshots

Application detail:
- fetch only required data

Historical snapshot:
- load lazily if appropriate

Avoid repeated JobProfile/Resume fetches when Application metadata already contains what the screen needs.

---

# 33. ROUTING

Follow the existing Next.js App Router conventions.

Expected conceptual routes:

```text
/dashboard/applications
/dashboard/applications/[applicationId]
```

Authenticated deep-link refresh must work.

---

# 34. NO DUPLICATE SOURCES OF TRUTH

The source-of-truth boundaries remain:

```text
Career Profile      = canonical candidate facts
Master Resume       = canonical presentation artifact
Tailored Resume     = derived presentation variant
JobProfile          = canonical analyzed job record
Application         = historical application record
ApplicationSnapshot = immutable historical resume state used by that record
```

Do NOT propagate Application tracking edits backward into:
- ProfileModel
- Master Resume
- Tailored Resume
- JobProfile

---

# 35. EXPECTED FILE / MODULE ORGANIZATION

Use current repository conventions rather than forcing a new layout.

Conceptual server organization:

```text
server/src/modules/applications/
├── application.model.ts
├── application.repository.ts
├── application.types.ts
├── application.validator.ts
├── application.service.ts
├── application.controller.ts
├── application.routes.ts
└── application.snapshot.ts
```

Conceptual client organization:

```text
client/
├── app/dashboard/applications/
├── components/applications/
├── hooks/useApplications.ts
└── services/application.service.ts
```

These are examples only. Match the actual project structure discovered during audit.

---

# 36. IMPLEMENTATION ORDER

Execute in order:

1. Repository audit
2. Confirm/evolve existing Application model
3. Lock immutable snapshot contract
4. Implement validators + repositories
5. Implement Application service
6. Implement controllers/routes
7. Add server tests
8. Implement client API service
9. Implement `useApplications`
10. Build Applications Dashboard
11. Build Application Detail
12. Build historical Snapshot view
13. Integrate Studio Apply CTA
14. Integrate JobProfile entry point where appropriate
15. Add client tests
16. Run full regression
17. Run TypeScript checks
18. Perform manual browser QA
19. Produce final walkthrough

Do not skip the repository audit.

---

# 37. DO NOT BREAK FROZEN PHASES

Preserve all frozen boundaries from Phases 1–6E, especially:

- Career Profile as canonical candidate fact source
- Master Resume immutability
- Tailored Resume as derived variant
- JobProfile as canonical analyzed job record
- JobMatchResult semantics
- TailoringPlan approval semantics
- Tailored Resume generation safeguards
- `ResumeComparisonResult` / 6E.1 diff records
- 6E.2 active variant switching
- 6E.3 Tailoring Insights
- 6E.4 comparison/evidence traceability

No unrelated refactor should be bundled into 6F.

---

# 38. DEFINITION OF DONE

Phase 6F is complete only when all applicable items below are true:

- [ ] Existing Application architecture audited first
- [ ] Existing Application model reused/evolved where applicable
- [ ] User ownership enforced
- [ ] JobProfile reference implemented
- [ ] Tailored Resume reference implemented
- [ ] Immutable resume snapshot implemented
- [ ] Client cannot inject/replace the historical snapshot
- [ ] Application creation is atomic or has a documented safe equivalent
- [ ] Duplicate/idempotency protection implemented
- [ ] Status lifecycle validated server-side
- [ ] `appliedAt` semantics are correct
- [ ] Timeline is append-oriented and historically stable
- [ ] List endpoint is metadata-only
- [ ] Application detail supports timeline/status
- [ ] Historical Snapshot is read-only
- [ ] Applications Dashboard implemented
- [ ] Application Detail implemented
- [ ] Tailored Studio Apply CTA implemented
- [ ] Master Resume protected from application creation
- [ ] Deep links work
- [ ] Loading/empty/error states handled
- [ ] Accessibility verified
- [ ] Concurrency/stale response protection verified
- [ ] Server tests pass
- [ ] Client tests pass
- [ ] Server TypeScript passes
- [ ] Client TypeScript passes
- [ ] Full regression passes
- [ ] Manual QA passes
- [ ] No Auto Apply behavior exists
- [ ] No Application tracking mutation flows backward into Profile/Master/Tailored/JobProfile

---

# 39. FINAL IMPLEMENTATION WALKTHROUGH

After implementation, report:

1. Files created/modified
2. Existing Application model findings
3. Final snapshot contract
4. API endpoints
5. UI routes/components
6. Status lifecycle and transition rules
7. Timeline implementation
8. Duplicate/idempotency handling
9. Security/ownership checks
10. Automated server test results
11. Automated client test results
12. Client TypeScript results
13. Server TypeScript results
14. Full regression results
15. Manual browser QA results
16. Any deviations from this prompt
17. Any unresolved risks

Do not claim completion without actual commands/results.

---

# 40. SUCCESS CRITERIA

A user must be able to complete this flow:

```text
Open Tailored Resume
      ↓
[Apply to This Job]
      ↓
Confirm Application Record
      ↓
Application created with immutable resume snapshot
      ↓
Open Application Detail
      ↓
See job identity + status + timeline
      ↓
Mark as Applied
      ↓
Advance status over time
      ↓
Open Resume Used
      ↓
See exact historical Application Snapshot
      ↓
Edit current Tailored Resume later
      ↓
Historical snapshot remains unchanged
```

That is the core Phase 6F outcome.

# END OF PHASE 6F IMPLEMENTATION PROMPT
