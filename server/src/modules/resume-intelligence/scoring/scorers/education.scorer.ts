import { EducationSectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class EducationScorer {
  score(analysis?: EducationSectionAnalysis | null): SectionScore {
    const sectionId = "education";
    const title = "Education & Academics";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.education; // 0.15
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
            id: "education.degree_institution",
            label: "Degree & Institution Verification",
            score: 0,
            maxScore: 40,
            weight: 0.40,
            rule: "Degree (+20) and Institution (+20) present across entries",
            reason: "Education section is completely missing.",
            evidenceIds: [],
          },
          {
            id: "education.timeline_clarity",
            label: "Graduation Timeline & Dates",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Graduation dates present across all entries (+30)",
            reason: "No education dates to evaluate.",
            evidenceIds: [],
          },
          {
            id: "education.academic_detail",
            label: "Field of Study & Honors / GPA",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Field of study (+20), GPA / Honors (+10)",
            reason: "No academic details found.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Education section is completely missing."],
        deductions: ["Missing education (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    const eduCount = signals.educationCount || 0;

    // 1. Degree & Institution (Max 40)
    let coreScore = 0;
    if (eduCount > 0) {
      if (signals.entriesWithDegree === eduCount && signals.entriesWithInstitution === eduCount) {
        coreScore = 40;
      } else if (signals.entriesWithDegree > 0 || signals.entriesWithInstitution > 0) {
        coreScore = 20;
        deductions.push("Degree or institution name is missing in one or more entries (-20 pts)");
      } else {
        deductions.push("Neither degree nor institution specified in education entries (-40 pts)");
      }
    } else {
      deductions.push("No education entries listed (-40 pts)");
    }

    components.push({
      id: "education.degree_institution",
      label: "Degree & Institution Verification",
      score: coreScore,
      maxScore: 40,
      weight: 0.40,
      rule: "Degree (+20) and Institution (+20) present across all entries",
      reason: eduCount > 0
        ? `${signals.entriesWithDegree} degree(s) and ${signals.entriesWithInstitution} institution(s) documented.`
        : "No educational background found.",
      evidenceIds,
    });

    // 2. Timeline Clarity (Max 30)
    let timelineScore = 0;
    if (eduCount > 0) {
      if (signals.entriesWithDates === eduCount) {
        timelineScore = 30;
      } else if (signals.entriesWithDates > 0) {
        timelineScore = 15;
        deductions.push("Graduation year or date range missing in some entries (-15 pts)");
      } else {
        deductions.push("Graduation dates completely missing (-30 pts)");
      }
    }

    components.push({
      id: "education.timeline_clarity",
      label: "Graduation Timeline & Dates",
      score: timelineScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Graduation dates / years present (+30), partial (+15), missing (0)",
      reason: eduCount > 0
        ? `${signals.entriesWithDates} of ${eduCount} entries contain verified dates.`
        : "No dates to evaluate.",
      evidenceIds,
    });

    // 3. Field of Study & GPA / Honors (Max 30)
    let detailScore = 0;
    if (signals.entriesWithField > 0) detailScore += 20;
    else deductions.push("Field of study or major not explicitly specified (-20 pts)");

    if (signals.gpaPresent || signals.entriesWithHonors > 0) detailScore += 10;

    components.push({
      id: "education.academic_detail",
      label: "Field of Study & Honors / GPA",
      score: detailScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Field of study (+20), GPA / Honors (+10)",
      reason: signals.entriesWithField > 0 && (signals.gpaPresent || signals.entriesWithHonors > 0)
        ? "Field of study and academic performance/honors included."
        : signals.entriesWithField > 0
        ? "Field of study is specified."
        : "Academic specialization details are minimal.",
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

export const educationScorer = new EducationScorer();
