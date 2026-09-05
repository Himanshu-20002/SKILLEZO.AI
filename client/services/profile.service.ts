import { apiFetch } from "@/lib/api";

export interface CandidateSkill {
  name: string;
  category?: string;
  level?: number;
  proficiency?: string;
  score?: number;
  source?: string;
  verified?: boolean;
}

export interface CandidateEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
}

export interface CandidateExperience {
  companyName: string;
  jobTitle: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface CandidateProfile {
  _id?: string;
  userId: string;
  headline?: string;
  phone?: string;
  targetRole?: string;
  targetRoleId?: string;
  bio?: string;
  skills: CandidateSkill[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  links?: {
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
  completionPercentage?: number;
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

  async addSkill(skill: CandidateSkill): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/skills", {
      method: "POST",
      body: JSON.stringify(skill),
    });
    return res.data;
  },

  async deleteSkill(skillName: string): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>(`/api/profile/me/skills/${encodeURIComponent(skillName)}`, {
      method: "DELETE",
    });
    return res.data;
  },

  async updateSkills(skills: CandidateSkill[]): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/skills", {
      method: "PATCH",
      body: JSON.stringify({ skills }),
    });
    return res.data;
  },

  async updateEducation(education: CandidateEducation[]): Promise<CandidateProfile> {
    const res = await apiFetch<{ success: boolean; data: CandidateProfile }>("/api/profile/me/education", {
      method: "PATCH",
      body: JSON.stringify({ education }),
    });
    return res.data;
  },

  async updateExperience(experience: CandidateExperience[]): Promise<CandidateProfile> {
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
