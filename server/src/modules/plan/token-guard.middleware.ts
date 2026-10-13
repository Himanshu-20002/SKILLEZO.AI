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
 * Reusable, composable Express middleware for protecting AI routes with token quotas:
 * 1. Executes a fast pre-flight balance check BEFORE executing expensive AI/LLM models.
 * 2. If balance < cost: immediately halts with HTTP 402 and structured upgrade instructions.
 * 3. If balance >= cost: permits execution. Only upon HTTP 2xx completion, atomically deducts
 *    tokens and attaches telemetry headers ('X-Tokens-Remaining', 'X-Tokens-Deducted').
 */
export function tokenGuard(options: TokenGuardOptions | TokenFeature) {
  const config: TokenGuardOptions = typeof options === "string" ? { feature: options } : options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      return next(); // Let requireAuth or downstream auth handle unauthenticated contexts
    }

    try {
      // 1. Fast Pre-flight Check
      const quota = await planService.checkTokenQuota(userId, config.feature, config.customCost);

      if (!quota.allowed) {
        res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
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
        return;
      }

      // 2. Track deduction idempotency per request (supports both JSON and SSE streams)
      let isDeducted = false;

      const triggerDeduction = () => {
        if (isDeducted) return;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          isDeducted = true;
          const metadata = config.extractMetadata ? config.extractMetadata(req) : {};

          planService
            .deductTokens(userId, config.feature, config.customCost, config.description, metadata)
            .then((result) => {
              if (result?.balanceAfter !== undefined && !res.headersSent) {
                try {
                  res.setHeader("X-Tokens-Remaining", result.balanceAfter.toString());
                  res.setHeader("X-Tokens-Deducted", result.tokensDeducted.toString());
                } catch (_) {
                  // Headers might already be sent in streaming scenarios, ignore
                }
              }
            })
            .catch((err) => {
              console.error(`[TokenGuard Post-Execution Deduction Error]:`, err?.message || err);
            });
        }
      };

      // Intercept standard res.json
      const originalJson = res.json.bind(res);
      res.json = function (body: any) {
        triggerDeduction();
        return originalJson(body);
      };

      // Intercept stream completion (SSE / chunked responses)
      res.on("finish", () => {
        triggerDeduction();
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
