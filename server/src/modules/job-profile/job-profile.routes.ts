import { Router } from "express";
import { jobProfileController } from "./job-profile.controller";
import { jobMatchController } from "@/modules/job-match/job-match.controller";
import { tailoringPlanController } from "@/modules/job-tailoring/tailoring-plan.controller";
import { tailoredResumeController } from "@/modules/job-tailoring/tailored-resume.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.post("/analyze", asyncHandler(jobProfileController.createAndAnalyze));
router.post("/:id/analyze", asyncHandler(jobProfileController.reanalyze));
router.post("/:id/match", asyncHandler(jobMatchController.runMatch));
router.get("/:id/match", asyncHandler(jobMatchController.getMatch));
router.post("/:id/tailoring-plan", asyncHandler(tailoringPlanController.createOrGetPlan));
router.get("/:id/tailoring-plan", asyncHandler(tailoringPlanController.getPlan));
router.post("/:id/tailoring-plan/batch-decisions", asyncHandler(tailoringPlanController.batchUpdateDecisions));
router.patch("/:id/tailoring-plan/proposals/batch", asyncHandler(tailoringPlanController.batchUpdateDecisions));
router.post("/:id/tailoring-plan/proposals/batch", asyncHandler(tailoringPlanController.batchUpdateDecisions));
router.patch("/:id/tailoring-plan/proposals/:proposalId", asyncHandler(tailoringPlanController.updateProposalDecision));
router.post("/:id/tailoring-plan/regenerate", asyncHandler(tailoringPlanController.regeneratePlan));
router.post("/:id/tailoring-plan/generate", asyncHandler(tailoredResumeController.generateTailoredResume));
router.get("/:id/tailored-resume", asyncHandler(tailoredResumeController.getTailoredResume));
router.get("/:id", asyncHandler(jobProfileController.getJobProfile));
router.get("/", asyncHandler(jobProfileController.listJobProfiles));

export { router as jobProfileRouter };
