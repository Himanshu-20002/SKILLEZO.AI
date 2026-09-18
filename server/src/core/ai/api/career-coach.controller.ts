import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { AIOrchestrator } from "../orchestrator/ai-orchestrator";
import { mapOrchestrationErrorToAppError } from "./career-coach.errors";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class CareerCoachController {
  private static instance: CareerCoachController;

  public static getInstance(): CareerCoachController {
    if (!CareerCoachController.instance) {
      CareerCoachController.instance = new CareerCoachController();
    }
    return CareerCoachController.instance;
  }

  public chat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // 1. Authenticated context guard
    if (!req.user || !req.user.id) {
      return next(
        new AppError(
          "Authentication required to access career coaching.",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        )
      );
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // 2. Correlation ID
    const rawRequestId = req.headers["x-request-id"];
    const requestId =
      typeof rawRequestId === "string" && rawRequestId.trim().length > 0
        ? rawRequestId.trim()
        : `coach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 3. Transport mode (SSE lifecycle stream vs standard JSON)
    const isSse =
      req.body?.stream === true ||
      Boolean(req.headers.accept?.includes("text/event-stream"));

    // 4. Disconnect & AbortController wiring
    const abortController = new AbortController();
    let isCompleted = false;

    const onDisconnect = () => {
      if (!isCompleted && !res.writableEnded) {
        abortController.abort();
      }
    };

    req.on("close", onDisconnect);
    res.on("finish", () => {
      isCompleted = true;
      req.off("close", onDisconnect);
    });
    res.on("close", () => {
      if (!isCompleted && !res.writableEnded) {
        abortController.abort();
      }
    });

    try {
      if (isSse) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        if (typeof res.flushHeaders === "function") {
          res.flushHeaders();
        }

        // Orchestration lifecycle progress events (NO raw token streaming)
        res.write(`event: status\ndata: ${JSON.stringify({ status: "thinking" })}\n\n`);
        res.write(`event: status\ndata: ${JSON.stringify({ status: "executing_tools" })}\n\n`);
        res.write(`event: status\ndata: ${JSON.stringify({ status: "synthesizing" })}\n\n`);
      }

      // 5. Invoke Phase 4 Orchestrator as the single internal entry point
      const orchestrator = AIOrchestrator.getInstance();
      const result = await orchestrator.orchestrate(
        {
          message: req.body.message,
          targetRole: req.body.targetRole,
          conversationContext: req.body.conversationContext,
        },
        {
          userId,
          userRole,
          requestId,
          signal: abortController.signal,
        }
      );

      isCompleted = true;

      // Check if client disconnected while orchestrating
      if (abortController.signal.aborted || res.writableEnded) {
        return;
      }

      if (isSse) {
        // Only the final, fully validated AIOrchestrationResult is emitted as trusted output
        res.write(`event: result\ndata: ${JSON.stringify(result)}\n\n`);
        res.write(`event: completed\ndata: ${JSON.stringify({ status: "completed" })}\n\n`);
        res.end();
      } else {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          requestId,
          data: result,
        });
      }
    } catch (err: unknown) {
      isCompleted = true;

      // If client already aborted or connection closed, quietly clean up without writing
      if (abortController.signal.aborted || res.writableEnded) {
        return;
      }

      const appError = mapOrchestrationErrorToAppError(err);

      if (isSse && res.headersSent) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            code: appError.code,
            message: appError.message,
          })}\n\n`
        );
        res.end();
        return;
      }

      next(appError);
    }
  };
}

export const careerCoachController = CareerCoachController.getInstance();
