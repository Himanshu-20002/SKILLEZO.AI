import { env } from "@/core/config/env";
import { CandidateContextSnapshot, CacheTelemetry } from "./candidate-context.types";

interface CacheEntry {
  snapshot: CandidateContextSnapshot;
  expiresAt: number;
}

export class CandidateContextCache {
  private static instance: CandidateContextCache;
  private readonly store = new Map<string, CacheEntry>();

  // Telemetry metrics
  private hits = 0;
  private misses = 0;
  private totalGenerations = 0;
  private totalLatencyMs = 0;

  private constructor() {}

  public static getInstance(): CandidateContextCache {
    if (!CandidateContextCache.instance) {
      CandidateContextCache.instance = new CandidateContextCache();
    }
    return CandidateContextCache.instance;
  }

  /**
   * Normalizes candidateId and targetRole into a collision-free cache key.
   */
  public static buildKey(candidateId: string, targetRole?: string): string {
    const normalizedCandidateId = candidateId.trim();
    const normalizedRole = (targetRole || "default").trim().toLowerCase().replace(/\s+/g, "_");
    return `ai:candidate-context:${normalizedCandidateId}:${normalizedRole}`;
  }

  /**
   * Retrieves a cached snapshot if present and not expired.
   */
  public async get(
    candidateId: string,
    targetRole?: string
  ): Promise<CandidateContextSnapshot | null> {
    const key = CandidateContextCache.buildKey(candidateId, targetRole);
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      // Expired: delete and count as miss
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.snapshot;
  }

  /**
   * Stores a candidate context snapshot in cache with an expiration TTL.
   */
  public async set(
    candidateId: string,
    snapshot: CandidateContextSnapshot,
    ttlSeconds?: number
  ): Promise<void> {
    const key = CandidateContextCache.buildKey(candidateId, snapshot.targetRole);
    const effectiveTtlSeconds =
      ttlSeconds !== undefined
        ? ttlSeconds
        : parseInt(env.AI_CONTEXT_CACHE_TTL_SECONDS || "600", 10);

    const expiresAt = Date.now() + Math.max(1, effectiveTtlSeconds) * 1000;

    this.store.set(key, {
      snapshot,
      expiresAt,
    });
  }

  /**
   * Invalidates all cached context snapshots for a candidate across all target roles.
   * Typically invoked after candidate mutations (profile update, resume upload, etc.)
   */
  public async invalidate(candidateId: string): Promise<number> {
    const prefix = `ai:candidate-context:${candidateId.trim()}:`;
    let invalidatedCount = 0;

    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  /**
   * Records context generation telemetry.
   */
  public recordGeneration(latencyMs: number): void {
    this.totalGenerations++;
    this.totalLatencyMs += latencyMs;
  }

  /**
   * Returns current cache telemetry metrics.
   */
  public getTelemetry(): CacheTelemetry {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? Number((this.hits / totalRequests).toFixed(4)) : 0;
    const averageLatencyMs =
      this.totalGenerations > 0
        ? Number((this.totalLatencyMs / this.totalGenerations).toFixed(2))
        : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      itemCount: this.store.size,
      totalGenerations: this.totalGenerations,
      averageLatencyMs,
    };
  }

  /**
   * Clears the entire cache (primarily for tests).
   */
  public clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.totalGenerations = 0;
    this.totalLatencyMs = 0;
  }
}

export const candidateContextCache = CandidateContextCache.getInstance();
