import { Schema, model, Document } from "mongoose";
import { PlanTier } from "./Subscription.model";

export interface ITokenAccount extends Document {
  _id: any;
  userId: string;
  tier: PlanTier;
  totalAllowance: number;
  consumedTokens: number;
  remainingTokens: number;
  bonusTokens: number;
  lastRefillAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenAccountSchema = new Schema<ITokenAccount>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(PlanTier),
      default: PlanTier.FREE,
      required: true,
    },
    totalAllowance: {
      type: Number,
      required: true,
      default: 5000,
      min: 0,
    },
    consumedTokens: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    remainingTokens: {
      type: Number,
      required: true,
      default: 5000,
      min: 0,
      index: true,
    },
    bonusTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRefillAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "token_accounts",
  }
);

tokenAccountSchema.pre("save", function () {
  this.remainingTokens = Math.max(0, (this.totalAllowance || 0) + (this.bonusTokens || 0) - (this.consumedTokens || 0));
});

export const TokenAccountModel = model<ITokenAccount>("TokenAccount", tokenAccountSchema);
