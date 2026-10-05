import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "@/core/cache/cache.service";

describe("Zero-Cost Cache Service: In-Memory & Fallback Engine", () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  it("should operate in 100% free in-memory mode when REDIS_URL is not set", () => {
    expect(cache.isUsingRedis()).toBe(false);
  });

  it("should set and retrieve string values with near-instant latency", async () => {
    await cache.set("auth:status:user_123", "active", 60);
    const result = await cache.get<string>("auth:status:user_123");
    expect(result).toBe("active");
  });

  it("should set and retrieve structured JSON objects correctly", async () => {
    const payload = { userId: "user_456", role: "candidate", status: "active" };
    await cache.set("user:profile:user_456", payload, 60);

    const result = await cache.get<typeof payload>("user:profile:user_456");
    expect(result).toEqual(payload);
    expect(result?.role).toBe("candidate");
  });

  it("should return null for non-existent keys", async () => {
    const result = await cache.get("non:existent:key");
    expect(result).toBeNull();
  });

  it("should expire keys automatically after TTL elapses", async () => {
    vi.useFakeTimers();

    // Set with 2-second TTL
    await cache.set("auth:status:user_exp", "active", 2);

    // Immediately available
    expect(await cache.get("auth:status:user_exp")).toBe("active");

    // Advance clock by 3 seconds
    vi.advanceTimersByTime(3000);

    // Key should be expired and return null
    expect(await cache.get("auth:status:user_exp")).toBeNull();

    vi.useRealTimers();
  });

  it("should immediately invalidate and remove keys on del()", async () => {
    await cache.set("auth:status:user_del", "active", 60);
    expect(await cache.get("auth:status:user_del")).toBe("active");

    await cache.del("auth:status:user_del");
    expect(await cache.get("auth:status:user_del")).toBeNull();
  });

  it("should clear all cached items on clear()", async () => {
    await cache.set("key1", "val1", 60);
    await cache.set("key2", "val2", 60);

    await cache.clear();

    expect(await cache.get("key1")).toBeNull();
    expect(await cache.get("key2")).toBeNull();
  });
});
