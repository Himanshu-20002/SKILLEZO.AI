/// <reference path="../../../types/express.d.ts" />
import { Response, NextFunction, Request } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { UserRole, AccountStatus } from "@/core/constants/enums";
import { AuthenticatedUserContext } from "../auth.types";

/**
 * requireAuth middleware answers: "Is this request authenticated?"
 * 
 * Verifies the Better Auth session from request headers:
 * - If unauthenticated: returns 401 Unauthorized
 * - If account suspended: returns 403 Forbidden (ACCOUNT_SUSPENDED)
 * - If account deactivated: returns 403 Forbidden (ACCOUNT_DEACTIVATED)
 * - If valid and active: attaches AuthenticatedUserContext to req.user
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return next(
        new AppError(
          "Authentication required to access this resource",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        )
      );
    }

    const rawUser = session.user as any;
    const accountStatus: AccountStatus = rawUser.accountStatus || AccountStatus.ACTIVE;

    if (accountStatus === AccountStatus.SUSPENDED) {
      return next(
        new AppError(
          "Your account has been suspended. Please contact support.",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.ACCOUNT_SUSPENDED
        )
      );
    }

    if (accountStatus === AccountStatus.DEACTIVATED) {
      return next(
        new AppError(
          "Your account is deactivated.",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.ACCOUNT_DEACTIVATED
        )
      );
    }

    const userContext: AuthenticatedUserContext = {
      id: session.user.id,
      email: session.user.email,
      role: rawUser.role || UserRole.CANDIDATE,
      emailVerified: session.user.emailVerified ?? false,
      accountStatus,
    };

    req.user = userContext;
    return next();
  } catch (error: any) {
    return next(
      new AppError(
        "Failed to verify authentication session",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    );
  }
}
