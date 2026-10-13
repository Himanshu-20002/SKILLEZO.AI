import { z } from "zod";
import { TokenFeature } from "@/database/models/TokenUsageLog.model";

export const GetUsageQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

export type GetUsageQuery = z.infer<typeof GetUsageQuerySchema>;

export const CheckQuotaSchema = z.object({
  feature: z.nativeEnum(TokenFeature),
  customCost: z.number().int().min(1).optional(),
});

export type CheckQuotaInput = z.infer<typeof CheckQuotaSchema>;

export const DeductTokensSchema = z.object({
  feature: z.nativeEnum(TokenFeature),
  amount: z.number().int().min(1).optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type DeductTokensInput = z.infer<typeof DeductTokensSchema>;
