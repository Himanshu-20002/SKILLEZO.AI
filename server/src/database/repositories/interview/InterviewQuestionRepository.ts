import { Types } from "mongoose";
import { BaseRepository } from "../base";
import {
  InterviewQuestionModel,
  IInterviewQuestion,
} from "@/database/models/InterviewQuestion.model";

export class InterviewQuestionRepository extends BaseRepository<IInterviewQuestion> {
  constructor() {
    super(InterviewQuestionModel, "InterviewQuestion");
  }

  /**
   * Retrieve all questions for a given session sorted sequentially
   */
  async findBySessionId(
    sessionId: string | Types.ObjectId
  ): Promise<IInterviewQuestion[]> {
    return await this.findMany(
      { sessionId: new Types.ObjectId(sessionId.toString()) },
      { sort: { sequence: 1 } }
    );
  }

  /**
   * Bulk insert generated interview questions for a session
   */
  async createManyQuestions(
    questions: Array<Partial<IInterviewQuestion>>
  ): Promise<IInterviewQuestion[]> {
    return (await this.model.insertMany(questions)) as IInterviewQuestion[];
  }

  /**
   * Find specific question by session and sequence index
   */
  async findBySessionAndSequence(
    sessionId: string | Types.ObjectId,
    sequence: number
  ): Promise<IInterviewQuestion | null> {
    return await this.findOne({
      sessionId: new Types.ObjectId(sessionId.toString()),
      sequence,
    });
  }
}

