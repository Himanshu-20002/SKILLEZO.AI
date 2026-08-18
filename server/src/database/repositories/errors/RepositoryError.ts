import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES, ErrorCode } from "@/core/constants/error-codes";

export class RepositoryError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ERROR_CODES.DATABASE_ERROR,
    details?: any
  ) {
    super(message, statusCode, errorCode, details);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundError extends RepositoryError {
  constructor(entityName: string, identifier?: string | number | Record<string, any>) {
    const idStr = identifier
      ? ` identified by ${typeof identifier === "object" ? JSON.stringify(identifier) : identifier}`
      : "";
    super(`${entityName}${idStr} was not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class DuplicateEntityError extends RepositoryError {
  constructor(entityName: string, key?: string, value?: any) {
    const keyStr = key ? ` with ${key} '${value}'` : "";
    super(`${entityName}${keyStr} already exists`, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_RESOURCE);
  }
}

export class DatabaseOperationError extends RepositoryError {
  constructor(operation: string, originalError?: any) {
    super(
      `Database operation '${operation}' failed: ${originalError?.message || originalError || "Unknown error"}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.DATABASE_ERROR,
      originalError
    );
  }
}
