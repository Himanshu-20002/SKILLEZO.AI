import { Router } from "express";
import { SkillGapController } from "./skill-gap.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = new SkillGapController();

router.use(requireAuth);

router.get("/me", asyncHandler(controller.getMySkillGap));
router.get("/roles", asyncHandler(controller.getAvailableRoles));

export const skillGapRoutes = router;
