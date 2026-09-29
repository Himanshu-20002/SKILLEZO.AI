import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApplicationService } from "@/modules/application/application.service";
import { ApplicationStatus, ApplicationSource, JobSourceType } from "@/core/constants/enums";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { Types } from "mongoose";

describe("ApplicationService Unit & Regression Tests (Phase 6F + Legacy)", () => {
  let applicationService: ApplicationService;
  let mockAppRepository: any;
  let mockJobRepository: any;
  let mockResumeRepository: any;
  let mockJobProfileRepository: any;
  let mockStorageService: any;

  const validResumeDocument = {
    contact: { name: "Test Candidate", email: "test@example.com" },
    summary: "Experienced Engineer",
    experiences: [],
    skills: ["TypeScript", "React"],
  };

  const validBuilderConfig = {
    template: "modern",
    colorScheme: "blue",
    typography: "sans",
  };

  beforeEach(() => {
    mockAppRepository = {
      create: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByUserAndJob: vi.fn(),
      findByUserAndJobProfile: vi.fn(),
      findActiveByUserIdAndJobProfileId: vi.fn(),
      findPaginatedByUserId: vi.fn(),
      findOne: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
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

    mockJobProfileRepository = {
      findByIdAndUserId: vi.fn(),
    };

    mockStorageService = {
      exists: vi.fn().mockResolvedValue(true),
    };

    applicationService = new ApplicationService(
      mockAppRepository,
      mockJobRepository,
      mockResumeRepository,
      mockJobProfileRepository,
      mockStorageService
    );
  });

  // ==========================================
  // 1. LEGACY PLATFORM APPLICATION REGRESSION
  // ==========================================
  describe("Legacy Platform Application Compatibility", () => {
    it("should return external application redirection payload for external jobs", async () => {
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
        message: "This job is hosted externally. Please complete your application on the company website.",
      });
      expect(mockAppRepository.create).not.toHaveBeenCalled();
    });

    it("should successfully create a legacy platform application with jobId and file snapshot", async () => {
      mockJobRepository.findById.mockResolvedValue({
        _id: new Types.ObjectId("507f191e810c19729de860ea"),
        sourceType: JobSourceType.PLATFORM,
        title: "Senior Backend Developer",
        companyName: "Acme Corp",
      } as any);

      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: new Types.ObjectId("507f191e810c19729de860eb"),
        userId: "usr_candidate_1",
        title: "Master Resume",
        fileName: "resume.pdf",
        storageKey: "resumes/usr_candidate_1/uuid.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
        version: 1,
      } as any);

      mockAppRepository.findByUserAndJob.mockResolvedValue(null);
      mockAppRepository.create.mockImplementation((doc: any) => Promise.resolve({ ...doc, _id: "app_legacy_1" }));

      const result = await applicationService.applyToJob("usr_candidate_1", {
        jobId: "507f191e810c19729de860ea",
        resumeId: "507f191e810c19729de860eb",
      });

      expect(mockAppRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "usr_candidate_1",
          source: ApplicationSource.PLATFORM,
          jobId: expect.any(Object),
          resumeId: expect.any(Object),
          status: ApplicationStatus.APPLIED,
          resumeSnapshot: expect.objectContaining({
            fileName: "resume.pdf",
            storageKey: "resumes/usr_candidate_1/uuid.pdf",
          }),
        })
      );
      expect((result as any).status).toBe(ApplicationStatus.APPLIED);
    });
  });

  // ==========================================
  // 2. PHASE 6F JOB PROFILE APPLICATION
  // ==========================================
  describe("Phase 6F applyToJobProfile", () => {
    const jobProfileId = new Types.ObjectId("607f191e810c19729de860ea");
    const resumeId = new Types.ObjectId("607f191e810c19729de860eb");

    it("should successfully create a DRAFT application with immutable resume snapshot and SHA-256 hash", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        title: "Frontend Engineer Tailored",
        variantType: "TAILORED",
        targetJobId: jobProfileId,
        targetJobTitle: "Frontend Engineer",
        targetCompany: "Google",
        resumeDocument: validResumeDocument,
        builderConfig: validBuilderConfig,
        sourceProfileVersion: 2,
        sourceTailoringPlanId: new Types.ObjectId("607f191e810c19729de860ec"),
        sourceTailoringPlanVersion: 1,
        updatedAt: new Date("2026-09-28T10:00:00Z"),
      } as any);

      mockJobProfileRepository.findByIdAndUserId.mockResolvedValue({
        _id: jobProfileId,
        userId: "usr_candidate_1",
        jobTitle: "Frontend Engineer",
        company: "Google",
        jobUrl: "https://careers.google.com/jobs/123",
        analysis: { location: "Mountain View, CA", seniority: "SENIOR" },
      } as any);

      mockAppRepository.findActiveByUserIdAndJobProfileId.mockResolvedValue(null);
      mockAppRepository.create.mockImplementation((doc: any) => Promise.resolve({ ...doc, _id: "app_6f_1" }));

      const result = await applicationService.applyToJobProfile("usr_candidate_1", {
        jobProfileId: jobProfileId.toString(),
        resumeId: resumeId.toString(),
        status: ApplicationStatus.DRAFT,
      });

      expect(mockAppRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "usr_candidate_1",
          source: ApplicationSource.JOB_INTELLIGENCE,
          jobProfileId: jobProfileId,
          status: ApplicationStatus.DRAFT,
          appliedAt: null,
          jobIdentitySnapshot: expect.objectContaining({
            companyName: "Google",
            jobTitle: "Frontend Engineer",
            jobUrl: "https://careers.google.com/jobs/123",
            location: "Mountain View, CA",
          }),
          resumeSnapshot: expect.objectContaining({
            variantType: "TAILORED",
            resumeDocument: validResumeDocument,
            builderConfig: validBuilderConfig,
            snapshotHash: expect.stringMatching(/^[a-f0-9]{64}$/),
            provenance: expect.objectContaining({
              sourceProfileVersion: 2,
              sourceTailoringPlanVersion: 1,
            }),
          }),
          statusHistory: [
            expect.objectContaining({
              type: "CREATED",
              status: ApplicationStatus.DRAFT,
              fromStatus: null,
              toStatus: ApplicationStatus.DRAFT,
            }),
          ],
        })
      );
      expect((result as any).status).toBe(ApplicationStatus.DRAFT);
    });

    it("should stamp appliedAt when created with status APPLIED", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        variantType: "TAILORED",
        targetJobId: jobProfileId,
        resumeDocument: validResumeDocument,
        builderConfig: validBuilderConfig,
      } as any);

      mockJobProfileRepository.findByIdAndUserId.mockResolvedValue({
        _id: jobProfileId,
        userId: "usr_candidate_1",
        jobTitle: "Frontend Engineer",
        company: "Google",
      } as any);

      mockAppRepository.findActiveByUserIdAndJobProfileId.mockResolvedValue(null);
      mockAppRepository.create.mockImplementation((doc: any) => Promise.resolve({ ...doc, _id: "app_6f_2" }));

      await applicationService.applyToJobProfile("usr_candidate_1", {
        jobProfileId: jobProfileId.toString(),
        resumeId: resumeId.toString(),
        status: ApplicationStatus.APPLIED,
      });

      expect(mockAppRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ApplicationStatus.APPLIED,
          appliedAt: expect.any(Date),
          statusHistory: [
            expect.objectContaining({
              type: "CREATED",
              status: ApplicationStatus.APPLIED,
            }),
          ],
        })
      );
    });

    it("should reject MASTER resume with APPLICATION_INVALID_RESUME_VARIANT", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        variantType: "MASTER",
        resumeDocument: validResumeDocument,
        builderConfig: validBuilderConfig,
      } as any);

      await expect(
        applicationService.applyToJobProfile("usr_candidate_1", {
          jobProfileId: jobProfileId.toString(),
          resumeId: resumeId.toString(),
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_INVALID_RESUME_VARIANT,
        })
      );
    });

    it("should reject mismatched targetJobId with APPLICATION_TARGET_MISMATCH", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        variantType: "TAILORED",
        targetJobId: new Types.ObjectId("707f191e810c19729de860ff"),
        resumeDocument: validResumeDocument,
        builderConfig: validBuilderConfig,
      } as any);

      mockJobProfileRepository.findByIdAndUserId.mockResolvedValue({
        _id: jobProfileId,
        userId: "usr_candidate_1",
      } as any);

      await expect(
        applicationService.applyToJobProfile("usr_candidate_1", {
          jobProfileId: jobProfileId.toString(),
          resumeId: resumeId.toString(),
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_TARGET_MISMATCH,
        })
      );
    });

    it("should reject incomplete resume document with APPLICATION_RESUME_INCOMPLETE", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        variantType: "TAILORED",
        resumeDocument: null,
        builderConfig: null,
      } as any);

      await expect(
        applicationService.applyToJobProfile("usr_candidate_1", {
          jobProfileId: jobProfileId.toString(),
          resumeId: resumeId.toString(),
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_RESUME_INCOMPLETE,
        })
      );
    });

    it("should throw APPLICATION_ALREADY_EXISTS when an active application exists (>10s old)", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        variantType: "TAILORED",
        targetJobId: jobProfileId,
        resumeDocument: validResumeDocument,
        builderConfig: validBuilderConfig,
      } as any);

      mockJobProfileRepository.findByIdAndUserId.mockResolvedValue({
        _id: jobProfileId,
        userId: "usr_candidate_1",
      } as any);

      mockAppRepository.findActiveByUserIdAndJobProfileId.mockResolvedValue({
        _id: "existing_active_app",
        createdAt: new Date(Date.now() - 30000),
      } as any);

      await expect(
        applicationService.applyToJobProfile("usr_candidate_1", {
          jobProfileId: jobProfileId.toString(),
          resumeId: resumeId.toString(),
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_ALREADY_EXISTS,
        })
      );
    });

    it("should debounce rapid double-clicks (<10s) and safely return existing application without error", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        _id: resumeId,
        userId: "usr_candidate_1",
        variantType: "TAILORED",
        targetJobId: jobProfileId,
        resumeDocument: validResumeDocument,
        builderConfig: validBuilderConfig,
      } as any);

      mockJobProfileRepository.findByIdAndUserId.mockResolvedValue({
        _id: jobProfileId,
        userId: "usr_candidate_1",
      } as any);

      const existingRecord = {
        _id: "existing_debounce_app",
        createdAt: new Date(Date.now() - 2000),
      };
      mockAppRepository.findActiveByUserIdAndJobProfileId.mockResolvedValue(existingRecord as any);

      const result = await applicationService.applyToJobProfile("usr_candidate_1", {
        jobProfileId: jobProfileId.toString(),
        resumeId: resumeId.toString(),
      });

      expect(result).toBe(existingRecord);
      expect(mockAppRepository.create).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // 3. STATUS TRANSITION STATE MACHINE
  // ==========================================
  describe("updateApplicationStatus", () => {
    it("should transition from DRAFT to APPLIED and permanently lock appliedAt", async () => {
      const mockAppDoc: any = {
        _id: "app_trans_1",
        userId: "usr_candidate_1",
        status: ApplicationStatus.DRAFT,
        appliedAt: null,
        statusHistory: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockAppRepository.findOne.mockResolvedValue(mockAppDoc);
      mockAppRepository.findByIdAndUserId.mockResolvedValue({
        ...mockAppDoc,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
      });

      await applicationService.updateApplicationStatus("usr_candidate_1", "app_trans_1", {
        status: ApplicationStatus.APPLIED,
      });

      expect(mockAppDoc.status).toBe(ApplicationStatus.APPLIED);
      expect(mockAppDoc.appliedAt).toBeInstanceOf(Date);
      expect(mockAppDoc.statusHistory).toHaveLength(1);
      expect(mockAppDoc.statusHistory[0]).toEqual(
        expect.objectContaining({
          type: "APPLIED",
          status: ApplicationStatus.APPLIED,
          fromStatus: ApplicationStatus.DRAFT,
          toStatus: ApplicationStatus.APPLIED,
        })
      );
      expect(mockAppDoc.save).toHaveBeenCalled();
    });

    it("should reject invalid status transition (DRAFT -> OFFERED) with APPLICATION_INVALID_STATUS_TRANSITION", async () => {
      const mockAppDoc: any = {
        _id: "app_trans_2",
        userId: "usr_candidate_1",
        status: ApplicationStatus.DRAFT,
      };

      mockAppRepository.findOne.mockResolvedValue(mockAppDoc);

      await expect(
        applicationService.updateApplicationStatus("usr_candidate_1", "app_trans_2", {
          status: ApplicationStatus.OFFERED,
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION,
        })
      );
    });

    it("should reject no-op status transition (APPLIED -> APPLIED) with APPLICATION_INVALID_STATUS_TRANSITION", async () => {
      const mockAppDoc: any = {
        _id: "app_trans_3",
        userId: "usr_candidate_1",
        status: ApplicationStatus.APPLIED,
      };

      mockAppRepository.findOne.mockResolvedValue(mockAppDoc);

      await expect(
        applicationService.updateApplicationStatus("usr_candidate_1", "app_trans_3", {
          status: ApplicationStatus.APPLIED,
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION,
        })
      );
    });
  });

  // ==========================================
  // 4. TIMELINE NOTES & ISOLATION
  // ==========================================
  describe("addTimelineNote", () => {
    it("should append a NOTE_ADDED event without changing application status", async () => {
      const mockAppDoc: any = {
        _id: "app_note_1",
        userId: "usr_candidate_1",
        status: ApplicationStatus.INTERVIEW,
        statusHistory: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockAppRepository.findOne.mockResolvedValue(mockAppDoc);
      mockAppRepository.findByIdAndUserId.mockResolvedValue(mockAppDoc);

      await applicationService.addTimelineNote("usr_candidate_1", "app_note_1", {
        note: "Recruiter asked for availability on Thursday at 2 PM.",
      });

      expect(mockAppDoc.status).toBe(ApplicationStatus.INTERVIEW);
      expect(mockAppDoc.statusHistory).toHaveLength(1);
      expect(mockAppDoc.statusHistory[0]).toEqual(
        expect.objectContaining({
          type: "NOTE_ADDED",
          status: ApplicationStatus.INTERVIEW,
          fromStatus: null,
          toStatus: null,
          note: "Recruiter asked for availability on Thursday at 2 PM.",
        })
      );
    });
  });

  // ==========================================
  // 5. DELETE SAFETY
  // ==========================================
  describe("deleteApplication", () => {
    it("should delete application record with ownership check and never mutate resume or job profile", async () => {
      mockAppRepository.findOne.mockResolvedValue({
        _id: "app_del_1",
        userId: "usr_candidate_1",
      });
      mockAppRepository.deleteByIdAndUserId.mockResolvedValue(true);

      const result = await applicationService.deleteApplication("usr_candidate_1", "app_del_1");

      expect(result).toEqual({ success: true, id: "app_del_1" });
      expect(mockAppRepository.deleteByIdAndUserId).toHaveBeenCalledWith("app_del_1", "usr_candidate_1");
      expect(mockResumeRepository.findUserResumeById).not.toHaveBeenCalled();
    });
  });
});
