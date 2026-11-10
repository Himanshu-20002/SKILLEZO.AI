import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import {
  InterviewTemplateService,
  INITIAL_ROLE_CATALOG,
} from "@/modules/interview-coach/services/interview-template.service";
import {
  InterviewAIService,
  GeneratedQuestionPlanSchema,
} from "@/modules/interview-coach/services/interview-ai.service";
import { InterviewSessionService } from "@/modules/interview-coach/services/interview-session.service";
import {
  InterviewSessionRepository,
  InterviewTemplateRepository,
  InterviewQuestionRepository,
} from "@/database/repositories/interview";
import {
  InterviewType,
  InterviewDifficulty,
  InterviewMode,
  InterviewSessionStatus,
} from "@/modules/interview-coach/domain/interview.enums";

describe("Module: Interview Coach — Phase 2: Configuration & Question Engine", () => {
  describe("1. Role & Template Catalog Service", () => {
    it("should define all 10 core technical and analytical roles", () => {
      const roles = INITIAL_ROLE_CATALOG.map((b) => b.role);
      expect(roles).toContain("React Developer");
      expect(roles).toContain(".NET Developer");
      expect(roles).toContain("MERN Developer");
      expect(roles).toContain("Python Developer");
      expect(roles).toContain("Java Developer");
      expect(roles).toContain("Data Analyst");
      expect(roles).toContain("AI/ML Specialist");
      expect(roles).toContain("Cloud Engineer");
      expect(roles).toContain("DevOps Engineer");
      expect(roles).toContain("Business Analyst");
      expect(INITIAL_ROLE_CATALOG.length).toBe(10);
    });

    it("should return active templates with defined competency areas", async () => {
      const mockRepo = {
        count: vi.fn().mockResolvedValue(10),
        findActiveTemplates: vi.fn().mockResolvedValue(INITIAL_ROLE_CATALOG),
        findByRoleAndType: vi.fn(),
      } as unknown as InterviewTemplateRepository;

      const service = new InterviewTemplateService(mockRepo);
      const templates = await service.getTemplates();

      expect(templates.length).toBe(10);
      const reactTpl = templates.find((t) => t.role === "React Developer");
      expect(reactTpl).toBeDefined();
      expect(reactTpl?.competencyAreas.length).toBeGreaterThan(0);
    });
  });

  describe("2. Gemini Question Plan Schema Validation", () => {
    it("should validate a well-formed Gemini question plan", () => {
      const samplePlan = {
        role: "React Developer",
        seniority: "mid",
        questions: [
          {
            sequence: 1,
            questionText: "How do React 19 Server Actions handle optimistic state updates?",
            category: "React 19 & State",
            difficulty: InterviewDifficulty.MEDIUM,
            questionType: InterviewType.TECHNICAL,
            expectedConcepts: ["useOptimistic", "Server Action", "Rollback handling"],
          },
          {
            sequence: 2,
            questionText: "Explain the difference between client-side rendering and streaming SSR with Suspense.",
            category: "SSR & Architecture",
            difficulty: InterviewDifficulty.MEDIUM,
            questionType: InterviewType.TECHNICAL,
            expectedConcepts: ["HTML streaming", "Hydration boundaries", "TTFB"],
          },
        ],
      };

      const result = GeneratedQuestionPlanSchema.safeParse(samplePlan);
      expect(result.success).toBe(true);
    });

    it("should reject question plans missing expected concepts or question text", () => {
      const badPlan = {
        role: "React Developer",
        seniority: "mid",
        questions: [
          {
            sequence: 1,
            questionText: "Too short",
            category: "React",
            difficulty: "easy",
            questionType: "technical",
            expectedConcepts: [], // Empty concepts rejected
          },
        ],
      };

      const result = GeneratedQuestionPlanSchema.safeParse(badPlan);
      expect(result.success).toBe(false);
    });
  });

  describe("3. Deterministic Fallback Question Generator", () => {
    it("should generate the exact requested question count when AI is unavailable", () => {
      const aiService = new InterviewAIService({
        isAvailable: () => false,
      } as any);

      const questions = aiService.generateFallbackQuestions({
        role: "React Developer",
        experienceLevel: "mid",
        interviewType: InterviewType.TECHNICAL,
        difficulty: InterviewDifficulty.MEDIUM,
        totalQuestions: 5,
        durationMinutes: 30,
      });

      expect(questions.length).toBe(5);
      expect(questions[0].sequence).toBe(1);
      expect(questions[4].sequence).toBe(5);
      expect(questions[0].questionText.length).toBeGreaterThan(20);
      expect(questions[0].expectedConcepts.length).toBeGreaterThan(0);
      expect(questions[0].difficulty).toBe(InterviewDifficulty.MEDIUM);
    });

    it("should adapt question prompts for Behavioral and STAR format", () => {
      const aiService = new InterviewAIService({
        isAvailable: () => false,
      } as any);

      const questions = aiService.generateFallbackQuestions({
        role: "DevOps Engineer",
        experienceLevel: "senior",
        interviewType: InterviewType.BEHAVIORAL,
        difficulty: InterviewDifficulty.HARD,
        totalQuestions: 3,
        durationMinutes: 20,
      });

      expect(questions.length).toBe(3);
      expect(questions[0].questionType).toBe(InterviewType.BEHAVIORAL);
      expect(questions[0].questionText).toContain("Describe a complex challenge");
      expect(questions[0].expectedConcepts).toContain("Measurable Impact");
    });
  });

  describe("4. Session Creation & Question Persistence Integration", () => {
    let sessionRepo: any;
    let questionRepo: any;
    let aiService: any;
    let templateService: any;
    let service: InterviewSessionService;

    const candidateId = "usr_cand_456";
    const sessionId = new mongoose.Types.ObjectId();

    beforeEach(() => {
      sessionRepo = {
        create: vi.fn().mockImplementation((data) => ({
          _id: sessionId,
          ...data,
          createdAt: new Date(),
        })),
        findByUserAndId: vi.fn(),
        listByUserId: vi.fn(),
      };

      questionRepo = {
        createManyQuestions: vi.fn().mockImplementation((qs) =>
          qs.map((q: any, i: number) => ({
            _id: new mongoose.Types.ObjectId(),
            ...q,
          }))
        ),
        findBySessionId: vi.fn(),
      };

      aiService = {
        generateQuestionPlan: vi.fn().mockResolvedValue([
          {
            sequence: 1,
            questionText: "What is the difference between SQL and NoSQL?",
            category: "Databases",
            difficulty: InterviewDifficulty.MEDIUM,
            questionType: InterviewType.TECHNICAL,
            expectedConcepts: ["ACID", "Horizontal Scaling"],
          },
          {
            sequence: 2,
            questionText: "How do database indexes improve search performance?",
            category: "Databases",
            difficulty: InterviewDifficulty.MEDIUM,
            questionType: InterviewType.TECHNICAL,
            expectedConcepts: ["B-Tree", "Scan vs Seek"],
          },
        ]),
      };

      templateService = {
        getTemplateForRole: vi.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          role: "Data Analyst",
          competencyAreas: ["SQL", "Data Modeling"],
        }),
      };

      service = new InterviewSessionService(
        sessionRepo,
        questionRepo,
        aiService,
        templateService
      );
    });

    it("should create an interview session and bulk-insert questions", async () => {
      const result = await service.createSession(candidateId, {
        role: "Data Analyst",
        experienceLevel: "junior",
        interviewType: InterviewType.TECHNICAL,
        difficulty: InterviewDifficulty.MEDIUM,
        mode: InterviewMode.TEXT,
        durationMinutes: 15,
        totalQuestions: 2,
      });

      expect(result.session).toBeDefined();
      expect(result.session.role).toBe("Data Analyst");
      expect(result.session.status).toBe(InterviewSessionStatus.PENDING);
      expect(result.questions.length).toBe(2);
      expect(questionRepo.createManyQuestions).toHaveBeenCalledTimes(1);
      expect(aiService.generateQuestionPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "Data Analyst",
          totalQuestions: 2,
        })
      );
    });

    it("should retrieve questions for an authenticated session owner", async () => {
      sessionRepo.findByUserAndId.mockResolvedValue({
        _id: sessionId,
        userId: candidateId,
      });

      questionRepo.findBySessionId.mockResolvedValue([
        { sequence: 1, questionText: "Q1" },
        { sequence: 2, questionText: "Q2" },
      ]);

      const questions = await service.getSessionQuestions(
        candidateId,
        sessionId.toString()
      );
      expect(questions.length).toBe(2);
      expect(sessionRepo.findByUserAndId).toHaveBeenCalledWith(
        candidateId,
        sessionId.toString()
      );
    });
  });
});

