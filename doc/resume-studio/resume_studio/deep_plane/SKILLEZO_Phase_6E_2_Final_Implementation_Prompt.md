# SKILLEZO AI — Phase 6E.2 Final Implementation Prompt

## Studio Integration — Tailored Resume Identity, Target Job Context & Variant Switcher

You are implementing **Phase 6E.2 of SKILLEZO AI**.

The revised implementation plan is architecturally aligned, but before writing code you must incorporate all requirements below. Treat them as **mandatory implementation constraints**.

---

# 1. Phase Objective

Phase 6E.2 is strictly responsible for integrating the existing Master/Tailored Resume architecture into Resume Studio.

Deliver:

- Clear Master vs Tailored identity.
- Canonical Target Job Title / Company context for Tailored resumes.
- Lightweight Variant Switcher.
- Safe switching between variants.
- Dirty-state protection.
- Pending autosave flushing and awaiting.
- Concurrency protection.
- Safe Next.js App Router URL synchronization.
- Browser Back/Forward support without loops.
- Strict Master/Profile immutability during Tailored editing.
- Optional performance-safe 6E.1 diff-count badge.

This phase must **not** introduce new intelligence or new product architecture.

---

# 2. Strictly Out of Scope

Do NOT implement:

- Tailoring Insights UI
- Comparison modal
- Side-by-side diff
- Unified diff
- Evidence Drawer
- New AI/LLM calls
- New scoring engine
- New matching engine
- New tailoring engine
- New database collections
- New Mongoose models
- New parallel endpoints
- Auto Apply
- Application workflows
- New Career Profile architecture
- New Master Resume architecture

6E.3 and 6E.4 will handle later intelligence/comparison surfaces.

---

# 3. FIRST: Inspect the Existing Codebase

Before modifying anything, inspect the actual implementation.

Verify:

- Existing Resume Studio route.
- Existing `useResumeStudio`.
- Current active/selected resume state.
- Current save lifecycle.
- Existing autosave timer/debounce.
- Existing resume retrieval service.
- Existing resume update/save service.
- Existing Portfolio metadata service/hook.
- Existing Master Resume identification.
- Existing Tailored Resume metadata.
- Existing Next.js App Router navigation pattern.
- Existing dropdown/menu primitive.
- Existing dialog/modal primitive.
- Existing Resume Studio design tokens.
- Existing 6E.1 `computeResumeDiff()` contract.
- Existing score/intelligence fetch lifecycle.

Do not assume the implementation plan describes the current code perfectly.

Reuse existing architecture and make the smallest necessary changes.

---

# 4. Canonical Active Resume Source of Truth

This is mandatory.

Do NOT make the lightweight `resumes` metadata array the authoritative source for the currently rendered resume.

The architecture must distinguish:

## Active loaded resume

The actually loaded/current Resume Studio record is authoritative for:

- `variantType`
- `targetJobTitle`
- `targetCompany`
- `targetJobId`
- Master/Tailored identity
- active document/config metadata

## Lightweight `resumes` metadata

Use the Portfolio metadata array only for:

- Variant Switcher items
- Lightweight variant listing
- Display metadata when appropriate

Avoid treating this as the ultimate authority:

```ts
const currentResume = resumes.find(
  (r) => r._id === activeResumeId
);
```

when the active loaded resume is already available elsewhere in Studio state.

For direct/deep-linked navigation, stale/incomplete Portfolio metadata must not prevent correct identification of the loaded resume.

---

# 5. Canonical Active ID

Use exactly one canonical active identifier:

```ts
activeResumeId
```

Definition:

```text
activeResumeId
= currently committed/rendered Resume Studio resume
```

Temporary switching state may use:

```ts
pendingSwitchResumeId
```

Definition:

```text
pendingSwitchResumeId
= temporary target awaiting confirmation/commit
```

Do NOT create competing independent state such as:

- `selectedResumeId`
- `currentResumeId`
- `activeVariantId`
- `selectedVariant`
- `isCurrentResumeMaster`

If existing code already uses `selectedResumeId`, refactor carefully so there is still one authoritative active identity.

---

# 6. Canonical Variant Derivation

Variant identity must be derived from the actual active resume record:

```ts
const isMaster =
  currentResume?.variantType === 'MASTER';

const isTailored =
  currentResume?.variantType === 'TAILORED';
```

Do not maintain a second boolean source of truth.

Do not infer variant type from:

- URL
- title text
- target job presence
- filename
- UI state

The persisted `variantType` is authoritative.

---

# 7. Master Resume Presentation

When the active resume is Master:

Identity:

```text
⭐ MASTER RESUME
```

Context:

```text
Your canonical resume · Source: Career Profile
```

Do not display Target Job information for Master.

Preserve the existing Master stale/Profile sync indication.

Reuse existing design tokens/components.

---

# 8. Tailored Resume Presentation

When the active resume is Tailored:

Identity:

```text
🎯 TAILORED RESUME
```

Target Job Context must come directly from:

```ts
currentResume.targetJobTitle
currentResume.targetCompany
currentResume.targetJobId
```

Never infer or fabricate metadata.

Display rules:

```text
title + company
→ "Senior Frontend Engineer · Google"

title only
→ "Senior Frontend Engineer"

neither
→ "Job-specific variant"
```

Do not extract title/company from resume text.

---

# 9. Variant Switcher

Create or enhance:

```text
ResumeVariantSwitcher.tsx
```

Use lightweight existing portfolio metadata.

The switcher must NOT:

- Load every Resume AST.
- Fetch every full resume document.
- Duplicate Portfolio retrieval logic.
- Create a new backend endpoint unnecessarily.

Suggested structure:

```text
Master Resume
──────────────
Tailored Resumes
  - Variant A
  - Variant B
  - Variant C
```

Current active item must be clearly identified.

Accessibility:

- Keyboard accessible.
- Correct focus behavior.
- Correct `aria-*` attributes.
- Active item has an appropriate current/selected indication.
- Escape closes the menu.
- Enter/Space work through the actual menu primitive.
- Arrow navigation should use the existing accessible component primitive where available.

Do not manually recreate keyboard/menu behavior if an existing tested primitive exists.

---

# 10. Dirty State — Reuse Existing Save Architecture

Do NOT create a parallel dirty-state system.

Reuse the existing Resume Studio save lifecycle.

Conceptual states:

```text
saved
saving
unsaved
error
```

A timer ref may be inspected internally, but it must not become an independent reactive source of truth.

---

# 11. Explicitly Handle `saving`

A switch request must explicitly handle an already-running save.

Required behavior:

```text
saveStatus === "saving"
        ↓
await current save operation
        ↓
success → continue switch
error   → block switch
```

Never switch variants while a save request is still unresolved.

---

# 12. Pending Autosave Flush

If a debounced save is pending:

```text
pending autosave
        ↓
flush immediately
        ↓
await save completion
        ↓
success → continue
error   → block switch
```

Do not merely show a toast and continue.

The switch transaction must await the authoritative save operation.

---

# 13. Dirty Unsaved Changes

Define exact semantics.

## Case A — Pending save

```text
pending save
→ flush
→ await
→ success
→ switch
```

## Case B — Local unsaved changes with no persisted save

Show:

```text
[Stay Here]
[Switch Resume]
```

`Stay Here`:

- Keep current resume.
- Preserve local edits.

`Switch Resume`:

- Intentionally discard local unsaved changes.
- Load target variant.

Do not accidentally discard already-persisted changes.

---

# 14. Save Error

If current resume has an unresolved save error:

```ts
saveStatus === "error"
```

Do not silently switch away.

Use the existing error handling/toast pattern and clearly tell the user that the current changes must be resolved before switching.

---

# 15. Variant Switch as a Transaction

Implement switching as a safe transaction:

```text
USER ACTION / BROWSER NAVIGATION
        ↓
Resolve target
        ↓
Check save/dirty state
        ↓
Flush + await save when necessary
        ↓
Confirm discard when necessary
        ↓
Fetch target resume
        ↓
Validate target
        ↓
Concurrency check
        ↓
Commit active resume/document/config
        ↓
Update Studio identity/context
        ↓
Synchronize URL
        ↓
Start background intelligence
        ↓
Protect background responses against stale requests
```

Never perform a partial switch.

---

# 16. Concurrency Guard

Use a request sequence such as:

```ts
const switchRequestIdRef = useRef(0);
```

Every actual switch transaction receives a new request ID:

```ts
const currentRequestId =
  ++switchRequestIdRef.current;
```

Before any state mutation after an awaited async operation, verify:

```ts
currentRequestId === switchRequestIdRef.current
```

If not, ignore the stale response.

---

# 17. Concurrency Must Protect the Entire Transaction

Do NOT guard only `getResumeById()`.

Variant-specific asynchronous work such as:

```ts
fetchScore()
fetchAtsIntelligence()
```

can also resolve out of order.

Either:

- Guard all variant-specific async state updates with the same request token, or
- Make those functions independently verify that their response still belongs to the current `activeResumeId`.

Required invariant:

```text
A stale variant response must never overwrite
state belonging to a newer active variant.
```

For:

```text
A → B → C
```

responses for A or B that resolve after C must be ignored.

---

# 18. Browser Navigation vs User Switching

Explicitly distinguish:

```ts
USER_VARIANT_SWITCH
```

from:

```ts
BROWSER_HISTORY_NAVIGATION
```

## User Variant Switch

```text
User clicks variant
→ validate dirty/save state
→ load target
→ commit target
→ router.push()
```

## Browser Back/Forward

```text
URL/searchParams changes
→ compare requested resumeId with activeResumeId
→ apply dirty/save policy
→ load target
→ commit target
```

Do NOT call `router.push()` during browser-history navigation.

Avoid history pollution and loops.

---

# 19. Prevent Router/Search-Param Loops

Programmatic navigation must be distinguishable from browser-originated navigation.

Use a suitable navigation-intent/request ref or equivalent.

Required behavior:

```text
User selects B
→ load B
→ commit B
→ router.push(B)

searchParams changes to B
→ recognize programmatic navigation
→ do NOT execute another switch
```

There must be no:

- duplicate history entries
- recursive switching
- router/search-param loops

---

# 20. Use Next.js App Router, Not a Parallel Native Routing System

Preferred:

```ts
useRouter()
usePathname()
useSearchParams()
router.push()
router.replace()
```

with `{ scroll: false }` where appropriate.

Do not create a second independent navigation system using raw:

```ts
window.history.pushState()
window.popstate
```

unless the existing architecture genuinely requires it.

If a routing helper is necessary, keep it isolated and aligned with the existing App Router pattern.

---

# 21. URL Must Reflect Only Committed State

Never update the URL before target load/commit succeeds.

Correct:

```text
fetch target
→ validate target
→ concurrency check
→ commit target
→ update URL
```

Failure:

```text
target fetch fails
→ current resume remains active
→ current editor remains intact
→ URL remains unchanged
```

The URL must never point to an uncommitted or failed variant.

---

# 22. Browser Back/Forward Cancel Behavior

If browser navigation occurs while dirty:

```text
Browser navigation detected
→ dirty confirmation
```

If user chooses Stay Here:

```text
keep active resume
restore previous URL with router.replace()
do not create a new history entry
```

If user confirms:

```text
discard local unsaved state
→ load target
→ commit target
```

Avoid push/replace loops.

---

# 23. Deep Linking

Support:

```text
/dashboard/resume-studio?resumeId=<id>
```

A direct Tailored Resume URL must load the Tailored variant.

Do not default to Master simply because the route was opened directly.

Also test:

- Direct Master URL.
- Direct Tailored URL.
- No `resumeId`.
- Invalid resume ID.
- Deleted resume.
- Unauthorized resume.
- Valid direct resume with stale lightweight metadata.

The actual persisted `variantType` is authoritative.

---

# 24. Invalid / Deleted / Unauthorized Target

If target loading returns error/404/unauthorized:

Required result:

- Keep current active resume.
- Keep current editor state intact.
- Do not mutate Master/Profile.
- Do not update URL.
- Show controlled error using existing app patterns.
- No partial switch.

---

# 25. Master/Profile Immutability

This must remain absolute.

When editing Tailored:

```text
Tailored Resume update
→ allowed

Master Resume mutation
→ never

Career Profile mutation
→ never
```

All existing autosave and builder-config persistence must target:

```ts
activeResumeId
```

When:

```ts
currentResume.variantType === 'TAILORED'
```

the persistence target must be that Tailored Resume ID.

Do not invoke Profile hydration/update APIs as part of Tailored editing.

Master delete protection must remain intact.

---

# 26. Test Save Isolation Through the Real Studio Path

Do not only mock helper functions.

Test the actual path:

```text
UI edit
→ useResumeStudio
→ resume service
→ save/PATCH
→ Tailored Resume ID
```

Prove:

```text
Tailored save → Tailored ID
Master PATCH  → never called
Profile update → never called
```

Retain server-side authorization/protection.

---

# 27. Performance-Safe 6E.1 Diff Badge

6E.2 may optionally display:

```text
12 changes from Master
```

ONLY when the Master AST/document is already available in current Studio state.

Rules:

```text
Master AST available
→ computeResumeDiff(...)
→ display count

Master AST unavailable
→ omit badge
→ no additional Master AST fetch
→ no extra loading state
```

Do not fetch Master solely for this badge.

Do not duplicate 6E.1 comparison logic.

---

# 28. Reuse the Actual 6E.1 Contract

Before implementation, inspect the actual exported `computeResumeDiff()` API.

Do not invent a simplified context.

Use:

- Existing function signature.
- Existing typed result.
- Existing normalization rules.

The badge must remain:

- deterministic
- read-only
- pure from available state
- network-free

---

# 29. UI/Header Design

The Studio header should clearly communicate:

```text
[← Portfolio]
[⭐ Master Resume ▾]
or
[🎯 Tailored Resume ▾]
[Target Job]
[Optional: 12 changes]
```

Reuse existing Resume Studio header architecture.

Do not make the header excessively crowded.

On mobile:

- Condense target job context.
- Keep switching accessible.
- Preserve existing Content / Design / ATS modes.
- Avoid duplicate navigation controls.

---

# 30. Reuse Existing Design-System Primitives

Before creating new visual states, inspect existing design tokens/components.

Reuse:

- Colors.
- Typography.
- Buttons.
- Dropdown/menu primitives.
- Dialog/modal primitives.
- Icons.
- Spacing.
- Accessibility conventions.

Do not introduce an unrelated visual language.

---

# 31. Component Boundaries

Expected components are acceptable:

```text
ResumeStudioHeader.tsx
ResumeVariantBadge.tsx
ResumeTargetJobContext.tsx
ResumeVariantSwitcher.tsx
ResumeSwitchConfirmDialog.tsx
```

But inspect whether equivalent components already exist.

Do not create duplicate abstractions.

Use:

```text
useResumeStudio
```

as the central orchestration layer.

Keep page.tsx focused on composition/routing.

---

# 32. No Duplicate State Systems

Do not create independent systems for:

- Dirty tracking.
- Resume identity.
- Save status.
- Target job state.
- Variant type.
- Router state.
- Diff logic.

Reuse existing architecture and derive state wherever possible.

---

# 33. Comprehensive Tests

## Component Tests

Cover:

- Master identity.
- Tailored identity.
- Canonical Master subtitle.
- Tailored target title/company.
- Missing target metadata.
- Variant dropdown.
- Active variant indicator.
- ARIA/current state.
- 6E.1 badge shown only when Master AST exists.

## Save/Dirty Tests

Cover:

- Clean switch.
- Dirty switch.
- Stay Here.
- Confirm Switch.
- Pending autosave flush.
- Already `saving`.
- Save success.
- Save failure.
- Save error blocks switching.
- Persisted changes are not accidentally discarded.

## Concurrency Tests

Cover:

```text
A → B
A resolves after B
→ A ignored
```

and:

```text
A → B → C
A resolves last
→ A ignored

B resolves after C
→ B ignored
```

Also verify stale score/intelligence responses cannot overwrite C.

## Routing Tests

Cover:

- User switch.
- URL update after commit.
- Deep-link Master.
- Deep-link Tailored.
- No query parameter.
- Browser Back.
- Browser Forward.
- Dirty Back/Forward.
- Cancelled browser navigation.
- No router loop.
- No duplicate history entries.
- Invalid/deleted/unauthorized resume.

## Isolation Tests

Verify:

- Tailored save uses Tailored ID.
- Master update never occurs.
- Profile update never occurs.
- Master deletion protection remains active.

---

# 34. Tests Must Verify Outcomes

Do not stop at:

```ts
expect(router.push).toHaveBeenCalled()
```

Also verify:

```text
activeResumeId changed correctly
active document changed correctly
editor state changed correctly
URL reflects committed variant
dirty state behaves correctly
failed saves block switching
stale requests cannot overwrite active state
Tailored saves remain isolated
```

Accessibility tests should exercise the actual component primitive.

---

# 35. Do Not Hardcode Test Counts

Do not use historical assumptions such as:

```text
94 existing tests + new tests
```

Run the actual repository commands and report real counts.

Use:

```bash
cd client && npx vitest run
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

If the repository has an established standard command, use that instead.

Report exact:

- Focused test count.
- Full client test count.
- Client TypeScript result.
- Server TypeScript result.

---

# 36. No Unnecessary Backend Changes

6E.2 is primarily a Studio integration phase.

Before changing backend, inspect:

- Existing Portfolio metadata API.
- Existing Resume retrieval API.
- Existing Resume update API.
- Existing Builder Config API.
- Existing authorization.

Only change backend contracts if an existing contract is genuinely insufficient.

Do not introduce new collections/models/endpoints merely for UI convenience.

---

# 37. Security Boundary

Client-side protection is not sufficient.

Authorization and ownership must remain enforced server-side.

A user must not be able to mutate another Resume simply by changing:

```text
resumeId
```

Use existing ownership/authorization middleware and service validation.

---

# 38. Final Switch Invariant

Every variant switch must satisfy:

```text
1. Resolve target
2. Check ownership/authorization
3. Check save/dirty state
4. Flush pending save when necessary
5. Await running save when necessary
6. Confirm discard when necessary
7. Load target
8. Validate target
9. Check request sequence
10. Commit target atomically
11. Update identity/context
12. Synchronize URL
13. Start background intelligence
14. Guard background responses
```

At no point may the implementation:

```text
- lose persisted edits
- partially switch variants
- mutate Master from Tailored editing
- mutate Career Profile from Tailored editing
- let stale responses overwrite current state
- point the URL at an uncommitted variant
- create navigation loops
- fetch unnecessary ASTs for the switcher/diff badge
```

---

# 39. Definition of Done

- [ ] Master and Tailored identities are visually distinct.
- [ ] Target Job Title/Company comes only from canonical metadata.
- [ ] Variant Switcher uses lightweight metadata.
- [ ] `activeResumeId` is the canonical active identity.
- [ ] `isMaster` is derived from `currentResume.variantType`.
- [ ] Dirty changes cannot be lost accidentally.
- [ ] Pending saves are flushed and awaited.
- [ ] Existing `saving` state is awaited.
- [ ] Save errors block switching safely.
- [ ] Request sequence protects the full transaction.
- [ ] Background score/intelligence responses are also protected.
- [ ] Next.js App Router is the routing mechanism.
- [ ] User navigation and browser history navigation are separated.
- [ ] No router/search-param loops occur.
- [ ] URL changes only after successful target commit.
- [ ] Direct Tailored deep links work.
- [ ] Invalid/deleted/unauthorized targets fail safely.
- [ ] Master Resume remains immutable from Tailored editing.
- [ ] Career Profile remains untouched from Tailored editing.
- [ ] Master delete protection remains intact.
- [ ] 6E.1 diff badge never triggers unnecessary AST fetching.
- [ ] Existing design/accessibility primitives are reused.
- [ ] No duplicate state systems are introduced.
- [ ] No unnecessary backend architecture is introduced.
- [ ] Focused tests pass.
- [ ] Full client regression passes.
- [ ] Client TypeScript passes with 0 errors.
- [ ] Server TypeScript passes with 0 errors.

---

# 40. Implementation Discipline

Implement the **smallest change set necessary**.

Do not rewrite:

- Resume Studio renderer.
- Resume AST architecture.
- Resume renderer.
- ATS scoring.
- Career Profile.
- Master Resume generation.
- Tailoring Engine.
- 6E.1 Diff Engine.

Use existing services and state wherever possible.

After implementation:

1. Run focused tests.
2. Run full client regression.
3. Run client TypeScript check.
4. Run server TypeScript check.
5. Review the diff for accidental architecture changes.
6. Verify Master/Profile immutability.
7. Verify deep-link and browser Back/Forward behavior.
8. Verify rapid-switch concurrency.
9. Verify save/dirty handling.
10. Report exact test/typecheck results.

# Final Instruction

Implement **Phase 6E.2 only**.

The final result should make Resume Studio clearly understand:

```text
WHAT resume am I editing?
WHICH job is it tailored for?
HOW do I safely switch variants?
WILL my changes be lost?
```

while preserving the existing SKILLEZO architecture and keeping all 6E.3/6E.4 functionality deferred.
