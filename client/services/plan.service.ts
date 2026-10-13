import { apiFetch } from "@/lib/api";

export interface PlanDetails {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE";
  totalAllowance: number;
  consumedTokens: number;
  remainingTokens: number;
  bonusTokens: number;
  usagePercent: number;
  isExhausted: boolean;
  startedAt: string;
  currentPeriodEnd: string | null;
  planDetails: {
    name: string;
    badge: string;
    tagline: string;
    features: string[];
  };
}

export interface PricingPlan {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  name: string;
  badge: string;
  tokenAllowance: number;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  tagline: string;
  features: string[];
  highlight: boolean;
  ctaText: string;
}

export interface PricingData {
  plans: PricingPlan[];
  featureCosts: Record<string, number>;
  featureDescriptions: Record<string, string>;
}

export interface TokenUsageLogItem {
  _id: string;
  userId: string;
  feature: string;
  tokensDeducted: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PaginatedUsageResponse {
  history: TokenUsageLogItem[];
  totalRecords: number;
  page: number;
  totalPages: number;
}

export interface CheckQuotaResult {
  allowed: boolean;
  balance: number;
  required: number;
  missing: number;
  tier: string;
  upgradeUrl: string;
}

class PlanService {
  /**
   * Fetches user's current subscription tier, remaining token balance, and usage percentage
   */
  async getPlanStatus(): Promise<PlanDetails> {
    const response = await apiFetch<{ success: boolean; data: PlanDetails }>("/api/plan/status");
    return response.data;
  }

  /**
   * Fetches pricing tiers comparison matrix and feature costs
   */
  async getPricingPlans(): Promise<PricingData> {
    const response = await apiFetch<{ success: boolean; data: PricingData }>("/api/plan/pricing");
    return response.data;
  }

  /**
   * Fetches paginated token consumption audit history
   */
  async getUsageHistory(page = 1, limit = 20): Promise<PaginatedUsageResponse> {
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await apiFetch<{ success: boolean; data: PaginatedUsageResponse }>(
      `/api/plan/usage?${searchParams.toString()}`
    );
    return response.data;
  }

  /**
   * Pre-flight check to verify if user has enough tokens for an AI action
   */
  async checkQuota(feature: string, customCost?: number): Promise<CheckQuotaResult> {
    const response = await apiFetch<{ success: boolean; data: CheckQuotaResult }>("/api/plan/check-quota", {
      method: "POST",
      body: JSON.stringify({ feature, customCost }),
    });
    return response.data;
  }
}

export const planService = new PlanService();
