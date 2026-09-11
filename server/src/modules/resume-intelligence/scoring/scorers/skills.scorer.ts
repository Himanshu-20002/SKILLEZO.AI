import { SkillsSectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class SkillsScorer {
  score(analysis?: SkillsSectionAnalysis | null): SectionScore {
    const sectionId = "skills";
    const title = "Skills & Expertise";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.skills; // 0.20
    const evidenceIds = analysis?.evidenceIds || [];

    if (!analysis || analysis.status === "MISSING") {
      return {
        sectionId,
        title,
        score: 0,
        maxScore: 100,
        weight,
        weightedScore: 0,
        status: "MISSING",
        tier: "Needs Work",
        components: [
          {
            id: "skills.presence_volume",
            label: "Skill Volume & Breadth",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: ">=8 skills (+30), 5-7 (+20), 1-4 (+10), 0 (0)",
            reason: "Skills section is completely empty.",
            evidenceIds: [],
          },
          {
            id: "skills.domain_diversity",
            label: "Technical Domain Diversity",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: ">=3 domains (+30), 2 domains (+20), 1 domain (+10)",
            reason: "No skill domains present.",
            evidenceIds: [],
          },
          {
            id: "skills.categorization_depth",
            label: "Taxonomy & Categorization Depth",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "Categorized ratio >=80% (+25), >=50% (+15), <50% (+5)",
            reason: "No categorized skills.",
            evidenceIds: [],
          },
          {
            id: "skills.cleanliness",
            label: "Skill Cleanliness & Deduplication",
            score: 0,
            maxScore: 15,
            weight: 0.15,
            rule: "Zero duplicates (+15), 1 duplicate (+8), >1 duplicates (0)",
            reason: "No skills to evaluate.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Skills inventory is completely missing."],
        deductions: ["Missing technical skills section (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    // 1. Volume (Max 30)
    let volumeScore = 0;
    if (signals.skillCount >= 8) volumeScore = 30;
    else if (signals.skillCount >= 5) {
      volumeScore = 20;
      deductions.push(`Limited skill inventory (${signals.skillCount} skills; 8+ recommended) (-10 pts)`);
    } else if (signals.skillCount >= 1) {
      volumeScore = 10;
      deductions.push(`Very brief skill list (${signals.skillCount} skills) (-20 pts)`);
    } else {
      deductions.push("Zero skills found in resume (-30 pts)");
    }

    components.push({
      id: "skills.presence_volume",
      label: "Skill Volume & Breadth",
      score: volumeScore,
      maxScore: 30,
      weight: 0.30,
      rule: ">=8 skills (+30), 5-7 (+20), 1-4 (+10), 0 (0)",
      reason: `${signals.skillCount} skills listed.`,
      evidenceIds,
    });

    // 2. Domain Diversity (Max 30)
    let diversityScore = 0;
    if (signals.categoryCount >= 3) diversityScore = 30;
    else if (signals.categoryCount === 2) {
      diversityScore = 20;
      deductions.push(`Skills span only 2 domains (${signals.categoryCount}); broader coverage recommended (-10 pts)`);
    } else if (signals.categoryCount === 1) {
      diversityScore = 10;
      deductions.push(`Skills isolated to a single domain (${signals.categoryCount}) (-20 pts)`);
    } else {
      deductions.push("No canonical domains represented in skills (-30 pts)");
    }

    components.push({
      id: "skills.domain_diversity",
      label: "Technical Domain Diversity",
      score: diversityScore,
      maxScore: 30,
      weight: 0.30,
      rule: ">=3 domains (+30), 2 domains (+20), 1 domain (+10)",
      reason: `Skills span ${signals.categoryCount} distinct technical domain(s).`,
      evidenceIds,
    });

    // 3. Categorization Depth (Max 25)
    let categorizationScore = 5;
    const catRatio = signals.skillCount > 0 ? signals.categorizedCount / signals.skillCount : 0;
    if (catRatio >= 0.8) categorizationScore = 25;
    else if (catRatio >= 0.5) {
      categorizationScore = 15;
      deductions.push(`Partial categorization (${Math.round(catRatio * 100)}% categorized) (-10 pts)`);
    } else {
      categorizationScore = 5;
      deductions.push(`High uncategorized skills ratio (${signals.uncategorizedCount} uncategorized) (-20 pts)`);
    }

    components.push({
      id: "skills.categorization_depth",
      label: "Taxonomy & Categorization Depth",
      score: categorizationScore,
      maxScore: 25,
      weight: 0.25,
      rule: "Categorized ratio >=80% (+25), >=50% (+15), <50% (+5)",
      reason: `${signals.categorizedCount} of ${signals.skillCount} skills (${Math.round(catRatio * 100)}%) classified into canonical taxonomy.`,
      evidenceIds,
    });

    // 4. Cleanliness (Max 15)
    let cleanlinessScore = 15;
    if (signals.duplicateCount > 0) {
      cleanlinessScore = signals.duplicateCount === 1 ? 8 : 0;
      deductions.push(`${signals.duplicateCount} duplicate skill entry/entries detected (-${15 - cleanlinessScore} pts)`);
    }

    components.push({
      id: "skills.cleanliness",
      label: "Skill Cleanliness & Deduplication",
      score: cleanlinessScore,
      maxScore: 15,
      weight: 0.15,
      rule: "Zero duplicates (+15), 1 duplicate (+8), >1 duplicates (0)",
      reason: signals.duplicateCount === 0
        ? "All skills are unique and non-redundant."
        : `${signals.duplicateCount} duplicate skills identified.`,
      evidenceIds,
    });

    // Sum total section score
    const rawScore = components.reduce((acc, c) => acc + c.score, 0);
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));
    const weightedScore = Number((score * weight).toFixed(2));
    const tier = getScoreRatingTier(score);

    return {
      sectionId,
      title,
      score,
      maxScore: 100,
      weight,
      weightedScore,
      status: analysis.status,
      tier,
      components,
      strengths,
      weaknesses,
      deductions,
      evidenceIds,
    };
  }
}

export const skillsScorer = new SkillsScorer();
