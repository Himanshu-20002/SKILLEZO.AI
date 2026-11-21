import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { Types } from "mongoose";
import { interviewRouter } from "@/modules/interview-coach/routes/interview.routes";
import { interviewEvaluationService } from "@/modules/interview-coach/services/interview-evaluation.service";
import {
  InterviewSessionStatus,
  InterviewType,
  InterviewDifficulty,
  InterviewMode,
} from "@/modules/interview-coach/domain/interview.enums";

// Mock authentication middleware
vi.mock("@/core/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "@/core/auth/auth";

describe("Phase 4: AI Evaluation & Scoring Engine Routes Integration Tests", () => {
  let app: express.Application;
  const mockUserId = "candidate-auth-eval-404";
  const mockSessionId = new Types.ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/interviews", interviewRouter);

    // Default: Authenticated candidate session
    (auth.api.getSession as any).mockResolvedValue({
      user: {
        id: mockUserId,
        email: "candidate404@example.com",
        role: "candidate",
      },
    });
  });

  it("POST /api/interviews/sessions/:sessionId/evaluate - triggers session evaluation and returns summary", async () => {
    const mockEvalSummary = {
      session: {
        _id: mockSessionId,
        userId: mockUserId,
        role: "React Developer",
        status: InterviewSessionStatus.COMPLETED,
      },
      report: {
        _id: new Types.ObjectId().toString(),
        sessionId: mockSessionId,
        userId: mockUserId,
        overallScore: 84,
        readinessLevel: "interview_ready",
        dimensionScores: {
          technicalAccuracy: 85,
          problemSolvingDepth: 80,
          answerStructure: 85,
          conceptCoverage: 80,
          communicationTone: 90,
        },
        strengths: ["Strong technical clarity"],
        improvementAreas: ["Elaborate on edge cases"],
        recommendations: ["Continue practicing complex scenarios"],
      },
      evaluations: [],
    };

    vi.spyOn(interviewEvaluationService, "evaluateSession").mockResolvedValue(
      mockEvalSummary as any
    );

    const res = await request(app)
      .post(`/api/interviews/sessions/${mockSessionId}/evaluate`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.overallScore).toBe(84);
    expect(res.body.data.report.readinessLevel).toBe("interview_ready");
  });

  it("GET /api/interviews/sessions/:sessionId/report - retrieves generated readiness report", async () => {
    const mockReport = {
      _id: new Types.ObjectId().toString(),
      sessionId: mockSessionId,
      userId: mockUserId,
      overallScore: 88,
      readinessLevel: "interview_ready",
      dimensionScores: {
        technicalAccuracy: 90,
        problemSolvingDepth: 85,
        answerStructure: 85,
        conceptCoverage: 90,
        communicationTone: 90,
      },
      strengths: ["Comprehensive technical reasoning"],
      improvementAreas: [],
      recommendations: ["Ready for real company technical rounds."],
    };

    vi.spyOn(interviewEvaluationService, "getSessionReport").mockResolvedValue(
      mockReport as any
    );

    const res = await request(app)
      .get(`/api/interviews/sessions/${mockSessionId}/report`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallScore).toBe(88);
  });

  it("GET /api/interviews/sessions/:sessionId/evaluations - retrieves list of question evaluations", async () => {
    const mockEvals = [
      {
        _id: new Types.ObjectId().toString(),
        sessionId: mockSessionId,
        questionId: new Types.ObjectId().toString(),
        scores: { technicalAccuracy: 85 },
        strengths: ["Clear explanation"],
      },
    ];

    vi.spyOn(interviewEvaluationService, "getSessionEvaluations").mockResolvedValue(
      mockEvals as any
    );

    const res = await request(app)
      .get(`/api/interviews/sessions/${mockSessionId}/evaluations`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});

