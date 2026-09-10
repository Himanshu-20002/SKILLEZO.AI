import { SkillNormalizer } from "../skills/skill.normalizer";
import { ParsedJDSections } from "./job.parser";
import { JobRequirementEvidence, JobSkillRequirement } from "./job.types";

export class JobExtractor {
  /**
   * Extracts required and preferred skills from parsed JD sections using Phase 2 canonical skill mapping.
   */
  public static extractSkills(
    sections: ParsedJDSections,
    fullText: string,
    evidenceList: JobRequirementEvidence[]
  ): {
    requiredSkills: JobSkillRequirement[];
    preferredSkills: JobSkillRequirement[];
  } {
    const allSkills = SkillNormalizer.getAll();
    const requiredMap = new Map<string, JobSkillRequirement>();
    const preferredMap = new Map<string, JobSkillRequirement>();

    const reqLines = [...sections.requirements, ...sections.qualifications];
    const prefLines = [...sections.preferred];
    const otherLines = [...sections.responsibilities, ...sections.summary, ...sections.other];

    const scanForSkills = (
      lines: string[],
      defaultType: "REQUIRED" | "PREFERRED" | "OTHER",
      sectionName: "REQUIREMENTS" | "QUALIFICATIONS" | "PREFERRED" | "RESPONSIBILITIES" | "SUMMARY" | "OTHER"
    ) => {
      lines.forEach((line, lineIdx) => {
        if (!line || line.trim().length === 0) return;
        const lineLower = line.toLowerCase();

        for (const skill of allSkills) {
          let matched = false;
          let matchedAlias = "";

          for (const alias of skill.aliases) {
            const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, "i");

            if (regex.test(line)) {
              matched = true;
              matchedAlias = alias;
              break;
            }
          }

          if (matched) {
            // Determine importance: Check inline qualifiers first
            let importance: "REQUIRED" | "PREFERRED" =
              defaultType === "PREFERRED" ? "PREFERRED" : "REQUIRED";

            if (
              /\b(preferred|nice to have|bonus|plus|good to have|desired|optional|advantageous|a plus)\b/i.test(
                lineLower
              )
            ) {
              importance = "PREFERRED";
            } else if (
              /\b(must have|required|mandatory|essential|minimum|expert|proven)\b/i.test(lineLower)
            ) {
              importance = "REQUIRED";
            }

            const evidenceId = `jd_skill_${skill.id}_${sectionName.toLowerCase()}_${lineIdx}`;
            evidenceList.push({
              evidenceId,
              sourceSection: sectionName,
              sourceText: line.trim().slice(0, 160),
              extractionMethod: matchedAlias.toLowerCase() === skill.canonicalName.toLowerCase() ? "EXACT" : "ALIAS",
              confidence: 0.96,
              requirementType: importance,
            });

            if (importance === "REQUIRED") {
              if (!requiredMap.has(skill.id)) {
                requiredMap.set(skill.id, {
                  skillId: skill.id,
                  canonicalName: skill.canonicalName,
                  requirementType: "REQUIRED",
                  confidence: 0.96,
                  evidenceIds: [evidenceId],
                  sources: ["JOB_DESCRIPTION"],
                  category: skill.category,
                });
              } else {
                requiredMap.get(skill.id)!.evidenceIds.push(evidenceId);
              }
            } else {
              // Preferred
              if (!preferredMap.has(skill.id) && !requiredMap.has(skill.id)) {
                preferredMap.set(skill.id, {
                  skillId: skill.id,
                  canonicalName: skill.canonicalName,
                  requirementType: "PREFERRED",
                  confidence: 0.92,
                  evidenceIds: [evidenceId],
                  sources: ["JOB_DESCRIPTION"],
                  category: skill.category,
                });
              } else if (preferredMap.has(skill.id)) {
                preferredMap.get(skill.id)!.evidenceIds.push(evidenceId);
              }
            }
          }
        }
      });
    };

    // Scan explicit sections
    scanForSkills(reqLines, "REQUIRED", "REQUIREMENTS");
    scanForSkills(prefLines, "PREFERRED", "PREFERRED");
    scanForSkills(otherLines, "PREFERRED", "RESPONSIBILITIES");

    // Remove any skills from preferred that were also explicitly determined to be required
    for (const reqSkillId of requiredMap.keys()) {
      preferredMap.delete(reqSkillId);
    }

    return {
      requiredSkills: Array.from(requiredMap.values()),
      preferredSkills: Array.from(preferredMap.values()),
    };
  }
}
