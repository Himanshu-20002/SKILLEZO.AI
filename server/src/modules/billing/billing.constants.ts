import { PlanTier } from "@/database/models/Subscription.model";

export const BILLING_CURRENCY = "INR";

export interface PlanPricingConfig {
  tier: PlanTier;
  billingCycle: "MONTHLY" | "YEARLY";
  amountInPaise: number;
  amountInRupees: number;
  tokenAllowance: number;
  name: string;
  description: string;
}

export const BILLING_PLANS: Record<"PRO_MONTHLY" | "PRO_YEARLY", PlanPricingConfig> = {
  PRO_MONTHLY: {
    tier: PlanTier.PRO,
    billingCycle: "MONTHLY",
    amountInPaise: 39900, // ₹399.00
    amountInRupees: 399,
    tokenAllowance: 100000,
    name: "SKILLEZO Pro (Monthly)",
    description: "100,000 monthly AI tokens, unlimited ATS tailoring & mock interviews.",
  },
  PRO_YEARLY: {
    tier: PlanTier.PRO,
    billingCycle: "YEARLY",
    amountInPaise: 399900, // ₹3,999.00
    amountInRupees: 3999,
    tokenAllowance: 1200000,
    name: "SKILLEZO Pro (Annual)",
    description: "100,000 monthly AI tokens, annual commitment with 17% savings.",
  },
};
