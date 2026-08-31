import { Request, Response } from "express";
import { JobsService } from "./jobs.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class JobsController {
  private readonly jobsService: JobsService;

  constructor(jobsService?: JobsService) {
    this.jobsService = jobsService || new JobsService();
  }

  searchJobs = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.jobsService.searchJobs(req.query);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err) {
      console.error("[JobsController] searchJobs error:", err);
      throw err;
    }
  };

  getJobById = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobId = req.params.jobId as string;
      const job = await this.jobsService.getJobById(jobId);
      res.status(HTTP_STATUS.OK).json(successResponse(job));
    } catch (err) {
      console.error("[JobsController] getJobById error:", err);
      throw err;
    }
  };

  redirectToSource = async (req: Request, res: Response): Promise<void> => {
    const jobId = req.params.jobId as string;
    const url = await this.jobsService.getJobRedirectUrl(jobId);
    res.redirect(HTTP_STATUS.FOUND, url);
  };
}
