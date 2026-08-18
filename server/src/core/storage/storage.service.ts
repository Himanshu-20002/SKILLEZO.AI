import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export interface IResumeStorageService {
  save(file: Express.Multer.File, storageKey: string): Promise<string>;
  getStream(storageKey: string): Promise<Readable>;
  delete(storageKey: string): Promise<boolean>;
  exists(storageKey: string): Promise<boolean>;
  getAbsolutePath(storageKey: string): string;
}

export class LocalResumeStorageService implements IResumeStorageService {
  private readonly baseStorageDir: string;

  constructor(baseDir?: string) {
    this.baseStorageDir = baseDir || path.join(process.cwd(), "storage", "resumes");
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
    }
  }

  getAbsolutePath(storageKey: string): string {
    // Prevent path traversal
    const normalizedKey = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, "");
    return path.join(this.baseStorageDir, normalizedKey);
  }

  async save(file: Express.Multer.File, storageKey: string): Promise<string> {
    const targetPath = this.getAbsolutePath(storageKey);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // If Multer stored it temporarily on disk, move/rename it to private storage
    if (file.path && fs.existsSync(file.path)) {
      fs.renameSync(file.path, targetPath);
    } else if (file.buffer) {
      fs.writeFileSync(targetPath, file.buffer);
    } else {
      throw new AppError(
        "Invalid file payload for storage",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.RESUME_STORAGE_ERROR
      );
    }

    return storageKey;
  }

  async getStream(storageKey: string): Promise<Readable> {
    const filePath = this.getAbsolutePath(storageKey);
    if (!fs.existsSync(filePath)) {
      throw new AppError(
        "Resume file not found on storage",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESUME_FILE_NOT_FOUND
      );
    }
    return fs.createReadStream(filePath);
  }

  async delete(storageKey: string): Promise<boolean> {
    const filePath = this.getAbsolutePath(storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  async exists(storageKey: string): Promise<boolean> {
    const filePath = this.getAbsolutePath(storageKey);
    return fs.existsSync(filePath);
  }
}

export const resumeStorageService = new LocalResumeStorageService();
