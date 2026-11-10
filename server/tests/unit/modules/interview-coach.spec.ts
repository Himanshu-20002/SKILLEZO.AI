import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import {
  InterviewMode,
  InterviewType,
  InterviewDifficulty,
  InterviewSessionStatus,
  QuestionSource,
} from "@/modules/interview-coach/domain/interview.enums";
import {
  createSessionInputSchema,
  sessionParamSchema,
  listSessionsQuerySchema,
} from "@/modules/interview-coach/validation/interview.schemas";
import {
  InterviewSessionNotFoundError,
  UnauthorizedSessionAccessError,
  InvalidSessionStateTransitionError,
} from "@/modules/interview-coach/domain/interview.errors";
import {
  InterviewSessionModel,
  InterviewQuestionModel,
  InterviewAnswerModel,
  InterviewEvaluationModel,
  InterviewReportModel,
} from "@/database/models";
import { InterviewSessionService } from "@/modules/interview-coach/services/interview-session.service";
import { InterviewSessionRepository } from "@/database/repositories/interview";

describe("Module: Interview Coach — Domain, Validation & Architecture (Phase 1)", () => {
  describe("1. Domain Enums & Invariants", () => {
    it("should define all required interview modes", () => {
      expect(Object.values(InterviewMode)).toEqual(["text", "voice"]);
    });

    it("should define all required interview types", () => {
      expect(Object.values(InterviewType)).toEqual([
        "technical",
        "hr",
        "behavioral",
        "managerial",
      ]);
    });

    it("should define all required difficulties", () => {
      expect(Object.values(InterviewDifficulty)).toEqual(["easy", "medium", "hard"]);
    });

    it("should define complete interview session statuses", () => {
      expect(Object.values(InterviewSessionStatus)).toEqual([
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "expired",
      ]);
    });

    it("should define question source types", () => {
      expect(Object.values(QuestionSource)).toEqual([
        "generated",
        "template",
        "follow_up",
      ]);
    });
  });

  describe("2. Zod Validation Schemas", () => {
    const validSessionPayload = {
      role: "Full-Stack Developer",
      experienceLevel: "mid",
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.MEDIUM,
      mode: InterviewMode.TEXT,
      durationMinutes: 30,
      totalQuestions: 5,
    };

    it("should accept valid session configuration", () => {
      const parsed = createSessionInputSchema.safeParse(validSessionPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.role).toBe("Full-Stack Developer");
        expect(parsed.data.durationMinutes).toBe(30);
        expect(parsed.data.totalQuestions).toBe(5);
      }
    });

    it("should reject invalid duration bounds (less than 10 or greater than 90)", () => {
      const tooShort = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        durationMinutes: 5,
      });
      expect(tooShort.success).toBe(false);

      const tooLong = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        durationMinutes: 120,
      });
      expect(tooLong.success).toBe(false);
    });

    it("should reject invalid question count bounds (less than 3 or greater than 20)", () => {
      const tooFew = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        totalQuestions: 2,
      });
      expect(tooFew.success).toBe(false);

      const tooMany = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        totalQuestions: 25,
      });
      expect(tooMany.success).toBe(false);
    });

    it("should reject invalid interview type, difficulty, or mode", () => {
      const badType = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        interviewType: "invalid_type",
      });
      expect(badType.success).toBe(false);

      const badDifficulty = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        difficulty: "super_hard",
      });
      expect(badDifficulty.success).toBe(false);

      const badMode = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        mode: "video",
      });
      expect(badMode.success).toBe(false);
    });

    it("should reject empty or overly long role names", () => {
      const emptyRole = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        role: " ",
      });
      expect(emptyRole.success).toBe(false);

      const hugeRole = createSessionInputSchema.safeParse({
        ...validSessionPayload,
        role: "A".repeat(105),
      });
      expect(hugeRole.success).toBe(false);
    });

    it("should validate and reject malformed ObjectId params", () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const validCheck = sessionParamSchema.safeParse({ sessionId: validId });
      expect(validCheck.success).toBe(true);

      const badCheck = sessionParamSchema.safeParse({ sessionId: "not-an-object-id" });
      expect(badCheck.success).toBe(false);
    });

    it("should coerce and validate query pagination with defaults", () => {
      const parsedDefault = listSessionsQuerySchema.parse({});
      expect(parsedDefault.page).toBe(1);
      expect(parsedDefault.limit).toBe(20);

      const parsedCustom = listSessionsQuerySchema.parse({
        page: "3",
        limit: "15",
        status: InterviewSessionStatus.IN_PROGRESS,
      });
      expect(parsedCustom.page).toBe(3);
      expect(parsedCustom.limit).toBe(15);
      expect(parsedCustom.status).toBe(InterviewSessionStatus.IN_PROGRESS);
    });
  });

  describe("3. Mongoose Schema & Index Declarations", () => {
    it("should declare required compound indexes on InterviewSessionModel", () => {
      const indexes = InterviewSessionModel.schema.indexes();
      const hasUserCreatedIdx = indexes.some(
        ([fields]) => fields.userId === 1 && fields.createdAt === -1
      );
      const hasUserStatusIdx = indexes.some(
        ([fields]) => fields.userId === 1 && fields.status === 1
      );

      expect(hasUserCreatedIdx).toBe(true);
      expect(hasUserStatusIdx).toBe(true);
    });

    it("should declare compound ordering index on InterviewQuestionModel", () => {
      const indexes = InterviewQuestionModel.schema.indexes();
      const hasSequenceIdx = indexes.some(
        ([fields]) => fields.sessionId === 1 && fields.sequence === 1
      );
      expect(hasSequenceIdx).toBe(true);
    });

    it("should declare unique compound index on InterviewAnswerModel (sessionId + questionId)", () => {
      const indexes = InterviewAnswerModel.schema.indexes();
      const hasUniqueAnswerIdx = indexes.some(
        ([fields, options]) =>
          fields.sessionId === 1 && fields.questionId === 1 && options?.unique === true
      );
      expect(hasUniqueAnswerIdx).toBe(true);
    });

    it("should declare unique compound index on InterviewEvaluationModel", () => {
      const indexes = InterviewEvaluationModel.schema.indexes();
      const hasEvalIdx = indexes.some(
        ([fields, options]) =>
          fields.sessionId === 1 && fields.questionId === 1 && options?.unique === true
      );
      expect(hasEvalIdx).toBe(true);
    });

    it("should declare user and session index on InterviewReportModel", () => {
      const indexes = InterviewReportModel.schema.indexes();
      const hasReportIdx = indexes.some(
        ([fields]) => fields.userId === 1 && fields.sessionId === 1
      );
      expect(hasReportIdx).toBe(true);
    });
  });

  describe("4. Candidate Isolation & Ownership Enforcement", () => {
    it("should scope session lookup by user ID and reject cross-candidate access", async () => {
      const mockRepo = {
        findByUserAndId: vi.fn(),
        listByUserId: vi.fn(),
      } as unknown as InterviewSessionRepository;

      const service = new InterviewSessionService(mockRepo);
      const candidateAId = "usr_candidate_A";
      const candidateBId = "usr_candidate_B";
      const sessionId = new mongoose.Types.ObjectId().toString();

      // Candidate A owns this session
      (mockRepo.findByUserAndId as any).mockImplementation((userId: string, id: string) => {
        if (userId === candidateAId && id === sessionId) {
          return Promise.resolve({
            _id: sessionId,
            userId: candidateAId,
            role: "Frontend Engineer",
            status: InterviewSessionStatus.IN_PROGRESS,
          });
        }
        // Candidate B has no access -> returns null
        return Promise.resolve(null);
      });

      // 1. Candidate A retrieves their own session
      const session = await service.getSessionById(candidateAId, sessionId);
      expect(session).toBeDefined();
      expect(session.userId).toBe(candidateAId);

      // 2. Candidate B attempts to retrieve Candidate A's session -> throws InterviewSessionNotFoundError
      await expect(service.getSessionById(candidateBId, sessionId)).rejects.toThrow(
        InterviewSessionNotFoundError
      );
    });

    it("should return empty list when candidate has no sessions", async () => {
      const mockRepo = {
        listByUserId: vi.fn().mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
      } as unknown as InterviewSessionRepository;

      const service = new InterviewSessionService(mockRepo);
      const result = await service.getUserSessions("usr_candidate_new");

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockRepo.listByUserId).toHaveBeenCalledWith("usr_candidate_new", {});
    });

    it("should return healthy module status in getHealth()", () => {
      const mockRepo = {} as unknown as InterviewSessionRepository;
      const service = new InterviewSessionService(mockRepo);
      const health = service.getHealth();

      expect(health).toEqual({
        status: "ok",
        module: "interview-coach",
        phase: 2,
      });
    });
  });

  describe("5. Domain Errors", () => {
    it("should format InterviewSessionNotFoundError with 404 status code", () => {
      const err = new InterviewSessionNotFoundError("sess_123");
      expect(err.statusCode).toBe(404);
      expect(err.message).toContain("sess_123");
    });

    it("should format UnauthorizedSessionAccessError with 403 status code", () => {
      const err = new UnauthorizedSessionAccessError();
      expect(err.statusCode).toBe(403);
    });

    it("should format InvalidSessionStateTransitionError with 400 status code", () => {
      const err = new InvalidSessionStateTransitionError("completed", "in_progress");
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain("completed");
      expect(err.message).toContain("in_progress");
    });
  });
});

