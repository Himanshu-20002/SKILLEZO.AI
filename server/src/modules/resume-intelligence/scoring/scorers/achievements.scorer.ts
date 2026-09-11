import { AchievementsSectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class AchievementsScorer {
  score(analysis?: AchievementsSectionAnalysis | null): SectionScore {
    const sectionId = "achievements";
    const title = "Achievements & Certifications";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.achievements; // 0.05
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
            id: "achievements.presence",
            label: "Achievement & Certification Volume",
            score: 0,
            maxScore: 35,
            weight: 0.35,
            rule: ">=1 certification or award present (+35), 0 (0)",
            reason: "Achievements and certifications section is completely empty.",
            evidenceIds: [],
          },
          {
            id: "achievements.issuer_clarity",
            label: "Issuing Authority & Organization",
            score: 0,
            maxScore: 35,
            weight: 0.35,
            rule: "Issuing organization specified across entries (+35)",
            reason: "No issuing authorities found.",
            evidenceIds: [],
          },
          {
            id: "achievements.dates_credentials",
            label: "Dates & Verification Credentials",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Issue dates (+15), credential URL (+15)",
            reason: "No dates or credential links found.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Achievements and certifications are not listed."],
        deductions: ["No certifications or awards listed (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    const achCount = signals.achievementCount || 0;

    // 1. Volume & Presence (Max 35)
    let volumeScore = 0;
    if (achCount >= 2) volumeScore = 35;
    else if (achCount === 1) volumeScore = 25;
    else {
      volumeScore = 0;
      deductions.push("No certifications or honors documented (-35 pts)");
    }

    components.push({
      id: "achievements.presence",
      label: "Achievement & Certification Volume",
      score: volumeScore,
      maxScore: 35,
      weight: 0.35,
      rule: ">=2 items (+35), 1 item (+25), 0 (0)",
      reason: `${achCount} certification/award item(s) listed.`,
      evidenceIds,
    });

    // 2. Issuer Clarity (Max 35)
    let issuerScore = 0;
    if (achCount > 0) {
      const issuerRatio = (signals.entriesWithIssuer || 0) / achCount;
      if (issuerRatio >= 0.75) issuerScore = 35;
      else if (issuerRatio > 0) {
        issuerScore = 20;
        deductions.push("Issuing authority missing in some certification entries (-15 pts)");
      } else {
        issuerScore = 0;
        deductions.push("No issuing organizations specified (-35 pts)");
      }
    }

    components.push({
      id: "achievements.issuer_clarity",
      label: "Issuing Authority & Organization",
      score: issuerScore,
      maxScore: 35,
      weight: 0.35,
      rule: "Issuing authority specified across entries (+35), partial (+20), missing (0)",
      reason: achCount > 0
        ? `${signals.entriesWithIssuer} of ${achCount} items include verified issuing bodies.`
        : "No issuers to evaluate.",
      evidenceIds,
    });

    // 3. Dates & Credential URLs (Max 30)
    let credScore = 0;
    if (signals.entriesWithDate > 0) credScore += 15;
    else if (achCount > 0) deductions.push("Certification issue dates missing (-15 pts)");

    if (signals.entriesWithUrl > 0) credScore += 15;

    components.push({
      id: "achievements.dates_credentials",
      label: "Dates & Verification Credentials",
      score: credScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Issue dates present (+15), credential URL present (+15)",
      reason: credScore === 30
        ? "Dates and verification credential links are present."
        : credScore === 15
        ? "Dates are specified (adding credential links recommended)."
        : "Credential dates and links are missing.",
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

export const achievementsScorer = new AchievementsScorer();
