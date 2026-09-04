import { Router } from "express";
import { EmployabilityController } from "./employability.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = new EmployabilityController();

router.use(requireAuth);

router.get("/employability", asyncHandler(controller.getEmployabilityIndex));
router.get("/gps", asyncHandler(controller.getCareerGps));

export const careerPlanRoutes = router;
