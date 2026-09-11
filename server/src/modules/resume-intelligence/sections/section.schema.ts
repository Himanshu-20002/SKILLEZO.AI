import { z } from "zod";

export const SectionIdSchema = z.enum([
  "contact",
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "achievements",
]);

export const SectionStatusSchema = z.enum(["COMPLETE", "PARTIAL", "MISSING", "INVALID"]);

export const BaseSectionAnalysisSchema = z.object({
  sectionId: SectionIdSchema,
  title: z.string().min(1),
  status: SectionStatusSchema,
  completeness: z.number().min(0).max(1),
  itemCount: z.number().min(0),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missing: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  signals: z.record(z.string(), z.any()),
});

export const SectionAnalysisSummaryStatsSchema = z.object({
  totalSectionsAnalyzed: z.number().min(0),
  completeSectionsCount: z.number().min(0),
  partialSectionsCount: z.number().min(0),
  missingSectionsCount: z.number().min(0),
  invalidSectionsCount: z.number().min(0),
  overallCompletenessAverage: z.number().min(0).max(1),
  totalStrengthsCount: z.number().min(0),
  totalWeaknessesCount: z.number().min(0),
  totalMissingFieldsCount: z.number().min(0),
  totalWarningsCount: z.number().min(0),
  totalEvidenceTracked: z.number().min(0),
});

export const ResumeSectionAnalysisResultSchema = z.object({
  resumeId: z.string().min(1),
  analyzedAt: z.string(),
  engineVersion: z.string().min(1),
  sections: z.object({
    contact: BaseSectionAnalysisSchema,
    summary: BaseSectionAnalysisSchema,
    skills: BaseSectionAnalysisSchema,
    experience: BaseSectionAnalysisSchema,
    projects: BaseSectionAnalysisSchema,
    education: BaseSectionAnalysisSchema,
    achievements: BaseSectionAnalysisSchema,
  }),
  summaryStats: SectionAnalysisSummaryStatsSchema,
});

export type ValidatedSectionAnalysisResult = z.infer<typeof ResumeSectionAnalysisResultSchema>;
