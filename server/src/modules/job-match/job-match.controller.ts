import { Request, Response } from "express";
import { jobMatchService, JobMatchService } from "./job-match.service";
import { toJobMatchResultDTO } from "./job-match.types";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants";

export class JobMatchController {
  constructor(private readonly service: JobMatchService = jobMatchService) {}

  /**
   * POST /api/job-profiles/:id/match
   * Trigger Career ↔ Job Evidence Match.
   */
  runMatch = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;

    const { matchResult, isStale } = await this.service.matchJobToCareerProfile(
      userId,
      jobProfileId
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(toJobMatchResultDTO(matchResult, isStale)));
  };

  /**
   * GET /api/job-profiles/:id/match
   * Retrieve existing match result with staleness flag.
   */
  getMatch = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;

    const { matchResult, isStale } = await this.service.getMatchResult(
      userId,
      jobProfileId
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(toJobMatchResultDTO(matchResult, isStale)));
  };
}

export const jobMatchController = new JobMatchController();
