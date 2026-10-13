import { Router } from "express";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { careerCoachRateLimiter } from "./career-coach.rate-limiter";
import { CareerCoachRequestSchema } from "./career-coach.schemas";
import { careerCoachController } from "./career-coach.controller";
import { tokenGuard } from "@/modules/plan";
import { TokenFeature } from "@/database/models/TokenUsageLog.model";

const router = Router();

// Enforce authentication on all career coach endpoints
router.use(requireAuth);

// POST /api/ai/coach/chat (50 tokens per message)
router.post(
  "/chat",
  careerCoachRateLimiter,
  validate({ body: CareerCoachRequestSchema }),
  tokenGuard(TokenFeature.CAREER_COACH),
  careerCoachController.chat
);

export const careerCoachRouter = router;
