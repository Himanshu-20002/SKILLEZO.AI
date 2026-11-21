import { describe, it, expect, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import {
  InterviewEvaluationService,
  RUBRIC_WEIGHTS,
} from "@/modules/interview-coach/services/interview-evaluation.service";
import { InterviewEvaluationAIService } from "@/modules/interview-coach/services/interview-evaluation-ai.service";
import {
  InterviewType,
  InterviewDifficulty,
  InterviewSessionStatus,
  InterviewMode,
  QuestionSource,
} from "@/modules/interview-coach/domain/interview.enums";
import {
  InterviewSessionNotFoundError,
  InterviewInvalidStateError,
} from "@/modules/interview-coach/domain/interview.errors";

describe("Phase 4: AI Evaluation & Scoring Engine Unit Tests", () => {
  let mockSessionRepo: any;
  let mockQuestionRepo: any;
  let mockAnswerRepo: any;
  let mockEvalRepo: any;
  let mockReportRepo: any;
  let mockAIService: any;
  let service: InterviewEvaluationService;

  const testUserId = "candidate-eval-user-404";
  const testSessionId = new Types.ObjectId().toString();
  const testQuestionId = new Types.ObjectId().toString();
  const testAnswerId = new Types.ObjectId().toString();

  const mockSessionDoc: any = {
    _id: new Types.ObjectId(testSessionId),
    userId: testUserId,
    role: "React Developer",
    experienceLevel: "senior",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.HARD,
    mode: InterviewMode.TEXT,
    durationMinutes: 30,
    totalQuestions: 1,
    status: InterviewSessionStatus.IN_PROGRESS,
  };

  const mockQuestionDoc: any = {
    _id: new Types.ObjectId(testQuestionId),
    sessionId: new Types.ObjectId(testSessionId),
    sequence: 1,
    questionText: "How does React 19 handle Server Components and selective hydration?",
    category: "Server Components",
    difficulty: InterviewDifficulty.HARD,
    questionType: InterviewType.TECHNICAL,
    expectedConcepts: ["Streaming SSR", "0kb Client Bundle", "Selective Hydration"],
    source: QuestionSource.GENERATED,
  };

  const mockAnswerDoc: any = {
    _id: new Types.ObjectId(testAnswerId),
    sessionId: new Types.ObjectId(testSessionId),
    questionId: new Types.ObjectId(testQuestionId),
    userId: testUserId,
    answerText:
      "React Server Components render on the server and emit serialized virtual DOM chunks over streaming JSON, completely bypassing the client bundle. Selective hydration allows interactive parts to hydrate asynchronously.",
    responseDurationSeconds: 110,
    submittedAt: new Date(),
  };

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
      findBySessionId: vi.fn().mockResolvedValue([{ ...mockQuestionDoc }]),
    };

    mockAnswerRepo = {
      findBySessionId: vi.fn().mockResolvedValue([{ ...mockAnswerDoc }]),
    };

    mockEvalRepo = {
      upsertEvaluation: vi.fn().mockImplementation((data) => ({
        _id: new Types.ObjectId(),
        ...data,
      })),
      findBySessionId: vi.fn().mockResolvedValue([]),
    };

    mockReportRepo = {
      upsertReport: vi.fn().mockImplementation((data) => ({
        _id: new Types.ObjectId(),
        ...data,
      })),
      findBySessionId: vi.fn().mockResolvedValue(null),
    };

    mockAIService = {
      evaluateAnswer: vi.fn().mockResolvedValue({
        scores: {
          technicalAccuracy: 90,
          problemSolvingDepth: 85,
          answerStructure: 80,
          conceptCoverage: 85,
          communicationTone: 90,
        },
        evidence: ["Directly referenced 0kb client bundle and selective hydration."],
        strengths: ["Strong architectural understanding of streaming SSR."],
        improvementAreas: ["Mention error boundary handling during stream interruption."],
        keyConceptsIdentified: ["Streaming SSR", "Selective Hydration"],
        modelAnswerSuggestion: "A comprehensive senior model answer...",
      }),
    };

    service = new InterviewEvaluationService(
      mockSessionRepo,
      mockQuestionRepo,
      mockAnswerRepo,
      mockEvalRepo,
      mockReportRepo,
      mockAIService as any
    );
  });

  it("should evaluate a session, persist evaluations & report, and return structured summary", async () => {
    const result = await service.evaluateSession(testUserId, testSessionId);

    expect(result).toBeDefined();
    expect(result.evaluations.length).toBe(1);
    expect(mockAIService.evaluateAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "React Developer",
        category: "Server Components",
        candidateAnswerText: mockAnswerDoc.answerText,
      })
    );

    expect(mockEvalRepo.upsertEvaluation).toHaveBeenCalledTimes(1);
    expect(mockReportRepo.upsertReport).toHaveBeenCalledTimes(1);

    // Verify deterministic overall score calculation:
    // Technical weights: Tech 30%, Depth 25%, Structure 20%, Coverage 15%, Comm 10%
    // (90 * 0.3) + (85 * 0.25) + (80 * 0.2) + (85 * 0.15) + (90 * 0.1) = 27 + 21.25 + 16 + 12.75 + 9 = 86
    expect(result.report.overallScore).toBe(86);
    expect(result.report.readinessLevel).toBe("interview_ready");
  });

  it("should throw InterviewSessionNotFoundError if session belongs to another user", async () => {
    await expect(
      service.evaluateSession("attacker-user-999", testSessionId)
    ).rejects.toThrow(InterviewSessionNotFoundError);
  });

  it("should return a graceful baseline report if session has zero submitted answers", async () => {
    mockAnswerRepo.findBySessionId.mockResolvedValue([]);

    const result = await service.evaluateSession(testUserId, testSessionId);
    expect(result.report).toBeDefined();
    expect(result.report.overallScore).toBe(0);
    expect(result.report.readinessLevel).toBe("needs_practice");
    expect(result.evaluations).toHaveLength(1);
    expect(result.evaluations[0].question).toBeDefined();
  });

  it("should verify deterministic scoring aggregation weights sum to 100% across all interview types", () => {
    for (const type of Object.values(InterviewType)) {
      const weights = RUBRIC_WEIGHTS[type];
      const sum =
        weights.technicalAccuracy +
        weights.problemSolvingDepth +
        weights.answerStructure +
        weights.conceptCoverage +
        weights.communicationTone;

      expect(Math.round(sum * 100) / 100).toBe(1.0);
    }
  });

  it("should map readiness levels correctly according to strict thresholds", () => {
    expect(service.mapReadinessLevel(95)).toBe("role_model");
    expect(service.mapReadinessLevel(90)).toBe("role_model");
    expect(service.mapReadinessLevel(85)).toBe("interview_ready");
    expect(service.mapReadinessLevel(75)).toBe("interview_ready");
    expect(service.mapReadinessLevel(74)).toBe("developing");
    expect(service.mapReadinessLevel(55)).toBe("developing");
    expect(service.mapReadinessLevel(54)).toBe("needs_practice");
    expect(service.mapReadinessLevel(20)).toBe("needs_practice");
  });

  it("should evaluate heuristically with valid bounded scores when AI provider is offline", () => {
    const heuristicService = new InterviewEvaluationAIService({
      isAvailable: () => false,
    } as any);

    const result = heuristicService.evaluateHeuristically({
      role: "React Developer",
      experienceLevel: "senior",
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.HARD,
      questionText: mockQuestionDoc.questionText,
      category: mockQuestionDoc.category,
      expectedConcepts: mockQuestionDoc.expectedConcepts,
      candidateAnswerText: mockAnswerDoc.answerText,
    });

    expect(result.scores.technicalAccuracy).toBeGreaterThanOrEqual(0);
    expect(result.scores.technicalAccuracy).toBeLessThanOrEqual(100);
    expect(result.scores.problemSolvingDepth).toBeGreaterThanOrEqual(0);
    expect(result.scores.problemSolvingDepth).toBeLessThanOrEqual(100);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.improvementAreas.length).toBeGreaterThan(0);
  });
});

