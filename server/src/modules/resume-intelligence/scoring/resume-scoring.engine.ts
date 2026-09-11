/**
 * SKILLEZO RESUME STUDIO — PHASE 3 DETERMINISTIC SCORING ENGINE
 * Master Scoring Orchestrator & Overall Score Aggregator
 */

import { randomUUID } from "crypto";
import { ResumeDocument } from "../document/resume-document.types";
import { ResumeSectionAnalysisResult, SectionId } from "../sections/section.types";
import {
  ResumeScoreResult,
  SectionScore,
  OverallScoreBreakdown,
  RESUME_STUDIO_SECTION_WEIGHTS,
  getScoreRatingTier,
} from "./scoring.types";
import { ResumeScoreResultSchema } from "./scoring.schema";
import { contactScorer } from "./scorers/contact.scorer";
import { summaryScorer } from "./scorers/summary.scorer";
import { skillsScorer } from "./scorers/skills.scorer";
import { experienceScorer } from "./scorers/experience.scorer";
import { projectsScorer } from "./scorers/projects.scorer";
import { educationScorer } from "./scorers/education.scorer";
import { achievementsScorer } from "./scorers/achievements.scorer";

export class ResumeScoringEngine {
  public readonly version = "resume-score-v1";

  /**
   * Evaluates all 7 sections and computes the overall general resume score
   * Pure deterministic in-memory transformation (<3ms)
   */
  public scoreDocument(
    analysis: ResumeSectionAnalysisResult,
    doc?: ResumeDocument | null
  ): ResumeScoreResult {
    // 1. Compute Section Scores
    const contactScore = contactScorer.score(analysis.sections.contact);
    const summaryScore = summaryScorer.score(analysis.sections.summary);
    const skillsScore = skillsScorer.score(analysis.sections.skills);
    const experienceScore = experienceScorer.score(analysis.sections.experience);
    const projectsScore = projectsScorer.score(analysis.sections.projects);
    const educationScore = educationScorer.score(analysis.sections.education);
    const achievementsScore = achievementsScorer.score(analysis.sections.achievements);

    // 2. Compute Weighted Overall Score
    const weightedSum =
      contactScore.weightedScore +
      summaryScore.weightedScore +
      skillsScore.weightedScore +
      experienceScore.weightedScore +
      projectsScore.weightedScore +
      educationScore.weightedScore +
      achievementsScore.weightedScore;

    const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum)));
    const tier = getScoreRatingTier(overallScore);

    // 3. Aggregate Strengths, Weaknesses, and Deductions
    const totalStrengthsCount =
      contactScore.strengths.length +
      summaryScore.strengths.length +
      skillsScore.strengths.length +
      experienceScore.strengths.length +
      projectsScore.strengths.length +
      educationScore.strengths.length +
      achievementsScore.strengths.length;

    const totalWeaknessesCount =
      contactScore.weaknesses.length +
      summaryScore.weaknesses.length +
      skillsScore.weaknesses.length +
      experienceScore.weaknesses.length +
      projectsScore.weaknesses.length +
      educationScore.weaknesses.length +
      achievementsScore.weaknesses.length;

    const totalDeductionsCount =
      contactScore.deductions.length +
      summaryScore.deductions.length +
      skillsScore.deductions.length +
      experienceScore.deductions.length +
      projectsScore.deductions.length +
      educationScore.deductions.length +
      achievementsScore.deductions.length;

    // 4. Formulate Plain Language Summary Reason
    let summaryReason = "";
    if (overallScore >= 90) {
      summaryReason = "Exceptional resume quality with strong structural completeness, verified evidence, and power verb calibration.";
    } else if (overallScore >= 75) {
      summaryReason = "Strong resume profile. High completeness across core experience and skills with minor opportunities for detail expansion.";
    } else if (overallScore >= 60) {
      summaryReason = "Good solid foundation. Consider adding more quantifiable metrics in experience and portfolio verification links.";
    } else if (overallScore >= 45) {
      summaryReason = "Developing profile. Several key sections require attention to completeness, dates, and action-oriented framing.";
    } else {
      summaryReason = "Preliminary draft. Core contact, experience, and educational details need completion.";
    }

    const overall: OverallScoreBreakdown = {
      overallScore,
      maxScore: 100,
      tier,
      summaryReason,
      totalStrengthsCount,
      totalWeaknessesCount,
      totalDeductionsCount,
      sectionWeights: RESUME_STUDIO_SECTION_WEIGHTS,
    };

    const result: ResumeScoreResult = {
      scoreId: randomUUID(),
      resumeId: analysis.resumeId,
      engineVersion: "resume-score-v1",
      calculatedAt: new Date().toISOString(),
      overall,
      sections: {
        contact: contactScore,
        summary: summaryScore,
        skills: skillsScore,
        experience: experienceScore,
        projects: projectsScore,
        education: educationScore,
        achievements: achievementsScore,
      },
    };

    // 5. Runtime Zod Schema Validation
    const validated = ResumeScoreResultSchema.parse(result) as ResumeScoreResult;
    return Object.freeze(validated);
  }

  /**
   * Evaluates a single section score on demand (e.g., for live typing in UI)
   */
  public scoreSection(
    sectionId: SectionId,
    sectionAnalysis: any
  ): SectionScore {
    switch (sectionId) {
      case "contact":
        return contactScorer.score(sectionAnalysis);
      case "summary":
        return summaryScorer.score(sectionAnalysis);
      case "skills":
        return skillsScorer.score(sectionAnalysis);
      case "experience":
        return experienceScorer.score(sectionAnalysis);
      case "projects":
        return projectsScorer.score(sectionAnalysis);
      case "education":
        return educationScorer.score(sectionAnalysis);
      case "achievements":
        return achievementsScorer.score(sectionAnalysis);
      default:
        throw new Error(`Unknown sectionId: ${sectionId}`);
    }
  }
}

export const resumeScoringEngine = new ResumeScoringEngine();
