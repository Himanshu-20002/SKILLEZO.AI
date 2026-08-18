import { ApplicationStatus } from "@/core/constants/enums";
import { ApplicationStatusHistoryDTO, ResumeSnapshotDTO } from "../application/application.dto";

export interface UpdateRecruiterApplicationStatusDTO {
  status: ApplicationStatus;
  reason?: string;
}

export interface RecruiterApplicationsQueryDTO {
  page?: number;
  limit?: number;
  jobId?: string;
  status?: string;
  search?: string;
}

export interface RecruiterApplicationListItemDTO {
  id: string;
  status: ApplicationStatus;
  job: {
    id: string;
    title: string;
    companyName?: string | null;
  } | null;
  candidate: {
    id: string;
  };
  resume: {
    id: string;
    title: string;
    originalFileName?: string;
    version?: number;
  } | null;
  appliedAt: Date;
  updatedAt: Date;
}

export interface RecruiterApplicationDetailsDTO {
  id: string;
  userId: string;
  status: ApplicationStatus;
  job: any;
  candidate: {
    id: string;
  };
  resume: any;
  resumeSnapshot: ResumeSnapshotDTO | null;
  statusHistory: ApplicationStatusHistoryDTO[];
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedRecruiterApplicationsResponseDTO {
  items: RecruiterApplicationListItemDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
