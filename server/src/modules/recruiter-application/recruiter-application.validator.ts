import { z } from "zod";
import { ApplicationStatus } from "@/core/constants/enums";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const getRecruiterApplicationsQueryValidator = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(50)),
  jobId: z.string().trim().regex(objectIdRegex, "Invalid jobId ObjectId format").optional(),
  status: z
    .enum(Object.values(ApplicationStatus) as [string, ...string[]])
    .optional(),
  search: z.string().trim().optional(),
});

export const recruiterApplicationIdParamValidator = z.object({
  applicationId: z.string().trim().regex(objectIdRegex, "Invalid applicationId ObjectId format"),
});

export const updateRecruiterApplicationStatusValidator = z.object({
  status: z.enum([
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.OFFERED,
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
  ] as [string, ...string[]]),
  reason: z.string().trim().max(500).optional(),
});
