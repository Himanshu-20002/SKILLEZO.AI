export const RECOMMENDATION_ENGINE_VERSION = "1.0.0";

export type RecommendationCategory =
  | "ATS"
  | "SKILL"
  | "MATCH"
  | "CONTENT"
  | "IMPACT"
  | "EXPERIENCE"
  | "STRUCTURE"
  | "KEYWORD"
  | "EVIDENCE"
  | "ROLE_RELEVANCE";

export type RecommendationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type RecommendationImpact = "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW";

export type RecommendationActionability =
  | "FIX_NOW"
  | "STRENGTHEN_EVIDENCE"
  | "REQUIRES_NEW_EVIDENCE"
  | "INFORMATIONAL";

export type RecommendationEffort = "LOW" | "MEDIUM" | "HIGH";

export type RecommendationStatus = "OPEN" | "ADDRESSED" | "DISMISSED";

export interface RecommendationSignal {
  id: string;
  groupKey: string;
  category: RecommendationCategory;
  type: string;
  severity: number; // 0.0 - 1.0
  impact: RecommendationImpact;
  relevance: number; // 0.0 - 1.0
  actionability: RecommendationActionability;
  confidence: number; // 0.0 - 1.0
  sourceIds: string[];
  evidenceIds: string[];
  requirementIds?: string[];
  skillIds?: string[];
  section?: string;
  title: string;
  problem: string;
  whyItMatters: string;
  suggestedAction: string;
  metadata?: Record<string, unknown>;
}

export interface ResumeRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  whyItMatters: string;
  priority: RecommendationPriority;
  impact: RecommendationImpact;
  actionability: RecommendationActionability;
  effort: RecommendationEffort;
  confidence: number;
  priorityScore: number; // 0.0 - 1.0
  sourceIds: string[];
  evidenceIds: string[];
  requirementIds?: string[];
  skillIds?: string[];
  affectedSections?: string[];
  status: RecommendationStatus;
  suggestedAction?: string;
  safetyFlags?: string[];
  engineVersion: string;
}

export interface ResumeRecommendationResult {
  engineVersion: string;
  generatedAt: string;
  recommendations: ResumeRecommendation[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  topAction?: ResumeRecommendation;
  sourceScores: {
    atsScore: number;
    matchScore?: number;
    contentScore?: number;
  };
}
