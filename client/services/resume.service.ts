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
};

