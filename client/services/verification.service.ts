import { apiFetch } from "@/lib/api";
import {
  AssessmentCatalogItem,
  AssessmentQuiz,
  AssessmentResult,
  SkillVerificationRecord,
  PublicCredential,
} from "@/types/verification";

export const verificationService = {
  async getCatalog(): Promise<AssessmentCatalogItem[]> {
    try {
      const res = await apiFetch<{ success: boolean; data: AssessmentCatalogItem[] }>(
        "/api/verification/catalog"
      );
      return res.data;
    } catch {
      // Return empty fallback array on error
      return [];
    }
  },

  async getAssessment(topicId: string): Promise<AssessmentQuiz> {
    const res = await apiFetch<{ success: boolean; data: AssessmentQuiz }>(
      `/api/verification/assessments/${encodeURIComponent(topicId)}`
    );
    return res.data;
  },

  async submitAssessment(
    topicId: string,
    answers: Record<string, number>
  ): Promise<AssessmentResult> {
    const res = await apiFetch<{ success: boolean; data: AssessmentResult }>(
      `/api/verification/assessments/${encodeURIComponent(topicId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      }
    );
    return res.data;
  },

  async getUserRecords(): Promise<SkillVerificationRecord[]> {
    try {
      const res = await apiFetch<{ success: boolean; data: any[] }>(
        "/api/verification/records"
      );
      return res.data.map((r) => ({
        id: r._id || r.id,
        skillName: r.skillName,
        category: r.category,
        topicId: r.topicId,
        applicantName: r.applicantName || "Candidate",
        score: r.score,
        maxScore: 100,
        status: r.status,
        proficiency: r.proficiency,
        verifiedDate: r.issueDate || r.verifiedDate,
        submittedDate: r.createdAt || r.issueDate || new Date().toISOString(),
        assessor: r.assessor || "SKILLEZO AI Engine v4.2",
        credentialHash: r.credentialHash,
        details: r.details,
      }));
    } catch {
      return [];
    }
  },

  async verifyCredential(credentialHash: string): Promise<PublicCredential | null> {
    try {
      const res = await apiFetch<{ success: boolean; data: PublicCredential }>(
        `/api/verification/credentials/${encodeURIComponent(credentialHash)}`
      );
      return res.data;
    } catch {
      return null;
    }
  },
};
