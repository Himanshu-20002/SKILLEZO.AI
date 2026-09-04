import { Request, Response } from "express";
import { EmployabilityService } from "./employability.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class EmployabilityController {
  getEmployabilityIndex = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const targetRole = req.query.role as string | undefined;
    const result = await EmployabilityService.getCandidateEmployability(userId, targetRole);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };

  getCareerGps = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const targetRole = req.query.role as string | undefined;
    const result = await EmployabilityService.getCandidateCareerGps(userId, targetRole);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };
}
