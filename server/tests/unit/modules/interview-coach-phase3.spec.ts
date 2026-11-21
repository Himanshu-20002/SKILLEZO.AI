import { describe, it, expect, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { InterviewSessionService } from "@/modules/interview-coach/services/interview-session.service";
import { InterviewAIService } from "@/modules/interview-coach/services/interview-ai.service";
import {
  InterviewSessionStatus,
  InterviewType,
  InterviewDifficulty,
  InterviewMode,
  QuestionSource,
} from "@/modules/interview-coach/domain/interview.enums";
import {
  InterviewSessionNotFoundError,
  InterviewInvalidStateError,
} from "@/modules/interview-coach/domain/interview.errors";

describe("Phase 3: Text-Based Interactive Interview Engine Unit Tests", () => {
  let mockSessionRepo: any;
  let mockQuestionRepo: any;
  let mockAnswerRepo: any;
  let mockAIService: any;
  let mockTemplateService: any;
  let service: InterviewSessionService;

  const testUserId = "candidate-phase3-user-123";
  const testSessionId = new Types.ObjectId().toString();
  const testQuestion1Id = new Types.ObjectId().toString();
  const testQuestion2Id = new Types.ObjectId().toString();

  const mockSessionDoc: any = {
    _id: new Types.ObjectId(testSessionId),
    userId: testUserId,
    role: "React Developer",
    experienceLevel: "mid",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.MEDIUM,
    mode: InterviewMode.TEXT,
    durationMinutes: 30,
    totalQuestions: 2,
    currentQuestionIndex: 0,
    status: InterviewSessionStatus.PENDING,
    startedAt: null,
    completedAt: null,
  };

  const mockQuestionsList: any[] = [
    {
      _id: new Types.ObjectId(testQuestion1Id),
      sessionId: new Types.ObjectId(testSessionId),
      sequence: 1,
      questionText: "Explain how React 19 useActionState simplifies form handling.",
      category: "React 19 Hooks",
      difficulty: InterviewDifficulty.MEDIUM,
      questionType: InterviewType.TECHNICAL,
      expectedConcepts: ["Action State", "Optimistic Updates", "Pending State"],
      source: QuestionSource.GENERATED,
    },
    {
      _id: new Types.ObjectId(testQuestion2Id),
      sessionId: new Types.ObjectId(testSessionId),
      sequence: 2,
      questionText: "How do Server Components (RSC) impact bundle size and hydration?",
      category: "Server Components",
      difficulty: InterviewDifficulty.MEDIUM,
      questionType: InterviewType.TECHNICAL,
      expectedConcepts: ["Zero Bundle Size", "Selective Hydration", "Streaming"],
      source: QuestionSource.GENERATED,
    },
  ];

  beforeEach(() => {
    mockSessionRepo = {
      findByUserAndId: vi.fn().mockImplementation((uid, sid) => {
        if (uid === testUserId && sid.toString() === testSessionId) {
          return Promise.resolve({ ...mockSessionDoc });
        }
        return Promise.resolve(null);
      }),
      updateProgress: vi.fn().mockResolvedValue(true),
    };

    mockQuestionRepo = {
      findBySessionId: vi.fn().mockResolvedValue([...mockQuestionsList]),
      insertFollowUpQuestion: vi.fn().mockImplementation((sid, seq, qdata) => {
        return Promise.resolve({
          _id: new Types.ObjectId(),
          sessionId: new Types.ObjectId(sid.toString()),
          sequence: seq + 1,
          ...qdata,
        });
      }),
    };

    mockAnswerRepo = {
      findBySessionId: vi.fn().mockResolvedValue([]),
      upsertAnswer: vi.fn().mockImplementation((sid, qid, uid, text, dur) => {
        return Promise.resolve({
          _id: new Types.ObjectId(),
          sessionId: new Types.ObjectId(sid.toString()),
          questionId: new Types.ObjectId(qid.toString()),
          userId: uid,
          answerText: text,
          responseDurationSeconds: dur,
          submittedAt: new Date(),
        });
      }),
    };

    mockAIService = {
      generateFollowUpQuestion: vi.fn().mockResolvedValue({
        followUpQuestionText: "Could you elaborate on how you handle server error boundaries in that scenario?",
        category: "React 19 Hooks",
        expectedConcepts: ["Error Boundaries", "Fallback UI"],
      }),
    };

    mockTemplateService = {};

    service = new InterviewSessionService(
      mockSessionRepo,
      mockQuestionRepo,
      mockAnswerRepo,
      mockAIService as any,
      mockTemplateService as any
    );
  });

  it("should start a pending session, transition to in_progress, and return Question 1", async () => {
    const result = await service.startOrResumeSession(testUserId, testSessionId);

    expect(result).toBeDefined();
    expect(result.session.status).toBe(InterviewSessionStatus.IN_PROGRESS);
    expect(mockSessionRepo.updateProgress).toHaveBeenCalledWith(
      mockSessionDoc._id,
      expect.objectContaining({
        status: InterviewSessionStatus.IN_PROGRESS,
      })
    );
    expect(result.currentQuestion).toBeDefined();
    expect(result.currentQuestion?.sequence).toBe(1);
    expect(result.progress.isCompleted).toBe(false);
    expect(result.progress.answeredCount).toBe(0);
    expect(result.progress.totalQuestions).toBe(2);
  });

  it("should throw InterviewSessionNotFoundError if session belongs to another candidate", async () => {
    await expect(
      service.startOrResumeSession("attacker-user-999", testSessionId)
    ).rejects.toThrow(InterviewSessionNotFoundError);
  });

  it("should submit answer for question 1, advance to next question, and trigger follow-up on short answers", async () => {
    const shortAnswer = "useActionState is a hook for managing state based on the result of an action.";

    const result = await service.submitAnswer(testUserId, testSessionId, {
      questionId: testQuestion1Id,
      answerText: shortAnswer,
      responseDurationSeconds: 45,
    });

    expect(result).toBeDefined();
    expect(result.answer.answerText).toBe(shortAnswer);
    expect(mockAnswerRepo.upsertAnswer).toHaveBeenCalledWith(
      testSessionId,
      testQuestion1Id,
      testUserId,
      shortAnswer,
      45
    );
    // Verified follow-up generated
    expect(result.followUpGenerated).toBe(true);
    expect(mockAIService.generateFollowUpQuestion).toHaveBeenCalled();
    expect(mockQuestionRepo.insertFollowUpQuestion).toHaveBeenCalled();
  });

  it("should transition session to COMPLETED when final question is answered", async () => {
    // Mock that Question 1 is already answered and Question 2 is being answered
    const existingAnswerQ1 = {
      _id: new Types.ObjectId(),
      sessionId: new Types.ObjectId(testSessionId),
      questionId: new Types.ObjectId(testQuestion1Id),
      userId: testUserId,
      answerText: "Answer 1",
    };
    const answerQ2 = {
      _id: new Types.ObjectId(),
      sessionId: new Types.ObjectId(testSessionId),
      questionId: new Types.ObjectId(testQuestion2Id),
      userId: testUserId,
      answerText: "Answer 2 with sufficient detailed explanation on server components streaming and hydration without needing a follow up.",
    };

    // Note: submitAnswer calls findBySessionId once at line 340
    mockAnswerRepo.findBySessionId.mockResolvedValue([existingAnswerQ1, answerQ2]);

    const fullAnswer =
      "React Server Components execute entirely on the server and emit serialized Virtual DOM elements over a streaming JSON chunk format, resulting in 0kb client JavaScript bundle size and faster Time to Interactive.";

    const result = await service.submitAnswer(testUserId, testSessionId, {
      questionId: testQuestion2Id,
      answerText: fullAnswer,
      responseDurationSeconds: 120,
    });

    expect(result.isCompleted).toBe(true);
    expect(result.nextQuestion).toBeNull();
    expect(mockSessionRepo.updateProgress).toHaveBeenCalledWith(
      mockSessionDoc._id,
      expect.objectContaining({
        status: InterviewSessionStatus.COMPLETED,
      })
    );
  });

  it("should prevent answer submission if session is already completed", async () => {
    mockSessionRepo.findByUserAndId.mockResolvedValue({
      ...mockSessionDoc,
      status: InterviewSessionStatus.COMPLETED,
    });

    await expect(
      service.submitAnswer(testUserId, testSessionId, {
        questionId: testQuestion1Id,
        answerText: "Trying to submit late answer",
      })
    ).rejects.toThrow(InterviewInvalidStateError);
  });

  it("should reject answers for question IDs that do not belong to the session", async () => {
    const invalidQuestionId = new Types.ObjectId().toString();

    await expect(
      service.submitAnswer(testUserId, testSessionId, {
        questionId: invalidQuestionId,
        answerText: "Some text",
      })
    ).rejects.toThrow(InterviewInvalidStateError);
  });
});
