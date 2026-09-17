import { z } from "zod";

export const ProposeCareerPlanInputSchema = z
  .object({
    targetRole: z.string().trim().min(1).max(200),
    focusAreas: z.array(z.string().trim().max(100)).max(5).optional(),
  })
  .strict();

export type ProposeCareerPlanInput = z.infer<typeof ProposeCareerPlanInputSchema>;

export const CareerPlanMilestoneProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  estimatedWeeks: z.number().min(1),
  targetSkills: z.array(z.string()),
});

export const ProposeCareerPlanOutputSchema = z.object({
  targetRole: z.string(),
  currentOverallScore: z.number().min(0).max(100),
  projectedTargetScore: z.number().min(0).max(100),
  estimatedDurationWeeks: z.number().min(1),
  milestones: z.array(CareerPlanMilestoneProposalSchema),
  disclaimer: z.string(),
  isProposal: z.literal(true),
});

export type ProposeCareerPlanOutput = z.infer<typeof ProposeCareerPlanOutputSchema>;
