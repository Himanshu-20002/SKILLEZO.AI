/**
 * SKILLEZO RESUME STUDIO — PHASE 5 SECTION AI EDITOR
 * Zod Validation Schemas for AI Outputs and Mutation Requests
 */

import { z } from "zod";

export const SectionChangeItemSchema = z.object({
  field: z.string().min(1),
  before: z.string(),
  after: z.string(),
  reason: z.string().min(1),
});

export const SectionImprovementSuggestionSchema = z.object({
  suggestionId: z.string().min(1),
  sectionId: z.enum([
    "contact",
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "achievements",
  ]),
  original: z.any(),
  proposed: z.any(),
  changes: z.array(SectionChangeItemSchema),
  evidenceUsed: z.array(z.string()),
  unsupportedClaims: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  generatedAt: z.string(),
  baseDocumentVersion: z.number().int().nonnegative(),
});

export const ImprovementRequestPayloadSchema = z.object({
  userInstruction: z.string().max(500).optional(),
});

export const ApplyImprovementPayloadSchema = z.object({
  suggestionId: z.string().min(1),
  proposed: z.any(),
  baseDocumentVersion: z.number().int().nonnegative(),
});
