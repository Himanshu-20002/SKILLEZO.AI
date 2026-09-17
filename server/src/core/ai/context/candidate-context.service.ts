import { performance } from "perf_hooks";
import { CandidateContextSnapshot, CacheTelemetry } from "./candidate-context.types";
import { ContextComposer } from "./context-composer";
import { candidateContextCache } from "./context-cache";
import { EvidenceBundleService } from "../evidence/evidence-bundle";
import { EvidenceOwnershipError } from "../evidence/evidence-errors";
import { ProfileModel } from "@/database/models/Profile.model";
import { ResumeModel } from "@/database/models/Resume.model";

export interface GetContextSnapshotOptions {
  userId: string;
  targetRole?: string;
  forceRefresh?: boolean;
}

export class CandidateContextService {
  /**
   * Retrieves or builds the complete verified Candidate Context Snapshot.
   * Leverages caching to prevent redundant database and deterministic engine hydration.
   *
   * Security Rule: userId MUST originate from authenticated server context (e.g. req.user.id).
   */
  public static async getContextSnapshot(
    options: GetContextSnapshotOptions
  ): Promise<CandidateContextSnapshot> {
    const { userId, targetRole, forceRefresh = false } = options;

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new EvidenceOwnershipError(
        "Candidate identity must originate from authenticated context. Invalid or missing userId."
      );
    }

    // 1. Check cache first (unless forceRefresh is true)
    if (!forceRefresh) {
      const cached = await candidateContextCache.get(userId, targetRole);
      if (cached) {
        return cached;
      }
    }

    // 2. Cache Miss: Measure generation latency
    const startTime = performance.now();

    // 3. Fetch Candidate Profile & Active Resume
    const profile = await ProfileModel.findOne({ userId }).lean();
    const resume =
      (await ResumeModel.findOne({ userId, isDefault: true }).lean()) ||
      (await ResumeModel.findOne({ userId }).sort({ updatedAt: -1 }).lean());

    // 4. Gather & normalize deterministic evidence bundle
    const evidenceBundle = await EvidenceBundleService.buildCandidateEvidence({
      userId,
      targetRole,
    });

    const generationLatencyMs = Math.round(performance.now() - startTime);

    // 5. Compose deterministic snapshot
    const snapshot = ContextComposer.compose({
      candidateId: userId,
      targetRole,
      profile,
      resume,
      evidenceBundle,
      generationLatencyMs,
    });

    // 6. Cache the assembled snapshot
    await candidateContextCache.set(userId, snapshot);
    candidateContextCache.recordGeneration(generationLatencyMs);

    return snapshot;
  }

  /**
   * Invalidate candidate context on mutations (e.g. profile update, resume upload, skills update).
   */
  public static async invalidateCandidateContext(userId: string): Promise<number> {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new EvidenceOwnershipError("Invalid or missing candidate userId for cache invalidation.");
    }
    return candidateContextCache.invalidate(userId);
  }

  /**
   * Returns cache & generation telemetry metrics.
   */
  public static getTelemetry(): CacheTelemetry {
    return candidateContextCache.getTelemetry();
  }
}
