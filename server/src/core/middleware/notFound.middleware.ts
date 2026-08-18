import { Request, Response } from "express";
import { errorResponse } from "@/core/utils/apiResponse";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";

export const notFoundMiddleware = (_req: Request, res: Response): void => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .json(errorResponse(ERROR_CODES.NOT_FOUND, "Route not found"));
};
