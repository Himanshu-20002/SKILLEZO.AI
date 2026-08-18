import { Request, Response } from "express";
import { ApplicationService } from "./application.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class ApplicationController {
  private readonly applicationService: ApplicationService;

  constructor(applicationService?: ApplicationService) {
    this.applicationService = applicationService || new ApplicationService();
  }

  applyToJob = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.applicationService.applyToJob(userId, req.body);
    const statusCode = (result as any).type === "external_application" ? HTTP_STATUS.OK : HTTP_STATUS.CREATED;
    res.status(statusCode).json(successResponse(result));
  };

  getMyApplications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const status = req.query.status as string | undefined;

    const result = await this.applicationService.getMyApplications(userId, page, limit, status);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getMyApplication = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.applicationService.getMyApplication(userId, applicationId);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getApplicationStatusHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const history = await this.applicationService.getApplicationStatusHistory(userId, applicationId);
    res.status(HTTP_STATUS.OK).json(successResponse(history));
  };

  withdrawApplication = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.applicationService.withdrawApplication(userId, applicationId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };
}
