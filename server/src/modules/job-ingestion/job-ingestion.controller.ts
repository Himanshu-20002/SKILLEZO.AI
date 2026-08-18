import { Request, Response } from "express";
import { JobIngestionService } from "./job-ingestion.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class JobIngestionController {
  private readonly jobIngestionService: JobIngestionService;

  constructor(jobIngestionService?: JobIngestionService) {
    this.jobIngestionService =
      jobIngestionService || new JobIngestionService();
  }

  ingestJobs = async (req: Request, res: Response): Promise<void> => {
    const summary = await this.jobIngestionService.ingestJobs(req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(summary));
  };
}
