import { Router } from "express";
import { ApplicationController } from "./application.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import {
  createApplicationValidator,
  createJobProfileApplicationValidator,
  updateApplicationStatusValidator,
  addTimelineNoteValidator,
  applicationIdParamValidator,
  getApplicationsQueryValidator,
  withdrawApplicationValidator,
} from "./application.validator";
import { asyncHandler } from "@/core/utils/asyncHandler";
import { z } from "zod";

const router = Router();
const controller = new ApplicationController();

router.use(requireAuth);

// Polymorphic validator for POST /: supports either Phase 6F jobProfileId or legacy recruiter jobId
const unifiedCreateApplicationValidator = z.union([
  createJobProfileApplicationValidator,
  createApplicationValidator,
]);

router.post(
  "/",
  validate({ body: unifiedCreateApplicationValidator }),
  asyncHandler(controller.createApplication)
);

router.post(
  "/job-profile",
  validate({ body: createJobProfileApplicationValidator }),
  asyncHandler(controller.applyToJobProfile)
);

router.get(
  "/",
  validate({ query: getApplicationsQueryValidator }),
  asyncHandler(controller.getMyApplications)
);

// Fetch array of applied job IDs for current user (must precede /:applicationId route)
router.get(
  "/my-job-ids",
  asyncHandler(controller.getAppliedJobIds)
);

router.get(
  "/:applicationId",
  validate({ params: applicationIdParamValidator }),
  asyncHandler(controller.getMyApplication)
);

router.patch(
  "/:applicationId/status",
  validate({ params: applicationIdParamValidator, body: updateApplicationStatusValidator }),
  asyncHandler(controller.updateApplicationStatus)
);

router.post(
  "/:applicationId/timeline",
  validate({ params: applicationIdParamValidator, body: addTimelineNoteValidator }),
  asyncHandler(controller.addTimelineNote)
);

router.delete(
  "/:applicationId",
  validate({ params: applicationIdParamValidator }),
  asyncHandler(controller.deleteApplication)
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
