import { ApplicationRepository } from "@/database/repositories/application/ApplicationRepository";
import { JobRepository } from "@/database/repositories/job/JobRepository";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { JobProfileRepository, jobProfileRepository as defaultJobProfileRepo } from "@/database/repositories/job-profile/JobProfileRepository";
import {
  IApplication,
  IResumeSnapshot,
  IJobIdentitySnapshot,
  IResumeTailoringProvenance,
  IApplicationTimelineEvent,
} from "@/database/models/Application.model";
import { ApplicationStatus, JobSourceType, ApplicationSource } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { IResumeStorageService, resumeStorageService } from "@/core/storage/storage.service";
import { computeSnapshotHash } from "./application.snapshot";
import { validateStatusTransition } from "./application.validator";
import { Types } from "mongoose";
import {
  CreateApplicationDTO,
  CreateJobProfileApplicationDTO,
  UpdateApplicationStatusDTO,
  AddApplicationTimelineNoteDTO,
  WithdrawApplicationDTO,
  ExternalApplicationResponseDTO,
  PaginatedApplicationsResponseDTO,
  PaginatedApplicationListDTO,
  ApplicationResponseDTO,
  ApplicationListItemDTO,
} from "./application.dto";

export class ApplicationService {
  private readonly applicationRepository: ApplicationRepository;
  private readonly jobRepository: JobRepository;
  private readonly resumeRepository: ResumeRepository;
  private readonly jobProfileRepository: JobProfileRepository;
  private readonly storageService: IResumeStorageService;

  constructor(
    applicationRepository?: ApplicationRepository,
    jobRepository?: JobRepository,
    resumeRepository?: ResumeRepository,
    jobProfileRepository?: JobProfileRepository,
    storageService?: IResumeStorageService
  ) {
    this.applicationRepository = applicationRepository || new ApplicationRepository();
    this.jobRepository = jobRepository || new JobRepository();
    this.resumeRepository = resumeRepository || new ResumeRepository();
    this.jobProfileRepository = jobProfileRepository || defaultJobProfileRepo;
    this.storageService = storageService || resumeStorageService;
  }

  /**
   * LEGACY: Candidate applies to a recruiter/platform job.
   * Preserved 100% for backward compatibility.
   */
  async applyToJob(
    userId: string,
    dto: CreateApplicationDTO
  ): Promise<IApplication | ExternalApplicationResponseDTO> {
    const job = await this.jobRepository.findById(dto.jobId);
    if (!job) {
      throw new AppError(
        "Job not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_JOB_NOT_FOUND
      );
    }

    // 1. External Job Handling
    if (job.sourceType === JobSourceType.EXTERNAL) {
      if (!job.sourceUrl) {
        throw new AppError(
          "External job source URL is unavailable",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.APPLICATION_EXTERNAL_JOB
        );
      }
      return {
        type: "external_application",
        sourceType: "external",
        sourceProvider: job.sourceProvider || "external",
        externalId: job.externalId || null,
        sourceUrl: job.sourceUrl,
        message: "This job is hosted externally. Please complete your application on the company website.",
      };
    }

    // 2. Resolve target resume
    let targetResume = null;
    if (dto.resumeId) {
      targetResume = await this.resumeRepository.findUserResumeById(userId, dto.resumeId);
      if (!targetResume) {
        throw new AppError(
          "Specified resume not found or does not belong to candidate",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.APPLICATION_RESUME_NOT_FOUND
        );
      }
    } else {
      targetResume = await this.resumeRepository.findDefaultByUserId(userId);
      if (!targetResume) {
        throw new AppError(
          "No default resume found. Please upload or specify a resume to apply",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.APPLICATION_RESUME_NOT_FOUND
        );
      }
    }

    // 3. Verify physical file presence on storage if storageKey present
    if (targetResume.storageKey && targetResume.storageKey !== "profile-generated") {
      const fileExists = await this.storageService.exists(targetResume.storageKey);
      if (!fileExists) {
        throw new AppError(
          "Resume file not found on storage",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.APPLICATION_RESUME_FILE_NOT_FOUND
        );
      }
    }

    // 4. Build Resume Snapshot (legacy file format)
    const capturedAt = new Date();
    const resumeSnapshot: IResumeSnapshot = {
      resumeId: targetResume._id,
      title: targetResume.title || targetResume.fileName || "Resume",
      originalFileName: targetResume.originalFileName || targetResume.fileName || null,
      fileName: targetResume.fileName || null,
      storageKey: targetResume.storageKey || null,
      mimeType: targetResume.mimeType || null,
      fileSize: targetResume.fileSize || 0,
      version: targetResume.version || 1,
      capturedAt,
      submittedAt: capturedAt,
    };

    // 5. Duplicate Check
    const existingApp = await this.applicationRepository.findByUserAndJob(userId, dto.jobId);
    if (existingApp) {
      if (existingApp.status === ApplicationStatus.WITHDRAWN) {
        existingApp.status = ApplicationStatus.APPLIED;
        existingApp.resumeId = targetResume._id;
        existingApp.resumeSnapshot = resumeSnapshot as any;
        existingApp.appliedAt = capturedAt;
        existingApp.statusHistory.push({
          id: new Types.ObjectId().toString(),
          type: "APPLIED",
          status: ApplicationStatus.APPLIED,
          fromStatus: ApplicationStatus.WITHDRAWN,
          toStatus: ApplicationStatus.APPLIED,
          changedAt: capturedAt,
          changedBy: userId,
          reason: "Re-applied by candidate",
        });
        await existingApp.save();
        return existingApp;
      }

      throw new AppError(
        "Candidate has already applied for this job",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.APPLICATION_ALREADY_EXISTS
      );
    }

    // 6. Create Application Record
    try {
      const newApplication = await this.applicationRepository.create({
        userId,
        source: ApplicationSource.PLATFORM,
        jobId: job._id as any,
        resumeId: targetResume._id,
        resumeSnapshot,
        status: ApplicationStatus.APPLIED,
        statusHistory: [
          {
            id: new Types.ObjectId().toString(),
            type: "APPLIED",
            status: ApplicationStatus.APPLIED,
            fromStatus: null,
            toStatus: ApplicationStatus.APPLIED,
            changedAt: capturedAt,
            changedBy: userId,
            reason: "Initial job application submitted",
          },
        ],
        appliedAt: capturedAt,
      } as any);

      return newApplication;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new AppError(
          "Candidate has already applied for this job",
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.APPLICATION_ALREADY_EXISTS
        );
      }
      throw err;
    }
  }

  /**
   * PHASE 6F: Candidate tracks or marks an application for an analyzed JobProfile + Tailored Resume.
   * Builds an immutable self-contained resume snapshot with deterministic SHA-256 hash.
   */
  async applyToJobProfile(
    userId: string,
    dto: CreateJobProfileApplicationDTO
  ): Promise<IApplication> {
    // 1. Authenticated Resume Verification
    const resume = await this.resumeRepository.findUserResumeById(userId, dto.resumeId);
    if (!resume) {
      throw new AppError(
        "Specified resume not found or does not belong to candidate",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_RESUME_NOT_FOUND
      );
    }

    // 2. Strict Target Validation (Safeguard 6)
    if (resume.variantType !== "TAILORED") {
      throw new AppError(
        "Only tailored resumes can be used to track job profile applications",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_INVALID_RESUME_VARIANT
      );
    }

    if (!resume.resumeDocument || !resume.builderConfig) {
      throw new AppError(
        "Tailored resume structure is incomplete or unrendered",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_RESUME_INCOMPLETE
      );
    }

    // 3. Authenticated JobProfile Verification
    const jobProfile = await this.jobProfileRepository.findByIdAndUserId(dto.jobProfileId, userId);
    if (!jobProfile) {
      throw new AppError(
        "Job profile not found or does not belong to candidate",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_JOB_NOT_FOUND
      );
    }

    // Validate target consistency if resume specifies targetJobId
    if (resume.targetJobId && resume.targetJobId.toString() !== jobProfile._id.toString()) {
      throw new AppError(
        "Tailored resume target does not match the selected job profile",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_TARGET_MISMATCH
      );
    }

    // 4. Active Application & Idempotency Check (Safeguards 5 & 8)
    const activeApp = await this.applicationRepository.findActiveByUserIdAndJobProfileId(
      userId,
      dto.jobProfileId
    );
    if (activeApp) {
      const msSinceCreation = Date.now() - new Date(activeApp.createdAt).getTime();
      // Rapid double-click debounce: return existing record safely
      if (msSinceCreation < 10000) {
        return activeApp;
      }
      throw new AppError(
        "You already have an active application for this job profile. You can manage it from your Applications dashboard.",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.APPLICATION_ALREADY_EXISTS
      );
    }

    // 5. Canonical Tailoring Provenance (Safeguard 2)
    const provenance: IResumeTailoringProvenance = {
      sourceProfileVersion: resume.sourceProfileVersion || null,
      sourceTailoringPlanId: (resume.sourceTailoringPlanId as any) || null,
      sourceTailoringPlanVersion: resume.sourceTailoringPlanVersion || null,
      parentResumeId: (resume.parentResumeId as any) || null,
      targetJobId: (resume.targetJobId as any) || null,
      targetJobTitle: resume.targetJobTitle || null,
      targetCompany: resume.targetCompany || null,
    };

    // 6. Historical Job Identity Snapshot (Preserves Nullability - Safeguard 4)
    const jobIdentitySnapshot: IJobIdentitySnapshot = {
      jobProfileId: jobProfile._id,
      companyName: jobProfile.company || resume.targetCompany || null,
      jobTitle: jobProfile.jobTitle || resume.targetJobTitle || null,
      jobUrl: jobProfile.jobUrl || null,
      location: jobProfile.analysis?.location || null,
      seniority: jobProfile.analysis?.seniority || null,
    };

    // 7. Deterministic Snapshot Hash (Zero-any SHA-256 - Safeguard 3)
    const snapshotHash = computeSnapshotHash(resume.resumeDocument, resume.builderConfig);

    // 8. Self-Contained Historical Snapshot (Safeguard 9)
    const capturedAt = new Date();
    const resumeSnapshot: IResumeSnapshot = {
      resumeId: resume._id,
      title: resume.title || jobIdentitySnapshot.jobTitle || "Tailored Resume",
      variantType: "TAILORED",
      resumeUpdatedAt: resume.updatedAt || capturedAt,
      resumeDocument: resume.resumeDocument,
      builderConfig: resume.builderConfig,
      snapshotHash,
      provenance,
      capturedAt,
    };

    // 9. Status & Timestamp Semantics (Safeguard 1)
    const targetStatus =
      dto.status === ApplicationStatus.APPLIED
        ? ApplicationStatus.APPLIED
        : ApplicationStatus.DRAFT;
    const appliedAt = targetStatus === ApplicationStatus.APPLIED ? capturedAt : null;

    // 10. Initial Timeline Event (Safeguard 7)
    const initialEvent: IApplicationTimelineEvent = {
      id: new Types.ObjectId().toString(),
      type: "CREATED",
      status: targetStatus,
      fromStatus: null,
      toStatus: targetStatus,
      note:
        targetStatus === ApplicationStatus.APPLIED
          ? "Application recorded as submitted by candidate"
          : "Application tracking record created as draft",
      changedAt: capturedAt,
      changedBy: userId,
      reason: "Initial application tracking record created",
    };

    // 11. Atomic Persistence (Single-document atomicity)
    const application = await this.applicationRepository.create({
      userId,
      source: ApplicationSource.JOB_INTELLIGENCE,
      jobProfileId: jobProfile._id,
      jobIdentitySnapshot,
      resumeId: resume._id,
      resumeSnapshot,
      status: targetStatus,
      statusHistory: [initialEvent],
      appliedAt,
    } as any);

    return application;
  }

  /**
   * Advance application status through validated lifecycle.
   */
  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDTO
  ): Promise<ApplicationResponseDTO> {
    const application = await this.applicationRepository.findOne({ _id: applicationId, userId });
    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    // Server-side State Machine Validation
    validateStatusTransition(application.status, dto.status);

    const now = new Date();
    const isFirstApply =
      dto.status === ApplicationStatus.APPLIED && application.status === ApplicationStatus.DRAFT;

    // Lock appliedAt on transition to APPLIED
    if (isFirstApply && !application.appliedAt) {
      application.appliedAt = now;
    }

    // Append Timeline Event
    application.statusHistory.push({
      id: new Types.ObjectId().toString(),
      type: isFirstApply ? "APPLIED" : "STATUS_CHANGED",
      status: dto.status,
      fromStatus: application.status,
      toStatus: dto.status,
      note: dto.reason || (isFirstApply ? "Candidate marked application as submitted" : null),
      changedAt: now,
      changedBy: userId,
      reason: dto.reason || null,
    });

    application.status = dto.status;
    await application.save();

    const populated = await this.applicationRepository.findByIdAndUserId(applicationId, userId);
    return this.formatApplicationResponse(populated!);
  }

  /**
   * Append candidate note to application timeline without changing status.
   */
  async addTimelineNote(
    userId: string,
    applicationId: string,
    dto: AddApplicationTimelineNoteDTO
  ): Promise<ApplicationResponseDTO> {
    const application = await this.applicationRepository.findOne({ _id: applicationId, userId });
    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    application.statusHistory.push({
      id: new Types.ObjectId().toString(),
      type: "NOTE_ADDED",
      status: application.status,
      fromStatus: null,
      toStatus: null,
      note: dto.note.trim(),
      changedAt: new Date(),
      changedBy: userId,
      reason: "Candidate note added",
    });

    await application.save();

    const populated = await this.applicationRepository.findByIdAndUserId(applicationId, userId);
    return this.formatApplicationResponse(populated!);
  }

  /**
   * Get metadata-only paginated list of candidate applications for fast dashboard rendering.
   */
  async getMyApplicationsList(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      jobProfileId?: string;
      source?: string;
      search?: string;
    } = {}
  ): Promise<PaginatedApplicationListDTO> {
    const result = await this.applicationRepository.findPaginatedByUserId(userId, {
      ...options,
      metadataOnly: true,
    });

    const items: ApplicationListItemDTO[] = result.items.map((app) => this.formatApplicationListItem(app));

    return {
      items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    };
  }

  /**
   * Backward-compatible legacy applications query.
   */
  async getMyApplications(
    userId: string,
    page = 1,
    limit = 20,
    status?: string
  ): Promise<PaginatedApplicationsResponseDTO> {
    const result = await this.applicationRepository.findPaginatedByUserId(userId, { page, limit, status });

    const items: ApplicationResponseDTO[] = result.items.map((app) => this.formatApplicationResponse(app));

    return {
      items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    };
  }

  /**
   * Get single application detail including full immutable resume snapshot.
   */
  async getMyApplication(userId: string, applicationId: string): Promise<ApplicationResponseDTO> {
    const application = await this.applicationRepository.findByIdAndUserId(applicationId, userId);
    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }
    return this.formatApplicationResponse(application);
  }

  /**
   * Delete an application record. Never mutates or deletes Resume or JobProfile.
   */
  async deleteApplication(userId: string, applicationId: string): Promise<{ success: boolean; id: string }> {
    const application = await this.applicationRepository.findOne({ _id: applicationId, userId });
    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    await this.applicationRepository.deleteByIdAndUserId(applicationId, userId);
    return { success: true, id: applicationId };
  }

  async getAppliedJobIds(userId: string): Promise<string[]> {
    return await this.applicationRepository.findAppliedJobIdsByUserId(userId);
  }

  async getApplicationStatusHistory(userId: string, applicationId: string) {
    const application = await this.getMyApplication(userId, applicationId);
    return application.statusHistory;
  }

  async withdrawApplication(
    userId: string,
    applicationId: string,
    dto: WithdrawApplicationDTO
  ): Promise<ApplicationResponseDTO> {
    const application = await this.applicationRepository.findOne({ _id: applicationId, userId });
    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new AppError(
        "Application is already withdrawn",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.APPLICATION_ALREADY_WITHDRAWN
      );
    }

    // Validate transition to WITHDRAWN
    validateStatusTransition(application.status, ApplicationStatus.WITHDRAWN);

    application.status = ApplicationStatus.WITHDRAWN;
    application.statusHistory.push({
      id: new Types.ObjectId().toString(),
      type: "STATUS_CHANGED",
      status: ApplicationStatus.WITHDRAWN,
      fromStatus: application.status,
      toStatus: ApplicationStatus.WITHDRAWN,
      changedAt: new Date(),
      changedBy: userId,
      reason: dto.reason || "Withdrawn by candidate",
    });

    await application.save();

    const populated = await this.applicationRepository.findByIdAndUserId(applicationId, userId);
    return this.formatApplicationResponse(populated!);
  }

  private formatApplicationListItem(app: IApplication): ApplicationListItemDTO {
    const jobDoc = app.jobId as any;
    const jobProfileDoc = app.jobProfileId as any;
    const resumeDoc = app.resumeId as any;

    let companyName = app.jobIdentitySnapshot?.companyName || null;
    let jobTitle = app.jobIdentitySnapshot?.jobTitle || null;
    let jobUrl = app.jobIdentitySnapshot?.jobUrl || null;
    let location = app.jobIdentitySnapshot?.location || null;

    if (!companyName && jobDoc && typeof jobDoc === "object") {
      companyName = jobDoc.companyName || null;
      jobTitle = jobDoc.title || null;
      location = jobDoc.location || null;
    }

    if (!jobTitle && jobProfileDoc && typeof jobProfileDoc === "object") {
      jobTitle = jobProfileDoc.jobTitle || null;
      companyName = companyName || jobProfileDoc.company || null;
      jobUrl = jobUrl || jobProfileDoc.jobUrl || null;
    }

    return {
      id: app._id.toString(),
      userId: app.userId,
      source: app.source || ApplicationSource.PLATFORM,
      jobId: jobDoc?._id ? jobDoc._id.toString() : (app.jobId as any)?.toString() || null,
      jobProfileId: jobProfileDoc?._id
        ? jobProfileDoc._id.toString()
        : (app.jobProfileId as any)?.toString() || null,
      jobTitle,
      companyName,
      jobUrl,
      location,
      resumeId: resumeDoc?._id ? resumeDoc._id.toString() : (app.resumeId as any)?.toString() || null,
      resumeTitle: app.resumeSnapshot?.title || resumeDoc?.title || "Resume",
      resumeVariantType: app.resumeSnapshot?.variantType || resumeDoc?.variantType || "TAILORED",
      status: app.status,
      appliedAt: app.appliedAt || null,
      capturedAt: app.resumeSnapshot?.capturedAt
        ? new Date(app.resumeSnapshot.capturedAt)
        : app.createdAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  private formatApplicationResponse(app: IApplication): ApplicationResponseDTO {
    const jobDoc = app.jobId as any;
    const jobProfileDoc = app.jobProfileId as any;
    const resumeDoc = app.resumeId as any;

    let jobSummary = null;
    if (jobDoc && typeof jobDoc === "object" && jobDoc.title) {
      jobSummary = {
        id: jobDoc._id.toString(),
        title: jobDoc.title,
        companyName: jobDoc.companyName || null,
        location: jobDoc.location || null,
        workplaceType: jobDoc.workplaceType || null,
        employmentType: jobDoc.employmentType || null,
        status: jobDoc.status || null,
      };
    } else if (jobProfileDoc && typeof jobProfileDoc === "object") {
      jobSummary = {
        id: jobProfileDoc._id.toString(),
        title: jobProfileDoc.jobTitle,
        companyName: jobProfileDoc.company || null,
        location: jobProfileDoc.analysis?.location || null,
        jobUrl: jobProfileDoc.jobUrl || null,
      };
    }

    let resumeSummary = null;
    if (resumeDoc && typeof resumeDoc === "object") {
      resumeSummary = {
        id: resumeDoc._id.toString(),
        title: resumeDoc.title || resumeDoc.fileName || "Resume",
        variantType: resumeDoc.variantType || "TAILORED",
        isDefault: resumeDoc.isDefault || false,
      };
    }

    let resumeSnapshot: any = null;
    if (app.resumeSnapshot) {
      resumeSnapshot = {
        resumeId: app.resumeSnapshot.resumeId
          ? app.resumeSnapshot.resumeId.toString()
          : (app.resumeId as any)?.toString(),
        title: app.resumeSnapshot.title,
        variantType: app.resumeSnapshot.variantType || "TAILORED",
        resumeUpdatedAt: app.resumeSnapshot.resumeUpdatedAt || app.resumeSnapshot.capturedAt,
        resumeDocument: app.resumeSnapshot.resumeDocument || null,
        builderConfig: app.resumeSnapshot.builderConfig || null,
        snapshotHash: app.resumeSnapshot.snapshotHash || "",
        provenance: app.resumeSnapshot.provenance || null,
        originalFileName: app.resumeSnapshot.originalFileName || null,
        fileName: app.resumeSnapshot.fileName || null,
        storageKey: app.resumeSnapshot.storageKey || null,
        mimeType: app.resumeSnapshot.mimeType || null,
        fileSize: app.resumeSnapshot.fileSize || 0,
        version: app.resumeSnapshot.version || 1,
        capturedAt: app.resumeSnapshot.capturedAt,
        submittedAt: app.resumeSnapshot.submittedAt || null,
      };
    }

    return {
      id: app._id.toString(),
      userId: app.userId,
      source: app.source || ApplicationSource.PLATFORM,
      jobId: jobDoc?._id ? jobDoc._id.toString() : (app.jobId as any)?.toString() || null,
      jobProfileId: jobProfileDoc?._id
        ? jobProfileDoc._id.toString()
        : (app.jobProfileId as any)?.toString() || null,
      jobIdentity: app.jobIdentitySnapshot || null,
      resumeId: resumeDoc?._id ? resumeDoc._id.toString() : app.resumeId ? (app.resumeId as any).toString() : null,
      status: app.status,
      job: jobSummary,
      resume: resumeSummary,
      resumeSnapshot,
      statusHistory: app.statusHistory.map((h) => ({
        id: h.id || new Types.ObjectId().toString(),
        type: h.type || "STATUS_CHANGED",
        status: h.status,
        fromStatus: h.fromStatus || null,
        toStatus: h.toStatus || null,
        note: h.note || null,
        changedAt: h.changedAt,
        changedBy: h.changedBy || null,
        reason: h.reason || null,
      })),
      appliedAt: app.appliedAt || null,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
