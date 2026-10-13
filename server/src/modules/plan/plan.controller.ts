import { Request, Response } from "express";
import { PlanService, planService } from "./plan.service";
import { GetUsageQuerySchema, CheckQuotaSchema } from "./plan.dto";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class PlanController {
  constructor(private readonly service: PlanService = planService) {}

  getPlanStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.service.getPlanStatus(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  getUsageHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = GetUsageQuerySchema.parse(req.query);
    const result = await this.service.getUsageHistory(userId, query.page, query.limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  getPricing = async (_req: Request, res: Response): Promise<void> => {
    const result = this.service.getPricingPlans();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  checkQuota = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { feature, customCost } = CheckQuotaSchema.parse(req.body);
    const result = await this.service.checkTokenQuota(userId, feature, customCost);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };
}

export const planController = new PlanController();
