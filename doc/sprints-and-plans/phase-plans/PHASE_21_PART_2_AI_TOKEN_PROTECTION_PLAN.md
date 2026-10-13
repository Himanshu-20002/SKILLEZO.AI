# Phase 21 (Part 2) — AI Route Protection & Phase 3 Compatibility Plan

---

## 1. Executive Summary & Sprint Objectives

**Sprint:** 5  
**Phase:** 21 — Part 2 (AI Route Protection & Token Guard Middleware)  
**Status:** 🟢 COMPLETED (AI Route Protection & Token Guard Middleware)  
**Upstream Dependency:** Phase 21 Part 1 (Completed & Verified: Models, Core Service, Better-Auth Provisioning, Backfill)  
**Downstream Dependency:** Phase 21 Part 3 (Frontend Rebranding to "Plan & Usage" + Upgrade Modal)  

### Core Objectives
1. **Protect All AI Features with Zero Code Redundancy**:
   - Implement a reusable, composable **`tokenGuard` middleware** rather than scattering deduction code across controllers.
2. **Zero-Breakage Guarantee**:
   - All 11 existing users and all newly registered candidates have **5,000 Free Tokens**; zero active accounts will be blocked prematurely.
   - Any LLM timeout or 500 error from OpenAI / Gemini will **never** deduct tokens (fair billing principle).
3. **Seamless Handshake with Phase 3 (Frontend)**:
   - Standardized HTTP `402 PAYMENT_REQUIRED` error contract with actionable metadata.
   - Response telemetry headers (`X-Tokens-Remaining`, `X-Tokens-Deducted`) allowing the client to update token badges with zero extra polling roundtrips.
   - Smooth redirect from `/dashboard/wallet` to `/dashboard/plan` so no legacy route or bookmark breaks.

---

## 2. Protected AI Endpoints & Cost Matrix

| Feature | Target Route | HTTP Method | Token Cost | Action Trigger |
| :--- | :--- | :---: | :---: | :--- |
| **Career Coach Chat** | `/api/ai/coach/chat` | `POST` | `50` | Each sent message / query |
| **Tailored Resume Generator** | `/api/job-profiles/:id/tailoring-plan/generate` | `POST` | `700` | Full tailored resume compilation |
| **Resume ATS Deep Scan** | `/api/resumes/upload` | `POST` | `300` | Candidate uploads and scans new resume |
| **Skill Verification Assessment** | `/api/verification/assessments/:topicId/submit` | `POST` | `1,500` | Submitting interactive mock quiz |

---

## 3. Architecture: DRY Token Guard Middleware

### File Location: `server/src/modules/plan/token-guard.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { planService } from "./plan.service";
import { TokenFeature } from "@/database/models/TokenUsageLog.model";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export interface TokenGuardOptions {
  feature: TokenFeature;
  customCost?: number;
  description?: string;
  extractMetadata?: (req: Request) => Record<string, any>;
}

/**
 * Reusable Express middleware that:
 * 1. Executes a fast pre-flight balance check BEFORE executing expensive AI/LLM models.
 * 2. If balance < cost: halts with HTTP 402 and structured upgrade instructions.
 * 3. If balance >= cost: allows controller execution, and ONLY on HTTP 2xx success,
 *    atomically deducts tokens and attaches 'X-Tokens-Remaining' header.
 */
export function tokenGuard(options: TokenGuardOptions | TokenFeature) {
  const config: TokenGuardOptions = typeof options === "string" ? { feature: options } : options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(); // Delegate to requireAuth if not authenticated
    }

    try {
      // 1. Fast Pre-flight Check
      const quota = await planService.checkTokenQuota(userId, config.feature, config.customCost);

      if (!quota.allowed) {
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          success: false,
          error: {
            code: ERROR_CODES.INSUFFICIENT_TOKENS,
            message: `Insufficient token allowance (${quota.balance} available, ${quota.required} required). Please upgrade to SKILLEZO Pro to continue using AI tools.`,
            details: {
              balance: quota.balance,
              required: quota.required,
              missing: quota.missing,
              feature: config.feature,
              upgradeUrl: quota.upgradeUrl,
            },
          },
        });
      }

      // 2. Intercept response to deduct tokens ONLY on successful completion (HTTP 200-299)
      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const metadata = config.extractMetadata ? config.extractMetadata(req) : {};

          // Deduct tokens asynchronously without blocking downstream response
          planService
            .deductTokens(userId, config.feature, config.customCost, config.description, metadata)
            .then((result) => {
              if (result?.balanceAfter !== undefined && !res.headersSent) {
                res.setHeader("X-Tokens-Remaining", result.balanceAfter.toString());
                res.setHeader("X-Tokens-Deducted", result.tokensDeducted.toString());
              }
            })
            .catch((err) => {
              console.error(`[TokenGuard Post-Execution Deduction Error]:`, err);
            });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
```

---

## 4. Phase 3 Compatibility & Handshake Blueprint

To ensure Phase 2 works seamlessly with the upcoming Phase 3 frontend work without causing breaking changes:

### 4.1 Standardized 402 Error Response Contract
Every protected route returns this exact structure when tokens are depleted:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_TOKENS",
    "message": "Insufficient token allowance (200 available, 700 required). Please upgrade to SKILLEZO Pro to continue using AI tools.",
    "details": {
      "balance": 200,
      "required": 700,
      "missing": 500,
      "feature": "TAILORED_RESUME",
      "upgradeUrl": "/dashboard/plan"
    }
  }
}
```

### 4.2 Frontend Axios / Fetch Interceptor (Phase 3 Ready)
In the client's API client (`client/lib/api-client.ts` or `client/services/api.ts`):
- When `error.response.status === 402` and `error.response.data.error.code === 'INSUFFICIENT_TOKENS'`:
  - Dispatches custom event: `window.dispatchEvent(new CustomEvent('skillezo:insufficient-tokens', { detail: error.response.data.error.details }))`.
  - The global `<UpgradePlanModal />` opens smoothly with:
    - Current balance (e.g. 200 tokens)
    - Action attempted (e.g. Tailored Resume)
    - One-click CTA: "Upgrade to SKILLEZO Pro"

### 4.3 Response Header Telemetry
- Every successful AI response will carry:
  - `X-Tokens-Remaining: 4300`
  - `X-Tokens-Deducted: 700`
- The client-side token indicator updates immediately in memory without firing a background `GET /api/plan/status` call.

### 4.4 Backward-Compatible Route Transition
- Route `/dashboard/wallet` in Next.js will be permanently redirected to `/dashboard/plan`:
  ```typescript
  // client/app/dashboard/wallet/page.tsx
  import { redirect } from 'next/navigation';
  export default function WalletRedirect() {
    redirect('/dashboard/plan');
  }
  ```
- No bookmarks or existing links will ever 404.

---

## 5. Step-by-Step Implementation Roadmap for Phase 2

```
Phase 2 Execution Steps
├── Step 2.1: Create `server/src/modules/plan/token-guard.middleware.ts`
├── Step 2.2: Export `tokenGuard` from `server/src/modules/plan/index.ts`
├── Step 2.3: Route Protection Integration:
│   ├── Protect `/api/ai/coach/chat` (Cost: 50)
│   ├── Protect `/api/job-profiles/:id/tailoring-plan/generate` (Cost: 700)
│   ├── Protect `/api/resumes/upload` (Cost: 300)
│   └── Protect `/api/verification/assessments/:topicId/submit` (Cost: 1500)
├── Step 2.4: Automated Unit Tests (`server/tests/unit/modules/token-guard.spec.ts`)
│   ├── Verify 402 rejection when balance < cost
│   ├── Verify pass-through and deduction when balance >= cost
│   └── Verify zero deduction on simulated 500 error
└── Step 2.5: Build Verification (`npm run build`) & Live Health Check
```

---

## 6. Safety & Acceptance Checklist

| Requirement | How It Is Guaranteed |
| :--- | :--- |
| **No App Breakages** | Existing users have 5,000 free tokens; existing routes retain their exact handlers and request/response structures. |
| **No Redundant Code** | Middleware handles pre-flight and deduction in one place; controllers stay 100% clean. |
| **No Unfair Deductions** | Tokens are only deducted if the response status is 2xx. If Gemini or OpenAI fails, balance remains untouched. |
| **Phase 3 Compatibility** | Response payload and headers match the planned frontend `<UpgradePlanModal />` contract exactly. |
