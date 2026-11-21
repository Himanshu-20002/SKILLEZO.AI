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

  /**
   * Insert an adaptive follow-up question immediately after the current sequence,
   * shifting all subsequent questions in the session by +1.
   */
  async insertFollowUpQuestion(
    sessionId: string | Types.ObjectId,
    afterSequence: number,
    questionData: Partial<IInterviewQuestion>
  ): Promise<IInterviewQuestion> {
    const sId = new Types.ObjectId(sessionId.toString());

    // 1. Shift all subsequent questions forward by 1
    await this.model.updateMany(
      { sessionId: sId, sequence: { $gt: afterSequence } },
      { $inc: { sequence: 1 } }
    );

    // 2. Insert the follow-up at afterSequence + 1
    const newQuestion = await this.model.create({
      ...questionData,
      sessionId: sId,
      sequence: afterSequence + 1,
    });

    return newQuestion as IInterviewQuestion;
  }
}
