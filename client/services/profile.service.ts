import { apiFetch } from "@/lib/api";

export interface CandidateProfile {
  _id?: string;
  userId: string;
  targetRoleId?: string;
  bio?: string;
  skills: Array<{
    name: string;
    level?: number;
    source?: string;
    verified?: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
  }>;
  experience: Array<{
    companyName: string;
    jobTitle: string;
    employmentType?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const profileService = {
  async getMyProfile(): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me");
    return res.data;
  },

  async createProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateSkills(skills: CandidateProfile["skills"]): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/skills", {
      method: "PATCH",
      body: JSON.stringify({ skills }),
    });
    return res.data;
  },

  async updateEducation(education: CandidateProfile["education"]): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/education", {
      method: "PATCH",
      body: JSON.stringify({ education }),
    });
    return res.data;
  },

  async updateExperience(experience: CandidateProfile["experience"]): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/experience", {
      method: "PATCH",
      body: JSON.stringify({ experience }),
    });
    return res.data;
  },

  async updateLinks(links: CandidateProfile["links"]): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/links", {
      method: "PATCH",
      body: JSON.stringify({ links }),
    });
    return res.data;
  },
};
