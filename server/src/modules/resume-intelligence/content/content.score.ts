import {
  ResumeBullet,
  BulletContentAnalysis,
  BulletClassification,
  SectionContentScore,
  ContentSignal,
  ContentOpportunity,
  ImpactSummary,
  ResumeContentAnalysisResult,
} from "./content.types";
import {
  CONTENT_ENGINE_VERSION,
  CONTENT_SCORING_WEIGHTS,
  SECTION_WEIGHTS,
  CONTENT_SCORE_LABELS,
} from "./content.constants";
import { ContentImpactDetector } from "./content.impact";
import { ContentBulletAnalyzer } from "./content.bullet";

export class ContentScoreEngine {
  /**
   * Deterministically analyzes each bullet and calculates component scores.
   */
  public static analyzeBullet(
    bullet: ResumeBullet,
    matchedRequirements: string[] = []
  ): BulletContentAnalysis {
    const text = bullet.sourceText;
    const textLower = text.toLowerCase();

    // 1. Action & Ownership
    const actionAnalysis = ContentBulletAnalyzer.analyzeActionAndOwnership(text);

    // 2. Specificity
    const specAnalysis = ContentBulletAnalyzer.analyzeSpecificity(text);

    // 3. Technical Depth
    const techAnalysis = ContentBulletAnalyzer.analyzeTechnicalDepth(text);

    // 4. Metrics & Scope
    const metrics = ContentImpactDetector.extractMetrics(text, bullet.bulletId);
    const scopes = ContentImpactDetector.extractScope(text);

    // 5. Outcome
    const outcomeAnalysis = ContentImpactDetector.detectOutcomes(text);
    let finalOutcomeScore = outcomeAnalysis.outcomeScore;

    // A quantified metric or scale represents concrete outcome/result
    if (metrics.length > 0 && finalOutcomeScore < 65) {
      finalOutcomeScore = 65;
    }

    // Compute metric score
    let measurableImpactScore = 0;
    if (metrics.length > 0) {
      const topConfidence = Math.max(...metrics.map((m) => m.confidence));
      measurableImpactScore = Math.round(topConfidence * 100);
    }

    // Compute scope score
    let scopeScore = 0;
    if (scopes.length > 0) {
      scopeScore = 85;
    } else if (metrics.some((m) => m.metricType === "SCALE")) {
      scopeScore = 75;
    }

    // Evidence Strength calculation (0–100)
    const evidenceStrengthScore = Math.round(
      actionAnalysis.actionScore * CONTENT_SCORING_WEIGHTS.ACTION_OWNERSHIP +
      specAnalysis.specificityScore * CONTENT_SCORING_WEIGHTS.SPECIFICITY +
      techAnalysis.technicalDepthScore * CONTENT_SCORING_WEIGHTS.TECHNICAL_DEPTH +
      finalOutcomeScore * CONTENT_SCORING_WEIGHTS.OUTCOME +
      measurableImpactScore * CONTENT_SCORING_WEIGHTS.MEASURABLE_IMPACT +
      scopeScore * CONTENT_SCORING_WEIGHTS.SCOPE
    );

    const qualityScore = evidenceStrengthScore;

    // Bullet Classifications
    const classifications: BulletClassification[] = [];
    if (metrics.length > 0) classifications.push("METRIC");
    if (outcomeAnalysis.hasOutcome || metrics.length > 0) classifications.push("IMPACT");
    if (techAnalysis.matchedKeywords.length > 0) classifications.push("TECHNICAL");
    if (actionAnalysis.isOwnership) classifications.push("OWNERSHIP");
    if (specAnalysis.genericPhrases.length > 0) classifications.push("GENERIC");

    // Responsibility vs Achievement
    if (actionAnalysis.isWeakAction || (!outcomeAnalysis.hasOutcome && metrics.length === 0)) {
      classifications.push("RESPONSIBILITY");
    }
    if ((outcomeAnalysis.hasOutcome || metrics.length > 0) && actionAnalysis.actionScore >= 70) {
      classifications.push("ACHIEVEMENT");
    }
    if (evidenceStrengthScore < 45 && !classifications.includes("ACHIEVEMENT")) {
      classifications.push("VAGUE");
    }

    // Compile Bullet Signals
    const signals: ContentSignal[] = [
      ...actionAnalysis.signals,
      ...specAnalysis.signals,
    ];

    if (metrics.length > 0) {
      signals.push({
        signalId: `sig_strong_metric_${bullet.bulletId}`,
        type: "STRONG_METRIC",
        severity: "LOW",
        evidenceIds: [bullet.bulletId],
        explanationCode: "METRIC_PRESENT",
        detail: `Contains measurable metric: ${metrics.map((m) => m.rawValue).join(", ")}`,
      });
    } else if (bullet.section === "EXPERIENCE" && evidenceStrengthScore < 50) {
      signals.push({
        signalId: `sig_no_metric_${bullet.bulletId}`,
        type: "NO_METRIC",
        severity: "MEDIUM",
        evidenceIds: [bullet.bulletId],
        explanationCode: "NO_METRIC_DETECTED",
        detail: "No quantified metric or scale detected for this achievement.",
      });
    }

    if (scopes.length > 0) {
      signals.push({
        signalId: `sig_scope_${bullet.bulletId}`,
        type: "STRONG_SCOPE",
        severity: "LOW",
        evidenceIds: [bullet.bulletId],
        explanationCode: "SCOPE_ESTABLISHED",
        detail: `Establishes magnitude/scope: ${scopes.map((s) => s.value).join(", ")}`,
      });
    }

    // Match requirement links
    const requirementLinks: string[] = [];
    matchedRequirements.forEach((req) => {
      if (textLower.includes(req.toLowerCase())) {
        requirementLinks.push(req);
      }
    });

    return {
      bulletId: bullet.bulletId,
      actionScore: actionAnalysis.actionScore,
      ownershipScore: actionAnalysis.ownershipScore,
      specificityScore: specAnalysis.specificityScore,
      outcomeScore: outcomeAnalysis.outcomeScore,
      measurableImpactScore,
      technicalDepthScore: techAnalysis.technicalDepthScore,
      relevanceScore: requirementLinks.length > 0 ? 90 : 60,
      evidenceStrengthScore,
      qualityScore,
      classification: Array.from(new Set(classifications)),
      signals,
      metricEvidence: metrics,
      scopeEvidence: scopes,
      requirementLinks,
      engineVersion: CONTENT_ENGINE_VERSION,
    };
  }

  /**
   * Aggregates all bullets into section scores, impact summary, opportunities, and overall content score.
   */
  public static aggregateContentAnalysis(
    bullets: ResumeBullet[],
    bulletAnalyses: BulletContentAnalysis[],
    matchedRequirements: string[] = []
  ): ResumeContentAnalysisResult {
    // 1. Group by section
    const expAnalyses = bulletAnalyses.filter((b) => b.bulletId.startsWith("exp_"));
    const projAnalyses = bulletAnalyses.filter((b) => b.bulletId.startsWith("proj_"));
    const sumAnalyses = bulletAnalyses.filter((b) => b.bulletId.startsWith("summary_"));

    const experienceSection = this.calculateSectionScore("EXPERIENCE", expAnalyses);
    const projectsSection = this.calculateSectionScore("PROJECTS", projAnalyses);
    const summarySection = this.calculateSectionScore("SUMMARY", sumAnalyses);

    // 2. Compute overall contentScore (0–100)
    let totalWeight = 0;
    let weightedSum = 0;

    if (experienceSection.bulletCount > 0) {
      weightedSum += experienceSection.score * SECTION_WEIGHTS.EXPERIENCE;
      totalWeight += SECTION_WEIGHTS.EXPERIENCE;
    }
    if (projectsSection.bulletCount > 0) {
      weightedSum += projectsSection.score * SECTION_WEIGHTS.PROJECTS;
      totalWeight += SECTION_WEIGHTS.PROJECTS;
    }
    if (summarySection.bulletCount > 0) {
      weightedSum += summarySection.score * SECTION_WEIGHTS.SUMMARY;
      totalWeight += SECTION_WEIGHTS.SUMMARY;
    }

    const contentScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 70;
    const label = this.getContentLabel(contentScore);

    // 3. Cross-bullet signals (repetition, duplicates)
    const repetitionSignals = ContentBulletAnalyzer.detectCrossBulletRepetition(bullets);
    const duplicateSignals = ContentBulletAnalyzer.detectDuplicates(bullets);

    const allSignals: ContentSignal[] = [
      ...bulletAnalyses.flatMap((b) => b.signals),
      ...repetitionSignals,
      ...duplicateSignals,
    ];

    const allMetrics = bulletAnalyses.flatMap((b) => b.metricEvidence);
    const allScopes = bulletAnalyses.flatMap((b) => b.scopeEvidence);

    // 4. Impact Summary Counts
    const impactSummary: ImpactSummary = {
      bulletsAnalyzed: bulletAnalyses.length,
      impactBullets: bulletAnalyses.filter((b) => b.classification.includes("IMPACT")).length,
      metricBackedBullets: bulletAnalyses.filter((b) => b.classification.includes("METRIC")).length,
      responsibilityFocusedBullets: bulletAnalyses.filter((b) =>
        b.classification.includes("RESPONSIBILITY")
      ).length,
      vagueBullets: bulletAnalyses.filter((b) => b.classification.includes("VAGUE")).length,
      highEvidenceBullets: bulletAnalyses.filter((b) => b.evidenceStrengthScore >= 75).length,
    };

    // 5. Build Content Opportunities for Phase 6
    const opportunities = this.buildContentOpportunities(
      bulletAnalyses,
      allSignals,
      matchedRequirements
    );

    return {
      contentScore,
      label,
      sections: {
        experience: experienceSection,
        projects: projectsSection,
        summary: summarySection,
      },
      bullets: bulletAnalyses,
      signals: allSignals,
      metrics: allMetrics,
      scopes: allScopes,
      impactSummary,
      opportunities,
      engineVersion: CONTENT_ENGINE_VERSION,
    };
  }

  private static calculateSectionScore(
    section: "EXPERIENCE" | "PROJECTS" | "SUMMARY",
    analyses: BulletContentAnalysis[]
  ): SectionContentScore {
    if (analyses.length === 0) {
      return {
        section,
        score: 70, // default neutral
        bulletCount: 0,
        averageEvidenceStrength: 70,
        strongBulletsCount: 0,
        weakBulletsCount: 0,
      };
    }

    const sum = analyses.reduce((acc, curr) => acc + curr.qualityScore, 0);
    const averageEvidenceStrength = Math.round(sum / analyses.length);
    const strongBulletsCount = analyses.filter((b) => b.evidenceStrengthScore >= 75).length;
    const weakBulletsCount = analyses.filter((b) => b.evidenceStrengthScore < 50).length;

    return {
      section,
      score: averageEvidenceStrength,
      bulletCount: analyses.length,
      averageEvidenceStrength,
      strongBulletsCount,
      weakBulletsCount,
    };
  }

  private static getContentLabel(score: number): string {
    const entry = CONTENT_SCORE_LABELS.find((l) => score >= l.min && score <= l.max);
    return entry ? entry.label : "Moderate Content";
  }

  private static buildContentOpportunities(
    bulletAnalyses: BulletContentAnalysis[],
    signals: ContentSignal[],
    matchedRequirements: string[]
  ): ContentOpportunity[] {
    const opportunities: ContentOpportunity[] = [];

    // 1. Weak Action Bullets Opportunity
    const weakActionBullets = bulletAnalyses.filter((b) =>
      b.signals.some((s) => s.type === "WEAK_ACTION")
    );
    if (weakActionBullets.length > 0) {
      opportunities.push({
        opportunityId: "opp_show_ownership",
        type: "SHOW_OWNERSHIP",
        priorityFactors: {
          roleRelevance: 0.85,
          matchImportance: 0.80,
          evidenceStrength: 0.40,
          contentQuality: 0.45,
        },
        bulletIds: weakActionBullets.map((b) => b.bulletId),
        requirementIds: weakActionBullets.flatMap((b) => b.requirementLinks),
        signalIds: weakActionBullets.flatMap((b) =>
          b.signals.filter((s) => s.type === "WEAK_ACTION").map((s) => s.signalId)
        ),
      });
    }

    // 2. High-Value Content Gap: Matched requirements supported by weak evidence bullets
    const weakMatchedBullets = bulletAnalyses.filter(
      (b) => b.requirementLinks.length > 0 && b.evidenceStrengthScore < 60
    );
    if (weakMatchedBullets.length > 0) {
      opportunities.push({
        opportunityId: "opp_strengthen_matched_evidence",
        type: "STRENGTHEN_TECHNICAL_DEPTH",
        priorityFactors: {
          roleRelevance: 0.95,
          matchImportance: 0.90,
          evidenceStrength: 0.45,
          contentQuality: 0.50,
        },
        bulletIds: weakMatchedBullets.map((b) => b.bulletId),
        requirementIds: weakMatchedBullets.flatMap((b) => b.requirementLinks),
        signalIds: weakMatchedBullets.flatMap((b) => b.signals.map((s) => s.signalId)),
      });
    }

    // 3. Bullets missing measurable impact
    const noMetricBullets = bulletAnalyses.filter((b) =>
      b.signals.some((s) => s.type === "NO_METRIC")
    );
    if (noMetricBullets.length > 0) {
      opportunities.push({
        opportunityId: "opp_add_measurable_impact",
        type: "ADD_MEASURABLE_IMPACT",
        priorityFactors: {
          roleRelevance: 0.80,
          matchImportance: 0.75,
          evidenceStrength: 0.50,
          contentQuality: 0.55,
        },
        bulletIds: noMetricBullets.slice(0, 5).map((b) => b.bulletId),
        requirementIds: noMetricBullets.flatMap((b) => b.requirementLinks),
        signalIds: noMetricBullets.flatMap((b) =>
          b.signals.filter((s) => s.type === "NO_METRIC").map((s) => s.signalId)
        ),
      });
    }

    return opportunities;
  }
}
