import { ResumeSkillItem, ResumeEvidence } from "../../document/resume-document.types";
import { SkillsSectionAnalysis, SkillsSignals, SectionStatus } from "../section.types";

const ALL_CATEGORIES: ResumeSkillItem["category"][] = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "CLOUD",
  "DEVOPS",
  "LANGUAGE",
  "TESTING",
  "MOBILE",
  "AI_ML",
  "TOOLS",
  "OTHER",
];

export class SkillsAnalyzer {
  analyze(skills: ResumeSkillItem[] = [], evidenceLedger: ResumeEvidence[] = []): SkillsSectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const skillList = Array.isArray(skills) ? skills : [];
    const skillCount = skillList.length;
    const hasSkills = skillCount > 0;

    // Collect linked evidence IDs
    for (const sk of skillList) {
      if (Array.isArray(sk.evidenceIds)) {
        evidenceIds.push(...sk.evidenceIds);
      }
    }

    // Initialize category distribution
    const categoryDistribution: Record<ResumeSkillItem["category"], number> = {
      FRONTEND: 0,
      BACKEND: 0,
      DATABASE: 0,
      CLOUD: 0,
      DEVOPS: 0,
      LANGUAGE: 0,
      TESTING: 0,
      MOBILE: 0,
      AI_ML: 0,
      TOOLS: 0,
      OTHER: 0,
    };

    if (!hasSkills) {
      return {
        sectionId: "skills",
        title: "Technical Skills",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["Technical skills section is empty."],
        missing: ["skills"],
        warnings: ["No technical skills listed."],
        evidenceIds: [],
        signals: {
          hasSkills: false,
          skillCount: 0,
          categoryDistribution,
          categoryCount: 0,
          categorizedCount: 0,
          uncategorizedCount: 0,
          duplicateCount: 0,
          topCategories: [],
        },
      };
    }

    // Check duplicates and compute distribution
    const seenNames = new Set<string>();
    let duplicateCount = 0;
    let uncategorizedCount = 0;
    let categorizedCount = 0;

    for (const sk of skillList) {
      if (!sk || !sk.name) continue;
      const lowerName = sk.name.trim().toLowerCase();
      if (seenNames.has(lowerName)) {
        duplicateCount++;
        warnings.push(`Duplicate skill entry detected: "${sk.name}"`);
      } else {
        seenNames.add(lowerName);
      }

      const cat = sk.category && ALL_CATEGORIES.includes(sk.category) ? sk.category : "OTHER";
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

      if (cat === "OTHER") {
        uncategorizedCount++;
      } else {
        categorizedCount++;
      }
    }

    const populatedCategories = (Object.keys(categoryDistribution) as ResumeSkillItem["category"][]).filter(
      (k) => k !== "OTHER" && categoryDistribution[k] > 0
    );
    const categoryCount = populatedCategories.length;

    const topCategories = populatedCategories
      .map((cat) => ({ category: cat, count: categoryDistribution[cat] }))
      .sort((a, b) => b.count - a.count);

    // Warnings
    if (uncategorizedCount > 0) {
      warnings.push(`${uncategorizedCount} skill(s) are in the general/uncategorized category.`);
    }
    if (skillCount < 5) {
      warnings.push(`Technical skill count is low (${skillCount} skills). Recommended range is 8–20 relevant skills.`);
    } else if (skillCount > 35) {
      warnings.push(`Skill list may be overpopulated (${skillCount} skills). Prioritize role-relevant core competencies.`);
    }

    // Strengths
    if (skillCount >= 8 && categoryCount >= 3) {
      strengths.push(`${skillCount} technical skills organized across ${categoryCount} specialized engineering domains.`);
    } else if (skillCount >= 5) {
      strengths.push(`${skillCount} technical skills detected.`);
    }

    if (categoryDistribution.LANGUAGE > 0 && (categoryDistribution.FRONTEND > 0 || categoryDistribution.BACKEND > 0)) {
      strengths.push("Strong full-stack language and framework representation.");
    }
    if (categoryDistribution.CLOUD > 0 || categoryDistribution.DEVOPS > 0) {
      strengths.push("Cloud infrastructure and DevOps competencies included.");
    }

    // Weaknesses
    if (categoryCount <= 1 && skillCount >= 5) {
      weaknesses.push("Skills are concentrated in a single domain without secondary stack breadth.");
    }
    if (uncategorizedCount > skillCount / 2) {
      weaknesses.push("Majority of skills lack domain categorization.");
    }
    if (skillCount < 5) {
      weaknesses.push("Fewer than 5 skills listed.");
    }

    // Completeness (Volume: 5-25 = 50%, Category breadth: 3+ categories = 30%, Categorization ratio = 20%)
    let completeness = 0;
    if (skillCount >= 8) completeness += 0.50;
    else if (skillCount >= 4) completeness += 0.35;
    else completeness += 0.15;

    if (categoryCount >= 3) completeness += 0.30;
    else if (categoryCount >= 2) completeness += 0.20;
    else if (categoryCount >= 1) completeness += 0.10;

    const categorizationRatio = skillCount > 0 ? categorizedCount / skillCount : 0;
    completeness += categorizationRatio * 0.20;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.85 && duplicateCount === 0) {
      status = "COMPLETE";
    }

    const signals: SkillsSignals = {
      hasSkills: true,
      skillCount,
      categoryDistribution,
      categoryCount,
      categorizedCount,
      uncategorizedCount,
      duplicateCount,
      topCategories,
    };

    return {
      sectionId: "skills",
      title: "Technical Skills",
      status,
      completeness,
      itemCount: skillCount,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds: Array.from(new Set(evidenceIds)),
      signals,
    };
  }
}

export const skillsAnalyzer = new SkillsAnalyzer();
