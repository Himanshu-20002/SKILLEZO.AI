import { z } from "zod";

export const GetActiveResumeInputSchema = z
  .object({
    resumeId: z.string().trim().min(1).optional(),
  })
  .strict();

export type GetActiveResumeInput = z.infer<typeof GetActiveResumeInputSchema>;

export const GetActiveResumeOutputSchema = z.object({
  resumeId: z.string(),
  title: z.string(),
  isDefault: z.boolean(),
  atsScore: z.number().nullable().optional(),
  extractedSkills: z.array(z.string()),
  originalFileName: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type GetActiveResumeOutput = z.infer<typeof GetActiveResumeOutputSchema>;

export const GetResumeIntelligenceInputSchema = z
  .object({
    resumeId: z.string().trim().min(1).optional(),
    targetRole: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export type GetResumeIntelligenceInput = z.infer<typeof GetResumeIntelligenceInputSchema>;

export const ATSScoreBreakdownSchema = z.object({
  keywordMatch: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  brevity: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  readability: z.number().min(0).max(100),
});

export const GetResumeIntelligenceOutputSchema = z.object({
  resumeId: z.string(),
  targetRole: z.string(),
  overallScore: z.number().min(0).max(100),
  breakdown: ATSScoreBreakdownSchema,
  auditPillars: z.record(z.string(), z.unknown()).optional(),
  recommendations: z.array(z.string()),
  extractedSkillsCount: z.number(),
});

export type GetResumeIntelligenceOutput = z.infer<typeof GetResumeIntelligenceOutputSchema>;
