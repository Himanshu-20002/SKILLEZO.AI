import { BaseRepository } from "../base";
import {
  JobProfileModel,
  IJobProfile,
  IJobProfileAnalysis,
  IJobProfileAnalysisMetadata,
  IJobProfileAnalysisError,
} from "@/database/models/JobProfile.model";
import { Types } from "mongoose";

export class JobProfileRepository extends BaseRepository<IJobProfile> {
  constructor() {
    super(JobProfileModel, "JobProfile");
  }

  /**
   * Find a successfully analyzed profile for this user matching the deterministic fingerprint.
   */
  async findAnalyzedByFingerprint(
    userId: string,
    jobFingerprint: string
  ): Promise<IJobProfile | null> {
    return await this.findOne({
      userId,
      jobFingerprint,
      analysisStatus: "ANALYZED",
    } as any);
  }

  /**
   * Find a job profile by ID, verifying user ownership.
   */
  async findByIdAndUserId(
    id: string | Types.ObjectId,
    userId: string
  ): Promise<IJobProfile | null> {
    return await this.findOne({
      _id: typeof id === "string" ? new Types.ObjectId(id) : id,
      userId,
    } as any);
  }

  /**
   * List all job profiles for a user, sorted newest first.
   */
  async listByUserId(
    userId: string,
    limit = 20,
    skip = 0
  ): Promise<IJobProfile[]> {
    return await this.findMany(
      { userId } as any,
      {
        sort: { createdAt: -1 },
        limit,
        skip,
      } as any
    );
  }

  /**
   * Update profile with successful AI analysis output.
   */
  async updateAnalysis(
    id: string | Types.ObjectId,
    userId: string,
    analysis: IJobProfileAnalysis,
    metadata: IJobProfileAnalysisMetadata,
    version?: number
  ): Promise<IJobProfile | null> {
    return await this.model.findOneAndUpdate(
      {
        _id: typeof id === "string" ? new Types.ObjectId(id) : id,
        userId,
      },
      {
        $set: {
          analysis,
          analysisStatus: "ANALYZED",
          analysisMetadata: metadata,
          analysisError: null,
          ...(version ? { analysisVersion: version } : {}),
        },
      },
      { returnDocument: "after" }
    );
  }

  /**
   * Mark job profile analysis as failed with structured error.
   */
  async markFailed(
    id: string | Types.ObjectId,
    userId: string,
    error: IJobProfileAnalysisError
  ): Promise<IJobProfile | null> {
    return await this.model.findOneAndUpdate(
      {
        _id: typeof id === "string" ? new Types.ObjectId(id) : id,
        userId,
      },
      {
        $set: {
          analysisStatus: "FAILED",
          analysisError: error,
        },
      },
      { returnDocument: "after" }
    );
  }
}

export const jobProfileRepository = new JobProfileRepository();
