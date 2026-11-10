import { Schema, model, Document, Types } from "mongoose";
import {
  InterviewMode,
  InterviewType,
  InterviewDifficulty,
  InterviewSessionStatus,
} from "@/modules/interview-coach/domain/interview.enums";

export interface IInterviewSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  mode: InterviewMode;
  durationMinutes: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  status: InterviewSessionStatus;
  templateId?: Types.ObjectId | null;
  resumeId?: Types.ObjectId | null;
  jobId?: Types.ObjectId | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    experienceLevel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    interviewType: {
      type: String,
      enum: Object.values(InterviewType),
      required: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(InterviewDifficulty),
      required: true,
    },
    mode: {
      type: String,
      enum: Object.values(InterviewMode),
      default: InterviewMode.TEXT,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 10,
      max: 90,
      default: 30,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 3,
      max: 20,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(InterviewSessionStatus),
      default: InterviewSessionStatus.PENDING,
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewTemplate",
      default: null,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "interview_sessions",
  }
);

// Indexes matching query patterns from Phase 1 specification
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, status: 1 });

export const InterviewSessionModel = model<IInterviewSession>(
  "InterviewSession",
  interviewSessionSchema
);

