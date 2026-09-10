import {
  MATCH_STATUS_WEIGHTS,
  MATCH_SCORE_CATEGORY_WEIGHTS,
  getMatchStrengthLabel,
} from "./match.constants";
import { RequirementMatchResult, MatchStrengthLabel } from "./match.types";

export class ScoreEngine {
  /**
   * Computes deterministic coverage and overall match score (0–100).
   */
  public static computeScores(
    skillMatches: RequirementMatchResult[],
    experienceMatches: RequirementMatchResult[],
    educationMatches: RequirementMatchResult[],
    certificationMatches: RequirementMatchResult[]
  ): {
    overallMatchScore: number;
    requiredCoverage: number;
    preferredCoverage: number;
    experienceMatch: number;
    educationCoverage: number;
    certificationCoverage: number;
    matchStrengthLabel: MatchStrengthLabel;
    summary: {
      totalRequirements: number;
      matched: number;
      partial: number;
      related: number;
      notDetected: number;
    };
  } {
    const allMatches = [
      ...skillMatches,
      ...experienceMatches,
      ...educationMatches,
      ...certificationMatches,
    ];

    let matchedCount = 0;
    let partialCount = 0;
    let relatedCount = 0;
    let notDetectedCount = 0;

    for (const m of allMatches) {
      if (m.status === "MATCHED") matchedCount++;
      else if (m.status === "PARTIAL") partialCount++;
      else if (m.status === "RELATED") relatedCount++;
      else notDetectedCount++;
    }

    // 1. Required Skill Coverage
    const requiredSkills = skillMatches.filter((s) => s.requirementType === "REQUIRED");
    let reqScore = 0;
    if (requiredSkills.length > 0) {
      const satisfied = requiredSkills.reduce((acc, s) => acc + (MATCH_STATUS_WEIGHTS[s.status] || 0), 0);
      reqScore = Math.min(100, Math.round((satisfied / requiredSkills.length) * 100));
    } else {
      reqScore = 100; // no required skills specified
    }

    // 2. Preferred Skill Coverage
    const preferredSkills = skillMatches.filter((s) => s.requirementType === "PREFERRED");
    let prefScore = 0;
    if (preferredSkills.length > 0) {
      const satisfied = preferredSkills.reduce((acc, s) => acc + (MATCH_STATUS_WEIGHTS[s.status] || 0), 0);
      prefScore = Math.min(100, Math.round((satisfied / preferredSkills.length) * 100));
    } else {
      prefScore = 80; // neutral default when preferred is omitted
    }

    // 3. Experience Match
    let expScore = 80;
    if (experienceMatches.length > 0) {
      const satisfied = experienceMatches.reduce((acc, e) => acc + (MATCH_STATUS_WEIGHTS[e.status] || 0), 0);
      expScore = Math.min(100, Math.round((satisfied / experienceMatches.length) * 100));
    }

    // 4. Education & Certification Coverage
    let eduScore = 85;
    if (educationMatches.length > 0) {
      const satisfied = educationMatches.reduce((acc, e) => acc + (MATCH_STATUS_WEIGHTS[e.status] || 0), 0);
      eduScore = Math.min(100, Math.round((satisfied / educationMatches.length) * 100));
    }

    let certScore = 85;
    if (certificationMatches.length > 0) {
      const satisfied = certificationMatches.reduce((acc, c) => acc + (MATCH_STATUS_WEIGHTS[c.status] || 0), 0);
      certScore = Math.min(100, Math.round((satisfied / certificationMatches.length) * 100));
    }

    const eduCertComposite = Math.round((eduScore + certScore) / 2);

    // 5. Composite Weighted Overall Match Score
    const overallMatchScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(
          reqScore * MATCH_SCORE_CATEGORY_WEIGHTS.REQUIRED_SKILLS +
            prefScore * MATCH_SCORE_CATEGORY_WEIGHTS.PREFERRED_SKILLS +
            expScore * MATCH_SCORE_CATEGORY_WEIGHTS.EXPERIENCE +
            eduCertComposite * MATCH_SCORE_CATEGORY_WEIGHTS.EDUCATION_CERTS
        )
      )
    );

    const matchStrengthLabel = getMatchStrengthLabel(overallMatchScore);

    return {
      overallMatchScore,
      requiredCoverage: reqScore,
      preferredCoverage: prefScore,
      experienceMatch: expScore,
      educationCoverage: eduScore,
      certificationCoverage: certScore,
      matchStrengthLabel,
      summary: {
        totalRequirements: allMatches.length,
        matched: matchedCount,
        partial: partialCount,
        related: relatedCount,
        notDetected: notDetectedCount,
      },
    };
  }
}
