import { CandidateEvidenceBundle } from "./types";
import { EvidenceCollector, EvidenceCollectorOptions } from "./evidence-collector";
import { EvidenceValidator } from "./evidence-validator";
import { EvidenceNormalizer } from "./evidence-normalizer";
import { EvidenceOwnershipError } from "./evidence-errors";

export class EvidenceBundleService {
  /**
   * Orchestrates full Evidence Pipeline:
   * Collection (from approved deterministic engines) ->
   * Validation (enforcing score bounds, provenance, anti-masquerade) ->
   * Normalization (deterministic IDs, deduplication, conflict preservation) ->
   * Verified Candidate Evidence Bundle
   */
  public static async buildCandidateEvidence(
    options: EvidenceCollectorOptions
  ): Promise<CandidateEvidenceBundle> {
    const { userId, targetRole } = options;

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new EvidenceOwnershipError(
        "Candidate identity must originate from authenticated context. Invalid or missing userId."
      );
    }

    // 1. Collect raw evidence items from authoritative deterministic engines
    const rawItems = await EvidenceCollector.collectRawEvidence(options);

    // 2. Actively validate all collected evidence items
    EvidenceValidator.validateAll(rawItems);

    // 3. Normalize into VerifiedEvidenceItem[], resolving duplicates and flagging conflicts
    const normalizedItems = EvidenceNormalizer.normalize(userId, rawItems);

    // 4. Calculate verification statistics
    const deterministicCount = normalizedItems.filter(
      (item) => item.evidenceType === "DETERMINISTIC"
    ).length;
    const extractedCount = normalizedItems.filter(
      (item) => item.evidenceType === "EXTRACTED"
    ).length;
    const reviewRequiredCount = normalizedItems.filter(
      (item) => item.verificationStatus === "REVIEW_REQUIRED"
    ).length;

    return {
      candidateId: userId,
      targetRole: targetRole || undefined,
      verifiedAt: new Date(),
      items: normalizedItems,
      stats: {
        total: normalizedItems.length,
        deterministicCount,
        extractedCount,
        reviewRequiredCount,
      },
    };
  }
}
