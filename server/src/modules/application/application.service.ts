import { ApplicationRepository } from "@/database/repositories/application/ApplicationRepository";
import { JobRepository } from "@/database/repositories/job/JobRepository";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IApplication } from "@/database/models/Application.model";
import { IResume } from "@/database/models/Resume.model";
import { ApplicationStatus, JobStatus, JobSourceType } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { IResumeStorageService, resumeStorageService } from "@/core/storage/storage.service";
import {
  CreateApplicationDTO,
  WithdrawApplicationDTO,
  ExternalApplicationResponseDTO,
  PaginatedApplicationsResponseDTO,
  ApplicationResponseDTO,
} from "./application.dto";

export class ApplicationService {
  private readonly applicationRepository: ApplicationRepository;
  private readonly jobRepository: JobRepository;
  private readonly resumeRepository: ResumeRepository;
  private readonly storageService: IResumeStorageService;

  constructor(
    applicationRepository?: ApplicationRepository,
    jobRepository?: JobRepository,
    resumeRepository?: ResumeRepository,
    storageService?: IResumeStorageService
  ) {
    this.applicationRepository = applicationRepository || new ApplicationRepository();
    this.jobRepository = jobRepository || new JobRepository();
    this.resumeRepository = resumeRepository || new ResumeRepository();
    this.storageService = storageService || resumeStorageService;
  }

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
        sourceType: JobSourceType.EXTERNAL,
        sourceProvider: job.sourceProvider || "external",
        externalId: job.externalId || null,
        sourceUrl: job.sourceUrl,
        message: "Continue the application on the original job source.",
      };
    }

    // 2. Native Job Status Validation
    if (job.status !== JobStatus.ACTIVE) {
      throw new AppError(
        `Cannot apply to job with status '${job.status}'. Only ACTIVE jobs accept applications.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_JOB_NOT_ACTIVE
      );
    }

    // 3. Resume Ownership Resolution & Storage Presence Verification
    let targetResume: IResume | null = null;

    if (dto.resumeId) {
      const resume = await this.resumeRepository.findById(dto.resumeId);
      if (!resume) {
        throw new AppError(
          "Selected resume not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.APPLICATION_RESUME_NOT_FOUND
        );
      }
      if (resume.userId !== userId) {
        throw new AppError(
          "Selected resume does not belong to candidate",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.APPLICATION_RESUME_NOT_OWNED
        );
      }
      targetResume = resume;
    } else {
      targetResume = await this.resumeRepository.findDefaultByUserId(userId);
      if (!targetResume) {
        const userResumes = await this.resumeRepository.findByUserId(userId);
        if (userResumes.length > 0) {
          targetResume = userResumes[0];
        }
      }
      if (!targetResume) {
        throw new AppError(
          "No resume found. Please upload a resume before applying.",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.APPLICATION_RESUME_NOT_FOUND
        );
      }
    }

    // Verify physical file presence on storage
    if (targetResume.storageKey) {
      const fileExists = await this.storageService.exists(targetResume.storageKey);
      if (!fileExists) {
        throw new AppError(
          "Resume file not found on storage",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.APPLICATION_RESUME_FILE_NOT_FOUND
        );
      }
    }

    // 4. Duplicate Check
    const existingApp = await this.applicationRepository.findByUserAndJob(userId, dto.jobId);
    if (existingApp) {
      throw new AppError(
        "Candidate has already applied for this job",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.APPLICATION_ALREADY_EXISTS
      );
    }

    // 5. Build Resume Snapshot
    const resumeSnapshot = {
      resumeId: targetResume._id,
      title: targetResume.title || targetResume.fileName,
      originalFileName: targetResume.originalFileName || targetResume.fileName,
      fileName: targetResume.fileName,
      storageKey: targetResume.storageKey || "",
      mimeType: targetResume.mimeType || "",
      fileSize: targetResume.fileSize || 0,
      version: targetResume.version || 1,
      submittedAt: new Date(),
    };

    // 6. Create Application Record
    try {
      const newApplication = await this.applicationRepository.create({
        userId,
        jobId: job._id as any,
        resumeId: targetResume._id,
        resumeSnapshot,
        status: ApplicationStatus.APPLIED,
        statusHistory: [
          {
            status: ApplicationStatus.APPLIED,
            changedAt: new Date(),
            changedBy: userId,
            reason: "Initial job application submitted",
          },
        ],
        appliedAt: new Date(),
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

  // Method: return list of applied job IDs for a candidate
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

    const withdrawableStatuses: string[] = [
      ApplicationStatus.APPLIED,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW,
    ];

    if (!withdrawableStatuses.includes(application.status)) {
      throw new AppError(
        `Cannot withdraw application with current status '${application.status}'`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_CANNOT_WITHDRAW
      );
    }

    application.status = ApplicationStatus.WITHDRAWN;
    application.statusHistory.push({
      status: ApplicationStatus.WITHDRAWN,
      changedAt: new Date(),
      changedBy: userId,
      reason: dto.reason || "Withdrawn by candidate",
    });

    await application.save();

    const populated = await this.applicationRepository.findByIdAndUserId(applicationId, userId);
    return this.formatApplicationResponse(populated!);
  }

  private formatApplicationResponse(app: IApplication): ApplicationResponseDTO {
    const jobDoc = app.jobId as any;
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
    }

    let resumeSummary = null;
    if (resumeDoc && typeof resumeDoc === "object" && resumeDoc.fileName) {
      resumeSummary = {
        id: resumeDoc._id.toString(),
        title: resumeDoc.title || resumeDoc.fileName,
        isDefault: resumeDoc.isDefault || false,
      };
    }

    let resumeSnapshot: any = null;
    if (app.resumeSnapshot) {
      resumeSnapshot = {
        resumeId: app.resumeSnapshot.resumeId ? app.resumeSnapshot.resumeId.toString() : (app.resumeId as any)?.toString(),
        title: app.resumeSnapshot.title,
        originalFileName: app.resumeSnapshot.originalFileName,
        storageKey: app.resumeSnapshot.storageKey,
        mimeType: app.resumeSnapshot.mimeType,
        fileSize: app.resumeSnapshot.fileSize,
        version: app.resumeSnapshot.version,
        submittedAt: app.resumeSnapshot.submittedAt,
      };
    }

    return {
      id: app._id.toString(),
      userId: app.userId,
      jobId: jobDoc?._id ? jobDoc._id.toString() : (app.jobId as any).toString(),
      resumeId: resumeDoc?._id ? resumeDoc._id.toString() : app.resumeId ? (app.resumeId as any).toString() : null,
      status: app.status,
      job: jobSummary,
      resume: resumeSummary,
      resumeSnapshot,
      statusHistory: app.statusHistory.map((h) => ({
        status: h.status,
        changedAt: h.changedAt,
        changedBy: h.changedBy || null,
        reason: h.reason || null,
      })),
      appliedAt: app.appliedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
