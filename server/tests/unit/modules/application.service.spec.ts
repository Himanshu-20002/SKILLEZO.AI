import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApplicationService } from "@/modules/application/application.service";
import { ApplicationRepository } from "@/database/repositories/application/ApplicationRepository";
import { JobRepository } from "@/database/repositories/job/JobRepository";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { ApplicationStatus, JobStatus, JobSourceType } from "@/core/constants/enums";
import { ERROR_CODES } from "@/core/constants/error-codes";

describe("ApplicationService Unit Tests", () => {
  let applicationService: ApplicationService;
  let mockAppRepository: any;
  let mockJobRepository: any;
  let mockResumeRepository: any;

  beforeEach(() => {
    mockAppRepository = {
      create: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserAndJob: vi.fn(),
      findPaginatedByUserId: vi.fn(),
      findOne: vi.fn(),
    };

    mockJobRepository = {
      findById: vi.fn(),
    };

    mockResumeRepository = {
      findById: vi.fn(),
      findUserResumeById: vi.fn(),
      findDefaultByUserId: vi.fn(),
      findByUserId: vi.fn(),
    };

    const mockStorageService: any = {
      exists: vi.fn().mockResolvedValue(true),
    };

    applicationService = new ApplicationService(
      mockAppRepository,
      mockJobRepository,
      mockResumeRepository,
      mockStorageService
    );
  });

  describe("applyToJob", () => {
    it("should return external application redirection payload for external jooble jobs", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_ext_1",
        sourceType: JobSourceType.EXTERNAL,
        sourceProvider: "jooble",
        sourceUrl: "https://jooble.org/job/123",
        externalId: "ext_123",
      } as any);

      const result = await applicationService.applyToJob("usr_candidate_1", {
        jobId: "job_ext_1",
      });

      expect(result).toEqual({
        type: "external_application",
        sourceType: "external",
        sourceProvider: "jooble",
        externalId: "ext_123",
        sourceUrl: "https://jooble.org/job/123",
        message: "Continue the application on the original job source.",
      });
      expect(mockAppRepository.create).not.toHaveBeenCalled();
    });

    it("should throw APPLICATION_JOB_NOT_ACTIVE when job is DRAFT or CLOSED", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.CLOSED,
      } as any);

      await expect(
        applicationService.applyToJob("usr_candidate_1", { jobId: "job_native_1" })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_JOB_NOT_ACTIVE,
        })
      );
    });

    it("should throw APPLICATION_RESUME_NOT_FOUND if provided resume ID does not exist", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findById.mockResolvedValue(null);

      await expect(
        applicationService.applyToJob("usr_candidate_1", {
          jobId: "job_native_1",
          resumeId: "res_non_existent",
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_RESUME_NOT_FOUND,
        })
      );
    });

    it("should throw APPLICATION_RESUME_NOT_OWNED (403) if provided resume belongs to another user", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findById.mockResolvedValue({
        _id: "res_other",
        userId: "usr_attacker_999",
        storageKey: "resumes/usr_attacker_999/uuid.pdf",
      });

      await expect(
        applicationService.applyToJob("usr_candidate_1", {
          jobId: "job_native_1",
          resumeId: "res_other",
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_RESUME_NOT_OWNED,
        })
      );
    });

    it("should throw APPLICATION_RESUME_FILE_NOT_FOUND if physical file is missing from storage", async () => {
      const mockStorageMissing: any = {
        exists: vi.fn().mockResolvedValue(false),
      };
      const customAppService = new ApplicationService(
        mockAppRepository,
        mockJobRepository,
        mockResumeRepository,
        mockStorageMissing
      );

      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findById.mockResolvedValue({
        _id: "res_1",
        userId: "usr_candidate_1",
        storageKey: "resumes/usr_candidate_1/uuid.pdf",
      });

      await expect(
        customAppService.applyToJob("usr_candidate_1", {
          jobId: "job_native_1",
          resumeId: "res_1",
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_RESUME_FILE_NOT_FOUND,
        })
      );
    });

    it("should throw APPLICATION_ALREADY_EXISTS when candidate has already applied", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findById.mockResolvedValue({
        _id: "res_1",
        userId: "usr_candidate_1",
        storageKey: "resumes/usr_candidate_1/uuid.pdf",
      } as any);
      mockAppRepository.findByUserAndJob.mockResolvedValue({
        _id: "app_1",
      } as any);

      await expect(
        applicationService.applyToJob("usr_candidate_1", {
          jobId: "job_native_1",
          resumeId: "res_1",
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_ALREADY_EXISTS,
        })
      );
    });

    it("should handle MongoDB duplicate key (11000) race condition gracefully", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findById.mockResolvedValue({
        _id: "res_1",
        userId: "usr_candidate_1",
        storageKey: "resumes/usr_candidate_1/uuid.pdf",
      } as any);
      mockAppRepository.findByUserAndJob.mockResolvedValue(null);
      mockAppRepository.create.mockRejectedValue({ code: 11000 });

      await expect(
        applicationService.applyToJob("usr_candidate_1", {
          jobId: "job_native_1",
          resumeId: "res_1",
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_ALREADY_EXISTS,
        })
      );
    });

    it("should successfully create application for active job with valid candidate resume", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findById.mockResolvedValue({
        _id: "res_1",
        userId: "usr_candidate_1",
        fileName: "resume.pdf",
        storageKey: "resumes/usr_candidate_1/uuid.pdf",
      } as any);
      mockAppRepository.findByUserAndJob.mockResolvedValue(null);
      mockAppRepository.create.mockResolvedValue({
        _id: "app_new_1",
        userId: "usr_candidate_1",
        jobId: "job_native_1",
        status: ApplicationStatus.APPLIED,
      });

      const result = await applicationService.applyToJob("usr_candidate_1", {
        jobId: "job_native_1",
        resumeId: "res_1",
      });

      expect(mockAppRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "usr_candidate_1",
          jobId: "job_native_1",
          resumeId: "res_1",
          status: ApplicationStatus.APPLIED,
        })
      );
      expect((result as any).status).toBe(ApplicationStatus.APPLIED);
    });
  });

  describe("withdrawApplication", () => {
    it("should throw APPLICATION_ALREADY_WITHDRAWN if application status is already WITHDRAWN", async () => {
      mockAppRepository.findOne.mockResolvedValue({
        _id: "app_1",
        userId: "usr_candidate_1",
        status: ApplicationStatus.WITHDRAWN,
      } as any);

      await expect(
        applicationService.withdrawApplication("usr_candidate_1", "app_1", {})
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_ALREADY_WITHDRAWN,
        })
      );
    });
  });
});
