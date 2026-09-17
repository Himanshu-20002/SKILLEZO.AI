export type EvidenceType = "DETERMINISTIC" | "EXTRACTED" | "AI_GENERATED";

export type VerificationStatus = "VERIFIED" | "UNVERIFIED" | "REVIEW_REQUIRED";

export interface VerifiedEvidenceItem {
  id: string;
  sourceEngine: string;
  sourceEntity: string;
  sourceId?: string;
  metric: string;
  value: number | string | boolean | string[] | Record<string, any>;
  evidenceType: EvidenceType;
  verificationStatus: VerificationStatus;
  description?: string;
  extractedAt: Date;
  conflictDetails?: string;
}

export interface RawEvidenceItem {
  sourceEngine: string;
  sourceEntity: string;
  sourceId?: string;
  metric: string;
  value: any;
  evidenceType: EvidenceType;
  verificationStatus?: VerificationStatus;
  description?: string;
  extractedAt?: Date;
}

export interface CandidateEvidenceBundle {
  candidateId: string;
  targetRole?: string;
  verifiedAt: Date;
  items: VerifiedEvidenceItem[];
  stats: {
    total: number;
    deterministicCount: number;
    extractedCount: number;
    reviewRequiredCount: number;
  };
}

export const APPROVED_DETERMINISTIC_ENGINES = [
  "SkillGapEngine",
  "EmployabilityEngine",
  "ResumeAtsEngine",
  "ResumeSectionEngine",
  "ResumeDocumentNormalizer",
  "JobMatchingEngine",
  "ProfileService",
] as const;

export type ApprovedDeterministicEngine = typeof APPROVED_DETERMINISTIC_ENGINES[number];
