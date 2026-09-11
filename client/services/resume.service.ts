import { apiFetch } from "@/lib/api";
import { ResumeRecord } from "@/types/resume";

export const resumeService = {
  /**
   * Upload a new PDF resume with candidate title.
   */
  async uploadResume(file: File, title?: string): Promise<ResumeRecord> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title?.trim() || file.name.replace(/\.[^/.]+$/, ""));

    const res = await apiFetch<{ success: boolean; data: ResumeRecord }>("/api/resumes/upload", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  /**
   * Fetch all resumes belonging to the authenticated candidate.
   */
  async getUserResumes(): Promise<ResumeRecord[]> {
    const res = await apiFetch<{ success: boolean; data: ResumeRecord[] }>("/api/resumes");
    return res.data || [];
  },

  /**
   * Fetch single resume details by ID.
   */
  async getResumeById(resumeId: string): Promise<ResumeRecord> {
    const res = await apiFetch<{ success: boolean; data: ResumeRecord }>(`/api/resumes/${resumeId}`);
    return res.data;
  },

  /**
   * Set a specific resume as the candidate's default active resume.
   */
  async setDefaultResume(resumeId: string): Promise<ResumeRecord> {
    const res = await apiFetch<{ success: boolean; data: ResumeRecord }>(`/api/resumes/${resumeId}/default`, {
      method: "PUT",
    });
    return res.data;
  },

  /**
   * Update resume metadata (e.g. title).
   */
  async updateResume(resumeId: string, data: { title?: string }): Promise<ResumeRecord> {
    const res = await apiFetch<{ success: boolean; data: ResumeRecord }>(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Delete a resume by ID.
   */
  async deleteResume(resumeId: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch resume file blob for viewing or downloading.
   */
  async getResumeBlob(resumeId: string, inline = true): Promise<Blob> {
    const cleanBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").trim().replace(/\/+$/, "");
    const url = `${cleanBase}/api/resumes/${resumeId}/download?inline=${inline}`;
    const response = await fetch(url, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to load resume file");
    }
    return await response.blob();
  },

  /**
   * Fetch live ATS score, keyword breakdown, Match Score, Content Score, and Phase 6 recommendations.
   */
  async getResumeAtsScore(resumeId?: string, targetRole?: string, jobDescription?: string) {
    const params = new URLSearchParams();
    if (targetRole) params.append("targetRole", targetRole);
    if (jobDescription) params.append("jobDescription", jobDescription);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    const endpoint = resumeId
      ? `/api/resumes/${resumeId}/ats-score${queryString}`
      : `/api/resumes/me/ats-score${queryString}`;
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume").ResumeAtsAnalysis }>(endpoint);
    return res.data;
  },

  /**
   * Propose a safe, constrained Phase 7 resume bullet optimization.
   */
  async proposeOptimization(
    resumeId: string,
    recommendationId: string,
    targetRole?: string,
    jobDescription?: string,
    targetBulletId?: string
  ): Promise<import("@/types/resume").ResumeOptimizationDraft> {
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume").ResumeOptimizationDraft }>(
      `/api/resumes/${resumeId}/optimizations/propose`,
      {
        method: "POST",
        body: JSON.stringify({ recommendationId, targetRole, jobDescription, targetBulletId }),
      }
    );
    return res.data;
  },

  /**
   * Accept an optimization draft, generating a new resume version and re-scoring deterministically.
   */
  async acceptOptimization(
    resumeId: string,
    draft: import("@/types/resume").ResumeOptimizationDraft
  ) {
    const res = await apiFetch<{
      success: boolean;
      data: {
        newVersionId: string;
        version: number;
        resume: ResumeRecord;
        freshIntelligence: import("@/types/resume").ResumeAtsAnalysis;
      };
    }>(`/api/resumes/${resumeId}/optimizations/accept`, {
      method: "POST",
      body: JSON.stringify({ draft }),
    });
    return res.data;
  },

  /**
   * Reject an optimization draft, keeping original resume content pristine.
   */
  async rejectOptimization(draft: import("@/types/resume").ResumeOptimizationDraft) {
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume").ResumeOptimizationDraft }>(
      `/api/resumes/optimizations/reject`,
      {
        method: "POST",
        body: JSON.stringify({ draft }),
      }
    );
    return res.data;
  },

  /**
   * Fetch deterministic 7-section analysis for Resume Studio (Phase 2).
   */
  async getResumeSectionAnalysis(resumeId: string): Promise<import("@/types/resume-section.types").ResumeSectionAnalysisResult> {
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume-section.types").ResumeSectionAnalysisResult }>(
      `/api/resumes/${resumeId}/section-analysis`
    );
    return res.data;
  },

  /**
   * Fetch deterministic general resume scores across 7 sections (Phase 3).
   */
  async getResumeScore(resumeId: string): Promise<import("@/types/resume-scoring.types").ResumeScoreResult> {
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume-scoring.types").ResumeScoreResult }>(
      `/api/resumes/${resumeId}/score`
    );
    return res.data;
  },

  /**
   * Request evidence-locked AI section improvement suggestion (Phase 5).
   */
  async suggestSectionImprovement(
    resumeId: string,
    sectionId: string,
    userInstruction?: string
  ): Promise<import("@/types/resume-editor.types").SectionImprovementSuggestion> {
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume-editor.types").SectionImprovementSuggestion }>(
      `/api/resumes/${resumeId}/sections/${sectionId}/suggest-improvement`,
      {
        method: "POST",
        body: JSON.stringify({ userInstruction }),
      }
    );
    return res.data;
  },

  /**
   * Apply candidate-approved section improvement, mutating ResumeDocument and recalculating score (Phase 5).
   */
  async applySectionImprovement(
    resumeId: string,
    sectionId: string,
    payload: import("@/types/resume-editor.types").ApplyImprovementPayload
  ): Promise<import("@/types/resume-editor.types").ApplyImprovementResult> {
    const res = await apiFetch<{ success: boolean; data: import("@/types/resume-editor.types").ApplyImprovementResult }>(
      `/api/resumes/${resumeId}/sections/${sectionId}/apply-improvement`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },
};


