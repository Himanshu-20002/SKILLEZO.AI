import { Request, Response } from "express";
import {
  MonetizationConfigModel,
  DEFAULT_MONETIZATION_CONFIG,
  getMonetizationConfig,
  invalidateMonetizationCache,
} from "@/database/models/MonetizationConfig.model";
import { updateMonetizationConfigSchema } from "../validation/monetization.schemas";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class AdminMonetizationController {
  /**
   * GET /api/admin/monetization-config
   * Fetch current system monetization config (Admin only)
   */
  public static async getConfig(_req: Request, res: Response): Promise<void> {
    const config = await getMonetizationConfig();
    res.status(HTTP_STATUS.OK).json(successResponse(config));
  }

  /**
   * PUT /api/admin/monetization-config
   * Dynamically update pricing, mock interview quotas, and paywall switches (Admin only)
   */
  public static async updateConfig(req: Request, res: Response): Promise<void> {
    const validatedInput = updateMonetizationConfigSchema.parse(req.body);

    // Fetch existing config first
    const existing = await getMonetizationConfig();
    const updateDoc: any = {};

    // 1. Process Pricing Updates (Rupees -> Paise synchronization)
    if (validatedInput.pricing) {
      updateDoc.pricing = { ...existing.pricing };

      if (validatedInput.pricing.sprintPass7Day) {
        const p = validatedInput.pricing.sprintPass7Day;
        updateDoc.pricing.sprintPass7Day = {
          ...existing.pricing.sprintPass7Day,
          ...p,
          amountInPaise:
            p.amountInRupees !== undefined
              ? Math.round(p.amountInRupees * 100)
              : existing.pricing.sprintPass7Day.amountInPaise,
        };
      }

      if (validatedInput.pricing.proMonthly) {
        const p = validatedInput.pricing.proMonthly;
        updateDoc.pricing.proMonthly = {
          ...existing.pricing.proMonthly,
          ...p,
          amountInPaise:
            p.amountInRupees !== undefined
              ? Math.round(p.amountInRupees * 100)
              : existing.pricing.proMonthly.amountInPaise,
        };
      }

      if (validatedInput.pricing.proYearly) {
        const p = validatedInput.pricing.proYearly;
        updateDoc.pricing.proYearly = {
          ...existing.pricing.proYearly,
          ...p,
          amountInPaise:
            p.amountInRupees !== undefined
              ? Math.round(p.amountInRupees * 100)
              : existing.pricing.proYearly.amountInPaise,
        };
      }
    }

    // 2. Process Interview Quotas
    if (validatedInput.interviewQuotas) {
      updateDoc.interviewQuotas = {
        ...existing.interviewQuotas,
        ...validatedInput.interviewQuotas,
      };
    }

    // 3. Process Resume Studio Quotas
    if (validatedInput.resumeQuotas) {
      updateDoc.resumeQuotas = {
        ...existing.resumeQuotas,
        ...validatedInput.resumeQuotas,
      };
    }

    // 4. Process Global Settings & Admin Auditing
    const adminEmail = (req as any).user?.email || "admin@skillezo.ai";
    updateDoc.globalSettings = {
      ...existing.globalSettings,
      ...(validatedInput.globalSettings || {}),
      updatedByAdminEmail: adminEmail,
    };

    const updated = await MonetizationConfigModel.findOneAndUpdate(
      { isSingleton: true },
      { $set: updateDoc },
      { new: true, upsert: true }
    );

    invalidateMonetizationCache();
    res.status(HTTP_STATUS.OK).json(successResponse(updated));
  }

  /**
   * POST /api/admin/monetization-config/reset
   * Restore platform default strategic pricing and quota model
   */
  public static async resetConfig(req: Request, res: Response): Promise<void> {
    const adminEmail = (req as any).user?.email || "admin@skillezo.ai";

    const resetDoc = {
      ...DEFAULT_MONETIZATION_CONFIG,
      isSingleton: true,
      globalSettings: {
        ...DEFAULT_MONETIZATION_CONFIG.globalSettings,
        updatedByAdminEmail: adminEmail,
      },
    };

    const updated = await MonetizationConfigModel.findOneAndUpdate(
      { isSingleton: true },
      { $set: resetDoc },
      { new: true, upsert: true }
    );

    invalidateMonetizationCache();
    res.status(HTTP_STATUS.OK).json(successResponse(updated));
  }

  /**
   * GET /api/monetization/public-config
   * Candidate-facing endpoint to read public quotas and plan rates
   */
  public static async getPublicConfig(_req: Request, res: Response): Promise<void> {
    const config = await getMonetizationConfig();
    const publicConfig = {
      pricing: {
        sprintPass7Day: {
          amountInRupees: config.pricing.sprintPass7Day.amountInRupees,
          name: config.pricing.sprintPass7Day.name,
          description: config.pricing.sprintPass7Day.description,
          isActive: config.pricing.sprintPass7Day.isActive,
        },
        proMonthly: {
          amountInRupees: config.pricing.proMonthly.amountInRupees,
          name: config.pricing.proMonthly.name,
          description: config.pricing.proMonthly.description,
          isActive: config.pricing.proMonthly.isActive,
        },
        proYearly: {
          amountInRupees: config.pricing.proYearly.amountInRupees,
          name: config.pricing.proYearly.name,
          description: config.pricing.proYearly.description,
          isActive: config.pricing.proYearly.isActive,
        },
      },
      interviewQuotas: {
        freeMonthlySessions: config.interviewQuotas.freeMonthlySessions,
        freeMaxQuestionsPerSession: config.interviewQuotas.freeMaxQuestionsPerSession,
        freeMaxAnswerSeconds: config.interviewQuotas.freeMaxAnswerSeconds,
        lockModelAnswersForFree: config.interviewQuotas.lockModelAnswersForFree,
        enableVoiceForFree: config.interviewQuotas.enableVoiceForFree,
        enableVideoForFree: config.interviewQuotas.enableVideoForFree,
      },
      resumeQuotas: {
        freeMaxResumes: config.resumeQuotas.freeMaxResumes,
        freeMonthlyAtsScans: config.resumeQuotas.freeMonthlyAtsScans,
        lockDocxExportForFree: config.resumeQuotas.lockDocxExportForFree,
        lockCoverLetterAiForFree: config.resumeQuotas.lockCoverLetterAiForFree,
        lockMultiJobTailoringForFree: config.resumeQuotas.lockMultiJobTailoringForFree,
      },
      globalSettings: {
        promoBannerActive: config.globalSettings.promoBannerActive,
        promoBannerText: config.globalSettings.promoBannerText,
      },
    };

    res.status(HTTP_STATUS.OK).json(successResponse(publicConfig));
  }
}
