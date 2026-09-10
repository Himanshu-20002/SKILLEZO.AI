import {
  RecommendationSignal,
  ResumeRecommendation,
  RecommendationPriority,
} from "./recommendation.types";
import {
  PRIORITY_WEIGHTS,
  IMPACT_FACTORS,
  ACTIONABILITY_FACTORS,
  RECOMMENDATION_ENGINE_VERSION,
} from "./recommendation.constants";

export class RecommendationPrioritizer {
  /**
   * Deterministically calculates priority scores and ranks recommendations.
   */
  public static rankRecommendations(
    signals: RecommendationSignal[]
  ): ResumeRecommendation[] {
    const recommendations: ResumeRecommendation[] = signals.map((sig) => {
      const impactFactor = IMPACT_FACTORS[sig.impact] ?? 0.50;
      const actionFactor = ACTIONABILITY_FACTORS[sig.actionability] ?? 0.50;
      const evidenceFactor = sig.actionability === "INFORMATIONAL"
        ? 0.50
        : sig.evidenceIds.length > 0
        ? 1.00
        : 0.60;

      // Formula: 30% Impact + 25% Relevance + 20% Actionability + 15% Confidence + 10% Evidence
      const priorityScore = Number(
        (
          impactFactor * PRIORITY_WEIGHTS.IMPACT +
          sig.relevance * PRIORITY_WEIGHTS.RELEVANCE +
          actionFactor * PRIORITY_WEIGHTS.ACTIONABILITY +
          sig.confidence * PRIORITY_WEIGHTS.CONFIDENCE +
          evidenceFactor * PRIORITY_WEIGHTS.EVIDENCE
        ).toFixed(3)
      );

      let priority: RecommendationPriority = "LOW";
      if (priorityScore >= 0.80 && sig.impact === "VERY_HIGH") {
        priority = "CRITICAL";
      } else if (priorityScore >= 0.65 && sig.impact !== "LOW" && sig.actionability !== "INFORMATIONAL") {
        priority = "HIGH";
      } else if (priorityScore >= 0.50 && sig.impact !== "LOW" && sig.actionability !== "INFORMATIONAL") {
        priority = "MEDIUM";
      } else {
        priority = "LOW";
      }

      return {
        id: sig.id,
        category: sig.category,
        title: sig.title,
        summary: sig.problem,
        whyItMatters: sig.whyItMatters,
        priority,
        impact: sig.impact,
        actionability: sig.actionability,
        effort: sig.actionability === "FIX_NOW" ? "LOW" : "MEDIUM",
        confidence: sig.confidence,
        priorityScore,
        sourceIds: sig.sourceIds,
        evidenceIds: sig.evidenceIds,
        requirementIds: sig.requirementIds,
        skillIds: sig.skillIds,
        affectedSections: sig.section ? [sig.section] : [],
        status: "OPEN",
        suggestedAction: sig.suggestedAction,
        engineVersion: RECOMMENDATION_ENGINE_VERSION,
      };
    });

    // Deterministic stable sorting
    return recommendations.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      const impactOrder = { VERY_HIGH: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const impactDiff = (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
      if (impactDiff !== 0) return impactDiff;

      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return a.id.localeCompare(b.id);
    });
  }
}
