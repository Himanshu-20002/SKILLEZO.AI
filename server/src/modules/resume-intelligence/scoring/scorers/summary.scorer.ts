import { SummarySectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class SummaryScorer {
  score(analysis?: SummarySectionAnalysis | null): SectionScore {
    const sectionId = "summary";
    const title = "Professional Summary";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.summary; // 0.10
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
            id: "summary.presence",
            label: "Summary Presence",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Summary text present (+30), absent (0)",
            reason: "Professional summary is missing.",
            evidenceIds: [],
          },
          {
            id: "summary.length_calibration",
            label: "Length Calibration",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "18-100 words (+30), 15-17 or 101-120 (+15), <15 or >120 (+5)",
            reason: "No summary text to evaluate.",
            evidenceIds: [],
          },
          {
            id: "summary.tone_executive",
            label: "Executive Tone & Voice",
            score: 0,
            maxScore: 20,
            weight: 0.20,
            rule: "Zero first-person pronouns (+20), 1 pronoun (+10), >1 (0)",
            reason: "No summary text to evaluate.",
            evidenceIds: [],
          },
          {
            id: "summary.role_focus",
            label: "Target Role & Experience Focus",
            score: 0,
            maxScore: 20,
            weight: 0.20,
            rule: "Target role (+10) and Years of experience (+10)",
            reason: "Target role and experience years are missing.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Professional summary statement is missing."],
        deductions: ["Missing professional summary (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    // 1. Presence (Max 30)
    const presenceScore = signals.hasSummary ? 30 : 0;
    if (!signals.hasSummary) deductions.push("Summary statement is empty (-30 pts)");

    components.push({
      id: "summary.presence",
      label: "Summary Presence",
      score: presenceScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Summary text present (+30), absent (0)",
      reason: signals.hasSummary ? "Professional summary statement is present." : "Summary is missing.",
      evidenceIds,
    });

    // 2. Length Calibration (Max 30)
    let lengthScore = 0;
    if (signals.isOptimalLength) {
      lengthScore = 30;
    } else if (signals.wordCount >= 15 && signals.wordCount <= 120) {
      lengthScore = 15;
      deductions.push(`Summary length is sub-optimal (${signals.wordCount} words; 18–100 recommended) (-15 pts)`);
    } else {
      lengthScore = 5;
      deductions.push(`Summary length is significantly out of bounds (${signals.wordCount} words) (-25 pts)`);
    }

    components.push({
      id: "summary.length_calibration",
      label: "Length Calibration",
      score: lengthScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Optimal 18-100 words (+30), 15-17 or 101-120 words (+15), <15 or >120 words (+5)",
      reason: `Summary contains ${signals.wordCount} words (${signals.sentenceCount} sentences).`,
      evidenceIds,
    });

    // 3. Executive Tone (Max 20)
    let toneScore = 20;
    if (signals.containsFirstPersonLanguage) {
      const count = signals.firstPersonPronouns?.length || 1;
      toneScore = count === 1 ? 10 : 0;
      deductions.push(`Contains first-person pronouns (${signals.firstPersonPronouns?.join(", ")}) (-${20 - toneScore} pts)`);
    }

    components.push({
      id: "summary.tone_executive",
      label: "Executive Tone & Voice",
      score: toneScore,
      maxScore: 20,
      weight: 0.20,
      rule: "Zero first-person pronouns (+20), 1 pronoun (+10), >1 pronoun (0)",
      reason: signals.containsFirstPersonLanguage
        ? `First-person pronouns detected: ${signals.firstPersonPronouns?.join(", ")}.`
        : "Professional executive tone maintained without first-person language.",
      evidenceIds,
    });

    // 4. Role & Experience Focus (Max 20)
    let focusScore = 0;
    if (signals.hasTargetRole) focusScore += 10;
    else deductions.push("Target specialization or role not explicitly highlighted in summary (-10 pts)");

    if (signals.hasYearsOfExperience) focusScore += 10;
    else deductions.push("Years of experience not stated in summary (-10 pts)");

    components.push({
      id: "summary.role_focus",
      label: "Target Role & Experience Focus",
      score: focusScore,
      maxScore: 20,
      weight: 0.20,
      rule: "Target role specified (+10) and Years of experience specified (+10)",
      reason: signals.hasTargetRole && signals.hasYearsOfExperience
        ? `Target role "${signals.targetRole}" and ${signals.yearsOfExperience}+ years experience stated.`
        : signals.hasTargetRole
        ? `Target role "${signals.targetRole}" stated, but years of experience missing.`
        : signals.hasYearsOfExperience
        ? `${signals.yearsOfExperience}+ years experience stated, but target role is unstated.`
        : "Neither target role nor years of experience explicitly highlighted.",
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

export const summaryScorer = new SummaryScorer();
