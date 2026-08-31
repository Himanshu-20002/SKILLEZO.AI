import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeService } from "../resume.service";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IResumeStorageService } from "@/core/storage/storage.service";
import { Readable } from "stream";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";

describe("ResumeService Unit Tests", () => {
  let resumeService: ResumeService;
  let mockRepository: any;
  let mockStorage: any;

  beforeEach(() => {
    mockRepository = {
      findByUserId: vi.fn(),
      findUserResumeById: vi.fn(),
      findDefaultByUserId: vi.fn(),
      clearDefaultFlag: vi.fn(),
      setDefaultResume: vi.fn(),
      countUserResumes: vi.fn(),
      deleteUserResume: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
    };

    mockStorage = {
      save: vi.fn(),
      getStream: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      getAbsolutePath: vi.fn(),
    };

    resumeService = new ResumeService(mockRepository, mockStorage);
  });

  describe("uploadResume", () => {
    it("should throw RESUME_LIMIT_EXCEEDED when max limit is reached", async () => {
      mockRepository.countUserResumes.mockResolvedValue(10);

      const fakeFile = {
        originalname: "test.pdf",
        mimetype: "application/pdf",
        size: 1024,
      } as any;

      await expect(
        resumeService.uploadResume("usr_123", fakeFile)
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.RESUME_LIMIT_EXCEEDED,
        })
      );
    });

    it("should mark first uploaded resume as default automatically", async () => {
      mockRepository.countUserResumes.mockResolvedValue(0);
      mockRepository.findByUserId.mockResolvedValue([]);
      mockStorage.save.mockResolvedValue("resumes/usr_123/uuid.pdf");
      mockRepository.create.mockResolvedValue({
        _id: "res_1",
        userId: "usr_123",
        isDefault: true,
      } as any);

      const fakeFile = {
        originalname: "test.pdf",
        mimetype: "application/pdf",
        size: 1024,
      } as any;

      const result = await resumeService.uploadResume("usr_123", fakeFile);
      expect(result.isDefault).toBe(true);
      expect(mockRepository.clearDefaultFlag).toHaveBeenCalledWith("usr_123");
    });
  });

  describe("getResumeStream", () => {
    it("should throw RESUME_FILE_NOT_FOUND if storage file is missing", async () => {
      mockRepository.findUserResumeById.mockResolvedValue({
        _id: "res_1",
        userId: "usr_123",
        storageKey: "resumes/usr_123/uuid.pdf",
      } as any);
      mockStorage.exists.mockResolvedValue(false);

      await expect(
        resumeService.getResumeStream("usr_123", "res_1")
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.RESUME_FILE_NOT_FOUND,
        })
      );
    });
  });
});
