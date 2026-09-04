import { apiFetch } from "@/lib/api";
import { EmployabilityIndexData, CareerGPSData } from "@/types/career-intelligence";

export interface LiveCareerGpsResponse {
  targetRole: string;
  overallScore: number;
  ready: boolean;
  totalEstimatedWeeks: number;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    source: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'not_started' | 'in_progress' | 'completed';
    relatedSkill?: string;
    relatedAxis?: string;
    estimatedWeeks: number;
  }>;
}

export const employabilityService = {
  /**
   * Fetch live Employability Index for the authenticated candidate against a target role.
   */
  async getEmployabilityIndex(targetRole?: string): Promise<EmployabilityIndexData> {
    const query = targetRole ? `?role=${encodeURIComponent(targetRole)}` : '';
    const res = await apiFetch<{ success: boolean; data: EmployabilityIndexData }>(
      `/api/career-plan/employability${query}`
    );
    return res.data;
  },

  /**
   * Fetch milestone-ready Career GPS roadmap data.
   */
  async getCareerGps(targetRole?: string): Promise<LiveCareerGpsResponse> {
    const query = targetRole ? `?role=${encodeURIComponent(targetRole)}` : '';
    const res = await apiFetch<{ success: boolean; data: LiveCareerGpsResponse }>(
      `/api/career-plan/gps${query}`
    );
    return res.data;
  },
};
