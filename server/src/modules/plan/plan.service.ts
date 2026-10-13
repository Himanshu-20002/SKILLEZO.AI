import { SubscriptionModel, PlanTier, SubscriptionStatus, ISubscription } from "@/database/models/Subscription.model";
import { TokenAccountModel, ITokenAccount } from "@/database/models/TokenAccount.model";
import { TokenUsageLogModel, TokenFeature } from "@/database/models/TokenUsageLog.model";
import { PLAN_CONFIG, FEATURE_TOKEN_COSTS, FEATURE_DESCRIPTIONS } from "./plan.constants";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export interface PlanStatusResponse {
  tier: PlanTier;
  status: SubscriptionStatus;
  totalAllowance: number;
  consumedTokens: number;
  remainingTokens: number;
  bonusTokens: number;
  usagePercent: number;
  isExhausted: boolean;
  startedAt: Date;
  currentPeriodEnd: Date | null;
  planDetails: {
    name: string;
    badge: string;
    tagline: string;
    features: readonly string[];
  };
}

export interface CheckQuotaResult {
  allowed: boolean;
  balance: number;
  required: number;
  missing: number;
  tier: PlanTier;
  upgradeUrl: string;
}

export class PlanService {
  /**
   * Self-healing retrieval or initialization of user's Subscription and TokenAccount.
   * Ensures zero legacy users or new users are ever left without a Free Plan and 5,000 free tokens.
   */
  async getOrCreateAccount(userId: string): Promise<{ subscription: ISubscription; tokenAccount: ITokenAccount }> {
    if (!userId) {
      throw new AppError("User identifier is required", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    // 1. Fetch existing Subscription or create new Free Tier
    let subscription = await SubscriptionModel.findOne({ userId });
    if (!subscription) {
      try {
        subscription = await SubscriptionModel.create({
          userId,
          tier: PlanTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: null,
          startedAt: new Date(),
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          metadata: { initialSource: "auto-provisioned" },
        });
      } catch (err: any) {
        if (err.code === 11000) {
          subscription = await SubscriptionModel.findOne({ userId });
        } else {
          throw err;
        }
      }
    }

    // 2. Fetch existing TokenAccount or provision default 5,000 Free Tokens
    let tokenAccount = await TokenAccountModel.findOne({ userId });
    if (!tokenAccount) {
      try {
        const defaultAllowance = PLAN_CONFIG[PlanTier.FREE].tokenAllowance;
        tokenAccount = await TokenAccountModel.create({
          userId,
          tier: PlanTier.FREE,
          totalAllowance: defaultAllowance,
          consumedTokens: 0,
          remainingTokens: defaultAllowance,
          bonusTokens: 0,
          lastRefillAt: new Date(),
        });

        // Record Welcome Free Bonus in audit log
        await TokenUsageLogModel.create({
          userId,
          feature: TokenFeature.WELCOME_BONUS,
          tokensDeducted: 0,
          balanceBefore: 0,
          balanceAfter: defaultAllowance,
          description: FEATURE_DESCRIPTIONS[TokenFeature.WELCOME_BONUS],
          metadata: { initialTokens: defaultAllowance },
        });
      } catch (err: any) {
        if (err.code === 11000) {
          tokenAccount = await TokenAccountModel.findOne({ userId });
        } else {
          throw err;
        }
      }
    }

    return {
      subscription: subscription!,
      tokenAccount: tokenAccount!,
    };
  }

  /**
   * Retrieves active plan status, remaining quota, and visual metrics for dashboard UI.
   */
  async getPlanStatus(userId: string): Promise<PlanStatusResponse> {
    const { subscription, tokenAccount } = await this.getOrCreateAccount(userId);

    const totalAvailable = tokenAccount.totalAllowance + tokenAccount.bonusTokens;
    const usagePercent = totalAvailable > 0
      ? Math.min(100, Math.round((tokenAccount.consumedTokens / totalAvailable) * 100))
      : 100;

    const planMeta = PLAN_CONFIG[subscription.tier] || PLAN_CONFIG[PlanTier.FREE];

    return {
      tier: subscription.tier,
      status: subscription.status,
      totalAllowance: tokenAccount.totalAllowance,
      consumedTokens: tokenAccount.consumedTokens,
      remainingTokens: tokenAccount.remainingTokens,
      bonusTokens: tokenAccount.bonusTokens,
      usagePercent,
      isExhausted: tokenAccount.remainingTokens <= 0,
      startedAt: subscription.startedAt,
      currentPeriodEnd: subscription.currentPeriodEnd || null,
      planDetails: {
        name: planMeta.name,
        badge: planMeta.badge,
        tagline: planMeta.tagline,
        features: planMeta.features,
      },
    };
  }

  /**
   * Fast pre-flight check to verify if user has enough tokens for an AI action.
   */
  async checkTokenQuota(
    userId: string,
    feature: TokenFeature,
    customCost?: number
  ): Promise<CheckQuotaResult> {
    const { subscription, tokenAccount } = await this.getOrCreateAccount(userId);
    const required = customCost !== undefined ? customCost : (FEATURE_TOKEN_COSTS[feature] ?? 0);
    const balance = tokenAccount.remainingTokens;
    const allowed = balance >= required;

    return {
      allowed,
      balance,
      required,
      missing: allowed ? 0 : required - balance,
      tier: subscription.tier,
      upgradeUrl: "/dashboard/plan",
    };
  }

  /**
   * Atomically deducts tokens from user account and logs audit transaction.
   * Concurrency-safe: uses atomic condition { remainingTokens: { $gte: amount } }.
   */
  async deductTokens(
    userId: string,
    feature: TokenFeature,
    customAmount?: number,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; tokensDeducted: number; balanceAfter: number }> {
    const requiredAmount = customAmount !== undefined ? customAmount : (FEATURE_TOKEN_COSTS[feature] ?? 0);

    // Free operations require no deduction
    if (requiredAmount <= 0) {
      const { tokenAccount } = await this.getOrCreateAccount(userId);
      return { success: true, tokensDeducted: 0, balanceAfter: tokenAccount.remainingTokens };
    }

    // Ensure account exists first
    await this.getOrCreateAccount(userId);

    // Atomic update directly on DB
    const updatedAccount = await TokenAccountModel.findOneAndUpdate(
      {
        userId,
        remainingTokens: { $gte: requiredAmount },
      },
      {
        $inc: {
          consumedTokens: requiredAmount,
          remainingTokens: -requiredAmount,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedAccount) {
      // Re-read current balance to provide actionable error response
      const current = await TokenAccountModel.findOne({ userId });
      const currentBalance = current ? current.remainingTokens : 0;

      throw new AppError(
        `Insufficient token allowance (${currentBalance} available, ${requiredAmount} required). Please upgrade your plan.`,
        HTTP_STATUS.PAYMENT_REQUIRED,
        ERROR_CODES.INSUFFICIENT_TOKENS,
        {
          balance: currentBalance,
          required: requiredAmount,
          missing: requiredAmount - currentBalance,
          feature,
          upgradeUrl: "/dashboard/plan",
        }
      );
    }

    const desc = description || FEATURE_DESCRIPTIONS[feature] || `${feature} execution`;
    const balanceBefore = updatedAccount.remainingTokens + requiredAmount;

    // Record audit trail asynchronously
    await TokenUsageLogModel.create({
      userId,
      feature,
      tokensDeducted: requiredAmount,
      balanceBefore,
      balanceAfter: updatedAccount.remainingTokens,
      description: desc,
      metadata: metadata || {},
    });

    return {
      success: true,
      tokensDeducted: requiredAmount,
      balanceAfter: updatedAccount.remainingTokens,
    };
  }

  /**
   * Adds bonus tokens (e.g. promotional reward, referral, or compensation).
   */
  async addBonusTokens(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<ITokenAccount> {
    if (amount <= 0) {
      throw new AppError("Bonus token amount must be positive", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    await this.getOrCreateAccount(userId);

    const updated = await TokenAccountModel.findOneAndUpdate(
      { userId },
      {
        $inc: {
          bonusTokens: amount,
          remainingTokens: amount,
        },
      },
      { new: true }
    );

    if (updated) {
      await TokenUsageLogModel.create({
        userId,
        feature: TokenFeature.PROMOTION_BONUS,
        tokensDeducted: 0,
        balanceBefore: updated.remainingTokens - amount,
        balanceAfter: updated.remainingTokens,
        description: description || "Promotional Bonus Grant",
        metadata: metadata || {},
      });
    }

    return updated!;
  }

  /**
   * Returns paginated usage audit logs for candidate dashboard history table.
   */
  async getUsageHistory(userId: string, page = 1, limit = 20) {
    await this.getOrCreateAccount(userId);

    const skip = (page - 1) * limit;

    const [logs, totalRecords] = await Promise.all([
      TokenUsageLogModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TokenUsageLogModel.countDocuments({ userId }),
    ]);

    return {
      history: logs,
      totalRecords,
      page,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  /**
   * Returns all available subscription tiers and feature token costs for frontend pricing comparison.
   */
  getPricingPlans() {
    return {
      plans: Object.values(PLAN_CONFIG),
      featureCosts: FEATURE_TOKEN_COSTS,
      featureDescriptions: FEATURE_DESCRIPTIONS,
    };
  }
}

export const planService = new PlanService();
