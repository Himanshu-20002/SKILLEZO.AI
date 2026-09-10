import {
  RecommendationSignal,
} from "./recommendation.types";

export class RecommendationGrouper {
  /**
   * Deterministically groups related signals by their groupKey to prevent recommendation explosion.
   */
  public static groupSignals(signals: RecommendationSignal[]): RecommendationSignal[] {
    const groupMap = new Map<string, RecommendationSignal[]>();

    signals.forEach((sig) => {
      const key = sig.groupKey || sig.id;
      const list = groupMap.get(key) || [];
      list.push(sig);
      groupMap.set(key, list);
    });

    const grouped: RecommendationSignal[] = [];

    groupMap.forEach((sigList, groupKey) => {
      if (sigList.length === 1) {
        grouped.push(sigList[0]);
        return;
      }

      // Merge multiple signals for the same target
      const primary = sigList[0];
      const maxSeverity = Math.max(...sigList.map((s) => s.severity));
      const maxRelevance = Math.max(...sigList.map((s) => s.relevance));
      const maxConfidence = Math.max(...sigList.map((s) => s.confidence));

      // Determine highest impact
      const impactLevels = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];
      let highestImpactIdx = 0;
      sigList.forEach((s) => {
        const idx = impactLevels.indexOf(s.impact);
        if (idx > highestImpactIdx) highestImpactIdx = idx;
      });
      const mergedImpact = impactLevels[highestImpactIdx] as any;

      // Determine most urgent actionability
      const actionabilityPriority = ["INFORMATIONAL", "REQUIRES_NEW_EVIDENCE", "STRENGTHEN_EVIDENCE", "FIX_NOW"];
      let highestActionIdx = 0;
      sigList.forEach((s) => {
        const idx = actionabilityPriority.indexOf(s.actionability);
        if (idx > highestActionIdx) highestActionIdx = idx;
      });
      const mergedActionability = actionabilityPriority[highestActionIdx] as any;

      const mergedSourceIds = Array.from(new Set(sigList.flatMap((s) => s.sourceIds)));
      const mergedEvidenceIds = Array.from(new Set(sigList.flatMap((s) => s.evidenceIds)));
      const mergedRequirementIds = Array.from(new Set(sigList.flatMap((s) => s.requirementIds || [])));
      const mergedSkillIds = Array.from(new Set(sigList.flatMap((s) => s.skillIds || [])));

      grouped.push({
        id: `grp_${groupKey.replace(/[^a-z0-9_]/gi, "_")}`,
        groupKey,
        category: primary.category,
        type: primary.type,
        severity: maxSeverity,
        impact: mergedImpact,
        relevance: maxRelevance,
        actionability: mergedActionability,
        confidence: maxConfidence,
        sourceIds: mergedSourceIds,
        evidenceIds: mergedEvidenceIds,
        requirementIds: mergedRequirementIds,
        skillIds: mergedSkillIds,
        section: primary.section,
        title: primary.title,
        problem: primary.problem,
        whyItMatters: primary.whyItMatters,
        suggestedAction: primary.suggestedAction,
      });
    });

    return grouped;
  }
}
