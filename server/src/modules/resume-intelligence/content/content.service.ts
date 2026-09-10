import { ResumeContentAnalysisResult } from "./content.types";
import { ContentBulletAnalyzer } from "./content.bullet";
import { ContentScoreEngine } from "./content.score";

export class ContentIntelligenceService {
  /**
   * Deterministically evaluates the quality, specificity, action ownership,
   * technical depth, and measurable impact of resume content.
   */
  public analyzeContent(
    extractedData: any,
    rawText?: string,
    targetRole = "Full-Stack Engineer",
    matchResult?: any
  ): ResumeContentAnalysisResult {
    // 1. Extract bullets deterministically across experience, projects, and summary
    const bullets = ContentBulletAnalyzer.extractBullets(extractedData);

    // 2. Identify relevant matched requirements for content evidence mapping
    const matchedRequirements: string[] = [];
    if (matchResult?.skillBreakdown?.matched) {
      matchResult.skillBreakdown.matched.forEach((m: any) => {
        if (m.canonicalName) matchedRequirements.push(m.canonicalName);
      });
    } else if (Array.isArray(extractedData?.skills)) {
      extractedData.skills.forEach((s: any) => {
        const name = typeof s === "string" ? s : s.name;
        if (name) matchedRequirements.push(name);
      });
    }

    // 3. Deterministically analyze each individual bullet
    const bulletAnalyses = bullets.map((bullet) =>
      ContentScoreEngine.analyzeBullet(bullet, matchedRequirements)
    );

    // 4. Aggregate section-level scores, resume-level content score, and opportunities
    return ContentScoreEngine.aggregateContentAnalysis(
      bullets,
      bulletAnalyses,
      matchedRequirements
    );
  }
}

export const contentIntelligenceService = new ContentIntelligenceService();
