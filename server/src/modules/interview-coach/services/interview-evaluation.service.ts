import { Types } from "mongoose";
import {
  InterviewSessionRepository,
  InterviewQuestionRepository,
  InterviewAnswerRepository,
  InterviewEvaluationRepository,
  InterviewReportRepository,
} from "@/database/repositories/interview";
import { IInterviewSession } from "@/database/models/InterviewSession.model";
import { IInterviewQuestion } from "@/database/models/InterviewQuestion.model";
import { IInterviewAnswer } from "@/database/models/InterviewAnswer.model";
import { IInterviewEvaluation } from "@/database/models/InterviewEvaluation.model";
import { IInterviewReport } from "@/database/models/InterviewReport.model";
import {
  InterviewSessionNotFoundError,
  InterviewInvalidStateError,
} from "../domain/interview.errors";
import {
  InterviewType,
  InterviewSessionStatus,
} from "../domain/interview.enums";
import {
  InterviewEvaluationAIService,
  interviewEvaluationAIService,
  SingleAnswerEvaluation,
} from "./interview-evaluation-ai.service";

export interface RubricDimensionWeights {
  technicalAccuracy: number;
  problemSolvingDepth: number;
  answerStructure: number;
  conceptCoverage: number;
  communicationTone: number;
}

export const RUBRIC_WEIGHTS: Record<InterviewType, RubricDimensionWeights> = {
  [InterviewType.TECHNICAL]: {
    technicalAccuracy: 0.30,
    problemSolvingDepth: 0.25,
    answerStructure: 0.20,
    conceptCoverage: 0.15,
    communicationTone: 0.10,
  },
  [InterviewType.BEHAVIORAL]: {
    technicalAccuracy: 0.15,
    problemSolvingDepth: 0.25,
    answerStructure: 0.25,
    conceptCoverage: 0.15,
    communicationTone: 0.20,
  },
  [InterviewType.HR]: {
    technicalAccuracy: 0.15,
    problemSolvingDepth: 0.20,
    answerStructure: 0.25,
    conceptCoverage: 0.15,
    communicationTone: 0.25,
  },
  [InterviewType.MANAGERIAL]: {
    technicalAccuracy: 0.20,
    problemSolvingDepth: 0.30,
    answerStructure: 0.20,
    conceptCoverage: 0.15,
    communicationTone: 0.15,
  },
};

export interface SessionEvaluationSummary {
  session: IInterviewSession;
  report: IInterviewReport;
  evaluations: Array<{
    question: IInterviewQuestion;
    answer: IInterviewAnswer;
    evaluation: IInterviewEvaluation;
  }>;
}

export class InterviewEvaluationService {
  constructor(
    private readonly sessionRepo: InterviewSessionRepository = new InterviewSessionRepository(),
    private readonly questionRepo: InterviewQuestionRepository = new InterviewQuestionRepository(),
    private readonly answerRepo: InterviewAnswerRepository = new InterviewAnswerRepository(),
    private readonly evalRepo: InterviewEvaluationRepository = new InterviewEvaluationRepository(),
    private readonly reportRepo: InterviewReportRepository = new InterviewReportRepository(),
    private readonly aiService: InterviewEvaluationAIService = interviewEvaluationAIService
  ) {}

  /**
   * Evaluates all submitted answers for an interview session, calculates deterministic scores,
   * compiles the final readiness report, and stores all documents in MongoDB.
   */
  async evaluateSession(
    userId: string,
    sessionId: string
  ): Promise<SessionEvaluationSummary> {
    const session = await this.sessionRepo.findByUserAndId(userId, sessionId);
    if (!session) {
      throw new InterviewSessionNotFoundError(sessionId);
    }

    const questions = await this.questionRepo.findBySessionId(sessionId);
    const answers = await this.answerRepo.findBySessionId(sessionId);

    if (answers.length === 0) {
      // Graceful fallback for sessions concluded early or without answers
      const defaultDimensions = {
        technicalAccuracy: 0,
        problemSolvingDepth: 0,
        answerStructure: 0,
        conceptCoverage: 0,
        communicationTone: 0,
      };

      const emptyReport = await this.reportRepo.upsertReport({
        sessionId: session._id,
        userId,
        rubricVersion: "1.0",
        overallScore: 0,
        dimensionScores: defaultDimensions,
        readinessLevel: "needs_practice",
        strengths: [`Initiated mock interview session for ${session.role}`],
        improvementAreas: [
          "Session was concluded before answers were submitted.",
          "Complete all interview questions to receive in-depth AI evaluations and scoring.",
        ],
        recommendations: [
          "Restart or launch a new mock interview session and submit responses for each question to calibrate your readiness.",
        ],
      });

      if (session.status !== InterviewSessionStatus.COMPLETED) {
        await this.sessionRepo.updateProgress(session._id, {
          status: InterviewSessionStatus.COMPLETED,
          completedAt: new Date(),
        });
        session.status = InterviewSessionStatus.COMPLETED;
      }

      return {
        session,
        report: emptyReport,
        evaluations: questions.map((q) => ({
          question: q,
          answer: undefined as any,
          evaluation: undefined as any,
        })),
      };
    }

    const answerMap = new Map<string, IInterviewAnswer>();
    for (const a of answers) {
      answerMap.set(a.questionId.toString(), a);
    }

    const evaluations: IInterviewEvaluation[] = [];
    const evaluationItems: SessionEvaluationSummary["evaluations"] = [];

    // 1. Evaluate answers in parallel for fast response and zero timeout
    const evaluationPromises = questions.map(async (question) => {
      const answer = answerMap.get(question._id.toString());
      if (!answer) return null;

      const evalResult: SingleAnswerEvaluation = await this.aiService.evaluateAnswer({
        role: session.role,
        experienceLevel: session.experienceLevel,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        questionText: question.questionText,
        category: question.category,
        expectedConcepts: question.expectedConcepts,
        candidateAnswerText: answer.answerText,
        responseDurationSeconds: answer.responseDurationSeconds,
      });

      // Upsert evaluation record with senior model answer suggestion
      const persistedEval = await this.evalRepo.upsertEvaluation({
        sessionId: session._id,
        questionId: question._id,
        answerId: answer._id,
        userId,
        rubricVersion: "1.0",
        provider: "gemini",
        aiModel: "gemini-flash-lite-latest",
        promptVersion: "1.0",
        scores: evalResult.scores,
        evidence: evalResult.evidence,
        strengths: evalResult.strengths,
        improvementAreas: evalResult.improvementAreas,
        modelAnswerSuggestion: evalResult.modelAnswerSuggestion,
      });

      return {
        question,
        answer,
        evaluation: persistedEval,
      };
    });

    const evaluatedResults = (await Promise.all(evaluationPromises)).filter(
      (item): item is { question: IInterviewQuestion; answer: IInterviewAnswer; evaluation: IInterviewEvaluation } =>
        Boolean(item)
    );

    for (const item of evaluatedResults) {
      evaluations.push(item.evaluation);
      evaluationItems.push(item);
    }

    // 2. Deterministic mathematical aggregation
    const aggregation = this.aggregateScores(evaluations, session.interviewType);

    // 3. Compile aggregated strengths and improvements
    const allStrengths = Array.from(
      new Set(evaluations.flatMap((e) => e.strengths || []))
    ).slice(0, 5);

    const allImprovements = Array.from(
      new Set(evaluations.flatMap((e) => e.improvementAreas || []))
    ).slice(0, 5);

    const recommendations = this.generateRecommendations(
      aggregation.overallScore,
      aggregation.dimensionScores,
      session.role
    );

    // 4. Upsert Readiness Report
    const persistedReport = await this.reportRepo.upsertReport({
      sessionId: session._id,
      userId,
      rubricVersion: "1.0",
      overallScore: aggregation.overallScore,
      dimensionScores: aggregation.dimensionScores,
      readinessLevel: aggregation.readinessLevel,
      strengths: allStrengths,
      improvementAreas: allImprovements,
      recommendations,
    });

    // 5. Ensure session is marked completed
    if (session.status !== InterviewSessionStatus.COMPLETED) {
      await this.sessionRepo.updateProgress(session._id, {
        status: InterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
      });
      session.status = InterviewSessionStatus.COMPLETED;
    }

    return {
      session,
      report: persistedReport,
      evaluations: evaluationItems,
    };
  }

  /**
   * Computes deterministic weighted dimension averages and overall readiness score (0-100)
   */
  public aggregateScores(
    evaluations: IInterviewEvaluation[],
    interviewType: InterviewType
  ): {
    overallScore: number;
    dimensionScores: Record<string, number>;
    readinessLevel: string;
  } {
    if (evaluations.length === 0) {
      return {
        overallScore: 0,
        dimensionScores: {
          technicalAccuracy: 0,
          problemSolvingDepth: 0,
          answerStructure: 0,
          conceptCoverage: 0,
          communicationTone: 0,
        },
        readinessLevel: "needs_practice",
      };
    }

    const totals = {
      technicalAccuracy: 0,
      problemSolvingDepth: 0,
      answerStructure: 0,
      conceptCoverage: 0,
      communicationTone: 0,
    };

    for (const e of evaluations) {
      const scores =
        e.scores instanceof Map ? Object.fromEntries(e.scores) : (e.scores as any) || {};

      totals.technicalAccuracy += scores.technicalAccuracy ?? 50;
      totals.problemSolvingDepth += scores.problemSolvingDepth ?? 50;
      totals.answerStructure += scores.answerStructure ?? 50;
      totals.conceptCoverage += scores.conceptCoverage ?? 50;
      totals.communicationTone += scores.communicationTone ?? 50;
    }

    const count = evaluations.length;
    const dimensionAverages = {
      technicalAccuracy: Math.round(totals.technicalAccuracy / count),
      problemSolvingDepth: Math.round(totals.problemSolvingDepth / count),
      answerStructure: Math.round(totals.answerStructure / count),
      conceptCoverage: Math.round(totals.conceptCoverage / count),
      communicationTone: Math.round(totals.communicationTone / count),
    };

    const weights = RUBRIC_WEIGHTS[interviewType] || RUBRIC_WEIGHTS[InterviewType.TECHNICAL];

    const overallScore = Math.round(
      dimensionAverages.technicalAccuracy * weights.technicalAccuracy +
      dimensionAverages.problemSolvingDepth * weights.problemSolvingDepth +
      dimensionAverages.answerStructure * weights.answerStructure +
      dimensionAverages.conceptCoverage * weights.conceptCoverage +
      dimensionAverages.communicationTone * weights.communicationTone
    );

    const readinessLevel = this.mapReadinessLevel(overallScore);

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      dimensionScores: dimensionAverages,
      readinessLevel,
    };
  }

  /**
   * Standardized readiness level mapping
   */
  public mapReadinessLevel(overallScore: number): string {
    if (overallScore >= 90) return "role_model";
    if (overallScore >= 75) return "interview_ready";
    if (overallScore >= 55) return "developing";
    return "needs_practice";
  }

  /**
   * Generates actionable recommendations based on lowest dimension scores
   */
  private generateRecommendations(
    overallScore: number,
    dimensions: Record<string, number>,
    role: string
  ): string[] {
    const recs: string[] = [];

    if (dimensions.technicalAccuracy < 70) {
      recs.push(`Review core technical principles and API contracts for ${role}.`);
    }
    if (dimensions.problemSolvingDepth < 70) {
      recs.push("Incorporate trade-off analysis and scalability considerations into your responses.");
    }
    if (dimensions.answerStructure < 70) {
      recs.push("Structure behavioral and project questions using the STAR methodology (Situation, Task, Action, Result).");
    }
    if (dimensions.conceptCoverage < 70) {
      recs.push("Ensure you mention industry-standard keywords and design patterns explicitly in your explanations.");
    }
    if (dimensions.communicationTone < 70) {
      recs.push("Practice concise delivery: avoid filler words and focus on structured, measurable impact.");
    }

    if (recs.length === 0) {
      recs.push(`Maintain your strong interview pace and continue practicing complex system design scenarios for ${role}.`);
    }

    return recs;
  }

  /**
   * Retrieve existing evaluations and report for a session
   */
  async getSessionReport(
    userId: string,
    sessionId: string
  ): Promise<IInterviewReport | null> {
    const session = await this.sessionRepo.findByUserAndId(userId, sessionId);
    if (!session) {
      throw new InterviewSessionNotFoundError(sessionId);
    }

    return await this.reportRepo.findBySessionId(sessionId);
  }

  /**
   * Retrieve question-by-question evaluations for a session
   */
  async getSessionEvaluations(
    userId: string,
    sessionId: string
  ): Promise<IInterviewEvaluation[]> {
    const session = await this.sessionRepo.findByUserAndId(userId, sessionId);
    if (!session) {
      throw new InterviewSessionNotFoundError(sessionId);
    }

    return await this.evalRepo.findBySessionId(sessionId);
  }
}

export const interviewEvaluationService = new InterviewEvaluationService();

