import { Router } from "express";
import { CompanyMemberController } from "./company-member.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { asyncHandler } from "@/core/utils/asyncHandler";
import {
  addCompanyMemberValidator,
  updateCompanyMemberRoleValidator,
  updateCompanyMemberStatusValidator,
  companyIdParamSchema,
  companyMemberParamsSchema,
} from "./company-member.validator";

const controller = new CompanyMemberController();

// Standalone router mounted at /api/company-members
export const companyMemberRouter = Router();

companyMemberRouter.get(
  "/me",
  requireAuth,
  asyncHandler(controller.getMyMemberships)
);

// Nested router mounted at /api/companies/:companyId/members
export const companyMembersSubRouter = Router({ mergeParams: true });

companyMembersSubRouter.get(
  "/",
  requireAuth,
  validate({ params: companyIdParamSchema }),
  asyncHandler(controller.getCompanyMembers)
);

companyMembersSubRouter.post(
  "/",
  requireAuth,
  validate({ params: companyIdParamSchema, body: addCompanyMemberValidator }),
  asyncHandler(controller.addMember)
);

companyMembersSubRouter.get(
  "/:memberId",
  requireAuth,
  validate({ params: companyMemberParamsSchema }),
  asyncHandler(controller.getCompanyMemberById)
);

companyMembersSubRouter.patch(
  "/:memberId/role",
  requireAuth,
  validate({ params: companyMemberParamsSchema, body: updateCompanyMemberRoleValidator }),
  asyncHandler(controller.updateMemberRole)
);

companyMembersSubRouter.patch(
  "/:memberId/status",
  requireAuth,
  validate({ params: companyMemberParamsSchema, body: updateCompanyMemberStatusValidator }),
  asyncHandler(controller.updateMemberStatus)
);

companyMembersSubRouter.delete(
  "/:memberId",
  requireAuth,
  validate({ params: companyMemberParamsSchema }),
  asyncHandler(controller.removeMember)
);

export default companyMemberRouter;
