import { Router } from "express";
import { JobIngestionController } from "./job-ingestion.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { asyncHandler } from "@/core/utils/asyncHandler";
import { ingestJobsValidator } from "./job-ingestion.validator";

const router = Router();
const controller = new JobIngestionController();

router.post(
  "/search",
  requireAuth,
  validate({ body: ingestJobsValidator }),
  asyncHandler(controller.ingestJobs)
);

export default router;
