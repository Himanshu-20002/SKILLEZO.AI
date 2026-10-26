import { Schema, model, Document, Types } from "mongoose";

export interface IQuizAttempt {
  resourceId: Types.ObjectId;
  score: number;
  passingScore: number;
  passed: boolean;
  selectedAnswers: Record<string, number>;
  attemptedAt: Date;
}

export interface IUserLearningProgress extends Document {
  _id: Types.ObjectId;
  userId: string;
  enrolledTrackIds: Types.ObjectId[];
  completedResourceIds: Types.ObjectId[];
  inProgressTrackId?: Types.ObjectId | null;
  lastAccessedResourceId?: Types.ObjectId | null;
  quizAttempts: IQuizAttempt[];
  bookmarkedResourceIds: Types.ObjectId[];
  totalLearningMinutes: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    resourceId: { type: Schema.Types.ObjectId, ref: "LearningResource", required: true },
    score: { type: Number, required: true },
    passingScore: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    selectedAnswers: { type: Map, of: Number, default: () => new Map() },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userLearningProgressSchema = new Schema<IUserLearningProgress>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    enrolledTrackIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "LearningTrack",
      },
    ],
    completedResourceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "LearningResource",
      },
    ],
    inProgressTrackId: {
      type: Schema.Types.ObjectId,
      ref: "LearningTrack",
      default: null,
    },
    lastAccessedResourceId: {
      type: Schema.Types.ObjectId,
      ref: "LearningResource",
      default: null,
    },
    quizAttempts: {
      type: [quizAttemptSchema],
      default: [],
    },
    bookmarkedResourceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "LearningResource",
      },
    ],
    totalLearningMinutes: {
      type: Number,
      default: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const UserLearningProgressModel =
  model<IUserLearningProgress>("UserLearningProgress", userLearningProgressSchema);
