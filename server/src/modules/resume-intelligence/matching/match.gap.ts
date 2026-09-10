import { RequirementMatchResult, JobMatchSkillGap } from "./match.types";

export class GapEngine {
  /**
   * Identifies and prioritizes skill and requirement gaps deterministically.
   */
  public static computeGaps(matchResults: RequirementMatchResult[]): JobMatchSkillGap[] {
    const gaps: JobMatchSkillGap[] = [];

    for (const match of matchResults) {
      if (match.status === "MATCHED") continue;

      let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
      let status: "MISSING" | "PARTIAL" | "RELATED" = "MISSING";

      if (match.status === "NOT_DETECTED") {
        status = "MISSING";
        priority = match.requirementType === "REQUIRED" ? "HIGH" : "MEDIUM";
      } else if (match.status === "PARTIAL") {
        status = "PARTIAL";
        priority = match.requirementType === "REQUIRED" ? "HIGH" : "LOW";
      } else if (match.status === "RELATED") {
        status = "RELATED";
        priority = match.requirementType === "REQUIRED" ? "MEDIUM" : "LOW";
      }

      const sourceLabel =
        match.source === "JOB_DESCRIPTION"
          ? "Target Employer Requirement"
          : match.source === "BOTH"
          ? "Core Benchmark & Employer Requirement"
          : "Role Benchmark Expectation";

      const rec =
        status === "MISSING"
          ? `${match.canonicalName} is not detected in your resume. If you have verified experience, add it to your Technical Skills or Projects.`
          : status === "RELATED"
          ? `You have demonstrated related experience with ${match.relatedSkillName || "related technologies"}. Highlight direct contributions using ${match.canonicalName} where applicable.`
          : `Expand on specific project outcomes and metric depth for ${match.canonicalName}.`;

      gaps.push({
        skillId: match.requirementId,
        skillName: match.canonicalName,
        requirementType: match.requirementType,
        source: match.source,
        status,
        priority,
        requirementIds: [match.requirementId],
        evidenceIds: match.candidateEvidenceIds,
        recommendation: rec,
      });
    }

    // Sort by Priority: HIGH -> MEDIUM -> LOW
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
}
