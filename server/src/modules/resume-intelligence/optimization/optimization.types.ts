export const OPTIMIZATION_ENGINE_VERSION = "1.0.0";

export type OptimizationType =
  | "REWRITE_BULLET"
  | "STRENGTHEN_EVIDENCE"
  | "IMPROVE_IMPACT"
  | "IMPROVE_SPECIFICITY"
  | "IMPROVE_TECHNICAL_DEPTH"
  | "IMPROVE_KEYWORD_ALIGNMENT"
  | "IMPROVE_STRUCTURE"
  | "REDUCE_REDUNDANCY"
  | "IMPROVE_SUMMARY";

export type OptimizationConstraint =
  | "NO_NEW_FACTS"
  | "NO_NEW_METRICS"
  | "NO_NEW_SKILLS"
  | "PRESERVE_MEANING"
  | "PRESERVE_NUMERIC_VALUES"
  | "PRESERVE_EMPLOYMENT_FACTS"
  | "PRESERVE_EDUCATION_FACTS"
  | "PRESERVE_CERTIFICATION_FACTS";

export type OptimizationSafetyLevel = "SAFE" | "REVIEW" | "BLOCKED";

export type OptimizationDecision = "IMPROVED" | "ACCEPTABLE" | "REGRESSED" | "REJECTED";

export type OptimizationChangeType =
  | "CLARITY"
  | "SPECIFICITY"
  | "TECHNICAL_DEPTH"
  | "IMPACT"
  | "KEYWORD_ALIGNMENT"
  | "GRAMMAR"
  | "REDUNDANCY";

export interface OptimizationChange {
  type: OptimizationChangeType;
  description: string;
}

export interface OptimizationTarget {
  recommendationId: string;
  type: OptimizationType;
  section: "EXPERIENCE" | "PROJECTS" | "SUMMARY" | "SKILLS" | "OTHER";
  bulletId?: string;
  sourceText: string;
  sourceEvidenceIds: string[];
  skillIds?: string[];
  requirementIds?: string[];
  constraints: OptimizationConstraint[];
  isRewritable: boolean;
  nonRewritableReason?: string;
  engineVersion: string;
}

export interface AIOptimizationProposal {
  proposalId: string;
  recommendationId: string;
  originalText: string;
  optimizedText: string;
  changes: OptimizationChange[];
  preservedEvidenceIds: string[];
  addedClaims: string[];
  removedClaims: string[];
  confidence: number;
}

export interface OptimizationValidationError {
  code: string;
  message: string;
  unsupportedValue?: string;
}

export interface OptimizationValidationWarning {
  code: string;
  message: string;
}

export interface OptimizationValidationResult {
  valid: boolean;
  safetyLevel: OptimizationSafetyLevel;
  safetyScore: number;
  errors: OptimizationValidationError[];
  warnings: OptimizationValidationWarning[];
  preservedEvidenceIds: string[];
  unsupportedClaims: string[];
  changedMetrics: string[];
  addedSkills: string[];
  changedOwnershipClaims: string[];
  meaningPreserved: boolean;
}

export interface ResumeScoreSnapshot {
  atsScore: number;
  matchScore?: number;
  contentScore?: number;
  timestamp: string;
}

export interface OptimizationScoreComparison {
  before: ResumeScoreSnapshot;
  after: ResumeScoreSnapshot;
  delta: {
    ats: number;
    match?: number;
    content?: number;
  };
  improved: boolean;
  regressed: boolean;
}

export interface TargetOption {
  bulletId: string;
  section: "EXPERIENCE" | "PROJECTS" | "SUMMARY" | "SKILLS" | "OTHER";
  roleOrProject?: string;
  sourceText: string;
}

export interface ResumeOptimizationDraft {
  draftId: string;
  resumeId: string;
  baseResumeVersionId: string;
  recommendationId: string;
  target: OptimizationTarget;
  availableTargets?: TargetOption[];
  originalText: string;
  proposedText: string;
  validation: OptimizationValidationResult;
  beforeScores: ResumeScoreSnapshot;
  afterScores?: ResumeScoreSnapshot;
  scoreComparison?: OptimizationScoreComparison;
  decision?: OptimizationDecision;
  status: "PROPOSED" | "VALIDATED" | "REJECTED" | "ACCEPTED" | "DISCARDED";
  createdAt: string;
}

export interface OptimizationHistoryEntry {
  optimizationId: string;
  resumeId: string;
  recommendationId: string;
  originalVersionId: string;
  resultingVersionId?: string;
  decision: OptimizationDecision;
  scoreComparison: OptimizationScoreComparison;
  createdAt: string;
}
