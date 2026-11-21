import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { interviewRouter } from "@/modules/interview-coach";
import { errorMiddleware } from "@/core/middleware/error.middleware";
import {
  InterviewSessionModel,
  InterviewQuestionModel,
  InterviewTemplateModel,
} from "@/database/models";

vi.mock("@/core/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  authHandler: vi.fn(),
}));

vi.mock("@/database/models/Subscription.model", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    SubscriptionModel: {
      findOne: vi.fn().mockResolvedValue(null),
    },
  };
});

vi.mock("@/database/models/MonetizationConfig.model", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getMonetizationConfig: vi.fn().mockResolvedValue({
      interviewQuotas: {
        freeMonthlySessions: 2,
        freeMaxQuestionsPerSession: 5,
        freeMaxAnswerSeconds: 120,
        lockModelAnswersForFree: true,
        enableVoiceForFree: true,
        enableVideoForFree: true,
      },
      pricing: {
        sprintPass7Day: { priceInr: 299, active: true },
        proMonthly: { priceInr: 999, active: true },
        proYearly: { priceInr: 4999, active: true },
      },
      resumeQuotas: {
        freeMaxResumes: 1,
        freeMonthlyAtsScans: 1,
        lockDocxExportForFree: true,
        lockCoverLetterAiForFree: true,
        lockMultiJobTailoringForFree: true,
      },
      globalSettings: {
        promoBannerActive: false,
        promoBannerText: "",
      },
    }),
    MonetizationConfigModel: {
      getEffectiveConfig: vi.fn().mockResolvedValue({
        interviewQuotas: {
          freeMonthlySessions: 2,
          freeMaxQuestionsPerSession: 5,
          freeMaxAnswerSeconds: 120,
          lockModelAnswersForFree: true,
          enableVoiceForFree: true,
          enableVideoForFree: true,
        },
      }),
    },
  };
});

import { auth } from "@/core/auth/auth";

describe("Interview Coach Phase 2 API Routes Integration", () => {
  let app: express.Application;

  const mockCandidate = {
    id: "usr_candidate_ph2",
    email: "candidate.ph2@example.com",
    role: "CANDIDATE",
    accountStatus: "active",
    emailVerified: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/interviews", interviewRouter);
    app.use(errorMiddleware);

    (auth.api.getSession as any).mockResolvedValue({
      user: mockCandidate,
      session: { id: "sess_ph2_token", userId: mockCandidate.id },
    });
  });

  describe("GET /api/interviews/templates", () => {
    it("should return the catalog of role templates", async () => {
      vi.spyOn(InterviewTemplateModel, "countDocuments").mockReturnValue({
        exec: vi.fn().mockResolvedValue(10),
      } as any);

      vi.spyOn(InterviewTemplateModel, "find").mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          {
            role: "React Developer",
            name: "React & Modern Frontend Architecture",
            competencyAreas: ["Hooks", "SSR"],
            defaultDurationMinutes: 30,
            defaultQuestionCount: 5,
          },
        ]),
      } as any);

      const res = await request(app).get("/api/interviews/templates");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].role).toBe("React Developer");
    });
  });

  describe("POST /api/interviews/sessions", () => {
    it("should create a session and generate questions returning 201 Created", async () => {
      const sessionId = new mongoose.Types.ObjectId();

      vi.spyOn(InterviewSessionModel, "countDocuments").mockReturnValue({
        exec: vi.fn().mockResolvedValue(0),
      } as any);
      vi.spyOn(InterviewTemplateModel, "countDocuments").mockReturnValue({
        exec: vi.fn().mockResolvedValue(10),
      } as any);
      vi.spyOn(InterviewTemplateModel, "findOne").mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          role: "React Developer",
          competencyAreas: ["React 19", "SSR"],
        }),
      } as any);

      vi.spyOn(InterviewSessionModel.prototype, "save").mockResolvedValue({
        _id: sessionId,
        userId: mockCandidate.id,
        role: "React Developer",
        experienceLevel: "mid",
        interviewType: "technical",
        difficulty: "medium",
        mode: "text",
        durationMinutes: 30,
        totalQuestions: 3,
        status: "pending",
        createdAt: new Date(),
      } as any);

      vi.spyOn(InterviewQuestionModel, "insertMany").mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(),
          sessionId,
          sequence: 1,
          questionText: "Explain React 19 Server Components.",
          category: "React Architecture",
        },
      ] as any);

      const res = await request(app)
        .post("/api/interviews/sessions")
        .set("Authorization", "Bearer valid_token")
        .send({
          role: "React Developer",
          experienceLevel: "mid",
          interviewType: "technical",
          difficulty: "medium",
          mode: "text",
          durationMinutes: 30,
          totalQuestions: 3,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session).toBeDefined();
      expect(res.body.data.questions).toBeDefined();
    });

    it("should reject invalid duration bounds with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/interviews/sessions")
        .set("Authorization", "Bearer valid_token")
        .send({
          role: "React Developer",
          experienceLevel: "mid",
          interviewType: "technical",
          difficulty: "medium",
          mode: "text",
          durationMinutes: 5, // Invalid (< 10)
          totalQuestions: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/interviews/sessions/:sessionId/questions", () => {
    it("should return sequential questions for authenticated session owner", async () => {
      const sessionId = new mongoose.Types.ObjectId();

      vi.spyOn(InterviewSessionModel, "findOne").mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: sessionId,
          userId: mockCandidate.id,
          role: "React Developer",
        }),
      } as any);

      vi.spyOn(InterviewQuestionModel, "find").mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          { sequence: 1, questionText: "Question 1" },
          { sequence: 2, questionText: "Question 2" },
        ]),
      } as any);

      const res = await request(app)
        .get(`/api/interviews/sessions/${sessionId.toString()}/questions`)
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });
});

