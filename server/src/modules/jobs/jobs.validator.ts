import { z } from "zod";
import {
  JobSourceType,
  JobSourceProvider,
  JobEmploymentType,
  WorkplaceType,
} from "@/core/constants/enums";

export const jobSearchQueryValidator = z.object({
  keyword: z.string().trim().optional(),
  location: z.string().trim().optional(),
  sourceType: z.nativeEnum(JobSourceType).optional(),
  sourceProvider: z.nativeEnum(JobSourceProvider).optional(),
  employmentType: z.nativeEnum(JobEmploymentType).optional(),
  workplaceType: z.nativeEnum(WorkplaceType).optional(),
  companyId: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
});

export const jobParamsValidator = z.object({
  jobId: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});
