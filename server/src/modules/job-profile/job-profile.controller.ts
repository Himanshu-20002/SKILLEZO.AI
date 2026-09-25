import { Request, Response } from "express";
import { jobProfileService, JobProfileService } from "./job-profile.service";
import { JobIntakeInputSchema, toJobProfileDTO } from "./job-profile.types";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class JobProfileController {
  constructor(private readonly service: JobProfileService = jobProfileService) {}

  /**
   * POST /api/job-profiles/analyze
   * Ingest a job description and perform grounded AI analysis.
   */
  createAndAnalyze = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const validatedInput = JobIntakeInputSchema.parse(req.body);

    const { profile, isExisting } = await this.service.createAndAnalyze(
      userId,
      validatedInput
    );

    res
      .status(isExisting ? HTTP_STATUS.OK : HTTP_STATUS.CREATED)
      .json(successResponse(toJobProfileDTO(profile)));
  };

  /**
   * POST /api/job-profiles/:id/analyze
   * Retry or re-analyze an existing job profile.
   */
  reanalyze = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profileId = req.params.id as string;

    const profile = await this.service.reanalyze(userId, profileId);
    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(toJobProfileDTO(profile)));
  };

  /**
   * GET /api/job-profiles/:id
   * Retrieve a single job profile by ID.
   */
  getJobProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profileId = req.params.id as string;

    const profile = await this.service.getJobProfile(userId, profileId);
    res.status(HTTP_STATUS.OK).json(successResponse(toJobProfileDTO(profile)));
  };

  /**
   * GET /api/job-profiles
   * List all job profiles owned by the authenticated user.
   */
  listJobProfiles = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    const profiles = await this.service.listJobProfiles(userId, limit, skip);
    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(profiles.map(toJobProfileDTO)));
  };
}

export const jobProfileController = new JobProfileController();
