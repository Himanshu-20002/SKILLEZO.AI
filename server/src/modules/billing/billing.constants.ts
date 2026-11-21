import { PlanTier } from "@/database/models/Subscription.model";

export const BILLING_CURRENCY = "INR";

export interface PlanPricingConfig {
  tier: PlanTier;
  billingCycle: "MONTHLY" | "YEARLY" | "SPRINT_PASS";
  amountInPaise: number;
  amountInRupees: number;
  tokenAllowance: number;
  name: string;
  description: string;
}

export const BILLING_PLANS: Record<"SPRINT_PASS" | "PRO_MONTHLY" | "PRO_YEARLY", PlanPricingConfig> = {
  SPRINT_PASS: {
    tier: PlanTier.PRO,
    billingCycle: "SPRINT_PASS",
    amountInPaise: 19900, // ₹199.00
    amountInRupees: 199,
    tokenAllowance: 15000,
    name: "7-Day Sprint Pass",
    description: "15,000 AI tokens for 7 days of resume tailoring & mock interviews.",
  },
  PRO_MONTHLY: {
    tier: PlanTier.PRO,
    billingCycle: "MONTHLY",
    amountInPaise: 49900, // ₹499.00
    amountInRupees: 499,
    tokenAllowance: 50000,
    name: "SKILLEZO Pro (Monthly)",
    description: "50,000 monthly AI tokens, ATS tailoring & mock interviews.",
  },
  PRO_YEARLY: {
    tier: PlanTier.PRO,
    billingCycle: "YEARLY",
    amountInPaise: 399900, // ₹3,999.00
    amountInRupees: 3999,
    tokenAllowance: 600000,
    name: "SKILLEZO Pro (Annual)",
    description: "50,000 monthly AI tokens (600,000/yr), annual commitment with 33% savings.",
  },
};
