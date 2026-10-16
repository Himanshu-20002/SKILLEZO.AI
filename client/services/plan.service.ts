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
  private cachedPlan: PlanDetails | null = null;
  private cacheTimestamp = 0;
  private inFlightPromise: Promise<PlanDetails> | null = null;
  private readonly CACHE_TTL_MS = 60_000;
  private readonly STORAGE_KEY = "skillezo_plan_cache";

  /**
   * Synchronously returns cached plan from memory or sessionStorage
   */
  getCachedPlan(): PlanDetails | null {
    if (this.cachedPlan) {
      return this.cachedPlan;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.remainingTokens === "number") {
            this.cachedPlan = parsed;
            return parsed;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    return null;
  }

  /**
   * Updates local cached plan manually (e.g. on deduction event)
   */
  setCachedPlan(plan: PlanDetails): void {
    this.cachedPlan = plan;
    this.cacheTimestamp = Date.now();
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(plan));
      } catch {
        // Ignore storage errors
      }
    }
  }

  /**
   * Clears the cache (e.g. on logout)
   */
  clearCache(): void {
    this.cachedPlan = null;
    this.cacheTimestamp = 0;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Fetches user's current subscription tier, remaining token balance, and usage percentage
   */
  async getPlanStatus(forceRefresh = false): Promise<PlanDetails> {
    const isFresh = Date.now() - this.cacheTimestamp < this.CACHE_TTL_MS;
    if (!forceRefresh && this.cachedPlan && isFresh) {
      return this.cachedPlan;
    }

    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.inFlightPromise = apiFetch<{ success: boolean; data: PlanDetails }>("/api/plan/status")
      .then((response) => {
        this.setCachedPlan(response.data);
        return response.data;
      })
      .finally(() => {
        this.inFlightPromise = null;
      });

    return this.inFlightPromise;
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
