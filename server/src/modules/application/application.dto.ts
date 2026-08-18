import { ApplicationStatus } from "@/core/constants/enums";

export interface CreateApplicationDTO {
  jobId: string;
  resumeId?: string;
}

export interface WithdrawApplicationDTO {
  reason?: string;
}

export interface ApplicationStatusHistoryDTO {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: string | null;
  reason?: string | null;
}

export interface ResumeSnapshotDTO {
  resumeId: string;
  title: string;
  originalFileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  version: number;
  submittedAt: Date;
}

export interface ApplicationResponseDTO {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string | null;
  status: ApplicationStatus;
  job?: any;
  resume?: any;
  resumeSnapshot?: ResumeSnapshotDTO | null;
  statusHistory: ApplicationStatusHistoryDTO[];
  appliedAt: Date;
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
