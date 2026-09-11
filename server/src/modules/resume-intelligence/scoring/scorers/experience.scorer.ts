import { ExperienceSectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class ExperienceScorer {
  score(analysis?: ExperienceSectionAnalysis | null): SectionScore {
    const sectionId = "experience";
    const title = "Work Experience";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.experience; // 0.30
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
            id: "experience.completeness",
            label: "Role Completeness & Structure",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "All roles have company, title, dates (+25)",
            reason: "Experience section is completely missing.",
            evidenceIds: [],
          },
          {
            id: "experience.bullet_density",
            label: "Bullet Density & Elaboration",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "Avg 2-6 bullets per role (+25), 1 bullet (+12), 0 (0)",
            reason: "No experience bullets to evaluate.",
            evidenceIds: [],
          },
          {
            id: "experience.action_verbs",
            label: "Power Action Verbs",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "Power verbs in >=75% roles (+25), >=50% (+15), <50% (+5)",
            reason: "No experience bullets to evaluate.",
            evidenceIds: [],
          },
          {
            id: "experience.quantitative_metrics",
            label: "Measurable Impact & Metrics",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "Quantifiable metrics in >=50% roles (+25), in >=1 role (+15), 0 (0)",
            reason: "No quantifiable outcomes detected.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Work experience section is completely missing."],
        deductions: ["Missing work experience (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    const expCount = signals.experienceCount || 0;

    // 1. Completeness & Structure (Max 25)
    let completenessScore = 25;
    if (expCount === 0) {
      completenessScore = 0;
      deductions.push("No work experience positions found (-25 pts)");
    } else {
      const missingTotal = (signals.entriesMissingCompany || 0) +
        (signals.entriesMissingTitle || 0) +
        (signals.entriesMissingDates || 0);
      
      if (missingTotal > 0) {
        const penalty = Math.min(25, missingTotal * 6);
        completenessScore = Math.max(0, 25 - penalty);
        deductions.push(`Missing role metadata (company/title/dates missing in ${missingTotal} fields) (-${penalty} pts)`);
      }
    }

    components.push({
      id: "experience.completeness",
      label: "Role Completeness & Structure",
      score: completenessScore,
      maxScore: 25,
      weight: 0.25,
      rule: "All positions include verified company, title, and dates (+25)",
      reason: expCount > 0
        ? `${expCount} work position(s) structured.`
        : "No positions listed.",
      evidenceIds,
    });

    // 2. Bullet Density (Max 25)
    let densityScore = 0;
    const avgBullets = signals.averageBulletsPerRole || 0;
    if (avgBullets >= 2.0 && avgBullets <= 6.0) {
      densityScore = 25;
    } else if (avgBullets > 0) {
      densityScore = 12;
      deductions.push(`Average bullets per role is ${avgBullets} (2–6 recommended) (-13 pts)`);
    } else {
      densityScore = 0;
      deductions.push("Zero bullet points found in experience positions (-25 pts)");
    }

    components.push({
      id: "experience.bullet_density",
      label: "Bullet Density & Elaboration",
      score: densityScore,
      maxScore: 25,
      weight: 0.25,
      rule: "Avg 2-6 bullets per role (+25), avg >0 (+12), 0 (0)",
      reason: `${signals.totalBulletsCount} total bullets across ${expCount} role(s) (avg ${avgBullets.toFixed(1)}/role).`,
      evidenceIds,
    });

    // 3. Power Action Verbs (Max 25)
    let verbsScore = 0;
    const verbRatio = expCount > 0 ? (signals.entriesWithBullets > 0 ? signals.totalVerbsCount / signals.totalBulletsCount : 0) : 0;
    if (signals.totalVerbsCount >= expCount * 2 || verbRatio >= 0.75) {
      verbsScore = 25;
    } else if (signals.totalVerbsCount >= 1 || verbRatio >= 0.3) {
      verbsScore = 15;
      deductions.push(`Limited active power verbs detected (${signals.totalVerbsCount} verbs) (-10 pts)`);
    } else {
      verbsScore = 0;
      deductions.push("No action verbs found in experience descriptions (-25 pts)");
    }

    components.push({
      id: "experience.action_verbs",
      label: "Power Action Verbs",
      score: verbsScore,
      maxScore: 25,
      weight: 0.25,
      rule: "Power verbs in >=75% bullets (+25), >=30% (+15), <30% (0)",
      reason: `${signals.totalVerbsCount} power action verbs identified across bullets.`,
      evidenceIds,
    });

    // 4. Quantitative Metrics & Measurable Impact (Max 25)
    let metricsScore = 0;
    const rolesWithMetrics = signals.entriesWithMetrics || 0;
    const metricRatio = expCount > 0 ? rolesWithMetrics / expCount : 0;

    if (metricRatio >= 0.5 || (expCount === 1 && rolesWithMetrics >= 1)) {
      metricsScore = 25;
    } else if (rolesWithMetrics >= 1 || signals.totalMetricsCount >= 1) {
      metricsScore = 15;
      deductions.push(`Metrics present in only ${rolesWithMetrics} of ${expCount} positions (-10 pts)`);
    } else {
      metricsScore = 0;
      deductions.push("No quantifiable outcomes (percentages, currencies, multipliers) found (-25 pts)");
    }

    components.push({
      id: "experience.quantitative_metrics",
      label: "Measurable Impact & Metrics",
      score: metricsScore,
      maxScore: 25,
      weight: 0.25,
      rule: "Metrics in >=50% roles (+25), in >=1 role (+15), 0 (0)",
      reason: `${signals.totalMetricsCount} metric instances detected across ${rolesWithMetrics} role(s).`,
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

export const experienceScorer = new ExperienceScorer();
