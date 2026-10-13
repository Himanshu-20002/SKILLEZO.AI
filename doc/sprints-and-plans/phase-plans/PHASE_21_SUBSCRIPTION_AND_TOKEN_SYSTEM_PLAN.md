# Phase 21 — Plan & AI Token Allowance System (Phase 1 Backend Plan)

---

## 1. Executive Summary & Paradigm Shift

**Sprint:** 5  
**Phase:** 21 (Part 1: Backend Foundation & Free Token Provisioning)  
**Status:** 🟢 COMPLETED (Phase 1 Backend & Provisioning)  
**Primary Goal:** Transition SKILLEZO.AI away from financial "Wallet & Top-up" concepts to a modern **Tiered Subscription & AI Token Allowance** model (similar to OpenAI, Claude, and GitHub Copilot).

### Core Principles
1. **No "Wallet" / Cash Top-Up**:
   - Users do not manage monetary balances or cash recharges.
   - Every candidate operates under a **Plan Tier** (`FREE`, `PRO`, `ENTERPRISE`).
2. **Free Plan by Default for Every New Account**:
   - Upon registration (Email/Password or Google OAuth), every user is automatically provisioned a **Free Plan**.
   - Every Free Plan user receives a **5,000 Free AI Token Allowance** out of the box.
3. **Usage-Based Consumption & Upgrade Trigger**:
   - Actions across SKILLEZO AI (Resume Parsing, AI Career Coach, Tailored Resume Generation, AI Mock Interviews) consume from the token allowance.
   - When the token balance reaches zero or is insufficient for an operation, the system denies execution with a standardized `INSUFFICIENT_TOKENS` error, directing candidates to upgrade to **SKILLEZO Pro**.

---

## 2. Architecture & Codebase Touchpoints (Phase 1)

```
SKILLEZO.AI Codebase
├── server/
│   ├── src/database/
│   │   ├── models/
│   │   │   ├── Subscription.model.ts          <-- [NEW] Tracks user tier, status, cycle
│   │   │   ├── TokenAccount.model.ts          <-- [NEW] Tracks total allowance, consumed, remaining
│   │   │   ├── TokenUsageLog.model.ts         <-- [NEW] Itemized audit logs per AI feature
│   │   │   └── index.ts                       <-- [UPDATE] Re-export new models
│   ├── src/modules/
│   │   └── plan/                              <-- [NEW MODULE]
│   │       ├── plan.constants.ts              <-- [NEW] Tier allowances & feature costs
│   │       ├── plan.dto.ts                    <-- [NEW] Zod validation schemas
│   │       ├── plan.service.ts                <-- [NEW] Provisioning, deduction, balance check
│   │       ├── plan.controller.ts             <-- [NEW] HTTP endpoints controller
│   │       ├── plan.routes.ts                 <-- [NEW] Express router (/api/plan)
│   │       ├── plan.test.ts                   <-- [NEW] Unit & integration tests
│   │       └── index.ts                       <-- [NEW] Public module exports
│   ├── src/core/auth/
│   │   └── auth.ts                            <-- [HOOK] Auto-provision 5,000 tokens on user.create
│   ├── src/scripts/
│   │   └── backfill-free-tokens.ts            <-- [NEW] Safe one-time backfill for existing users
│   └── src/server.ts                          <-- [REGISTER] Mount /api/plan route
```

---

## 3. Data Models Specification

### 3.1 `Subscription.model.ts`
Represents the user's active tier and subscription lifecycle.

```typescript
import { Schema, model, Document } from "mongoose";

export enum PlanTier {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
}

export interface ISubscription extends Document {
  userId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  billingCycle?: "MONTHLY" | "YEARLY";
  startedAt: Date;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    tier: {
      type: String,
      enum: Object.values(PlanTier),
      default: PlanTier.FREE,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: null,
    },
    startedAt: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "subscriptions" }
);

export const SubscriptionModel = model<ISubscription>("Subscription", subscriptionSchema);
```

---

### 3.2 `TokenAccount.model.ts`
Maintains the token quota balance with concurrency-safe atomic operations.

```typescript
import { Schema, model, Document } from "mongoose";
import { PlanTier } from "./Subscription.model";

export interface ITokenAccount extends Document {
  userId: string;
  tier: PlanTier;
  totalAllowance: number;   // 5,000 for FREE, 100,000 for PRO
  consumedTokens: number;   // cumulative used
  remainingTokens: number;  // totalAllowance - consumedTokens
  bonusTokens: number;      // promotional / referral bonus
  lastRefillAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenAccountSchema = new Schema<ITokenAccount>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    tier: {
      type: String,
      enum: Object.values(PlanTier),
      default: PlanTier.FREE,
      required: true,
    },
    totalAllowance: { type: Number, required: true, default: 5000 },
    consumedTokens: { type: Number, required: true, default: 0 },
    remainingTokens: { type: Number, required: true, default: 5000 },
    bonusTokens: { type: Number, default: 0 },
    lastRefillAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "token_accounts" }
);

// Pre-save hook to ensure remainingTokens is always consistent
tokenAccountSchema.pre("save", function (next) {
  this.remainingTokens = Math.max(0, this.totalAllowance + this.bonusTokens - this.consumedTokens);
  next();
});

export const TokenAccountModel = model<ITokenAccount>("TokenAccount", tokenAccountSchema);
```

---

### 3.3 `TokenUsageLog.model.ts`
Full audit trail of AI token consumption.

```typescript
import { Schema, model, Document } from "mongoose";

export enum TokenFeature {
  WELCOME_BONUS = "WELCOME_BONUS",
  RESUME_ATS = "RESUME_ATS",
  TAILORED_RESUME = "TAILORED_RESUME",
  CAREER_COACH = "CAREER_COACH",
  MOCK_INTERVIEW = "MOCK_INTERVIEW",
  SKILL_GAP = "SKILL_GAP",
  PROMOTION_BONUS = "PROMOTION_BONUS",
}

export interface ITokenUsageLog extends Document {
  userId: string;
  feature: TokenFeature;
  tokensDeducted: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: {
    modelUsed?: string;
    targetJobId?: string;
    sessionId?: string;
    actionProposalId?: string;
  };
  createdAt: Date;
}

const tokenUsageLogSchema = new Schema<ITokenUsageLog>(
  {
    userId: { type: String, required: true, index: true },
    feature: {
      type: String,
      enum: Object.values(TokenFeature),
      required: true,
      index: true,
    },
    tokensDeducted: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "token_usage_logs" }
);

tokenUsageLogSchema.index({ userId: 1, createdAt: -1 });

export const TokenUsageLogModel = model<ITokenUsageLog>("TokenUsageLog", tokenUsageLogSchema);
```

---

## 4. Feature Cost Matrix & Plan Config (`plan.constants.ts`)

```typescript
export const PLAN_CONFIG = {
  FREE: {
    name: "Free Tier",
    tokenAllowance: 5000,
    priceMonthly: 0,
    priceYearly: 0,
    description: "Essential AI career launchpad with 5,000 welcome tokens",
    features: [
      "5,000 Free AI Tokens",
      "Full ATS Resume Diagnostic",
      "Career GPS Skill Roadmap",
      "1 Interactive AI Mock Interview",
      "Job Match Suitability Scoring",
    ],
  },
  PRO: {
    name: "SKILLEZO Pro",
    tokenAllowance: 100000,
    priceMonthly: 799, // ₹799 / month or $19 / mo
    priceYearly: 7990,
    description: "Unlimited career acceleration, priority models & unlimited tailorings",
    features: [
      "100,000 Monthly AI Tokens (refreshed monthly)",
      "Unlimited Resume Tailoring & Versioning",
      "Unlimited Voice & Video Mock Interviews",
      "Deep AI Career Coach with personalized guidance",
      "Recruiter Spotlight & Verified Skills Badge",
      "Fast-track processing & Priority Gemini/OpenAI models",
    ],
  },
  ENTERPRISE: {
    name: "University / Enterprise",
    tokenAllowance: 1000000,
    description: "Custom bulk quotas for institutions and placement cells",
    features: [
      "Dedicated token pools per cohort",
      "Placement dashboard & batch analytics",
      "Custom interview rubrics & LMS integration",
    ],
  },
};

export const FEATURE_TOKEN_COSTS = {
  RESUME_ATS: 300,
  TAILORED_RESUME: 700,
  CAREER_COACH: 50,
  MOCK_INTERVIEW: 1500,
  SKILL_GAP: 500,
} as const;
```

---

## 5. Core Service Implementation Plan (`plan.service.ts`)

The service provides four key capabilities:

### 1. `getOrCreateAccount(userId: string)` (Self-Healing)
- Queries `SubscriptionModel` and `TokenAccountModel`.
- If missing (new user OR existing user without records):
  - Atomically creates `Subscription` with `tier: PlanTier.FREE`, `status: SubscriptionStatus.ACTIVE`.
  - Atomically creates `TokenAccount` with `totalAllowance: 5000`, `consumedTokens: 0`, `remainingTokens: 5000`.
  - Records an entry in `TokenUsageLog`: `feature: WELCOME_BONUS`, `tokensDeducted: 0`, `balanceBefore: 0`, `balanceAfter: 5000`, `description: "Free Plan Welcome Bonus (5,000 Tokens)"`.
- Returns both the subscription and token account.

### 2. `checkTokenQuota(userId: string, requiredTokens: number)`
- Checks if `remainingTokens >= requiredTokens`.
- Returns:
  ```json
  {
    "allowed": true,
    "remainingTokens": 4500,
    "requiredTokens": 700,
    "missingTokens": 0,
    "planTier": "FREE"
  }
  ```
- If `allowed === false`, frontend can immediately prompt the upgrade modal.

### 3. `deductTokens(userId: string, amount: number, feature: TokenFeature, description: string, metadata?: any)`
- Uses atomic MongoDB update:
  ```typescript
  const updatedAccount = await TokenAccountModel.findOneAndUpdate(
    {
      userId,
      remainingTokens: { $gte: amount },
    },
    {
      $inc: { consumedTokens: amount, remainingTokens: -amount },
    },
    { new: true }
  );
  ```
- If null: throws custom `InsufficientTokensError` (`402 Payment Required`).
- Logs deduction to `TokenUsageLogModel`.

### 4. `getUsageHistory(userId: string, page = 1, limit = 20)`
- Returns paginated list of usage entries with timestamps and feature labels.

---

## 6. Auth Lifecycle Integration (Auto-Provisioning)

In [server/src/core/auth/auth.ts](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/core/auth/auth.ts):

### Hook 1: Better-Auth User Creation Hook
```typescript
databaseHooks: {
  user: {
    create: {
      after: async (user: any) => {
        try {
          if (user?.id) {
            await planService.getOrCreateAccount(user.id);
            console.log(`[Plan Service] Provisioned Free Plan + 5,000 tokens for user ${user.id}`);
          }
        } catch (err) {
          console.error("[Plan Service] Failed to provision free plan:", err);
        }
      },
    },
  },
}
```

### Hook 2: OAuth Role Sync Plugin Hook
In `oauthRoleSyncPlugin.hooks.after`:
- Call `planService.getOrCreateAccount(user.id)` to guarantee OAuth sign-ins instantly have their 5,000 tokens provisioned prior to entering the dashboard.

---

## 7. REST API Endpoints Specification

Mounted under `/api/plan` in `server/src/server.ts`:

### 1. `GET /api/plan/status`
- **Auth**: Required (`requireAuth`)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "tier": "FREE",
      "status": "ACTIVE",
      "totalAllowance": 5000,
      "consumedTokens": 1200,
      "remainingTokens": 3800,
      "usagePercent": 24,
      "startedAt": "2026-10-12T14:00:00.000Z",
      "isExhausted": false
    }
  }
  ```

### 2. `GET /api/plan/usage`
- **Auth**: Required (`requireAuth`)
- **Query Params**: `page=1&limit=20`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "history": [
        {
          "feature": "RESUME_ATS",
          "tokensDeducted": 300,
          "balanceAfter": 3800,
          "description": "ATS Resume Diagnostic Scan",
          "createdAt": "2026-10-12T14:10:00.000Z"
        }
      ],
      "totalRecords": 1,
      "page": 1,
      "totalPages": 1
    }
  }
  ```

### 3. `GET /api/plan/pricing`
- **Auth**: Optional / Public
- **Response**: Returns tier configurations (`FREE`, `PRO`, `ENTERPRISE`) for rendering the upgrade matrix.

---

## 8. Backfill Migration Script (`backfill-free-tokens.ts`)

For all existing candidates already registered in MongoDB:
- Iterates over `UserModel.find({ role: UserRole.CANDIDATE })`.
- Checks if a `TokenAccount` exists; if not, creates one with 5,000 free tokens.
- Ensures zero downtime and zero legacy users left with a 0 token balance.

---

## 9. Verification & Acceptance Criteria for Phase 1

| Check | Success Criteria |
| :--- | :--- |
| **New User Registration** | New candidate registers -> immediately receives `FREE` subscription & 5,000 `remainingTokens`. |
| **Google OAuth Sign In** | New user authenticates via Google -> 5,000 tokens provisioned without manual intervention. |
| **Atomic Deduction** | `deductTokens(userId, 300, RESUME_ATS)` reduces `remainingTokens` to 4,700 and adds entry to `token_usage_logs`. |
| **Zero Token Rejection** | User with balance < requested cost throws `402 InsufficientTokensError`. |
| **Existing User Self-Healing** | Existing user calling `GET /api/plan/status` without pre-existing token record is automatically granted 5,000 tokens. |
| **Type Safety & Build** | `npm run build` in server compiles with 0 TypeScript or lint errors. |

---

## 10. Next Phases Preview

- **Phase 2 (AI Route Protection)**: Connect `checkTokenQuota` and `deductTokens` into Career Coach, Resume ATS, Tailored Resume Generator, and Mock Interviews.
- **Phase 3 (Frontend Rebranding & Upgrade UI)**:
  - Replace `Wallet & Tokens` in `UserMenu.tsx` with `Plan & Usage`.
  - Create `/dashboard/plan/page.tsx` with quota gauges and upgrade cards.
  - Build universal `<UpgradePlanModal />` that triggers when 0 tokens remain.
- **Phase 4 (Payment Gateway)**: Connect Stripe / Razorpay checkout sessions to activate the `PRO` tier.
