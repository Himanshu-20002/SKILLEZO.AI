import { Schema, model, Document } from "mongoose";

export enum PlanTier {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
}

export interface ISubscription extends Document {
  _id: any;
  userId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  billingCycle?: "MONTHLY" | "YEARLY" | null;
  startedAt: Date;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
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
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY", null],
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  }
);

export const SubscriptionModel = model<ISubscription>("Subscription", subscriptionSchema);
