/**
 * SKILLEZO RESUME STUDIO — PHASE 3 DETERMINISTIC SCORING
 * Client-Side Mirrored Types for Resume Studio UI
 */

import { SectionId, SectionStatus } from "./resume-section.types";

export type ScoreRatingTier = "Excellent" | "Strong" | "Good" | "Developing" | "Needs Work";

export interface ScoreComponent {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  rule: string;
  reason: string;
  evidenceIds: string[];
}

export interface SectionScore {
  sectionId: SectionId;
  title: string;
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  status: SectionStatus;
  tier: ScoreRatingTier;
  components: ScoreComponent[];
  strengths: string[];
  weaknesses: string[];
  deductions: string[];
  evidenceIds: string[];
}

export interface OverallScoreBreakdown {
  overallScore: number;
  maxScore: number;
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
  engineVersion: string;
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
