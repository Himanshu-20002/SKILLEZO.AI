# SKILLEZO AI — Resume Intelligence → Resume Studio
## Product Understanding & Architecture Blueprint

> **Purpose:** Preserve the full product understanding and architectural decisions so the Resume Intelligence work can continue seamlessly without losing reasoning, UX direction, AI architecture, or implementation priorities.  
> **Core Product Idea:** Turn a normal candidate resume into a structured, evidence-backed, ATS-friendly, job-targeted resume through section-level AI improvement, measurable re-scoring, a visual resume builder, and reliable PDF generation.

---

## 1. Executive Summary

The current Resume Intelligence interface has become too complicated. It exposes too much internal AI/diagnostic machinery and forces the candidate to think about scores, pillars, recommendation layers, and analyzers instead of simply improving their resume.

**The recommended direction is not to throw away the seven AI phases.** Rather, those phases become the intelligence engine underneath a much simpler, candidate-facing product called **Resume Studio**.

### Candidate-Facing Workflow
```
Upload ➔ Understand ➔ Score ➔ Improve Each Section ➔ Re-Score ➔ Build ➔ Tailor to Job ➔ Export
```

* **User Perception:** *"Skillezo understood my resume, showed me what is weak, helped me fix it, and produced a professional job-ready resume."*
* **Engineering Architecture:** Keep the seven AI phases as specialized backend services/engines, but establish a structured canonical **`ResumeDocument` JSON** as the single source of truth. AI edits structured content; the renderer transforms that content into an ATS-friendly, publication-grade document.

---

## 2. Current Problem With Resume Intelligence

The current UI exposes multiple overlapping concepts: ATS Score, Match Score, Content Score, "3 Independent Pillars," deterministic scoring formulas, Phase 6 recommendations, measurable-impact analysis, technical evidence recommendations, and repeated "Optimize" actions.

While valuable internally, as the primary UX they create excessive cognitive load. Candidates do not need to understand the AI pipeline mechanics to take action.

### Primary UX Principle
> **Expose the decision, the reason, and the fix — not the machinery.**

Instead of asking the candidate to interpret multiple complex recommendation cards, the product should directly answer three intuitive questions:
1. **What part of my resume is weak?**
2. **Why is it weak for my target role?**
3. **What exactly should I change, and what will the improved version look like?**

The UI can therefore be drastically simplified without sacrificing any of the deep intelligence already implemented.

---

## 3. New Product Concept — Resume Studio

**Resume Studio** becomes the primary candidate-facing experience. Resume Intelligence remains the modular engine humming behind it.

```
RESUME STUDIO WORKSPACE
├── 1. Analyze   — Understand and parse resume evidence
├── 2. Improve   — Step-by-step section-level AI refinement
├── 3. Match     — Benchmark against target role / Job Description
├── 4. Build     — Visual layout, template selection, and structuring
└── 5. Export    — Deterministic PDF / LaTeX document generation
```

The product delivers the unified feeling of an **AI resume coach**, **structured editor**, **job-tailoring engine**, and **professional resume builder** — completely shielding the candidate from LaTeX syntax or raw AI prompt engineering.

---

## 4. Section-Level Scoring Model

Every meaningful resume section receives its own independent score and actionable diagnostics. This replaces an opaque global "Content Score" with surgical precision:

| Section | What Skillezo Evaluates | Primary Improvement |
| :--- | :--- | :--- |
| **Contact** | Name, email, phone, location, links, parsing safety | Completeness + ATS-safe formatting |
| **Summary** | Role alignment, clarity, keywords, specialization, value proposition | Sharper target-role positioning |
| **Skills** | Role relevance, keyword coverage, grouping, duplicates, evidence | Relevant skills + stronger organization |
| **Experience** | Impact, ownership, technical depth, metrics, scope, outcomes | Convert responsibilities into evidence-backed achievements |
| **Projects** | Problem, solution, architecture, stack, scale, impact, deployment | Highlight technical complexity and verified outcomes |
| **Education** | Degree, institution, dates, relevance, certifications | Clean structure + relevant academic credentials |
| **Achievements** | Awards, certifications, scale, business/technical outcomes | Transform weak claims into concrete accomplishments |

---

## 5. How Each Section Should Work

Clicking any section opens a dedicated **AI Workspace** rather than another static dashboard card.

### Example — Work Experience Section: `61 / 100`

```text
✓ Strong technology coverage
■ Most bullets describe responsibilities rather than achievements
■ Few measurable business/technical outcomes
■ Limited scale or performance evidence

AI Opportunities:
• Add measurable impact metrics
• Strengthen active ownership language
• Deepen technical specificity
• Improve recruiter scannability
```

* **Before:** *"Developed full-stack features using React, Next.js and Node.js."*
* **After (AI Proposal):** *"Built production-ready full-stack features using React, Next.js and Node.js, improving application performance and scalability."*

### The Evidence Rule (Anti-Hallucination Guardrail)
> **AI must never invent metrics.** If a metric is missing, Skillezo must prompt the candidate for real evidence rather than fabricating numbers.

**Verified Evidence Prompts:**
* Monthly active users served
* Number of production features shipped
* Latency reduction / performance delta
* Throughput or database query improvements
* Engineering hours or team time saved
* Cost / infrastructure reduction
* Conversion or sales percentage uplift
* CI/CD deployment reliability metrics

---

## 6. Seven Existing AI Phases as the Under-the-Hood Engine

All seven foundational AI phases built during previous sprints are preserved intact. They transition from exposed UI concepts into engine subsystems:

| Existing Engine Layer | Role Inside Resume Studio |
| :--- | :--- |
| **Phase 1 — AI Foundation** | Parsing, normalization, factual guardrails, and foundational resume data extraction. |
| **Phase 2 — Evidence + Skill Intelligence** | Extracts skills/evidence and identifies claims the candidate can substantiate. |
| **Phase 3 — Role Benchmark / JD Intelligence** | Evaluates target-role industry expectations and specific job posting requirements. |
| **Phase 4 — Resume ↔ Job Matching** | Quantifies relevance and isolates missing or weak role alignment points. |
| **Phase 5 — Impact + Content Intelligence** | Evaluates bullet power verbs, outcomes, clarity, impact, and writing quality. |
| **Phase 6 — AI Recommendation Orchestrator** | Prioritizes the highest-value improvements instead of overwhelming the user. |
| **Phase 7 — AI Optimization + Re-Score** | Applies candidate-approved changes and proves improvement with before/after scoring. |

---

## 7. Simplified Overall Score

The aggregate score is intuitive, actionable, and acts as a compass rather than a vanity badge:

```text
RESUME SCORE — 82 / 100
Good foundation — needs optimization

  ATS READINESS   — 91
  JOB MATCH       — 78
  CONTENT QUALITY — 73
  IMPACT          — 64

BIGGEST OPPORTUNITY
Experience — 61 / 100
"Adding stronger evidence and measurable outcomes could significantly improve your score."

[ Improve Experience → ]
```

---

## 8. Before → After Re-Scoring

Phase 7 optimization delivers immense candidate satisfaction when the interface visibly demonstrates tangible score gains:

```text
BEFORE ➔ AFTER RE-SCORING
Experience : 61 ➔ 84  (↑ +23)
Projects   : 73 ➔ 88  (↑ +15)
Skills     : 76 ➔ 91  (↑ +15)
Impact     : 38 ➔ 79  (↑ +41)
----------------------------------
Overall    : 74 ➔ 87  (↑ +13)
```

**Reversibility Principle:** Candidates can **Accept**, **Edit**, **Regenerate**, or **Reject** any suggested AI revision. The platform maintains the original baseline so every modification remains 100% reversible.

---

## 9. Master Resume + Job-Specific Variants

A major architectural advantage is maintaining one factual **Master Resume** in storage and spinning off targeted variants on demand:

```
                      ┌──────────────────────┐
                      │    MASTER RESUME     │
                      │ (Complete Evidence)  │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│Full-Stack Variant│   │ Frontend Variant │   │ Backend Variant  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

For any specific Job Description, Skillezo adjusts the emphasis, ordering of skills, project showcases, and bullet highlights while strictly preserving the candidate's authentic factual evidence.

> **Hard Guardrail:** Job tailoring must **never** create experience, skills, metrics, employers, projects, or achievements that the candidate cannot substantiate.

---

## 10. Resume Builder + LaTeX Rendering Pipeline

A LaTeX-driven backend compilation pipeline provides deterministic, pixel-perfect, ATS-compliant PDF generation:

```
ResumeDocument JSON
       ↓
LaTeX Template Engine
       ↓
.tex Document
       ↓
LaTeX Compiler (XeLaTeX / tectonic)
       ↓
ATS-Friendly Vector PDF
```

Candidates interact exclusively with a clean, visual structured editor. LaTeX operates strictly as the headless rendering engine (with an optional advanced code view for power users).

**Curated Templates:**
1. *Skillezo Classic* (Timeless single-column ATS standard)
2. *Skillezo Modern* (Clean typographic hierarchy with subtle accents)
3. *Skillezo Minimal* (Ultra-clean, distraction-free corporate layout)
4. *Skillezo Engineering* (Optimized for technical stacks, projects, and metrics)
5. *Skillezo Executive* (Leadership, strategy, and business outcomes focus)

---

## 11. End-to-End Resume Conversion Pipeline

```text
Upload Normal Resume (PDF / DOCX)
  ↓
Parse & Normalize Raw Text
  ↓
Build Structured ResumeDocument Schema
  ↓
Extract Fact & Skill Evidence
  ↓
Analyze Against Target Role / JD
  ↓
Compute Section-Level Scores
  ↓
Generate Targeted AI Improvements
  ↓
Candidate Approval & Interactive Refinement
  ↓
Deterministic In-Memory Re-Score
  ↓
Build Visual Structured Resume
  ↓
Compile via LaTeX Engine
  ↓
Export ATS-Compliant PDF
```

---

## 12. `ResumeDocument` — Canonical Single Source of Truth

The core software architectural rule is that structured JSON data is canonical. The AI never edits raw PDF binaries or unstructured strings directly:

```typescript
interface ResumeDocument {
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    links: { label: string; url: string }[];
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
    verifiedMetrics?: string[];
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationDate?: string;
    gpa?: string;
  }[];
  achievements: string[];
  evidence: {
    factId: string;
    sourceSection: string;
    statement: string;
    substantiated: boolean;
  }[];
  targetRole?: string;
  targetJobDescription?: string;
  metadata: {
    version: number;
    createdAt: string;
    updatedAt: string;
  };
}
```

This guarantees an impenetrable separation between **Data**, **Intelligence**, **Editing**, and **Rendering**.

---

## 13. High-Level Technical Architecture

```
                 ┌────────────────────────────────┐
                 │     ResumeDocument (JSON)      │
                 │    (Single Source of Truth)    │
                 └───────────────┬────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│     ANALYZER     │   │    AI ENGINE     │   │     BUILDER      │
│  • Section Scores│   │  • Rewrites      │   │  • Visual Editor │
│  • ATS Checks    │   │  • Fact Lock     │   │  • LaTeX Output  │
│  • JD Matching   │   │  • Suggestions   │   │  • PDF Export    │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 14. Resume Copilot — Future Phase 8 Extension

The Resume Copilot acts as an intelligent natural-language assistant operating directly on the `ResumeDocument` model:

* *"Make my experience section stronger."*
* *"Why is my overall score at 68?"*
* *"Tailor this resume for a Senior Backend Engineer role at Stripe."*
* *"Add my new Open-Source GraphQL project."*
* *"Condense this resume into a strict 1-page format."*
* *"Make my technical bullet points sound more authoritative."*

---

## 15. Proposed Phase 8 — Resume Studio Feature Matrix

| Module | Technical Deliverable | Primary Objective |
| :--- | :--- | :--- |
| **8.1** | `ResumeDocument` Model | Canonical structured schema with versioning & migration. |
| **8.2** | Section Scoring Engine | Independent 0–100 diagnostic score contract per section. |
| **8.3** | Section AI Editor | Contextual inline AI improvements inside each section. |
| **8.4** | Evidence & Fact Lock | Strict validation blocking fabricated metrics or hallucinations. |
| **8.5** | Visual Resume Builder | Interactive visual drag-and-drop / structured editing UI. |
| **8.6** | LaTeX Rendering Engine | Headless LaTeX compiler container yielding publication-quality PDFs. |
| **8.7** | ATS-Safe Templates | Parser-certified templates with zero graphic parsing traps. |
| **8.8** | AI Rewrite + Re-Score | Live before-and-after diffs with verified score delta proofs. |
| **8.9** | JD Tailoring | One-click role specialization generator from Master Resume. |
| **8.10**| PDF Export | Instant, crisp vector PDF downloads. |
| **8.11**| Master Resume Store | Unified background vault driving multiple variant resumes. |
| **8.12**| Resume Copilot | Natural-language conversational interface over the full pipeline. |

---

## 16. What Should Be Removed From Primary Candidate UI

To maximize user conversion and eliminate friction, remove internal engineering jargon:
* ❌ *"3 Independent Pillars"* as a top-level candidate concept.
* ❌ *"Deterministic AI Scoring"* technical labels.
* ❌ Long, intimidating Phase 6 recommendation stacks.
* ❌ Separate fragmented analyzer widgets for minor metrics.
* ❌ Repeated generic "Optimize" buttons lacking clear context.
* ❌ Internal sprint / phase numbers (`Phase 1` through `Phase 7`).
* ❌ Lengthy theoretical copy before the candidate can take action.

*(All deep telemetry remains available under an optional **"Advanced Diagnostics"** or **"Why this score?"** expander).*

---

## 17. The Target Candidate UI Experience

```text
RESUME STUDIO
Full-Stack Engineer Resume

82 / 100 — Good foundation, needs optimization

Contact      100  ✓
Summary       84  ✓
Skills        76  ■
Experience    61  ■  (Needs Attention)
Projects      73  ■
Education     96  ✓
Achievements  68  ■

Biggest Opportunity: Experience
[ Improve Experience Section → ]

[ Preview Resume ]   [ Tailor to Job ]   [ Download PDF ]
```

---

## 18. Recommended Implementation Order

| Priority | Feature / Module | Architectural Rationale |
| :---: | :--- | :--- |
| **P0** | `ResumeDocument` schema + parser migration | Absolute prerequisite for structured editing & storage. |
| **P0** | Section scoring APIs + unified contract | Replaces fragmented diagnostic endpoints with clean section contracts. |
| **P0** | Section Editor UI | Delivers immediate, tangible value to candidate editing workflow. |
| **P0** | Evidence / Fact Guardrails | Guarantees ethical AI and prevents fabricated career claims. |
| **P1** | AI rewrite + accept/reject + version history | Closes the core interactive optimization loop. |
| **P1** | Simplified Resume Studio Dashboard | Replaces complex diagnostic cards with streamlined workflow. |
| **P1** | Master Resume storage | Enables candidate profile persistence and variants. |
| **P1** | JD Tailoring | Utilizes existing matching intelligence for targeted exports. |
| **P2** | Visual Resume Builder | Provides visual document previewing and layout adjustments. |
| **P2** | LaTeX renderer + ATS templates | Generates production-ready, beautiful vector PDFs. |
| **P3** | Resume Copilot | Adds conversational workflow control over the entire system. |

---

## 19. Final Product Principle
> **Do not build a smarter dashboard. Build a smarter resume workflow.**

The 7 existing AI phases provide an industry-leading intelligence foundation. The next evolutionary step is packaging that intelligence into an effortless user journey: **section scores**, **transparent explanations**, **evidence-backed rewrites**, **visible score gains**, a **master resume**, **job-specific tailoring**, and **flawless LaTeX PDF output**.

---

## Appendix — Product Language Dictionary

| Internal / Engineering Term (Avoid) | Candidate-Facing Term (Prefer) |
| :--- | :--- |
| *Deterministic AI Scoring* | **Resume Score / Section Score** |
| *3 Independent Pillars* | **Resume Health** |
| *Optimize This Target* | **Improve This Section** |
| *Action Layer* | **Recommended Improvements** |
| *Evidence Analyzer* | **Why This Needs Improvement** |
| *Content Score* | **Content Quality** |
| *AI Recommendation Orchestrator* | **Top Improvements** |
| *Phase 7 Optimization* | **Improve + Re-Score** |
