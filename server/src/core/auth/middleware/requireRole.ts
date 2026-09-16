/// <reference path="../../../types/express.d.ts" />
import { Response, NextFunction, Request } from "express";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { UserRole } from "@/core/constants/enums";

export const SUPER_ADMIN_EMAIL = "admin@gmail.com";

/**
 * Role-based authorization middleware.
 * Verifies that the authenticated user possesses one of the allowed roles,
 * or is the designated Super Admin (admin@gmail.com).
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required to access this resource",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        )
      );
    }

    // Direct elevation for configured Super Admin email
    if (req.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
      req.user.role = UserRole.ADMIN;
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "Access denied. You do not have permission to perform this action.",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        )
      );
    }

    return next();
  };
}
