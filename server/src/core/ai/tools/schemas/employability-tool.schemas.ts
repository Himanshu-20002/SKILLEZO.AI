import { z } from "zod";

export const GetEmployabilityMetricsInputSchema = z
  .object({
    targetRole: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export type GetEmployabilityMetricsInput = z.infer<typeof GetEmployabilityMetricsInputSchema>;

export const EmployabilityDimensionsSchema = z.object({
  technicalReadiness: z.number().min(0).max(100),
  resumeStrength: z.number().min(0).max(100),
  projectStrength: z.number().min(0).max(100),
  skillAlignment: z.number().min(0).max(100),
  recruiterVisibility: z.number().min(0).max(100),
});

export const GetEmployabilityMetricsOutputSchema = z.object({
  targetRole: z.string(),
  overallScore: z.number().min(0).max(100),
  tierStatus: z.string(),
  targetTier: z.string(),
  metrics: EmployabilityDimensionsSchema,
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  careerGpsReady: z.boolean(),
  milestonesCount: z.number().min(0),
});

export type GetEmployabilityMetricsOutput = z.infer<typeof GetEmployabilityMetricsOutputSchema>;
