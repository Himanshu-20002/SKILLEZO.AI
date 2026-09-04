import { Request, Response } from "express";
import { SkillGapService } from "./skill-gap.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class SkillGapController {
  getMySkillGap = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const targetRole = req.query.role as string | undefined;
    const result = await SkillGapService.getCandidateSkillGap(userId, targetRole);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getAvailableRoles = async (_req: Request, res: Response): Promise<void> => {
    const roles = SkillGapService.getAvailableRoles();
    res.status(HTTP_STATUS.OK).json(successResponse(roles));
  };
}
