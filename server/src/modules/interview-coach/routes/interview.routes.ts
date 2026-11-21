import { Router } from "express";
import { InterviewController } from "../controllers/interview.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import {
  sessionParamSchema,
  listSessionsQuerySchema,
  createSessionInputSchema,
  submitAnswerSchema,
} from "../validation/interview.schemas";

const router: Router = Router();

// Module health status
router.get("/health", InterviewController.getHealth);

// Dynamic candidate quotas & pricing config
router.get("/config", InterviewController.getConfig);

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

// --- Phase 3: Interactive Interview Arena Endpoints ---

// Start or resume an active session
router.post(
  "/sessions/:sessionId/start",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.startOrResumeSession
);

// Submit candidate answer for a question
router.post(
  "/sessions/:sessionId/answers",
  requireAuth,
  validate({ params: sessionParamSchema, body: submitAnswerSchema }),
  InterviewController.submitAnswer
);

// Retrieve all answers for a session
router.get(
  "/sessions/:sessionId/answers",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.getSessionAnswers
);

// Explicitly complete an interview session
router.post(
  "/sessions/:sessionId/complete",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.completeSession
);

// --- Phase 4: AI Evaluation & Scoring Engine Endpoints ---

// Evaluate session answers, compute scores, and generate readiness report
router.post(
  "/sessions/:sessionId/evaluate",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.evaluateSession
);

// Retrieve question-by-question evaluations
router.get(
  "/sessions/:sessionId/evaluations",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.getSessionEvaluations
);

// Retrieve final readiness report
router.get(
  "/sessions/:sessionId/report",
  requireAuth,
  validate({ params: sessionParamSchema }),
  InterviewController.getSessionReport
);

export { router as interviewRouter };
