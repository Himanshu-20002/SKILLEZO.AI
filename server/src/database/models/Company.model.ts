import { Schema, model, Document, Types } from "mongoose";
import { CompanySize, CompanyVerificationStatus } from "@/core/constants/enums";

export interface ICompanyLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  location?: ICompanyLocation | null;
  companySize?: CompanySize | null;
  verificationStatus: CompanyVerificationStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ICompanyLocation>(
  {
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    industry: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: null,
      trim: true,
    },
    location: {
      type: locationSchema,
      default: null,
    },
    companySize: {
      type: String,
      enum: Object.values(CompanySize),
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(CompanyVerificationStatus),
      required: true,
      default: CompanyVerificationStatus.PENDING,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "companies",
  }
);

companySchema.index({ "location.city": 1 });

export const CompanyModel = model<ICompany>("Company", companySchema);
