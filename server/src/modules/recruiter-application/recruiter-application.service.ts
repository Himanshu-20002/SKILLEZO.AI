import { ApplicationRepository } from "@/database/repositories/application/ApplicationRepository";
import { CompanyMemberRepository } from "@/database/repositories/companyMember/CompanyMemberRepository";
import { JobRepository } from "@/database/repositories/job/JobRepository";
import { ApplicationStatus, CompanyMemberRole, CompanyMemberStatus } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { IResumeStorageService, resumeStorageService } from "@/core/storage/storage.service";
import { Readable } from "stream";
import {
  UpdateRecruiterApplicationStatusDTO,
  PaginatedRecruiterApplicationsResponseDTO,
  RecruiterApplicationDetailsDTO,
  RecruiterApplicationListItemDTO,
} from "./recruiter-application.dto";

export class RecruiterApplicationService {
  private readonly applicationRepository: ApplicationRepository;
  private readonly companyMemberRepository: CompanyMemberRepository;
  private readonly jobRepository: JobRepository;
  private readonly storageService: IResumeStorageService;

  constructor(
    applicationRepository?: ApplicationRepository,
    companyMemberRepository?: CompanyMemberRepository,
    jobRepository?: JobRepository,
    storageService?: IResumeStorageService
  ) {
    this.applicationRepository = applicationRepository || new ApplicationRepository();
    this.companyMemberRepository = companyMemberRepository || new CompanyMemberRepository();
    this.jobRepository = jobRepository || new JobRepository();
    this.storageService = storageService || resumeStorageService;
  }

  private async assertRecruiterAuthorization(userId: string): Promise<{ companyIds: string[]; companyJobIds: string[] }> {
    const memberships = await this.companyMemberRepository.findMembershipsByUser(userId);
    const allowedRoles: string[] = [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN, CompanyMemberRole.RECRUITER];
    const activeMemberships = memberships.filter(
      (m) =>
        m.status === CompanyMemberStatus.ACTIVE &&
        allowedRoles.includes(m.role)
    );

    if (activeMemberships.length === 0) {
      throw new AppError(
        "User has no active recruiter or admin company membership",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.RECRUITER_COMPANY_MEMBERSHIP_NOT_FOUND
      );
    }

    const companyIds = activeMemberships.map((m) => m.companyId.toString());

    // Find all jobs owned by these companies
    const jobs = await this.jobRepository.findMany({ companyId: { $in: companyIds } });
    const companyJobIds = jobs.map((j) => j._id.toString());

    return { companyIds, companyJobIds };
  }

  async getCompanyApplications(
    userId: string,
    query: { page?: number; limit?: number; jobId?: string; status?: string; search?: string }
  ): Promise<PaginatedRecruiterApplicationsResponseDTO> {
    const { companyJobIds } = await this.assertRecruiterAuthorization(userId);
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await this.applicationRepository.findCompanyApplications(companyJobIds, query);

    const items: RecruiterApplicationListItemDTO[] = result.items.map((app) => {
      const jobDoc = app.jobId as any;
      const resumeDoc = app.resumeId as any;

      return {
        id: app._id.toString(),
        status: app.status,
        job: jobDoc && typeof jobDoc === "object" && jobDoc.title
          ? {
            id: jobDoc._id ? jobDoc._id.toString() : (app.jobId as any)?.toString(),
            title: jobDoc.title,
            companyName: jobDoc.companyName || null,
          }
          : null,
        candidate: {
          id: app.userId,
        },
        resume: resumeDoc && typeof resumeDoc === "object" && resumeDoc.fileName
          ? {
            id: resumeDoc._id.toString(),
            title: resumeDoc.title || resumeDoc.fileName,
            originalFileName: resumeDoc.originalFileName || resumeDoc.fileName,
            version: resumeDoc.version || 1,
          }
          : null,
        appliedAt: app.appliedAt || app.createdAt,
        updatedAt: app.updatedAt,
      };
    });

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

  async getCompanyApplicationDetails(
    userId: string,
    applicationId: string
  ): Promise<RecruiterApplicationDetailsDTO> {
    const { companyJobIds } = await this.assertRecruiterAuthorization(userId);

    const application = await this.applicationRepository.findCompanyApplicationById(
      applicationId,
      companyJobIds
    );

    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    const jobDoc = application.jobId as any;
    const resumeDoc = application.resumeId as any;

    let resumeSnapshot: any = null;
    if (application.resumeSnapshot) {
      resumeSnapshot = {
        resumeId: application.resumeSnapshot.resumeId
          ? application.resumeSnapshot.resumeId.toString()
          : application.resumeId
            ? (application.resumeId as any).toString()
            : null,
        title: application.resumeSnapshot.title,
        originalFileName: application.resumeSnapshot.originalFileName,
        storageKey: application.resumeSnapshot.storageKey,
        mimeType: application.resumeSnapshot.mimeType,
        fileSize: application.resumeSnapshot.fileSize,
        version: application.resumeSnapshot.version,
        submittedAt: application.resumeSnapshot.submittedAt,
      };
    }

    return {
      id: application._id.toString(),
      userId: application.userId,
      status: application.status,
      job: jobDoc && typeof jobDoc === "object" && jobDoc.title
        ? {
          id: jobDoc._id.toString(),
          title: jobDoc.title,
          companyName: jobDoc.companyName || null,
          location: jobDoc.location || null,
          workplaceType: jobDoc.workplaceType || null,
          employmentType: jobDoc.employmentType || null,
        }
        : null,
      candidate: {
        id: application.userId,
      },
      resume: resumeDoc && typeof resumeDoc === "object" && resumeDoc.fileName
        ? {
          id: resumeDoc._id.toString(),
          title: resumeDoc.title || resumeDoc.fileName,
        }
        : null,
      resumeSnapshot,
      statusHistory: (application.statusHistory || []).map((h) => ({
        status: h.status,
        changedAt: h.changedAt,
        changedBy: h.changedBy || null,
        reason: h.reason || null,
      })),
      appliedAt: application.appliedAt || application.createdAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  async getApplicationStatusHistory(userId: string, applicationId: string) {
    const details = await this.getCompanyApplicationDetails(userId, applicationId);
    return details.statusHistory;
  }

  async streamApplicationResume(
    userId: string,
    applicationId: string
  ): Promise<{ stream: Readable; fileName: string; mimeType: string; fileSize: number }> {
    const details = await this.getCompanyApplicationDetails(userId, applicationId);

    if (!details.resumeSnapshot || !details.resumeSnapshot.storageKey) {
      throw new AppError(
        "Application resume snapshot or storage key is missing",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_RESUME_FILE_NOT_FOUND
      );
    }

    const storageKey = details.resumeSnapshot.storageKey;
    const exists = await this.storageService.exists(storageKey);
    if (!exists) {
      throw new AppError(
        "Submitted application resume file not found on storage",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_RESUME_FILE_NOT_FOUND
      );
    }

    const stream = await this.storageService.getStream(storageKey);
    return {
      stream,
      fileName: details.resumeSnapshot.originalFileName || "resume.pdf",
      mimeType: details.resumeSnapshot.mimeType || "application/pdf",
      fileSize: details.resumeSnapshot.fileSize || 0,
    };
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    dto: UpdateRecruiterApplicationStatusDTO
  ): Promise<RecruiterApplicationDetailsDTO> {
    const { companyJobIds } = await this.assertRecruiterAuthorization(userId);

    const application = await this.applicationRepository.findCompanyApplicationById(
      applicationId,
      companyJobIds
    );

    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    // Terminal status protection
    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new AppError(
        "Cannot modify status of a WITHDRAWN application",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION
      );
    }

    // State machine transition validation
    const allowedTransitions: Record<string, string[]> = {
      [ApplicationStatus.APPLIED]: [
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.UNDER_REVIEW]: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.SHORTLISTED]: [
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.INTERVIEW]: [
        ApplicationStatus.OFFERED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.OFFERED]: [
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.HIRED]: [], // Terminal
      [ApplicationStatus.REJECTED]: [], // Terminal
    };

    const allowed = allowedTransitions[application.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new AppError(
        `Invalid status transition from '${application.status}' to '${dto.status}'`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION
      );
    }

    application.status = dto.status;
    application.statusHistory.push({
      status: dto.status,
      changedAt: new Date(),
      changedBy: userId,
      reason: dto.reason || `Status updated to ${dto.status} by recruiter`,
    });

    await application.save();

    return await this.getCompanyApplicationDetails(userId, applicationId);
  }
}
