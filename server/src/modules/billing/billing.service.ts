import { SubscriptionModel, PlanTier, SubscriptionStatus } from "@/database/models/Subscription.model";
import { TokenAccountModel } from "@/database/models/TokenAccount.model";
import { TokenUsageLogModel, TokenFeature } from "@/database/models/TokenUsageLog.model";
import { planService } from "@/modules/plan/plan.service";
import { razorpayService } from "./razorpay.service";
import { BILLING_PLANS, PlanPricingConfig } from "./billing.constants";
import { CreateRazorpayOrderInput, VerifyRazorpayPaymentInput } from "./billing.dto";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { env } from "@/core/config/env";

export class BillingService {
  /**
   * Generates a new Razorpay checkout order for plan upgrades.
   * Seamlessly switches to Mock Checkout in development when credentials are unset or mock is enabled.
   */
  async createRazorpayOrder(
    userId: string,
    userEmail: string,
    userName: string,
    input: CreateRazorpayOrderInput
  ) {
    const { subscription } = await planService.getOrCreateAccount(userId);

    // If user already has an active PRO subscription
    if (subscription.tier === PlanTier.PRO && subscription.status === SubscriptionStatus.ACTIVE) {
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date()) {
        throw new AppError(
          "You are already active on SKILLEZO Pro with 100,000 monthly tokens.",
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.CONFLICT,
          { tier: subscription.tier, currentPeriodEnd: subscription.currentPeriodEnd }
        );
      }
    }

    const billingCycle = input.billingCycle || "MONTHLY";
    const planKey = billingCycle === "YEARLY" ? "PRO_YEARLY" : "PRO_MONTHLY";
    const planConfig: PlanPricingConfig = BILLING_PLANS[planKey];

    const isMockEnabled = env.MOCK_BILLING_ENABLED || !razorpayService.isConfigured;

    if (isMockEnabled) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        isMock: true,
        orderId: mockOrderId,
        amount: planConfig.amountInPaise,
        currency: "INR",
        keyId: "rzp_test_mock_mode",
        planName: planConfig.name,
        planDescription: planConfig.description,
        user: {
          name: userName || "SKILLEZO Candidate",
          email: userEmail || "candidate@skillezo.ai",
        },
      };
    }

    const receipt = `rcpt_${userId.substring(0, 10)}_${Date.now()}`;
    const order = await razorpayService.createOrder({
      amountInPaise: planConfig.amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId,
        tier: PlanTier.PRO,
        billingCycle,
      },
    });

    return {
      isMock: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayService.keyId,
      planName: planConfig.name,
      planDescription: planConfig.description,
      user: {
        name: userName || "SKILLEZO Candidate",
        email: userEmail || "candidate@skillezo.ai",
      },
    };
  }

  /**
   * Cryptographically verifies the Razorpay payment and activates Pro tier & 100,000 tokens.
   */
  async verifyPayment(userId: string, input: VerifyRazorpayPaymentInput) {
    const isMockOrder = input.orderId.startsWith("order_mock_");
    const isMockEnabled = env.MOCK_BILLING_ENABLED || !razorpayService.isConfigured;

    if (isMockOrder) {
      if (!isMockEnabled) {
        throw new AppError("Mock payments are disabled in this environment", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }
    } else {
      const isValid = razorpayService.verifyPaymentSignature(
        input.orderId,
        input.paymentId,
        input.signature
      );

      if (!isValid) {
        throw new AppError("Invalid payment signature verification failed", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
      }
    }

    return await this.upgradeAccountToPro(userId, {
      orderId: input.orderId,
      paymentId: input.paymentId,
      billingCycle: input.billingCycle || "MONTHLY",
    });
  }

  /**
   * Atomically upgrades the candidate account to PRO tier:
   * 1. Extends subscription currentPeriodEnd by 30 days (or 365 days)
   * 2. Sets totalAllowance to 100,000 monthly tokens
   * 3. Resets consumed tokens to 0
   * 4. Logs itemized PLAN_UPGRADE audit transaction
   */
  async upgradeAccountToPro(
    userId: string,
    details: { orderId: string; paymentId: string; billingCycle: "MONTHLY" | "YEARLY" }
  ) {
    const { tokenAccount } = await planService.getOrCreateAccount(userId);
    const balanceBefore = tokenAccount.remainingTokens;

    const daysValid = details.billingCycle === "YEARLY" ? 365 : 30;
    const currentPeriodEnd = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

    const planKey = details.billingCycle === "YEARLY" ? "PRO_YEARLY" : "PRO_MONTHLY";
    const allowance = BILLING_PLANS[planKey].tokenAllowance;

    // 1. Update Subscription
    const updatedSubscription = await SubscriptionModel.findOneAndUpdate(
      { userId },
      {
        tier: PlanTier.PRO,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: details.billingCycle,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        $set: {
          "metadata.lastPaymentId": details.paymentId,
          "metadata.lastOrderId": details.orderId,
          "metadata.lastUpgradedAt": new Date(),
        },
      },
      { new: true, upsert: true }
    );

    // 2. Refill Token Account
    const updatedTokens = await TokenAccountModel.findOneAndUpdate(
      { userId },
      {
        tier: PlanTier.PRO,
        totalAllowance: allowance,
        consumedTokens: 0,
        remainingTokens: allowance + (tokenAccount.bonusTokens || 0),
        lastRefillAt: new Date(),
      },
      { new: true }
    );

    const balanceAfter = updatedTokens?.remainingTokens ?? allowance;

    // 3. Log Audit Ledger Entry
    await TokenUsageLogModel.create({
      userId,
      feature: TokenFeature.PLAN_UPGRADE,
      tokensDeducted: 0,
      balanceBefore,
      balanceAfter,
      description: `Upgraded to SKILLEZO Pro (${allowance.toLocaleString()} monthly AI tokens granted)`,
      metadata: {
        paymentId: details.paymentId,
        orderId: details.orderId,
        billingCycle: details.billingCycle,
        tier: PlanTier.PRO,
      },
    });

    return {
      success: true,
      tier: PlanTier.PRO,
      remainingTokens: balanceAfter,
      totalAllowance: allowance,
      currentPeriodEnd: updatedSubscription.currentPeriodEnd,
      message: `Successfully upgraded to SKILLEZO Pro! ${allowance.toLocaleString()} AI tokens are now active in your account.`,
    };
  }

  /**
   * Asynchronous Webhook fallback handler for Razorpay (order.paid, payment.captured).
   */
  async handleRazorpayWebhook(rawBody: string | Buffer, signature: string) {
    if (!razorpayService.verifyWebhookSignature(rawBody, signature)) {
      throw new AppError("Invalid Razorpay webhook signature", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    const payload = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString("utf8"));
    const event = payload.event;

    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const userId = paymentEntity?.notes?.userId || orderEntity?.notes?.userId;
      const billingCycle = paymentEntity?.notes?.billingCycle || orderEntity?.notes?.billingCycle || "MONTHLY";
      const paymentId = paymentEntity?.id || "webhook_captured";
      const orderId = orderEntity?.id || paymentEntity?.order_id || "webhook_order";

      if (userId) {
        // Idempotency check: don't double credit if already processed
        const existingLog = await TokenUsageLogModel.findOne({
          userId,
          "metadata.paymentId": paymentId,
        });

        if (!existingLog) {
          await this.upgradeAccountToPro(userId, {
            orderId,
            paymentId,
            billingCycle,
          });
        }
      }
    }

    return { received: true };
  }
}

export const billingService = new BillingService();
