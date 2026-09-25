import { z } from "zod";
import {
  ITailoringPlan,
  ITailoringProposal,
  ITailoringTargetRef,
  ITailoringEvidenceRef,
  TailoringAction,
  TailoringTargetSection,
  TailoringTargetField,
  TailoringPriority,
  UserProposalDecision,
  TailoringPlanStatus,
  TailoringIntensity,
  ITailoringPlanSummary,
} from "@/database/models/TailoringPlan.model";

export const TailoringActionSchema = z.enum([
  "KEEP",
  "EMPHASIZE",
  "PROMOTE",
  "DE_EMPHASIZE",
  "REWRITE",
  "REORDER",
  "SELECT",
  "EXCLUDE",
  "DO_NOT_ADD",
]);

export const TailoringTargetSectionSchema = z.enum([
  "SUMMARY",
  "SKILLS",
  "EXPERIENCE",
  "PROJECTS",
  "EDUCATION",
  "SECTION_ORDER",
]);

export const TailoringTargetFieldSchema = z.enum([
  "summary.text",
  "skills.list",
  "experience.bullet",
  "experience.selection",
  "projects.selection",
  "projects.bullet",
  "projects.techStack",
  "education.selection",
  "layout.sectionOrder",
]);

export const TailoringIntensitySchema = z.enum(["LIGHT", "BALANCED", "AGGRESSIVE"]);

export const UserProposalDecisionSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EDITED",
]);

export const CreateTailoringPlanInputSchema = z.object({
  intensity: TailoringIntensitySchema.optional().default("BALANCED"),
  force: z.boolean().optional().default(false),
});

export type CreateTailoringPlanInput = z.infer<typeof CreateTailoringPlanInputSchema>;

export const UpdateProposalDecisionSchema = z.object({
  decision: UserProposalDecisionSchema,
  editedValue: z.string().optional().nullable(),
});

export type UpdateProposalDecisionInput = z.infer<typeof UpdateProposalDecisionSchema>;

export const BatchProposalDecisionsSchema = z.preprocess((val: any) => {
  if (val && typeof val === "object") {
    const rawUpdates = val.updates || val.decisions || [];
    return { updates: rawUpdates };
  }
  return val;
}, z.object({
  updates: z
    .array(
      z.object({
        proposalId: z.string().min(1),
        decision: UserProposalDecisionSchema,
        editedValue: z.string().optional().nullable(),
      })
    )
    .min(1, "Must provide at least one proposal decision"),
}));

export type BatchProposalDecisionsInput = z.infer<typeof BatchProposalDecisionsSchema>;

export const RegeneratePlanInputSchema = z.object({
  intensity: TailoringIntensitySchema.optional(),
  force: z.boolean().optional().default(false),
});

export type RegeneratePlanInput = z.infer<typeof RegeneratePlanInputSchema>;

// DTO Contracts
export interface TailoringProposalDTO {
  id: string;
  action: TailoringAction;
  target: ITailoringTargetRef;
  title: string;
  currentValue: string | null;
  proposedValue: string | null;
  reason: string;
  requirementIds: string[];
  evidence: ITailoringEvidenceRef[];
  confidence: number;
  priority: TailoringPriority;
  userDecision: UserProposalDecision;
  userEditedValue: string | null;
  groupKey: string | null;
  isProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TailoringPlanDTO {
  id: string;
  userId: string;
  jobProfileId: string;
  jobMatchResultId: string;
  planVersion: number;
  sourceProfileVersion: number;
  jobAnalysisVersion: number;
  matchResultGeneratedAt: string;
  intensity: TailoringIntensity;
  status: TailoringPlanStatus;
  proposals: TailoringProposalDTO[];
  summary: ITailoringPlanSummary;
  proposedSectionOrder?: string[];
  currentSectionOrder?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TailoringPlanResponseDTO {
  tailoringPlan: TailoringPlanDTO | null;
  isStale: boolean;
}

export function toTailoringProposalDTO(prop: ITailoringProposal): TailoringProposalDTO {
  return {
    id: prop.id,
    action: prop.action,
    target: {
      section: prop.target.section,
      field: prop.target.field,
      entityId: prop.target.entityId || null,
      subEntityId: prop.target.subEntityId || null,
      bulletIndex: prop.target.bulletIndex !== undefined ? prop.target.bulletIndex : null,
    },
    title: prop.title,
    currentValue: prop.currentValue || null,
    proposedValue: prop.proposedValue || null,
    reason: prop.reason,
    requirementIds: prop.requirementIds || [],
    evidence: (prop.evidence || []).map((e) => ({
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      label: e.label,
      excerpt: e.excerpt || null,
    })),
    confidence: prop.confidence ?? 1.0,
    priority: prop.priority || "MEDIUM",
    userDecision: prop.userDecision || "PENDING",
    userEditedValue: prop.userEditedValue || null,
    groupKey: prop.groupKey || null,
    isProtected: prop.isProtected ?? false,
    createdAt: prop.createdAt ? prop.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: prop.updatedAt ? prop.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export function toTailoringPlanDTO(plan: ITailoringPlan): TailoringPlanDTO {
  return {
    id: plan._id ? plan._id.toString() : "",
    userId: plan.userId,
    jobProfileId: plan.jobProfileId,
    jobMatchResultId: plan.jobMatchResultId,
    planVersion: plan.planVersion || 1,
    sourceProfileVersion: plan.sourceProfileVersion,
    jobAnalysisVersion: plan.jobAnalysisVersion,
    matchResultGeneratedAt: plan.matchResultGeneratedAt.toISOString(),
    intensity: plan.intensity,
    status: plan.status,
    proposals: (plan.proposals || []).map(toTailoringProposalDTO),
    summary: plan.summary,
    proposedSectionOrder: plan.proposedSectionOrder,
    currentSectionOrder: plan.currentSectionOrder,
    createdAt: plan.createdAt ? plan.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: plan.updatedAt ? plan.updatedAt.toISOString() : new Date().toISOString(),
  };
}
