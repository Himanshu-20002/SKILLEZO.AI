import { z } from "zod";

export const OptimizationChangeSchema = z.object({
  type: z.enum([
    "CLARITY",
    "SPECIFICITY",
    "TECHNICAL_DEPTH",
    "IMPACT",
    "KEYWORD_ALIGNMENT",
    "GRAMMAR",
    "REDUNDANCY",
  ]),
  description: z.string().min(1).max(300),
});

export const AIOptimizationProposalSchema = z.object({
  proposalId: z.string().default(() => `prop_${Math.random().toString(36).substring(2, 8)}`),
  recommendationId: z.string(),
  originalText: z.string().min(1),
  optimizedText: z.string().min(1).max(500),
  changes: z.array(OptimizationChangeSchema).default([]),
  preservedEvidenceIds: z.array(z.string()).default([]),
  addedClaims: z.array(z.string()).default([]),
  removedClaims: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.95),
});
