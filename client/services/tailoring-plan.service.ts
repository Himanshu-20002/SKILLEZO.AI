import { apiFetch } from "@/lib/api";
import {
  TailoringPlanDTO,
  TailoringIntensity,
  UpdateProposalDecisionInput,
  BatchProposalDecisionsInput,
} from "@/types/tailoring-plan.types";

export const tailoringPlanService = {
  /**
   * Create or fetch the TailoringPlan for a specific JobProfile.
   */
  async createOrGetPlan(
    jobProfileId: string,
    intensity: TailoringIntensity = "BALANCED"
  ): Promise<TailoringPlanDTO> {
    const res = await apiFetch<{
      success: boolean;
      data: { tailoringPlan?: TailoringPlanDTO } | TailoringPlanDTO;
    }>(`/api/job-profiles/${jobProfileId}/tailoring-plan`, {
      method: "POST",
      body: JSON.stringify({ intensity }),
    });
    return (res.data as any)?.tailoringPlan || res.data;
  },

  /**
   * Get an existing TailoringPlan.
   */
  async getPlan(jobProfileId: string): Promise<TailoringPlanDTO> {
    const res = await apiFetch<{
      success: boolean;
      data: { tailoringPlan?: TailoringPlanDTO } | TailoringPlanDTO;
    }>(`/api/job-profiles/${jobProfileId}/tailoring-plan`);
    return (res.data as any)?.tailoringPlan || res.data;
  },

  /**
   * Update an individual proposal decision (ACCEPTED, REJECTED, EDITED).
   */
  async updateDecision(
    jobProfileId: string,
    proposalId: string,
    input: UpdateProposalDecisionInput
  ): Promise<TailoringPlanDTO> {
    const res = await apiFetch<{
      success: boolean;
      data: { tailoringPlan?: TailoringPlanDTO } | TailoringPlanDTO;
    }>(
      `/api/job-profiles/${jobProfileId}/tailoring-plan/proposals/${proposalId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return (res.data as any)?.tailoringPlan || res.data;
  },

  /**
   * Batch update multiple proposals (e.g. Accept All Non-Conflicting).
   */
  async batchUpdateDecisions(
    jobProfileId: string,
    input: BatchProposalDecisionsInput
  ): Promise<TailoringPlanDTO> {
    const decisions = input.decisions || (input as any).updates || [];
    const res = await apiFetch<{
      success: boolean;
      data: { tailoringPlan?: TailoringPlanDTO } | TailoringPlanDTO;
    }>(
      `/api/job-profiles/${jobProfileId}/tailoring-plan/proposals/batch`,
      {
        method: "PATCH",
        body: JSON.stringify({ decisions, updates: decisions }),
      }
    );
    return (res.data as any)?.tailoringPlan || res.data;
  },

  /**
   * Regenerate plan with updated intensity or fresh prompt.
   */
  async regeneratePlan(
    jobProfileId: string,
    intensity: TailoringIntensity,
    force = false
  ): Promise<TailoringPlanDTO> {
    const res = await apiFetch<{
      success: boolean;
      data: { tailoringPlan?: TailoringPlanDTO } | TailoringPlanDTO;
    }>(`/api/job-profiles/${jobProfileId}/tailoring-plan/regenerate`, {
      method: "POST",
      body: JSON.stringify({ intensity, force }),
    });
    return (res.data as any)?.tailoringPlan || res.data;
  },
};
