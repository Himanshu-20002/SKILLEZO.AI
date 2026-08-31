import { Router } from "express";
import { JobsController } from "./jobs.controller";
import { validate } from "@/core/middleware/validate.middleware";
import { jobSearchQueryValidator, jobParamsValidator } from "./jobs.validator";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = new JobsController();

router.get(
  "/",
  validate({ query: jobSearchQueryValidator }),
  asyncHandler(controller.searchJobs)
);

router.get(
  "/:jobId",
  validate({ params: jobParamsValidator }),
  asyncHandler(controller.getJobById)
);

router.get(
  "/:jobId/redirect",
  validate({ params: jobParamsValidator }),
  asyncHandler(controller.redirectToSource)
);

export default router;
