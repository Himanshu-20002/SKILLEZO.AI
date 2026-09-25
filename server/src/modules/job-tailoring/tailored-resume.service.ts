/**
 * SKILLEZO RESUME STUDIO — PHASE 6D
 * Tailored Resume Service
 *
 * Coordinates authentication, ownership, dynamic staleness gates,
 * deterministic materialization, atomic persistence, and status transitions.
 */

import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ResumeStatus } from "@/core/constants/enums";
import { ResumeModel } from "@/database/models/Resume.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { JobProfileModel } from "@/database/models/JobProfile.model";
import { JobMatchResultModel } from "@/database/models/JobMatchResult.model";
import { TailoringPlanModel } from "@/database/models/TailoringPlan.model";
import { DEFAULT_BUILDER_CONFIG } from "@/modules/resume-intelligence/builder/builder.types";
import { TailoringFactualValidator } from "./tailoring-factual.validator";
import { TailoredResumeGenerator } from "./tailored-resume.generator";
import {
  GenerateTailoredResumeInput,
  TailoredResumeGenerationResultDTO,
  TailoredResumeMetadataDTO,
  TailoredResumeErrorCode,
} from "./tailored-resume.types";

export class TailoredResumeService {
  // In-flight concurrency lock to prevent double-click / simultaneous duplicate generations
  private static activeGenerations = new Set<string>();

  /**
   * Generates or regenerates an independent TAILORED Resume variant
   * for the given user and target job profile.
   */
  public static async generateTailoredResume(
    userId: string,
    jobProfileId: string,
    input: GenerateTailoredResumeInput = {}
  ): Promise<TailoredResumeGenerationResultDTO> {
    const lockKey = `${userId}:${jobProfileId}`;
    if (this.activeGenerations.has(lockKey)) {
      throw new AppError(
        "A tailored resume generation is already in progress for this job profile.",
        HTTP_STATUS.CONFLICT,
        TailoredResumeErrorCode.CONCURRENT_GENERATION_IN_PROGRESS
      );
    }

    this.activeGenerations.add(lockKey);

    try {
      // 1. Fetch Target Job Profile & Verify Ownership
      const jobProfile = await JobProfileModel.findOne({ _id: jobProfileId, userId });
      if (!jobProfile) {
        throw new AppError(
          "Target job profile not found or access denied.",
          HTTP_STATUS.NOT_FOUND,
          TailoredResumeErrorCode.TAILORING_PLAN_NOT_FOUND
        );
      }

      // 2. Fetch Tailoring Plan
      const plan = await TailoringPlanModel.findOne({ userId, jobProfileId });
      if (!plan) {
        throw new AppError(
          "Tailoring plan not found for this job profile. Generate a tailoring plan first.",
          HTTP_STATUS.NOT_FOUND,
          TailoredResumeErrorCode.TAILORING_PLAN_NOT_FOUND
        );
      }

      // 3. Dynamic Staleness & Integrity Gates (Requirement 5)
      // 3.1 Verify Candidate Profile
      const profile = await ProfileModel.findOne({ userId });
      if (!profile) {
        throw new AppError(
          "Candidate profile not found.",
          HTTP_STATUS.NOT_FOUND,
          TailoredResumeErrorCode.TAILORING_PLAN_STALE
        );
      }

      if (plan.sourceProfileVersion !== profile.profileVersion) {
        throw new AppError(
          `Candidate profile has updated (v${profile.profileVersion}) since the tailoring plan was created (v${plan.sourceProfileVersion}). Please refresh your tailoring plan.`,
          HTTP_STATUS.CONFLICT,
          TailoredResumeErrorCode.TAILORING_PLAN_STALE,
          { currentProfileVersion: profile.profileVersion, planProfileVersion: plan.sourceProfileVersion }
        );
      }

      // 3.2 Verify Job Profile Analysis Version
      if (plan.jobAnalysisVersion !== jobProfile.analysisVersion) {
        throw new AppError(
          `Job analysis has updated (v${jobProfile.analysisVersion}) since the tailoring plan was created (v${plan.jobAnalysisVersion}). Please regenerate your match analysis and plan.`,
          HTTP_STATUS.CONFLICT,
          TailoredResumeErrorCode.TAILORING_PLAN_STALE,
          { currentJobVersion: jobProfile.analysisVersion, planJobVersion: plan.jobAnalysisVersion }
        );
      }

      // 3.3 Verify Match Result Freshness
      const matchResult = await JobMatchResultModel.findOne({ _id: plan.jobMatchResultId });
      if (
        !matchResult ||
        matchResult.userId !== userId ||
        matchResult.sourceProfileVersion !== profile.profileVersion ||
        matchResult.jobAnalysisVersion !== jobProfile.analysisVersion
      ) {
        throw new AppError(
          "Job match analysis is stale or invalid. Please re-run job match before generating tailored resume.",
          HTTP_STATUS.CONFLICT,
          TailoredResumeErrorCode.TAILORING_PLAN_STALE
        );
      }

      // 3.4 Approval Gate
      if (plan.summary.pending > 0) {
        throw new AppError(
          `Tailoring plan has ${plan.summary.pending} pending proposals. All proposals must be reviewed (ACCEPTED, EDITED, or REJECTED) before generation.`,
          HTTP_STATUS.BAD_REQUEST,
          TailoredResumeErrorCode.TAILORING_PLAN_INCOMPLETE,
          { pendingCount: plan.summary.pending }
        );
      }

      // 4. Fetch Master Resume
      let masterResume = await ResumeModel.findOne({ userId, variantType: "MASTER" });
      if (!masterResume) {
        masterResume = await ResumeModel.findOne({ userId, isDefault: true });
      }
      if (!masterResume || !masterResume.resumeDocument) {
        throw new AppError(
          "Master resume document not found. Create or upload a master resume first.",
          HTTP_STATUS.NOT_FOUND,
          TailoredResumeErrorCode.MASTER_RESUME_NOT_FOUND
        );
      }

      // 5. Existing Tailored Variant & User Edit Protection (Requirement 3 & 4)
      const existingVariant = await ResumeModel.findOne({
        userId,
        targetJobId: jobProfile._id,
        variantType: "TAILORED",
      });

      if (existingVariant) {
        // Detect if user made manual modifications in Resume Studio
        const hasUserEdits = (existingVariant.version && existingVariant.version > 1);
        if (hasUserEdits && !input.force) {
          throw new AppError(
            "An existing tailored resume for this job already contains manual customizations. Confirming regeneration will replace the variant.",
            HTTP_STATUS.CONFLICT,
            TailoredResumeErrorCode.EXISTING_TAILORED_RESUME_EDITED,
            {
              existingResumeId: existingVariant._id.toString(),
              existingVersion: existingVariant.version,
              requiresForce: true,
            }
          );
        }
      }

      // 6. Build Candidate Verification Context
      const candidateContext = TailoringFactualValidator.buildVerificationContext(
        profile,
        masterResume.resumeDocument
      );

      // 7. Deterministic Materialization in Memory
      const builderConfig = masterResume.builderConfig || DEFAULT_BUILDER_CONFIG;
      const {
        tailoredDoc,
        tailoredConfig,
        appliedProposalsCount,
        rejectedProposalsCount,
        protectedExclusionsCount,
      } = TailoredResumeGenerator.materializeTailoredResume(
        masterResume.resumeDocument,
        builderConfig,
        plan,
        candidateContext
      );

      // 8. Atomic Persistence (Tailored Resume First, then TailoringPlan APPLIED)
      let savedResume;
      if (existingVariant) {
        existingVariant.title = `Tailored — ${jobProfile.jobTitle} @ ${jobProfile.company}`;
        existingVariant.resumeDocument = tailoredDoc;
        existingVariant.builderConfig = tailoredConfig;
        existingVariant.sourceProfileVersion = profile.profileVersion;
        existingVariant.sourceTailoringPlanId = plan._id;
        existingVariant.sourceTailoringPlanVersion = plan.planVersion;
        existingVariant.version = (existingVariant.version || 1) + 1;
        existingVariant.status = ResumeStatus.PARSED;
        savedResume = await existingVariant.save();
      } else {
        savedResume = await ResumeModel.create({
          userId,
          title: `Tailored — ${jobProfile.jobTitle} @ ${jobProfile.company}`,
          originalFileName: `tailored-resume-${jobProfile.company}.json`,
          fileName: `tailored-resume-${jobProfile.company}.json`,
          variantType: "TAILORED",
          parentResumeId: masterResume._id,
          targetJobId: jobProfile._id,
          targetJobTitle: jobProfile.jobTitle,
          targetCompany: jobProfile.company,
          sourceProfileVersion: profile.profileVersion,
          sourceTailoringPlanId: plan._id,
          sourceTailoringPlanVersion: plan.planVersion,
          resumeDocument: tailoredDoc,
          builderConfig: tailoredConfig,
          isDefault: false,
          status: ResumeStatus.PARSED,
          version: 1,
        });
      }

      // 9. ONLY AFTER SUCCESSFUL RESUME PERSISTENCE: Mark Plan APPLIED (Requirement 1 & 12)
      plan.status = "APPLIED";
      plan.appliedAt = new Date();
      await plan.save();

      const resumeId = savedResume._id.toString();
      const studioUrl = `/dashboard/resume-studio?resumeId=${resumeId}`;

      const resumeMetadata: TailoredResumeMetadataDTO = {
        id: resumeId,
        title: savedResume.title,
        variantType: "TAILORED",
        parentResumeId: masterResume._id.toString(),
        targetJobId: jobProfile._id.toString(),
        targetJobTitle: savedResume.targetJobTitle,
        targetCompany: savedResume.targetCompany,
        version: savedResume.version,
        sourceTailoringPlanId: plan._id.toString(),
        sourceTailoringPlanVersion: plan.planVersion,
        sourceProfileVersion: savedResume.sourceProfileVersion,
        createdAt: savedResume.createdAt.toISOString(),
        updatedAt: savedResume.updatedAt.toISOString(),
        studioUrl,
      };

      return {
        success: true,
        resume: resumeMetadata,
        appliedProposalsCount,
        rejectedProposalsCount,
        protectedExclusionsCount,
        studioUrl,
      };
    } finally {
      this.activeGenerations.delete(lockKey);
    }
  }

  /**
   * Retrieves lightweight, metadata-safe information for an existing tailored resume.
   * Does NOT return the entire heavy AST (Requirement 16).
   */
  public static async getTailoredResumeMetadata(
    userId: string,
    jobProfileId: string
  ): Promise<TailoredResumeMetadataDTO | null> {
    const resume = await ResumeModel.findOne(
      { userId, targetJobId: jobProfileId, variantType: "TAILORED" },
      {
        _id: 1,
        title: 1,
        variantType: 1,
        parentResumeId: 1,
        targetJobId: 1,
        targetJobTitle: 1,
        targetCompany: 1,
        version: 1,
        sourceTailoringPlanId: 1,
        sourceTailoringPlanVersion: 1,
        sourceProfileVersion: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    if (!resume) {
      return null;
    }

    const resumeId = resume._id.toString();
    return {
      id: resumeId,
      title: resume.title,
      variantType: "TAILORED",
      parentResumeId: resume.parentResumeId ? resume.parentResumeId.toString() : "",
      targetJobId: resume.targetJobId ? resume.targetJobId.toString() : "",
      targetJobTitle: resume.targetJobTitle,
      targetCompany: resume.targetCompany,
      version: resume.version,
      sourceTailoringPlanId: resume.sourceTailoringPlanId ? resume.sourceTailoringPlanId.toString() : null,
      sourceTailoringPlanVersion: resume.sourceTailoringPlanVersion ?? null,
      sourceProfileVersion: resume.sourceProfileVersion ?? null,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
      studioUrl: `/dashboard/resume-studio?resumeId=${resumeId}`,
    };
  }
}
