import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { interviewRouter } from "@/modules/interview-coach";
import { errorMiddleware } from "@/core/middleware/error.middleware";
import { InterviewSessionModel } from "@/database/models";

// Mock Better Auth session verification to test authenticated vs unauthenticated flows
vi.mock("@/core/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  authHandler: vi.fn(),
}));

import { auth } from "@/core/auth/auth";

describe("Interview Coach API Routes & Middleware Integration (Phase 1)", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/interviews", interviewRouter);
    app.use(errorMiddleware);
  });

  describe("GET /api/interviews/health", () => {
    it("should return 200 OK with module health info without requiring auth", async () => {
      const res = await request(app).get("/api/interviews/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: {
          status: "ok",
          module: "interview-coach",
          phase: 2,
        },
      });
    });
  });

  describe("Authentication Enforcement on Protected Routes", () => {
    it("should reject unauthenticated request to GET /api/interviews/sessions with 401", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);

      const res = await request(app).get("/api/interviews/sessions");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject unauthenticated request to GET /api/interviews/sessions/:sessionId with 401", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const testId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(`/api/interviews/sessions/${testId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Authenticated Candidate Session Access", () => {
    const candidateA = {
      id: "usr_candidate_alpha",
      email: "candidate.a@example.com",
      role: "CANDIDATE",
      accountStatus: "active",
      emailVerified: true,
    };

    beforeEach(() => {
      // Mock valid candidate session
      (auth.api.getSession as any).mockResolvedValue({
        user: candidateA,
        session: { id: "sess_token_123", userId: candidateA.id },
      });
    });

    it("should return empty session list when candidate has no sessions", async () => {
      // Mock InterviewSessionModel find and countDocuments
      vi.spyOn(InterviewSessionModel, "find").mockReturnValue({
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(InterviewSessionModel, "countDocuments").mockReturnValue({
        exec: vi.fn().mockResolvedValue(0),
      } as any);

      const res = await request(app)
        .get("/api/interviews/sessions")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toEqual([]);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.page).toBe(1);
    });

    it("should reject malformed sessionId format with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/interviews/sessions/non-hex-id-999")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when session does not exist or belongs to another user", async () => {
      vi.spyOn(InterviewSessionModel, "findOne").mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      const testId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/interviews/sessions/${testId}`)
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
