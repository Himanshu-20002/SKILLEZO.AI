import { Router } from "express";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { careerCoachRateLimiter } from "./career-coach.rate-limiter";
import { CareerCoachRequestSchema } from "./career-coach.schemas";
import { careerCoachController } from "./career-coach.controller";

const router = Router();

// Enforce authentication on all career coach endpoints
router.use(requireAuth);

// POST /api/ai/coach/chat
router.post(
  "/chat",
  careerCoachRateLimiter,
  validate({ body: CareerCoachRequestSchema }),
  careerCoachController.chat
);

export const careerCoachRouter = router;
