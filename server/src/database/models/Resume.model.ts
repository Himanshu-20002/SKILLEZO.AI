import { Schema, model, Document, Types } from "mongoose";
import { ResumeStatus } from "@/core/constants/enums";

export interface IResumePersonalInfo {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface IResumeSkill {
  name: string;
  category?: string | null;
}

export interface IResumeEducation {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface IResumeExperience {
  companyName: string;
  jobTitle: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
}

export interface IResumeProject {
  title: string;
  description?: string | null;
  technologies?: string[];
  link?: string | null;
}

export interface IResumeCertification {
  name: string;
  issuer?: string | null;
  issueDate?: Date | null;
}

export interface IResumeExtractedData {
  personalInfo?: IResumePersonalInfo | null;
  summary?: string | null;
  skills: IResumeSkill[];
  education: IResumeEducation[];
  experience: IResumeExperience[];
  projects: IResumeProject[];
  certifications: IResumeCertification[];
  totalExperienceYears?: number | null;
  parserVersion?: string | null;
}

export interface IResume extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  originalFileName: string;
  fileName: string;
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  isDefault: boolean;
  status: ResumeStatus;
  version: number;
  extractedData?: IResumeExtractedData | null;
  parsingError?: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const personalInfoSchema = new Schema<IResumePersonalInfo>(
  {
    fullName: { type: String, default: null, trim: true },
    email: { type: String, default: null, trim: true },
    phone: { type: String, default: null, trim: true },
    location: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeSkillSchema = new Schema<IResumeSkill>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeEducationSchema = new Schema<IResumeEducation>(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, default: null, trim: true },
    fieldOfStudy: { type: String, default: null, trim: true },
    startYear: { type: Number, default: null },
    endYear: { type: Number, default: null },
  },
  { _id: false }
);

const resumeExperienceSchema = new Schema<IResumeExperience>(
  {
    companyName: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeProjectSchema = new Schema<IResumeProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    technologies: [{ type: String, trim: true }],
    link: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeCertificationSchema = new Schema<IResumeCertification>(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, default: null, trim: true },
    issueDate: { type: Date, default: null },
  },
  { _id: false }
);

const extractedDataSchema = new Schema<IResumeExtractedData>(
  {
    personalInfo: { type: personalInfoSchema, default: null },
    summary: { type: String, default: null, trim: true },
    skills: [resumeSkillSchema],
    education: [resumeEducationSchema],
    experience: [resumeExperienceSchema],
    projects: [resumeProjectSchema],
    certifications: [resumeCertificationSchema],
    totalExperienceYears: { type: Number, default: null },
    parserVersion: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ResumeStatus),
      required: true,
      default: ResumeStatus.UPLOADED,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    extractedData: {
      type: extractedDataSchema,
      default: null,
    },
    parsingError: {
      type: String,
      default: null,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "resumes",
  }
);

resumeSchema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });
resumeSchema.index({ userId: 1, createdAt: -1 });

export const ResumeModel = model<IResume>("Resume", resumeSchema);
