import rateLimit, { Options } from "express-rate-limit";
import { Request, Response } from "express";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { errorResponse } from "@/core/utils/apiResponse";

/**
 * Standardized JSON error response handler for rate limit violations.
 */
function createRateLimitHandler(customMessage: string) {
  return (_req: Request, res: Response): void => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      errorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        customMessage
      )
    );
  };
}

/**
 * Tier 1: Global API Guard
 * Protects all /api routes from scraping, aggressive burst traffic, and runaway frontend loops.
 * 
 * - Window: 15 minutes
 * - Max: 500 requests per IP
 * - Exempts: health checks, root endpoints, and test environments
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    if (process.env.NODE_ENV === "test") return true;
    const path = req.path.toLowerCase();
    return (
      path === "/" ||
      path === "/health" ||
      path === "/api/health" ||
      path === "/api"
    );
  },
  handler: createRateLimitHandler(
    "Too many requests from this IP. Please slow down and try again in a few minutes."
  ),
});

/**
 * Tier 2: Authentication & Brute-Force Guard
 * Strictly guards /api/auth against credential stuffing and registration spam.
 * 
 * - Window: 15 minutes
 * - Max: 30 sensitive auth attempts per IP
 * - Exempts: GET requests (e.g. session validation pings) and test environments
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    if (process.env.NODE_ENV === "test") return true;
    // Allow non-mutating session check requests (GET /api/auth/session, etc.)
    return req.method === "GET";
  },
  handler: createRateLimitHandler(
    "Too many authentication attempts from this IP. Please wait 15 minutes before trying again."
  ),
});

/**
 * Tier 3: Heavy Operations & AI Compute Guard
 * Guards CPU-intensive resume parsing, ATS scoring calculations, and LLM completions.
 * 
 * - Window: 15 minutes
 * - Max: 30 operations per IP
 * - Exempts: GET inspection requests and test environments
 */
export const heavyOpsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    if (process.env.NODE_ENV === "test") return true;
    return req.method === "GET";
  },
  handler: createRateLimitHandler(
    "Heavy compute limit reached. Please wait a few moments before submitting additional files or AI prompts."
  ),
});
