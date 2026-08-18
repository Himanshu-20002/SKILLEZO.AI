import { Schema, model, Document, Types } from "mongoose";
import { ApplicationStatus } from "@/core/constants/enums";

export interface IApplicationStatusHistory {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: string | null;
  reason?: string | null;
}

export interface IResumeSnapshot {
  resumeId: Types.ObjectId;
  title: string;
  originalFileName: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  version: number;
  submittedAt: Date;
}

export interface IApplication extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  userId: string;
  resumeId?: Types.ObjectId | null;
  resumeSnapshot?: IResumeSnapshot | null;
  status: ApplicationStatus;
  statusHistory: IApplicationStatusHistory[];
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IApplicationStatusHistory>(
  {
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      required: true,
    },
    changedAt: { type: Date, default: Date.now, required: true },
    changedBy: {
      type: String,
      default: null,
    },
    reason: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeSnapshotSchema = new Schema<IResumeSnapshot>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    storageKey: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true },
    version: { type: Number, default: 1 },
    submittedAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    resumeSnapshot: {
      type: resumeSnapshotSchema,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      required: true,
      default: ApplicationStatus.APPLIED,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    appliedAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
    collection: "applications",
  }
);

applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

export const ApplicationModel = model<IApplication>("Application", applicationSchema);
