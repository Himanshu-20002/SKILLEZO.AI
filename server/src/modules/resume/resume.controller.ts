import { Request, Response } from "express";
import { ResumeService } from "./resume.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class ResumeController {
  private readonly resumeService: ResumeService;

  constructor(resumeService?: ResumeService) {
    this.resumeService = resumeService || new ResumeService();
  }

  uploadResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const file = req.file as Express.Multer.File;
    const title = req.body.title as string | undefined;
    const isDefault = req.body.isDefault === "true" || req.body.isDefault === true;
    const resume = await this.resumeService.uploadResume(userId, file, title, isDefault);
    res.status(HTTP_STATUS.CREATED).json(successResponse(resume));
  };

  getUserResumes = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const resumes = await this.resumeService.getUserResumes(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(resumes));
  };

  getResumeById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const resumeId = req.params.resumeId as string;
    const resume = await this.resumeService.getResumeById(userId, resumeId);
    res.status(HTTP_STATUS.OK).json(successResponse(resume));
  };

  downloadResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const resumeId = req.params.resumeId as string;
    const fileInfo = await this.resumeService.getResumeStream(userId, resumeId);

    res.setHeader("Content-Type", fileInfo.mimeType);
    res.setHeader("Content-Length", fileInfo.fileSize);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileInfo.fileName)}"`);
    
    fileInfo.stream.pipe(res);
  };

  setDefaultResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const resumeId = req.params.resumeId as string;
    const resume = await this.resumeService.setDefaultResume(userId, resumeId);
    res.status(HTTP_STATUS.OK).json(successResponse(resume));
  };

  updateResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const resumeId = req.params.resumeId as string;
    const resume = await this.resumeService.updateResume(userId, resumeId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(resume));
  };

  deleteResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const resumeId = req.params.resumeId as string;
    await this.resumeService.deleteResume(userId, resumeId);
    res.status(HTTP_STATUS.OK).json(successResponse({ message: "Resume deleted successfully" }));
  };
}
