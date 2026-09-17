import { z } from "zod";
import { AIIntent } from "../intent/intent-types";

export const StructuredMetricSchema = z.object({
  name: z.string().describe("Identifier of the metric, e.g. atsScore, skillGapMatch, employabilityScore"),
  value: z.number().describe("Verified deterministic numeric score or percentage"),
  evidenceId: z.string().describe("ID of the verified evidence item supporting this score"),
  label: z.string().describe("Human readable title for the metric"),
});

export type StructuredMetricItem = z.infer<typeof StructuredMetricSchema>;

export const OrchestrationEvidenceItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  source: z.string(),
  summary: z.string(),
});

export type OrchestrationEvidenceItem = z.infer<typeof OrchestrationEvidenceItemSchema>;

export const OrchestrationInsightSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  evidenceIds: z.array(z.string()).default([]),
});

export type OrchestrationInsight = z.infer<typeof OrchestrationInsightSchema>;

export const OrchestrationRecommendationSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  evidenceIds: z.array(z.string()).optional(),
});

export type OrchestrationRecommendation = z.infer<typeof OrchestrationRecommendationSchema>;

export const AIOrchestrationResultSchema = z.object({
  intent: z.enum([
    "PROFILE_OVERVIEW",
    "RESUME_ANALYSIS",
    "RESUME_IMPROVEMENT",
    "SKILL_GAP_ANALYSIS",
    "EMPLOYABILITY_ANALYSIS",
    "JOB_MATCHING",
    "CAREER_READINESS",
    "CAREER_PLAN",
    "GENERAL_CAREER_GUIDANCE",
    "UNKNOWN",
  ]),
  answer: z.string().describe("Natural language reasoning explaining the verified metrics and recommendations"),
  metrics: z.array(StructuredMetricSchema).default([]),
  evidence: z.array(OrchestrationEvidenceItemSchema).default([]),
  insights: z.array(OrchestrationInsightSchema).default([]),
  recommendations: z.array(OrchestrationRecommendationSchema).default([]),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
  limitations: z.array(z.string()).default([]),
});

export type AIOrchestrationResult = z.infer<typeof AIOrchestrationResultSchema>;
