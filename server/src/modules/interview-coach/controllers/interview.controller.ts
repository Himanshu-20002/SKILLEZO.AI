import { Request, Response } from "express";
import { asyncHandler } from "@/core/utils/asyncHandler";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { interviewSessionService } from "../services/interview-session.service";
import { interviewTemplateService } from "../services/interview-template.service";
import {
  CreateSessionInput,
} from "../validation/interview.schemas";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";

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
}
