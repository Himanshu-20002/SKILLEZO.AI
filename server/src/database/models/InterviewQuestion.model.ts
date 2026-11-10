import { Schema, model, Document, Types } from "mongoose";
import {
  InterviewType,
  InterviewDifficulty,
  QuestionSource,
} from "@/modules/interview-coach/domain/interview.enums";

export interface IInterviewQuestion extends Document {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  sequence: number;
  questionText: string;
  category: string;
  difficulty: InterviewDifficulty;
  questionType: InterviewType;
  expectedConcepts?: string[];
  evaluationRubricVersion?: string;
  parentQuestionId?: Types.ObjectId | null;
  source: QuestionSource;
  createdAt: Date;
  updatedAt: Date;
}

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      index: true,
    },
    sequence: {
      type: Number,
      required: true,
      min: 1,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(InterviewDifficulty),
      required: true,
    },
    questionType: {
      type: String,
      enum: Object.values(InterviewType),
      required: true,
    },
    expectedConcepts: {
      type: [String],
      default: [],
    },
    evaluationRubricVersion: {
      type: String,
      default: "1.0",
    },
    parentQuestionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewQuestion",
      default: null,
    },
    source: {
      type: String,
      enum: Object.values(QuestionSource),
      default: QuestionSource.GENERATED,
    },
  },
  {
    timestamps: true,
    collection: "interview_questions",
  }
);

// Compound ordering index for session question sequence
interviewQuestionSchema.index({ sessionId: 1, sequence: 1 });

export const InterviewQuestionModel = model<IInterviewQuestion>(
  "InterviewQuestion",
  interviewQuestionSchema
);

