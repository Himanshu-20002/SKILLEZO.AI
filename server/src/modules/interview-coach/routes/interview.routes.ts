import { Router } from "express";
import { InterviewController } from "../controllers/interview.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import {
  sessionParamSchema,
  listSessionsQuerySchema,
  createSessionInputSchema,
} from "../validation/interview.schemas";

const router: Router = Router();

// Module health status (unauthenticated or consistent with existing API conventions)
router.get("/health", InterviewController.getHealth);

// Available interview role templates catalog
router.get("/templates", InterviewController.getTemplates);

// Candidate-protected session endpoints
router.get(
  "/sessions",
  requireAuth,
  validate({ query: listSessionsQuerySchema }),
  InterviewController.getSessions
);

router.post(
  "/sessions",
  requireAuth,
  validate({ body: createSessionInputSchema }),
  InterviewController.createSession
);

router.get(
  "/sessions/:sessionId",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.getSessionById
);

router.get(
  "/sessions/:sessionId/questions",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.getSessionQuestions
);

export { router as interviewRouter };
