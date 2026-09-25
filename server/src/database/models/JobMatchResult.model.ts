import { Schema, model, Document, Types } from "mongoose";
import {
  JobRequirementCategory,
  JobRequirementImportance,
} from "./JobProfile.model";

export type MatchState =
  | "PROVEN_RELEVANT"
  | "PROVEN_UNDERREPRESENTED"
  | "PARTIAL_MATCH"
  | "RELATED_EVIDENCE"
  | "MISSING"
  | "INSUFFICIENT_EVIDENCE"
  | "NOT_APPLICABLE"
  | "NEEDS_REVIEW";

export type CareerEvidenceSourceType =
  | "EXPERIENCE"
  | "PROJECT"
  | "SKILL"
  | "EDUCATION"
  | "COMPETENCY"
  | "PROFILE";

export interface ICareerEvidenceReference {
  sourceType: CareerEvidenceSourceType;
  sourceId: string;
  label: string;
  excerpt?: string;
}

export interface IJobRequirementMatch {
  requirementId: string;
  name: string;
  normalizedName: string;
  category: JobRequirementCategory;
  importance: JobRequirementImportance;
  matchState: MatchState;
  evidence: ICareerEvidenceReference[];
  confidence: number;
  explanation?: string;
}

export interface IJobMatchSummary {
  totalRequirements: number;
  proven: number;
  underrepresented: number;
  partial: number;
  related: number;
  missing: number;
  insufficient: number;
  needsReview: number;
  requiredTotal: number;
  requiredProven: number;
}

export interface IJobMatchResult extends Document {
  _id: Types.ObjectId;
  userId: string;
  jobProfileId: Types.ObjectId;
  sourceProfileVersion: number;
  jobAnalysisVersion: number;
  requirementMatches: IJobRequirementMatch[];
  summary: IJobMatchSummary;
  overallMatch?: {
    score: number;
    label: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const CareerEvidenceReferenceSchema = new Schema<ICareerEvidenceReference>(
  {
    sourceType: {
      type: String,
      enum: [
        "EXPERIENCE",
        "PROJECT",
        "SKILL",
        "EDUCATION",
        "COMPETENCY",
        "PROFILE",
      ],
      required: true,
    },
    sourceId: { type: String, required: true },
    label: { type: String, required: true },
    excerpt: { type: String, default: null },
  },
  { _id: false }
);

const JobRequirementMatchSchema = new Schema<IJobRequirementMatch>(
  {
    requirementId: { type: String, required: true },
    name: { type: String, required: true },
    normalizedName: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "SKILL",
        "TECHNOLOGY",
        "TOOL",
        "DOMAIN",
        "QUALIFICATION",
        "EDUCATION",
        "EXPERIENCE",
      ],
      required: true,
    },
    importance: {
      type: String,
      enum: ["REQUIRED", "PREFERRED", "UNKNOWN"],
      required: true,
      default: "REQUIRED",
    },
    matchState: {
      type: String,
      enum: [
        "PROVEN_RELEVANT",
        "PROVEN_UNDERREPRESENTED",
        "PARTIAL_MATCH",
        "RELATED_EVIDENCE",
        "MISSING",
        "INSUFFICIENT_EVIDENCE",
        "NOT_APPLICABLE",
        "NEEDS_REVIEW",
      ],
      required: true,
    },
    evidence: {
      type: [CareerEvidenceReferenceSchema],
      default: [],
    },
    confidence: { type: Number, required: true, default: 1.0 },
    explanation: { type: String, default: null },
  },
  { _id: false }
);

const JobMatchSummarySchema = new Schema<IJobMatchSummary>(
  {
    totalRequirements: { type: Number, required: true, default: 0 },
    proven: { type: Number, required: true, default: 0 },
    underrepresented: { type: Number, required: true, default: 0 },
    partial: { type: Number, required: true, default: 0 },
    related: { type: Number, required: true, default: 0 },
    missing: { type: Number, required: true, default: 0 },
    insufficient: { type: Number, required: true, default: 0 },
    needsReview: { type: Number, required: true, default: 0 },
    requiredTotal: { type: Number, required: true, default: 0 },
    requiredProven: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const JobMatchResultSchema = new Schema<IJobMatchResult>(
  {
    userId: { type: String, required: true, index: true },
    jobProfileId: {
      type: Schema.Types.ObjectId,
      ref: "JobProfile",
      required: true,
      index: true,
    },
    sourceProfileVersion: { type: Number, required: true, default: 1 },
    jobAnalysisVersion: { type: Number, required: true, default: 1 },
    requirementMatches: {
      type: [JobRequirementMatchSchema],
      default: [],
    },
    summary: {
      type: JobMatchSummarySchema,
      required: true,
    },
    overallMatch: {
      score: { type: Number },
      label: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "job_match_results",
  }
);

// One active match result per user per job profile
JobMatchResultSchema.index({ userId: 1, jobProfileId: 1 }, { unique: true });

export const JobMatchResultModel =
  model<IJobMatchResult>("JobMatchResult", JobMatchResultSchema);
