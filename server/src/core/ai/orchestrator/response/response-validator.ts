import {
  AIOrchestrationResult,
  StructuredMetricItem,
  OrchestrationEvidenceItem,
} from "./response-types";
import { VerifiedEvidenceEntry } from "../context/orchestration-context";

export class ResponseValidator {
  /**
   * Semantically validates model response:
   * 1. Structured metrics are matched against real verified deterministic values (not hallucinated).
   * 2. Evidence references in insights and recommendations are verified.
   * 3. Pre-existing tool failure limitations are merged.
   */
  public static validate(
    result: AIOrchestrationResult,
    verifiedEvidence: VerifiedEvidenceEntry[],
    runtimeLimitations: string[]
  ): AIOrchestrationResult {
    const verifiedMap = new Map<string, VerifiedEvidenceEntry>();
    for (const ev of verifiedEvidence) {
      verifiedMap.set(ev.id, ev);
    }

    const mergedLimitations = [...result.limitations];
    for (const lim of runtimeLimitations) {
      if (!mergedLimitations.includes(lim)) {
        mergedLimitations.push(lim);
      }
    }

    // 1. Validate Structured Metrics against verified evidence
    const validatedMetrics: StructuredMetricItem[] = [];
    for (const metric of result.metrics) {
      const verified = verifiedMap.get(metric.evidenceId);

      if (!verified) {
        mergedLimitations.push(
          `Removed unverified metric "${metric.name}": references unknown evidence ID "${metric.evidenceId}".`
        );
        continue;
      }

      if (verified.numericValue !== undefined) {
        // Tolerant to floating point rounding (within 0.1)
        if (Math.abs(metric.value - verified.numericValue) > 0.1) {
          mergedLimitations.push(
            `Removed unverified metric "${metric.name}": proposed value ${metric.value} diverges from deterministic value ${verified.numericValue}.`
          );
          continue;
        }
      }

      validatedMetrics.push(metric);
    }

    // 2. Validate Evidence items returned by the model
    // Ensure all returned evidence items actually exist in the verified collection
    const validatedEvidence: OrchestrationEvidenceItem[] = verifiedEvidence.map((ev) => ({
      id: ev.id,
      type: ev.type,
      source: ev.source,
      summary: ev.summary,
    }));

    // 3. Filter invalid evidence IDs from insights
    const validatedInsights = result.insights.map((insight) => ({
      ...insight,
      evidenceIds: insight.evidenceIds.filter((id) => verifiedMap.has(id)),
    }));

    // 4. Filter invalid evidence IDs from recommendations
    const validatedRecommendations = result.recommendations.map((rec) => ({
      ...rec,
      evidenceIds: rec.evidenceIds
        ? rec.evidenceIds.filter((id) => verifiedMap.has(id))
        : undefined,
    }));

    return {
      ...result,
      metrics: validatedMetrics,
      evidence: validatedEvidence,
      insights: validatedInsights,
      recommendations: validatedRecommendations,
      limitations: mergedLimitations,
    };
  }
}
