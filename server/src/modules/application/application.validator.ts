import { z } from "zod";
import { ApplicationStatus } from "@/core/constants/enums";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createApplicationValidator = z.object({
  jobId: z.string().trim().regex(objectIdRegex, "Invalid jobId ObjectId format"),
  resumeId: z.string().trim().regex(objectIdRegex, "Invalid resumeId ObjectId format").optional(),
});

export const applicationIdParamValidator = z.object({
  applicationId: z.string().trim().regex(objectIdRegex, "Invalid applicationId ObjectId format"),
});

export const getApplicationsQueryValidator = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(100))
    .optional(),
  status: z
    .enum(Object.values(ApplicationStatus) as [string, ...string[]])
    .optional(),
});

export const withdrawApplicationValidator = z.object({
  reason: z.string().trim().max(500).optional(),
}).default({});
