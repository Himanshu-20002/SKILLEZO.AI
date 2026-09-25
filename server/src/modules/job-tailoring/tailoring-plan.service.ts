import {
  ITailoringPlan,
  TailoringIntensity,
  UserProposalDecision,
} from "@/database/models/TailoringPlan.model";
import {
  TailoringPlanRepository,
  tailoringPlanRepository,
} from "@/database/repositories/tailoring-plan/TailoringPlanRepository";
import {
  JobProfileRepository,
  jobProfileRepository,
} from "@/database/repositories/job-profile/JobProfileRepository";
import {
  JobMatchResultRepository,
  jobMatchResultRepository,
} from "@/database/repositories/job-match/JobMatchResultRepository";
import { ProfileRepository } from "@/database/repositories/profile/ProfileRepository";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { TailoringPlanEngine } from "./tailoring-plan.engine";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class TailoringPlanService {
  private readonly profileRepo: ProfileRepository;
  private readonly resumeRepo: ResumeRepository;

  constructor(
    private readonly planRepo: TailoringPlanRepository = tailoringPlanRepository,
    private readonly jobProfileRepo: JobProfileRepository = jobProfileRepository,
    private readonly matchResultRepo: JobMatchResultRepository = jobMatchResultRepository,
    profileRepo?: ProfileRepository,
    resumeRepo?: ResumeRepository
  ) {
    this.profileRepo = profileRepo || new ProfileRepository();
    this.resumeRepo = resumeRepo || new ResumeRepository();
  }

  /**
   * Generates or retrieves an existing active Tailoring Plan for the user and JobProfile.
   * Enforces non-stale matching prerequisites and user ownership.
   */
  public async createOrGetPlan(
    userId: string,
    jobProfileId: string,
    intensity: TailoringIntensity = "BALANCED",
    force = false
  ): Promise<{ plan: ITailoringPlan; isStale: boolean }> {
    // 1. Verify JobProfile exists and belongs to user
    const jobProfile = await this.jobProfileRepo.findById(jobProfileId);
    if (!jobProfile || jobProfile.userId !== userId) {
      throw new AppError("JobProfile not found or access denied", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (jobProfile.analysisStatus !== "ANALYZED") {
      throw new AppError(
        "Job description must be fully analyzed before creating a tailoring plan",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.BAD_REQUEST
      );
    }

    // 2. Verify JobMatchResult exists and belongs to user
    const matchResult = await this.matchResultRepo.findByUserAndJobProfile(userId, jobProfileId);
    if (!matchResult) {
      throw new AppError(
        "Role match result not found. Please run Career Match (Phase 6B) first.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.NOT_FOUND
      );
    }

    // 3. Load candidate facts from ProfileModel and Master Resume (read-only)
    const profile = await this.profileRepo.findByUserId(userId);
    const masterResume = await this.resumeRepo.findMasterByUserId(userId);

    // 4. Verify MatchResult is not stale
    const currentProfileVersion = profile?.profileVersion || 1;
    const currentJobVersion = jobProfile.analysisVersion || 1;
    const matchIsStale =
      matchResult.sourceProfileVersion !== currentProfileVersion ||
      matchResult.jobAnalysisVersion !== currentJobVersion;

    if (matchIsStale) {
      throw new AppError(
        "Career Match data is outdated. Please refresh your Role Match before generating a Tailoring Plan.",
        HTTP_STATUS.CONFLICT,
        "MATCH_DATA_STALE"
      );
    }

    // 5. Check if plan already exists
    const existingPlan = await this.planRepo.findByUserAndJobProfile(userId, jobProfileId);
    if (existingPlan && !force && existingPlan.intensity === intensity) {
      const isStale = this.computeStaleness(existingPlan, currentProfileVersion, currentJobVersion, matchResult);
      return { plan: existingPlan, isStale };
    }

    // 6. Generate fresh proposals via TailoringPlanEngine
    const masterResumeDoc = masterResume?.resumeDocument || (masterResume as any)?.document || null;
    const { proposals, summary, proposedSectionOrder, currentSectionOrder } =
      await TailoringPlanEngine.generatePlan(
        jobProfile,
        matchResult,
        profile,
        masterResumeDoc,
        { intensity }
      );

    // 7. Upsert the plan in MongoDB
    const plan = await this.planRepo.upsertPlan(userId, jobProfileId, {
      jobMatchResultId: matchResult._id.toString(),
      sourceProfileVersion: currentProfileVersion,
      jobAnalysisVersion: currentJobVersion,
      matchResultGeneratedAt: matchResult.updatedAt || new Date(),
      intensity,
      status: "READY_FOR_REVIEW",
      proposals,
      summary,
      proposedSectionOrder,
      currentSectionOrder,
    });

    return { plan, isStale: false };
  }

  /**
   * Retrieves the current Tailoring Plan for a JobProfile with dynamic authoritative staleness check.
   */
  public async getPlan(
    userId: string,
    jobProfileId: string
  ): Promise<{ plan: ITailoringPlan | null; isStale: boolean }> {
    const plan = await this.planRepo.findByUserAndJobProfile(userId, jobProfileId);
    if (!plan) {
      return { plan: null, isStale: false };
    }

    const jobProfile = await this.jobProfileRepo.findById(jobProfileId);
    const profile = await this.profileRepo.findByUserId(userId);
    const matchResult = await this.matchResultRepo.findByUserAndJobProfile(userId, jobProfileId);

    const isStale = this.computeStaleness(
      plan,
      profile?.profileVersion || 1,
      jobProfile?.analysisVersion || 1,
      matchResult
    );

    return { plan, isStale };
  }

  /**
   * Updates user decision on an individual proposal.
   */
  public async updateProposalDecision(
    userId: string,
    jobProfileId: string,
    proposalId: string,
    decision: UserProposalDecision,
    editedValue?: string | null
  ): Promise<{ plan: ITailoringPlan; isStale: boolean }> {
    // 1. Verify plan exists
    const { plan: existingPlan, isStale } = await this.getPlan(userId, jobProfileId);
    if (!existingPlan) {
      throw new AppError("TailoringPlan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (isStale) {
      throw new AppError(
        "Tailoring Plan is stale because your career profile or job profile was updated. Please refresh.",
        HTTP_STATUS.CONFLICT,
        "PLAN_STALE"
      );
    }

    // 2. Perform safe update
    const updatedPlan = await this.planRepo.updateProposalDecision(
      userId,
      jobProfileId,
      proposalId,
      decision,
      editedValue
    );

    if (!updatedPlan) {
      throw new AppError("Proposal not found in current plan", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    return { plan: updatedPlan, isStale: false };
  }

  /**
   * Batch updates decisions for multiple proposals safely.
   */
  public async batchUpdateDecisions(
    userId: string,
    jobProfileId: string,
    updates: Array<{ proposalId: string; decision: UserProposalDecision; editedValue?: string | null }>
  ): Promise<{ plan: ITailoringPlan; isStale: boolean }> {
    const { plan: existingPlan, isStale } = await this.getPlan(userId, jobProfileId);
    if (!existingPlan) {
      throw new AppError("TailoringPlan not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (isStale) {
      throw new AppError("Cannot apply decisions on a stale plan.", HTTP_STATUS.CONFLICT, "PLAN_STALE");
    }

    const updatedPlan = await this.planRepo.batchUpdateDecisions(
      userId,
      jobProfileId,
      updates
    );

    if (!updatedPlan) {
      throw new AppError("Failed to apply batch decisions", HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }

    return { plan: updatedPlan, isStale: false };
  }

  /**
   * Regenerates a plan (e.g. when intensity changes).
   * If proposals have already been accepted/edited and force !== true, requires user confirmation.
   */
  public async regeneratePlan(
    userId: string,
    jobProfileId: string,
    intensity: TailoringIntensity = "BALANCED",
    force = false
  ): Promise<{ plan: ITailoringPlan; isStale: boolean }> {
    const existingPlan = await this.planRepo.findByUserAndJobProfile(userId, jobProfileId);
    if (existingPlan && !force) {
      const hasUserDecisions = existingPlan.proposals.some(
        (p) => !p.isProtected && (p.userDecision === "ACCEPTED" || p.userDecision === "EDITED")
      );
      if (hasUserDecisions) {
        throw new AppError(
          "Plan has existing accepted or edited decisions. Set force: true to overwrite.",
          HTTP_STATUS.CONFLICT,
          "REGENERATION_CONFIRMATION_REQUIRED"
        );
      }
    }

    return this.createOrGetPlan(userId, jobProfileId, intensity, true);
  }

  /**
   * Computes authoritative dynamic staleness.
   */
  public computeStaleness(
    plan: ITailoringPlan,
    currentProfileVersion: number,
    currentJobVersion: number,
    matchResult: any
  ): boolean {
    if (!plan) return false;
    const profileStale = plan.sourceProfileVersion !== currentProfileVersion;
    const jobStale = plan.jobAnalysisVersion !== currentJobVersion;
    const matchStale =
      !matchResult ||
      matchResult.sourceProfileVersion !== currentProfileVersion ||
      matchResult.jobAnalysisVersion !== currentJobVersion ||
      matchResult._id?.toString() !== plan.jobMatchResultId;

    return profileStale || jobStale || matchStale;
  }
}

export const tailoringPlanService = new TailoringPlanService();
