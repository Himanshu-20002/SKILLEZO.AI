import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class InterviewSessionNotFoundError extends AppError {
  constructor(sessionId: string) {
    super(
      `Interview session with id '${sessionId}' was not found.`,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }
}

export class UnauthorizedSessionAccessError extends AppError {
  constructor() {
    super(
      "You do not have permission to access this interview session.",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.FORBIDDEN
    );
  }
}

export class InvalidSessionStateTransitionError extends AppError {
  constructor(fromStatus: string, toStatus: string) {
    super(
      `Cannot transition interview session status from '${fromStatus}' to '${toStatus}'.`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }
}

export class InterviewInvalidStateError extends AppError {
  constructor(message: string) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }
}
