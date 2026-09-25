import { apiFetch } from "@/lib/api";
import {
  JobProfile,
  CreateJobProfileDTO,
} from "@/types/job-profile.types";

export const jobProfileService = {
  /**
   * Ingest a job description and execute grounded AI analysis.
   */
  async createAndAnalyze(input: CreateJobProfileDTO): Promise<JobProfile> {
    const res = await apiFetch<{ success: boolean; data: JobProfile }>(
      "/api/job-profiles/analyze",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  },

  /**
   * Re-analyze an existing JobProfile.
   */
  async reanalyze(id: string): Promise<JobProfile> {
    const res = await apiFetch<{ success: boolean; data: JobProfile }>(
      `/api/job-profiles/${id}/analyze`,
      {
        method: "POST",
      }
    );
    return res.data;
  },

  /**
   * Retrieve a JobProfile by ID.
   */
  async getJobProfile(id: string): Promise<JobProfile> {
    const res = await apiFetch<{ success: boolean; data: JobProfile }>(
      `/api/job-profiles/${id}`
    );
    return res.data;
  },

  /**
   * List JobProfiles for the current user.
   */
  async listJobProfiles(limit = 20, skip = 0): Promise<JobProfile[]> {
    const res = await apiFetch<{ success: boolean; data: JobProfile[] }>(
      `/api/job-profiles?limit=${limit}&skip=${skip}`
    );
    return res.data;
  },
};
