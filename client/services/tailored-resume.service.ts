import { apiFetch } from "@/lib/api";

export interface TailoredResumeMetadataDTO {
  id: string;
  title: string;
  variantType: "TAILORED";
  parentResumeId: string;
  targetJobId: string;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  version: number;
  sourceTailoringPlanId?: string | null;
  sourceTailoringPlanVersion?: number | null;
  sourceProfileVersion?: number | null;
  createdAt: string;
  updatedAt: string;
  studioUrl: string;
}

export interface TailoredResumeGenerationResultDTO {
  success: boolean;
  resume: TailoredResumeMetadataDTO;
  appliedProposalsCount: number;
  rejectedProposalsCount: number;
  protectedExclusionsCount: number;
  studioUrl: string;
}

export const tailoredResumeService = {
  /**
   * Materialize an independent TAILORED Resume variant from an approved TailoringPlan.
   */
  async generateTailoredResume(
    jobProfileId: string,
    force: boolean = false
  ): Promise<TailoredResumeGenerationResultDTO> {
    const res = await apiFetch<{ success: boolean; data: TailoredResumeGenerationResultDTO }>(
      `/api/job-profiles/${jobProfileId}/tailoring-plan/generate`,
      {
        method: "POST",
        body: JSON.stringify({ force }),
      }
    );
    return res.data;
  },

  /**
   * Retrieve lightweight, metadata-safe information for an existing tailored resume.
   */
  async getTailoredResume(
    jobProfileId: string
  ): Promise<TailoredResumeMetadataDTO | null> {
    const res = await apiFetch<{
      success: boolean;
      data: { tailoredResume: TailoredResumeMetadataDTO | null };
    }>(`/api/job-profiles/${jobProfileId}/tailored-resume`);
    return res.data?.tailoredResume ?? null;
  },
};
