import { Types } from "mongoose";
import { BaseRepository } from "../base";
import {
  InterviewAnswerModel,
  IInterviewAnswer,
} from "@/database/models/InterviewAnswer.model";

export class InterviewAnswerRepository extends BaseRepository<IInterviewAnswer> {
  constructor() {
    super(InterviewAnswerModel, "InterviewAnswer");
  }

  /**
   * Find all submitted answers for a given session sorted chronologically
   */
  async findBySessionId(
    sessionId: string | Types.ObjectId
  ): Promise<IInterviewAnswer[]> {
    return await this.findMany(
      { sessionId: new Types.ObjectId(sessionId.toString()) },
      { sort: { submittedAt: 1 } }
    );
  }

  /**
   * Find an existing answer for a specific question in a session
   */
  async findBySessionAndQuestion(
    sessionId: string | Types.ObjectId,
    questionId: string | Types.ObjectId
  ): Promise<IInterviewAnswer | null> {
    return await this.findOne({
      sessionId: new Types.ObjectId(sessionId.toString()),
      questionId: new Types.ObjectId(questionId.toString()),
    });
  }

  /**
   * Idempotent submission: creates or updates answer for a session question
   */
  async upsertAnswer(
    sessionId: string | Types.ObjectId,
    questionId: string | Types.ObjectId,
    userId: string,
    answerText: string,
    durationSeconds?: number
  ): Promise<IInterviewAnswer> {
    const sId = new Types.ObjectId(sessionId.toString());
    const qId = new Types.ObjectId(questionId.toString());

    return (await this.model.findOneAndUpdate(
      { sessionId: sId, questionId: qId },
      {
        $set: {
          userId,
          answerText,
          responseDurationSeconds: durationSeconds,
          submittedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    )) as IInterviewAnswer;
  }

  /**
   * Count total answers submitted for a given session
   */
  async countBySessionId(sessionId: string | Types.ObjectId): Promise<number> {
    return await this.count({
      sessionId: new Types.ObjectId(sessionId.toString()),
    });
  }
}

