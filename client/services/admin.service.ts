import { apiFetch } from "@/lib/api";

export interface PlatformMetrics {
  users: {
    total: number;
    candidates: number;
    recruiters: number;
    admins: number;
    active: number;
    suspended: number;
  };
  jobs: {
    total: number;
    active: number;
    closed: number;
    external: number;
    platform: number;
  };
  resumes: {
    total: number;
    parsed: number;
    failed: number;
    avgAtsScore: number;
  };
  activity: {
    applications: number;
    verifications: number;
  };
  system: {
    uptime: number;
    memoryUsageMB: number;
    nodeVersion: string;
    environment: string;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: "candidate" | "recruiter" | "admin";
  accountStatus: "active" | "suspended" | "deactivated";
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  image?: string | null;
}

export interface AdminJobItem {
  id: string;
  title: string;
  companyName: string;
  sourceType: "platform" | "external";
  sourceProvider?: string | null;
  sourceUrl?: string | null;
  status: "draft" | "active" | "closed" | "archived";
  location: string;
  employmentType: string;
  createdAt: string;
}

export interface AdminResumeItem {
  id: string;
  userId: string;
  originalName: string;
  targetRole: string;
  candidateName: string;
  candidateEmail: string;
  fileSize: number;
  status: string;
  atsScore: number;
  skillsCount: number;
  projectsCount: number;
  createdAt: string;
}

export interface PaginatedResult<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AdminService {
  async getMetrics(): Promise<PlatformMetrics> {
    const res = await apiFetch<{ success: boolean; data: PlatformMetrics }>("/api/admin/metrics");
    return res.data;
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{ users: AdminUserItem[] } & PaginatedResult<AdminUserItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    if (params.status) query.set("status", params.status);

    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/users?${query.toString()}`);
    return res.data;
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    return res.data;
  }

  async updateUserStatus(userId: string, status: string): Promise<any> {
    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  }

  async deleteUser(userId: string): Promise<any> {
    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    return res.data;
  }

  async getJobs(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
  }): Promise<{ jobs: AdminJobItem[] } & PaginatedResult<AdminJobItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.source) query.set("source", params.source);

    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/jobs?${query.toString()}`);
    return res.data;
  }

  async updateJobStatus(jobId: string, status: string): Promise<any> {
    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  }

  async deleteJob(jobId: string): Promise<any> {
    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/jobs/${jobId}`, {
      method: "DELETE",
    });
    return res.data;
  }

  async triggerJobSync(): Promise<any> {
    const res = await apiFetch<{ success: boolean; data: any }>("/api/admin/jobs/trigger-sync", {
      method: "POST",
    });
    return res.data;
  }

  async getResumes(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ resumes: AdminResumeItem[] } & PaginatedResult<AdminResumeItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);

    const res = await apiFetch<{ success: boolean; data: any }>(`/api/admin/resumes?${query.toString()}`);
    return res.data;
  }
}

export const adminService = new AdminService();
