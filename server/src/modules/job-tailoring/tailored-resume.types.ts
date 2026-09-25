/**
 * SKILLEZO RESUME STUDIO — PHASE 6D
 * Tailored Resume Generation & Materialization Types
 */

export interface GenerateTailoredResumeInput {
  force?: boolean;
}

export interface TailoredResumeMetadataDTO {
  id: string;
  title: string;
  variantType: "TAILORED";
  parentResumeId: string;
  targetJobId: string;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  version: number;
  sourceTailoringPlanId?: string | null;
  sourceTailoringPlanVersion?: number | null;
  sourceProfileVersion?: number | null;
  createdAt: string;
  updatedAt: string;
  studioUrl: string;
}

export interface TailoredResumeGenerationResultDTO {
  success: boolean;
  resume: TailoredResumeMetadataDTO;
  appliedProposalsCount: number;
  rejectedProposalsCount: number;
  protectedExclusionsCount: number;
  studioUrl: string;
}

export enum TailoredResumeErrorCode {
  TAILORING_PLAN_NOT_FOUND = "TAILORING_PLAN_NOT_FOUND",
  TAILORING_PLAN_STALE = "TAILORING_PLAN_STALE",
  TAILORING_PLAN_INCOMPLETE = "TAILORING_PLAN_INCOMPLETE",
  EXISTING_TAILORED_RESUME_EDITED = "EXISTING_TAILORED_RESUME_EDITED",
  MASTER_RESUME_NOT_FOUND = "MASTER_RESUME_NOT_FOUND",
  SOURCE_VERSION_CHANGED = "SOURCE_VERSION_CHANGED",
  INVALID_TAILORING_TARGET = "INVALID_TAILORING_TARGET",
  UNSUPPORTED_TAILORING_TARGET = "UNSUPPORTED_TAILORING_TARGET",
  FACTUAL_VALIDATION_FAILED = "FACTUAL_VALIDATION_FAILED",
  PROTECTED_EXCLUSION_VIOLATION = "PROTECTED_EXCLUSION_VIOLATION",
  UNEXPLAINED_DOCUMENT_DIFF = "UNEXPLAINED_DOCUMENT_DIFF",
  CONCURRENT_GENERATION_IN_PROGRESS = "CONCURRENT_GENERATION_IN_PROGRESS",
  TAILORED_RESUME_GENERATION_FAILED = "TAILORED_RESUME_GENERATION_FAILED",
}
