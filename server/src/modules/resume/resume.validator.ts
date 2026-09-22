import { z } from "zod";

export const uploadResumeValidator = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  isDefault: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val === "true";
      return val;
    }),
});

export const createVariantValidator = z
  .object({
    displayName: z.string().trim().min(1, "Resume name is required").max(100),
    targetJobTitle: z.string().trim().max(100).optional().nullable(),
    targetCompany: z.string().trim().max(100).optional().nullable(),
    targetJobId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
      .optional()
      .nullable(),
  })
  .strict();

export const updateResumeValidator = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    displayName: z.string().trim().min(1).max(100).optional(),
    isDefault: z.boolean().optional(),
    targetJobTitle: z.string().trim().max(100).optional().nullable(),
    targetCompany: z.string().trim().max(100).optional().nullable(),
  })
  .strict();

export const resumeIdParamValidator = z.object({
  resumeId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});
