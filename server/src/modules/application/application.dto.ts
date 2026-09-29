import { ApplicationStatus, ApplicationSource } from "@/core/constants/enums";
import { IJobIdentitySnapshot, IResumeTailoringProvenance } from "@/database/models/Application.model";
import { ResumeDocument } from "@/modules/resume-intelligence/document/resume-document.types";
import { ResumeBuilderConfig } from "@/modules/resume-intelligence/builder/builder.types";

export interface CreateApplicationDTO {
  jobId: string;
  resumeId?: string;
}

export interface CreateJobProfileApplicationDTO {
  jobProfileId: string;
  resumeId: string;
  status?: ApplicationStatus; // draft or applied
}

export interface UpdateApplicationStatusDTO {
  status: ApplicationStatus;
  reason?: string;
}

export interface AddApplicationTimelineNoteDTO {
  note: string;
}

export interface WithdrawApplicationDTO {
  reason?: string;
}

export interface ApplicationTimelineEventDTO {
  id?: string;
  type?: "CREATED" | "APPLIED" | "STATUS_CHANGED" | "NOTE_ADDED";
  status: ApplicationStatus;
  fromStatus?: ApplicationStatus | null;
  toStatus?: ApplicationStatus | null;
  note?: string | null;
  changedAt: Date;
  changedBy?: string | null;
  reason?: string | null;
}

// Backward compatibility alias
export type ApplicationStatusHistoryDTO = ApplicationTimelineEventDTO;

export interface ResumeSnapshotDTO {
  resumeId: string;
  title: string;
  variantType?: "MASTER" | "TAILORED";
  resumeUpdatedAt?: Date;
  resumeDocument?: ResumeDocument | null;
  builderConfig?: ResumeBuilderConfig | null;
  snapshotHash?: string;
  provenance?: IResumeTailoringProvenance | null;
  originalFileName?: string | null;
  fileName?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  version?: number;
  capturedAt?: Date;
  submittedAt?: Date | null;
}

export interface ApplicationResponseDTO {
  id: string;
  userId: string;
  source: ApplicationSource;
  jobId?: string | null;
  jobProfileId?: string | null;
  jobIdentity?: IJobIdentitySnapshot | null;
  resumeId?: string | null;
  status: ApplicationStatus;
  job?: any;
  resume?: any;
  resumeSnapshot?: ResumeSnapshotDTO | null;
  statusHistory: ApplicationTimelineEventDTO[];
  appliedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationListItemDTO {
  id: string;
  userId: string;
  source: ApplicationSource;
  jobId?: string | null;
  jobProfileId?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  jobUrl?: string | null;
  location?: string | null;
  resumeId?: string | null;
  resumeTitle?: string | null;
  resumeVariantType?: "MASTER" | "TAILORED";
  status: ApplicationStatus;
  appliedAt?: Date | null;
  capturedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalApplicationResponseDTO {
  type: "external_application";
  sourceType: "external";
  sourceProvider: string;
  externalId?: string | null;
  sourceUrl: string;
  message: string;
}

export interface PaginatedApplicationsResponseDTO {
  items: ApplicationResponseDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginatedApplicationListDTO {
  items: ApplicationListItemDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
