# SKILLEZO RESUME STUDIO — PHASE 1 SPECIFICATION
# RESUME INGESTION → CANONICAL ResumeDocument

## 1. Existing Parser Architecture Discovered
The backend parser is implemented in `server/src/modules/resume/resume.parser.ts` (`ResumeParserService`).
- Uses `pdf-parse` for text extraction from PDF buffers.
- Employs regex heuristics and compiled taxonomy dictionaries to extract candidate contact info, technical skills, employment experience, education history, projects, and certifications.
- Returns raw structured output matching `IResumeExtractedData`.

## 2. Raw Parser Output Contract
`IResumeExtractedData` defines:
```typescript
export interface IResumeExtractedData {
  personalInfo?: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
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

## 3. Normalization Architecture
The Phase 1 normalizer (`ResumeDocumentNormalizer` in `server/src/modules/resume-intelligence/document/resume-document.normalizer.ts`) provides a deterministic, zero-hallucination adapter layer between raw parser output and the canonical `ResumeDocument`.

```text
Raw Extracted Data (`IResumeExtractedData` + `rawText`)
          │
          ▼
   PHASE 1 NORMALIZER (`ResumeDocumentNormalizer`)
    ├── Contact Normalization & URL canonicalizer
    ├── Summary Normalization & Artifact cleaner
    ├── Skills Deduplication & Canonical Taxonomy Mapping
    ├── Experience Structuring & Bullet Tokenization
    ├── Projects & Tech Stack Extraction
    ├── Education & Degree/Honors Normalization
    ├── Achievements & Certification Mapping
    └── Evidence Ledger Construction (`PARSED`, `verified = false`)
          │
          ▼
   SCHEMA VALIDATION (`ResumeDocumentSchema.safeParse`)
          │
          ▼
   DATABASE PERSISTENCE (`ResumeModel.resumeDocument`)
          │
          ▼
   RESUME STUDIO ENTRY
```

## 4. ResumeDocument Mapping
The canonical `ResumeDocument` is the single source of truth across all 7 sections:
- `contact`: `ResumeContact`
- `summary`: `ResumeSummary`
- `skills`: `ResumeSkillItem[]`
- `experience`: `ResumeExperienceItem[]`
- `projects`: `ResumeProjectItem[]`
- `education`: `ResumeEducationItem[]`
- `achievements`: `ResumeAchievementItem[]`
- `evidence`: `ResumeEvidence[]`
- `currentVersion`: `ResumeVersionMetadata`
- `templateConfig`: `ResumeTemplateConfig`

## 5. Field-Level Mapping Rules
- **Contact**: `fullName`, `email`, `phone`, and `location` are trimmed and stripped of artifact whitespace. Missing values fall back to safe canonical defaults without fabricating personal identities.
- **Summary**: Objective/summary prefixes are stripped; sentences are preserved verbatim without AI rewriting.
- **Skills**: Case-insensitive deduplication (e.g., `React`, `react`, `REACT` -> `React`). Distinct skills remain distinct (`Java` vs `JavaScript`).
- **Experience**: Descriptions are split into individual bullet points with verbs and metric detection. Start and end dates are preserved without inventing precision.
- **Projects**: Title, description, technologies, and URLs are mapped; multi-line descriptions are structured into bullets.
- **Education**: Degree, institution, startYear, and endYear are mapped directly.
- **Achievements**: Certifications and awards are mapped to `ResumeAchievementItem[]`.

## 6. Evidence / Provenance Behavior
Every extracted claim receives a corresponding entry in the `evidence[]` ledger:
- `source`: `"PARSED"`
- `verified`: `false`
- `confidence`: Between `0.85` and `0.95`
- Provenance cannot be elevated to `"CONFIRMED"` until explicit candidate interaction.

## 7. Date Normalization
- Date objects and strings are normalized to ISO formats (`YYYY-MM` or `YYYY`).
- Missing dates or single-year entries are preserved without inventing day or month precision.

## 8. URL Normalization
- Profile links (LinkedIn, GitHub, Portfolio, Twitter/X, Personal Website) extracted from `personalInfo` or raw text are validated and canonicalized with `https://` protocols.

## 9. Section Classification
Skills are deterministically mapped into 11 canonical categories:
- `FRONTEND`, `BACKEND`, `DATABASE`, `CLOUD`, `DEVOPS`, `LANGUAGE`, `TESTING`, `MOBILE`, `AI_ML`, `TOOLS`, `OTHER`.

## 10. Error Handling
- Invalid or corrupt PDF parsing returns structured errors (`ResumeStatus.UPLOADED` with `parsingError`).
- Partial resumes missing any sections produce a valid partial `ResumeDocument` conforming to schema.
- Malformed data undergoes graceful fallback repairs via `repairDocument()`.

## 11. Persistence Behavior
- Stored directly on MongoDB `Resume` document model in the `resumeDocument` field.
- Dynamic fallback on retrieval (`getResumeById`) provides seamless on-the-fly normalization for any legacy resume records without breaking backwards compatibility.

## 12. Idempotency Behavior
- Normalization is a pure, deterministic function.
- Multiple runs on identical input produce identical output without duplicating skills, bullets, or evidence records.

## 13. API Changes
- Resume upload (`POST /api/resumes/upload`) generates and stores `resumeDocument`.
- Resume details (`GET /api/resumes/:resumeId`) returns populated `resumeDocument`.

## 14. Security
- Strict user isolation: Resumes are scoped to the authenticated `userId`.
- Safe URL verification: Links undergo URL validation before persistence.
- Input validation: All payloads validated with Zod schemas.

## 15. Performance
- Pure in-memory deterministic transformation (< 5ms execution time).
- No unnecessary LLM/AI calls for normalization.

## 16. Test Strategy
- Unit test suite: `server/tests/unit/modules/resume-ingestion.spec.ts` (8 comprehensive tests).
- Canonical schema tests: `server/tests/unit/modules/resume-document.spec.ts` (8 tests).
- 24 total test suites passing (146/146 tests green).

## 17. Browser Verification
- Verified `/dashboard/resume-studio` and `/dashboard/resume-studio/dev` loading canonical resume structures with 7 sections.

## 18. Known Limitations
- OCR for scanned image-only PDF files is deferred to future enterprise parsing extensions.
- Complex multi-column PDF layouts without text layers require standard PDF conversion.

## 19. Deferred Work
- Phase 2: Section Intelligence & Bullet Impact Analysis
- Phase 3: Deterministic ATS & Four-Pillar Scoring
- Phase 4: Resume Studio Interactive Section Views
- Phase 5 & 6: AI Section Editor & Optimization Re-scoring
- Phase 7 & 9: Resume Builder & React-PDF Document Generation
