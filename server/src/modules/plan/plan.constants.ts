import { PlanTier } from "@/database/models/Subscription.model";
import { TokenFeature } from "@/database/models/TokenUsageLog.model";

export const PLAN_CONFIG = {
  [PlanTier.FREE]: {
    tier: PlanTier.FREE,
    name: "Free Tier",
    badge: "Free",
    tokenAllowance: 5000,
    priceMonthly: 0,
    priceYearly: 0,
    currency: "INR",
    tagline: "Essential AI career launchpad with 5,000 welcome tokens",
    features: [
      "5,000 Free AI Tokens (One-time welcome quota)",
      "Full ATS Resume Diagnostic Score",
      "Career GPS Skill Roadmap",
      "Interactive AI Mock Interview (1 session)",
      "Job Match Suitability Scoring",
    ],
    highlight: false,
    ctaText: "Current Plan",
  },
  [PlanTier.PRO]: {
    tier: PlanTier.PRO,
    name: "SKILLEZO Pro",
    badge: "Most Popular",
    tokenAllowance: 100000,
    priceMonthly: 399,
    priceYearly: 3990,
    currency: "INR",
    tagline: "Unlimited career acceleration, priority models & unlimited tailorings",
    features: [
      "100,000 Monthly AI Tokens (refreshed every 30 days)",
      "Unlimited Resume Tailoring & Target Job Alignment",
      "Unlimited Voice & Video Mock Interviews with Rubrics",
      "Deep AI Career Coach with Personalized Career GPS",
      "Recruiter Spotlight & Verified Skills Badge",
      "Priority Access to Gemini 1.5 Pro & GPT-4o Models",
    ],
    highlight: true,
    ctaText: "Upgrade to Pro",
  },
  [PlanTier.ENTERPRISE]: {
    tier: PlanTier.ENTERPRISE,
    name: "University / Enterprise",
    badge: "Custom",
    tokenAllowance: 1000000,
    priceMonthly: null,
    priceYearly: null,
    currency: "INR",
    tagline: "Custom bulk quotas for colleges, universities, and placement cells",
    features: [
      "Dedicated token pools per student cohort",
      "Placement Officer Dashboard & Aggregate Analytics",
      "Custom interview rubrics & institutional LMS integration",
      "Dedicated Account Manager & 24/7 SLA Support",
    ],
    highlight: false,
    ctaText: "Contact Enterprise",
  },
} as const;

export const FEATURE_TOKEN_COSTS: Record<TokenFeature, number> = {
  [TokenFeature.WELCOME_BONUS]: 0,
  [TokenFeature.PROMOTION_BONUS]: 0,
  [TokenFeature.PLAN_UPGRADE]: 0,
  [TokenFeature.RESUME_ATS]: 300,
  [TokenFeature.TAILORED_RESUME]: 700,
  [TokenFeature.CAREER_COACH]: 50,
  [TokenFeature.MOCK_INTERVIEW]: 1500,
  [TokenFeature.SKILL_GAP]: 500,
};

export const FEATURE_DESCRIPTIONS: Record<TokenFeature, string> = {
  [TokenFeature.WELCOME_BONUS]: "Welcome Free Plan bonus (5,000 Tokens)",
  [TokenFeature.PROMOTION_BONUS]: "Promotional token grant",
  [TokenFeature.PLAN_UPGRADE]: "Plan upgrade token refill",
  [TokenFeature.RESUME_ATS]: "ATS Resume Diagnostic Scan",
  [TokenFeature.TAILORED_RESUME]: "AI Tailored Resume Generation",
  [TokenFeature.CAREER_COACH]: "AI Career Coach Conversation",
  [TokenFeature.MOCK_INTERVIEW]: "Interactive AI Mock Interview Session",
  [TokenFeature.SKILL_GAP]: "Skill Gap & Career GPS Roadmap Analysis",
};
