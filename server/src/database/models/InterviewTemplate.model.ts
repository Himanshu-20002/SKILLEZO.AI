import { Schema, model, Document, Types } from "mongoose";
import {
  InterviewType,
  InterviewDifficulty,
} from "@/modules/interview-coach/domain/interview.enums";

export interface IInterviewTemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  role: string;
  interviewType: InterviewType;
  supportedExperienceLevels: string[];
  supportedDifficulties: InterviewDifficulty[];
  competencyAreas: string[];
  defaultDurationMinutes: number;
  defaultQuestionCount: number;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const interviewTemplateSchema = new Schema<IInterviewTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    interviewType: {
      type: String,
      enum: Object.values(InterviewType),
      required: true,
      index: true,
    },
    supportedExperienceLevels: {
      type: [String],
      default: ["entry", "junior", "mid", "senior", "lead"],
    },
    supportedDifficulties: {
      type: [String],
      enum: Object.values(InterviewDifficulty),
      default: [InterviewDifficulty.EASY, InterviewDifficulty.MEDIUM, InterviewDifficulty.HARD],
    },
    competencyAreas: {
      type: [String],
      default: [],
    },
    defaultDurationMinutes: {
      type: Number,
      required: true,
      default: 30,
    },
    defaultQuestionCount: {
      type: Number,
      required: true,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "interview_templates",
  }
);

interviewTemplateSchema.index({ role: 1, interviewType: 1 });

export const InterviewTemplateModel = model<IInterviewTemplate>(
  "InterviewTemplate",
  interviewTemplateSchema
);

