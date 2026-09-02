export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface CreateApplicationDTO {
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
}

export interface WithdrawApplicationDTO {
  reason?: string;
}

export interface ApplicationStatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  changedBy?: string | null;
  reason?: string | null;
}

export interface ApplicationResumeSnapshot {
  resumeId: string;
  title: string;
  originalFileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  version: number;
  submittedAt: string;
}

export interface ApplicationJobSummary {
  id: string;
  title: string;
  companyName?: string | null;
  location?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  status?: string | null;
}

export interface ApplicationResumeSummary {
  id: string;
  title: string;
  isDefault: boolean;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string | null;
  status: ApplicationStatus;
  job?: ApplicationJobSummary | null;
  resume?: ApplicationResumeSummary | null;
  resumeSnapshot?: ApplicationResumeSnapshot | null;
  statusHistory: ApplicationStatusHistoryItem[];
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalApplicationRedirect {
  type: "external_application";
  sourceType: "external";
  sourceProvider: string;
  externalId?: string | null;
  sourceUrl: string;
  message: string;
}

export type ApplyJobResponse = ApplicationRecord | ExternalApplicationRedirect;

export function isExternalApplication(
  response: ApplyJobResponse
): response is ExternalApplicationRedirect {
  return (response as ExternalApplicationRedirect).type === "external_application";
}

export interface GetApplicationsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface PaginatedApplicationsResponse {
  items: ApplicationRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
