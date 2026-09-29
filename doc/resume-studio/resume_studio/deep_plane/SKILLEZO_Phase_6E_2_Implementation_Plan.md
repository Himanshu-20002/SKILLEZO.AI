# SKILLEZO AI — Phase 6E.2 Implementation Plan (Production Grade — Final Alignment)
## Studio Integration — Tailored Resume Identity, Target Job Context & Variant Switcher

---

## 1. Executive Summary & Objective

Phase 6E.2 integrates the Master and Tailored Resume architecture into the **Resume Studio UX**.

Following the successful completion of the deterministic diff engine (Phase 6E.1), Phase 6E.2 establishes **context awareness, visual identity, and navigation safety**:
1. **Immediate Variant Clarity:** The candidate instantly recognizes whether they are editing the **Master Resume** (`⭐ MASTER RESUME`) or a **Tailored Resume Variant** (`🎯 TAILORED RESUME`).
2. **Authentic Target Job Context:** Displays Target Job Title and Company (`Senior Frontend Engineer · Google`), sourced directly from canonical metadata (0 fabricated data, no inference from resume text).
3. **Lightweight Variant Switcher:** Fast, accessible dropdown in the header displaying Master and Tailored variants, driven by lightweight Portfolio metadata (`resumes` array) without fetching unselected ASTs.
4. **Authoritative Dirty-State & Pending Autosave Flush:**
   - Unsaved local edits trigger an accessible confirmation modal (`[Stay Here]` vs `[Switch Resume]`).
   - In-flight autosaves (`saveTimerRef`) are flushed immediately and awaited.
   - Ongoing saves (`saveStatus === 'saving'`) await `activeSavePromiseRef` with strict lifecycle cleanup.
   - Unresolved save errors (`saveStatus === 'error'`) strictly block switching.
5. **Full Transaction Concurrency Guard (`switchRequestIdRef`):** Protects the entire switch transaction (active record, document AST, builder config, save state, URL, background score, ATS intelligence) against out-of-order responses during rapid clicking.
6. **Canonical Next.js App Router Synchronization:** Uses the existing `/dashboard/resume-studio` route with `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`). Distinguishes `USER_VARIANT_SWITCH` from `BROWSER_HISTORY_NAVIGATION` via request token tracking to eliminate history loops and rapid-switch race conditions.
7. **Consistent Deep Link Re-alignment:** If a direct deep link fails (404/deleted/unauthorized), Studio loads the fallback resume, commits it, and **only then** executes `router.replace()` to align the URL with the committed resume.
8. **Absolute Master & Profile Immutability:** All editing and autosaving in Tailored mode target the Tailored Resume ID. Master Resume record and Career Profile are 100% untouched. Master delete protection remains strictly enforced.
9. **Performance-Safe 6E.1 Diff Summary Badge:** Displays `X changes from Master` badge **only if** the Master AST is already present in Studio memory. Never triggers an additional network fetch solely for the badge.

---

Before implementing the 6E.1 diff badge, inspect the actual exported
computeResumeDiff() signature and TypeScript contract from Phase 6E.1.

Use the real existing signature exactly.

Do not invent, simplify, duplicate, or bypass the required
ResumeComparisonContext.

The 6E.2 diff badge must consume the existing 6E.1 implementation
without modifying the 6E.1 engine.

## 2. Hard Scope Boundaries

### In Scope
1. **Studio Header Visual Identity:** `ResumeVariantBadge` with distinct visual styles for Master vs Tailored.
2. **Target Job Context:** `ResumeTargetJobContext` displaying title and company from canonical metadata.
3. **Variant Switcher Dropdown:** `ResumeVariantSwitcher` showing Master at the top and Tailored variants below, with active indicator and full keyboard accessibility.
4. **Unsaved Changes Dialog:** `ResumeSwitchConfirmDialog` using `@radix-ui/react-dialog` for dirty-state protection.
5. **Single Canonical Active ID:** `activeResumeId` as the conceptual canonical identity, backed internally by `selectedResumeId` (0 competing ID states).
6. **Canonical Variant Derivation:** `isMaster = currentResume?.variantType === 'MASTER'`, `isTailored = currentResume?.variantType === 'TAILORED'`.
7. **Pending Autosave Flush & Await:** Immediate flush of debounced timer and awaiting of active save promises via `activeSavePromiseRef`.
8. **Sequence Counter Concurrency Guard:** `switchRequestIdRef` guarding the full switch transaction and background intelligence (`fetchScore`, `fetchAtsIntelligence`).
9. **Next.js App Router Integration:** Route `/dashboard/resume-studio?resumeId=<id>` with `router.push(..., { scroll: false })` updated strictly **after** successful load & commit.
10. **Navigation Token Guard:** `programmaticNavigationTokenRef` tracking `{ id, requestId }` to avoid race conditions during rapid consecutive switches.
11. **Direct Deep Linking & Invalid Link Fallback:** Direct loads to Tailored load directly; invalid links load fallback and then reconcile URL with `router.replace()`.
12. **Master & Profile Protection:** Tests verifying save isolation, immutability, and delete protection.
13. **Optional 6E.1 Diff Summary:** Pure calculation via `computeResumeDiff` if Master AST is loaded; omitted otherwise.

### Strictly Out of Scope (Deferred to 6E.3 / 6E.4)
- **NO Tailoring Insights UI** (Phase 6E.3)
- **NO Comparison Modal, Side-by-Side Diff, or Unified Diff UI** (Phase 6E.4)
- **NO Evidence Drawer UI** (Phase 6E.4)
- **NO new AI / LLM calls or prompts**
- **NO new scoring / matching engines**
- **NO new database collections, Mongoose models, or parallel endpoints**
- **NO Auto-Apply or Application tracking workflows**
- **NO Career Profile schema modifications**

---

## 3. Canonical Architecture & Sources of Truth

### 3.1 Canonical Active Resume vs Lightweight Metadata
To prevent state desynchronization, the architecture enforces a strict boundary between the **loaded active resume** and the **lightweight portfolio metadata**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTHORITATIVE BOUNDARIES                        │
├──────────────────────────────────────┬─────────────────────────────────┤
│ Active Loaded Resume (Hook State)    │ Lightweight Portfolio Metadata  │
├──────────────────────────────────────┼─────────────────────────────────┤
│ • Full Resume AST (resumeDoc)        │ • List of candidate resumes     │
│ • Full Builder Config (builderConfig)│ • Switcher dropdown items       │
│ • Authoritative variantType          │ • Display titles & dates        │
│ • Authoritative targetJobTitle       │ • Fallback listing              │
│ • Authoritative targetCompany        │                                 │
│ • Authoritative targetJobId          │ ⚠️ NEVER used to override       │
│ • Authoritative saveStatus & isDirty │    currently loaded AST/variant │
└──────────────────────────────────────┴─────────────────────────────────┘
```

### 3.2 Canonical Identifiers & State Resolution (`selectedResumeId` vs `activeResumeId`)
To maintain absolute architectural clarity without breaking existing internal hook state:
```ts
// In useResumeStudio.ts:
// 1. selectedResumeId remains the existing underlying internal React state
const [selectedResumeId, setSelectedResumeId] = useState<string | null>(initialResumeId || null);

// 2. activeResumeId is the conceptual canonical identity exported and referenced everywhere
const activeResumeId = selectedResumeId;

// Export activeResumeId alongside selectedResumeId for seamless compatibility:
return {
  activeResumeId,     // Canonical exported identity
  selectedResumeId,   // Preserved for backward compatibility
  ...
};
```
- **Rule:** Do NOT introduce any second competing state (e.g. `activeVariantId`, `currentResumeId`, `selectedVariant`). There is exactly ONE underlying React state variable holding the active resume ID.
- **Canonical variant determination (derived strictly from active record):**
```ts
const isMaster = currentResume?.variantType === 'MASTER';
const isTailored = currentResume?.variantType === 'TAILORED';
```
- **Rule:** Never maintain independent booleans like `isCurrentResumeMaster` as mutable state. Always derive from `currentResume?.variantType`.
- **Rule:** Never infer variant type from URL query params, title text, or the presence of target job fields. The persisted `variantType` from the server is authoritative.

### 3.3 Target Job Context Presentation Rules
Target Job metadata is sourced strictly from:
```ts
currentResume.targetJobTitle
currentResume.targetCompany
currentResume.targetJobId
```
- **Formatting Rules:**
  - Both Title & Company present: `"Senior Frontend Engineer · Google"`
  - Title only: `"Senior Frontend Engineer"`
  - Neither present: `"Job-specific variant"`
- **Rule:** Never extract or guess title/company from resume text, file names, or skills.
- **Rule:** Master Resume is job-agnostic. Target job context is **never displayed** for Master. Instead, Master displays: `"Your canonical resume · Source: Career Profile"`.

### 3.4 Performance-Safe 6E.1 Diff Summary Badge
```ts
// In useResumeStudio.ts
const diffSummary = useMemo(() => {
  if (!isTailored || !resumeDoc || !masterResumeDoc) {
    return null; // Omit badge: Master AST is not loaded
  }
  try {
    return computeResumeDiff(masterResumeDoc, resumeDoc);
  } catch (err) {
    console.warn('Failed to compute resume diff summary', err);
    return null;
  }
}, [isTailored, resumeDoc, masterResumeDoc]);
```
- **Rule:** Only calculate when `masterResumeDoc` is already in hook state.
- **Rule:** Never dispatch a network request just to fetch `masterResumeDoc` for the header badge.

#### 3.4.1 Cached `masterResumeDoc` Session Refresh Contract
To ensure the diff badge never calculates its change count against an obsolete in-memory Master document when the Master Resume is edited and saved during the same Studio session:
```ts
// In useResumeStudio.ts:
// State:
const [masterResumeDoc, setMasterResumeDoc] = useState<ResumeDocument | null>(null);

// Invariant: Whenever the Master Resume document is initialized or mutated in the session,
// masterResumeDoc is updated to the freshest document:
// 1. Initial Load: If loaded resume is Master -> setMasterResumeDoc(masterRecord.resumeDocument);
// 2. Switch to Master: When targetResume.variantType === 'MASTER' -> setMasterResumeDoc(targetResume.resumeDocument);
// 3. Section Suggestions: When approving suggestion on Master (isMaster === true) -> setMasterResumeDoc(result.resumeDocument);
// 4. Master Sync: When syncing Master with Profile (handleSyncMasterResume) -> setMasterResumeDoc(syncResult.resume.resumeDocument);
// 5. Document Edits/Saves: When any document edit or save persists on Master -> setMasterResumeDoc(updatedDoc);
```
- **Guaranteed Outcome:** If the candidate edits the Master Resume (e.g., changes summary, updates skills, approves an AI suggestion) and then switches to a Tailored variant, `computeResumeDiff` evaluates against the **freshly updated Master AST**, never a stale initial snapshot.
- If Master has never been loaded during the current session, `masterResumeDoc` remains `null`, and the diff badge is simply omitted (0 extra network fetches).

---

## 4. State Machine & Save Lifecycle Specifications

### 4.1 Save Status States & `activeSavePromiseRef` Lifecycle
`saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'`
- `saved`: All changes persisted to server.
- `saving`: Active HTTP PUT/PATCH request in flight.
- `unsaved`: Local edits exist that are debounced or unpersisted.
- `error`: Previous save request failed.
- `isDirty`: Derived as `saveStatus === 'unsaved' || saveTimerRef.current !== null`.

#### Explicit `activeSavePromiseRef` Lifecycle:
```ts
const activeSavePromiseRef = useRef<Promise<any> | null>(null);

// When any save initiates (builder config save, section improvement, etc.):
const executeSave = async (resumeId: string, config: ResumeBuilderConfig) => {
  setSaveStatus('saving');
  const savePromise = resumeService.saveBuilderConfig(resumeId, config);
  activeSavePromiseRef.current = savePromise;

  try {
    const result = await savePromise;
    setSaveStatus('saved');
    return result;
  } catch (err) {
    setSaveStatus('error');
    toast.error("Failed to save changes.");
    throw err;
  } finally {
    // Explicitly reset ref only if this promise is still the active one
    if (activeSavePromiseRef.current === savePromise) {
      activeSavePromiseRef.current = null;
    }
  }
};
```
- **Switch Guard Invariant:** When checking `saveStatus === 'saving'`, the switch logic does **not** assume `activeSavePromiseRef.current` is non-null. If non-null, it awaits `activeSavePromiseRef.current`. If null (e.g. in a momentary transition), it awaits `flushPendingAutosave()` or safely guards without crashing.

### 4.2 Detailed Switch Flowchart

```text
User / Browser requests targetResumeId
                   │
                   ▼
       targetResumeId === activeResumeId?
       ├── YES ──► No-op, return
       └── NO
           │
           ▼
       saveStatus === 'error'?
       ├── YES ──► Toast error: "Please resolve save error before switching."
       │           Block switch. Return.
       └── NO
           │
           ▼
       saveTimerRef.current !== null? (Pending debounced autosave)
       ├── YES ──► Cancel debounce timer
       │           Trigger immediate flush save
       │           Await save promise
       │           ├── Fails ──► Block switch. Return.
       │           └── Succeeds ──► Continue
       └── NO
           │
           ▼
       saveStatus === 'saving' && activeSavePromiseRef.current !== null?
       ├── YES ──► Await activeSavePromiseRef.current
       │           ├── Fails ──► Block switch. Return.
       │           └── Succeeds ──► Continue
       └── NO
           │
           ▼
       saveStatus === 'unsaved'? (Dirty local changes)
       ├── YES ──► Set pendingSwitchResumeId = targetResumeId
       │           Open ResumeSwitchConfirmDialog
       │           ├── [Stay Here] ──► Discard pending target. Keep local edits.
       │           │                   If BROWSER_HISTORY_NAVIGATION: router.replace back to activeResumeId.
       │           └── [Switch Resume] ──► Discard local edits. Proceed to execute.
       └── NO
           │
           ▼
       EXECUTE SWITCH TRANSACTION
       1. Increment switchRequestIdRef (currentRequestId = ++switchRequestIdRef.current)
       2. Set loading = true
       3. Fetch target resume record from server (resumeService.getResumeById(targetResumeId))
       4. Concurrency Guard: if (currentRequestId !== switchRequestIdRef.current) return;
       5. Validate target:
          - If not found: Toast error and return without corrupting active state.
       6. Commit target:
          - setSelectedResumeId(targetResume._id)
          - setResumeDoc(targetResume.resumeDocument)
          - setBuilderConfig(targetResume.builderConfig)
          - setSaveStatus('saved')
          - clear current suggestions / active view
       7. Update URL:
          - If navigationSource === 'USER_VARIANT_SWITCH':
            Record programmatic navigation token:
              programmaticNavigationTokenRef.current = { id: targetResume._id, requestId: currentRequestId }
            router.push('/dashboard/resume-studio?resumeId=' + targetResume._id, { scroll: false })
          - If navigationSource === 'BROWSER_HISTORY_NAVIGATION':
            Do NOT push to history (prevent loops)
       8. Trigger Background Intelligence:
          - fetchScore(targetResume._id) guarded by request ID & active ID check
          - fetchAtsIntelligence(targetResume._id, targetRole) guarded by request ID & active ID check
```

---

## 5. Concurrency & Race Condition Protection

### 5.1 The Stale Transaction Hazard
When a user rapidly switches variants (e.g. Master $\rightarrow$ Variant A $\rightarrow$ Variant B):
1. Request A starts (`requestId = 1`).
2. Request B starts (`requestId = 2`).
3. Request B resolves and commits to Studio state.
4. Request A resolves later (e.g. slow network) and overwrites Variant B with Variant A.

### 5.2 Full Transaction Guard Specification
A single monotonic sequence counter guards **all asynchronous side effects**:
```ts
const switchRequestIdRef = useRef(0);
```
Every mutation point verifies:
```ts
if (currentRequestId !== switchRequestIdRef.current) {
  // Stale transaction: discard completely!
  return;
}
```
**Protected Boundaries:**
- Resume AST commit (`setResumeDoc`)
- Builder config commit (`setBuilderConfig`)
- Save status reset (`setSaveStatus('saved')`)
- Error state & loading state (`setLoading(false)`)
- Next.js URL update (`router.push`)
- Background score results (`fetchScore` verifies target ID === `activeResumeId`)
- ATS diagnostics (`fetchAtsIntelligence` verifies target ID === `activeResumeId`)

---

## 6. Next.js App Router Navigation & History Architecture

### 6.1 Routing Engine
- **Framework:** Next.js App Router (`'next/navigation'`).
- **Hooks:** `useRouter()`, `usePathname()`, `useSearchParams()`.
- **Canonical Route:** `/dashboard/resume-studio?resumeId=<resumeId>`.
- **Policy:** Never spread raw `window.history.pushState` or `window.popstate` through business logic.

### 6.2 Disambiguation: User Switch vs Browser Navigation
```ts
type NavigationSource = 'USER_VARIANT_SWITCH' | 'BROWSER_HISTORY_NAVIGATION';
```

#### Fixing the `lastProgrammaticResumeIdRef` Race Edge Case
Relying on a single ID ref (`lastProgrammaticResumeIdRef.current = id`) breaks during rapid successive switching:
`Master → Variant A → Variant B` while router/search-param updates are still asynchronously resolving in Next.js.

**Solution:** Use a structured **Navigation Transaction Token**:
```ts
interface ProgrammaticNavigationToken {
  id: string;
  requestId: number;
}

const programmaticNavigationTokenRef = useRef<ProgrammaticNavigationToken | null>(null);
```
- **When `USER_VARIANT_SWITCH` commits:**
  ```ts
  programmaticNavigationTokenRef.current = {
    id: targetResume._id,
    requestId: currentRequestId,
  };
  router.push(`/dashboard/resume-studio?resumeId=${targetResume._id}`, { scroll: false });
  ```
- **When `useSearchParams().get('resumeId')` updates:**
  ```ts
  const paramResumeId = searchParams.get('resumeId');
  const token = programmaticNavigationTokenRef.current;

  // If this URL change matches our active or latest acknowledged programmatic switch:
  if (token && token.id === paramResumeId) {
    // Only acknowledge and clear if this token belongs to the latest switch
    if (token.requestId === switchRequestIdRef.current) {
      programmaticNavigationTokenRef.current = null;
    }
    // Do NOT trigger a browser history switch!
    return;
  }

  // Legitimate browser Back/Forward navigation:
  if (paramResumeId && paramResumeId !== activeResumeId) {
    // Check dirty state:
    if (isDirty) {
      // Prompt dirty confirmation modal.
      // If candidate chooses [Stay Here], rollback URL to activeResumeId without new history entries:
      // router.replace(`/dashboard/resume-studio?resumeId=${activeResumeId}`, { scroll: false });
    } else {
      // Execute switch with BROWSER_HISTORY_NAVIGATION (no router.push)
      switchResumeVariant(paramResumeId, 'BROWSER_HISTORY_NAVIGATION');
    }
  }
  ```

### 6.3 Deep Linking Behavior & Precise Invalid Deep-Link Rule
| Scenario | Incoming URL | Expected Behavior |
| :--- | :--- | :--- |
| **Direct Master** | `?resumeId=<masterId>` | Loads Master resume AST, renders `⭐ MASTER RESUME`. |
| **Direct Tailored** | `?resumeId=<tailoredId>` | Loads Tailored variant directly, renders `🎯 TAILORED RESUME`, does NOT default to Master. |
| **No Query Param** | `/dashboard/resume-studio` | Loads default resume (or Master if exists), syncs URL to `?resumeId=<id>`. |
| **Invalid / Deleted / Unauthorized ID** | `?resumeId=deleted123` | **Precise Rule:**<br>1. Requested resume load fails.<br>2. Fallback resume (default or Master) loads and commits successfully.<br>3. **Only after** the fallback resume commits, call `router.replace('/dashboard/resume-studio?resumeId=' + fallback._id, { scroll: false })`.<br>4. Toast error: `"Requested resume variant not found. Loaded default resume."` |

---

## 7. Master Resume & Career Profile Immutability

### 7.1 Architecture Invariant
When editing a Tailored Resume variant (`currentResume.variantType === 'TAILORED'`):
1. **Save Target Isolation:**
   - `resumeService.saveBuilderConfig(tailoredId, config)` targets `tailoredId`.
   - `resumeService.applySectionImprovement(tailoredId, ...)` targets `tailoredId`.
   - All autosaves target `activeResumeId`.
2. **Master Immutability:**
   - Master Resume record in MongoDB is **NEVER** modified during Tailored editing.
   - Master Resume Document AST is untouched.
3. **Profile Immutability:**
   - Career Profile collection (`ProfileModel`) is **NEVER** updated from Tailored editing.
   - Profile sync APIs (`/api/resumes/master/sync`) are restricted strictly to Master mode.
4. **Delete Protection:**
   - Master Resume delete button is hidden/disabled in UI.
   - Server strictly prohibits deletion of `variantType === 'MASTER'`.

---

## 8. Component Design & Header Hierarchy

### 8.1 Header Layout Hierarchy (`ResumeStudioHeader.tsx`)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Dashboard / ATS] │ [⭐ Master Resume ▾] [Target Job Pill] [12 changes] │ [Content|Design|ATS]  Saved ✓ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
- **Left:** Navigation link (`← Dashboard`), Divider, `ResumeVariantSwitcher` (containing variant badge and dropdown trigger), `ResumeTargetJobContext`, and optional 6E.1 diff summary badge.
- **Center:** Workspace View Mode switcher (`Content`, `Design`, `ATS & Score`) + Live Save indicator (`Saved ✓`, `Saving...`, `Unsaved`, `Save failed`).
- **Right:** Stale Master Sync Notification button (only visible when `isMaster && isMasterStale`).

### 8.2 Component Specifications

#### 1. `ResumeVariantBadge.tsx`
- **Master Style:** Amber badge (`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`), Sparkles icon (`⭐`), text: `MASTER`.
- **Tailored Style:** Indigo badge (`bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20`), Target icon (`🎯`), text: `TAILORED`.

#### 2. `ResumeTargetJobContext.tsx`
- Renders only when `isTailored === true`.
- Compact badge displaying `targetJobTitle · targetCompany` or fallback `"Job-specific variant"`.
- Briefcase icon (`Briefcase` or `Building2`).

#### 3. `ResumeVariantSwitcher.tsx`
- Trigger button in header showing active variant title + variant badge + chevron.
- Dropdown menu:
  - Header item / Section 1: **Master Resume** (marked with amber star).
  - Section 2: **Tailored Variants** (listing display name, target job, company, and updated time).
  - Active variant highlighted with checkmark (`Check` icon) and `aria-current="true"`.
  - Accessible keyboard navigation: Enter/Space to open, ArrowUp/ArrowDown to traverse, Escape to close.
  - Reuses existing `@radix-ui` primitives or accessible menu container.

#### 4. `ResumeSwitchConfirmDialog.tsx`
- Uses `@radix-ui/react-dialog` (matching `ScoreDialog.tsx` pattern).
- Dialog Title: `"Unsaved Changes in Current Resume"`.
- Description: `"You have unsaved changes that will be lost if you switch variants without saving. Would you like to stay here and save, or discard changes and switch?"`.
- Actions:
  - `[Stay Here]` (secondary button): Closes modal, keeps candidate on current resume.
  - `[Switch Resume]` (destructive/primary button): Discards local unsaved edits, switches to `pendingSwitchResumeId`.

---

## 9. File Modification Plan

```text
client/
├── components/
│   └── resume-studio/
│       ├── ResumeVariantBadge.tsx           [NEW] Master vs Tailored visual indicator
│       ├── ResumeTargetJobContext.tsx       [NEW] Compact target job & company badge
│       ├── ResumeVariantSwitcher.tsx        [NEW] Accessible dropdown for variant switching
│       ├── ResumeSwitchConfirmDialog.tsx    [NEW] Radix modal for unsaved changes confirmation
│       ├── ResumeStudioHeader.tsx           [EDIT] Integrate switcher, badge, and target job context
│       └── index.ts                         [EDIT] Export new components
├── hooks/
│   └── useResumeStudio.ts                   [EDIT] Add switchResumeVariant, concurrency guard, activeSavePromiseRef,
│                                                   masterResumeDoc caching, diffSummary calculation
├── app/
│   └── dashboard/
│       └── resume-studio/
│           └── page.tsx                     [EDIT] Mount confirmation modal, wire Next.js router
│                                                   synchronization with navigation token tracking
└── tests/
    ├── resume-variant-switcher.spec.ts      [NEW] UI component & accessibility tests
    └── resume-variant-switch-lifecycle.spec.ts [NEW] Lifecycle, concurrency, dirty guard, isolation tests
```

---

## 10. Step-by-Step Implementation Sequence

### Step 1: Create UI Components
1. **`ResumeVariantBadge.tsx`**: Renders `⭐ MASTER` or `🎯 TAILORED` with curated design tokens.
2. **`ResumeTargetJobContext.tsx`**: Renders formatted title and company with zero fabrication.
3. **`ResumeSwitchConfirmDialog.tsx`**: Implements `@radix-ui/react-dialog` modal for dirty switch confirmation.
4. **`ResumeVariantSwitcher.tsx`**: Dropdown listing Master and Tailored variants with active indicator and keyboard controls.
5. Export components in `client/components/resume-studio/index.ts`.

### Step 2: Refactor & Enhance `useResumeStudio.ts`
1. Reconcile `selectedResumeId` and `activeResumeId` (internal state `selectedResumeId`, canonical exported identity `activeResumeId`).
2. Maintain `masterResumeDoc: ResumeDocument | null` in hook state (populated on initial Master load, switch to Master, or when Master document mutates).
3. Synchronize `masterResumeDoc` dynamically whenever Master is edited or saved in the session (e.g. `handleApproveSuggestion`, `handleSyncMasterResume`, document save while `isMaster === true`), ensuring subsequent Tailored views compute diff counts against the latest Master.
4. Derive `isMaster` and `isTailored` strictly from `currentResume?.variantType`.
5. Derive performance-safe `diffSummary` via `computeResumeDiff` if `masterResumeDoc` is present.
6. Implement explicit `activeSavePromiseRef` lifecycle (start $\rightarrow$ store promise, finish $\rightarrow$ clear ref).
7. Implement `flushPendingAutosave()` to immediately execute and await any pending debounced save.
8. Implement `switchResumeVariant(targetResumeId, navigationSource)` with:
   - Save error check
   - In-flight save await via `activeSavePromiseRef`
   - Pending autosave flush & await
   - Dirty check (`isDirty`) $\rightarrow$ open confirmation dialog
   - Full transaction sequence guard (`switchRequestIdRef`)
   - Target load via `resumeService.getResumeById`
   - Concurrency validation
   - Atomic state commit
   - Router URL synchronization (only if `navigationSource === 'USER_VARIANT_SWITCH'`)
   - Background intelligence dispatch (`fetchScore`, `fetchAtsIntelligence`) guarded by request ID.
9. Expose `pendingSwitchResumeId`, `isSwitchConfirmOpen`, `confirmSwitchVariant()`, `cancelSwitchVariant()`.

### Step 3: Integrate Header & Page
1. Update `ResumeStudioHeader.tsx` to mount `ResumeVariantSwitcher`, `ResumeTargetJobContext`, and optional 6E.1 badge.
2. Update `client/app/dashboard/resume-studio/page.tsx`:
   - Mount `ResumeSwitchConfirmDialog`.
   - Wire `next/navigation` (`useRouter`, `useSearchParams`).
   - Implement `programmaticNavigationTokenRef` (`{ id, requestId }`) to eliminate search-param loops.
   - Handle Back/Forward history navigation via `BROWSER_HISTORY_NAVIGATION`.
   - Implement the precise invalid deep-link fallback: on failure, commit fallback resume and then `router.replace()`.

### Step 4: Write Focused Unit & Lifecycle Tests
1. `client/tests/resume-variant-switcher.spec.ts`:
   - Master visual identity rendering.
   - Tailored visual identity rendering.
   - Target job display rules (both, title only, neither).
   - Variant dropdown items & active checkmark.
   - 6E.1 badge presence only when Master AST exists.
2. `client/tests/resume-variant-switch-lifecycle.spec.ts`:
   - Clean switch lifecycle.
   - Dirty switch with `[Stay Here]` (preserves edits).
   - Dirty switch with `[Switch Resume]` (discards edits).
   - In-flight autosave flush & await before switch.
   - `activeSavePromiseRef` lifecycle and error blocking.
   - Concurrency sequence guard (A $\rightarrow$ B $\rightarrow$ C discards stale A and B).
   - Navigation token tracking (preventing loops during rapid clicks).
   - App Router URL synchronization strictly after commit.
   - Deep-link direct Tailored load.
   - Invalid deep-link fallback with `router.replace()`.
   - Master document cache refresh in session (editing Master updates `masterResumeDoc` so later Tailored diff is accurate).
   - Master & Profile immutability (asserting Master/Profile endpoints are never called on Tailored save).

### Step 5: Verification & Regression Testing
1. Run focused test suites: `cd client && npx vitest run tests/resume-variant-switcher.spec.ts tests/resume-variant-switch-lifecycle.spec.ts`.
2. Run full client test regression: `cd client && npx vitest run`.
3. Run client TypeScript check: `cd client && npx tsc --noEmit` (0 errors).
4. Run server TypeScript check: `cd server && npx tsc --noEmit` (0 errors).
5. Report exact results.

---

## 11. Comprehensive Test Matrix

```text
┌──────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Test Suite                           │ Coverage Scenarios                                     │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ resume-variant-switcher.spec.ts      │ 1. Master identity badge & canonical subtitle          │
│                                      │ 2. Tailored identity badge & target job context        │
│                                      │ 3. Target job fallback ("Job-specific variant")        │
│                                      │ 4. Dropdown opens and lists Master & Tailored items    │
│                                      │ 5. Active item has aria-current and checkmark          │
│                                      │ 6. 6E.1 diff badge rendered when masterDoc is present  │
│                                      │ 7. 6E.1 diff badge omitted when masterDoc is absent    │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ resume-variant-switch-lifecycle.spec │ 8. Clean switch commits target and updates URL         │
│                                      │ 9. Dirty switch opens confirmation modal               │
│                                      │ 10. [Stay Here] cancels switch & keeps local edits     │
│                                      │ 11. [Switch Resume] discards edits & switches          │
│                                      │ 12. Pending autosave is flushed and awaited cleanly    │
│                                      │ 13. In-flight saving promise (activeSavePromiseRef)    │
│                                      │ 14. Save error blocks switch with error toast          │
│                                      │ 15. Concurrency: delayed A cannot overwrite B          │
│                                      │ 16. Concurrency: stale intelligence cannot overwrite C │
│                                      │ 17. Navigation token avoids loop during rapid clicks   │
│                                      │ 18. Deep linking loads Tailored directly               │
│                                      │ 19. Invalid deep link: load fallback then replace URL  │
│                                      │ 20. Back navigation handles dirty without push loop    │
│                                      │ 21. Master in-session edit refreshes masterResumeDoc   │
│                                      │ 22. Tailored save targets Tailored ID strictly         │
│                                      │ 23. Master and Profile updates are NEVER called        │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 12. Definition of Done (DoD) Checklist

- [ ] Master and Tailored identities are visually distinct in Studio header.
- [ ] Target Job Title and Company are displayed from canonical metadata (0 fabrication).
- [ ] Header variant switcher renders using lightweight portfolio metadata.
- [ ] Canonical `activeResumeId` is conceptual identity, backed internally by `selectedResumeId` (0 competing states).
- [ ] `isMaster` and `isTailored` are derived strictly from `currentResume?.variantType`.
- [ ] Active variant is clearly designated with checkmark and accessible ARIA attributes.
- [ ] Dirty state prompts confirmation before switching (`[Stay Here]` vs `[Switch Resume]`).
- [ ] In-flight autosaves are flushed and awaited cleanly.
- [ ] Ongoing saves (`saving`) await `activeSavePromiseRef` with clean lifecycle cleanup; save errors strictly block switching.
- [ ] Concurrency sequence guard (`switchRequestIdRef`) protects the entire transaction and background intelligence.
- [ ] Next.js App Router (`/dashboard/resume-studio?resumeId=...`) synchronizes URL strictly after successful load.
- [ ] Browser Back/Forward navigation (`BROWSER_HISTORY_NAVIGATION`) is separated from user clicks using navigation transaction token (`programmaticNavigationTokenRef`).
- [ ] Deep links directly to Tailored resumes work without defaulting to Master.
- [ ] Invalid deep links load fallback resume first and then reconcile URL with `router.replace()`.
- [ ] Master Resume and Career Profile are 100% untouched during Tailored editing.
- [ ] Master delete protection remains intact.
- [ ] 6E.1 diff badge is performance-safe (computed only when Master AST is already loaded).
- [ ] `masterResumeDoc` cache is dynamically refreshed whenever Master Resume is edited or synced in the session, preventing stale diff counts.
- [ ] All focused unit tests pass.
- [ ] Full client test regression passes with 0 failures.
- [ ] Client and server TypeScript typechecks pass with 0 errors.
