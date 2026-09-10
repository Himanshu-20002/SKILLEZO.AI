import { z } from "zod";

export const AIRecommendationSchema = z.object({
  id: z.string(),
  category: z.enum(["ATS", "SKILLS", "EXPERIENCE", "IMPACT", "SUMMARY", "STRUCTURE", "GENERAL"]).default("GENERAL"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  title: z.string().min(1),
  problem: z.string().default(""),
  whyItMatters: z.string().default(""),
  recommendation: z.string().min(1),
  evidenceIds: z.array(z.string()).default([]),
  requiresUserInput: z.boolean().default(false),
  suggestedAction: z.string().optional(),
  impactScoreBoost: z.number().optional().default(4),
  potentialImpact: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
});

export const AIBulletRewriteSchema = z.object({
  original: z.string().default(""),
  rewritten: z.string().min(1),
  improvements: z.array(z.string()).default([]),
  preservedFacts: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
  powerVerbs: z.array(z.string()).default([]),
  requiresUserVerification: z.boolean().default(true),
});

export const AIMissingSkillSchema = z.object({
  skill: z.string().min(1),
  category: z.string().default("General"),
  priority: z.enum(["High", "Medium"]).default("Medium"),
  impactLevel: z.enum(["High", "Medium"]).default("Medium"),
  recommendation: z.string().default(""),
});

export const AIAnalysisOutputSchema = z.object({
  engineVersion: z.string().default("1.0.0"),
  targetRole: z.string().default("Full-Stack Engineer"),
  targetRoleFitScore: z.number().min(0).max(100).default(80),
  executiveSummaryCritique: z.string().default(""),
  recommendations: z.array(AIRecommendationSchema).default([]),
  bulletCritiques: z.array(AIBulletRewriteSchema).default([]),
  missingSkillsNiche: z.array(AIMissingSkillSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
});
