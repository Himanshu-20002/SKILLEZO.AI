# SKILLEZO AI — Phase 6E.1 Implementation Plan (Revised)
## Deterministic Master-vs-Tailored Resume Diff Engine

---

## 1. Executive Summary & Objective

Phase 6E.1 is the **foundational calculation sub-phase** of Phase 6E. It builds the **pure, 100% deterministic, side-effect-free comparison engine** that evaluates the structural and semantic differences between a Master `ResumeDocument` and a Tailored `ResumeDocument` (materialized in Phase 6D from approved Phase 6C Tailoring Plans).

### The Three Fundamental Questions
The diff engine strictly maintains separation between three distinct concerns:

```text
1. Diff:          "What is different?"          → Derived purely from Master AST vs Tailored AST
2. Traceability:  "Why did it change?"           → Derived by mapping diffs to approved 6C proposals
3. Provenance:    "Who / what changed it?"       → Derived only from verified provenance metadata
```

```text
┌───────────────────────────┐      ┌───────────────────────────┐
│   MASTER ResumeDocument   │  +   │  TAILORED ResumeDocument  │
└─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │
              └─────────────────┬────────────────┘
                                │
                                ↓
               ┌───────────────────────────────────┐
               │    6E.1 Pure Deterministic Diff   │
               │    + Minimal Traceability Context │
               │   (0 LLM, 0 Network, 0 Mutation)  │
               └────────────────┬──────────────────┘
                                │
                                ↓
               ┌───────────────────────────────────┐
               │    Typed ResumeComparisonResult   │
               │  (No 'any', Collision-Safe IDs,  │
               │   Ambiguity-Safe Attribution)     │
               └───────────────────────────────────┘
```

Phase 6E.1 builds **only the calculation foundation**. It strictly does NOT build the Studio UI, Tailoring Insights UI, Evidence Drawer, variant switcher, autosave, or editing workflows.

---

## 2. Responsibility Boundaries & Non-Negotiable Invariants

| Invariant | Specification & Rule |
|---|---|
| **Zero LLM / Zero AI** | `0` LLM calls, `0` prompt templates, `0` AI heuristics, `0` probabilistic inference, `0` semantic guessing. The diff engine is 100% deterministic code. |
| **Deterministic Normalization Rules** | The engine legitimately executes deterministic normalization rules: whitespace collapse, case-folding for semantic IDs, field-aware `null`/`undefined` equivalence, and schema-aware empty array handling. These are NOT probabilistic heuristics. |
| **No Persistence** | No database collections, no Mongoose models (`ComparisonDocument`, `ResumeDiffDocument` are strictly prohibited). Result is derived in memory. |
| **Both Inputs are Read-Only** | Neither `masterDocument` nor `tailoredDocument` may be mutated. Deep freeze and snapshot testing enforce 100% immutability. |
| **No New Scoring Engine** | Does not calculate ATS scores, match percentages, or quality scores. It strictly reports what changed and maps available rationale. |
| **Traceability Isolation** | Traceability answers *"Why did this difference happen?"*, while comparison answers *"What is different?"*. If a proposal cannot be matched, the diff is still reported as `UNATTRIBUTED` or `CHANGED` (never dropped). |
| **No Inferred Attribution** | `Master !== Tailored` does NOT mean `USER_EDIT`. Nor does it mean `GENERATION` or `TAILORING_PLAN`. Structural additions/removals are reported as structural facts (`ADDED`, `REMOVED`), with attribution assigned ONLY when verified provenance or an approved 6C proposal confirms it. |
| **No UI / React / Browser Dependency** | Pure Node/Vitest executable utility. Zero React hooks, zero Next.js runtime, zero DOM references, zero browser storage, zero API calls. |

---

## 3. Actual Canonical AST Structure (Inspected from Codebase)

The engine adheres strictly to the canonical `ResumeDocument` contract in `client/types/resume-document.ts`:

1. **`summary`:**
   - Object: `{ text: string; targetRole?: string; yearsOfExperience?: number; }`
   - Comparison targets `summary.text`.
2. **`skills`:**
   - Array of `ResumeSkillItem`: `{ id: string; name: string; category: SkillCategory; proficiency?: string; evidenceIds: string[]; }`
   - Primary Identity: `id` (stable ID).
   - Fallback Identity: normalized lowercase name (`name.trim().toLowerCase()`).
3. **`experience`:**
   - Array of `ResumeExperienceItem`: `{ id: string; companyName: string; jobTitle: string; location?: string; startDate?: string; endDate?: string; isCurrent: boolean; bullets: ResumeExperienceBullet[]; technologiesUsed?: string[]; }`
   - Bullets: `{ id: string; text: string; verbs?: string[]; metrics?: string[]; evidenceIds: string[]; }`
   - Experience Identity: `id` (fallback: `companyName.trim().toLowerCase() + '::' + jobTitle.trim().toLowerCase()`).
   - Bullet Identity: `id` (fallback: stable index within unambiguous parent entity).
4. **`projects`:**
   - Array of `ResumeProjectItem`: `{ id: string; title: string; subtitle?: string; description?: string; technologies: string[]; link?: string; repoUrl?: string; bullets: string[]; }`
   - Identity: `id` (fallback: `title.trim().toLowerCase()`).
5. **`education`:**
   - Array of `ResumeEducationItem`: `{ id: string; institution: string; degree?: string; fieldOfStudy?: string; startDate?: string; endDate?: string; gradeOrGpa?: string; honors?: string[]; }`
   - Identity: `id` (fallback: `institution.trim().toLowerCase() + '::' + (degree || '').trim().toLowerCase()`).
6. **`layout` (Section Order):**
   - Derived canonically from `ResumeBuilderConfig.sectionOrder` (`ReorderableSectionId[]`) or `templateConfig`, supplied by the caller from the actual resume configurations.

---

## 4. File Structure & Target Locations

```text
client/
├── types/
│   └── resume-comparison.types.ts       # Strongly typed contracts (0 any, typed diff values)
├── lib/
│   └── resume-studio/
│       ├── resume-diff.ts               # Pure deterministic diff engine entry point & section comparators
│       └── __tests__/
│           └── resume-diff.test.ts      # Exhaustive behavioral unit test suite
```

---

## 5. Type Contract Specifications (`resume-comparison.types.ts`)

### 5.1 Strict Elimination of `any`
To ensure complete type safety, `masterValue` and `tailoredValue` are strictly typed using safe primitives, collections, and section-specific interfaces:

```ts
import { ResumeDocument, ResumeSkillItem, ResumeExperienceItem, ResumeProjectItem, ResumeEducationItem } from '@/types/resume-document';
import { ITailoringEvidenceRef } from '@/types/tailoring-plan.types';

export type ResumeChangeType =
  | 'PROMOTED'        // Item elevated in rank or moved to index 0 via approved 6C proposal
  | 'DE_EMPHASIZED'    // Item lowered in rank via approved 6C proposal
  | 'REWRITTEN'       // Text/bullet rewritten via approved 6C proposal
  | 'REORDERED'       // Section or items reordered without explicit promote proposal
  | 'SELECTED'        // Specific item chosen for target relevance
  | 'EXCLUDED'        // Specific item excluded for brevity/fit via approved proposal
  | 'EDITED'          // User-edited variant of a 6C proposal (6C proposal decision = EDITED)
  | 'USER_EDIT'       // Manual edit confirmed post-generation by verified provenance
  | 'ADDED'           // Structural fact: Item present in Tailored but absent in Master
  | 'REMOVED'         // Structural fact: Item present in Master but absent in Tailored
  | 'CHANGED';        // General text or field modification without proposal/provenance

export type ResumeDiffSection =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'layout';

export type DiffChangeSource =
  | 'TAILORING_PLAN'  // Traceable to an approved 6C proposal
  | 'USER_EDIT'       // Confirmed candidate manual edit post-generation
  | 'GENERATION'      // Confirmed materialization difference from verified 6D provenance
  | 'UNATTRIBUTED';   // Difference exists, proposal link unconfirmed / no provenance

/**
 * Safe, discriminated diff value representation without 'any'
 */
export type ResumeDiffScalar = string | number | boolean | null | undefined;

export type ResumeDiffValue =
  | ResumeDiffScalar
  | readonly string[]
  | readonly ResumeDiffScalar[]
  | Readonly<{
      text?: string;
      title?: string;
      companyName?: string;
      jobTitle?: string;
      institution?: string;
      degree?: string;
      name?: string;
      category?: string;
      technologies?: readonly string[];
      bullets?: readonly string[];
      sectionOrder?: readonly string[];
    }>;

export interface ResumeDiffItem {
  id: string;                         // Collision-safe deterministic composite ID
  section: ResumeDiffSection;
  changeType: ResumeChangeType;
  title: string;                      // Human-readable title (e.g. "Work Experience · Acme Corp · Bullet 1")
  field?: string;                     // AST field (e.g. "summary.text", "bullets[0].text")
  entityId?: string;                  // Target entity ID (e.g. experienceId, projectId)
  subEntityId?: string;               // Target sub-entity ID (e.g. bulletId)

  // Strongly typed Master and Tailored values (NO 'any')
  masterValue?: ResumeDiffValue;
  tailoredValue?: ResumeDiffValue;

  // Proposal Traceability (Phase 6C / 6B)
  proposalId?: string;
  proposalTitle?: string;
  action?: string;                    // Proposal action (e.g. "REWRITE", "PROMOTE", "EXCLUDE")
  reason?: string;                    // Approved rationale from 6C
  requirementIds?: readonly string[]; // Linked Phase 6B requirement IDs
  evidence?: readonly ITailoringEvidenceRef[]; // Linked evidence excerpts

  source: DiffChangeSource;
}

/**
 * Decoupled, read-only proposal trace structure
 * (Avoids coupling pure diff engine to the entire TailoringPlanDTO)
 */
export interface TailoringProposalTrace {
  id: string;
  action: string;
  target: {
    section: string;
    field: string;
    entityId?: string;
    subEntityId?: string;
    bulletIndex?: number;
  };
  title: string;
  currentValue?: string | null;
  proposedValue?: string | null;
  reason?: string;
  requirementIds?: string[];
  evidence?: ITailoringEvidenceRef[];
  userDecision?: string;
  userEditedValue?: string | null;
  isProtected?: boolean;
}

export interface ResumeComparisonContext {
  proposals?: readonly TailoringProposalTrace[];
  masterSectionOrder?: readonly string[];
  tailoredSectionOrder?: readonly string[];
  provenanceMap?: Readonly<Record<string, DiffChangeSource>>;
}

export interface ResumeComparisonResult {
  hasChanges: boolean;
  totalChanges: number;
  sectionCounts: Record<ResumeDiffSection, number>;
  sections: {
    summary: ResumeDiffItem[];
    skills: ResumeDiffItem[];
    experience: ResumeDiffItem[];
    projects: ResumeDiffItem[];
    education: ResumeDiffItem[];
    layout: ResumeDiffItem[];
  };
  changes: ResumeDiffItem[];
}
```

---

## 6. Implementation Detail: Deterministic Section Comparators

### 6.1 Collision-Safe Deterministic Diff IDs
Diff IDs must never collide, even when multiple items in the same entity change. Primary IDs are constructed deterministically without relying on fragile array indexes:
- **Summary:** `diff:summary:text`
- **Skills:** `diff:skills:<skillId || normalizedName>:<changeType.toLowerCase()>`
- **Experience Item:** `diff:experience:<expId>:item:<changeType.toLowerCase()>`
- **Experience Bullet:** `diff:experience:<expId>:bullet:<bulletId>:text`
- **Projects Item:** `diff:projects:<projId>:item:<changeType.toLowerCase()>`
- **Projects Bullet:** `diff:projects:<projId>:bullet:<bulletId || index>:text`
- **Education Item:** `diff:education:<eduId>:item:<changeType.toLowerCase()>`
- **Layout Order:** `diff:layout:sectionOrder`

### 6.2 Strict Attribution & Traceability Priority
When matching diffs to proposals, the engine follows this strict priority to eliminate false matches:
1. **Proposal target entity & sub-entity ID match:** `target.entityId === entity.id && target.subEntityId === bullet.id`.
2. **Proposal target entity ID & section match:** `target.entityId === entity.id && target.section === section`.
3. **Target field exact match (for singletons like Summary):** `target.section === 'SUMMARY' && target.field === 'summary.text'`.
4. **CurrentValue fallback ONLY when strictly unambiguous:** If and only if exactly one proposal matches `currentValue` across the entire section.
5. **Ambiguity Rule:** If multiple proposals match the same `currentValue` or if identity is ambiguous, **DO NOT GUESS**. Return the diff with `source: 'UNATTRIBUTED'` and `proposalId: undefined`. Never attach the wrong proposal or evidence.

### 6.3 Semantic Attribution Rules
- **6C proposal decision was `EDITED`:**
  $\rightarrow$ `changeType: 'EDITED'`, `source: 'TAILORING_PLAN'`.
- **6C proposal decision was `ACCEPTED`:**
  $\rightarrow$ `changeType: 'REWRITTEN'` (or `'PROMOTED'`, `'EXCLUDED'`), `source: 'TAILORING_PLAN'`.
- **Verified post-generation candidate edit (via `provenanceMap`):**
  $\rightarrow$ `changeType: 'USER_EDIT'`, `source: 'USER_EDIT'`.
- **Structural difference without proposal or provenance:**
  $\rightarrow$ `changeType: 'CHANGED'` (or `'ADDED'`, `'REMOVED'`, `'REORDERED'`), `source: 'UNATTRIBUTED'`.
  *(Never assign `GENERATION` without explicit 6D provenance, and never assign `USER_EDIT` from diff alone).*

### 6.4 Field-Aware Normalization Rules (No Global Null=Undefined)
Normalization is strictly field-aware and schema-guided:
- **Text Fields (`summary.text`, `bullet.text`, `jobTitle`, `institution`):**
  - Insignificant whitespace is collapsed: `.replace(/\s+/g, ' ').trim()`.
  - Empty string `""` is NOT equivalent to `null` or `undefined`.
- **Optional String Fields (`location`, `subtitle`, `gradeOrGpa`):**
  - If both values are absent (`null` or `undefined`), they are considered equal.
  - If one is `"San Francisco"` and one is `null`, it is a valid diff.
- **Array Collections:**
  - `honors: []` vs `honors: undefined`: treated as equal (both represent zero honors per schema).
  - `skills: []` vs `skills: undefined`: NOT equal (an empty skill set is an explicit structural change).
  - Array elements are matched by stable IDs or normalized semantic keys, never raw array index.

### 6.5 Summary Comparator
- Compares normalized `masterDoc.summary?.text` vs `tailoredDoc.summary?.text`.
- If identical $\rightarrow$ `0` diffs.
- If different:
  - Searches `context.proposals` for `target.section === 'SUMMARY' && target.field === 'summary.text'`.
  - If proposal found $\rightarrow$ assign `changeType: proposal.userDecision === 'EDITED' ? 'EDITED' : 'REWRITTEN'`, `source: 'TAILORING_PLAN'`, attach proposal ID, reason, requirements, evidence.
  - If no proposal found $\rightarrow$ assign `changeType: 'CHANGED'`, `source: 'UNATTRIBUTED'`.

### 6.6 Skills Comparator
- Compares Master skills vs Tailored skills.
- **Added:** Skill in Tailored that does not exist in Master $\rightarrow$ `changeType: 'ADDED'`.
  *(Note: Reports structural fact only; `source` is `'UNATTRIBUTED'` unless an approved proposal matches).*
- **Removed:** Skill in Master absent from Tailored $\rightarrow$ `changeType: 'REMOVED'`, `source: 'UNATTRIBUTED'`.
- **Reordered / Promoted:**
  - If skill order shifted:
    - If proposal matches with `action === 'PROMOTE'` $\rightarrow$ `changeType: 'PROMOTED'`, `source: 'TAILORING_PLAN'`.
    - If proposal matches with `action === 'DE_EMPHASIZE'` $\rightarrow$ `changeType: 'DE_EMPHASIZED'`, `source: 'TAILORING_PLAN'`.
    - If no proposal exists $\rightarrow$ `changeType: 'REORDERED'`, `source: 'UNATTRIBUTED'`.
- **Duplicate Skill Safety:** If duplicate skills exist with identical names, matches strictly by stable `id`. If unresolvable, flags `UNATTRIBUTED` rather than cross-contaminating proposal references.

### 6.7 Experience & Bullet Comparator
- Matches experience items by `id` (fallback: normalized `companyName + '::' + jobTitle`).
- **Item Exclusions:** If item is in Master but omitted from Tailored, checks proposal for `target.field === 'experience.selection' && action === 'EXCLUDE'`. If confirmed $\rightarrow$ `changeType: 'EXCLUDED'`, `source: 'TAILORING_PLAN'`. Otherwise $\rightarrow$ `changeType: 'REMOVED'`, `source: 'UNATTRIBUTED'`.
- **Bullet Changes:**
  - Matches bullets within the parent item strictly by `bullet.id`.
  - If bullet text differs:
    - Matches proposals by `target.subEntityId === bullet.id`.
    - Fallback to `proposal.currentValue === masterBullet.text` ONLY if exactly one bullet and one proposal share that text.
    - If matched $\rightarrow$ `changeType: proposal.userDecision === 'EDITED' ? 'EDITED' : 'REWRITTEN'`, `source: 'TAILORING_PLAN'`.
    - If unmapped $\rightarrow$ `changeType: 'CHANGED'`, `source: 'UNATTRIBUTED'`.

### 6.8 Projects Comparator
- Matches projects by `id` (fallback: normalized `title`).
- Item promoted $\rightarrow$ `changeType: 'PROMOTED'`. Item excluded $\rightarrow$ `changeType: 'EXCLUDED'`.
- Bullets modified $\rightarrow$ matches proposal for `projects.bullet` $\rightarrow$ `REWRITTEN` or `CHANGED`.

### 6.9 Education Comparator
- Matches education items by `id` (fallback: `institution + '::' + degree`).
- Field-aware equality handles nullable `startDate`, `endDate`, `honors: []` vs `undefined`.
- Unmapped changes $\rightarrow$ `changeType: 'CHANGED'`, `source: 'UNATTRIBUTED'`.

### 6.10 Layout / Section Order Comparator
- Caller supplies canonical `masterSectionOrder` and `tailoredSectionOrder` from actual resume builder configurations (`ResumeBuilderConfig.sectionOrder`).
- If arrays differ:
  - Check proposal for `target.field === 'layout.sectionOrder'`.
  - Output collision-safe diff `id: 'diff:layout:sectionOrder'`, `changeType: 'REORDERED'`, `source: proposal ? 'TAILORING_PLAN' : 'UNATTRIBUTED'`.

---

## 7. Exhaustive Behavioral Test Matrix (`resume-diff.test.ts`)

Tests are organized strictly by **behavioral coverage** rather than arbitrary numbers:

| Test Group | Specific Invariant / Behavior Tested | Expected Assertion |
|---|---|---|
| **Identity & Purity** | Identical documents with reordered object keys | `hasChanges: false`, `totalChanges: 0` |
| **Immutability** | Deep freeze & snapshot before/after diff calculation | `masterBefore === masterAfter`, `tailoredBefore === tailoredAfter` |
| **Summary Diff** | Summary text changed with approved proposal | 1 change, `changeType: 'REWRITTEN'`, `source: 'TAILORING_PLAN'`, proposal metadata attached |
| **Summary Unattributed** | Summary text changed without proposal | 1 change, `changeType: 'CHANGED'`, `source: 'UNATTRIBUTED'`, no fake proposal ID |
| **Summary Proposal EDITED** | Proposal had `userDecision: 'EDITED'` with `userEditedValue` | `changeType: 'EDITED'`, `source: 'TAILORING_PLAN'` |
| **Skills Promotion** | Skill moved to index 0 with `PROMOTE` proposal | `changeType: 'PROMOTED'`, `source: 'TAILORING_PLAN'` |
| **Skills Reordered Unattributed** | Skill moved without proposal | `changeType: 'REORDERED'`, `source: 'UNATTRIBUTED'` (NOT `GENERATION`) |
| **Skills Structural Addition** | New skill in Tailored not present in Master without proposal | `changeType: 'ADDED'`, `source: 'UNATTRIBUTED'` (NOT `TAILORING_PLAN`) |
| **Skills Duplicate Names** | Two skills with identical names ("JavaScript") | Matches by stable `id`; does not attach proposal to wrong skill |
| **Experience Bullet Rewrite** | Bullet changed with matching proposal by `subEntityId` | `changeType: 'REWRITTEN'`, `source: 'TAILORING_PLAN'`, evidence attached |
| **Experience Ambiguous Fallback** | Two bullets with identical text matching proposal by `currentValue` | Detects ambiguity, does NOT guess; returns `source: 'UNATTRIBUTED'` |
| **Experience Exclusion** | Experience removed with `EXCLUDE` proposal | `changeType: 'EXCLUDED'`, `source: 'TAILORING_PLAN'` |
| **Post-Gen Manual Edit** | Bullet modified post-generation with verified provenance | `changeType: 'USER_EDIT'`, `source: 'USER_EDIT'` |
| **Projects Selection** | Project promoted to index 0 with proposal | `changeType: 'PROMOTED'`, `source: 'TAILORING_PLAN'` |
| **Projects Exclusion** | Project excluded with proposal | `changeType: 'EXCLUDED'`, `source: 'TAILORING_PLAN'` |
| **Education Nulls** | Null dates and undefined honors in Education | `0` diffs when canonical semantics define as equivalent |
| **Layout Order** | Section order altered between canonical configs | `changeType: 'REORDERED'`, `id: 'diff:layout:sectionOrder'` |
| **False-Positive Guard** | Generated IDs, timestamps, trailing spaces, key order | `totalChanges: 0` |
| **Traceability Resilience** | Proposal lookup fails due to missing ID | Diff item still returned with `source: 'UNATTRIBUTED'` (never dropped) |

---

## 8. Verification & Execution Sequence

1. **Step 1: Create Data Contracts**
   - Create `client/types/resume-comparison.types.ts` with strongly typed `ResumeDiffValue` and zero `any`.
2. **Step 2: Implement Deterministic Diff Engine**
   - Create `client/lib/resume-studio/resume-diff.ts` with pure section comparators and ambiguity-safe proposal matching.
3. **Step 3: Implement Exhaustive Unit Test Suite**
   - Create `client/lib/resume-studio/__tests__/resume-diff.test.ts` covering the full behavioral test matrix.
4. **Step 4: Execute Focused Unit Tests**
   - Run: `cd client && npx vitest run tests/resume-diff.test.ts`
   - Verify 100% test pass rate.
5. **Step 5: Fix Pre-existing Type Issue & Validate Typecheck**
   - Address minor `company: string | null` type discrepancy in `client/hooks/useJobIntake.ts`.
   - Run: `cd client && npx tsc --noEmit`. Verify 0 errors.
6. **Step 6: Run Full Client Regression**
   - Run: `cd client && npx vitest run`
   - Report actual exact counts: `X test files / Y tests passed`. Ensure no existing tests were deleted, renamed, or excluded.

---

## 9. Definition of Done (DoD) for Phase 6E.1

- [ ] `client/types/resume-comparison.types.ts` has zero `any` and defines `ResumeDiffValue`.
- [ ] `client/lib/resume-studio/resume-diff.ts` is 100% pure, side-effect free, and deterministic (0 LLM, 0 network, 0 DB).
- [ ] Input `masterDoc` and `tailoredDoc` are verified immutable.
- [ ] Proposal matching is ID-first and ambiguity-safe (does not guess on duplicate text).
- [ ] Structural facts (`ADDED`, `REMOVED`) are decoupled from approval provenance.
- [ ] `EDITED` (6C proposal) is strictly distinguished from `USER_EDIT` (post-generation manual edit).
- [ ] No `GENERATION` or `USER_EDIT` attribution without verified provenance.
- [ ] Normalization is field-aware based on the canonical AST schema.
- [ ] Deterministic diff IDs are collision-safe composite strings.
- [ ] All behavioral unit tests pass in `resume-diff.test.ts`.
- [ ] Full client regression passes with 0 regressions.
- [ ] Client TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.
