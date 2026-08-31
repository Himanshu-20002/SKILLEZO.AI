import { Schema, model, Document, Types } from "mongoose";
import {
  JobEmploymentType,
  WorkplaceType,
  JobStatus,
  CompetencyImportance,
  JobSourceType,
  JobSourceProvider,
} from "@/core/constants/enums";

export interface IJobLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  raw?: string | null;
}

export interface IJobRequiredSkill {
  name: string;
  requiredLevel: number;
  importance: CompetencyImportance;
  minYearsOfExperience?: number | null;
}

export interface IJobSalary {
  min?: number | null;
  max?: number | null;
  currency?: string | null;
  raw?: string | null;
}

export interface IJob extends Document {
  _id: Types.ObjectId;
  sourceType: JobSourceType;
  sourceProvider?: string | null;
  externalId?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  companyName?: string | null;
  rawLocation?: string | null;
  rawSalary?: string | null;
  sourceUpdatedAt?: Date | null;
  importedAt?: Date | null;
  companyId?: Types.ObjectId | null;
  roleId?: Types.ObjectId | null;
  createdBy?: string | null;
  title: string;
  description: string;
  employmentType?: JobEmploymentType | string | null;
  workplaceType?: WorkplaceType | string | null;
  location?: IJobLocation | null;
  requiredSkills: IJobRequiredSkill[];
  minExperienceYears: number;
  salary?: IJobSalary | null;
  status: JobStatus;
  publishedAt?: Date | null;
  closesAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<IJobLocation>(
  {
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
    raw: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const requiredSkillSchema = new Schema<IJobRequiredSkill>(
  {
    name: { type: String, required: true, trim: true },
    requiredLevel: { type: Number, required: true, min: 1, max: 5 },
    importance: {
      type: String,
      enum: Object.values(CompetencyImportance),
      required: true,
      default: CompetencyImportance.MEDIUM,
    },
    minYearsOfExperience: { type: Number, default: null, min: 0 },
  },
  { _id: false }
);

const salarySchema = new Schema<IJobSalary>(
  {
    min: { type: Number, default: null, min: 0 },
    max: { type: Number, default: null, min: 0 },
    currency: { type: String, default: "USD", trim: true },
    raw: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const jobSchema = new Schema<IJob>(
  {
    sourceType: {
      type: String,
      enum: Object.values(JobSourceType),
      required: true,
      default: JobSourceType.PLATFORM,
      index: true,
    },
    sourceProvider: {
      type: String,
      default: undefined,
      index: true,
    },
    externalId: {
      type: String,
      default: undefined,
      index: true,
    },
    sourceUrl: {
      type: String,
      default: null,
    },
    sourceName: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      default: null,
      index: true,
    },
    rawLocation: {
      type: String,
      default: null,
    },
    rawSalary: {
      type: String,
      default: null,
    },
    sourceUpdatedAt: {
      type: Date,
      default: null,
    },
    importedAt: {
      type: Date,
      default: null,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: false,
      default: null,
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: false,
      default: null,
      index: true,
    },
    createdBy: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    workplaceType: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    location: {
      type: locationSchema,
      default: null,
    },
    requiredSkills: {
      type: [requiredSkillSchema],
      default: [],
    },
    minExperienceYears: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    salary: {
      type: salarySchema,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      required: true,
      default: JobStatus.ACTIVE,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    closesAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "jobs",
  }
);

jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ roleId: 1, status: 1 });
jobSchema.index(
  { sourceProvider: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceProvider: { $type: "string" },
      externalId: { $type: "string" },
    },
  }
);
jobSchema.index(
  { importedAt: 1 },
  {
    expireAfterSeconds: 14 * 24 * 60 * 60, // 14 days auto-expiration for external jobs
    partialFilterExpression: {
      sourceType: JobSourceType.EXTERNAL,
    },
  }
);
jobSchema.index(
  {
    title: "text",
    description: "text",
    companyName: "text",
    rawLocation: "text",
  },
  {
    weights: {
      title: 10,
      companyName: 5,
      rawLocation: 3,
      description: 1,
    },
    name: "job_text_search_index",
  }
);

export const JobModel = model<IJob>("Job", jobSchema);
