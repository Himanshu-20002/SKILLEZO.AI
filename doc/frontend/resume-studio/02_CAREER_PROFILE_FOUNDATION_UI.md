# Phase 2: Career Profile Foundation — Canonical Source of Truth

## 1. Executive Summary & Architecture Ownership Contracts

In SKILLEZO AI, the **Career Profile** (`ProfileModel`) is established as the **sole canonical source of truth** for all persistent candidate career facts.

```
                              ┌────────────────────────────────────────┐
                              │              ProfileModel              │
                              │    (SOLE CANONICAL SOURCE OF TRUTH)     │
                              │  Skills, Experience, Education, etc.   │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                       ┌─────────────────────────────────────────────────────┐
                       │                   ResumeModel                       │
                       │           (PRESENTATION ARTIFACTS)                  │
                       ├──────────────────────────┬──────────────────────────┤
                       │  variantType: "MASTER"   │ variantType: "TAILORED"  │
                       │  (Full Career Snapshot)  │ (Targeted Job Snapshot)  │
                       └──────────────────────────┴──────────────────────────┘
```

### Core Architecture Ownership Contracts:
1. **Single Source of Truth**: `ProfileModel` persists all canonical career facts. We do NOT create competing profile collections (`CareerProfileModel`, `CandidateProfileModel`, etc.).
2. **Presentation AST**: `ResumeDocument` represents the presentation AST snapshot for interactive editing, ATS analysis, and PDF rendering.
3. **Master Resume Presentation Semantics**: `ResumeModel` with `variantType: "MASTER"` is strictly a **presentation artifact** rendered from the Career Profile, not a competing source of truth.
4. **Tailored Resumes**: Derived presentation snapshots customized for specific job descriptions (`variantType: "TAILORED"`).
5. **Applications**: Immutable historical snapshots capturing what was submitted to an employer at a specific point in time.

---

## 2. Schema Design & Data Models

### ProfileModel Schema Enhancements (`server/src/database/models/Profile.model.ts`):
- `profileVersion: number` (default `1`): Increments strictly on material mutations to canonical facts.
- `completeness: IProfileCompleteness`: Detailed 8-section breakdown (identity, contact, summary, skills, experience, projects, education, links) with actionable `missingFields[]`.
- `completionPercentage: number`: Kept in sync with `completeness.score` (0–100 scale).
- Entity interfaces updated with Phase 1 provenance:
  - `IProfileSkill`: Added `evidenceIds?: string[]`.
  - `IProfileEducation`: Added `evidenceIds?: string[]`.
  - `IProfileExperience`: Made `companyName` and `jobTitle` optional without placeholders, added `bullets?: string[]`, `technologiesUsed?: string[]`, `evidenceIds?: string[]`.
  - `IProfileProject`: Added `evidenceIds?: string[]`.

### ResumeModel Schema Enhancements (`server/src/database/models/Resume.model.ts`):
- `variantType: "MASTER" | "TAILORED"` (default `"MASTER"`).
- `parentResumeId?: Types.ObjectId`: Links tailored variants back to their source master presentation.
- `targetJobId?: Types.ObjectId`, `targetJobTitle?: string`, `targetCompany?: string`.

---

## 3. Hydration Pipeline & Deduplication Rules

The hydration pipeline (`ProfileService.hydrateFromParsedResume`) performs **high-integrity, deterministic, source-grounded normalization**:

### 3.1. Non-Destructive Invariant
Existing manual candidate edits, custom headlines, bios, phones, and verified credentials are NEVER overwritten or downgraded by incoming parsed resume defaults.

### 3.2. Experience Deduplication & The Insufficient Identity Rule
- **Composite Key**: `${companyName}_${jobTitle}_${startDate}`.
- **Insufficient Identity Rule**: If identity fields are insufficient (neither company nor title exists, or missing anchors make matching ambiguous), the entry is **strictly preserved as distinct rather than collapsed**. Unrelated partial experiences are never collapsed together.
- **No Fact Fabrication**: If company or title is missing, it is stored as `null`/`undefined`. Never fabricate placeholder strings (`"Unknown Company"`, `"Engineer"`).
- **Bullet & Tech Merging**: Existing bullets and technologies are preserved, and new incoming bullets and tech are appended (case-insensitively deduplicated).

### 3.3. Skill Deduplication & Exact Token Distinctions
- **Exact Token Matching**: `Java` vs `JavaScript`, `C` vs `C++` vs `C#`, and `Node` vs `Node.js` are strictly distinct under exact trimmed equality.
- **Verified Credentials Invariant**: Verified skills (`verified: true`) and skills sourced from assessments or manual entry (`SkillSource.ASSESSMENT`, `SkillSource.GRAPHQL`, `SkillSource.PROFILE`) are never downgraded to unverified or overwritten by `SkillSource.RESUME`.
- **Evidence Merging**: Incoming Phase 1 `evidenceIds` are merged into the existing skill's evidence list.

### 3.4. Education & Projects Deduplication
- **Education**: Deduplicated by `${institution}_${degree}`. Start/end years and field of study are backfilled if previously null. Phase 1 evidence IDs are linked.
- **Projects**: Legacy mock titles are purged. Projects are matched by normalized title. Links (`githubUrl`, `liveDemoUrl`) and technologies are merged non-destructively.

---

## 4. Conflict Resolution Policy

| Field / Entity | Profile Has Value | Resume Has Value | Resolution |
| :--- | :--- | :--- | :--- |
| **Headline** | User headline | Parsed role/summary | **Profile Wins** (preserve user edit) |
| **Phone** | User phone | Parsed phone | **Profile Wins** (preserve user edit) |
| **Bio / Summary** | User bio | Parsed summary | **Profile Wins** (preserve user edit) |
| **Location** | Populated location | Parsed location | **Profile Wins** (preserve user edit) |
| **Links** | Existing links | Parsed links | **Fill blanks only** (preserve existing URLs) |
| **Verified Skill** | `verified: true` | `verified: false` | **Profile Wins** (never downgrade verification) |
| **Manual Skill** | `SkillSource.PROFILE` | `SkillSource.RESUME`| **Profile Wins** (preserve manual/assessment source) |
| **Experience Entry** | Existing bullets/tech | New bullets/tech | **Union Merge** (deduplicated bullet & tech union) |

---

## 5. Provenance Model & Phase 1 Evidence Linkage

- Profile entities (`skills`, `experience`, `projects`, `education`) store `evidenceIds: string[]`.
- In accordance with Phase 1 design, `evidenceIds` reference Phase 1 evidence items (`ResumeEvidence.id` from `ResumeDocument.evidence`), providing complete traceability from the extracted source PDF to the canonical Career Profile.
- The system never invents fake profile-specific evidence IDs.

---

## 6. Profile Versioning Strategy

- `profileVersion` starts at `1` upon creation.
- A deterministic snapshot helper (`extractCanonicalSnapshot`) serializes all persistent career facts across:
  1. `headline`
  2. `phone`
  3. `targetRole` & `targetRoleId`
  4. `bio`
  5. `location`
  6. `links`
  7. `skills` (name, category, level, proficiency, verified)
  8. `experience` (company, title, dates, isCurrent, bullets, technologies)
  9. `education` (institution, degree, field of study, years)
  10. `projects` (title, description, techStack, links)
- **Increment Trigger**: `profileVersion` increments by `1` **ONLY** when a canonical career fact materially changes.
- **Idempotency Guarantee**: Ingesting the same resume twice or hydrating identical data produces `snapshotBefore === snapshotAfter`, resulting in **0 duplicate entries and 0 version increments**.
- **Read Invariant**: Reads (`getMyProfile`), studio previews, and completeness calculations cause zero version bumps.

---

## 7. Deterministic Completeness Scoring

Profile completeness adheres strictly to the existing 100-point product weights while providing an 8-section breakdown:

| Section | Criteria | Points | Status Rules |
| :--- | :--- | :---: | :--- |
| **Identity** | Base account (10) + Headline (15) + Target Role (15) | **40** | COMPLETE if both present, INCOMPLETE if base only, EMPTY if 0 |
| **Contact** | Phone (5) + Location (5) | **10** | COMPLETE if both present, INCOMPLETE if one present |
| **Summary** | Bio > 20 characters (10) | **10** | COMPLETE if > 20 chars, EMPTY otherwise |
| **Skills** | Skills >= 3 (15) + Verified Skill >= 1 (10) | **25** | COMPLETE if both, INCOMPLETE if skills present, EMPTY if 0 |
| **Projects** | Projects >= 1 (10) | **10** | COMPLETE if >= 1, EMPTY if 0 |
| **Links** | GitHub, LinkedIn, or Portfolio present (5) | **5** | COMPLETE if >= 1 link, EMPTY if 0 |
| **Experience** | Informational (tracked for missingFields) | **0** | COMPLETE if >= 1, EMPTY if 0 |
| **Education** | Informational (tracked for missingFields) | **0** | COMPLETE if >= 1, EMPTY if 0 |
| **TOTAL** | Sum of above sections | **100** | Synced to `profile.completionPercentage` |

---

## 8. Verification & Quality Assurance

- **Phase 2 Test Suite**: `server/tests/unit/modules/profile-career-foundation.spec.ts` (18 tests across 14 suites, 100% passing).
- **Existing Profile Tests**: `server/tests/unit/modules/profile.service.spec.ts` (5 tests, 100% passing).
- **Full Server Regression**: 39 test files, 363 tests passed (100% passing).
- **TypeScript Static Verification**:
  - Server: `npm run type-check` (0 errors).
  - Client: `npx tsc --noEmit` (0 errors).
