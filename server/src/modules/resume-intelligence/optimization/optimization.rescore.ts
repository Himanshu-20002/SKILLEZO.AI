import {
  OptimizationTarget,
  ResumeScoreSnapshot,
  OptimizationScoreComparison,
  OptimizationDecision,
} from "./optimization.types";
import { SCORE_REGRESSION_THRESHOLD } from "./optimization.constants";
import { contentIntelligenceService } from "../content/content.service";
import { skillIntelligenceService } from "../skills/skill.service";
import { matchingIntelligenceService } from "../matching/match.service";
import { roleIntelligenceService } from "../roles/role.service";

export class OptimizationRescorer {
  /**
   * Deterministically re-scores a temporary draft against ATS, Matching, and Content engines.
   */
  public static rescoreDraft(
    extractedData: any,
    target: OptimizationTarget,
    proposedText: string,
    beforeScores: ResumeScoreSnapshot,
    targetRole = "Full-Stack Engineer",
    roleBenchmark?: any,
    jobProfile?: any
  ): {
    afterScores: ResumeScoreSnapshot;
    comparison: OptimizationScoreComparison;
    decision: OptimizationDecision;
  } {
    // 1. Deep clone extracted resume data to apply draft change in-memory
    const clonedData = JSON.parse(JSON.stringify(extractedData || {}));

    if (target.section === "EXPERIENCE" && clonedData.experience?.length > 0) {
      if (target.bulletId) {
        // e.g. exp_0_bullet_1
        const parts = target.bulletId.split("_");
        const expIdx = parseInt(parts[1], 10) || 0;
        const bulletIdx = parseInt(parts[3], 10) || 0;

        if (clonedData.experience[expIdx]) {
          const exp = clonedData.experience[expIdx];
          const lines = (exp.description || "").split(/\r?\n/).filter((b: string) => b.trim().length > 0);
          if (lines[bulletIdx] !== undefined) {
            lines[bulletIdx] = proposedText;
            exp.description = lines.join("\n");
          } else {
            exp.description = `${exp.description || ""}\n${proposedText}`;
          }
        }
      } else {
        clonedData.experience[0].description = `${proposedText}\n${clonedData.experience[0].description || ""}`;
      }
    } else if (target.section === "PROJECTS" && clonedData.projects?.length > 0) {
      if (target.bulletId) {
        // e.g. proj_0_bullet_1
        const parts = target.bulletId.split("_");
        const pIdx = parseInt(parts[1], 10) || 0;
        const bIdx = parseInt(parts[3], 10) || 0;

        if (clonedData.projects[pIdx]) {
          const proj = clonedData.projects[pIdx];
          const lines = (proj.description || "").split(/\r?\n/).filter((b: string) => b.trim().length > 0);
          if (lines[bIdx] !== undefined) {
            lines[bIdx] = proposedText;
            proj.description = lines.join("\n");
          } else if (lines.length > 0) {
            lines[0] = proposedText;
            proj.description = lines.join("\n");
          } else {
            proj.description = proposedText;
          }
        }
      } else {
        clonedData.projects[0].description = `${proposedText}\n${clonedData.projects[0].description || ""}`;
      }
    } else if (target.section === "SUMMARY") {
      clonedData.summary = proposedText;
    }

    // 2. Re-run Phase 2 Skill Profile
    const afterSkillProfile = skillIntelligenceService.buildProfile(clonedData, proposedText);

    // 3. Re-run Phase 4 Matching Intelligence
    const benchmark = roleBenchmark || (targetRole ? roleIntelligenceService.getRoleBenchmark(targetRole) : null);
    let afterMatchScore = beforeScores.matchScore ?? 75;
    if (benchmark) {
      const matchRes = matchingIntelligenceService.computeMatch(
        afterSkillProfile,
        benchmark,
        jobProfile,
        clonedData
      );
      afterMatchScore = matchRes.overallMatchScore;
    }

    // 4. Re-run Phase 5 Content Intelligence
    const contentRes = contentIntelligenceService.analyzeContent(
      clonedData,
      proposedText,
      targetRole,
      { skillBreakdown: { matched: afterSkillProfile.skills.map((s) => ({ canonicalName: s.canonicalName })) } }
    );
    const afterContentScore = contentRes.contentScore;

    // 5. Re-run ATS Score estimation (slight boost if content improved without formatting regressions)
    const contentDelta = afterContentScore - (beforeScores.contentScore ?? 70);
    const atsDelta = contentDelta > 5 ? 1 : 0;
    const afterAtsScore = Math.min(100, Math.max(0, beforeScores.atsScore + atsDelta));

    const afterScores: ResumeScoreSnapshot = {
      atsScore: afterAtsScore,
      matchScore: afterMatchScore,
      contentScore: afterContentScore,
      timestamp: new Date().toISOString(),
    };

    // 6. Compute deltas & regression checks
    const deltaAts = afterAtsScore - beforeScores.atsScore;
    const deltaMatch = afterMatchScore - (beforeScores.matchScore ?? afterMatchScore);
    const deltaContent = afterContentScore - (beforeScores.contentScore ?? afterContentScore);

    const regressed =
      deltaAts < -SCORE_REGRESSION_THRESHOLD ||
      deltaMatch < -SCORE_REGRESSION_THRESHOLD ||
      deltaContent < -SCORE_REGRESSION_THRESHOLD;

    const improved = (deltaContent > 0 || deltaMatch > 0 || deltaAts > 0) && !regressed;

    let decision: OptimizationDecision = "ACCEPTABLE";
    if (regressed) {
      decision = "REGRESSED";
    } else if (improved) {
      decision = "IMPROVED";
    }

    const comparison: OptimizationScoreComparison = {
      before: beforeScores,
      after: afterScores,
      delta: {
        ats: deltaAts,
        match: deltaMatch,
        content: deltaContent,
      },
      improved,
      regressed,
    };

    return { afterScores, comparison, decision };
  }
}
