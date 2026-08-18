import { AuthenticatedUserContext } from "@/core/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
    }
  }
}
