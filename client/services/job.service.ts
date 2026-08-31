import { apiFetch } from "@/lib/api";
import { Job, WorkMode, EmploymentType } from "@/types/job-center";

export interface BackendJobRequiredSkill {
  name: string;
  requiredLevel: number;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  minYearsOfExperience?: number | null;
}

export interface BackendJobLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  raw?: string | null;
}

export interface BackendJobSalary {
  min?: number | null;
  max?: number | null;
  currency?: string | null;
  raw?: string | null;
}

export interface BackendJob {
  _id: string;
  sourceType: "PLATFORM" | "EXTERNAL";
  sourceProvider?: string | null;
  externalId?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  companyName?: string | null;
  companyId?: string | null;
  roleId?: string | null;
  createdBy?: string | null;
  title: string;
  description: string;
  employmentType?: string | null;
  workplaceType?: string | null;
  location?: BackendJobLocation | null;
  rawLocation?: string | null;
  requiredSkills: BackendJobRequiredSkill[];
  minExperienceYears: number;
  salary?: BackendJobSalary | null;
  rawSalary?: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "ARCHIVED";
  publishedAt?: string | null;
  closesAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSearchQueryParams {
  keyword?: string;
  location?: string;
  sourceType?: "PLATFORM" | "EXTERNAL";
  sourceProvider?: string;
  employmentType?: string;
  workplaceType?: string;
  companyId?: string;
  roleId?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface JobPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedJobsResponse {
  items: BackendJob[];
  pagination: JobPaginationMeta;
}

/**
 * Utility helper to map a backend Job model into the rich UI Job format
 * expected by JobCard, JobDetailsDrawer, and ApplyModal.
 */
export function mapBackendJobToUiJob(job: BackendJob, userSkills: string[] = []): Job {
  // Normalize workplace / workMode
  let workMode: WorkMode = "Remote";
  const rawWork = (job.workplaceType || "").toUpperCase();
  if (rawWork.includes("HYBRID")) workMode = "Hybrid";
  else if (rawWork.includes("ON_SITE") || rawWork.includes("ONSITE") || rawWork.includes("OFFICE")) workMode = "On-site";
  else workMode = "Remote";

  // Normalize employmentType
  let employmentType: EmploymentType = "Full-Time";
  const rawEmp = (job.employmentType || "").toUpperCase();
  if (rawEmp.includes("PART_TIME") || rawEmp.includes("PART-TIME")) employmentType = "Part-Time";
  else if (rawEmp.includes("CONTRACT")) employmentType = "Contract";
  else if (rawEmp.includes("INTERN")) employmentType = "Internship";
  else employmentType = "Full-Time";

  // Normalize Location
  const locationStr =
    job.rawLocation ||
    [job.location?.city, job.location?.state, job.location?.country].filter(Boolean).join(", ") ||
    (workMode === "Remote" ? "Remote" : "India");

  // Normalize Salary string
  let salaryText = "Competitive";
  if (job.rawSalary) {
    salaryText = job.rawSalary;
  } else if (job.salary && (job.salary.min || job.salary.max)) {
    const curr = job.salary.currency || "$";
    if (job.salary.min && job.salary.max) {
      salaryText = `${curr}${job.salary.min.toLocaleString()} – ${curr}${job.salary.max.toLocaleString()}`;
    } else if (job.salary.min) {
      salaryText = `From ${curr}${job.salary.min.toLocaleString()}`;
    } else if (job.salary.max) {
      salaryText = `Up to ${curr}${job.salary.max.toLocaleString()}`;
    }
  }

  // Calculate Match Score against user's skills
  const jobSkillNames = job.requiredSkills.map((s) => s.name.toLowerCase());
  const userSkillLower = userSkills.map((s) => s.toLowerCase());
  const matched = jobSkillNames.filter((s) => userSkillLower.includes(s));
  const missing = jobSkillNames.filter((s) => !userSkillLower.includes(s));
  
  let matchScore = 75; // Baseline match
  if (jobSkillNames.length > 0) {
    const ratio = matched.length / jobSkillNames.length;
    matchScore = Math.round(50 + ratio * 45);
  }

  const matchTier: "Excellent Match" | "Good Match" | "Potential Match" =
    matchScore >= 85 ? "Excellent Match" : matchScore >= 70 ? "Good Match" : "Potential Match";

  // Format posted time
  const createdDate = new Date(job.publishedAt || job.createdAt);
  const diffDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const postedTimeAgo = diffDays <= 0 ? "Today" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

  return {
    id: job._id,
    title: job.title,
    company: job.companyName || "Skillezo Partner Company",
    companyLogo: "",
    verified: job.sourceType === "PLATFORM",
    department: "Engineering",
    location: locationStr,
    workMode,
    employmentType,
    salaryMin: job.salary?.min || 0,
    salaryMax: job.salary?.max || 0,
    salaryText,
    experienceMin: job.minExperienceYears,
    experienceMax: job.minExperienceYears + 3,
    experienceText: job.minExperienceYears === 0 ? "Fresher / 0-1 Years" : `${job.minExperienceYears}+ Years`,
    skills: job.requiredSkills.map((s) => s.name),
    description: job.description,
    responsibilities: [
      "Design, build, and maintain high-quality, scalable code.",
      "Collaborate with cross-functional teams to deliver key product initiatives.",
      "Participate in code reviews, design discussions, and engineering best practices.",
    ],
    education: "Bachelor's Degree in Computer Science, Engineering, or related field (or equivalent practical experience)",
    perks: ["Remote Work Options", "Health & Wellness Coverage", "Learning & Development Budget", "Competitive Equity / Bonuses"],
    matchScore,
    matchTier,
    matchBreakdown: {
      overallScore: matchScore,
      skillMatchScore: Math.min(100, matchScore + 5),
      experienceMatchScore: 85,
      roleMatchScore: 80,
      locationMatchScore: 90,
      matchedSkills: matched.length > 0 ? matched : job.requiredSkills.slice(0, 2).map((s) => s.name),
      missingSkills: missing.length > 0 ? missing : [],
      recommendation: matchScore >= 80 ? "Strong fit for your current skill profile. High interview callback probability." : "Review required skills to tailor your resume before applying.",
    },
    postedDate: createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    postedTimeAgo,
    sourceType: (job.sourceType || "PLATFORM").toUpperCase() === "EXTERNAL" ? "EXTERNAL" : "PLATFORM",
    sourceProvider: job.sourceProvider || (job.sourceType === "EXTERNAL" ? "Jooble" : "Skillezo"),
    sourceUrl: job.sourceUrl || null,
    sourceName: job.sourceName || (job.sourceType === "EXTERNAL" ? "Jooble" : null),
    isSaved: false,
    isApplied: false,
  };
}

export const jobService = {
  /**
   * Search jobs from the backend API with filters, keywords, and pagination.
   */
  async searchJobs(params: JobSearchQueryParams = {}): Promise<PaginatedJobsResponse> {
    const query = new URLSearchParams();

    if (params.keyword) query.set("keyword", params.keyword.trim());
    if (params.location) query.set("location", params.location.trim());
    if (params.sourceType) query.set("sourceType", params.sourceType);
    if (params.sourceProvider) query.set("sourceProvider", params.sourceProvider);
    if (params.employmentType) query.set("employmentType", params.employmentType);
    if (params.workplaceType) query.set("workplaceType", params.workplaceType);
    if (params.companyId) query.set("companyId", params.companyId);
    if (params.roleId) query.set("roleId", params.roleId);
    if (params.page && params.page > 0) query.set("page", params.page.toString());
    if (params.limit && params.limit > 0) query.set("limit", params.limit.toString());
    if (params.sort) query.set("sort", params.sort);

    const queryString = query.toString();
    const endpoint = `/api/jobs${queryString ? `?${queryString}` : ""}`;

    const res = await apiFetch<{ success: boolean; data: PaginatedJobsResponse }>(endpoint);
    return res.data;
  },

  /**
   * Fetch single job details by its ID.
   */
  async getJobById(jobId: string): Promise<BackendJob> {
    const res = await apiFetch<{ success: boolean; data: BackendJob }>(`/api/jobs/${jobId}`);
    return res.data;
  },
};
