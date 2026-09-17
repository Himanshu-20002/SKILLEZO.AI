import {
  RawEvidenceItem,
  APPROVED_DETERMINISTIC_ENGINES,
  EvidenceType,
  VerificationStatus,
} from "./types";
import { EvidenceValidationError } from "./evidence-errors";

const VALID_EVIDENCE_TYPES: Set<EvidenceType> = new Set([
  "DETERMINISTIC",
  "EXTRACTED",
  "AI_GENERATED",
]);

const VALID_VERIFICATION_STATUSES: Set<VerificationStatus> = new Set([
  "VERIFIED",
  "UNVERIFIED",
  "REVIEW_REQUIRED",
]);

export class EvidenceValidator {
  /**
   * Actively validates a single raw evidence item against strict provenance,
   * score bounds, and source integrity rules.
   */
  public static validateItem(item: RawEvidenceItem): void {
    // 1. Required field checks
    if (!item) {
      throw new EvidenceValidationError("Evidence item cannot be null or undefined");
    }

    if (!item.sourceEngine || typeof item.sourceEngine !== "string" || item.sourceEngine.trim().length === 0) {
      throw new EvidenceValidationError("Evidence item must have a valid non-empty sourceEngine", item);
    }

    if (!item.sourceEntity || typeof item.sourceEntity !== "string" || item.sourceEntity.trim().length === 0) {
      throw new EvidenceValidationError("Evidence item must have a valid non-empty sourceEntity", item);
    }

    if (!item.metric || typeof item.metric !== "string" || item.metric.trim().length === 0) {
      throw new EvidenceValidationError("Evidence item must have a valid non-empty metric name", item);
    }

    if (item.value === undefined || item.value === null) {
      throw new EvidenceValidationError(`Evidence metric "${item.metric}" has null or undefined value`, item);
    }

    // 2. EvidenceType validation
    if (!VALID_EVIDENCE_TYPES.has(item.evidenceType)) {
      throw new EvidenceValidationError(
        `Unsupported evidenceType: "${item.evidenceType}". Allowed: ${Array.from(VALID_EVIDENCE_TYPES).join(", ")}`,
        item
      );
    }

    // 3. VerificationStatus validation
    const status = item.verificationStatus || (item.evidenceType === "DETERMINISTIC" ? "VERIFIED" : "UNVERIFIED");
    if (!VALID_VERIFICATION_STATUSES.has(status)) {
      throw new EvidenceValidationError(
        `Unsupported verificationStatus: "${status}". Allowed: ${Array.from(VALID_VERIFICATION_STATUSES).join(", ")}`,
        item
      );
    }

    // 4. Deterministic protection
    if (item.evidenceType === "DETERMINISTIC") {
      const isApprovedEngine = APPROVED_DETERMINISTIC_ENGINES.some(
        (engine) => engine === item.sourceEngine
      );
      if (!isApprovedEngine) {
        throw new EvidenceValidationError(
          `Deterministic evidence claims unapproved sourceEngine: "${item.sourceEngine}". Approved engines: ${APPROVED_DETERMINISTIC_ENGINES.join(", ")}`,
          item
        );
      }

      if (status !== "VERIFIED") {
        throw new EvidenceValidationError(
          `Deterministic evidence from approved engine "${item.sourceEngine}" must have verificationStatus "VERIFIED", got "${status}"`,
          item
        );
      }
    }

    // 5. Anti-masquerade rule: AI-generated content cannot be marked as verified deterministic truth
    if (item.evidenceType === "AI_GENERATED" && status === "VERIFIED") {
      throw new EvidenceValidationError(
        `AI_GENERATED evidence cannot be marked as VERIFIED source of truth for metric "${item.metric}"`,
        item
      );
    }

    // 6. Score and Numeric Range Validation
    if (typeof item.value === "number") {
      if (Number.isNaN(item.value)) {
        throw new EvidenceValidationError(`Evidence metric "${item.metric}" cannot be NaN`, item);
      }

      const metricLower = item.metric.toLowerCase();
      const isPercentageOrScore =
        metricLower.includes("score") ||
        metricLower.includes("percent") ||
        metricLower.includes("compatibility") ||
        metricLower.includes("rate");

      if (isPercentageOrScore) {
        if (item.value < 0 || item.value > 100) {
          throw new EvidenceValidationError(
            `Metric "${item.metric}" score value ${item.value} is out of bounds [0, 100]. Deterministic values must never be silently clamped.`,
            item
          );
        }
      }
    }
  }

  /**
   * Validates an entire array of raw evidence items.
   */
  public static validateAll(items: RawEvidenceItem[]): void {
    if (!Array.isArray(items)) {
      throw new EvidenceValidationError("Evidence items must be an array");
    }
    for (const item of items) {
      this.validateItem(item);
    }
  }
}
