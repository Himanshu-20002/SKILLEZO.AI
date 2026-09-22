import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

const uploadDir = path.join(process.cwd(), "uploads", "resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const userId = (req as any).user?.id || "anonymous";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resume-${userId}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const docxExtensions = [".doc", ".docx"];
  const docxMimeTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (docxExtensions.includes(ext) || docxMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError(
        "PDF resumes are currently supported. DOCX support will be added in a later phase.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_FILE_TYPE
      ) as any
    );
  }

  const allowedMimeTypes = ["application/pdf"];
  const allowedExtensions = [".pdf"];

  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
    return cb(
      new AppError(
        "Invalid file type. Only PDF documents are supported.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_FILE_TYPE
      ) as any
    );
  }

  cb(null, true);
};

export const resumeUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
