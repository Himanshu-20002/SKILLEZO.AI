import { Types } from "mongoose";
import { BaseRepository } from "../base";
import { InterviewSessionModel, IInterviewSession } from "@/database/models/InterviewSession.model";
import { InterviewSessionStatus } from "@/modules/interview-coach/domain/interview.enums";
import { PaginationResult } from "../types";

export interface ListSessionsOptions {
  page?: number;
  limit?: number;
  status?: InterviewSessionStatus;
}

export class InterviewSessionRepository extends BaseRepository<IInterviewSession> {
  constructor() {
    super(InterviewSessionModel, "InterviewSession");
  }

  /**
   * Find a session strictly scoped to the authenticated user ID.
   * Guarantees candidate isolation at database query level.
   */
  async findByUserAndId(
    userId: string,
    sessionId: string | Types.ObjectId
  ): Promise<IInterviewSession | null> {
    return await this.findOne({
      _id: sessionId,
      userId,
    });
  }

  /**
   * List paginated sessions for an authenticated user.
   */
  async listByUserId(
    userId: string,
    options: ListSessionsOptions = {}
  ): Promise<PaginationResult<IInterviewSession>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));

    const filter: Record<string, any> = { userId };
    if (options.status) {
      filter.status = options.status;
    }

    return await this.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Count total sessions completed by a user.
   */
  async countCompletedByUser(userId: string): Promise<number> {
    return await this.count({
      userId,
      status: InterviewSessionStatus.COMPLETED,
    });
  }

  /**
   * Count sessions created by a user within a specific date range (for quota verification).
   */
  async countSessionsSince(userId: string, since: Date): Promise<number> {
    return await this.count({
      userId,
      createdAt: { $gte: since },
    });
  }

  /**
   * Atomically start or update progress of an interview session
   */
  async updateProgress(
    sessionId: string | Types.ObjectId,
    updates: {
      currentQuestionIndex?: number;
      status?: InterviewSessionStatus;
      startedAt?: Date;
      completedAt?: Date;
      totalQuestions?: number;
    }
  ): Promise<IInterviewSession | null> {
    return await this.updateById(sessionId, updates);
  }
}
