import { Schema, model, Document } from "mongoose";

export enum TokenFeature {
  WELCOME_BONUS = "WELCOME_BONUS",
  RESUME_ATS = "RESUME_ATS",
  TAILORED_RESUME = "TAILORED_RESUME",
  CAREER_COACH = "CAREER_COACH",
  MOCK_INTERVIEW = "MOCK_INTERVIEW",
  SKILL_GAP = "SKILL_GAP",
  PROMOTION_BONUS = "PROMOTION_BONUS",
  PLAN_UPGRADE = "PLAN_UPGRADE",
}

export interface ITokenUsageLog extends Document {
  _id: any;
  userId: string;
  feature: TokenFeature;
  tokensDeducted: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: {
    modelUsed?: string;
    targetJobId?: string;
    sessionId?: string;
    actionProposalId?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

const tokenUsageLogSchema = new Schema<ITokenUsageLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    feature: {
      type: String,
      enum: Object.values(TokenFeature),
      required: true,
      index: true,
    },
    tokensDeducted: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "token_usage_logs",
  }
);

tokenUsageLogSchema.index({ userId: 1, createdAt: -1 });

export const TokenUsageLogModel = model<ITokenUsageLog>("TokenUsageLog", tokenUsageLogSchema);
