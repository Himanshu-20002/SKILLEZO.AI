import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeService } from "@/modules/resume/resume.service";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IResumeStorageService } from "@/core/storage/storage.service";
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

    it("should parse PDF buffer and persist extractedData with PARSED status", async () => {
      const mockParser: any = {
        extractRawTextFromBuffer: vi.fn().mockResolvedValue("Himanshu test@example.com React developer"),
        parseResumeBuffer: vi.fn().mockResolvedValue({
          personalInfo: { fullName: "Himanshu", email: "test@example.com" },
          skills: [{ name: "React", category: "Frontend" }],
          education: [],
          experience: [],
        }),
      };

      const customService = new ResumeService(mockRepository, mockStorage, mockParser);

      mockRepository.countUserResumes.mockResolvedValue(1);
      mockRepository.findByUserId.mockResolvedValue([{ _id: "res_old" }]);
      mockStorage.save.mockResolvedValue("resumes/usr_123/uuid.pdf");
      mockRepository.create.mockImplementation((dto: any) => Promise.resolve({ _id: "res_2", ...dto }));

      const fakeFile = {
        originalname: "resume.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("fake pdf content"),
        size: 2048,
      } as any;

      const result = await customService.uploadResume("usr_123", fakeFile);

      expect(mockParser.parseResumeBuffer).toHaveBeenCalledWith(fakeFile.buffer);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "parsed",
          extractedData: expect.objectContaining({
            personalInfo: { fullName: "Himanshu", email: "test@example.com" },
          }),
        })
      );
      expect(result.status).toBe("parsed");
    });

    it("should gracefully handle parser errors without failing the upload", async () => {
      const mockParser: any = {
        extractRawTextFromBuffer: vi.fn().mockRejectedValue(new Error("Corrupted PDF")),
        parseResumeBuffer: vi.fn().mockRejectedValue(new Error("Corrupted PDF")),
      };

      const customService = new ResumeService(mockRepository, mockStorage, mockParser);

      mockRepository.countUserResumes.mockResolvedValue(1);
      mockRepository.findByUserId.mockResolvedValue([{ _id: "res_old" }]);
      mockStorage.save.mockResolvedValue("resumes/usr_123/uuid.pdf");
      mockRepository.create.mockImplementation((dto: any) => Promise.resolve({ _id: "res_3", ...dto }));

      const fakeFile = {
        originalname: "corrupt.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("corrupt data"),
        size: 1024,
      } as any;

      const result = await customService.uploadResume("usr_123", fakeFile);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "uploaded",
          parsingError: "Corrupted PDF",
        })
      );
      expect(result.status).toBe("uploaded");
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
