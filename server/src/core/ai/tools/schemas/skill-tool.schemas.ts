import { z } from "zod";

export const GetSkillGapsInputSchema = z
  .object({
    targetRole: z.string().trim().min(1).max(200),
  })
  .strict();

export type GetSkillGapsInput = z.infer<typeof GetSkillGapsInputSchema>;

export const SkillGapRecommendationSchema = z.object({
  skill: z.string(),
  currentLevel: z.string(),
  requiredLevel: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  reason: z.string(),
  suggestedAction: z.string(),
});

export const GetSkillGapsOutputSchema = z.object({
  targetRole: z.string(),
  overallMatchScore: z.number().min(0).max(100),
  skillsAcquiredCount: z.number().min(0),
  skillsRequiredCount: z.number().min(0),
  skillsMissingCount: z.number().min(0),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  priorityRecommendations: z.array(SkillGapRecommendationSchema),
});

export type GetSkillGapsOutput = z.infer<typeof GetSkillGapsOutputSchema>;
