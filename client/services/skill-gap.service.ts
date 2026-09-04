import { apiFetch } from "@/lib/api";
import { SkillGapAnalysisData } from "@/types/career-intelligence";

export const skillGapService = {
  /**
   * Fetch live 6-axis skill gap analysis for the authenticated candidate against a target role.
   */
  async getSkillGapAnalysis(targetRole?: string): Promise<SkillGapAnalysisData> {
    const query = targetRole ? `?role=${encodeURIComponent(targetRole)}` : '';
    const res = await apiFetch<{ success: boolean; data: SkillGapAnalysisData }>(`/api/skill-gap/me${query}`);
    return res.data;
  },

  /**
   * Fetch all supported target technical roles.
   */
  async getAvailableRoles(): Promise<string[]> {
    const res = await apiFetch<{ success: boolean; data: string[] }>("/api/skill-gap/roles");
    return res.data || [];
  },
};
