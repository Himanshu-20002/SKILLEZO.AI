import {
  IJobMatchResult,
  IJobRequirementMatch,
  ICareerEvidenceReference,
  IJobMatchSummary,
  MatchState,
} from "@/database/models/JobMatchResult.model";
import {
  JobRequirementCategory,
  JobRequirementImportance,
} from "@/database/models/JobProfile.model";

export interface CareerEvidenceReferenceDTO {
  sourceType: "EXPERIENCE" | "PROJECT" | "SKILL" | "EDUCATION" | "COMPETENCY" | "PROFILE";
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

export function toJobMatchResultDTO(
  result: IJobMatchResult,
  isStale: boolean
): JobMatchResultDTO {
  return {
    id: result._id.toString(),
    userId: result.userId,
    jobProfileId: result.jobProfileId.toString(),
    sourceProfileVersion: result.sourceProfileVersion,
    jobAnalysisVersion: result.jobAnalysisVersion,
    isStale,
    requirementMatches: result.requirementMatches.map((m) => ({
      requirementId: m.requirementId,
      name: m.name,
      normalizedName: m.normalizedName,
      category: m.category,
      importance: m.importance,
      matchState: m.matchState,
      evidence: m.evidence.map((ev) => ({
        sourceType: ev.sourceType,
        sourceId: ev.sourceId,
        label: ev.label,
        excerpt: ev.excerpt || null,
      })),
      confidence: m.confidence,
      explanation: m.explanation || null,
    })),
    summary: {
      totalRequirements: result.summary.totalRequirements,
      proven: result.summary.proven,
      underrepresented: result.summary.underrepresented || 0,
      partial: result.summary.partial,
      related: result.summary.related,
      missing: result.summary.missing,
      insufficient: result.summary.insufficient,
      needsReview: result.summary.needsReview,
      requiredTotal: result.summary.requiredTotal,
      requiredProven: result.summary.requiredProven,
    },
    overallMatch: result.overallMatch
      ? {
          score: result.overallMatch.score,
          label: result.overallMatch.label,
        }
      : null,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}
