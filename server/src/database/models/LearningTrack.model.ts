import { Schema, model, Document, Types } from "mongoose";

export interface ITrackModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  resourceIds: Types.ObjectId[];
}

export type LearningCategoryType =
  | "Frontend"
  | "Backend"
  | "Database"
  | "Cloud"
  | "DevOps"
  | "System Design"
  | "AI/ML";

export type LearningDifficultyType = "beginner" | "intermediate" | "advanced";

export interface ILearningTrack extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  category: LearningCategoryType;
  description: string;
  targetRoles: string[];
  targetSkills: string[];
  difficulty: LearningDifficultyType;
  estimatedMinutes: number;
  iconName: string;
  accentColor: string;
  modules: ITrackModule[];
  finalAssessmentTopicId?: string;
  isFeatured: boolean;
  published: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const trackModuleSchema = new Schema<ITrackModule>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, required: true, default: 0 },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "LearningResource" }],
  },
  { _id: false }
);

const learningTrackSchema = new Schema<ILearningTrack>(
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
    category: {
      type: String,
      enum: ["Frontend", "Backend", "Database", "Cloud", "DevOps", "System Design", "AI/ML"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    targetRoles: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    targetSkills: [
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
      index: true,
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      default: 60,
    },
    iconName: {
      type: String,
      default: "GraduationCap",
    },
    accentColor: {
      type: String,
      default: "#3D5AFE",
    },
    modules: {
      type: [trackModuleSchema],
      default: [],
    },
    finalAssessmentTopicId: {
      type: String,
      trim: true,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

learningTrackSchema.index({ category: 1, published: 1 });

export const LearningTrackModel =
  model<ILearningTrack>("LearningTrack", learningTrackSchema);
