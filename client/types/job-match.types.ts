import {
  JobRequirementCategory,
  JobRequirementImportance,
} from "./job-profile.types";

export type MatchState =
  | "PROVEN_RELEVANT"
  | "PROVEN_UNDERREPRESENTED"
  | "PARTIAL_MATCH"
  | "RELATED_EVIDENCE"
  | "MISSING"
  | "INSUFFICIENT_EVIDENCE"
  | "NOT_APPLICABLE"
  | "NEEDS_REVIEW";

export type CareerEvidenceSourceType =
  | "EXPERIENCE"
  | "PROJECT"
  | "SKILL"
  | "EDUCATION"
  | "COMPETENCY"
  | "PROFILE";

export interface CareerEvidenceReferenceDTO {
  sourceType: CareerEvidenceSourceType;
  sourceId: string;
  label: string;
  excerpt?: string | null;
}

export interface JobRequirementMatchDTO {
  requirementId: string;
  name: string;
  normalizedName: string;
  category: JobRequirementCategory;
  importance: JobRequirementImportance;
  matchState: MatchState;
  evidence: CareerEvidenceReferenceDTO[];
  confidence: number;
  explanation?: string | null;
}

export interface JobMatchSummaryDTO {
  totalRequirements: number;
  proven: number;
  underrepresented: number;
  partial: number;
  related: number;
  missing: number;
  insufficient: number;
  needsReview: number;
  requiredTotal: number;
  requiredProven: number;
}

export interface JobMatchResultDTO {
  id: string;
  userId: string;
  jobProfileId: string;
  sourceProfileVersion: number;
  jobAnalysisVersion: number;
  isStale: boolean;
  requirementMatches: JobRequirementMatchDTO[];
  summary: JobMatchSummaryDTO;
  overallMatch?: {
    score: number;
    label: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
