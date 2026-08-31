import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApplicationService } from "../application.service";
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
      findUserResumeById: vi.fn(),
      findDefaultByUserId: vi.fn(),
      findByUserId: vi.fn(),
    };

    applicationService = new ApplicationService(
      mockAppRepository,
      mockJobRepository,
      mockResumeRepository
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

    it("should throw APPLICATION_RESUME_NOT_OWNED if provided resume does not belong to user", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findUserResumeById.mockResolvedValue(null);

      await expect(
        applicationService.applyToJob("usr_candidate_1", {
          jobId: "job_native_1",
          resumeId: "res_other_user",
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_RESUME_NOT_OWNED,
        })
      );
    });

    it("should throw APPLICATION_ALREADY_EXISTS when candidate has already applied", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: "job_native_1",
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
      } as any);
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: "res_1",
        userId: "usr_candidate_1",
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
