import { Router } from "express";
import { ApplicationController } from "./application.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import {
  createApplicationValidator,
  applicationIdParamValidator,
  getApplicationsQueryValidator,
  withdrawApplicationValidator,
} from "./application.validator";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = new ApplicationController();

router.use(requireAuth);

router.post(
  "/",
  validate({ body: createApplicationValidator }),
  asyncHandler(controller.applyToJob)
);

router.get(
  "/",
  validate({ query: getApplicationsQueryValidator }),
  asyncHandler(controller.getMyApplications)
);

// Fetch array of applied job IDs for current user (must be before /:applicationId parameter route)
router.get(
  "/my-job-ids",
  asyncHandler(controller.getAppliedJobIds)
);

router.get(
  "/:applicationId",
  validate({ params: applicationIdParamValidator }),
  asyncHandler(controller.getMyApplication)
);

router.get(
  "/:applicationId/status-history",
  validate({ params: applicationIdParamValidator }),
  asyncHandler(controller.getApplicationStatusHistory)
);

router.patch(
  "/:applicationId/withdraw",
  validate({ params: applicationIdParamValidator, body: withdrawApplicationValidator }),
  asyncHandler(controller.withdrawApplication)
);

export default router;
