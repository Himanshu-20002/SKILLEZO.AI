import { RawEvidenceItem, VerifiedEvidenceItem } from "./types";
import crypto from "crypto";

export class EvidenceNormalizer {
  /**
   * Normalizes raw validated evidence items into standard VerifiedEvidenceItem[],
   * generating deterministic IDs, detecting duplicates, and flagging conflicts as REVIEW_REQUIRED.
   */
  public static normalize(
    candidateId: string,
    rawItems: RawEvidenceItem[]
  ): VerifiedEvidenceItem[] {
    const evidenceMap = new Map<string, VerifiedEvidenceItem>();

    for (const raw of rawItems) {
      const sourceId = raw.sourceId || "global";
      const key = `${raw.sourceEngine}:${raw.sourceEntity}:${sourceId}:${raw.metric.toLowerCase()}`;
      const extractedAt = raw.extractedAt || new Date();

      const existing = evidenceMap.get(key);

      if (!existing) {
        // First occurrence
        const item: VerifiedEvidenceItem = {
          id: this.generateEvidenceId(candidateId, raw.sourceEngine, raw.metric, sourceId),
          sourceEngine: raw.sourceEngine,
          sourceEntity: raw.sourceEntity,
          sourceId: raw.sourceId,
          metric: raw.metric,
          value: raw.value,
          evidenceType: raw.evidenceType,
          verificationStatus: raw.verificationStatus || (raw.evidenceType === "DETERMINISTIC" ? "VERIFIED" : "UNVERIFIED"),
          description: raw.description,
          extractedAt,
        };
        evidenceMap.set(key, item);
      } else {
        // Duplicate key encountered: Check if value is identical or conflicting
        const isValueIdentical = this.deepEqual(existing.value, raw.value);

        if (isValueIdentical) {
          // Exact duplicate: preserve existing (latest extractedAt timestamp if newer)
          if (extractedAt > existing.extractedAt) {
            existing.extractedAt = extractedAt;
          }
        } else {
          // Conflicting evidence: mark as REVIEW_REQUIRED and record conflict details
          existing.verificationStatus = "REVIEW_REQUIRED";
          existing.conflictDetails = `Conflicting evidence detected for metric "${raw.metric}" from "${raw.sourceEngine}": ${JSON.stringify(existing.value)} vs ${JSON.stringify(raw.value)}`;
          console.warn(`[EvidenceNormalizer] ${existing.conflictDetails}`);
        }
      }
    }

    return Array.from(evidenceMap.values());
  }

  private static generateEvidenceId(
    candidateId: string,
    sourceEngine: string,
    metric: string,
    sourceId: string
  ): string {
    const raw = `${candidateId}:${sourceEngine}:${metric}:${sourceId}`;
    const hash = crypto.createHash("sha256").update(raw).digest("hex").substring(0, 12);
    return `ev_${sourceEngine.toLowerCase()}_${metric.toLowerCase()}_${hash}`;
  }

  private static deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a === "object" && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }
}
