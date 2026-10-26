import { Schema, model, Document, Types } from "mongoose";
import { LearningDifficultyType } from "./LearningTrack.model";

export type ResourceType =
  | "lesson"
  | "external_doc"
  | "external_video"
  | "pdf_document"
  | "quiz"
  | "code_drill";

export interface IQuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: LearningDifficultyType;
}

export interface ILearningResourceContent {
  markdown?: string;
  externalUrl?: string;
  provider?: string;
  pdfKey?: string;
  pdfPageCount?: number;
  downloadAllowed?: boolean;
  questions?: IQuizQuestion[];
}

export interface ILearningResource extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  type: ResourceType;
  category: string;
  skills: string[];
  difficulty: LearningDifficultyType;
  estimatedMinutes: number;
  content: ILearningResourceContent;
  source: "curated" | "public_bank" | "gemini_generated" | "skillezo_original";
  reviewStatus: "draft" | "reviewed" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    codeSnippet: { type: String },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
  },
  { _id: false }
);

const learningResourceContentSchema = new Schema<ILearningResourceContent>(
  {
    markdown: { type: String },
    externalUrl: { type: String },
    provider: { type: String },
    pdfKey: { type: String },
    pdfPageCount: { type: Number },
    downloadAllowed: { type: Boolean, default: true },
    questions: { type: [quizQuestionSchema], default: [] },
  },
  { _id: false }
);

const learningResourceSchema = new Schema<ILearningResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["lesson", "external_doc", "external_video", "pdf_document", "quiz", "code_drill"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      default: 10,
    },
    content: {
      type: learningResourceContentSchema,
      required: true,
      default: () => ({}),
    },
    source: {
      type: String,
      enum: ["curated", "public_bank", "gemini_generated", "skillezo_original"],
      default: "curated",
    },
    reviewStatus: {
      type: String,
      enum: ["draft", "reviewed", "published"],
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

learningResourceSchema.index({ type: 1, reviewStatus: 1 });

export const LearningResourceModel =
  model<ILearningResource>("LearningResource", learningResourceSchema);
