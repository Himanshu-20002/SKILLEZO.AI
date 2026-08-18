import { Request, Response } from "express";
import { RecruiterApplicationService } from "./recruiter-application.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class RecruiterApplicationController {
  private readonly service: RecruiterApplicationService;

  constructor(service?: RecruiterApplicationService) {
    this.service = service || new RecruiterApplicationService();
  }

  getCompanyApplications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const jobId = req.query.jobId as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await this.service.getCompanyApplications(userId, { page, limit, jobId, status, search });
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getCompanyApplicationDetails = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.service.getCompanyApplicationDetails(userId, applicationId);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getApplicationStatusHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const history = await this.service.getApplicationStatusHistory(userId, applicationId);
    res.status(HTTP_STATUS.OK).json(successResponse(history));
  };

  streamApplicationResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const fileInfo = await this.service.streamApplicationResume(userId, applicationId);

    res.setHeader("Content-Type", fileInfo.mimeType);
    if (fileInfo.fileSize > 0) {
      res.setHeader("Content-Length", fileInfo.fileSize);
    }
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileInfo.fileName)}"`
    );

    fileInfo.stream.pipe(res);
  };

  updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.service.updateApplicationStatus(userId, applicationId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };
}
