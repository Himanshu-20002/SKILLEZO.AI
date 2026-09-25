import { Request, Response } from "express";
import { TailoredResumeService } from "./tailored-resume.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class TailoredResumeController {
  /**
   * POST /api/job-profiles/:id/tailoring-plan/generate
   * Materialize an independent TAILORED Resume variant from an approved TailoringPlan.
   */
  generateTailoredResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;
    const force = Boolean(req.body?.force);

    const result = await TailoredResumeService.generateTailoredResume(
      userId,
      jobProfileId,
      { force }
    );

    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  /**
   * GET /api/job-profiles/:id/tailored-resume
   * Retrieve lightweight, metadata-safe information for an existing tailored resume variant.
   */
  getTailoredResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;

    const tailoredResume = await TailoredResumeService.getTailoredResumeMetadata(
      userId,
      jobProfileId
    );

    res.status(HTTP_STATUS.OK).json(successResponse({ tailoredResume }));
  };
}

export const tailoredResumeController = new TailoredResumeController();
