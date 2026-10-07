# Resume Studio — UI Subsystem & Component Guide

The **Resume Studio** is the flagship workspace of SKILLEZO.AI located at `/resume-studio`. It is architected around a reactive 3-zone desktop layout with responsive mobile tab navigation.

---

## 🏗️ 3-Zone Workspace Architecture

```
+-----------------------------------------------------------------------------------+
| Topbar: Variant Badge | Diff Toggle | Tailoring Insights | ATS Score | Export PDF |
+-----------------------+-----------------------------+-----------------------------+
| ZONE 1: Left Pane     | ZONE 2: Center Canvas       | ZONE 3: Right Inspector     |
| [Section Navigator]   | [Interactive Live Canvas]   | [ATS Diagnostics & Insights]|
| - Master Profile Data | - Real-time Rendered Paper  | - Deterministic Pillar Score|
| - Impact Bullet Editor| - Drag-and-drop Sections    | - AI Coach Chat & Actions   |
| - Evidence Lock UI    | - In-place Inline Editing   | - Keyword & Gap Analysis    |
+-----------------------+-----------------------------+-----------------------------+
```

---

## 📑 Detailed Documentation Index

| Doc | Subject | Corresponding Source Files |
| :--- | :--- | :--- |
| [`00_STUDIO_ARCHITECTURE.md`](./00_STUDIO_ARCHITECTURE.md) | High-level Studio UX & Data Contracts | `client/hooks/useResumeStudio.ts`, `types/resume.ts` |
| [`01_RESUME_INGESTION_UI.md`](./01_RESUME_INGESTION_UI.md) | PDF / DOCX Drag-and-drop Gateway | `client/components/resume-studio/ResumeStudioUploadGateway.tsx` |
| [`02_CAREER_PROFILE_FOUNDATION_UI.md`](./02_CAREER_PROFILE_FOUNDATION_UI.md) | Master Profile sync & field mapping | `client/components/dashboard/profile/` |
| [`03_SECTION_ENGINE_COMPONENTS.md`](./03_SECTION_ENGINE_COMPONENTS.md) | Individual Section Editors & Modals | `client/components/resume-studio/ResumeEditorPanel.tsx` |
| [`04_MASTER_RESUME_GENERATION_UI.md`](./04_MASTER_RESUME_GENERATION_UI.md) | Generation state, loading skeletons | `client/app/resume-studio/page.tsx` |
| [`05_STUDIO_UX_3ZONE_ARCHITECTURE.md`](./05_STUDIO_UX_3ZONE_ARCHITECTURE.md) | 3-Zone Workspace layout & mobile tabs | `client/components/resume-studio/ResumeStudioWorkspace.tsx` |
| [`06_AI_EDITOR_EVIDENCE_LOCK.md`](./06_AI_EDITOR_EVIDENCE_LOCK.md) | Evidence verification & tamper-proofing | `client/components/resume-studio/SectionAiWorkspace.tsx` |
| [`07_PORTFOLIO_AND_VARIANTS.md`](./07_PORTFOLIO_AND_VARIANTS.md) | Master vs Tailored Variants switcher | `client/components/resume-studio/ResumeVariantSwitcher.tsx` |
| [`08_STUDIO_UX_TRANSFORMATION.md`](./08_STUDIO_UX_TRANSFORMATION.md) | Responsive transformations & polish | `client/components/resume-studio/ResumeStudioSidebar.tsx` |
| [`09_VISUAL_RENDERER_AND_PREVIEW.md`](./09_VISUAL_RENDERER_AND_PREVIEW.md) | Live Resume Paper Visual Renderer | `client/components/resume-studio/renderer/` |
| [`10_RESUME_BUILDER_TEMPLATES.md`](./10_RESUME_BUILDER_TEMPLATES.md) | ATS-friendly themes, fonts, styling | `client/components/resume-studio/builder/` |
| [`11_RESUME_DIFF_ENGINE_UI.md`](./11_RESUME_DIFF_ENGINE_UI.md) | Visual diffing of tailored bullet points | `client/components/resume-studio/comparison/ResumeUnifiedDiffView.tsx` |
| [`12_VARIANT_SWITCHER_INTEGRATION.md`](./12_VARIANT_SWITCHER_INTEGRATION.md) | Seamless switching between job variants | `client/components/resume-studio/ResumeVariantBadge.tsx` |
| [`13_TAILORING_INSIGHTS_MODAL.md`](./13_TAILORING_INSIGHTS_MODAL.md) | ATS delta breakdown & keyword matches | `client/components/resume-studio/tailoring-insights/` |
| [`14_RESUME_COMPARISON_DIALOG.md`](./14_RESUME_COMPARISON_DIALOG.md) | Side-by-side & unified diff modal | `client/components/resume-studio/comparison/ResumeComparisonDialog.tsx` |
| [`15_APPLICATION_WORKFLOW_STUDIO.md`](./15_APPLICATION_WORKFLOW_STUDIO.md) | Direct application trigger from Studio | `client/components/resume-studio/CreateApplicationModal.tsx` |
