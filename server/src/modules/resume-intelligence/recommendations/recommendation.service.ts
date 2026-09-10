import {
  ResumeRecommendationResult,
} from "./recommendation.types";
import {
  RECOMMENDATION_ENGINE_VERSION,
  DEFAULT_RECOMMENDATION_LIMIT,
} from "./recommendation.constants";
import { RecommendationSignalCollector } from "./recommendation.signals";
import { RecommendationGrouper } from "./recommendation.grouping";
import { RecommendationPrioritizer } from "./recommendation.priority";
import { RecommendationValidator } from "./recommendation.validator";

export interface RecommendationServiceInput {
  atsResult?: any;
  skillProfile?: any;
  roleProfile?: any;
  jobRequirements?: any;
  matchResult?: any;
  contentResult?: any;
  rawText?: string;
  targetRole?: string;
}

export class RecommendationIntelligenceService {
  /**
   * Deterministically orchestrates recommendations across ATS, Skills, Role/JD Match, and Content.
   */
  public generateRecommendations(
    input: RecommendationServiceInput
  ): ResumeRecommendationResult {
    const targetRole = input.targetRole || "Full-Stack Engineer";

    // 1. Collect normalized signals across all deterministic engines
    const rawSignals = RecommendationSignalCollector.collectSignals(
      input.atsResult,
      input.skillProfile,
      input.matchResult,
      input.contentResult,
      targetRole
    );

    // 2. Group related signals to avoid duplicate recommendation explosion
    const groupedSignals = RecommendationGrouper.groupSignals(rawSignals);

    // 3. Deterministically calculate priority scores and rank recommendations
    const rankedRecs = RecommendationPrioritizer.rankRecommendations(groupedSignals);

    // 4. Validate guardrails and attach safety flags
    const validatedRecs = rankedRecs
      .map((rec) => RecommendationValidator.validateRecommendation(rec, input.rawText || ""))
      .filter((v) => v.isValid)
      .map((v) => v.sanitized);

    // 5. Select top recommendations according to default limit
    const topRecommendations = validatedRecs.slice(0, DEFAULT_RECOMMENDATION_LIMIT);

    // 6. Calculate summary counts
    const summary = {
      critical: topRecommendations.filter((r) => r.priority === "CRITICAL").length,
      high: topRecommendations.filter((r) => r.priority === "HIGH").length,
      medium: topRecommendations.filter((r) => r.priority === "MEDIUM").length,
      low: topRecommendations.filter((r) => r.priority === "LOW").length,
    };

    return {
      engineVersion: RECOMMENDATION_ENGINE_VERSION,
      generatedAt: new Date().toISOString(),
      recommendations: topRecommendations,
      summary,
      topAction: topRecommendations[0],
      sourceScores: {
        atsScore: input.atsResult?.overallScore || input.atsResult?.atsScore || 80,
        matchScore: input.matchResult?.overallMatchScore,
        contentScore: input.contentResult?.contentScore,
      },
    };
  }
}

export const recommendationIntelligenceService = new RecommendationIntelligenceService();
