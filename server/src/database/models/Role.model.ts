import { Schema, model, Document, Types } from "mongoose";
import { RoleStatus } from "@/core/constants/enums";

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string | null;
  status: RoleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
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
    status: {
      type: String,
      enum: Object.values(RoleStatus),
      required: true,
      default: RoleStatus.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "roles",
  }
);

export const RoleModel = model<IRole>("Role", roleSchema);
