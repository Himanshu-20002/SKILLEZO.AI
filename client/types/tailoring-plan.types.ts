/**
 * Phase 6C: Tailoring Plan + User Approval Types (Frontend)
 */

export type TailoringAction =
  | "KEEP"
  | "EMPHASIZE"
  | "PROMOTE"
  | "DE_EMPHASIZE"
  | "REWRITE"
  | "REORDER"
  | "SELECT"
  | "EXCLUDE"
  | "DO_NOT_ADD";

export type ProposalDecision = "PENDING" | "ACCEPTED" | "REJECTED" | "EDITED";

export type TailoringIntensity = "LIGHT" | "BALANCED" | "AGGRESSIVE";

export type ProposalPriority = "HIGH" | "MEDIUM" | "LOW";

export type TargetSection =
  | "SUMMARY"
  | "SKILLS"
  | "EXPERIENCE"
  | "PROJECTS"
  | "EDUCATION"
  | "SECTION_ORDER";

export interface ITailoringTargetRef {
  section: TargetSection;
  field: string;
  entityId?: string;
  subEntityId?: string;
  bulletIndex?: number;
}

export interface ITailoringEvidenceRef {
  sourceType: "EXPERIENCE" | "PROJECT" | "EDUCATION" | "SKILL" | "CERTIFICATION";
  sourceId: string;
  label: string;
  excerpt?: string | null;
}

export interface TailoringProposalDTO {
  id: string;
  action: TailoringAction;
  target: ITailoringTargetRef;
  title: string;
  currentValue?: string | null;
  proposedValue?: string | null;
  reason: string;
  requirementIds: string[];
  evidence: ITailoringEvidenceRef[];
  confidence: number;
  priority: ProposalPriority;
  userDecision: ProposalDecision;
  userEditedValue?: string | null;
  rejectionReason?: string | null;
  groupKey?: string | null;
  isProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TailoringPlanSummary {
  totalProposals: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  editedCount: number;
  protectedCount: number;
  actionBreakdown: Record<string, number>;
  sectionBreakdown: Record<string, number>;
}

export interface TailoringPlanDTO {
  id: string;
  userId: string;
  jobProfileId: string;
  sourceProfileVersion: number;
  jobAnalysisVersion: number;
  intensity: TailoringIntensity;
  status: "DRAFT" | "READY" | "APPLIED" | "SUPERSEDED";
  planVersion: number;
  isStale: boolean;
  stalenessReason?: string | null;
  proposals: TailoringProposalDTO[];
  proposedSectionOrder?: string[];
  currentSectionOrder?: string[];
  summary: TailoringPlanSummary;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProposalDecisionInput {
  decision: "ACCEPTED" | "REJECTED" | "EDITED" | "PENDING";
  editedValue?: string;
  rejectionReason?: string;
}

export interface BatchProposalDecisionsInput {
  decisions: Array<{
    proposalId: string;
    decision: "ACCEPTED" | "REJECTED" | "EDITED" | "PENDING";
    editedValue?: string;
    rejectionReason?: string;
  }>;
}
