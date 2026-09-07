import { Schema, model, Document, Types } from "mongoose";

export type VerificationStatusType = "verified" | "failed" | "in_review" | "pending";
export type ProficiencyLevelType = "Expert" | "Advanced" | "Intermediate" | "Beginner";

export interface IVerificationRecord extends Document {
  _id: Types.ObjectId;
  userId: string;
  skillName: string;
  category: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: VerificationStatusType;
  proficiency: ProficiencyLevelType;
  credentialHash: string;
  issueDate: Date;
  expiresAt?: Date | null;
  assessor: string;
  details?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const verificationRecordSchema = new Schema<IVerificationRecord>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "Technical",
      trim: true,
    },
    topicId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["verified", "failed", "in_review", "pending"],
      default: "verified",
      required: true,
    },
    proficiency: {
      type: String,
      enum: ["Expert", "Advanced", "Intermediate", "Beginner"],
      default: "Intermediate",
      required: true,
    },
    credentialHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    assessor: {
      type: String,
      default: "SKILLEZO AI Engine v4.2",
      trim: true,
    },
    details: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

verificationRecordSchema.index({ userId: 1, topicId: 1 });

export const VerificationModel = model<IVerificationRecord>(
  "VerificationRecord",
  verificationRecordSchema
);
