import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlanService } from "@/modules/plan/plan.service";
import { SubscriptionModel, PlanTier, SubscriptionStatus } from "@/database/models/Subscription.model";
import { TokenAccountModel } from "@/database/models/TokenAccount.model";
import { TokenUsageLogModel, TokenFeature } from "@/database/models/TokenUsageLog.model";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

vi.mock("@/database/models/Subscription.model", () => ({
  SubscriptionModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  PlanTier: {
    FREE: "FREE",
    PRO: "PRO",
    ENTERPRISE: "ENTERPRISE",
  },
  SubscriptionStatus: {
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
  },
}));

vi.mock("@/database/models/TokenAccount.model", () => ({
  TokenAccountModel: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/database/models/TokenUsageLog.model", () => ({
  TokenUsageLogModel: {
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
  TokenFeature: {
    WELCOME_BONUS: "WELCOME_BONUS",
    RESUME_ATS: "RESUME_ATS",
    TAILORED_RESUME: "TAILORED_RESUME",
    CAREER_COACH: "CAREER_COACH",
    MOCK_INTERVIEW: "MOCK_INTERVIEW",
    SKILL_GAP: "SKILL_GAP",
    PROMOTION_BONUS: "PROMOTION_BONUS",
  },
}));

describe("PlanService (Phase 1)", () => {
  let planService: PlanService;

  beforeEach(() => {
    vi.clearAllMocks();
    planService = new PlanService();
  });

  describe("getOrCreateAccount", () => {
    it("should provision Free Plan and 5,000 tokens for new candidate", async () => {
      (SubscriptionModel.findOne as any).mockResolvedValue(null);
      (SubscriptionModel.create as any).mockResolvedValue({
        userId: "user-1",
        tier: PlanTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date(),
      });

      (TokenAccountModel.findOne as any).mockResolvedValue(null);
      (TokenAccountModel.create as any).mockResolvedValue({
        userId: "user-1",
        tier: PlanTier.FREE,
        totalAllowance: 5000,
        consumedTokens: 0,
        remainingTokens: 5000,
        bonusTokens: 0,
      });

      const result = await planService.getOrCreateAccount("user-1");

      expect(SubscriptionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          tier: PlanTier.FREE,
          status: SubscriptionStatus.ACTIVE,
        })
      );
      expect(TokenAccountModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          tier: PlanTier.FREE,
          totalAllowance: 5000,
          remainingTokens: 5000,
        })
      );
      expect(TokenUsageLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          feature: TokenFeature.WELCOME_BONUS,
          balanceAfter: 5000,
        })
      );
      expect(result.subscription.tier).toBe(PlanTier.FREE);
      expect(result.tokenAccount.remainingTokens).toBe(5000);
    });

    it("should return existing subscription and token account without re-creating", async () => {
      const mockSub = { userId: "user-1", tier: PlanTier.FREE, status: SubscriptionStatus.ACTIVE };
      const mockAcc = { userId: "user-1", remainingTokens: 4200, totalAllowance: 5000 };

      (SubscriptionModel.findOne as any).mockResolvedValue(mockSub);
      (TokenAccountModel.findOne as any).mockResolvedValue(mockAcc);

      const result = await planService.getOrCreateAccount("user-1");

      expect(SubscriptionModel.create).not.toHaveBeenCalled();
      expect(TokenAccountModel.create).not.toHaveBeenCalled();
      expect(result.subscription).toEqual(mockSub);
      expect(result.tokenAccount).toEqual(mockAcc);
    });
  });

  describe("checkTokenQuota", () => {
    it("should allow action when remaining balance is greater than required tokens", async () => {
      (SubscriptionModel.findOne as any).mockResolvedValue({ tier: PlanTier.FREE });
      (TokenAccountModel.findOne as any).mockResolvedValue({ remainingTokens: 3000 });

      const result = await planService.checkTokenQuota("user-1", TokenFeature.RESUME_ATS);

      expect(result.allowed).toBe(true);
      expect(result.balance).toBe(3000);
      expect(result.required).toBe(300);
      expect(result.missing).toBe(0);
    });

    it("should deny action and indicate missing tokens when balance is insufficient", async () => {
      (SubscriptionModel.findOne as any).mockResolvedValue({ tier: PlanTier.FREE });
      (TokenAccountModel.findOne as any).mockResolvedValue({ remainingTokens: 100 });

      const result = await planService.checkTokenQuota("user-1", TokenFeature.MOCK_INTERVIEW); // Cost: 1500

      expect(result.allowed).toBe(false);
      expect(result.balance).toBe(100);
      expect(result.required).toBe(1500);
      expect(result.missing).toBe(1400);
      expect(result.upgradeUrl).toBe("/dashboard/plan");
    });
  });

  describe("deductTokens", () => {
    it("should atomically deduct tokens and record audit log", async () => {
      (SubscriptionModel.findOne as any).mockResolvedValue({ tier: PlanTier.FREE });
      (TokenAccountModel.findOne as any).mockResolvedValue({ remainingTokens: 5000 });
      (TokenAccountModel.findOneAndUpdate as any).mockResolvedValue({
        userId: "user-1",
        remainingTokens: 4300,
        consumedTokens: 700,
      });

      const result = await planService.deductTokens("user-1", TokenFeature.TAILORED_RESUME);

      expect(TokenAccountModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1", remainingTokens: { $gte: 700 } },
        { $inc: { consumedTokens: 700, remainingTokens: -700 } },
        { new: true }
      );
      expect(TokenUsageLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          feature: TokenFeature.TAILORED_RESUME,
          tokensDeducted: 700,
          balanceAfter: 4300,
        })
      );
      expect(result.success).toBe(true);
      expect(result.balanceAfter).toBe(4300);
      expect(result.tokensDeducted).toBe(700);
    });

    it("should throw 402 INSUFFICIENT_TOKENS when balance is below feature cost", async () => {
      (SubscriptionModel.findOne as any).mockResolvedValue({ tier: PlanTier.FREE });
      (TokenAccountModel.findOne as any).mockResolvedValue({ remainingTokens: 200 });
      (TokenAccountModel.findOneAndUpdate as any).mockResolvedValue(null);

      await expect(
        planService.deductTokens("user-1", TokenFeature.RESUME_ATS) // cost 300
      ).rejects.toMatchObject({
        statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
        code: ERROR_CODES.INSUFFICIENT_TOKENS,
      });
    });
  });

  describe("getPlanStatus", () => {
    it("should compute correct usage percentage and exhausted flag", async () => {
      (SubscriptionModel.findOne as any).mockResolvedValue({
        userId: "user-1",
        tier: PlanTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date("2026-10-01"),
      });
      (TokenAccountModel.findOne as any).mockResolvedValue({
        userId: "user-1",
        totalAllowance: 5000,
        consumedTokens: 2500,
        remainingTokens: 2500,
        bonusTokens: 0,
      });

      const status = await planService.getPlanStatus("user-1");

      expect(status.tier).toBe(PlanTier.FREE);
      expect(status.usagePercent).toBe(50);
      expect(status.isExhausted).toBe(false);
      expect(status.planDetails.name).toBe("Free Tier");
    });
  });

  describe("getPricingPlans", () => {
    it("should return pricing tiers and feature costs matrix", () => {
      const pricing = planService.getPricingPlans();

      expect(pricing.plans).toHaveLength(3);
      expect(pricing.featureCosts[TokenFeature.RESUME_ATS]).toBe(300);
      expect(pricing.featureCosts[TokenFeature.MOCK_INTERVIEW]).toBe(1500);
    });
  });
});
