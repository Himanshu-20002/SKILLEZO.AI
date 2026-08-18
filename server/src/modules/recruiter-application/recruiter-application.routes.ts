import { Router } from "express";
import { RecruiterApplicationController } from "./recruiter-application.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import {
  getRecruiterApplicationsQueryValidator,
  recruiterApplicationIdParamValidator,
  updateRecruiterApplicationStatusValidator,
} from "./recruiter-application.validator";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = new RecruiterApplicationController();

router.use(requireAuth);

router.get(
  "/",
  validate({ query: getRecruiterApplicationsQueryValidator }),
  asyncHandler(controller.getCompanyApplications)
);

router.get(
  "/:applicationId",
  validate({ params: recruiterApplicationIdParamValidator }),
  asyncHandler(controller.getCompanyApplicationDetails)
);

router.get(
  "/:applicationId/status-history",
  validate({ params: recruiterApplicationIdParamValidator }),
  asyncHandler(controller.getApplicationStatusHistory)
);

router.get(
  "/:applicationId/resume",
  validate({ params: recruiterApplicationIdParamValidator }),
  asyncHandler(controller.streamApplicationResume)
);

router.patch(
  "/:applicationId/status",
  validate({
    params: recruiterApplicationIdParamValidator,
    body: updateRecruiterApplicationStatusValidator,
  }),
  asyncHandler(controller.updateApplicationStatus)
);

export default router;
