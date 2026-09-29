# SKILLEZO AI — Phase 6E.2
# Required Changes Before Implementation

## Review Status

**Current plan:** PASS WITH CHANGES

The Phase 6E.2 architecture is correct, but the following implementation-safety corrections must be applied before coding.

These are **implementation corrections, not a redesign**.

---

## 1. CRITICAL — Do Not Hardcode the Studio Route

The plan currently assumes:

```text
/dashboard/resume-studio?resumeId=<id>
```

Before implementation, inspect the actual current Studio route.

Use the existing canonical route from the codebase.

Do NOT create or migrate routes just for Phase 6E.2.

All URL synchronization must operate on the existing Studio route.

---

## 2. CRITICAL — Do Not Use `window.history.pushState()` as the Primary Routing Mechanism

The plan currently proposes direct:

```ts
window.history.pushState(...)
```

Do not directly own browser routing if the application already uses Next.js routing/navigation.

Inspect the current routing implementation first.

Use the project's existing routing abstraction.

Requirements:

- URL updates when the active resume changes.
- Browser Back/Forward works.
- No full page reload.
- No navigation loops.
- No duplicate history entries.
- React/Next.js router state remains synchronized with Studio state.

If direct `pushState` is already required by the existing architecture, isolate it behind the existing routing abstraction rather than spreading `window.history` calls through Studio logic.

---

## 3. CRITICAL — Browser Back/Forward Must NOT Be Treated Like a Normal User Switch

The plan currently suggests:

```text
popstate
  ↓
switchResumeVariant(popResumeId)
```

Do not blindly route browser Back/Forward through the normal dirty-state confirmation flow.

Example:

```text
Tailored A
    ↓
Tailored B
    ↓
Browser Back
    ↓
Tailored A
```

The implementation must define how unsaved state is handled without creating:

- confirmation loops
- history loops
- pushState after popstate
- duplicate history entries

Use separate internal concepts:

```text
USER_VARIANT_SWITCH
BROWSER_HISTORY_NAVIGATION
```

Both ultimately load the requested resume safely, but they must not blindly perform identical URL mutations.

---

## 4. CRITICAL — Dirty State Must Use the Existing Authoritative Source

The plan currently relies heavily on:

```ts
saveStatus === 'unsaved'
```

Inspect the existing `useResumeStudio` state model first.

If the Studio already has:

```text
isDirty
dirty
hasUnsavedChanges
saveStatus
```

identify the canonical source.

Do not create a second dirty-state system.

The switching guard must use the existing authoritative dirty state.

If `saveStatus` is genuinely the canonical source, continue using it.

Otherwise derive switching safety from the actual dirty state.

---

## 5. IMPORTANT — Saving State Should Prefer Waiting for Existing Save Completion

The current plan says:

```text
saving
  ↓
toast
  ↓
return
```

This may be unnecessarily restrictive.

Inspect the existing autosave lifecycle.

Prefer:

```text
saving
  ↓
wait for existing save completion
  ↓
success → switch
failure → stay
```

when the current architecture supports awaiting the save promise.

Do NOT create an artificial blocking toast if the existing save operation can safely be awaited.

If the existing save architecture cannot be awaited safely, then block the switch and explain why.

Never switch while a save for the current resume is unresolved.

---

## 6. CRITICAL — `requestIdRef` Must Protect the Entire Switch Transaction

The sequence counter is useful:

```ts
const currentRequestId = ++switchRequestIdRef.current;
```

But it must protect against stale side effects, not only stale document responses.

Example:

```text
A request starts
B request starts
B resolves
B becomes active
A resolves
A is ignored
```

Correct.

But stale A must also be prevented from changing:

- active resume
- URL
- dirty state
- save state
- error state
- variant metadata
- editor state
- preview state

The latest-request-wins guard must cover the complete switch transaction.

---

## 7. CRITICAL — Do Not Update URL Before Target Resume Successfully Loads

Use this safe conceptual order:

```text
User requests target variant
        ↓
Validate target
        ↓
Handle dirty/save state
        ↓
Load target resume
        ↓
Validate response
        ↓
Commit target as active
        ↓
Synchronize URL
```

Do not make the URL point to a resume that failed to load.

If the existing router requires navigation before loading, explicitly preserve a rollback strategy.

---

## 8. CRITICAL — Define One Canonical Active Resume ID

The plan uses multiple concepts such as:

```text
selectedResumeId
currentResume
active resume
target resume
```

Define them clearly before implementation.

Recommended:

```text
activeResumeId
```

= resume currently loaded and rendered in Studio.

```text
pendingSwitchResumeId
```

= resume the user intends to switch to but has not committed yet.

Do not maintain multiple competing sources of truth.

---

## 9. IMPORTANT — Variant Switcher Must Not Assume Portfolio Data Is Always Available

The plan says the switcher uses the existing `resumes` array.

Verify how that array is actually loaded into Studio.

If Portfolio metadata is not already available, use the existing metadata service/hook.

Do NOT silently fetch full ResumeDocuments.

Preferred:

```text
Portfolio metadata
        ↓
Variant Switcher
        ↓
selected resume ID
        ↓
Full Resume fetch
```

Never:

```text
Load every ResumeDocument
        ↓
Build switcher
```

---

## 10. CRITICAL — Server Authorization Remains the Security Boundary

For:

```text
/studio?resumeId=<id>
```

the client must not assume the ID belongs to the current user.

The existing server/API authorization must remain authoritative.

Do not add client-side ownership logic as a security mechanism.

Do not leak whether another user's resume exists.

---

## 11. IMPORTANT — Deep Linking Must Trust Persisted Resume Metadata

When loading:

```text
?resumeId=<tailoredId>
```

the Studio must render the actual Resume record returned by the server.

Do not infer variant type from:

- URL
- query parameters
- display name
- client state

The persisted Resume record is authoritative.

If the server returns:

```text
variantType = MASTER
```

render Master.

If:

```text
variantType = TAILORED
```

render Tailored.

---

## 12. CRITICAL — Do Not Introduce `isCurrentResumeMaster` as Another Source of Truth

The plan currently allows:

```ts
currentResume.variantType === 'MASTER'
```

or:

```ts
isCurrentResumeMaster === true
```

Prefer:

```ts
const isMaster = currentResume.variantType === 'MASTER';
```

Use `variantType` as the canonical source.

Do not persist or independently maintain another Master/Tailored flag.

---

## 13. IMPORTANT — Target Job Context Must Use Canonical Metadata

Priority should be:

```text
Tailored Resume metadata
        ↓
Existing JobProfile lookup, only if already available
        ↓
Safe fallback
```

Do not infer target information from:

- resume title
- summary
- skills
- filename
- arbitrary text
- AI

No inference.

---

## 14. CRITICAL — Keep the 6E.1 Diff Badge Optional and Performance-Safe

The optional:

```text
12 changes from Master
```

is acceptable.

However, it must not become a mandatory dependency of 6E.2.

If showing it requires loading a full Master AST only for a small header badge, assess the performance cost first.

Preferred:

```text
If Master + Tailored documents are already available
        ↓
computeResumeDiff()
        ↓
display totalChanges
```

Otherwise:

```text
Do not fetch another full AST solely for the badge.
```

The 6E.1 engine remains optional in this phase.

---

## 15. CRITICAL — Do Not Recalculate Diff Logic in the UI

There must be exactly one diff engine:

```ts
computeResumeDiff()
```

The UI consumes:

```ts
ResumeComparisonResult
```

Do NOT implement separate logic such as:

```ts
master.skills.length - tailored.skills.length
```

or:

```ts
changedSections++
```

to approximate the diff count.

---

## 16. IMPORTANT — Verify Actual `computeResumeDiff()` Context Requirements

Phase 6E.1 accepts:

```ts
computeResumeDiff(masterDoc, tailoredDoc, context)
```

Inspect the actual implementation before calling it.

Do not pass fabricated or incomplete traceability context merely to obtain a count.

If the engine supports a minimal valid context for structural comparison, use that.

Otherwise defer the badge until a valid Master/Tailored context is available.

---

## 17. CRITICAL — Do Not Overload the Studio Header

The current plan adds:

- Variant badge
- Target job
- Variant switcher
- Diff count
- Save status
- Sync
- PDF
- Content
- Design
- ATS

Inspect the existing header before adding these.

Recommended hierarchy:

```text
[Back]
[Variant Identity]
[Target Job]
[Variant Switcher]

                         [Save State]
                         [Existing Actions]
```

Do not duplicate the same information in multiple places.

The header must remain visually clean.

---

## 18. IMPORTANT — Reuse Existing Design System Components

Do not introduce arbitrary new visual language merely because the plan specifies:

```text
amber
indigo
emerald
```

Inspect the existing design system/theme.

Reuse existing:

- badge variants
- typography
- spacing
- buttons
- dropdown/menu primitives
- dialog primitives
- icons

The goal is consistency with Phase 5.5.

---

## 19. CRITICAL — Reuse Existing Dialog/Menu Infrastructure

Before creating:

```text
ResumeSwitchConfirmDialog
ResumeVariantSwitcher
```

inspect whether the project already has:

- Dialog
- AlertDialog
- DropdownMenu
- Popover
- Command
- Select

components.

Reuse them where appropriate.

Do not implement custom focus trapping or keyboard management if existing accessible primitives already provide it.

---

## 20. IMPORTANT — Test the Actual Accessibility Primitive

Do not manually implement keyboard behavior if an existing accessible menu primitive already provides:

- Enter
- Space
- Arrow keys
- Escape
- Focus management

If an existing primitive is used, test the resulting behavior rather than duplicating keyboard logic.

---

## 21. CRITICAL — Browser Back/Forward Tests Must Verify Real History Semantics

Do not only assert that:

```ts
pushState()
```

was called.

Test actual behavior:

```text
Master
  ↓
Tailored A
  ↓
Tailored B
  ↓
Back
  ↓
Tailored A
```

and:

```text
Forward
  ↓
Tailored B
```

Also verify:

```text
Back/Forward does not create additional history entries.
```

---

## 22. IMPORTANT — Define Dirty State + Browser Back Policy

Example:

```text
Current Tailored A
dirty = true

Browser Back requests Master
```

The implementation must not create:

```text
popstate
  ↓
pushState
  ↓
popstate
  ↓
pushState
```

and must not create an infinite loop.

Choose one safe policy based on the existing routing architecture:

- block navigation until user confirms
- restore current route and then ask for confirmation
- use the framework's navigation interception mechanism

Document the chosen policy in code.

---

## 23. CRITICAL — Test Actual Tailored Save Isolation

Do not only assert that the UI displays Tailored.

Test the actual save target:

```text
Active = Tailored ID
        ↓
Edit
        ↓
Save
        ↓
PATCH/PUT target ID === Tailored ID
```

Also verify:

```text
Master ID !== Tailored ID
```

and that Profile APIs are not invoked as a side effect of Tailored presentation edits.

---

## 24. IMPORTANT — Verify Master/Profile Protection at the Service/API Boundary

The strongest test is:

```text
Tailored edit
    ↓
save
    ↓
assert Tailored ID used
    ↓
assert Master update not called
    ↓
assert Profile update not called
```

Do not rely only on React state assertions.

---

## 25. IMPORTANT — Deep-Link Tests Must Cover Master and Tailored

At minimum:

```text
/studio?resumeId=<masterId>
→ Master

/studio?resumeId=<tailoredId>
→ Tailored
```

Also test the existing no-query behavior:

```text
/studio
```

Do not silently change the current default behavior unless required.

---

## 26. IMPORTANT — Do Not Hardcode Existing Test Counts

Do not write:

```text
94 existing tests + new tests
```

as a permanent requirement.

Run:

```bash
cd client
npx vitest run
```

and report the actual result.

Tests may change during implementation.

---

## 27. IMPORTANT — Test Deleted/Stale Variant Scenarios

Add tests for:

```text
Variant exists in Portfolio metadata
        ↓
Variant deleted before switch
        ↓
Switch request fails
        ↓
Current Studio remains stable
```

Also test:

```text
Current variant deleted externally
        ↓
Studio handles existing error behavior
```

No corrupted active state.

---

## 28. IMPORTANT — Do Not Add Backend Just Because the UI Wants a Field

Before changing server code:

1. Inspect current Resume model.
2. Inspect Portfolio endpoint.
3. Inspect Resume retrieval endpoint.
4. Inspect existing authorization.
5. Inspect current Studio API.

Only add backend changes if the existing contract genuinely cannot support the already-established architecture.

No:

- new model
- new collection
- parallel Resume endpoint
- duplicated metadata source

---

## 29. TEST THE DIFF BADGE WITHOUT DUPLICATING 6E.1

If the optional badge is implemented, only test:

```text
ResumeComparisonResult.totalChanges = 12
        ↓
UI displays:
"12 changes from Master"
```

Do not retest 6E.1 internals such as:

- skill matching
- bullet matching
- proposal matching
- ambiguity handling
- normalization

Those belong to Phase 6E.1.

---

# 30. REQUIRED FINAL VERIFICATION

After implementation report:

## Focused Tests

```text
X/X passed
```

Use actual numbers.

## Full Client Regression

```text
X test files / Y tests passed
```

Use actual numbers.

## Client TypeScript

```text
0 errors
```

## Server TypeScript

```text
0 errors
```

## Manual QA

Verify:

```text
Master → Tailored
Tailored → Master
Tailored A → Tailored B
Dirty → switch confirmation
Saving → safe behavior
Save error → safe behavior
Browser Back
Browser Forward
Direct Tailored deep link
Tailored edit/save isolation
Master protection
Responsive header
Keyboard navigation
Accessibility
Deleted/stale variant handling
```

---

# FINAL IMPLEMENTATION BOUNDARY

The architecture remains:

```text
6E.1
Deterministic Diff Engine
        ↓
6E.2
Studio Context + Variant Navigation
        ↓
6E.3
Tailoring Insights
        ↓
6E.4
Comparison + Evidence
```

Do NOT expand 6E.2 beyond this.

The most important corrections are:

1. Use the project's real router instead of assuming `window.history.pushState`.
2. Separate browser history navigation from normal variant switching.
3. Use one canonical dirty-state source.
4. Make saving behavior awaitable where possible.
5. Protect the entire switch transaction from stale responses.
6. Do not update URL before successful resume loading.
7. Use one canonical `activeResumeId`.
8. Verify actual save isolation against Tailored ID.
9. Keep the 6E.1 diff badge optional and performance-safe.
10. Do not hardcode existing test counts.

After applying these changes, Phase 6E.2 is **READY TO IMPLEMENT**.
