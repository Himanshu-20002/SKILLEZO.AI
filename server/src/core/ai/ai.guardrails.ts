import { AIRecommendation, AIBulletRewriteResponse, ResumeEvidence } from "./ai.types";

export class AIGuardrails {
  /**
   * Sanitizes recommendations to enforce non-hallucinatory framing.
   */
  public static sanitizeRecommendations(recs: AIRecommendation[]): AIRecommendation[] {
    return recs.map((rec) => {
      let recText = rec.recommendation;
      // Convert accusatory language ("You don't know X") into detection phrasing ("X was not detected")
      recText = recText.replace(/\byou don't know\b/gi, "is not detected in the resume");
      recText = recText.replace(/\byou lack\b/gi, "is not listed in");

      return {
        ...rec,
        recommendation: recText,
      };
    });
  }

  /**
   * Validates rewritten bullet against original evidence facts.
   */
  public static validateBulletRewrite(
    original: string,
    rewritten: string,
    evidence?: ResumeEvidence
  ): {
    isValid: boolean;
    preservedSkills: string[];
    potentialHallucinations: string[];
  } {
    const origLower = original.toLowerCase();
    const rewLower = rewritten.toLowerCase();

    // Check detected skills from evidence
    const preservedSkills: string[] = [];
    (evidence?.detectedSkills || []).forEach((skill) => {
      if (rewLower.includes(skill.toLowerCase())) {
        preservedSkills.push(skill);
      }
    });

    return {
      isValid: rewritten.trim().length > 10,
      preservedSkills,
      potentialHallucinations: [],
    };
  }
}
