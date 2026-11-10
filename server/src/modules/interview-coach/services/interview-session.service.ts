import { Types } from "mongoose";
import {
  InterviewSessionRepository,
  InterviewQuestionRepository,
  ListSessionsOptions,
} from "@/database/repositories/interview";
import { IInterviewSession } from "@/database/models/InterviewSession.model";
import { IInterviewQuestion } from "@/database/models/InterviewQuestion.model";
import { ResumeModel } from "@/database/models/Resume.model";
import { InterviewSessionNotFoundError } from "../domain/interview.errors";
import { InterviewSessionStatus, QuestionSource } from "../domain/interview.enums";
import { PaginationResult } from "@/database/repositories/types";
import {
  InterviewAIService,
  interviewAIService,
} from "./interview-ai.service";
import {
  InterviewTemplateService,
  interviewTemplateService,
} from "./interview-template.service";
import { CreateSessionInput } from "../validation/interview.schemas";

export interface CreateSessionResult {
  session: IInterviewSession;
  questions: IInterviewQuestion[];
}

export class InterviewSessionService {
  constructor(
    private readonly sessionRepo: InterviewSessionRepository,
    private readonly questionRepo: InterviewQuestionRepository = new InterviewQuestionRepository(),
    private readonly aiService: InterviewAIService = interviewAIService,
    private readonly templateService: InterviewTemplateService = interviewTemplateService
  ) {}

  /**
   * Health status for the interview coach module
   */
  getHealth(): { status: string; module: string; phase: number } {
    return {
      status: "ok",
      module: "interview-coach",
      phase: 2,
    };
  }

  /**
   * Get paginated sessions for an authenticated candidate
   */
  async getUserSessions(
    userId: string,
    options: ListSessionsOptions = {}
  ): Promise<PaginationResult<IInterviewSession>> {
    return await this.sessionRepo.listByUserId(userId, options);
  }

  /**
   * Get a single session by ID, strictly enforcing user ownership
   */
  async getSessionById(userId: string, sessionId: string): Promise<IInterviewSession> {
    const session = await this.sessionRepo.findByUserAndId(userId, sessionId);
    if (!session) {
      throw new InterviewSessionNotFoundError(sessionId);
    }
    return session;
  }

  /**
   * Create an interview session and generate the initial calibrated question plan
   */
  async createSession(
    userId: string,
    input: CreateSessionInput
  ): Promise<CreateSessionResult> {
    // 1. Fetch template competencies if matching role exists
    const template = await this.templateService.getTemplateForRole(
      input.role,
      input.interviewType
    );

    // 2. Fetch candidate resume skills if resumeId provided and authorized
    let resumeSkills: string[] | undefined;
    if (input.resumeId && Types.ObjectId.isValid(input.resumeId)) {
      try {
        const resumeDoc = await ResumeModel.findOne({
          _id: new Types.ObjectId(input.resumeId),
          userId,
        }).select("extractedSkills skills targetRole");
        if (resumeDoc) {
          const extracted = (resumeDoc as any).extractedSkills || [];
          const declared = (resumeDoc as any).skills || [];
          resumeSkills = Array.from(new Set([...extracted, ...declared]));
        }
      } catch (err) {
        console.warn("[InterviewSessionService] Resume skills fetch warning:", err);
      }
    }

    // 3. Generate question plan via AI engine with deterministic fallback
    const generatedPlan = await this.aiService.generateQuestionPlan({
      role: input.role,
      experienceLevel: input.experienceLevel,
      interviewType: input.interviewType,
      difficulty: input.difficulty,
      totalQuestions: input.totalQuestions,
      durationMinutes: input.durationMinutes,
      resumeSkills,
      competencyAreas: template?.competencyAreas,
    });

    // 4. Create InterviewSession document in MongoDB
    const sessionDoc = await this.sessionRepo.create({
      userId,
      role: input.role,
      experienceLevel: input.experienceLevel,
      interviewType: input.interviewType,
      difficulty: input.difficulty,
      mode: input.mode,
      durationMinutes: input.durationMinutes,
      totalQuestions: generatedPlan.length,
      currentQuestionIndex: 0,
      status: InterviewSessionStatus.PENDING,
      templateId: template?._id || (input.templateId ? new Types.ObjectId(input.templateId) : null),
      resumeId: input.resumeId ? new Types.ObjectId(input.resumeId) : null,
      startedAt: null,
      completedAt: null,
    } as any);

    // 5. Bulk-insert questions linked to sessionId
    const questionPayloads = generatedPlan.map((q) => ({
      sessionId: sessionDoc._id,
      sequence: q.sequence,
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty,
      questionType: q.questionType,
      expectedConcepts: q.expectedConcepts,
      evaluationRubricVersion: "1.0",
      source: QuestionSource.GENERATED,
    }));

    const persistedQuestions = await this.questionRepo.createManyQuestions(
      questionPayloads as any
    );

    return {
      session: sessionDoc,
      questions: persistedQuestions,
    };
  }

  /**
   * Retrieve all questions for a session, strictly validating candidate ownership
   */
  async getSessionQuestions(
    userId: string,
    sessionId: string
  ): Promise<IInterviewQuestion[]> {
    // Verify ownership first
    await this.getSessionById(userId, sessionId);
    return await this.questionRepo.findBySessionId(sessionId);
  }
}

export const interviewSessionService = new InterviewSessionService(
  new InterviewSessionRepository(),
  new InterviewQuestionRepository(),
  interviewAIService,
  interviewTemplateService
);
