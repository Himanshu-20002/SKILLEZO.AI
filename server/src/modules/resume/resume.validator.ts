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

export const updateResumeValidator = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const resumeIdParamValidator = z.object({
  resumeId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});
