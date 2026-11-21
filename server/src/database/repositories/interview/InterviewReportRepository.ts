import { Types } from "mongoose";
import { BaseRepository } from "../base";
import {
  InterviewReportModel,
  IInterviewReport,
} from "@/database/models/InterviewReport.model";

export class InterviewReportRepository extends BaseRepository<IInterviewReport> {
  constructor() {
    super(InterviewReportModel, "InterviewReport");
  }

  /**
   * Find report by session ID (unique per session)
   */
  async findBySessionId(
    sessionId: string | Types.ObjectId
  ): Promise<IInterviewReport | null> {
    return await this.findOne({
      sessionId: new Types.ObjectId(sessionId.toString()),
    });
  }

  /**
   * Find all reports for an authenticated user sorted chronologically
   */
  async findByUserId(userId: string): Promise<IInterviewReport[]> {
    return await this.findMany(
      { userId },
      { sort: { generatedAt: -1 } }
    );
  }

  /**
   * Idempotent upsert of interview readiness report
   */
  async upsertReport(
    data: {
      sessionId: string | Types.ObjectId;
      userId: string;
      rubricVersion?: string;
      overallScore?: number;
      dimensionScores: Map<string, number> | Record<string, number>;
      readinessLevel?: string;
      strengths?: string[];
      improvementAreas?: string[];
      recommendations?: string[];
    }
  ): Promise<IInterviewReport> {
    const sId = new Types.ObjectId(data.sessionId.toString());

    return (await this.model.findOneAndUpdate(
      { sessionId: sId },
      {
        $set: {
          userId: data.userId,
          rubricVersion: data.rubricVersion || "1.0",
          overallScore: data.overallScore,
          dimensionScores: data.dimensionScores,
          readinessLevel: data.readinessLevel,
          strengths: data.strengths || [],
          improvementAreas: data.improvementAreas || [],
          recommendations: data.recommendations || [],
          generatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    )) as IInterviewReport;
  }
}

