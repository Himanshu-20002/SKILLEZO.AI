import { apiFetch } from "@/lib/api";

export type ApplicationStage =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface RecruiterApplicationItem {
  id: string;
  status: ApplicationStage;
  job: {
    id: string;
    title: string;
    companyName?: string | null;
  } | null;
  candidate: {
    id: string;
    name?: string;
    email?: string;
    headline?: string;
    employabilityScore?: number;
    skills?: string[];
  };
  resume: {
    id: string;
    title: string;
    originalFileName: string;
    version: number;
  } | null;
  appliedAt: string;
  updatedAt: string;
}

export interface RecruiterApplicationDetails {
  id: string;
  status: ApplicationStage;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    department?: string | null;
    location?: string | null;
    employmentType?: string | null;
  } | null;
  candidate: {
    id: string;
    name?: string;
    email?: string;
    headline?: string;
    phone?: string;
    location?: string;
    bio?: string;
    employabilityScore?: number;
    verifiedSkills?: Array<{
      name: string;
      proficiency: string;
      score: number;
      credentialHash?: string;
    }>;
  };
  resume: {
    id: string;
    title: string;
    originalFileName: string;
    contentType?: string;
    fileSize?: number;
    parsedTextSnippet?: string;
  } | null;
  recruiterNotes?: string;
}

export interface StatusHistoryItem {
  fromStatus?: string | null;
  toStatus: string;
  changedBy: string;
  reason?: string;
  changedAt: string;
}

export interface PaginatedRecruiterApplications {
  items: RecruiterApplicationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface RecruiterDashboardStats {
  totalCandidates: number;
  activeJobsCount: number;
  underReviewCount: number;
  interviewCount: number;
  offerCount: number;
  hiredCount: number;
  stageCounts: Record<string, number>;
  recentApplications: Array<{
    id: string;
    status: ApplicationStage;
    jobTitle: string;
    candidateName: string;
    appliedAt: string;
  }>;
}

export interface RecruiterJobItem {
  id: string;
  _id?: string;
  title: string;
  department?: string;
  companyName?: string;
  employmentType?: string;
  workplaceType?: string;
  location?: any;
  salary?: { min?: number; max?: number; currency?: string };
  requiredSkills?: Array<{ name: string; requiredLevel?: number } | string>;
  minExperienceYears?: number;
  status: "active" | "draft" | "paused" | "closed";
  applicantsCount?: number;
  createdAt: string;
  publishedAt?: string;
}

export interface TalentCandidateItem {
  id: string;
  name: string;
  headline: string;
  location: string;
  employabilityScore: number;
  avatarUrl?: string;
  verifiedSkills: Array<{
    name: string;
    proficiency: "Expert" | "Advanced" | "Intermediate";
    score: number;
    credentialHash?: string;
  }>;
  experienceYears?: number;
  targetRole?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

export const recruiterService = {
  async getDashboardStats(): Promise<RecruiterDashboardStats> {
    try {
      const res = await apiFetch<{ success: boolean; data: RecruiterDashboardStats }>(
        "/api/recruiter/applications/stats"
      );
      return res.data;
    } catch {
      return {
        totalCandidates: 0,
        activeJobsCount: 0,
        underReviewCount: 0,
        interviewCount: 0,
        offerCount: 0,
        hiredCount: 0,
        stageCounts: {
          applied: 0,
          under_review: 0,
          shortlisted: 0,
          interview: 0,
          offered: 0,
          hired: 0,
          rejected: 0,
        },
        recentApplications: [],
      };
    }
  },

  async getApplications(params?: {
    page?: number;
    limit?: number;
    jobId?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedRecruiterApplications> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.jobId && params.jobId !== "all") query.set("jobId", params.jobId);
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    const url = `/api/recruiter/applications${qs ? `?${qs}` : ""}`;
    const res = await apiFetch<{ success: boolean; data: PaginatedRecruiterApplications }>(url);
    return res.data;
  },

  async getApplicationDetails(applicationId: string): Promise<RecruiterApplicationDetails> {
    const res = await apiFetch<{ success: boolean; data: RecruiterApplicationDetails }>(
      `/api/recruiter/applications/${applicationId}`
    );
    return res.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStage,
    reason?: string
  ): Promise<RecruiterApplicationDetails> {
    const res = await apiFetch<{ success: boolean; data: RecruiterApplicationDetails }>(
      `/api/recruiter/applications/${applicationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      }
    );
    return res.data;
  },

  async getStatusHistory(applicationId: string): Promise<StatusHistoryItem[]> {
    const res = await apiFetch<{ success: boolean; data: StatusHistoryItem[] }>(
      `/api/recruiter/applications/${applicationId}/status-history`
    );
    return res.data;
  },

  getResumeStreamUrl(applicationId: string): string {
    return `/api/recruiter/applications/${applicationId}/resume`;
  },

  async getCompanyJobs(): Promise<RecruiterJobItem[]> {
    try {
      const res = await apiFetch<{ success: boolean; data: RecruiterJobItem[] }>(
        "/api/jobs/company"
      );
      return res?.data || [];
    } catch {
      return [];
    }
  },

  async getTalentPool(params?: {
    search?: string;
    skill?: string;
    minScore?: number;
  }): Promise<TalentCandidateItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.skill && params.skill !== "All Skills") query.set("skill", params.skill);
      if (params?.minScore) query.set("minScore", String(params.minScore));

      const qs = query.toString();
      const res = await apiFetch<{ success: boolean; data: TalentCandidateItem[] }>(
        `/api/recruiter/applications/talent${qs ? `?${qs}` : ""}`
      );
      return res?.data || [];
    } catch {
      return [];
    }
  },

  async createJob(payload: {
    title: string;
    description: string;
    department?: string;
    location?: string;
    employmentType?: string;
    workplaceType?: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    minExperienceYears?: number;
    requiredSkills?: string[];
  }): Promise<RecruiterJobItem> {
    const res = await apiFetch<{ success: boolean; data: RecruiterJobItem }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        department: payload.department,
        employmentType: payload.employmentType,
        workplaceType: payload.workplaceType,
        location: { raw: payload.location || "Remote" },
        salary: {
          min: payload.salaryMin ?? 1200000,
          max: payload.salaryMax ?? 1800000,
          currency: payload.currency || "INR",
        },
        minExperienceYears: payload.minExperienceYears != null ? payload.minExperienceYears : 0,
        requiredSkills: payload.requiredSkills,
      }),
    });
    return res.data;
  },

  async updateJobStatus(jobId: string, status: "active" | "paused" | "closed"): Promise<void> {
    await apiFetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async updateJob(
    jobId: string,
    payload: {
      title?: string;
      description?: string;
      department?: string;
      location?: string;
      employmentType?: string;
      workplaceType?: string;
      salaryMin?: number;
      salaryMax?: number;
      currency?: string;
      minExperienceYears?: number;
      requiredSkills?: string[];
      status?: "active" | "draft" | "paused" | "closed";
    }
  ): Promise<RecruiterJobItem> {
    const res = await apiFetch<{ success: boolean; data: RecruiterJobItem }>(`/api/jobs/${jobId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...payload,
        ...(payload.location ? { location: { raw: payload.location } } : {}),
        ...(payload.salaryMin != null || payload.salaryMax != null
          ? {
              salary: {
                min: payload.salaryMin,
                max: payload.salaryMax,
                currency: payload.currency || "INR",
              },
            }
          : {}),
      }),
    });
    return res.data;
  },
};


