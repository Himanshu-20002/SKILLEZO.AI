import { apiFetch } from "@/lib/api";
import { JobMatchResultDTO } from "@/types/job-match.types";

export const jobMatchService = {
  /**
   * Trigger or refresh Career ↔ Job Evidence Match for a job profile.
   */
  async runJobMatch(jobProfileId: string): Promise<JobMatchResultDTO> {
    const res = await apiFetch<{ success: boolean; data: JobMatchResultDTO }>(
      `/api/job-profiles/${jobProfileId}/match`,
      {
        method: "POST",
      }
    );
    return res.data;
  },

  /**
   * Retrieve existing match result with dynamic staleness state.
   */
  async getJobMatch(jobProfileId: string): Promise<JobMatchResultDTO> {
    const res = await apiFetch<{ success: boolean; data: JobMatchResultDTO }>(
      `/api/job-profiles/${jobProfileId}/match`
    );
    return res.data;
  },
};
