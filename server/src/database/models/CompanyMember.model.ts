import { Schema, model, Document, Types } from "mongoose";
import { CompanyMemberRole, CompanyMemberStatus } from "@/core/constants/enums";

export interface ICompanyMember extends Document {
  _id: Types.ObjectId;
  userId: string;
  companyId: Types.ObjectId;
  role: CompanyMemberRole;
  status: CompanyMemberStatus;
  invitedBy?: string | null;
  joinedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const companyMemberSchema = new Schema<ICompanyMember>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(CompanyMemberRole),
      required: true,
      default: CompanyMemberRole.RECRUITER,
    },
    status: {
      type: String,
      enum: Object.values(CompanyMemberStatus),
      required: true,
      default: CompanyMemberStatus.INVITED,
    },
    invitedBy: {
      type: String,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "company_members",
  }
);

companyMemberSchema.index({ userId: 1, companyId: 1 }, { unique: true });
companyMemberSchema.index({ companyId: 1, role: 1 });

export const CompanyMemberModel = model<ICompanyMember>("CompanyMember", companyMemberSchema);
