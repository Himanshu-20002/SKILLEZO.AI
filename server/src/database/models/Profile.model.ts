import { Schema, model, Document, Types } from "mongoose";
import { SkillSource, EmploymentType } from "@/core/constants/enums";

export interface IProfileSkill {
  name: string;
  category?: string | null;
  level: number;
  proficiency?: string | null;
  score?: number | null;
  source: SkillSource;
  verified: boolean;
  evidenceIds?: string[];
}

export interface IProfileEducation {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  evidenceIds?: string[];
}

export interface IProfileExperience {
  companyName?: string | null;
  jobTitle?: string | null;
  employmentType?: EmploymentType | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
  bullets?: string[];
  technologiesUsed?: string[];
  evidenceIds?: string[];
}

export interface IProfileLinks {
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
}

export interface IProfileLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface IProfileProject {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string | null;
  liveDemoUrl?: string | null;
  featured?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  evidenceIds?: string[];
}

export interface IProfileCompletenessSection {
  status: "COMPLETE" | "INCOMPLETE" | "EMPTY";
  score: number;
  weight: number;
  missingFields: string[];
}

export interface IProfileCompleteness {
  score: number;
  missingFields: string[];
  sections: {
    identity: IProfileCompletenessSection;
    contact: IProfileCompletenessSection;
    summary: IProfileCompletenessSection;
    skills: IProfileCompletenessSection;
    experience: IProfileCompletenessSection;
    projects: IProfileCompletenessSection;
    education: IProfileCompletenessSection;
    links: IProfileCompletenessSection;
  };
  lastCalculatedAt: Date;
}

export interface IProfile extends Document {
  _id: Types.ObjectId;
  userId: string;
  headline?: string | null;
  phone?: string | null;
  targetRole?: string | null;
  targetRoleId?: Types.ObjectId | null;
  bio?: string | null;
  skills: IProfileSkill[];
  education: IProfileEducation[];
  experience: IProfileExperience[];
  projects: IProfileProject[];
  links?: IProfileLinks | null;
  location?: IProfileLocation | null;
  profileVersion: number;
  completeness?: IProfileCompleteness | null;
  completionPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const profileSkillSchema = new Schema<IProfileSkill>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Technical", trim: true },
    level: { type: Number, required: true, min: 1, max: 5, default: 4 },
    proficiency: { type: String, default: "Advanced", trim: true },
    score: { type: Number, min: 0, max: 100, default: 85 },
    source: {
      type: String,
      enum: Object.values(SkillSource),
      required: true,
      default: SkillSource.PROFILE,
    },
    verified: { type: Boolean, required: true, default: false },
    evidenceIds: [{ type: String, trim: true }],
  },
  { _id: false }
);

const profileEducationSchema = new Schema<IProfileEducation>(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, default: null, trim: true },
    fieldOfStudy: { type: String, default: null, trim: true },
    startYear: { type: Number, default: null },
    endYear: { type: Number, default: null },
    evidenceIds: [{ type: String, trim: true }],
  },
  { _id: false }
);

const profileExperienceSchema = new Schema<IProfileExperience>(
  {
    companyName: { type: String, default: null, trim: true },
    jobTitle: { type: String, default: null, trim: true },
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
      default: null,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: null, trim: true },
    bullets: [{ type: String, trim: true }],
    technologiesUsed: [{ type: String, trim: true }],
    evidenceIds: [{ type: String, trim: true }],
  },
  { _id: false }
);

const profileLinksSchema = new Schema<IProfileLinks>(
  {
    github: { type: String, default: null, trim: true },
    linkedin: { type: String, default: null, trim: true },
    portfolio: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const profileLocationSchema = new Schema<IProfileLocation>(
  {
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const profileProjectSchema = new Schema<IProfileProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    techStack: [{ type: String, trim: true }],
    githubUrl: { type: String, default: null, trim: true },
    liveDemoUrl: { type: String, default: null, trim: true },
    featured: { type: Boolean, default: false },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    evidenceIds: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    targetRole: {
      type: String,
      default: "Senior Full Stack Engineer",
      trim: true,
    },
    targetRoleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
      index: true,
    },
    bio: {
      type: String,
      default: null,
      trim: true,
    },
    skills: [profileSkillSchema],
    education: [profileEducationSchema],
    experience: [profileExperienceSchema],
    projects: [profileProjectSchema],
    links: {
      type: profileLinksSchema,
      default: null,
    },
    location: {
      type: profileLocationSchema,
      default: null,
    },
    profileVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
    completeness: {
      type: Schema.Types.Mixed,
      default: null,
    },
    completionPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    collection: "profiles",
  }
);

profileSchema.index({ "skills.name": 1 });

export const ProfileModel = model<IProfile>("Profile", profileSchema);
