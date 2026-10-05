import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { errorResponse } from "@/core/utils/apiResponse";

describe("DDoS & Traffic Spurt Defense: Rate Limiter Middleware", () => {
  it("should return standard 429 and ERROR_CODES.RATE_LIMIT_EXCEEDED when quota is exhausted", async () => {
    const app = express();

    // Dedicated test limiter with low threshold
    const testLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
          errorResponse(
            ERROR_CODES.RATE_LIMIT_EXCEEDED,
            "Too many requests from this IP. Please slow down and try again in a few minutes."
          )
        );
      },
    });

    app.use("/api/test", testLimiter, (_req, res) => {
      res.status(200).json({ success: true, message: "OK" });
    });

    // Request 1: OK
    const res1 = await request(app).get("/api/test");
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(res1.headers["ratelimit-limit"]).toBe("2");
    expect(res1.headers["ratelimit-remaining"]).toBe("1");

    // Request 2: OK
    const res2 = await request(app).get("/api/test");
    expect(res2.status).toBe(200);
    expect(res2.headers["ratelimit-remaining"]).toBe("0");

    // Request 3: Blocked (429 Too Many Requests)
    const res3 = await request(app).get("/api/test");
    expect(res3.status).toBe(429);
    expect(res3.body.success).toBe(false);
    expect(res3.body.error.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    expect(res3.body.error.message).toContain("Too many requests from this IP");
  });

  it("should bypass rate limiting for health check endpoints", async () => {
    const app = express();

    const bypassLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 1,
      skip: (req) => req.path === "/health" || req.path === "/api/health",
      handler: (_req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
          errorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, "Rate limited")
        );
      },
    });

    app.use("/api", bypassLimiter);
    app.get("/api/health", (_req, res) => {
      res.status(200).json({ status: "healthy" });
    });
    app.get("/api/data", (_req, res) => {
      res.status(200).json({ data: "content" });
    });

    // 1st data request: consumes quota
    const res1 = await request(app).get("/api/data");
    expect(res1.status).toBe(200);

    // 2nd data request: blocked
    const res2 = await request(app).get("/api/data");
    expect(res2.status).toBe(429);

    // Health requests should never be blocked even after quota exhaustion
    const health1 = await request(app).get("/api/health");
    expect(health1.status).toBe(200);
    expect(health1.body.status).toBe("healthy");

    const health2 = await request(app).get("/api/health");
    expect(health2.status).toBe(200);
    expect(health2.body.status).toBe("healthy");
  });
});
