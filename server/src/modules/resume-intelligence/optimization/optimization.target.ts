import {
  OptimizationTarget,
  OptimizationType,
} from "./optimization.types";
import {
  OPTIMIZATION_ENGINE_VERSION,
  DEFAULT_OPTIMIZATION_CONSTRAINTS,
} from "./optimization.constants";

export class OptimizationTargetResolver {
  /**
   * Resolves a Phase 6 recommendation into a constrained, safe optimization target.
   */
  public static resolveTarget(
    recommendation: any,
    extractedData: any,
    contentResult?: any,
    explicitTargetBulletId?: string
  ): OptimizationTarget {
    const recommendationId = recommendation.id || "rec_general";
    const skillIds = recommendation.skillIds || [];
    const requirementIds = recommendation.requirementIds || [];
    const evidenceIds = recommendation.evidenceIds || [];

    // 1. Check if recommendation requires new factual evidence (e.g. missing skills)
    if (recommendation.actionability === "REQUIRES_NEW_EVIDENCE" && !explicitTargetBulletId) {
      return {
        recommendationId,
        type: "STRENGTHEN_EVIDENCE",
        section: "SKILLS",
        sourceText: "",
        sourceEvidenceIds: evidenceIds,
        skillIds,
        requirementIds,
        constraints: DEFAULT_OPTIMIZATION_CONSTRAINTS,
        isRewritable: false,
        nonRewritableReason:
          "This recommendation requires genuine candidate experience and cannot be safely generated through automatic rewriting without candidate input.",
        engineVersion: OPTIMIZATION_ENGINE_VERSION,
      };
    }

    // 2. Resolve target bullet from explicit ID, evidenceIds, section priority, or matching text
    let targetBulletId: string | undefined;
    let targetSourceText = "";
    let targetSection: "EXPERIENCE" | "PROJECTS" | "SUMMARY" | "SKILLS" | "OTHER" =
      recommendation.section || (recommendation.title?.toLowerCase().includes("project") ? "PROJECTS" : "EXPERIENCE");

    const preferredSection = recommendation.section ||
      (recommendation.title?.toLowerCase().includes("project") ? "PROJECTS" :
       recommendation.title?.toLowerCase().includes("summary") ? "SUMMARY" : "EXPERIENCE");

    if (contentResult?.bullets && contentResult.bullets.length > 0) {
      let candidateBullet: any = null;

      // 0. If user explicitly picked a bullet ID in UI
      if (explicitTargetBulletId) {
        candidateBullet = contentResult.bullets.find((b: any) => b.bulletId === explicitTargetBulletId);
      }

      // Check evidence ID exact match
      if (!candidateBullet && evidenceIds.length > 0) {
        candidateBullet = contentResult.bullets.find((b: any) =>
          evidenceIds.includes(b.bulletId) ||
          evidenceIds.includes(`experience_${b.bulletId}`) ||
          evidenceIds.includes(`project_${b.bulletId}`)
        );
      }

      // Check skill match within preferred section
      if (!candidateBullet && skillIds.length > 0) {
        const skillName = skillIds[0].toLowerCase();
        candidateBullet = contentResult.bullets.find((b: any) =>
          b.section === preferredSection &&
          (b.requirementLinks?.some((r: string) => r.toLowerCase().includes(skillName)) ||
           b.sourceText?.toLowerCase().includes(skillName))
        );
      }

      // Fallback within preferred section
      if (!candidateBullet) {
        const sectionBullets = contentResult.bullets.filter((b: any) => b.section === preferredSection);
        if (sectionBullets.length > 0) {
          candidateBullet = sectionBullets.find((b: any) =>
            b.classification?.includes("RESPONSIBILITY") || b.qualityScore < 60
          ) || sectionBullets[0];
        }
      }

      // Global fallback to any weakest non-summary bullet first
      if (!candidateBullet) {
        const nonSummaryBullets = contentResult.bullets.filter((b: any) => b.section !== "SUMMARY");
        candidateBullet = (nonSummaryBullets.length > 0 ? nonSummaryBullets : contentResult.bullets).find((b: any) =>
          b.classification?.includes("RESPONSIBILITY") || b.qualityScore < 60
        ) || contentResult.bullets[0];
      }

      if (candidateBullet) {
        targetBulletId = candidateBullet.bulletId;
        targetSourceText = candidateBullet.sourceText || "";
        targetSection = candidateBullet.section || preferredSection;
      }
    }

    // Fallback if not found in contentResult: search extractedData based on preferredSection
    if (!targetSourceText) {
      if (preferredSection === "PROJECTS" && extractedData?.projects?.length > 0) {
        const proj = extractedData.projects[0];
        const bullets = (proj.description || "").split(/\r?\n/).filter((b: string) => b.trim().length > 0);
        targetSourceText = bullets.length > 0 ? bullets[0].replace(/^[•*–—\-\d.]+\s*/, "").trim() : proj.title;
        targetBulletId = "proj_0_bullet_0";
        targetSection = "PROJECTS";
      } else if (extractedData?.experience?.length > 0) {
        const exp = extractedData.experience[0];
        const bullets = (exp.description || "").split(/\r?\n/).filter((b: string) => b.trim().length > 0);
        if (bullets.length > 0) {
          targetSourceText = bullets[0].replace(/^[•*–—\-\d.]+\s*/, "").trim();
          targetBulletId = "exp_0_bullet_0";
          targetSection = "EXPERIENCE";
        }
      } else if (extractedData?.summary) {
        targetSourceText = extractedData.summary;
        targetBulletId = "summary_0";
        targetSection = "SUMMARY";
      }
    }

    let optimizationType: OptimizationType = "REWRITE_BULLET";
    if (recommendation.category === "IMPACT" || recommendation.type === "RESPONSIBILITY_HEAVY_BULLETS") {
      optimizationType = "IMPROVE_IMPACT";
    } else if (recommendation.category === "EVIDENCE" || recommendation.type === "WEAK_SKILL_EVIDENCE") {
      optimizationType = "STRENGTHEN_EVIDENCE";
    } else if (recommendation.category === "CONTENT" || recommendation.type === "WEAK_ACTION_OPENINGS") {
      optimizationType = "IMPROVE_SPECIFICITY";
    }

    return {
      recommendationId,
      type: optimizationType,
      section: targetSection,
      bulletId: targetBulletId,
      sourceText: targetSourceText,
      sourceEvidenceIds: targetBulletId ? [targetBulletId] : evidenceIds,
      skillIds,
      requirementIds,
      constraints: DEFAULT_OPTIMIZATION_CONSTRAINTS,
      isRewritable: targetSourceText.trim().length > 0,
      nonRewritableReason: targetSourceText.trim().length === 0 ? "No target text found to optimize." : undefined,
      engineVersion: OPTIMIZATION_ENGINE_VERSION,
    };
  }
}
