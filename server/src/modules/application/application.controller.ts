import { Request, Response } from "express";
import { ApplicationService } from "./application.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class ApplicationController {
  private readonly applicationService: ApplicationService;

  constructor(applicationService?: ApplicationService) {
    this.applicationService = applicationService || new ApplicationService();
  }

  /**
   * Universal application creation endpoint.
   * If jobProfileId is present, creates Phase 6F tracked application with immutable snapshot.
   * If jobId is present, executes legacy recruiter/platform application.
   */
  createApplication = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    if (req.body.jobProfileId) {
      const result = await this.applicationService.applyToJobProfile(userId, req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(result));
      return;
    }

    const result = await this.applicationService.applyToJob(userId, req.body);
    const statusCode =
      (result as any).type === "external_application" ? HTTP_STATUS.OK : HTTP_STATUS.CREATED;
    res.status(statusCode).json(successResponse(result));
  };

  /**
   * Explicit endpoint for Phase 6F JobProfile applications.
   */
  applyToJobProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.applicationService.applyToJobProfile(userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(successResponse(result));
  };

  /**
   * LEGACY: apply to recruiter platform job
   */
  applyToJob = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.applicationService.applyToJob(userId, req.body);
    const statusCode =
      (result as any).type === "external_application" ? HTTP_STATUS.OK : HTTP_STATUS.CREATED;
    res.status(statusCode).json(successResponse(result));
  };

  getMyApplications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const status = req.query.status as string | undefined;
    const jobProfileId = req.query.jobProfileId as string | undefined;
    const source = req.query.source as string | undefined;
    const search = req.query.search as string | undefined;
    const metadataOnly = req.query.metadataOnly === "true";

    if (metadataOnly) {
      const result = await this.applicationService.getMyApplicationsList(userId, {
        page,
        limit,
        status,
        jobProfileId,
        source,
        search,
      });
      res.status(HTTP_STATUS.OK).json(successResponse(result));
      return;
    }

    const result = await this.applicationService.getMyApplications(userId, page, limit, status);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getMyApplication = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.applicationService.getMyApplication(userId, applicationId);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.applicationService.updateApplicationStatus(
      userId,
      applicationId,
      req.body
    );
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  addTimelineNote = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.applicationService.addTimelineNote(userId, applicationId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  deleteApplication = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const applicationId = req.params.applicationId as string;
    const result = await this.applicationService.deleteApplication(userId, applicationId);
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

  getAppliedJobIds = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobIds = await this.applicationService.getAppliedJobIds(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(jobIds));
  };
}
