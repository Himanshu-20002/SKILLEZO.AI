import { Types } from "mongoose";
import { BaseRepository } from "../base";
import {
  InterviewEvaluationModel,
  IInterviewEvaluation,
} from "@/database/models/InterviewEvaluation.model";

export class InterviewEvaluationRepository extends BaseRepository<IInterviewEvaluation> {
  constructor() {
    super(InterviewEvaluationModel, "InterviewEvaluation");
  }

  /**
   * Find all evaluations for a specific interview session
   */
  async findBySessionId(
    sessionId: string | Types.ObjectId
  ): Promise<IInterviewEvaluation[]> {
    return await this.findMany({
      sessionId: new Types.ObjectId(sessionId.toString()),
    });
  }

  /**
   * Find evaluation for a specific question within a session
   */
  async findBySessionAndQuestion(
    sessionId: string | Types.ObjectId,
    questionId: string | Types.ObjectId
  ): Promise<IInterviewEvaluation | null> {
    return await this.findOne({
      sessionId: new Types.ObjectId(sessionId.toString()),
      questionId: new Types.ObjectId(questionId.toString()),
    });
  }

  /**
   * Idempotent upsert of an answer evaluation
   */
  async upsertEvaluation(
    data: {
      sessionId: string | Types.ObjectId;
      questionId: string | Types.ObjectId;
      answerId: string | Types.ObjectId;
      userId: string;
      rubricVersion?: string;
      provider?: string;
      aiModel?: string;
      promptVersion?: string;
      scores: Map<string, number> | Record<string, number>;
      evidence?: string[];
      strengths?: string[];
      improvementAreas?: string[];
      modelAnswerSuggestion?: string;
    }
  ): Promise<IInterviewEvaluation> {
    const sId = new Types.ObjectId(data.sessionId.toString());
    const qId = new Types.ObjectId(data.questionId.toString());
    const aId = new Types.ObjectId(data.answerId.toString());

    return (await this.model.findOneAndUpdate(
      { sessionId: sId, questionId: qId },
      {
        $set: {
          answerId: aId,
          userId: data.userId,
          rubricVersion: data.rubricVersion || "1.0",
          provider: data.provider || "gemini",
          aiModel: data.aiModel || "gemini-flash-lite-latest",
          promptVersion: data.promptVersion || "1.0",
          scores: data.scores,
          evidence: data.evidence || [],
          strengths: data.strengths || [],
          improvementAreas: data.improvementAreas || [],
          modelAnswerSuggestion: data.modelAnswerSuggestion || "",
          evaluatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    )) as IInterviewEvaluation;
  }
}

