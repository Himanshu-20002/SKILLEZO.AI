import { SkillNormalizer } from "./skill.normalizer";
import { SkillDefinition, SkillEvidence, ResumeSkill, SkillCategorySummary, ResumeSkillProfile, SKILL_ENGINE_VERSION } from "./skill.types";

export class SkillDetector {
  /**
   * High-precision word-boundary skill detector across all resume sections.
   */
  public static detectAndBuildProfile(
    extractedData: any,
    rawText = "",
    resumeId?: string
  ): ResumeSkillProfile {
    const evidenceList: SkillEvidence[] = [];
    const skillMap = new Map<string, {
      skill: SkillDefinition;
      frequency: number;
      evidenceIds: string[];
      confidence: number;
      sections: Set<string>;
      evidences: SkillEvidence[];
    }>();

    const allSkills = SkillNormalizer.getAll();

    // Helper to scan text and record evidence
    const scanSection = (
      sectionText: string,
      sectionName: "summary" | "skills" | "experience" | "projects" | "education" | "certifications",
      baseEvidenceId: string,
      sourceIdx?: number
    ) => {
      if (!sectionText || sectionText.trim().length === 0) return;
      const textLower = sectionText.toLowerCase();

      for (const skill of allSkills) {
        // Build regex with strict word boundary for each alias
        let matched = false;
        let detectedAlias = "";
        let detectionMethod: "EXACT" | "ALIAS" | "PATTERN" = "EXACT";

        for (const alias of skill.aliases) {
          // Escape regex special chars
          const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          // Strict word boundary check (surrounded by start/end or non-alphanumeric delimiters)
          const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, "i");

          if (regex.test(sectionText)) {
            matched = true;
            detectedAlias = alias;
            detectionMethod = alias.toLowerCase() === skill.canonicalName.toLowerCase() ? "EXACT" : "ALIAS";
            break;
          }
        }

        if (matched) {
          const confidence = sectionName === "skills" ? 0.99 : sectionName === "experience" ? 0.95 : 0.90;
          const evidence: SkillEvidence = {
            skillId: skill.id,
            canonicalName: skill.canonicalName,
            evidenceId: `${baseEvidenceId}_${skill.id}`,
            sourceSection: sectionName,
            sourceText: sectionText.trim().slice(0, 160),
            sourceIndex: sourceIdx,
            detectionMethod,
            confidence,
          };

          evidenceList.push(evidence);

          // Update skill aggregator
          if (!skillMap.has(skill.id)) {
            skillMap.set(skill.id, {
              skill,
              frequency: 0,
              evidenceIds: [],
              confidence: 0,
              sections: new Set<string>(),
              evidences: [],
            });
          }

          const record = skillMap.get(skill.id)!;
          record.frequency += 1;
          record.evidenceIds.push(evidence.evidenceId);
          record.sections.add(sectionName);
          record.confidence = Math.max(record.confidence, confidence);
          record.evidences.push(evidence);
        }
      }
    };

    // 1. Scan Explicit Skills section
    (extractedData?.skills || []).forEach((sk: any, idx: number) => {
      const skName = typeof sk === "string" ? sk : sk.name;
      if (skName) {
        scanSection(skName, "skills", `skill_${idx}`, idx);
      }
    });

    // 2. Scan Summary section
    if (extractedData?.summary) {
      scanSection(extractedData.summary, "summary", "summary_0");
    }

    // 3. Scan Experience section
    (extractedData?.experience || []).forEach((exp: any, expIdx: number) => {
      const bullets = exp.description
        ? exp.description.split("\n").filter((b: string) => b.trim().length > 0)
        : [];

      bullets.forEach((bullet: string, bIdx: number) => {
        scanSection(bullet, "experience", `exp_${expIdx}_bullet_${bIdx}`, bIdx);
      });
    });

    // 4. Scan Projects section
    (extractedData?.projects || []).forEach((proj: any, pIdx: number) => {
      const projText = `${proj.title || ""}: ${proj.description || ""} ${(proj.technologies || []).join(" ")}`;
      scanSection(projText, "projects", `project_${pIdx}`, pIdx);
    });

    // 5. Scan Education & Certifications
    (extractedData?.education || []).forEach((ed: any, edIdx: number) => {
      scanSection(`${ed.institution || ""} ${ed.degree || ""} ${ed.fieldOfStudy || ""}`, "education", `edu_${edIdx}`, edIdx);
    });
    (extractedData?.certifications || []).forEach((c: any, cIdx: number) => {
      scanSection(`${c.name || ""} ${c.issuer || ""}`, "certifications", `cert_${cIdx}`, cIdx);
    });

    // Build ResumeSkill list
    const resumeSkills: ResumeSkill[] = Array.from(skillMap.values()).map((item) => ({
      skillId: item.skill.id,
      canonicalName: item.skill.canonicalName,
      displayName: item.skill.displayName,
      category: item.skill.category,
      frequency: item.frequency,
      evidenceIds: item.evidenceIds,
      confidence: parseFloat(item.confidence.toFixed(2)),
      sections: Array.from(item.sections),
      evidenceList: item.evidences,
    }));

    // Category summary aggregation
    const categoryMap = new Map<string, string[]>();
    for (const rs of resumeSkills) {
      if (!categoryMap.has(rs.category)) {
        categoryMap.set(rs.category, []);
      }
      categoryMap.get(rs.category)!.push(rs.canonicalName);
    }

    const categorySummary: SkillCategorySummary[] = Array.from(categoryMap.entries()).map(([category, skills]) => ({
      category: category as any,
      count: skills.length,
      skills,
    }));

    return {
      resumeId,
      skills: resumeSkills,
      categorySummary,
      totalUniqueSkills: resumeSkills.length,
      generatedAt: new Date().toISOString(),
      engineVersion: SKILL_ENGINE_VERSION,
    };
  }
}
