import { Request, Response, NextFunction } from "express";
import { AppError } from "@/core/utils/AppError";
import { errorResponse } from "@/core/utils/apiResponse";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational AppError
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(errorResponse(err.code, err.message, err.details));
    return;
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err && typeof err === "object" && "name" in err && err.name === "CastError") {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(errorResponse(ERROR_CODES.BAD_REQUEST, "Invalid resource identifier format"));
    return;
  }

  // MongoDB duplicate key error code 11000
  if (err && typeof err === "object" && "code" in err && err.code === 11000) {
    res
      .status(HTTP_STATUS.CONFLICT)
      .json(errorResponse(ERROR_CODES.DUPLICATE_RESOURCE, "Resource conflict or duplicate entry"));
    return;
  }

  // Mongoose ValidationError
  if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(errorResponse(ERROR_CODES.VALIDATION_ERROR, "Database validation error"));
    return;
  }

  // Log unknown/unexpected errors server-side
  console.error("[Unhandled Error]:", err);

  // Return sanitized 500 internal server error
  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json(
      errorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        message
      )
    );
};
