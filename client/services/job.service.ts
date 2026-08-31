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
export function cleanHtmlText(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ") // Strip HTML tags (<b>, </b>, <br>, <p>, etc.)
    .replace(/&nbsp;/gi, " ") // Replace non-breaking spaces
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&bull;/gi, "•")
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

export function mapBackendJobToUiJob(job: BackendJob, userSkills: string[] = []): Job {
  const cleanTitle = cleanHtmlText(job.title) || "Untitled Position";
  const cleanCompany = cleanHtmlText(job.companyName) || "Skillezo Partner Company";
  const cleanDescription = cleanHtmlText(job.description) || "No description provided";

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

  // 1. Determine Actual Job Skills
  let jobSkills: string[] = (job.requiredSkills || []).map((s) => s.name.trim()).filter(Boolean);

  // For external jobs with no structured skills array, check if any of the candidate's profile skills exist in title/description
  if (jobSkills.length === 0 && userSkills.length > 0) {
    const jobText = `${cleanTitle} ${cleanDescription}`.toLowerCase();
    jobSkills = userSkills.filter((userSkill) => {
      const regex = new RegExp(`\\b${userSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(jobText);
    });
  }

  // 2. Real Skill Matching Overlap
  const userSkillLower = userSkills.map((s) => s.toLowerCase().trim());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((skill) => {
    if (userSkillLower.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 3. Mathematical Match Score Calculation (0 - 100%)
  let matchScore = 0;
  if (userSkills.length === 0) {
    matchScore = 0; // Candidate has not added any skills to their profile
  } else if (jobSkills.length > 0) {
    matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
  } else {
    // If no specific skills could be determined, calculate general keyword overlap
    const matchedKeywords = userSkills.filter((s) =>
      `${cleanTitle} ${cleanDescription}`.toLowerCase().includes(s.toLowerCase())
    );
    matchScore = Math.round((matchedKeywords.length / userSkills.length) * 100);
  }

  const matchTier: "Excellent Match" | "Good Match" | "Potential Match" =
    matchScore >= 85 ? "Excellent Match" : matchScore >= 70 ? "Good Match" : "Potential Match";

  // Format posted time
  const createdDate = new Date(job.publishedAt || job.createdAt || Date.now());
  const diffDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const postedTimeAgo = diffDays <= 0 ? "Today" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

  const isPlatform = String(job.sourceType || "").toLowerCase() === "platform";

  return {
    id: job._id,
    title: cleanTitle,
    company: cleanCompany,
    companyLogo: "",
    verified: isPlatform,
    department: "Engineering",
    location: locationStr,
    workMode,
    employmentType,
    salaryMin: job.salary?.min || 0,
    salaryMax: job.salary?.max || 0,
    salaryText,
    experienceMin: job.minExperienceYears || 0,
    experienceMax: (job.minExperienceYears || 0) + 3,
    experienceText: (job.minExperienceYears || 0) === 0 ? "Fresher / 0-1 Years" : `${job.minExperienceYears}+ Years`,
    skills: jobSkills.length > 0 ? jobSkills : (userSkills.length > 0 ? userSkills.slice(0, 3) : ["General Engineering"]),
    description: cleanDescription,
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
      skillMatchScore: matchScore,
      experienceMatchScore: job.minExperienceYears ? Math.max(50, 100 - job.minExperienceYears * 10) : 100,
      roleMatchScore: matchScore >= 70 ? 85 : 60,
      locationMatchScore: 90,
      matchedSkills,
      missingSkills,
      recommendation:
        matchScore >= 80
          ? `Strong fit for your profile! You match ${matchedSkills.length} of ${jobSkills.length || matchedSkills.length} required skills.`
          : missingSkills.length > 0
          ? `Skill gap identified: You are missing ${missingSkills.join(", ")}.`
          : "Update your profile skills to get higher accuracy match breakdowns.",
    },
    postedDate: createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    postedTimeAgo,
    sourceType: isPlatform ? "PLATFORM" : "EXTERNAL",
    sourceProvider: job.sourceProvider || (isPlatform ? "Skillezo" : "Jooble"),
    sourceUrl: job.sourceUrl || null,
    sourceName: job.sourceName || (isPlatform ? "Direct Platform" : "Jooble"),
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
