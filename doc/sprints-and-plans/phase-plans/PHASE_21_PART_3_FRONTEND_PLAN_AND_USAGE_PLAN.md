# Phase 21 (Part 3) — Frontend "Plan & Usage" UI, Quota Dashboard & Upgrade Paywall Plan

---

## 1. Executive Summary & Sprint Objectives

**Sprint:** 5  
**Phase:** 21 — Part 3 (Frontend Rebranding, Quota Dashboard & Global Upgrade Paywall)  
**Status:** 🟢 COMPLETED (Frontend Rebranding, Quota Dashboard & Upgrade Paywall)  
**Upstream Dependencies:**  
- Phase 21 Part 1 (Completed: Backend models, auto-provisioning of 5,000 free tokens, `/api/plan` endpoints, DB backfill)  
- Phase 21 Part 2 (Completed: `tokenGuard` middleware, AI route protection, `INSUFFICIENT_TOKENS` 402 contract, telemetry headers)  

### Core Objectives
1. **Completely Eliminate the "Wallet" UI**:
   - Rebrand navigation links from `Wallet & Tokens` with 👝 icon to **`Plan & Usage`** with ⚡ icon.
   - Redirect `/dashboard/wallet` to `/dashboard/plan` so legacy links and bookmarks never 404.
2. **Build the Dedicated `/dashboard/plan` Dashboard**:
   - **Active Plan Card**: Visual token quota gauge (e.g. `4,300 / 5,000 remaining`), usage percentage, and plan status badge.
   - **Interactive Pricing Matrix**: Side-by-side comparison of **Free Plan (Active)** vs. **SKILLEZO Pro** (₹399/mo, 100,000 monthly tokens) vs. **Enterprise**.
   - **Itemized Usage History Table**: Paginated audit log showing exact token deductions per feature with timestamps.
3. **Universal In-App Upgrade Modal (`<UpgradePlanModal />`)**:
   - Automatically triggered whenever any AI feature returns HTTP `402 INSUFFICIENT_TOKENS`.
   - Shows the attempted action (e.g., "AI Tailored Resume"), current balance, and one-click CTA to upgrade.
   - Zero disruption: seamlessly layers over the active workspace without losing user input or unsaved form state.

---

## 2. Architecture & Codebase Touchpoints (Phase 3)

```
SKILLEZO.AI Codebase (client/)
├── services/
│   └── plan.service.ts                                <-- [NEW] Client SDK for /api/plan endpoints
├── lib/
│   └── api.ts                                         <-- [UPDATE] Intercept 402 to dispatch 'skillezo:insufficient-tokens'
├── components/
│   ├── layout/
│   │   ├── UserMenu.tsx                               <-- [UPDATE] Replace "Wallet & Tokens" with "Plan & Usage"
│   │   └── AppLayout.tsx / Root Layout                <-- [MOUNT] Mount global <UpgradePlanModal />
│   └── dashboard/
│       └── plan/
│           ├── UpgradePlanModal.tsx                   <-- [NEW] Universal Paywall Modal
│           ├── PlanUsageGauge.tsx                     <-- [NEW] Visual circular / progress bar card
│           ├── PricingCardMatrix.tsx                  <-- [NEW] Free vs Pro comparison cards
│           └── TokenHistoryTable.tsx                  <-- [NEW] Paginated usage audit log table
└── app/
    └── dashboard/
        ├── plan/
        │   └── page.tsx                               <-- [NEW] Full Plan & Usage Dashboard Page
        └── wallet/
            └── page.tsx                               <-- [UPDATE] Redirect permanently to /dashboard/plan
```

---

## 3. Detailed Component Specifications

### 3.1 Client Plan SDK (`client/services/plan.service.ts`)
Standardized TypeScript service consuming `/api/plan` endpoints:

```typescript
export interface PlanDetails {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
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
  tier: string;
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

export interface TokenUsageLogItem {
  id: string;
  feature: string;
  tokensDeducted: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
```

Functions:
- `getPlanStatus()`: Fetches current plan tier, remaining token balance, and usage percentage.
- `getPricingPlans()`: Fetches tier comparison data and feature token costs.
- `getUsageHistory(page, limit)`: Fetches paginated usage audit logs.

---

### 3.2 Global 402 Event Interceptor (`client/lib/api.ts`)

Hook into `apiFetch` to broadcast when tokens are exhausted:
```typescript
if (response.status === 402 && code === "INSUFFICIENT_TOKENS") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("skillezo:insufficient-tokens", {
        detail: details || { required: 0, balance: 0, missing: 0 },
      })
    );
  }
}
```

Telemetry extraction:
```typescript
const tokensRemaining = response.headers.get("X-Tokens-Remaining");
if (tokensRemaining && typeof window !== "undefined") {
  window.dispatchEvent(
    new CustomEvent("skillezo:tokens-updated", {
      detail: { remaining: parseInt(tokensRemaining, 10) },
    })
  );
}
```

---

### 3.3 Navigation Update (`client/components/layout/UserMenu.tsx`)

Replace the old menu item:
```tsx
// BEFORE:
<Link href="/dashboard/wallet">
  <Wallet className="w-4 h-4 text-amber-500" />
  <span>Wallet & Tokens</span>
  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">Tokens</span>
</Link>

// AFTER:
<Link href="/dashboard/plan">
  <div className="flex items-center gap-2.5">
    <Zap className="w-4 h-4 text-[#3D5AFE]" />
    <span>Plan & Usage</span>
  </div>
  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3D5AFE]/10 text-[#3D5AFE] dark:bg-[#3D5AFE]/20">
    Free Plan
  </span>
</Link>
```

---

### 3.4 Dedicated Plan & Usage Page (`client/app/dashboard/plan/page.tsx`)

Sections:
1. **Header**: "Plan & AI Token Quota" with a quick snapshot of the active tier.
2. **Quota Overview Card**:
   - Modern visual progress bar: e.g. `4,300 / 5,000 Free Tokens Remaining`.
   - Percentage indicator with color shifts (Green > 40%, Amber 10-40%, Rose < 10%).
   - Direct "Upgrade Plan" CTA button.
3. **Plan Tier Comparison Grid**:
   - **Free Plan**: 5,000 welcome tokens, standard ATS diagnostic, 1 mock interview session.
   - **SKILLEZO Pro (₹399/mo)**: 100,000 monthly tokens, unlimited resume tailorings, unlimited voice/video mock interviews, deep career coach, recruiter spotlight.
   - **University / Enterprise**: Custom cohort pools & LMS integration.
4. **Token Usage History Table**:
   - Tabular view of consumed tokens (Feature, Tokens Deducted, Balance After, Timestamp).
   - Pagination controls (`Previous` / `Next`).

---

### 3.5 Universal Upgrade Modal (`<UpgradePlanModal />`)

- **Trigger**: Automatic on `skillezo:insufficient-tokens` or manual via button click.
- **Visuals**: High-conversion glassmorphic modal with glowing Pro badge.
- **Copy**:
  - Heading: *"You've unlocked great progress with your Free Plan!"*
  - Body: *"You need {missing} more tokens to execute this {featureName}. Upgrade to SKILLEZO Pro to receive 100,000 tokens every month and continue without interruptions."*
- **Action**: Direct button to checkout / plan selection.

---

### 3.6 Route Redirection (`client/app/dashboard/wallet/page.tsx`)

Replace the placeholder `ComingSoonModule`:
```tsx
import { redirect } from 'next/navigation';

export default function WalletPageRedirect() {
  redirect('/dashboard/plan');
}
```

---

## 4. Step-by-Step Implementation Roadmap for Phase 3

```
Phase 3 Execution Steps
├── Step 3.1: Create `client/services/plan.service.ts`
├── Step 3.2: Update `client/lib/api.ts` with 402 event dispatcher & header listener
├── Step 3.3: Create `<UpgradePlanModal />` in `client/components/dashboard/plan/`
├── Step 3.4: Create `/dashboard/plan/page.tsx` with quota gauge & comparison matrix
├── Step 3.5: Update `client/components/layout/UserMenu.tsx` ("Wallet & Tokens" -> "Plan & Usage")
├── Step 3.6: Update `/dashboard/wallet/page.tsx` to redirect to `/dashboard/plan`
└── Step 3.7: Client build check (`npm run build` or Next.js dev verification)
```

---

## 5. Safety & Quality Checklist

| Requirement | Implementation Detail |
| :--- | :--- |
| **Zero App Breakages** | Redirect `/dashboard/wallet` to `/dashboard/plan` prevents 404s. |
| **No Form State Loss** | `<UpgradePlanModal />` mounts as a floating portal; user form inputs remain intact in the background. |
| **Smooth UI Transitions** | Matches SKILLEZO AI dark/light theme tokens and glassmorphism styling. |
| **Zero Redundant Polling** | Uses `X-Tokens-Remaining` headers to update quotas reactively. |
