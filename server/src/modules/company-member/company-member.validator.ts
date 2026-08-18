import { z } from "zod";
import { objectIdSchema, userIdSchema } from "@/core/validators/common.validators";
import { CompanyMemberRole, CompanyMemberStatus } from "@/core/constants/enums";

export const addCompanyMemberValidator = z.object({
  userId: userIdSchema,
  role: z.nativeEnum(CompanyMemberRole).optional(),
  status: z.nativeEnum(CompanyMemberStatus).optional(),
});

export const updateCompanyMemberRoleValidator = z.object({
  role: z.nativeEnum(CompanyMemberRole, {
    error: "Invalid company member role",
  }),
});

export const updateCompanyMemberStatusValidator = z.object({
  status: z.nativeEnum(CompanyMemberStatus, {
    error: "Invalid company member status",
  }),
});

export const companyIdParamSchema = z.object({
  companyId: objectIdSchema,
});

export const companyMemberParamsSchema = z.object({
  companyId: objectIdSchema,
  memberId: objectIdSchema,
});
