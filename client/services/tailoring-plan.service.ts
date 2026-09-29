import { apiFetch } from "@/lib/api";
import {
  TailoringPlanDTO,
  TailoringIntensity,
  UpdateProposalDecisionInput,
  BatchProposalDecisionsInput,
} from "@/types/tailoring-plan.types";

function normalizePlan(raw: any): TailoringPlanDTO {
  if (!raw) return raw;
  const plan = { ...raw };
  const proposals: any[] = Array.isArray(plan.proposals) ? plan.proposals : [];

  const acceptedFromProposals = proposals.filter((p) => !p.isProtected && p.userDecision === "ACCEPTED").length;
  const editedFromProposals = proposals.filter((p) => !p.isProtected && p.userDecision === "EDITED").length;
  const rejectedFromProposals = proposals.filter((p) => !p.isProtected && p.userDecision === "REJECTED").length;
  const protectedFromProposals = proposals.filter((p) => p.isProtected || p.action === "DO_NOT_ADD").length;
  const pendingFromProposals = proposals.filter(
    (p) => !p.isProtected && (!p.userDecision || p.userDecision === "PENDING")
  ).length;

  const rawSummary = plan.summary || {};
  const accepted = rawSummary.acceptedCount ?? rawSummary.accepted ?? acceptedFromProposals;
  const edited = rawSummary.editedCount ?? rawSummary.edited ?? editedFromProposals;
  const rejected = rawSummary.rejectedCount ?? rawSummary.rejected ?? rejectedFromProposals;
  const pending = rawSummary.pendingCount ?? rawSummary.pending ?? pendingFromProposals;
  const protectedCount = rawSummary.protectedCount ?? rawSummary.doNotAdd ?? protectedFromProposals;
  const total = rawSummary.totalProposals ?? proposals.length;
  const actionableTotal = rawSummary.actionableTotal ?? Math.max(0, total - protectedCount);

  plan.summary = {
    totalProposals: total,
    actionableTotal,
    pending,
    accepted,
    edited,
    rejected,
    doNotAdd: protectedCount,
    pendingCount: pending,
    acceptedCount: accepted,
    editedCount: edited,
    rejectedCount: rejected,
    protectedCount,
    actionBreakdown: rawSummary.actionBreakdown || {},
    sectionBreakdown: rawSummary.sectionBreakdown || {},
  };

  return plan;
}

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
    const raw = (res.data as any)?.tailoringPlan || res.data;
    return normalizePlan(raw);
  },

  /**
   * Get an existing TailoringPlan.
   */
  async getPlan(jobProfileId: string): Promise<TailoringPlanDTO> {
    const res = await apiFetch<{
      success: boolean;
      data: { tailoringPlan?: TailoringPlanDTO } | TailoringPlanDTO;
    }>(`/api/job-profiles/${jobProfileId}/tailoring-plan`);
    const raw = (res.data as any)?.tailoringPlan || res.data;
    return normalizePlan(raw);
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
    const raw = (res.data as any)?.tailoringPlan || res.data;
    return normalizePlan(raw);
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
    const raw = (res.data as any)?.tailoringPlan || res.data;
    return normalizePlan(raw);
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
    const raw = (res.data as any)?.tailoringPlan || res.data;
    return normalizePlan(raw);
  },
};
