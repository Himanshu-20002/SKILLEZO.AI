import { z } from "zod";

const pricingTierUpdateSchema = z.object({
  amountInRupees: z.number().min(0, "Price must be non-negative"),
  isActive: z.boolean().default(true),
  name: z.string().trim().min(1, "Name is required").optional(),
  description: z.string().trim().optional(),
});

export const updateMonetizationConfigSchema = z.object({
  pricing: z
    .object({
      sprintPass7Day: pricingTierUpdateSchema,
      proMonthly: pricingTierUpdateSchema,
      proYearly: pricingTierUpdateSchema,
    })
    .partial()
    .optional(),
  interviewQuotas: z
    .object({
      freeMonthlySessions: z.number().int().min(0).max(50),
      freeMaxQuestionsPerSession: z.number().int().min(1).max(20),
      freeMaxAnswerSeconds: z.number().int().min(30).max(600),
      lockModelAnswersForFree: z.boolean(),
      enableVoiceForFree: z.boolean(),
      enableVideoForFree: z.boolean(),
    })
    .partial()
    .optional(),
  resumeQuotas: z
    .object({
      freeMaxResumes: z.number().int().min(0).max(20),
      freeMonthlyAtsScans: z.number().int().min(0).max(50),
      lockDocxExportForFree: z.boolean(),
      lockCoverLetterAiForFree: z.boolean(),
      lockMultiJobTailoringForFree: z.boolean(),
    })
    .partial()
    .optional(),
  globalSettings: z
    .object({
      promoBannerActive: z.boolean(),
      promoBannerText: z.string().max(200),
    })
    .partial()
    .optional(),
});

export type UpdateMonetizationConfigInput = z.infer<
  typeof updateMonetizationConfigSchema
>;
