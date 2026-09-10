import { z } from "zod";
import { ResumeRecommendation } from "./recommendation.types";

export const AIRecommendationExplanationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
  explanation: z.string().min(1).max(1000).optional(),
  summary: z.string().min(1).max(1000).optional(),
  whyItMatters: z.string().min(1).max(1000).optional(),
  suggestedAction: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1).default(0.95),
}).refine((data) => data.explanation || data.summary, {
  message: "Either explanation or summary must be provided",
});

export class RecommendationValidator {
  /**
   * Sanitizes and verifies AI recommendations against strict factual guardrails.
   */
  public static validateRecommendation(
    rec: ResumeRecommendation,
    candidateEvidenceText = ""
  ): { isValid: boolean; sanitized: ResumeRecommendation; safetyFlags: string[] } {
    const safetyFlags: string[] = [];
    let isValid = true;
    const combinedText = `${rec.title} ${rec.summary} ${rec.whyItMatters} ${rec.suggestedAction || ""}`;

    // 1. Guardrail: Metric fabrication check
    // If recommendation text claims specific metrics, check if they exist in candidate evidence
    const metricMatches = combinedText.match(/\b\d+(?:\.\d+)?%|\$\d+[\d,]*|\b\d+x\b/gi) || [];
    for (const metric of metricMatches) {
      if (!candidateEvidenceText.toLowerCase().includes(metric.toLowerCase())) {
        // If it's in an illustrative example with "e.g.", it's safe guidance; if presented as candidate fact, flag it
        if (!combinedText.toLowerCase().includes("e.g.") && !combinedText.toLowerCase().includes("such as")) {
          safetyFlags.push(`UNSUPPORTED_METRIC_CLAIM: ${metric}`);
        }
      }
    }

    // 2. Guardrail: Defamatory / Accusatory language check
    const accusatoryPatterns = [
      /you\s+don'?t\s+know/i,
      /you\s+lack\s+intelligence/i,
      /you\s+failed\s+this/i,
      /your\s+experience\s+is\s+bad/i,
      /incompetent/i,
    ];
    for (const pat of accusatoryPatterns) {
      if (pat.test(combinedText)) {
        safetyFlags.push("ACCUSATORY_LANGUAGE_DETECTED");
        isValid = false;
      }
    }

    return {
      isValid,
      sanitized: {
        ...rec,
        safetyFlags,
      },
      safetyFlags,
    };
  }
}
