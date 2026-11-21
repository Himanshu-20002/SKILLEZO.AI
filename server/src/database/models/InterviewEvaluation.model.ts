import { Schema, model, Document, Types } from "mongoose";

export interface IInterviewEvaluation extends Document {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  questionId: Types.ObjectId;
  answerId: Types.ObjectId;
  userId: string;
  rubricVersion: string;
  provider: string;
  aiModel: string;
  promptVersion: string;
  scores: Map<string, number>;
  evidence: string[];
  strengths: string[];
  improvementAreas: string[];
  modelAnswerSuggestion?: string;
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const interviewEvaluationSchema = new Schema<IInterviewEvaluation>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewQuestion",
      required: true,
      index: true,
    },
    answerId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewAnswer",
      required: true,
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
    provider: {
      type: String,
      required: true,
      default: "gemini",
    },
    aiModel: {
      type: String,
      required: true,
      default: "gemini-2.5-flash",
    },
    promptVersion: {
      type: String,
      required: true,
      default: "1.0",
    },
    scores: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    evidence: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvementAreas: {
      type: [String],
      default: [],
    },
    modelAnswerSuggestion: {
      type: String,
      default: "",
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "interview_evaluations",
  }
);

// Evaluation lookup by session and question
interviewEvaluationSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });

export const InterviewEvaluationModel = model<IInterviewEvaluation>(
  "InterviewEvaluation",
  interviewEvaluationSchema
);
