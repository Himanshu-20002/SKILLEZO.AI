import { describe, it, expect, vi, beforeEach } from "vitest";
import { BillingService } from "@/modules/billing/billing.service";
import { SubscriptionModel, PlanTier, SubscriptionStatus } from "@/database/models/Subscription.model";
import { TokenAccountModel } from "@/database/models/TokenAccount.model";
import { TokenUsageLogModel, TokenFeature } from "@/database/models/TokenUsageLog.model";
import { planService } from "@/modules/plan/plan.service";
import { razorpayService } from "@/modules/billing/razorpay.service";
import { AppError } from "@/core/utils/AppError";

vi.mock("@/database/models/Subscription.model", () => ({
  SubscriptionModel: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
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
  },
}));

vi.mock("@/database/models/TokenUsageLog.model", () => ({
  TokenUsageLogModel: {
    create: vi.fn(),
    findOne: vi.fn(),
  },
  TokenFeature: {
    PLAN_UPGRADE: "PLAN_UPGRADE",
  },
}));

vi.mock("@/modules/plan/plan.service", () => ({
  planService: {
    getOrCreateAccount: vi.fn(),
  },
}));

vi.mock("@/modules/billing/razorpay.service", () => ({
  razorpayService: {
    createOrder: vi.fn(),
    verifyPaymentSignature: vi.fn(),
    verifyWebhookSignature: vi.fn(),
    isConfigured: false,
    keyId: "rzp_test_123",
  },
}));

describe("BillingService (Phase 21 Part 4 - Razorpay & Pro Activation)", () => {
  let billingService: BillingService;

  beforeEach(() => {
    vi.clearAllMocks();
    billingService = new BillingService();
  });

  describe("createRazorpayOrder", () => {
    it("should prevent duplicate upgrades if user is already on active PRO tier", async () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      (planService.getOrCreateAccount as any).mockResolvedValue({
        subscription: {
          tier: PlanTier.PRO,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: futureDate,
        },
        tokenAccount: { remainingTokens: 80000 },
      });

      await expect(
        billingService.createRazorpayOrder("user-1", "user@test.com", "Test User", { billingCycle: "MONTHLY" })
      ).rejects.toThrow(AppError);
    });

    it("should create mock checkout order in development mode", async () => {
      (planService.getOrCreateAccount as any).mockResolvedValue({
        subscription: {
          tier: PlanTier.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
        tokenAccount: { remainingTokens: 2000 },
      });

      const result = await billingService.createRazorpayOrder("user-1", "user@test.com", "Test User", { billingCycle: "MONTHLY" });

      expect(result.isMock).toBe(true);
      expect(result.orderId).toContain("order_mock_");
      expect(result.amount).toBe(39900); // ₹399
      expect(result.currency).toBe("INR");
    });
  });

  describe("verifyPayment & upgradeAccountToPro", () => {
    it("should reject invalid payment signatures in real mode", async () => {
      (razorpayService.verifyPaymentSignature as any).mockReturnValue(false);
      // simulate non-mock order
      (razorpayService as any).isConfigured = true;

      await expect(
        billingService.verifyPayment("user-1", {
          orderId: "order_real_123",
          paymentId: "pay_real_123",
          signature: "invalid_sig",
          billingCycle: "MONTHLY",
        })
      ).rejects.toThrow("Invalid payment signature verification failed");
    });

    it("should successfully upgrade account to Pro and grant 100,000 monthly tokens", async () => {
      (planService.getOrCreateAccount as any).mockResolvedValue({
        subscription: { tier: PlanTier.FREE },
        tokenAccount: { remainingTokens: 500, bonusTokens: 0 },
      });

      (SubscriptionModel.findOneAndUpdate as any).mockResolvedValue({
        userId: "user-1",
        tier: PlanTier.PRO,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      (TokenAccountModel.findOneAndUpdate as any).mockResolvedValue({
        userId: "user-1",
        tier: PlanTier.PRO,
        totalAllowance: 100000,
        consumedTokens: 0,
        remainingTokens: 100000,
      });

      (TokenUsageLogModel.create as any).mockResolvedValue({ _id: "log-1" });

      const result = await billingService.upgradeAccountToPro("user-1", {
        orderId: "order_test_123",
        paymentId: "pay_test_123",
        billingCycle: "MONTHLY",
      });

      expect(result.success).toBe(true);
      expect(result.tier).toBe(PlanTier.PRO);
      expect(result.totalAllowance).toBe(100000);
      expect(result.remainingTokens).toBe(100000);

      // Verify DB updates
      expect(SubscriptionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1" },
        expect.objectContaining({
          tier: PlanTier.PRO,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: "MONTHLY",
        }),
        expect.anything()
      );

      expect(TokenAccountModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1" },
        expect.objectContaining({
          tier: PlanTier.PRO,
          totalAllowance: 100000,
          consumedTokens: 0,
          remainingTokens: 100000,
        }),
        expect.anything()
      );

      expect(TokenUsageLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          feature: TokenFeature.PLAN_UPGRADE,
          balanceAfter: 100000,
        })
      );
    });
  });

  describe("handleRazorpayWebhook", () => {
    it("should reject webhook with invalid signature", async () => {
      (razorpayService.verifyWebhookSignature as any).mockReturnValue(false);

      await expect(
        billingService.handleRazorpayWebhook('{"event":"order.paid"}', "bad_sig")
      ).rejects.toThrow(AppError);
    });

    it("should idempotently process order.paid event", async () => {
      (razorpayService.verifyWebhookSignature as any).mockReturnValue(true);
      (TokenUsageLogModel.findOne as any).mockResolvedValue(null); // not already processed

      (planService.getOrCreateAccount as any).mockResolvedValue({
        subscription: { tier: PlanTier.FREE },
        tokenAccount: { remainingTokens: 0, bonusTokens: 0 },
      });

      (SubscriptionModel.findOneAndUpdate as any).mockResolvedValue({
        tier: PlanTier.PRO,
        currentPeriodEnd: new Date(),
      });

      (TokenAccountModel.findOneAndUpdate as any).mockResolvedValue({
        remainingTokens: 100000,
      });

      const payload = JSON.stringify({
        event: "order.paid",
        payload: {
          payment: {
            entity: {
              id: "pay_webhook_999",
              order_id: "order_webhook_888",
              notes: {
                userId: "user-webhook-1",
                billingCycle: "MONTHLY",
              },
            },
          },
        },
      });

      const res = await billingService.handleRazorpayWebhook(payload, "valid_sig");
      expect(res.received).toBe(true);
      expect(SubscriptionModel.findOneAndUpdate).toHaveBeenCalled();
      expect(TokenAccountModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
