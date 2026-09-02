import { apiFetch } from "@/lib/api";
import {
  CreateApplicationDTO,
  ApplyJobResponse,
  GetApplicationsQueryParams,
  PaginatedApplicationsResponse,
  ApplicationRecord,
  ApplicationStatusHistoryItem,
  WithdrawApplicationDTO,
} from "@/types/application";

export const applicationService = {
  /**
   * Submit an application to a job using an uploaded resume.
   */
  async applyToJob(dto: CreateApplicationDTO): Promise<ApplyJobResponse> {
    const res = await apiFetch<{ success: boolean; data: ApplyJobResponse }>("/api/applications", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    return res.data;
  },

  /**
   * Retrieve candidate's submitted job applications with pagination and filters.
   */
  async getMyApplications(
    params: GetApplicationsQueryParams = {}
  ): Promise<PaginatedApplicationsResponse> {
    const query = new URLSearchParams();
    if (params.page && params.page > 0) query.set("page", params.page.toString());
    if (params.limit && params.limit > 0) query.set("limit", params.limit.toString());
    if (params.status) query.set("status", params.status);

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
   * Retrieve single application details by ID.
   */
  async getApplicationById(applicationId: string): Promise<ApplicationRecord> {
    const res = await apiFetch<{ success: boolean; data: ApplicationRecord }>(
      `/api/applications/${applicationId}`
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
