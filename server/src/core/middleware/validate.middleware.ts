import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "@/core/utils/apiResponse";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";

interface RequestSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate = (schemas: RequestSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        const parsedParams = (await schemas.params.parseAsync(req.params)) as Record<string, string>;
        Object.defineProperty(req, "params", {
          value: parsedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schemas.query) {
        const parsedQuery = (await schemas.query.parseAsync(req.query)) as Record<string, any>;
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(
            ERROR_CODES.VALIDATION_ERROR,
            "Request validation failed",
            { fields }
          )
        );
        return;
      }
      next(error);
    }
  };
};
