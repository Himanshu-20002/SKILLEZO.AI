import { z } from "zod";
import { UserRole, AccountStatus, JobStatus, JobSourceType } from "@/core/constants/enums";

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum([UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN]).optional(),
  status: z.enum([AccountStatus.ACTIVE, AccountStatus.SUSPENDED, AccountStatus.DEACTIVATED]).optional(),
});

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum([UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN]),
});

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;

export const updateUserStatusSchema = z.object({
  status: z.enum([AccountStatus.ACTIVE, AccountStatus.SUSPENDED, AccountStatus.DEACTIVATED]),
});

export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;

export const adminJobQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum([JobStatus.DRAFT, JobStatus.ACTIVE, JobStatus.CLOSED, JobStatus.ARCHIVED]).optional(),
  source: z.enum([JobSourceType.PLATFORM, JobSourceType.EXTERNAL]).optional(),
});

export type AdminJobQuery = z.infer<typeof adminJobQuerySchema>;

export const updateJobStatusSchema = z.object({
  status: z.enum([JobStatus.DRAFT, JobStatus.ACTIVE, JobStatus.CLOSED, JobStatus.ARCHIVED]),
});

export type UpdateJobStatusDto = z.infer<typeof updateJobStatusSchema>;

export const adminResumeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type AdminResumeQuery = z.infer<typeof adminResumeQuerySchema>;
