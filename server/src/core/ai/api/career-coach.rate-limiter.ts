import { Request, Response, NextFunction } from "express";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";

export interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
}

interface ClientRecord {
  timestamps: number[];
}

export class InMemoryRateLimiter {
  private readonly records = new Map<string, ClientRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(options?: RateLimiterOptions) {
    const envWindowMs = process.env.AI_RATE_LIMIT_WINDOW_MS
      ? parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS, 10)
      : undefined;
    const envMaxRequests = process.env.AI_RATE_LIMIT_MAX_REQUESTS
      ? parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS, 10)
      : undefined;

    this.windowMs = options?.windowMs ?? envWindowMs ?? 60_000; // 1 minute default
    this.maxRequests = options?.maxRequests ?? envMaxRequests ?? 20; // 20 requests/minute default

    // Periodically prune stale entries every 2 windows
    if (process.env.NODE_ENV !== "test") {
      this.cleanupInterval = setInterval(
        () => this.cleanup(),
        Math.max(this.windowMs * 2, 60_000)
      );
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || "unknown"}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      let record = this.records.get(key);
      if (!record) {
        record = { timestamps: [] };
        this.records.set(key, record);
      }

      // Filter timestamps within current rolling window
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

      const remaining = Math.max(0, this.maxRequests - record.timestamps.length);
      const oldestTimestamp = record.timestamps[0] ?? now;
      const resetTimeSeconds = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);

      res.setHeader("X-RateLimit-Limit", this.maxRequests);
      res.setHeader("X-RateLimit-Remaining", remaining > 0 ? remaining - 1 : 0);
      res.setHeader("X-RateLimit-Reset", Math.max(0, resetTimeSeconds));

      if (record.timestamps.length >= this.maxRequests) {
        res.setHeader("Retry-After", Math.max(1, resetTimeSeconds));
        return next(
          new AppError(
            `Career coach rate limit exceeded. Please wait ${Math.max(1, resetTimeSeconds)} seconds before trying again.`,
            429,
            "TOO_MANY_REQUESTS" as any,
            { retryAfterSeconds: Math.max(1, resetTimeSeconds) }
          )
        );
      }

      record.timestamps.push(now);
      next();
    };
  }

  public cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }

  public reset(): void {
    this.records.clear();
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.reset();
  }
}

export const careerCoachRateLimiter = new InMemoryRateLimiter().middleware();
