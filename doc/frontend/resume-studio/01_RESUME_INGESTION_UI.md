# SKILLEZO RESUME STUDIO — PHASE 1 SPECIFICATION
# RESUME INGESTION → CANONICAL ResumeDocument

> **Status:** 🟢 **COMPLETED & HARDENED**  
> **Test Coverage:** 15/15 tests passing across 10 targeted suites (`resume-ingestion.spec.ts`), 345/345 server tests passing.  
> **Type Safety:** Server & Client TypeScript compiler checks clean (`tsc --noEmit` exit code 0).

---

## 1. Existing Parser Architecture Discovered
The backend parser is implemented in `server/src/modules/resume/resume.parser.ts` (`ResumeParserService`).
- Uses `pdf-parse` for text and hyperlink annotation extraction from PDF buffers.
- Employs regex heuristics and compiled taxonomy dictionaries to extract candidate contact info, technical skills, employment experience, education history, projects, and certifications.
- Returns raw structured output matching `IResumeExtractedData`.

---

## 2. Raw Parser Output Contract
`IResumeExtractedData` defines:
```typescript
export interface IResumeExtractedData {
  personalInfo?: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    github?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
  } | null;
  summary?: string | null;
  skills: Array<{ name: string; category?: string | null }>;
  education: Array<{
    institution: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    startYear?: number | null;
    endYear?: number | null;
  }>;
  experience: Array<{
    companyName: string;
    jobTitle: string;
    startDate?: Date | null;
    endDate?: Date | null;
    isCurrent?: boolean;
    description?: string | null;
  }>;
  projects: Array<{
    title: string;
    description?: string | null;
    technologies?: string[];
    link?: string | null;
    githubUrl?: string | null;
    liveDemoUrl?: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string | null;
    issueDate?: Date | null;
  }>;
  totalExperienceYears?: number | null;
  parserVersion?: string | null;
}
```

---

## 3. Normalization Architecture
The Phase 1 normalizer (`ResumeDocumentNormalizer` in `server/src/modules/resume-intelligence/document/resume-document.normalizer.ts`) provides a deterministic, source-grounded adapter layer between raw parser output and the canonical `ResumeDocument`.

```text
Upload Validation (PDF Only, Clean DOCX Rejection)
        ↓
Temporary Storage Save (`storageService.save`)
        ↓
PDF Parsing (`ResumeParserService.parseResumeBuffer` / `extractRawTextFromBuffer`)
        ↓
Deterministic Normalization (`ResumeDocumentNormalizer`)
 ├── Contact Normalization & URL canonicalizer (No fake placeholders)
 ├── Summary Normalization & Artifact cleaner
 ├── Skills Deduplication & Boundary Preservation
 ├── Experience Structuring & Bullet Tokenization (Partial entries retained)
 ├── Projects & Tech Stack Extraction
 ├── Education & Degree/Honors Normalization
 ├── Achievements & Certification Mapping
 └── Evidence Ledger (Decoupled IDs, True Source Confidence)
        ↓
Schema Validation (`ResumeDocumentSchema.safeParse`)
        ↓
MongoDB Persistence (`ResumeRepository.create` with `resumeDocument`)
        ↓
Automatic Candidate Profile Hydration (`ProfileService.hydrateFromParsedResume`)
```

### Storage Failure & Cleanup Lifecycle
If parsing, normalization, schema validation, or database persistence fails at any stage:
- The temporary file saved on storage is immediately cleaned up via `storageService.delete(savedStorageKey)`.
- No orphaned, half-written, or corrupted `ResumeModel` document is left in MongoDB.
- A structured `AppError` is thrown with an appropriate HTTP status code.

---

## 4. ResumeDocument Mapping
The canonical `ResumeDocument` is the single source of truth across all 7 sections:
- `contact`: `ResumeContact` (`fullName`, optional `email`, optional `phone`, `location`, `links[]`)
- `summary`: `ResumeSummary` (`text`, optional `yearsOfExperience`, optional `targetRole`)
- `skills`: `ResumeSkillItem[]` (deduplicated, classified into canonical categories)
- `experience`: `ResumeExperienceItem[]` (bullets tokenized, metrics extracted, partial entries preserved)
- `projects`: `ResumeProjectItem[]`
- `education`: `ResumeEducationItem[]`
- `achievements`: `ResumeAchievementItem[]`
- `evidence`: `ResumeEvidence[]`
- `currentVersion`: `ResumeVersionMetadata`
- `templateConfig`: `ResumeTemplateConfig`

---

## 5. Field-Level Mapping & Engineering Invariants
- **Source Grounding over Absolute Claims:** High-integrity, deterministic, source-grounded normalization. "No fabricated candidate facts" is an enforced invariant.
- **Contact:** `email` is optional (`email?: string`). When unparsed, it remains `undefined` (never `candidate@example.com`). Missing name does not inject generic placeholders like `"Candidate"`.
- **Partial Experience Retention:** Entries containing bullets or descriptions must **never be discarded** simply because `companyName` or `jobTitle` was not parsed. The bullets, impact metrics, and evidence are preserved with `companyName: undefined` and `jobTitle: undefined`.
- **Date Precision:** Date precision is never artificially expanded (`"2022"` stays `"2022"`, `"January 2022"` stays `"2022-01"`, `"Jan 15, 2022"` stays `"2022-01-15"`).
- **Skill Deduplication & Boundaries:** Case-insensitive deduplication (e.g. `React`, `react`, `REACT` → `React`), while distinct technologies (`Java` vs `JavaScript`, `C` vs `C++`, `Node` vs `Node.js`) remain separate.

---

## 6. Evidence & Provenance Behavior
Every extracted claim receives a corresponding entry in the `evidence[]` ledger:
- `source`: `"PARSED"`
- `verified`: `false`
- `confidence`: `undefined` (or `null`) unless the underlying parser actually calculates an extraction confidence score. Never fabricated numbers like `0.95` or `1.0`.
- **Decoupled Evidence IDs:** `generateDeterministicId("ev", type, canonicalValue)`. The evidence ID identifies the *canonical career fact*, decoupled from individual resume file IDs, so identical facts across multiple resumes share the same evidence identity. Provenance is tracked via `sourceDocumentId`.

---

## 7. Date Normalization
- Date strings and objects are normalized strictly preserving source granularity:
  - Exact year: `"2022"`
  - Month-year: `"2022-01"`
  - Full date: `"2022-01-15"`
  - Ongoing: `"Present"`
- Never invents day or month when only year or month-year is available.

---

## 8. URL Normalization
- Profile links (LinkedIn, GitHub, Portfolio, Twitter/X) are validated and canonicalized with `https://` protocols using `canonicalizeUrl()`.

---

## 9. Skill Taxonomy Classification
Skills are deterministically mapped into 11 canonical categories:
- `FRONTEND`, `BACKEND`, `DATABASE`, `CLOUD`, `DEVOPS`, `LANGUAGE`, `TESTING`, `MOBILE`, `AI_ML`, `TOOLS`, `OTHER`.

---

## 10. Upload Boundary & Clean DOCX Rejection
- Handled at `server/src/core/middleware/upload.middleware.ts`.
- Restricts `allowedMimeTypes` strictly to `["application/pdf"]`.
- Cleanly rejects `.doc` / `.docx` files with HTTP 400 Bad Request:
  `"PDF resumes are currently supported. DOCX support will be added in a later phase."`

---

## 11. Persistence & Logging Conventions
- Resumes are persisted to MongoDB via `ResumeRepository.create()` with `resumeDocument` validated against `ResumeDocumentSchema`.
- Logging reuses standard project console conventions with `[ResumeService]` prefix without leaking candidate PII:
  - `[ResumeService] Ingestion started for file: <originalname>`
  - `[ResumeService] PDF parse succeeded. Text length: <len>`
  - `[ResumeService] Normalization succeeded. Sections: [...]`
  - `[ResumeService] Resume document persisted successfully. ID: <id>`

---

## 12. Idempotency & Determinism
- Normalization is pure and deterministic. Passing the identical parser output twice yields the exact same canonical AST, identical deterministic IDs, preserved ordering, and identical evidence references.

---

## 13. Test Strategy & Verification
1. **Isolated Ingestion Test Suite:** `server/tests/unit/modules/resume-ingestion.spec.ts`
   - **Suite 1:** Canonical Normalization (Full parser output mapping across all sections).
   - **Suite 2:** Partial & Minimal Resumes (Empty sections remain empty arrays, minimal resume validates cleanly).
   - **Suite 3:** Missing Contact Fields (Missing email is `undefined`, missing name does not inject `"Candidate"`).
   - **Suite 4:** Partial Experience Preservation (Verifies bullets preserved when company/title missing).
   - **Suite 5:** Source Preservation (Metrics, numbers, technologies, bullet text not altered or deleted).
   - **Suite 6:** AST Stability & Determinism (Consecutive runs produce identical AST and deterministic IDs).
   - **Suite 7:** Evidence Ledger & True Confidence (Confidence is `undefined`, evidence IDs decoupled from file ID).
   - **Suite 8:** Date Precision Normalizer (Granularity preserved without inventing days/months).
   - **Suite 9:** Skill Deduplication & Category Classification (Case-insensitive deduplication, distinct skills maintained).
   - **Suite 10:** Synthetic Real PDF Integration (`synthetic-resume.pdf` → `pdf-parse` → normalizer → schema validation → AST).
   - **Graceful Handling of Malformed Output:** Error tolerance and repair for corrupted structures.
2. **Full Regression Suite:** 38 test files, 345/345 passing tests.
3. **Compiler Verification:** `tsc --noEmit` passes with 0 errors across server and client.
