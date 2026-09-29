export type ApplicationStatus =
  | "draft"
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export function getApplicationStatusLabel(status: ApplicationStatus | string): string {
  switch (status?.toLowerCase()) {
    case "draft":
      return "Draft";
    case "applied":
    case "submitted":
      return "Submitted";
    case "under_review":
      return "Under Review";
    case "shortlisted":
      return "Shortlisted";
    case "interview":
    case "interview scheduled":
      return "Interview Scheduled";
    case "offered":
    case "offer":
      return "Offer";
    case "hired":
      return "Hired";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status || "Draft";
  }
}

export interface CreateApplicationDTO {
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
}

export interface CreateJobProfileApplicationDTO {
  jobProfileId: string;
  resumeId: string;
  status?: ApplicationStatus;
}

export interface UpdateApplicationStatusDTO {
  status: ApplicationStatus;
  reason?: string;
}

export interface AddTimelineNoteDTO {
  note: string;
}

export interface WithdrawApplicationDTO {
  reason?: string;
}

export interface TimelineEvent {
  id?: string;
  type?: "CREATED" | "APPLIED" | "STATUS_CHANGED" | "NOTE_ADDED";
  status: ApplicationStatus;
  fromStatus?: ApplicationStatus | null;
  toStatus?: ApplicationStatus | null;
  note?: string | null;
  changedAt: string;
  changedBy?: string | null;
  reason?: string | null;
}

export type ApplicationStatusHistoryItem = TimelineEvent;

export interface ResumeTailoringProvenance {
  sourceProfileVersion?: number | null;
  sourceTailoringPlanId?: string | null;
  sourceTailoringPlanVersion?: number | null;
  parentResumeId?: string | null;
  targetJobId?: string | null;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
}

export interface HistoricalResumeSnapshot {
  resumeId: string;
  title: string;
  variantType?: "MASTER" | "TAILORED";
  resumeUpdatedAt?: string;
  resumeDocument?: any;
  builderConfig?: any;
  snapshotHash?: string;
  provenance?: ResumeTailoringProvenance | null;
  originalFileName?: string | null;
  fileName?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  version?: number;
  capturedAt?: string;
  submittedAt?: string | null;
}

export type ApplicationResumeSnapshot = HistoricalResumeSnapshot;

export interface JobIdentitySnapshot {
  jobProfileId?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  jobUrl?: string | null;
  location?: string | null;
  seniority?: string | null;
}

export interface ApplicationJobSummary {
  id: string;
  title: string;
  companyName?: string | null;
  location?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  status?: string | null;
  jobUrl?: string | null;
}

export interface ApplicationResumeSummary {
  id: string;
  title: string;
  variantType?: "MASTER" | "TAILORED";
  isDefault?: boolean;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  source?: "platform" | "job_intelligence" | "manual";
  jobId?: string | null;
  jobProfileId?: string | null;
  jobIdentity?: JobIdentitySnapshot | null;
  resumeId?: string | null;
  status: ApplicationStatus;
  job?: ApplicationJobSummary | null;
  resume?: ApplicationResumeSummary | null;
  resumeSnapshot?: HistoricalResumeSnapshot | null;
  statusHistory: TimelineEvent[];
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListItem {
  id: string;
  userId: string;
  source?: "platform" | "job_intelligence" | "manual";
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
  appliedAt?: string | null;
  capturedAt?: string | null;
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
  jobProfileId?: string;
  source?: string;
  search?: string;
  metadataOnly?: boolean;
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

export interface PaginatedApplicationListResponse {
  items: ApplicationListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
