import Redis from "ioredis";
import { env } from "@/core/config/env";

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private memoryStore: Map<string, CacheEntry> = new Map();
  private redis: Redis | null = null;
  private isRedisReady: boolean = false;
  private maxMemoryEntries: number = 5000;
  private hasLoggedFallback: boolean = false;

  constructor() {
    this.initRedis();
  }

  private initRedis(): void {
    const redisUrl = env.REDIS_URL?.trim();

    if (!redisUrl) {
      if (!this.hasLoggedFallback && process.env.NODE_ENV !== "test") {
        console.log(
          "[Cache] No REDIS_URL configured. Operating in high-speed In-Memory Cache mode (100% Free, zero cloud bill)."
        );
        this.hasLoggedFallback = true;
      }
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        retryStrategy: (times) => {
          if (times > 3) {
            if (!this.hasLoggedFallback) {
              console.warn(
                "[Cache] Redis connection exceeded max retries. Gracefully falling back to In-Memory cache."
              );
              this.hasLoggedFallback = true;
            }
            return null; // Stop retrying
          }
          return Math.min(times * 1000, 3000);
        },
      });

      this.redis.on("connect", () => {
        this.isRedisReady = true;
        console.log("[Cache] Connected to Redis instance successfully.");
      });

      this.redis.on("ready", () => {
        this.isRedisReady = true;
      });

      this.redis.on("error", (err: Error) => {
        this.isRedisReady = false;
        if (!this.hasLoggedFallback) {
          console.warn(
            `[Cache] Redis error (${err.message}). Safely operating on In-Memory cache fallback.`
          );
          this.hasLoggedFallback = true;
        }
      });

      this.redis.on("close", () => {
        this.isRedisReady = false;
      });

      // Non-blocking background connect
      this.redis.connect().catch(() => {
        this.isRedisReady = false;
      });
    } catch (error: any) {
      this.isRedisReady = false;
      console.warn(
        `[Cache] Failed to initialize Redis client (${error?.message}). Defaulting to In-Memory cache.`
      );
    }
  }

  /**
   * Retrieves a cached value by key.
   * Checks Redis first if active, otherwise reads from fast in-memory store.
   */
  async get<T = string>(key: string): Promise<T | null> {
    if (this.isRedisReady && this.redis) {
      try {
        const val = await this.redis.get(key);
        if (val !== null) {
          try {
            return JSON.parse(val) as T;
          } catch {
            return val as unknown as T;
          }
        }
      } catch (err: any) {
        // Fall back gracefully to memory store on Redis read failure
        this.isRedisReady = false;
      }
    }

    // In-memory retrieval
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Sets a key-value pair in cache with specified TTL in seconds (defaults to 60s).
   */
  async set<T = any>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    // 1. Write to In-Memory cache
    this.ensureMemoryCapacity();
    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // 2. Write to Redis if active
    if (this.isRedisReady && this.redis) {
      try {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        await this.redis.set(key, serialized, "EX", ttlSeconds);
      } catch (err: any) {
        this.isRedisReady = false;
      }
    }
  }

  /**
   * Removes a key from both In-Memory store and Redis.
   */
  async del(key: string): Promise<void> {
    this.memoryStore.delete(key);

    if (this.isRedisReady && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        this.isRedisReady = false;
      }
    }
  }

  /**
   * Clears all in-memory keys (useful for testing or cache reset).
   */
  async clear(): Promise<void> {
    this.memoryStore.clear();
  }

  /**
   * Status checker: indicates whether distributed Redis is currently active.
   */
  isUsingRedis(): boolean {
    return this.isRedisReady;
  }

  /**
   * Prevents uncontrolled memory growth by pruning expired keys and enforcing max entry count.
   */
  private ensureMemoryCapacity(): void {
    if (this.memoryStore.size < this.maxMemoryEntries) return;

    const now = Date.now();
    // Prune all expired entries
    for (const [key, entry] of this.memoryStore.entries()) {
      if (now > entry.expiresAt) {
        this.memoryStore.delete(key);
      }
    }

    // If still at capacity, delete the oldest 20% of entries (FIFO/LRU behavior)
    if (this.memoryStore.size >= this.maxMemoryEntries) {
      const keysToDelete = Array.from(this.memoryStore.keys()).slice(
        0,
        Math.floor(this.maxMemoryEntries * 0.2)
      );
      for (const k of keysToDelete) {
        this.memoryStore.delete(k);
      }
    }
  }

  /**
   * Graceful cleanup when server shuts down.
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch {
        // Ignore disconnect errors during shutdown
      }
      this.isRedisReady = false;
    }
    this.memoryStore.clear();
  }
}

export const cacheService = new CacheService();
