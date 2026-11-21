import {
  jobMatchResultRepository,
  JobMatchResultRepository,
} from "@/database/repositories/job-match/JobMatchResultRepository";
import {
  jobProfileRepository,
  JobProfileRepository,
} from "@/database/repositories/job-profile/JobProfileRepository";
import {
  ProfileRepository,
} from "@/database/repositories/profile/ProfileRepository";
import {
  ResumeRepository,
} from "@/database/repositories/resume/ResumeRepository";
import { ProfileModel } from "@/database/models/Profile.model";
import { ResumeModel } from "@/database/models/Resume.model";
import { IJobMatchResult } from "@/database/models/JobMatchResult.model";
import { CareerJobMatcher } from "./career-job-matcher";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS, ERROR_CODES } from "@/core/constants";
import { getMonetizationConfig } from "@/database/models/MonetizationConfig.model";
import { SubscriptionModel, PlanTier, SubscriptionStatus } from "@/database/models/Subscription.model";

export class JobMatchService {
  private profileRepo: ProfileRepository;
  private resumeRepo: ResumeRepository;

  constructor(
    private readonly matchRepo: JobMatchResultRepository = jobMatchResultRepository,
    private readonly jobProfileRepo: JobProfileRepository = jobProfileRepository
  ) {
    this.profileRepo = new ProfileRepository();
    this.resumeRepo = new ResumeRepository();
  }

  /**
   * Run or refresh the Career ↔ Job Evidence Match.
   * ProfileModel and ResumeModel are treated as strictly READ-ONLY inputs.
   */
  async matchJobToCareerProfile(
    userId: string,
    jobProfileId: string
  ): Promise<{ matchResult: IJobMatchResult; isStale: boolean }> {
    const jobProfile = await this.jobProfileRepo.findByIdAndUserId(jobProfileId, userId);
    if (!jobProfile) {
      throw new AppError("Job Profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (jobProfile.analysisStatus !== "ANALYZED") {
      throw new AppError(
        "Job Profile must be analyzed before matching career evidence.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.BAD_REQUEST
      );
    }

    // Quota check: free users get 1 basic ATS match check per month
    const existingMatch = await this.matchRepo.findByUserAndJobProfile(userId, jobProfileId);
    if (!existingMatch) {
      const monetizationConfig = await getMonetizationConfig();
      const subscription = await SubscriptionModel.findOne({ userId });
      const isPro =
        subscription &&
        (subscription.tier === PlanTier.PRO || subscription.tier === PlanTier.ENTERPRISE) &&
        subscription.status === SubscriptionStatus.ACTIVE;

      if (!isPro) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyScansCount = await this.matchRepo.count({
          userId,
          createdAt: { $gte: startOfMonth },
        });

        const freeLimit = monetizationConfig.resumeQuotas?.freeMonthlyAtsScans ?? 1;
        if (monthlyScansCount >= freeLimit) {
          throw new AppError(
            `You have reached your free monthly ATS match check limit (${monthlyScansCount}/${freeLimit} scans used). Upgrade to SKILLEZO Pro or activate a 7-Day Sprint Pass (₹199) for unlimited ATS job match checks.`,
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.PLAN_UPGRADE_REQUIRED
          );
        }
      }
    }

    // 1. Read-Only Candidate Career Profile
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new AppError(
        "Candidate Career Profile not found. Please complete your profile first.",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.PROFILE_NOT_FOUND
      );
    }

    // 2. Read-Only Master Resume (for underrepresentation checks)
    const masterResume = await this.resumeRepo.findMasterByUserId(userId);

    // 3. Execute Matching Engine
    const { requirementMatches, summary, overallMatch } = await CareerJobMatcher.match(
      jobProfile,
      profile,
      masterResume
    );

    // 4. Upsert Match Result with strict version markers
    const sourceProfileVersion = profile.profileVersion || 1;
    const jobAnalysisVersion = jobProfile.analysisVersion || 1;

    const matchResult = await this.matchRepo.upsertMatchResult(userId, jobProfile._id, {
      sourceProfileVersion,
      jobAnalysisVersion,
      requirementMatches,
      summary,
      overallMatch,
    });

    return {
      matchResult,
      isStale: false,
    };
  }

  /**
   * Retrieve existing match result for a job profile with dynamic staleness detection.
   */
  async getMatchResult(
    userId: string,
    jobProfileId: string
  ): Promise<{ matchResult: IJobMatchResult; isStale: boolean }> {
    const jobProfile = await this.jobProfileRepo.findByIdAndUserId(jobProfileId, userId);
    if (!jobProfile) {
      throw new AppError("Job Profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const matchResult = await this.matchRepo.findByUserAndJobProfile(userId, jobProfile._id);
    if (!matchResult) {
      throw new AppError("Match result not found. Please run matching first.", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const profile = await this.profileRepo.findByUserId(userId);
    const currentProfileVersion = profile?.profileVersion || 1;
    const currentAnalysisVersion = jobProfile.analysisVersion || 1;

    const isStale =
      matchResult.sourceProfileVersion !== currentProfileVersion ||
      matchResult.jobAnalysisVersion !== currentAnalysisVersion;

    return {
      matchResult,
      isStale,
    };
  }
}

export const jobMatchService = new JobMatchService();
