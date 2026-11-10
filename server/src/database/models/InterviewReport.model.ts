import { Schema, model, Document, Types } from "mongoose";

export interface IInterviewReport extends Document {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  userId: string;
  rubricVersion: string;
  overallScore?: number;
  dimensionScores: Map<string, number>;
  readinessLevel?: string;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const interviewReportSchema = new Schema<IInterviewReport>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    rubricVersion: {
      type: String,
      required: true,
      default: "1.0",
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: undefined,
    },
    dimensionScores: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    readinessLevel: {
      type: String,
      default: undefined,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvementAreas: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "interview_reports",
  }
);

// Report lookup by user and session
interviewReportSchema.index({ userId: 1, sessionId: 1 });

export const InterviewReportModel = model<IInterviewReport>(
  "InterviewReport",
  interviewReportSchema
);

