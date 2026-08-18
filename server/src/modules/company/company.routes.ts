import { Router } from "express";
import { CompanyController } from "./company.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { asyncHandler } from "@/core/utils/asyncHandler";
import {
  createCompanyValidator,
  updateCompanyValidator,
  companyIdParamsSchema,
} from "./company.validator";

import { companyMembersSubRouter } from "@/modules/company-member";

const router = Router();
const controller = new CompanyController();

router.use("/:companyId/members", companyMembersSubRouter);

router.post(
  "/",
  requireAuth,
  validate({ body: createCompanyValidator }),
  asyncHandler(controller.createCompany)
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(controller.getMyCompanies)
);

router.get(
  "/:companyId",
  validate({ params: companyIdParamsSchema }),
  asyncHandler(controller.getCompany)
);

router.patch(
  "/:companyId",
  requireAuth,
  validate({ params: companyIdParamsSchema, body: updateCompanyValidator }),
  asyncHandler(controller.updateCompany)
);

export default router;
