import { Router, Request, Response } from "express";
import { auth } from "@/core/auth";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

/**
 * Temporary verification endpoint for Phase 10B testing only.
 * Returns the current authenticated session from Better Auth.
 */
router.get("/auth-test/session", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(200).json({
        authenticated: false,
        user: null,
        session: null,
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role,
        accountStatus: (session.user as any).accountStatus,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      authenticated: false,
      error: error.message || "Failed to retrieve session",
    });
  }
});

import { requireAuth } from "@/core/auth";

/**
 * Temporary verification endpoint for Phase 10C testing only.
 * Requires valid session via requireAuth middleware and returns req.user.
 */
router.get("/auth-test/protected", requireAuth, (req: Request, res: Response) => {
  return res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

export default router;
