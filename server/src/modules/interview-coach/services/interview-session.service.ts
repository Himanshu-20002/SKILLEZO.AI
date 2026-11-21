import { Types } from "mongoose";
import {
  InterviewSessionRepository,
  InterviewQuestionRepository,
  InterviewAnswerRepository,
  ListSessionsOptions,
} from "@/database/repositories/interview";
import { IInterviewSession } from "@/database/models/InterviewSession.model";
import { IInterviewQuestion } from "@/database/models/InterviewQuestion.model";
import { IInterviewAnswer } from "@/database/models/InterviewAnswer.model";
import { ResumeModel } from "@/database/models/Resume.model";
import {
  InterviewSessionNotFoundError,
  InterviewInvalidStateError,
} from "../domain/interview.errors";
import {
  InterviewSessionStatus,
  QuestionSource,
} from "../domain/interview.enums";
import { PaginationResult } from "@/database/repositories/types";
import {
  InterviewAIService,
  interviewAIService,
} from "./interview-ai.service";
import {
  InterviewTemplateService,
  interviewTemplateService,
} from "./interview-template.service";
import {
  CreateSessionInput,
  SubmitAnswerInput,
} from "../validation/interview.schemas";
import { getMonetizationConfig } from "@/database/models/MonetizationConfig.model";
import { SubscriptionModel, PlanTier, SubscriptionStatus } from "@/database/models/Subscription.model";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export interface CreateSessionResult {
  session: IInterviewSession;
  questions: IInterviewQuestion[];
}

export interface StartOrResumeSessionResult {
  session: IInterviewSession;
  questions: IInterviewQuestion[];
  answers: IInterviewAnswer[];
  currentQuestion: IInterviewQuestion | null;
  progress: {
    answeredCount: number;
    totalQuestions: number;
    currentSequence: number;
    isCompleted: boolean;
  };
}

export interface SubmitAnswerResult {
  answer: IInterviewAnswer;
  nextQuestion: IInterviewQuestion | null;
  followUpGenerated: boolean;
  isCompleted: boolean;
  progress: {
    answeredCount: number;
    totalQuestions: number;
    isCompleted: boolean;
  };
}

export class InterviewSessionService {
  constructor(
    private readonly sessionRepo: InterviewSessionRepository,
    private readonly questionRepo: InterviewQuestionRepository = new InterviewQuestionRepository(),
    private readonly answerRepo: InterviewAnswerRepository = new InterviewAnswerRepository(),
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
    // 0. Quota check against dynamic MonetizationConfig
    const config = await getMonetizationConfig();
    const subscription = await SubscriptionModel.findOne({ userId });
    const isPro =
      subscription &&
      (subscription.tier === PlanTier.PRO || subscription.tier === PlanTier.ENTERPRISE) &&
      subscription.status === SubscriptionStatus.ACTIVE;

    if (!isPro) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyUsage = await this.sessionRepo.countSessionsSince(userId, startOfMonth);
      const freeLimit = config.interviewQuotas.freeMonthlySessions;

      if (monthlyUsage >= freeLimit) {
        throw new AppError(
          `Monthly free mock interview limit reached (${monthlyUsage}/${freeLimit} sessions used this month). Upgrade to SKILLEZO Pro or activate a 7-Day Sprint Pass for unlimited practice.`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.PLAN_UPGRADE_REQUIRED
        );
      }

      // Enforce free tier bounds
      input.totalQuestions = Math.min(
        input.totalQuestions,
        config.interviewQuotas.freeMaxQuestionsPerSession
      );
    }

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
    await this.getSessionById(userId, sessionId);
    return await this.questionRepo.findBySessionId(sessionId);
  }

  /**
   * Start or resume an interview session, returning current question & state
   */
  async startOrResumeSession(
    userId: string,
    sessionId: string
  ): Promise<StartOrResumeSessionResult> {
    const session = await this.getSessionById(userId, sessionId);

    // If pending, transition to in_progress
    if (session.status === InterviewSessionStatus.PENDING) {
      await this.sessionRepo.updateProgress(session._id, {
        status: InterviewSessionStatus.IN_PROGRESS,
        startedAt: new Date(),
      });
      session.status = InterviewSessionStatus.IN_PROGRESS;
      session.startedAt = new Date();
    }

    const questions = await this.questionRepo.findBySessionId(sessionId);
    const answers = await this.answerRepo.findBySessionId(sessionId);

    // Build map of answered question IDs
    const answeredMap = new Set(answers.map((a) => a.questionId.toString()));

    // Find the first unanswered question in sequential order
    const currentQuestion =
      questions.find((q) => !answeredMap.has(q._id.toString())) || null;

    const isCompleted =
      session.status === InterviewSessionStatus.COMPLETED ||
      (questions.length > 0 && answers.length >= questions.length);

    // If all questions are answered but status isn't marked completed, finalize it
    if (isCompleted && session.status !== InterviewSessionStatus.COMPLETED) {
      await this.sessionRepo.updateProgress(session._id, {
        status: InterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
      });
      session.status = InterviewSessionStatus.COMPLETED;
    }

    return {
      session,
      questions,
      answers,
      currentQuestion,
      progress: {
        answeredCount: answers.length,
        totalQuestions: questions.length,
        currentSequence: currentQuestion ? currentQuestion.sequence : questions.length,
        isCompleted,
      },
    };
  }

  /**
   * Submits candidate's answer for a question, persists it idempotently,
   * checks for follow-up triggers, advances state, and completes session if done.
   */
  async submitAnswer(
    userId: string,
    sessionId: string,
    input: SubmitAnswerInput
  ): Promise<SubmitAnswerResult> {
    const session = await this.getSessionById(userId, sessionId);

    if (session.status === InterviewSessionStatus.COMPLETED) {
      throw new InterviewInvalidStateError(
        "Cannot submit answers to a completed interview session."
      );
    }

    // Verify question belongs to this session
    const questions = await this.questionRepo.findBySessionId(sessionId);
    const targetQuestion = questions.find(
      (q) => q._id.toString() === input.questionId
    );

    if (!targetQuestion) {
      throw new InterviewInvalidStateError(
        `Question ${input.questionId} does not belong to session ${sessionId}.`
      );
    }

    // Upsert answer idempotently
    const persistedAnswer = await this.answerRepo.upsertAnswer(
      sessionId,
      input.questionId,
      userId,
      input.answerText,
      input.responseDurationSeconds
    );

    // Check if adaptive follow-up question should be triggered
    // Trigger condition: answer is brief (< 40 words) and session hasn't exceeded 12 questions
    const wordCount = input.answerText.trim().split(/\s+/).filter(Boolean).length;
    let followUpGenerated = false;

    if (wordCount < 40 && questions.length < 12 && !targetQuestion.parentQuestionId) {
      try {
        const followUp = await this.aiService.generateFollowUpQuestion({
          role: session.role,
          experienceLevel: session.experienceLevel,
          interviewType: session.interviewType,
          difficulty: session.difficulty,
          questionText: targetQuestion.questionText,
          category: targetQuestion.category,
          candidateAnswerText: input.answerText,
          expectedConcepts: targetQuestion.expectedConcepts,
        });

        // Insert follow-up question directly after current question
        await this.questionRepo.insertFollowUpQuestion(
          sessionId,
          targetQuestion.sequence,
          {
            questionText: followUp.followUpQuestionText,
            category: followUp.category,
            difficulty: targetQuestion.difficulty,
            questionType: targetQuestion.questionType,
            expectedConcepts: followUp.expectedConcepts,
            parentQuestionId: targetQuestion._id,
            source: QuestionSource.GENERATED,
          }
        );

        // Increment total questions on session
        await this.sessionRepo.updateProgress(session._id, {
          totalQuestions: questions.length + 1,
        });

        followUpGenerated = true;
      } catch (err) {
        console.warn("[InterviewSessionService] Follow-up generation warning:", err);
      }
    }

    // Re-fetch questions and answers to evaluate progress accurately
    const updatedQuestions = await this.questionRepo.findBySessionId(sessionId);
    const updatedAnswers = await this.answerRepo.findBySessionId(sessionId);
    const answeredMap = new Set(updatedAnswers.map((a) => a.questionId.toString()));

    const nextQuestion =
      updatedQuestions.find((q) => !answeredMap.has(q._id.toString())) || null;

    const isCompleted = !nextQuestion && updatedAnswers.length >= updatedQuestions.length;

    if (isCompleted) {
      await this.sessionRepo.updateProgress(session._id, {
        status: InterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
        currentQuestionIndex: updatedQuestions.length,
      });
    } else if (nextQuestion) {
      await this.sessionRepo.updateProgress(session._id, {
        currentQuestionIndex: nextQuestion.sequence - 1,
      });
    }

    return {
      answer: persistedAnswer,
      nextQuestion,
      followUpGenerated,
      isCompleted,
      progress: {
        answeredCount: updatedAnswers.length,
        totalQuestions: updatedQuestions.length,
        isCompleted,
      },
    };
  }

  /**
   * Explicitly concludes an interview session
   */
  async completeSession(
    userId: string,
    sessionId: string
  ): Promise<IInterviewSession> {
    const session = await this.getSessionById(userId, sessionId);

    await this.sessionRepo.updateProgress(session._id, {
      status: InterviewSessionStatus.COMPLETED,
      completedAt: new Date(),
    });

    session.status = InterviewSessionStatus.COMPLETED;
    session.completedAt = new Date();
    return session;
  }

  /**
   * Retrieves all answers submitted by the candidate for a session
   */
  async getSessionAnswers(
    userId: string,
    sessionId: string
  ): Promise<IInterviewAnswer[]> {
    await this.getSessionById(userId, sessionId);
    return await this.answerRepo.findBySessionId(sessionId);
  }
}

export const interviewSessionService = new InterviewSessionService(
  new InterviewSessionRepository(),
  new InterviewQuestionRepository(),
  new InterviewAnswerRepository(),
  interviewAIService,
  interviewTemplateService
);
