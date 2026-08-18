import { Router, Request, Response } from "express";
import { ApiSuccess, ApiError } from "@/core/types/api.types";
import { isDatabaseConnected } from "@/database/connection/db";

const router = Router();

// Liveness endpoint: returns process status (does not query DB)
router.get("/health", (_req: Request, res: Response) => {
  const response: ApiSuccess<{ status: string }> = {
    success: true,
    data: {
      status: "ok",
    },
  };
  res.status(200).json(response);
});

// Readiness endpoint: verifies database readiness
router.get("/health/ready", (_req: Request, res: Response) => {
  if (isDatabaseConnected()) {
    const response: ApiSuccess<{ status: string; database: string }> = {
      success: true,
      data: {
        status: "ready",
        database: "connected",
      },
    };
    return res.status(200).json(response);
  } else {
    const response: ApiError = {
      success: false,
      error: {
        code: "SERVICE_NOT_READY",
        message: "Database connection is not ready",
      },
    };
    return res.status(503).json(response);
  }
});

export default router;
