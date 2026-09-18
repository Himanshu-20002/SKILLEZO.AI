import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import {
  AIOrchestratorError,
  AIOrchestratorTimeoutError,
} from "../orchestrator/orchestrator-errors";
import { ZodError } from "zod";

/**
 * Maps internal orchestration and provider errors into safe, operational AppError instances.
 * Guarantees no sensitive tokens, provider internals, or internal stack traces leak to the client.
 */
export function mapOrchestrationErrorToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    const fields = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return new AppError(
      "Request validation failed",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      { fields }
    );
  }

  if (error instanceof AIOrchestratorTimeoutError) {
    return new AppError(
      "Career coach request timed out. Please try again.",
      HTTP_STATUS.GATEWAY_TIMEOUT,
      ERROR_CODES.JOB_SOURCE_TIMEOUT
    );
  }

  if (error instanceof AIOrchestratorError) {
    switch (error.code) {
      case "UNAUTHENTICATED":
        return new AppError(
          "Authentication required to access career coaching.",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        );
      case "UNAUTHORIZED":
        return new AppError(
          "You do not have permission to access this career coaching resource.",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        );
      case "INVALID_REQUEST":
        return new AppError(
          error.message || "Invalid career coaching request.",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.BAD_REQUEST
        );
      default:
        return new AppError(
          "AI career coach encountered an unexpected issue.",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_SERVER_ERROR
        );
    }
  }

  const rawMessage = error instanceof Error ? error.message : String(error);

  // Model provider failure / circuit breaker tripped
  if (
    rawMessage.includes("[ModelGateway]") ||
    rawMessage.includes("All AI providers failed") ||
    rawMessage.includes("Circuit breaker")
  ) {
    return new AppError(
      "AI career guidance service is temporarily unavailable. Please try again shortly.",
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.SERVICE_UNAVAILABLE
    );
  }

  // Sanitized fallback for unexpected errors
  return new AppError(
    "An unexpected error occurred while processing career guidance.",
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR
  );
}
