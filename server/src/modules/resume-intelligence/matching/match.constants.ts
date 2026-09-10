import { MatchStrengthLabel } from "./match.types";

export const MATCH_STATUS_WEIGHTS = {
  MATCHED: 1.0,
  PARTIAL: 0.6,
  RELATED: 0.35,
  NOT_DETECTED: 0.0,
} as const;

export const REQUIREMENT_IMPORTANCE_WEIGHTS = {
  REQUIRED: 1.0,
  PREFERRED: 0.5,
} as const;

export const MATCH_SCORE_CATEGORY_WEIGHTS = {
  REQUIRED_SKILLS: 0.70,
  PREFERRED_SKILLS: 0.15,
  EXPERIENCE: 0.10,
  EDUCATION_CERTS: 0.05,
} as const;

export function getMatchStrengthLabel(score: number): MatchStrengthLabel {
  if (score >= 90) return "Excellent Match";
  if (score >= 75) return "Strong Match";
  if (score >= 60) return "Moderate Match";
  if (score >= 40) return "Weak Match";
  return "Low Match";
}
