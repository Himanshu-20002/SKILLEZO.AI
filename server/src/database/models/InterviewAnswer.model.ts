import { Schema, model, Document, Types } from "mongoose";

export interface IInterviewAnswer extends Document {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  questionId: Types.ObjectId;
  userId: string;
  answerText: string;
  transcriptText?: string;
  responseDurationSeconds?: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const interviewAnswerSchema = new Schema<IInterviewAnswer>(
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
    userId: {
      type: String,
      required: true,
      index: true,
    },
    answerText: {
      type: String,
      required: true,
      trim: true,
    },
    transcriptText: {
      type: String,
      default: undefined,
    },
    responseDurationSeconds: {
      type: Number,
      default: undefined,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "interview_answers",
  }
);

// Unique compound index: prevents duplicate submissions per question in a session
interviewAnswerSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });
interviewAnswerSchema.index({ userId: 1, submittedAt: -1 });

export const InterviewAnswerModel = model<IInterviewAnswer>(
  "InterviewAnswer",
  interviewAnswerSchema
);

