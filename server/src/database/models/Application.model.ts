import { Schema, model, Document, Types } from "mongoose";
import { ApplicationStatus, ApplicationSource } from "@/core/constants/enums";
import { ResumeDocument } from "@/modules/resume-intelligence/document/resume-document.types";
import { ResumeBuilderConfig } from "@/modules/resume-intelligence/builder/builder.types";

// 1. Canonical Tailoring Provenance (matches Resume.model.ts)
export interface IResumeTailoringProvenance {
  sourceProfileVersion?: number | null;
  sourceTailoringPlanId?: Types.ObjectId | null;
  sourceTailoringPlanVersion?: number | null;
  parentResumeId?: Types.ObjectId | null;
  targetJobId?: Types.ObjectId | null;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
}

// 2. Self-Contained Resume Snapshot
export interface IResumeSnapshot {
  resumeId: Types.ObjectId;
  title: string;
  variantType?: "MASTER" | "TAILORED";
  resumeUpdatedAt?: Date;
  // Canonical Resume Document AST + Builder Configuration
  resumeDocument?: ResumeDocument | null;
  builderConfig?: ResumeBuilderConfig | null;
  // Deterministic Cryptographic Checksum
  snapshotHash?: string; // SHA-256
  // Canonical Provenance
  provenance?: IResumeTailoringProvenance | null;
  // Legacy file fields (backward compatibility with recruiter applications)
  originalFileName?: string | null;
  fileName?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  version?: number;
  // Snapshot Timestamps: capturedAt is canonical in 6F, submittedAt preserved for legacy
  capturedAt: Date;
  submittedAt?: Date;
}

// 3. Historical Job Identity Snapshot (Preserves Nullability)
export interface IJobIdentitySnapshot {
  jobProfileId?: Types.ObjectId | null;
  companyName?: string | null;
  jobTitle?: string | null;
  jobUrl?: string | null;
  location?: string | null;
  seniority?: string | null;
}

// 4. Strengthened Timeline Event (backward-compatible with { status, changedAt, changedBy, reason })
export type ApplicationTimelineEventType =
  | "CREATED"
  | "APPLIED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED";

export interface IApplicationTimelineEvent {
  id?: string;
  type?: ApplicationTimelineEventType;
  status: ApplicationStatus;
  fromStatus?: ApplicationStatus | null;
  toStatus?: ApplicationStatus | null;
  note?: string | null;
  changedAt: Date;
  changedBy?: string | null;
  reason?: string | null;
}

// Backward-compatible alias
export type IApplicationStatusHistory = IApplicationTimelineEvent;

// 5. Main Application Interface
export interface IApplication extends Document {
  _id: Types.ObjectId;
  userId: string;
  source: ApplicationSource;

  // Job References
  jobId?: Types.ObjectId | null;        // Recruiter platform Job
  jobProfileId?: Types.ObjectId | null; // Analyzed JobProfile (Phase 6F)
  jobIdentitySnapshot?: IJobIdentitySnapshot | null;

  // Resume References & Snapshot
  resumeId?: Types.ObjectId | null;
  resumeSnapshot?: IResumeSnapshot | null;

  // Status & Timeline
  status: ApplicationStatus;
  statusHistory: IApplicationTimelineEvent[];

  // Application Timestamps
  appliedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const tailoringProvenanceSchema = new Schema<IResumeTailoringProvenance>(
  {
    sourceProfileVersion: { type: Number, default: null },
    sourceTailoringPlanId: { type: Schema.Types.ObjectId, ref: "TailoringPlan", default: null },
    sourceTailoringPlanVersion: { type: Number, default: null },
    parentResumeId: { type: Schema.Types.ObjectId, ref: "Resume", default: null },
    targetJobId: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    targetJobTitle: { type: String, default: null, trim: true },
    targetCompany: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IApplicationTimelineEvent>(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId().toString(),
    },
    type: {
      type: String,
      enum: ["CREATED", "APPLIED", "STATUS_CHANGED", "NOTE_ADDED"],
      default: "STATUS_CHANGED",
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      required: true,
    },
    fromStatus: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: null,
    },
    toStatus: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: null,
    },
    note: { type: String, default: null, trim: true },
    changedAt: { type: Date, default: Date.now, required: true },
    changedBy: { type: String, default: null },
    reason: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const resumeSnapshotSchema = new Schema<IResumeSnapshot>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    title: { type: String, required: true, trim: true },
    variantType: {
      type: String,
      enum: ["MASTER", "TAILORED"],
      default: "TAILORED",
    },
    resumeUpdatedAt: { type: Date, default: Date.now },
    resumeDocument: { type: Schema.Types.Mixed, default: null },
    builderConfig: { type: Schema.Types.Mixed, default: null },
    snapshotHash: { type: String, default: "" },
    provenance: { type: tailoringProvenanceSchema, default: null },
    originalFileName: { type: String, default: null, trim: true },
    fileName: { type: String, default: null, trim: true },
    storageKey: { type: String, default: null, trim: true },
    mimeType: { type: String, default: null, trim: true },
    fileSize: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    capturedAt: { type: Date, default: Date.now, required: true },
    submittedAt: { type: Date, default: null },
  },
  { _id: false }
);

const jobIdentitySnapshotSchema = new Schema<IJobIdentitySnapshot>(
  {
    jobProfileId: { type: Schema.Types.ObjectId, ref: "JobProfile", default: null },
    companyName: { type: String, default: null, trim: true },
    jobTitle: { type: String, default: null, trim: true },
    jobUrl: { type: String, default: null, trim: true },
    location: { type: String, default: null, trim: true },
    seniority: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(ApplicationSource),
      default: ApplicationSource.PLATFORM,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      default: null,
      index: true,
    },
    jobProfileId: {
      type: Schema.Types.ObjectId,
      ref: "JobProfile",
      default: null,
      index: true,
    },
    jobIdentitySnapshot: {
      type: jobIdentitySnapshotSchema,
      default: null,
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
    appliedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "applications",
  }
);

// Legacy platform unique index preserved with partial filter
applicationSchema.index(
  { userId: 1, jobId: 1 },
  { unique: true, partialFilterExpression: { jobId: { $exists: true, $type: "objectId" } } }
);

// Phase 6F Active Application query index (No blanket unique constraint)
applicationSchema.index({ userId: 1, jobProfileId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

export const ApplicationModel = model<IApplication>("Application", applicationSchema);
