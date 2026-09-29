import { apiFetch } from "@/lib/api";
import {
  CreateApplicationDTO,
  CreateJobProfileApplicationDTO,
  ApplyJobResponse,
  GetApplicationsQueryParams,
  PaginatedApplicationsResponse,
  PaginatedApplicationListResponse,
  ApplicationRecord,
  ApplicationStatusHistoryItem,
  WithdrawApplicationDTO,
  ApplicationStatus,
} from "@/types/application";

export const applicationService = {
  /**
   * Submit an application to a platform job using an uploaded resume.
   */
  async applyToJob(dto: CreateApplicationDTO): Promise<ApplyJobResponse> {
    const res = await apiFetch<{ success: boolean; data: ApplyJobResponse }>("/api/applications", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    return res.data;
  },

  /**
   * Phase 6F: Track an application for an analyzed JobProfile + Tailored Resume.
   * Can be created in 'draft' or 'applied' status.
   */
  async applyToJobProfile(dto: CreateJobProfileApplicationDTO): Promise<ApplicationRecord> {
    const res = await apiFetch<{ success: boolean; data: ApplicationRecord }>(
      "/api/applications/job-profile",
      {
        method: "POST",
        body: JSON.stringify(dto),
      }
    );
    return res.data;
  },

  /**
   * Retrieve candidate's applications (metadata-only for dashboard performance).
   */
  async getMyApplicationsList(
    params: GetApplicationsQueryParams = {}
  ): Promise<PaginatedApplicationListResponse> {
    const query = new URLSearchParams();
    if (params.page && params.page > 0) query.set("page", params.page.toString());
    if (params.limit && params.limit > 0) query.set("limit", params.limit.toString());
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.jobProfileId) query.set("jobProfileId", params.jobProfileId);
    if (params.source) query.set("source", params.source);
    if (params.search) query.set("search", params.search);
    query.set("metadataOnly", "true");

    const qs = query.toString();
    const endpoint = `/api/applications${qs ? `?${qs}` : ""}`;

    const res = await apiFetch<{ success: boolean; data: PaginatedApplicationListResponse }>(endpoint);
    return res.data;
  },

  /**
   * Retrieve candidate's submitted job applications with full records.
   */
  async getMyApplications(
    params: GetApplicationsQueryParams = {}
  ): Promise<PaginatedApplicationsResponse> {
    const query = new URLSearchParams();
    if (params.page && params.page > 0) query.set("page", params.page.toString());
    if (params.limit && params.limit > 0) query.set("limit", params.limit.toString());
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.jobProfileId) query.set("jobProfileId", params.jobProfileId);

    const qs = query.toString();
    const endpoint = `/api/applications${qs ? `?${qs}` : ""}`;

    const res = await apiFetch<{ success: boolean; data: PaginatedApplicationsResponse }>(endpoint);
    return res.data;
  },

  /**
   * Retrieve lightweight array of applied job IDs for the current candidate.
   */
  async getAppliedJobIds(): Promise<string[]> {
    const res = await apiFetch<{ success: boolean; data: string[] }>("/api/applications/my-job-ids");
    return res.data;
  },

  /**
   * Retrieve single application details by ID (including immutable resume snapshot).
   */
  async getApplicationById(applicationId: string): Promise<ApplicationRecord> {
    const res = await apiFetch<{ success: boolean; data: ApplicationRecord }>(
      `/api/applications/${applicationId}`
    );
    return res.data;
  },

  /**
   * Phase 6F: Advance application status.
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    reason?: string
  ): Promise<ApplicationRecord> {
    const res = await apiFetch<{ success: boolean; data: ApplicationRecord }>(
      `/api/applications/${applicationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      }
    );
    return res.data;
  },

  /**
   * Phase 6F: Add a candidate timeline note.
   */
  async addTimelineNote(
    applicationId: string,
    note: string
  ): Promise<ApplicationRecord> {
    const res = await apiFetch<{ success: boolean; data: ApplicationRecord }>(
      `/api/applications/${applicationId}/timeline`,
      {
        method: "POST",
        body: JSON.stringify({ note }),
      }
    );
    return res.data;
  },

  /**
   * Phase 6F: Delete application record (ownership enforced; never mutates resume or job profile).
   */
  async deleteApplication(
    applicationId: string
  ): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch<{ success: boolean; data: { success: boolean; id: string } }>(
      `/api/applications/${applicationId}`,
      {
        method: "DELETE",
      }
    );
    return res.data;
  },

  /**
   * Retrieve application status progression history.
   */
  async getApplicationStatusHistory(
    applicationId: string
  ): Promise<ApplicationStatusHistoryItem[]> {
    const res = await apiFetch<{ success: boolean; data: ApplicationStatusHistoryItem[] }>(
      `/api/applications/${applicationId}/status-history`
    );
    return res.data;
  },

  /**
   * Withdraw a submitted application.
   */
  async withdrawApplication(
    applicationId: string,
    reason?: string
  ): Promise<ApplicationRecord> {
    const body: WithdrawApplicationDTO = {};
    if (reason) body.reason = reason;

    const res = await apiFetch<{ success: boolean; data: ApplicationRecord }>(
      `/api/applications/${applicationId}/withdraw`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );
    return res.data;
  },
};
