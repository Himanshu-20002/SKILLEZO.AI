import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { Types } from "mongoose";
import { interviewRouter } from "@/modules/interview-coach/routes/interview.routes";
import { interviewSessionService } from "@/modules/interview-coach/services/interview-session.service";
import {
  InterviewSessionStatus,
  InterviewType,
  InterviewDifficulty,
  InterviewMode,
  QuestionSource,
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

describe("Phase 3: Text-Based Interactive Interview Routes Integration Tests", () => {
  let app: express.Application;
  const mockUserId = "candidate-auth-user-303";
  const mockSessionId = new Types.ObjectId().toString();
  const mockQuestionId = new Types.ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/interviews", interviewRouter);

    // Default: Authenticated candidate session
    (auth.api.getSession as any).mockResolvedValue({
      user: {
        id: mockUserId,
        email: "candidate303@example.com",
        role: "candidate",
      },
    });
  });

  it("POST /api/interviews/sessions/:sessionId/start - starts or resumes session and returns active question", async () => {
    const mockStartResult = {
      session: {
        _id: mockSessionId,
        userId: mockUserId,
        status: InterviewSessionStatus.IN_PROGRESS,
        role: "React Developer",
      },
      currentQuestion: {
        _id: mockQuestionId,
        sequence: 1,
        questionText: "What are React 19 Server Actions?",
        category: "Server Actions",
        difficulty: InterviewDifficulty.MEDIUM,
      },
      progress: {
        answeredCount: 0,
        totalQuestions: 3,
        currentSequence: 1,
        isCompleted: false,
      },
    };

    vi.spyOn(interviewSessionService, "startOrResumeSession").mockResolvedValue(
      mockStartResult as any
    );

    const res = await request(app)
      .post(`/api/interviews/sessions/${mockSessionId}/start`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session.status).toBe(InterviewSessionStatus.IN_PROGRESS);
    expect(res.body.data.currentQuestion.sequence).toBe(1);
  });

  it("POST /api/interviews/sessions/:sessionId/answers - submits answer and progresses session", async () => {
    const mockSubmitResult = {
      answer: {
        _id: new Types.ObjectId().toString(),
        sessionId: mockSessionId,
        questionId: mockQuestionId,
        answerText: "Server Actions run on the server and mutate data without full page reload.",
      },
      nextQuestion: {
        _id: new Types.ObjectId().toString(),
        sequence: 2,
        questionText: "How does useOptimistic improve perceived latency?",
      },
      followUpGenerated: false,
      isCompleted: false,
      progress: {
        answeredCount: 1,
        totalQuestions: 3,
        isCompleted: false,
      },
    };

    vi.spyOn(interviewSessionService, "submitAnswer").mockResolvedValue(
      mockSubmitResult as any
    );

    const res = await request(app)
      .post(`/api/interviews/sessions/${mockSessionId}/answers`)
      .set("Authorization", "Bearer valid-token")
      .send({
        questionId: mockQuestionId,
        answerText: "Server Actions run on the server and mutate data without full page reload.",
        responseDurationSeconds: 65,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress.answeredCount).toBe(1);
    expect(res.body.data.nextQuestion.sequence).toBe(2);
  });

  it("POST /api/interviews/sessions/:sessionId/answers - rejects invalid answer payload", async () => {
    const res = await request(app)
      .post(`/api/interviews/sessions/${mockSessionId}/answers`)
      .set("Authorization", "Bearer valid-token")
      .send({
        questionId: "invalid-id",
        answerText: "", // Empty answer rejected by schema
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/interviews/sessions/:sessionId/complete - concludes session successfully", async () => {
    const mockCompletedSession = {
      _id: mockSessionId,
      userId: mockUserId,
      status: InterviewSessionStatus.COMPLETED,
      completedAt: new Date(),
    };

    vi.spyOn(interviewSessionService, "completeSession").mockResolvedValue(
      mockCompletedSession as any
    );

    const res = await request(app)
      .post(`/api/interviews/sessions/${mockSessionId}/complete`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(InterviewSessionStatus.COMPLETED);
  });
});

