import { Router } from "express";
import { planController } from "./plan.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();

// Public pricing info
router.get("/pricing", asyncHandler(planController.getPricing));

// Authenticated plan & token routes
router.use(requireAuth);

router.get("/status", asyncHandler(planController.getPlanStatus));
router.get("/usage", asyncHandler(planController.getUsageHistory));
router.post("/check-quota", asyncHandler(planController.checkQuota));

export const planRouter = router;
