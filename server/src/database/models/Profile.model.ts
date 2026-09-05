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
}

export interface IProfileEducation {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface IProfileExperience {
  companyName: string;
  jobTitle: string;
  employmentType?: EmploymentType | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
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
  links?: IProfileLinks | null;
  location?: IProfileLocation | null;
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
  },
  { _id: false }
);

const profileExperienceSchema = new Schema<IProfileExperience>(
  {
    companyName: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
      default: null,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: null, trim: true },
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
    links: {
      type: profileLinksSchema,
      default: null,
    },
    location: {
      type: profileLocationSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "profiles",
  }
);

profileSchema.index({ "skills.name": 1 });

export const ProfileModel = model<IProfile>("Profile", profileSchema);
