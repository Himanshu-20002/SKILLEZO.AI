import { Request, Response } from "express";
import { asyncHandler } from "@/core/utils/asyncHandler";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { interviewSessionService } from "../services/interview-session.service";
import { interviewTemplateService } from "../services/interview-template.service";
import { interviewEvaluationService } from "../services/interview-evaluation.service";
import {
  CreateSessionInput,
  SubmitAnswerInput,
} from "../validation/interview.schemas";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { getMonetizationConfig } from "@/database/models/MonetizationConfig.model";

export class InterviewController {
  /**
   * GET /api/interviews/health
   * Public/internal health check for the interview coach module
   */
  public static getHealth = asyncHandler(async (_req: Request, res: Response) => {
    const health = interviewSessionService.getHealth();
    res.status(HTTP_STATUS.OK).json(successResponse(health));
  });

  /**
   * GET /api/interviews/config
   * Public/candidate: Retrieve dynamic quotas, feature flags, and pricing plans
   */
  public static getConfig = asyncHandler(async (_req: Request, res: Response) => {
    const config = await getMonetizationConfig();
    const publicConfig = {
      pricing: {
        sprintPass7Day: config.pricing.sprintPass7Day,
        proMonthly: config.pricing.proMonthly,
        proYearly: config.pricing.proYearly,
      },
      interviewQuotas: config.interviewQuotas,
      resumeQuotas: config.resumeQuotas,
      globalSettings: {
        promoBannerActive: config.globalSettings.promoBannerActive,
        promoBannerText: config.globalSettings.promoBannerText,
      },
    };
    res.status(HTTP_STATUS.OK).json(successResponse(publicConfig));
  });

  /**
   * GET /api/interviews/templates
   * List available role templates & competency areas for configuration wizard
   */
  public static getTemplates = asyncHandler(async (_req: Request, res: Response) => {
    const templates = await interviewTemplateService.getTemplates();
    res.status(HTTP_STATUS.OK).json(successResponse(templates));
  });

  /**
   * GET /api/interviews/sessions
   * Protected: List paginated interview sessions for the authenticated candidate
   */
  public static getSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const query = req.query as any;
    const result = await interviewSessionService.getUserSessions(userId, query);

    res.status(HTTP_STATUS.OK).json(successResponse(result));
  });

  /**
   * POST /api/interviews/sessions
   * Protected: Configure a new interview session and generate the calibrated question plan
   */
  public static createSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const input = req.body as CreateSessionInput;
    const result = await interviewSessionService.createSession(userId, input);

    res.status(HTTP_STATUS.CREATED).json(successResponse(result));
  });

  /**
   * GET /api/interviews/sessions/:sessionId
   * Protected: Get specific interview session by ID, strictly verifying candidate ownership
   */
  public static getSessionById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const session = await interviewSessionService.getSessionById(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(session));
  });

  /**
   * GET /api/interviews/sessions/:sessionId/questions
   * Protected: Retrieve the generated question plan for an interview session
   */
  public static getSessionQuestions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const questions = await interviewSessionService.getSessionQuestions(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(questions));
  });

  /**
   * POST /api/interviews/sessions/:sessionId/start
   * Protected: Start or resume an interview session, returning current question & state
   */
  public static startOrResumeSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const result = await interviewSessionService.startOrResumeSession(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(result));
  });

  /**
   * POST /api/interviews/sessions/:sessionId/answers
   * Protected: Submit candidate response, record duration, trigger follow-up, advance session
   */
  public static submitAnswer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const input = req.body as SubmitAnswerInput;
    const result = await interviewSessionService.submitAnswer(userId, sessionId, input);

    res.status(HTTP_STATUS.CREATED).json(successResponse(result));
  });

  /**
   * GET /api/interviews/sessions/:sessionId/answers
   * Protected: Retrieve all submitted answers for a session
   */
  public static getSessionAnswers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const answers = await interviewSessionService.getSessionAnswers(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(answers));
  });

  /**
   * POST /api/interviews/sessions/:sessionId/complete
   * Protected: Conclude/finalize an interview session
   */
  public static completeSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const session = await interviewSessionService.completeSession(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(session));
  });

  /**
   * POST /api/interviews/sessions/:sessionId/evaluate
   * Protected: Evaluate all answers in a completed session, compute scores, and generate readiness report
   */
  public static evaluateSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const result = await interviewEvaluationService.evaluateSession(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(result));
  });

  /**
   * GET /api/interviews/sessions/:sessionId/evaluations
   * Protected: Retrieve question-by-question evaluations for a session
   */
  public static getSessionEvaluations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const evaluations = await interviewEvaluationService.getSessionEvaluations(userId, sessionId);

    res.status(HTTP_STATUS.OK).json(successResponse(evaluations));
  });

  /**
   * GET /api/interviews/sessions/:sessionId/report
   * Protected: Retrieve final readiness report and score summary
   */
  public static getSessionReport = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const { sessionId } = req.params as { sessionId: string };
    const report = await interviewEvaluationService.getSessionReport(userId, sessionId);

    if (!report) {
      throw new AppError(
        "Interview report not yet generated. Please evaluate the session first.",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    res.status(HTTP_STATUS.OK).json(successResponse(report));
  });
}
