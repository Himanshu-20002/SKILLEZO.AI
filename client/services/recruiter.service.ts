import { apiFetch } from "@/lib/api";

export type ApplicationStage =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface RecruiterApplicationItem {
  id: string;
  status: ApplicationStage;
  job: {
    id: string;
    title: string;
    companyName?: string | null;
  } | null;
  candidate: {
    id: string;
    name?: string;
    email?: string;
    headline?: string;
    employabilityScore?: number;
    skills?: string[];
  };
  resume: {
    id: string;
    title: string;
    originalFileName: string;
    version: number;
  } | null;
  appliedAt: string;
  updatedAt: string;
}

export interface RecruiterApplicationDetails {
  id: string;
  status: ApplicationStage;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    department?: string | null;
    location?: string | null;
    employmentType?: string | null;
  } | null;
  candidate: {
    id: string;
    name?: string;
    email?: string;
    headline?: string;
    phone?: string;
    location?: string;
    bio?: string;
    employabilityScore?: number;
    verifiedSkills?: Array<{
      name: string;
      proficiency: string;
      score: number;
      credentialHash?: string;
    }>;
  };
  resume: {
    id: string;
    title: string;
    originalFileName: string;
    contentType?: string;
    fileSize?: number;
    parsedTextSnippet?: string;
  } | null;
  recruiterNotes?: string;
}

export interface StatusHistoryItem {
  fromStatus?: string | null;
  toStatus: string;
  changedBy: string;
  reason?: string;
  changedAt: string;
}

export interface PaginatedRecruiterApplications {
  items: RecruiterApplicationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const recruiterService = {
  async getApplications(params?: {
    page?: number;
    limit?: number;
    jobId?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedRecruiterApplications> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.jobId && params.jobId !== "all") query.set("jobId", params.jobId);
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    const url = `/api/recruiter/applications${qs ? `?${qs}` : ""}`;
    const res = await apiFetch<{ success: boolean; data: PaginatedRecruiterApplications }>(url);
    return res.data;
  },

  async getApplicationDetails(applicationId: string): Promise<RecruiterApplicationDetails> {
    const res = await apiFetch<{ success: boolean; data: RecruiterApplicationDetails }>(
      `/api/recruiter/applications/${applicationId}`
    );
    return res.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStage,
    reason?: string
  ): Promise<RecruiterApplicationDetails> {
    const res = await apiFetch<{ success: boolean; data: RecruiterApplicationDetails }>(
      `/api/recruiter/applications/${applicationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      }
    );
    return res.data;
  },

  async getStatusHistory(applicationId: string): Promise<StatusHistoryItem[]> {
    const res = await apiFetch<{ success: boolean; data: StatusHistoryItem[] }>(
      `/api/recruiter/applications/${applicationId}/status-history`
    );
    return res.data;
  },

  getResumeStreamUrl(applicationId: string): string {
    return `/api/recruiter/applications/${applicationId}/resume`;
  },
};
