import { Schema, model, Document } from "mongoose";
import { UserRole, AccountStatus } from "@/core/constants/enums";

export interface IUser extends Document<string> {
  _id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.CANDIDATE,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      required: true,
      default: AccountStatus.ACTIVE,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
    _id: false,
  }
);

export const UserModel = model<IUser>("User", userSchema);
