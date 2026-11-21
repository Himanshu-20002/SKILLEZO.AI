import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DEFAULT_MONETIZATION_CONFIG,
  getMonetizationConfig,
  invalidateMonetizationCache,
} from "@/database/models/MonetizationConfig.model";
import { updateMonetizationConfigSchema } from "@/modules/admin/validation/monetization.schemas";

describe("MonetizationConfig Model & Validation", () => {
  beforeEach(() => {
    invalidateMonetizationCache();
  });

  it("should have correct strategic defaults (₹199 Sprint Pass, ₹499 Pro, 1 free interview)", () => {
    expect(DEFAULT_MONETIZATION_CONFIG.pricing.sprintPass7Day.amountInRupees).toBe(199);
    expect(DEFAULT_MONETIZATION_CONFIG.pricing.sprintPass7Day.amountInPaise).toBe(19900);
    expect(DEFAULT_MONETIZATION_CONFIG.pricing.proMonthly.amountInRupees).toBe(499);
    expect(DEFAULT_MONETIZATION_CONFIG.pricing.proMonthly.amountInPaise).toBe(49900);
    expect(DEFAULT_MONETIZATION_CONFIG.pricing.proYearly.amountInRupees).toBe(3999);
    expect(DEFAULT_MONETIZATION_CONFIG.pricing.proYearly.amountInPaise).toBe(399900);

    expect(DEFAULT_MONETIZATION_CONFIG.interviewQuotas.freeMonthlySessions).toBe(1);
    expect(DEFAULT_MONETIZATION_CONFIG.interviewQuotas.freeMaxQuestionsPerSession).toBe(5);
    expect(DEFAULT_MONETIZATION_CONFIG.interviewQuotas.lockModelAnswersForFree).toBe(true);
    expect(DEFAULT_MONETIZATION_CONFIG.interviewQuotas.enableVoiceForFree).toBe(true);
    expect(DEFAULT_MONETIZATION_CONFIG.interviewQuotas.enableVideoForFree).toBe(true);

    expect(DEFAULT_MONETIZATION_CONFIG.resumeQuotas.freeMaxResumes).toBe(1);
    expect(DEFAULT_MONETIZATION_CONFIG.resumeQuotas.freeMonthlyAtsScans).toBe(1);
    expect(DEFAULT_MONETIZATION_CONFIG.resumeQuotas.lockMultiJobTailoringForFree).toBe(true);
  });

  it("should validate valid update payload via Zod schema", () => {
    const validPayload = {
      pricing: {
        sprintPass7Day: { amountInRupees: 249, isActive: true },
        proMonthly: { amountInRupees: 599, isActive: true },
      },
      interviewQuotas: {
        freeMonthlySessions: 2,
        freeMaxQuestionsPerSession: 6,
        freeMaxAnswerSeconds: 180,
        lockModelAnswersForFree: true,
        enableVoiceForFree: true,
        enableVideoForFree: true,
      },
      globalSettings: {
        promoBannerActive: true,
        promoBannerText: "Flash Sale: 50% off!",
      },
    };

    const parsed = updateMonetizationConfigSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it("should reject negative prices or invalid question counts", () => {
    const invalidPayload = {
      pricing: {
        sprintPass7Day: { amountInRupees: -50, isActive: true },
      },
    };

    const parsed = updateMonetizationConfigSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it("should reject excessively high questions per session (> 20)", () => {
    const invalidPayload = {
      interviewQuotas: {
        freeMaxQuestionsPerSession: 99,
      },
    };

    const parsed = updateMonetizationConfigSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });
});
