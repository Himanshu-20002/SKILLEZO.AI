import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IResume } from "@/database/models/Resume.model";
import { UpdateResumeDTO } from "./resume.dto";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { ResumeStatus } from "@/core/constants/enums";
import { IResumeStorageService, resumeStorageService } from "@/core/storage/storage.service";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

const MAX_RESUMES_PER_USER = parseInt(process.env.MAX_RESUMES_PER_USER || "10", 10);

export class ResumeService {
  private readonly resumeRepository: ResumeRepository;
  private readonly storageService: IResumeStorageService;

  constructor(resumeRepository?: ResumeRepository, storageService?: IResumeStorageService) {
    this.resumeRepository = resumeRepository || new ResumeRepository();
    this.storageService = storageService || resumeStorageService;
  }

  async uploadResume(
    userId: string,
    file: Express.Multer.File,
    titleRequested?: string,
    isDefaultRequested = false
  ): Promise<IResume> {
    if (!file) {
      throw new AppError("No file uploaded", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    // Check user resume count limit
    const currentCount = await this.resumeRepository.countUserResumes(userId);
    if (currentCount >= MAX_RESUMES_PER_USER) {
      // Clean up multer temp file if written
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      throw new AppError(
        `Resume limit reached. Maximum ${MAX_RESUMES_PER_USER} resumes allowed per candidate.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.RESUME_LIMIT_EXCEEDED
      );
    }

    const existingResumes = await this.resumeRepository.findByUserId(userId);
    const isFirstResume = existingResumes.length === 0;
    const makeDefault = isFirstResume || isDefaultRequested;

    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const storageKey = `resumes/${userId}/${uniqueId}${ext}`;
    const title = titleRequested || file.originalname;

    let savedStorageKey: string;
    try {
      savedStorageKey = await this.storageService.save(file, storageKey);
    } catch (err: any) {
      throw new AppError(
        "Failed to save resume file to storage",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.RESUME_STORAGE_ERROR
      );
    }

    try {
      if (makeDefault) {
        await this.resumeRepository.clearDefaultFlag(userId);
      }

      const fileUrl = `/api/resumes/download-ref/${path.basename(storageKey)}`;

      const newResume = await this.resumeRepository.create({
        userId,
        title,
        originalFileName: file.originalname,
        fileName: path.basename(storageKey),
        storageKey: savedStorageKey,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        isDefault: makeDefault,
        status: ResumeStatus.UPLOADED,
        version: 1,
        uploadedAt: new Date(),
      } as any);

      return newResume;
    } catch (dbErr: any) {
      // Clean up orphan file if DB creation fails
      await this.storageService.delete(savedStorageKey);
      throw new AppError(
        "Failed to record resume in database",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.RESUME_UPLOAD_FAILED
      );
    }
  }

  async getUserResumes(userId: string): Promise<IResume[]> {
    return await this.resumeRepository.findByUserId(userId);
  }

  async getResumeById(userId: string, resumeId: string): Promise<IResume> {
    const resume = await this.resumeRepository.findUserResumeById(userId, resumeId);
    if (!resume) {
      throw new AppError(
        "Resume not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESUME_NOT_FOUND
      );
    }
    return resume;
  }

  async getResumeStream(userId: string, resumeId: string): Promise<{ stream: Readable; fileName: string; mimeType: string; fileSize: number }> {
    const resume = await this.getResumeById(userId, resumeId);
    const exists = await this.storageService.exists(resume.storageKey);

    if (!exists) {
      throw new AppError(
        "Resume file not found on storage",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESUME_FILE_NOT_FOUND
      );
    }

    const stream = await this.storageService.getStream(resume.storageKey);
    return {
      stream,
      fileName: resume.originalFileName || resume.fileName,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
    };
  }

  async setDefaultResume(userId: string, resumeId: string): Promise<IResume> {
    const resume = await this.getResumeById(userId, resumeId);
    const updated = await this.resumeRepository.setDefaultResume(userId, resume._id.toString());
    if (!updated) {
      throw new AppError(
        "Failed to set default resume",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.DEFAULT_RESUME_ERROR
      );
    }
    return updated;
  }

  async updateResume(userId: string, resumeId: string, updateDTO: UpdateResumeDTO): Promise<IResume> {
    const resume = await this.getResumeById(userId, resumeId);

    if (updateDTO.isDefault) {
      await this.resumeRepository.clearDefaultFlag(userId);
    }

    const updatePayload: Partial<IResume> = {};
    if (updateDTO.title !== undefined) updatePayload.title = updateDTO.title;
    if (updateDTO.isDefault !== undefined) updatePayload.isDefault = updateDTO.isDefault;

    const updated = await this.resumeRepository.updateById(resume._id.toString(), updatePayload);
    if (!updated) {
      throw new AppError(
        "Failed to update resume",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INVALID_RESUME_METADATA
      );
    }
    return updated;
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const resume = await this.getResumeById(userId, resumeId);

    await this.storageService.delete(resume.storageKey);
    await this.resumeRepository.deleteUserResume(userId, resume._id.toString());

    // If deleted resume was default, set newest remaining resume as default
    if (resume.isDefault) {
      const remaining = await this.resumeRepository.findByUserId(userId);
      if (remaining.length > 0) {
        await this.resumeRepository.setDefaultResume(userId, remaining[0]._id.toString());
      }
    }
  }
}
