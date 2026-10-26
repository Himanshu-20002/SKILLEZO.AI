import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

/**
 * In-Memory Multer Storage for Technical PDFs & Cheat-Sheets (15MB Limit, Zero Disk I/O)
 */
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ["application/pdf"];
  const allowedExtensions = [".pdf"];

  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
    return cb(
      new AppError(
        "Invalid file format. Only PDF cheat-sheets and question banks are supported.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.BAD_REQUEST
      ) as any
    );
  }

  cb(null, true);
};

export const pdfUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit for technical PDF documents
  },
});
