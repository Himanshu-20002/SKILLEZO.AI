import mongoose, { Document, Schema } from "mongoose";

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

export type TailoringTargetSection =
  | "SUMMARY"
  | "SKILLS"
  | "EXPERIENCE"
  | "PROJECTS"
  | "EDUCATION"
  | "SECTION_ORDER";

export type TailoringTargetField =
  | "summary.text"
  | "skills.list"
  | "experience.bullet"
  | "experience.selection"
  | "projects.selection"
  | "projects.bullet"
  | "projects.techStack"
  | "education.selection"
  | "layout.sectionOrder";

export interface ITailoringTargetRef {
  section: TailoringTargetSection;
  field: TailoringTargetField;
  entityId?: string | null;     // e.g. experience item ID or project item ID
  subEntityId?: string | null;  // e.g. bullet ID
  bulletIndex?: number | null;  // 0-indexed position within entity bullets
}

export type TailoringPriority = "HIGH" | "MEDIUM" | "LOW";

export type UserProposalDecision = "PENDING" | "ACCEPTED" | "REJECTED" | "EDITED";

export type TailoringPlanStatus =
  | "DRAFT"
  | "READY_FOR_REVIEW"
  | "IN_REVIEW"
  | "APPROVED"
  | "APPLIED"
  | "STALE";

export type TailoringIntensity = "LIGHT" | "BALANCED" | "AGGRESSIVE";

export interface ITailoringEvidenceRef {
  sourceType: "EXPERIENCE" | "PROJECT" | "SKILL" | "EDUCATION";
  sourceId: string;
  label: string;
  excerpt?: string | null;
}

export interface ITailoringProposal {
  id: string; // Deterministic proposal ID (e.g. "prop_skills_promote_1")
  action: TailoringAction;
  target: ITailoringTargetRef;
  title: string;
  currentValue?: string | null;
  proposedValue?: string | null;
  reason: string;
  requirementIds: string[];
  evidence: ITailoringEvidenceRef[];
  confidence: number;
  priority: TailoringPriority;
  userDecision: UserProposalDecision;
  userEditedValue?: string | null;
  groupKey?: string | null; // e.g. "SKILLS_FRONTEND"
  isProtected?: boolean;   // true for DO_NOT_ADD advisory shields
  createdAt: Date;
  updatedAt: Date;
}

export interface ITailoringPlanSummary {
  totalProposals: number;
  actionableTotal: number;
  pending: number;
  accepted: number;
  edited: number;
  rejected: number;
  doNotAdd: number;
}

export interface ITailoringPlan extends Document {
  userId: string;
  jobProfileId: string;
  jobMatchResultId: string;
  planVersion: number;
  sourceProfileVersion: number;
  jobAnalysisVersion: number;
  matchResultGeneratedAt: Date;
  intensity: TailoringIntensity;
  status: TailoringPlanStatus;
  proposals: ITailoringProposal[];
  summary: ITailoringPlanSummary;
  proposedSectionOrder?: string[];
  currentSectionOrder?: string[];
  appliedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TailoringTargetRefSchema = new Schema<ITailoringTargetRef>(
  {
    section: {
      type: String,
      enum: ["SUMMARY", "SKILLS", "EXPERIENCE", "PROJECTS", "EDUCATION", "SECTION_ORDER"],
      required: true,
    },
    field: {
      type: String,
      enum: [
        "summary.text",
        "skills.list",
        "experience.bullet",
        "experience.selection",
        "projects.selection",
        "projects.bullet",
        "projects.techStack",
        "education.selection",
        "layout.sectionOrder",
      ],
      required: true,
    },
    entityId: { type: String, default: null },
    subEntityId: { type: String, default: null },
    bulletIndex: { type: Number, default: null },
  },
  { _id: false }
);

const TailoringEvidenceRefSchema = new Schema<ITailoringEvidenceRef>(
  {
    sourceType: {
      type: String,
      enum: ["EXPERIENCE", "PROJECT", "SKILL", "EDUCATION"],
      required: true,
    },
    sourceId: { type: String, required: true },
    label: { type: String, required: true },
    excerpt: { type: String, default: null },
  },
  { _id: false }
);

const TailoringProposalSchema = new Schema<ITailoringProposal>(
  {
    id: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "KEEP",
        "EMPHASIZE",
        "PROMOTE",
        "DE_EMPHASIZE",
        "REWRITE",
        "REORDER",
        "SELECT",
        "EXCLUDE",
        "DO_NOT_ADD",
      ],
      required: true,
    },
    target: { type: TailoringTargetRefSchema, required: true },
    title: { type: String, required: true },
    currentValue: { type: String, default: null },
    proposedValue: { type: String, default: null },
    reason: { type: String, required: true },
    requirementIds: { type: [String], default: [] },
    evidence: { type: [TailoringEvidenceRefSchema], default: [] },
    confidence: { type: Number, default: 1.0 },
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },
    userDecision: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EDITED"],
      default: "PENDING",
    },
    userEditedValue: { type: String, default: null },
    groupKey: { type: String, default: null },
    isProtected: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TailoringPlanSummarySchema = new Schema<ITailoringPlanSummary>(
  {
    totalProposals: { type: Number, default: 0 },
    actionableTotal: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    edited: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    doNotAdd: { type: Number, default: 0 },
  },
  { _id: false }
);

const TailoringPlanSchema = new Schema<ITailoringPlan>(
  {
    userId: { type: String, required: true, index: true },
    jobProfileId: { type: String, required: true, index: true },
    jobMatchResultId: { type: String, required: true },
    planVersion: { type: Number, default: 1 },
    sourceProfileVersion: { type: Number, required: true },
    jobAnalysisVersion: { type: Number, required: true },
    matchResultGeneratedAt: { type: Date, required: true },
    intensity: {
      type: String,
      enum: ["LIGHT", "BALANCED", "AGGRESSIVE"],
      default: "BALANCED",
      required: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "READY_FOR_REVIEW", "IN_REVIEW", "APPROVED", "APPLIED", "STALE"],
      default: "READY_FOR_REVIEW",
      required: true,
    },
    proposals: { type: [TailoringProposalSchema], default: [] },
    summary: { type: TailoringPlanSummarySchema, required: true },
    proposedSectionOrder: { type: [String], default: undefined },
    currentSectionOrder: { type: [String], default: undefined },
    appliedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "tailoringplans",
  }
);

// Unique compound index: exactly one active tailoring plan document per user per target job profile
TailoringPlanSchema.index({ userId: 1, jobProfileId: 1 }, { unique: true });

export const TailoringPlanModel =
  mongoose.models.TailoringPlan ||
  mongoose.model<ITailoringPlan>("TailoringPlan", TailoringPlanSchema);
