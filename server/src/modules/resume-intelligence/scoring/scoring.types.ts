/**
 * SKILLEZO RESUME STUDIO — PHASE 3 DETERMINISTIC SCORING
 * Canonical Scoring Contracts & Weighting Constants
 */

import { SectionId, SectionStatus } from "../sections/section.types";

export type ScoreRatingTier = "Excellent" | "Strong" | "Good" | "Developing" | "Needs Work";

export interface ScoreComponent {
  id: string;             // e.g. "experience.action_verbs"
  label: string;          // Human-readable title
  score: number;          // Earned points (0 <= score <= maxScore)
  maxScore: number;       // Maximum possible points for this component
  weight: number;         // Ratio contribution within this section (e.g., 0.25)
  rule: string;           // Mathematical / deterministic evaluation rule
  reason: string;         // Plain language explanation for candidate
  evidenceIds: string[];  // Linked provenance evidence references
}

export interface SectionScore {
  sectionId: SectionId;
  title: string;
  score: number;          // 0 to 100 bounded
  maxScore: number;       // Always 100
  weight: number;         // Global contribution ratio to overall score (e.g., 0.30)
  weightedScore: number;  // score * weight
  status: SectionStatus;
  tier: ScoreRatingTier;
  components: ScoreComponent[];
  strengths: string[];
  weaknesses: string[];
  deductions: string[];
  evidenceIds: string[];
}

export interface OverallScoreBreakdown {
  overallScore: number;   // 0 to 100 bounded
  maxScore: number;       // Always 100
  tier: ScoreRatingTier;
  summaryReason: string;
  totalStrengthsCount: number;
  totalWeaknessesCount: number;
  totalDeductionsCount: number;
  sectionWeights: Record<SectionId, number>;
}

export interface ResumeScoreResult {
  scoreId: string;
  resumeId: string;
  engineVersion: string;  // "resume-score-v1"
  calculatedAt: string;
  overall: OverallScoreBreakdown;
  sections: {
    contact: SectionScore;
    summary: SectionScore;
    skills: SectionScore;
    experience: SectionScore;
    projects: SectionScore;
    education: SectionScore;
    achievements: SectionScore;
  };
}

/**
 * Canonical Section Weights for Standalone General Resume Quality
 * Sum MUST EQUAL 1.00 (100%)
 */
export const RESUME_STUDIO_SECTION_WEIGHTS: Record<SectionId, number> = {
  experience: 0.30,   // 30% — Core career trajectory & quantified impact
  skills: 0.20,       // 20% — Technical domain breadth & taxonomy coverage
  projects: 0.15,     // 15% — Hands-on technical execution & verification links
  education: 0.15,    // 15% — Academic qualifications & timeline integrity
  summary: 0.10,      // 10% — Executive clarity, brevity & tone guard
  contact: 0.05,      // 5%  — Reachability & professional identity presence
  achievements: 0.05, // 5%  — Certifications, awards & verifiable credentials
};

/**
 * Score Tier Rating Helper
 */
export function getScoreRatingTier(score: number): ScoreRatingTier {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 45) return "Developing";
  return "Needs Work";
}
