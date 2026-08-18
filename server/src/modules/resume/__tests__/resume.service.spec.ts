import { ResumeService } from "../resume.service";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IResumeStorageService } from "@/core/storage/storage.service";
import { Readable } from "stream";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";

describe("ResumeService Unit Tests", () => {
  let resumeService: ResumeService;
  let mockRepository: jest.Mocked<ResumeRepository>;
  let mockStorage: jest.Mocked<IResumeStorageService>;

  beforeEach(() => {
    mockRepository = {
      findByUserId: jest.fn(),
      findUserResumeById: jest.fn(),
      findDefaultByUserId: jest.fn(),
      clearDefaultFlag: jest.fn(),
      setDefaultResume: jest.fn(),
      countUserResumes: jest.fn(),
      deleteUserResume: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
    } as any;

    mockStorage = {
      save: jest.fn(),
      getStream: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getAbsolutePath: jest.fn(),
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
