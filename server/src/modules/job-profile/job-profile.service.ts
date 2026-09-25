import {
  jobProfileRepository,
  JobProfileRepository,
} from "@/database/repositories/job-profile/JobProfileRepository";
import {
  IJobProfile,
  IJobProfileAnalysisError,
} from "@/database/models/JobProfile.model";
import { JobIntakeInput } from "./job-profile.types";
import { JobProfileNormalizer } from "./job-profile.normalizer";
import {
  jobProfileAiService,
  JobProfileAiService,
} from "./job-profile-ai.service";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS, ERROR_CODES } from "@/core/constants";

export class JobProfileService {
  constructor(
    private readonly repo: JobProfileRepository = jobProfileRepository,
    private readonly aiService: JobProfileAiService = jobProfileAiService
  ) {}

  /**
   * Ingests a new job description, checks for duplicate analyzed fingerprints,
   * creates the JobProfile document, and performs grounded AI analysis.
   */
  async createAndAnalyze(
    userId: string,
    input: JobIntakeInput
  ): Promise<{ profile: IJobProfile; isExisting: boolean }> {
    const rawDescription = input.rawDescription.trim();
    const normalizedDescription = JobProfileNormalizer.normalizeDescription(rawDescription);

    if (normalizedDescription.length < 50) {
      throw new AppError(
        "Job description must contain at least 50 characters of readable text.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const sourceHash = JobProfileNormalizer.computeSourceHash(normalizedDescription);
    const jobFingerprint = JobProfileNormalizer.computeJobFingerprint(
      input.jobTitle,
      input.company,
      normalizedDescription
    );

    // 1. Check for existing analyzed profile with identical user-scoped fingerprint
    const existing = await this.repo.findAnalyzedByFingerprint(userId, jobFingerprint);
    if (existing) {
      return { profile: existing, isExisting: true };
    }

    const displayName = input.company
      ? `${input.jobTitle} — ${input.company}`
      : `${input.jobTitle} — General Opportunity`;

    // 2. Persist initial profile in ANALYZING status
    const profile = await this.repo.create({
      userId,
      displayName,
      jobTitle: input.jobTitle.trim(),
      company: input.company ? input.company.trim() : null,
      jobUrl: input.jobUrl ? input.jobUrl.trim() : null,
      rawDescription,
      normalizedDescription,
      sourceHash,
      jobFingerprint,
      analysisStatus: "ANALYZING",
      analysisVersion: 1,
    } as any);

    // 3. Execute AI Analysis
    try {
      const { analysis, metadata } = await this.aiService.analyzeJobDescription(
        normalizedDescription,
        input.jobTitle,
        input.company
      );

      const updated = await this.repo.updateAnalysis(
        profile._id,
        userId,
        analysis,
        metadata,
        1
      );

      return { profile: updated || profile, isExisting: false };
    } catch (err: any) {
      // 4. Map and persist structured domain error
      let errorCode: IJobProfileAnalysisError["code"] = "AI_ANALYSIS_FAILED";
      if (err.message?.includes("not grounded")) {
        errorCode = "SCHEMA_VALIDATION_FAILED";
      } else if (err.message?.includes("timeout") || err.name === "TimeoutError") {
        errorCode = "MODEL_TIMEOUT";
      } else if (err.message?.includes("No AI providers")) {
        errorCode = "MODEL_UNAVAILABLE";
      }

      await this.repo.markFailed(profile._id, userId, {
        code: errorCode,
        occurredAt: new Date(),
      });

      throw err;
    }
  }

  /**
   * Re-analyzes an existing job profile (e.g. after a failure or user retry).
   */
  async reanalyze(userId: string, jobProfileId: string): Promise<IJobProfile> {
    const profile = await this.repo.findByIdAndUserId(jobProfileId, userId);
    if (!profile) {
      throw new AppError("Job Profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const nextVersion = (profile.analysisVersion || 1) + 1;

    try {
      const { analysis, metadata } = await this.aiService.analyzeJobDescription(
        profile.normalizedDescription,
        profile.jobTitle,
        profile.company
      );

      const updated = await this.repo.updateAnalysis(
        profile._id,
        userId,
        analysis,
        metadata,
        nextVersion
      );

      return updated || profile;
    } catch (err: any) {
      let errorCode: IJobProfileAnalysisError["code"] = "AI_ANALYSIS_FAILED";
      if (err.message?.includes("not grounded")) {
        errorCode = "SCHEMA_VALIDATION_FAILED";
      } else if (err.message?.includes("timeout")) {
        errorCode = "MODEL_TIMEOUT";
      } else if (err.message?.includes("No AI providers")) {
        errorCode = "MODEL_UNAVAILABLE";
      }

      await this.repo.markFailed(profile._id, userId, {
        code: errorCode,
        occurredAt: new Date(),
      });

      throw err;
    }
  }

  /**
   * Retrieve single job profile verifying user ownership.
   */
  async getJobProfile(userId: string, jobProfileId: string): Promise<IJobProfile> {
    const profile = await this.repo.findByIdAndUserId(jobProfileId, userId);
    if (!profile) {
      throw new AppError("Job Profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return profile;
  }

  /**
   * List all job profiles for the authenticated user.
   */
  async listJobProfiles(userId: string, limit = 20, skip = 0): Promise<IJobProfile[]> {
    return await this.repo.listByUserId(userId, limit, skip);
  }
}

export const jobProfileService = new JobProfileService();
