# Phase 0: Resume Studio — Architecture Freeze & Canonical Foundation

> **Status:** Phase 0 Active & Frozen  
> **Master Contract:** `ResumeDocument` (Single Source of Truth)  
> **Engine Layer:** Preserves Phases 1–7 as internal intelligence backplane.  

---

## 1. Current Architecture Discovered

During our repository inspection, we identified the following existing infrastructure:
* **Framework:** Next.js 16.3.0 (Turbopack) with App Router in `client/`, and Express 5.2.1 with TypeScript in `server/`.
* **Database & Persistence:** MongoDB with Mongoose (`IResumeExtractedData` and `Resume` model storing raw text, parsed structure, and version history).
* **AI Provider:** Live Google Gemini 2.5 Flash (`server/src/core/ai/providers/gemini.provider.ts`) with structured Zod output validation.
* **Resume Intelligence Engine:** Consolidated modular domain under `server/src/modules/resume-intelligence/` containing:
  - `skills/` (Phase 2: Canonical Skill Catalog & Detection)
  - `roles/` (Phase 3: Role Benchmarks)
  - `jobs/` (Phase 3: Job Description Parsing)
  - `matching/` (Phase 4: Match Scoring & Gap Calculation)
  - `content/` (Phase 5: Power Verbs & Metric Detection)
  - `recommendations/` (Phase 6: AI Prioritization)
  - `optimization/` (Phase 7: Controlled Rewrite & Live Re-score)

---

## 2. Existing Resume Intelligence Capabilities

The intelligence modules provide high-throughput deterministic diagnostics:
* Parsing resumes in `< 15ms` using `pdf-parse` and regex tokenizers.
* Cross-referencing 48+ canonical skills and detecting unverified claims.
* Prioritizing high-impact recommendations deterministically before AI touches the text.
* Re-scoring drafts against ATS, Role Match, and Content Quality metrics.

---

## 3. What Is Being Reused

* **Phase 1 Parser:** Reused as the input ingestion engine.
* **Phase 2–5 Analyzers:** Reused to calculate individual section scores and identify weaknesses.
* **Phase 6 Prioritizer:** Reused to surface targeted action items.
* **Phase 7 Validator & Gemini Provider:** Reused for Evidence-Locked bullet rewrites.

---

## 4. What Is Being Changed / Upgraded

* **Single Source of Truth:** Introducing `ResumeDocument` as the central document model. AI never directly edits the PDF; AI proposes structured changes that modify `ResumeDocument`, which feeds the visual builder and renderer.
* **User-Facing Abstraction:** Internal terms (`Phase 6`, `Phase 7`, `3-Pillars`) are completely hidden behind intuitive section cards (`Contact`, `Summary`, `Skills`, `Experience`, `Projects`, `Education`, `Achievements`).
* **Section-Level Scoring:** Every section is independently addressable with its own deterministic score (0–100) and status.

---

## 5. Canonical `ResumeDocument` Definition

```typescript
export interface ResumeDocument {
  id: string;
  userId: string;
  title: string;

  // 7 Canonical Sections
  contact: ResumeContact;
  summary: ResumeSummary;
  skills: ResumeSkillItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  education: ResumeEducationItem[];
  achievements: ResumeAchievementItem[];

  // Fact & Provenance Ledger
  evidence: ResumeEvidence[];

  // Target Context
  targetRole?: string;
  targetJobDescription?: string;

  // Visual Configuration
  templateConfig: ResumeTemplateConfig;

  // Deterministic Scores
  scores?: {
    overall: ResumeOverallScore;
    sections: ResumeSectionScores;
  };

  // Version Control
  currentVersion: ResumeVersionMetadata;
  versions?: ResumeVersionMetadata[];

  // System Metadata
  schemaVersion: string; // "1.0.0"
  isMaster: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. Section Model (7 Canonical Sections)

1. **`CONTACT`**: Full name, email, phone, location, and verified links (LinkedIn, GitHub, Portfolio).
2. **`SUMMARY`**: Elevator pitch, years of experience, target role declaration.
3. **`SKILLS`**: Canonical skill items mapped to standard categories (`FRONTEND`, `BACKEND`, etc.).
4. **`EXPERIENCE`**: Work history entries with structured bullets containing power verbs and metric tags.
5. **`PROJECTS`**: Technical projects with technologies, repository URLs, and live demo links.
6. **`EDUCATION`**: Degree, institution, field of study, and dates.
7. **`ACHIEVEMENTS`**: Verified hackathon wins, honors, and industry certifications (e.g. AWS).

---

## 7. Fact & Evidence Provenance Model

```typescript
export type ResumeEvidenceSource = "USER" | "PARSED" | "IMPORTED" | "CONFIRMED";

export interface ResumeEvidence {
  id: string;
  type: ResumeEvidenceType;
  source: ResumeEvidenceSource;
  value: string;
  confidence: number;
  verified: boolean;
  sectionId?: string;
  itemId?: string;
  createdAt: string;
}
```

---

## 8. Versioning Model

* **Master Resume:** Canonical base document containing all candidate historical facts.
* **Targeted Versions:** Reversible versions tailored to specific roles or job descriptions referencing `parentVersionId`.

---

## 9. Target Role Model

* `targetRole` (e.g., `Full-Stack Engineer`, `Frontend Engineer`, `Backend Engineer`) provides the benchmark context for required skills, seniority, and keyword relevance.

---

## 10. Job Description (JD) Model

* `targetJobDescription`: Optional pasted job text parsed to extract specific employer requirements without overriding baseline role benchmarks.

---

## 11. Resume Template Contract

* Templates consume the standard `ResumeDocument` without modifying data.
* Initial Supported Templates:
  - `Classic` (Traditional corporate / ATS benchmark)
  - `Modern` (Sleek SaaS aesthetic)
  - `Minimal` (Clean typography-focused)
  - `Engineering` (Technical depth, dual-column skills)
  - `Executive` (Leadership & milestone focused)

---

## 12. AI vs. Deterministic Boundary Freeze

* **AI Can:** Identify phrasing weaknesses, suggest action verbs, detect missing keywords, and draft bullet rewrites.
* **AI Cannot:** Fabricate employers, metrics, revenue, tenure, or invent scores.
* **Deterministic Engine:** Strictly computes final numerical scores (0–100) using pure math algorithms after candidate approval.

---

## 13. React-PDF Rendering Decision

* **Interactive Editor:** Standard React/HTML DOM with instant optimistic feedback.
* **PDF Export:** `@react-pdf/renderer` 4.x compiled strictly on-demand (when user clicks `Preview PDF` or `Download PDF`).
* **No LaTeX:** Avoids heavy server-side LaTeX toolchains and maintains seamless client/edge export.

---

## 14. API Boundaries

* `GET /api/resume`: Fetch candidate resumes.
* `GET /api/resume/:id`: Fetch `ResumeDocument` representation.
* `POST /api/resume/upload`: Ingest PDF/DOCX into `ResumeDocument`.
* `POST /api/resume/:id/optimize`: Propose Evidence-Locked bullet improvements.
* `POST /api/resume/:id/rescore`: Deterministically re-score updated `ResumeDocument`.

---

## 15. Security & Privacy Rules

* Resumes are private and strictly isolated by `userId` from authenticated session.
* Untrusted resume text is sanitized to prevent prompt injection.
* No private candidate data is leaked into logs.

---

## 16. Performance Rules

* No background PDF compilation on every keystroke.
* Deterministic analysis runs in `< 15ms`.
* Gemini API calls are strictly on-demand.

---

## 17. Future Phase Dependencies

* **Phase 1:** Resume Ingestion adapts existing parser to output `ResumeDocument`.
* **Phase 2 & 3:** Section Scoring Engine computes 7 individual section scores.
* **Phase 4:** Resume Studio UI connects 7 interactive cards.
* **Phase 5 & 6:** AI Section Editor with Evidence Lock.
* **Phase 7 & 8:** Visual Builder & Multi-Template System.
* **Phase 9 & 10:** `@react-pdf/renderer` Export Engine.
* **Phase 11:** ATS PDF Roundtrip Validator.

---

## 18. Explicitly Deferred Functionality

* Drag-and-drop builder (Phase 7).
* PDF vector rendering (Phase 9).
* ATS PDF text diff validator (Phase 11).
* AI Resume Copilot (Phase 15).
