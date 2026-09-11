/**
 * SKILLEZO RESUME STUDIO — PHASE 3 DETERMINISTIC SCORING
 * Runtime Zod Validation Schemas
 */

import { z } from "zod";
import { SectionIdSchema, SectionStatusSchema } from "../sections/section.schema";

export const ScoreRatingTierSchema = z.enum([
  "Excellent",
  "Strong",
  "Good",
  "Developing",
  "Needs Work",
]);

export const ScoreComponentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  score: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  rule: z.string().min(1),
  reason: z.string().min(1),
  evidenceIds: z.array(z.string()).default([]),
});

export const SectionScoreSchema = z.object({
  sectionId: SectionIdSchema,
  title: z.string().min(1),
  score: z.number().min(0).max(100),
  maxScore: z.literal(100),
  weight: z.number().min(0).max(1),
  weightedScore: z.number().min(0).max(100),
  status: SectionStatusSchema,
  tier: ScoreRatingTierSchema,
  components: z.array(ScoreComponentSchema),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  deductions: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
});

export const OverallScoreBreakdownSchema = z.object({
  overallScore: z.number().min(0).max(100),
  maxScore: z.literal(100),
  tier: ScoreRatingTierSchema,
  summaryReason: z.string().min(1),
  totalStrengthsCount: z.number().min(0),
  totalWeaknessesCount: z.number().min(0),
  totalDeductionsCount: z.number().min(0),
  sectionWeights: z.record(z.string(), z.number()),
});

export const ResumeScoreResultSchema = z.object({
  scoreId: z.string().min(1),
  resumeId: z.string().min(1),
  engineVersion: z.literal("resume-score-v1"),
  calculatedAt: z.string(),
  overall: OverallScoreBreakdownSchema,
  sections: z.object({
    contact: SectionScoreSchema,
    summary: SectionScoreSchema,
    skills: SectionScoreSchema,
    experience: SectionScoreSchema,
    projects: SectionScoreSchema,
    education: SectionScoreSchema,
    achievements: SectionScoreSchema,
  }),
});
