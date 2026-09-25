import { BaseRepository } from "../base";
import {
  JobMatchResultModel,
  IJobMatchResult,
} from "@/database/models/JobMatchResult.model";
import { Types } from "mongoose";

export class JobMatchResultRepository extends BaseRepository<IJobMatchResult> {
  constructor() {
    super(JobMatchResultModel, "JobMatchResult");
  }

  /**
   * Find match result for a specific user and job profile.
   */
  async findByUserAndJobProfile(
    userId: string,
    jobProfileId: string | Types.ObjectId
  ): Promise<IJobMatchResult | null> {
    const objectId =
      typeof jobProfileId === "string"
        ? new Types.ObjectId(jobProfileId)
        : jobProfileId;

    return await this.findOne({
      userId,
      jobProfileId: objectId,
    } as any);
  }

  /**
   * Create or update the single match result document for a user and job profile.
   */
  async upsertMatchResult(
    userId: string,
    jobProfileId: string | Types.ObjectId,
    data: {
      sourceProfileVersion: number;
      jobAnalysisVersion: number;
      requirementMatches: any[];
      summary: any;
      overallMatch?: { score: number; label: string } | null;
    }
  ): Promise<IJobMatchResult> {
    const objectId =
      typeof jobProfileId === "string"
        ? new Types.ObjectId(jobProfileId)
        : jobProfileId;

    const updated = await this.model
      .findOneAndUpdate(
        { userId, jobProfileId: objectId },
        {
          $set: {
            sourceProfileVersion: data.sourceProfileVersion,
            jobAnalysisVersion: data.jobAnalysisVersion,
            requirementMatches: data.requirementMatches,
            summary: data.summary,
            overallMatch: data.overallMatch || null,
          },
        },
        { new: true, upsert: true, runValidators: true }
      )
      .exec();

    return updated as IJobMatchResult;
  }
}

export const jobMatchResultRepository = new JobMatchResultRepository();
