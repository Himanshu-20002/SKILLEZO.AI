import { Schema, model, Document, Types } from "mongoose";

export type JobRequirementCategory =
  | "SKILL"
  | "TECHNOLOGY"
  | "TOOL"
  | "DOMAIN"
  | "QUALIFICATION"
  | "EDUCATION"
  | "EXPERIENCE";

export type JobRequirementImportance = "REQUIRED" | "PREFERRED" | "UNKNOWN";

export type JobSeniority =
  | "INTERN"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "PRINCIPAL"
  | "EXECUTIVE"
  | "UNKNOWN";

export type JobAnalysisStatus = "DRAFT" | "ANALYZING" | "ANALYZED" | "FAILED";

export interface IJobRequirementEvidence {
  text: string;
  section?: string | null;
}

export interface IJobRequirementItem {
  name: string;
  normalizedName: string;
  category: JobRequirementCategory;
  importance: JobRequirementImportance;
  evidence: IJobRequirementEvidence;
  confidence: number;
}

export interface IJobProfileAnalysis {
  normalizedRoleTitle?: string | null;
  seniority?: JobSeniority | null;
  responsibilities: string[];
  requirements: IJobRequirementItem[];
  experienceRequirements: string[];
  educationRequirements: string[];
  domain?: string | null;
  location?: string | null;
  employmentType?: string | null;
  keywords: string[];
}

export interface IJobProfileAnalysisMetadata {
  source: "AI" | "MOCK" | "DETERMINISTIC";
  provider: string;
  model?: string | null;
  analyzedAt: Date;
}

export interface IJobProfileAnalysisError {
  code:
    | "AI_ANALYSIS_FAILED"
    | "VALIDATION_FAILED"
    | "MODEL_TIMEOUT"
    | "MODEL_UNAVAILABLE"
    | "SCHEMA_VALIDATION_FAILED";
  occurredAt: Date;
}

export interface IJobProfile extends Document {
  _id: Types.ObjectId;
  userId: string;
  displayName: string;
  jobTitle: string;
  company?: string | null;
  jobUrl?: string | null;
  rawDescription: string;
  normalizedDescription: string;
  sourceHash: string;
  jobFingerprint: string;
  analysis?: IJobProfileAnalysis | null;
  analysisStatus: JobAnalysisStatus;
  analysisVersion: number;
  analysisMetadata?: IJobProfileAnalysisMetadata | null;
  analysisError?: IJobProfileAnalysisError | null;
  createdAt: Date;
  updatedAt: Date;
}

const requirementItemSchema = new Schema<IJobRequirementItem>(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: ["SKILL", "TECHNOLOGY", "TOOL", "DOMAIN", "QUALIFICATION", "EDUCATION", "EXPERIENCE"],
    },
    importance: {
      type: String,
      required: true,
      enum: ["REQUIRED", "PREFERRED", "UNKNOWN"],
      default: "REQUIRED",
    },
    evidence: {
      text: { type: String, required: true, trim: true },
      section: { type: String, default: null, trim: true },
    },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 1.0 },
  },
  { _id: false }
);

const analysisSchema = new Schema<IJobProfileAnalysis>(
  {
    normalizedRoleTitle: { type: String, default: null, trim: true },
    seniority: {
      type: String,
      default: "UNKNOWN",
      enum: ["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE", "UNKNOWN"],
    },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [requirementItemSchema], default: [] },
    experienceRequirements: { type: [String], default: [] },
    educationRequirements: { type: [String], default: [] },
    domain: { type: String, default: null, trim: true },
    location: { type: String, default: null, trim: true },
    employmentType: { type: String, default: null, trim: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const analysisMetadataSchema = new Schema<IJobProfileAnalysisMetadata>(
  {
    source: { type: String, required: true, enum: ["AI", "MOCK", "DETERMINISTIC"] },
    provider: { type: String, required: true },
    model: { type: String, default: null },
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const analysisErrorSchema = new Schema<IJobProfileAnalysisError>(
  {
    code: {
      type: String,
      required: true,
      enum: [
        "AI_ANALYSIS_FAILED",
        "VALIDATION_FAILED",
        "MODEL_TIMEOUT",
        "MODEL_UNAVAILABLE",
        "SCHEMA_VALIDATION_FAILED",
      ],
    },
    occurredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobProfileSchema = new Schema<IJobProfile>(
  {
    userId: { type: String, required: true, index: true },
    displayName: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, default: null, trim: true },
    jobUrl: { type: String, default: null, trim: true },
    rawDescription: { type: String, required: true },
    normalizedDescription: { type: String, required: true },
    sourceHash: { type: String, required: true, index: true },
    jobFingerprint: { type: String, required: true, index: true },
    analysis: { type: analysisSchema, default: null },
    analysisStatus: {
      type: String,
      required: true,
      enum: ["DRAFT", "ANALYZING", "ANALYZED", "FAILED"],
      default: "DRAFT",
      index: true,
    },
    analysisVersion: { type: Number, required: true, default: 1 },
    analysisMetadata: { type: analysisMetadataSchema, default: null },
    analysisError: { type: analysisErrorSchema, default: null },
  },
  {
    timestamps: true,
    collection: "job_profiles",
  }
);

// User-scoped partial unique index: A user cannot duplicate analyzed profiles for the exact same job fingerprint
jobProfileSchema.index(
  { userId: 1, jobFingerprint: 1 },
  { unique: true, partialFilterExpression: { analysisStatus: "ANALYZED" } }
);
jobProfileSchema.index({ userId: 1, createdAt: -1 });

export const JobProfileModel = model<IJobProfile>("JobProfile", jobProfileSchema);
