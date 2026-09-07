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
      // Fallback demo stats
      return {
        totalCandidates: 28,
        activeJobsCount: 5,
        underReviewCount: 8,
        interviewCount: 6,
        offerCount: 3,
        hiredCount: 2,
        stageCounts: {
          applied: 9,
          under_review: 8,
          shortlisted: 5,
          interview: 6,
          offered: 3,
          hired: 2,
          rejected: 1,
        },
        recentApplications: [
          {
            id: "app_1",
            status: "applied",
            jobTitle: "Senior Full Stack Engineer",
            candidateName: "Sarah Chen",
            appliedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "app_2",
            status: "under_review",
            jobTitle: "Cloud Infrastructure Lead",
            candidateName: "David Miller",
            appliedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
          {
            id: "app_3",
            status: "shortlisted",
            jobTitle: "Senior Full Stack Engineer",
            candidateName: "Alex Rivera",
            appliedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          },
        ],
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
      if (res && res.data && res.data.length > 0) {
        return res.data;
      }
      return this.getFallbackJobs();
    } catch {
      return this.getFallbackJobs();
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
          min: payload.salaryMin || 80000,
          max: payload.salaryMax || 140000,
          currency: "USD",
        },
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

  getFallbackJobs(): RecruiterJobItem[] {
    return [
      {
        id: "job_1",
        title: "Senior Full Stack Engineer",
        department: "Core Platform",
        companyName: "TechFlow AI",
        employmentType: "Full-Time",
        workplaceType: "Hybrid",
        location: { raw: "San Francisco, CA (Hybrid)" },
        salary: { min: 145000, max: 185000, currency: "USD" },
        requiredSkills: ["React 19", "Node.js", "TypeScript", "PostgreSQL"],
        minExperienceYears: 4,
        status: "active",
        applicantsCount: 14,
        createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      },
      {
        id: "job_2",
        title: "Cloud & Kubernetes Infrastructure Lead",
        department: "DevOps & SRE",
        companyName: "TechFlow AI",
        employmentType: "Full-Time",
        workplaceType: "Remote",
        location: { raw: "Remote (Global)" },
        salary: { min: 160000, max: 210000, currency: "USD" },
        requiredSkills: ["Kubernetes", "AWS", "Terraform", "Docker"],
        minExperienceYears: 5,
        status: "active",
        applicantsCount: 9,
        createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      },
      {
        id: "job_3",
        title: "AI Platform & LLM Agent Engineer",
        department: "AI Research",
        companyName: "TechFlow AI",
        employmentType: "Full-Time",
        workplaceType: "Remote",
        location: { raw: "Remote (US/EU)" },
        salary: { min: 155000, max: 195000, currency: "USD" },
        requiredSkills: ["Python", "FastAPI", "Vector Search", "LangChain"],
        minExperienceYears: 3,
        status: "active",
        applicantsCount: 18,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      },
      {
        id: "job_4",
        title: "Junior Frontend Engineer",
        department: "Design Systems",
        companyName: "TechFlow AI",
        employmentType: "Full-Time",
        workplaceType: "Remote",
        location: { raw: "Remote" },
        salary: { min: 85000, max: 110000, currency: "USD" },
        requiredSkills: ["React", "CSS / Tailwind", "TypeScript"],
        minExperienceYears: 1,
        status: "paused",
        applicantsCount: 32,
        createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
      },
    ];
  },

  getFallbackTalentPool(): TalentCandidateItem[] {
    return [
      {
        id: "cand_1",
        name: "Sarah Chen",
        headline: "Senior Full Stack Engineer | React, Node.js & Cloud Systems",
        location: "San Francisco, CA (Open to Remote)",
        employabilityScore: 96,
        targetRole: "Full Stack Engineer",
        experienceYears: 5,
        bio: "Specializing in high-concurrency microservices, Next.js 15 enterprise portals, and verified TypeScript architecture.",
        verifiedSkills: [
          { name: "React 19 & Next.js", proficiency: "Expert", score: 98, credentialHash: "SKZ-V98-REACT" },
          { name: "TypeScript Strict", proficiency: "Expert", score: 96, credentialHash: "SKZ-V96-TS" },
          { name: "Node.js Microservices", proficiency: "Advanced", score: 92, credentialHash: "SKZ-V92-NODE" },
        ],
        socialLinks: {
          github: "https://github.com/sarahchen",
          linkedin: "https://linkedin.com/in/sarahchen",
          portfolio: "https://sarahchen.dev",
        },
      },
      {
        id: "cand_2",
        name: "David Miller",
        headline: "Kubernetes, Cloud Infrastructure & SRE Architect",
        location: "Austin, TX (Remote)",
        employabilityScore: 94,
        targetRole: "DevOps / SRE Lead",
        experienceYears: 6,
        bio: "Certified Kubernetes administrator with deep AWS multi-region failover and Terraform IaC experience.",
        verifiedSkills: [
          { name: "Kubernetes / K8s", proficiency: "Expert", score: 95, credentialHash: "SKZ-V95-K8S" },
          { name: "AWS Cloud Solutions", proficiency: "Advanced", score: 93, credentialHash: "SKZ-V93-AWS" },
          { name: "Docker & CI/CD", proficiency: "Expert", score: 97, credentialHash: "SKZ-V97-DOCKER" },
        ],
        socialLinks: {
          github: "https://github.com/davidmiller",
          linkedin: "https://linkedin.com/in/davidmiller",
        },
      },
      {
        id: "cand_3",
        name: "Elena Rostova",
        headline: "AI Systems Engineer | LLM Agents, PyTorch & Vector Databases",
        location: "Seattle, WA (Remote)",
        employabilityScore: 95,
        targetRole: "AI Platform Engineer",
        experienceYears: 4,
        bio: "Building autonomous agent workflows, RAG knowledge graph retrieval, and low-latency LLM inference pipelines.",
        verifiedSkills: [
          { name: "Python AI & FastAPI", proficiency: "Expert", score: 98, credentialHash: "SKZ-V98-PY" },
          { name: "Vector Search & RAG", proficiency: "Advanced", score: 94, credentialHash: "SKZ-V94-VEC" },
          { name: "PyTorch & Transformers", proficiency: "Advanced", score: 91, credentialHash: "SKZ-V91-TORCH" },
        ],
        socialLinks: {
          github: "https://github.com/elenarostova",
          linkedin: "https://linkedin.com/in/elenarostova",
          portfolio: "https://elena-ai.dev",
        },
      },
      {
        id: "cand_4",
        name: "Alex Rivera",
        headline: "Staff Frontend Architect | Performance & Distributed UI Systems",
        location: "New York, NY",
        employabilityScore: 97,
        targetRole: "Frontend Lead / Staff Engineer",
        experienceYears: 7,
        bio: "Obsessed with Sub-second Web Vitals, zero layout shifts, reactive state machines, and design system governance.",
        verifiedSkills: [
          { name: "React 19 & State Engines", proficiency: "Expert", score: 99, credentialHash: "SKZ-V99-REACT" },
          { name: "Web Performance & Core Vitals", proficiency: "Expert", score: 96, credentialHash: "SKZ-V96-PERF" },
          { name: "TypeScript & Architecture", proficiency: "Expert", score: 97, credentialHash: "SKZ-V97-TS" },
        ],
        socialLinks: {
          github: "https://github.com/alexrivera",
          linkedin: "https://linkedin.com/in/alexrivera",
          portfolio: "https://alexrivera.io",
        },
      },
    ];
  },
};

