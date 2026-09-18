import { Schema, model, Document, Types } from "mongoose";

export const ActionTypeEnum = {
  RESUME_UPDATE: "RESUME_UPDATE",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  CAREER_PLAN_CREATE: "CAREER_PLAN_CREATE",
} as const;
export type ActionType = (typeof ActionTypeEnum)[keyof typeof ActionTypeEnum];

export const ActionStatusEnum = {
  PROPOSED: "PROPOSED",
  APPROVED: "APPROVED",
  EXECUTING: "EXECUTING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  STALE: "STALE",
} as const;
export type ActionStatus = (typeof ActionStatusEnum)[keyof typeof ActionStatusEnum];

export interface IActionTargetEntity {
  type: "resume" | "profile" | "career_plan";
  id: string;
  version?: number;
}

export interface IActionPreview {
  before: any;
  after: any;
  diffSummary?: string;
}

export interface IActionProposal extends Document {
  _id: Types.ObjectId;
  proposalId: string;
  ownerId: string;
  actionType: ActionType;
  status: ActionStatus;
  title: string;
  description: string;
  rationale: string;
  evidenceIds: string[];
  targetEntity: IActionTargetEntity;
  preview: IActionPreview;
  payload: Record<string, any>;
  result?: Record<string, any> | null;
  error?: string | null;
  idempotencyKey?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const targetEntitySchema = new Schema<IActionTargetEntity>(
  {
    type: {
      type: String,
      enum: ["resume", "profile", "career_plan"],
      required: true,
    },
    id: { type: String, required: true },
    version: { type: Number, default: null },
  },
  { _id: false }
);

const previewSchema = new Schema<IActionPreview>(
  {
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    diffSummary: { type: String, default: null },
  },
  { _id: false }
);

const actionProposalSchema = new Schema<IActionProposal>(
  {
    proposalId: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    actionType: {
      type: String,
      enum: Object.values(ActionTypeEnum),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ActionStatusEnum),
      default: ActionStatusEnum.PROPOSED,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    rationale: { type: String, required: true, trim: true },
    evidenceIds: { type: [String], default: [] },
    targetEntity: { type: targetEntitySchema, required: true },
    preview: { type: previewSchema, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    result: { type: Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    idempotencyKey: { type: String, default: null, index: true, sparse: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL Index automatically deletes document once expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

actionProposalSchema.index({ ownerId: 1, status: 1 });
actionProposalSchema.index({ ownerId: 1, createdAt: -1 });

export const ActionProposalModel = model<IActionProposal>(
  "ActionProposal",
  actionProposalSchema
);
