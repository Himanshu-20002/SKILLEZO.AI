import { JobRepository } from "@/database/repositories/job/JobRepository";
import { JobSearchQueryDTO, PaginatedJobsResponseDTO } from "./jobs.dto";
import { IJob } from "@/database/models/Job.model";
import { CompanyMemberModel } from "@/database/models/CompanyMember.model";
import { CompanyModel } from "@/database/models/Company.model";
import { ApplicationModel } from "@/database/models/Application.model";
import { JobStatus, JobSourceType, CompetencyImportance } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class JobsService {
  private readonly jobRepository: JobRepository;

  constructor(jobRepository?: JobRepository) {
    this.jobRepository = jobRepository || new JobRepository();
  }

  async searchJobs(query: JobSearchQueryDTO): Promise<PaginatedJobsResponseDTO> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(100, query.limit) : 20;

    const result = await this.jobRepository.findPublicJobs({
      ...query,
      page,
      limit,
    });

    const totalPages = result.totalPages;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      items: result.jobs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async getJobById(jobId: string): Promise<IJob> {
    const job = await this.jobRepository.findPublicJobById(jobId);

    if (!job) {
      throw new AppError(
        "Job not found or is currently unavailable",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.JOB_NOT_FOUND
      );
    }

    return job;
  }

  async getJobRedirectUrl(jobId: string): Promise<string> {
    const job = await this.getJobById(jobId);

    if (!job.sourceUrl) {
      throw new AppError(
        "This listing is hosted directly on Skillezo and has no external redirect URL.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.BAD_REQUEST
      );
    }

    // Lightweight health probe with fast 1.5s timeout for external jobs
    if (job.sourceType === "external") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(job.sourceUrl, {
          method: "HEAD",
          signal: controller.signal,
          headers: { "User-Agent": "SkillezoAI-LinkVerifier/1.0" },
        }).catch(() => null);

        clearTimeout(timeoutId);

        if (res && (res.status === 404 || res.status === 410)) {
          // Mark listing as closed in MongoDB so no further users see stale link
          await this.jobRepository.markJobClosed(jobId);
          throw new AppError(
            "This external job posting has expired or been removed from the source board.",
            HTTP_STATUS.GONE,
            ERROR_CODES.JOB_NOT_FOUND
          );
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        // Network timeout or blocked HEAD probe: safely allow candidate redirect to proceed
      }
    }

    return job.sourceUrl;
  }

  async createJob(userId: string, data: any): Promise<IJob> {
    if (!data.title || !data.description) {
      throw new AppError(
        "Job title and description are required",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const skills = Array.isArray(data.requiredSkills)
      ? data.requiredSkills.map((s: any) => {
          if (typeof s === "string") {
            return {
              name: s,
              requiredLevel: 4,
              importance: CompetencyImportance.CRITICAL,
            };
          }
          let importance = s.importance;
          if (
            !importance ||
            importance === "mandatory" ||
            importance === "required" ||
            !Object.values(CompetencyImportance).includes(importance)
          ) {
            importance = CompetencyImportance.CRITICAL;
          }
          return {
            name: s.name,
            requiredLevel: s.requiredLevel || 4,
            importance,
            minYearsOfExperience: s.minYearsOfExperience || null,
          };
        })
      : [];

    // Find recruiter company membership
    let companyId = data.companyId || null;
    let companyName = data.companyName;

    if (!companyId) {
      const membership = await CompanyMemberModel.findOne({
        userId,
        status: "active",
      });
      if (membership) {
        companyId = membership.companyId;
        const comp = await CompanyModel.findById(membership.companyId).select("name");
        if (comp && !companyName) {
          companyName = comp.name;
        }
      }
    }

    const minSalary = data.salary?.min != null ? Number(data.salary.min) : 25000;
    const maxSalary = data.salary?.max != null ? Number(data.salary.max) : 50000;
    const currency = data.salary?.currency || "INR";
    const rawSalary =
      currency === "INR"
        ? `₹${minSalary.toLocaleString("en-IN")} – ₹${maxSalary.toLocaleString("en-IN")}`
        : `$${minSalary.toLocaleString("en-US")} – $${maxSalary.toLocaleString("en-US")}`;

    const job = await this.jobRepository.create({
      title: data.title,
      description: data.description,
      companyId: companyId || undefined,
      companyName: companyName || "Enterprise Hiring",
      department: data.department || "Engineering",
      employmentType: data.employmentType || "Full-Time",
      workplaceType: data.workplaceType || "Remote",
      location: data.location || { city: "Remote", country: "India" },
      rawLocation: typeof data.location === "string" ? data.location : (data.location?.raw || "Remote"),
      requiredSkills: skills,
      minExperienceYears: data.minExperienceYears != null ? Number(data.minExperienceYears) : 0,
      salary: {
        min: minSalary,
        max: maxSalary,
        currency,
        raw: rawSalary,
      },
      rawSalary,
      status: data.status || JobStatus.ACTIVE,
      sourceType: JobSourceType.PLATFORM,
      createdBy: userId,
      publishedAt: new Date(),
    } as any);

    return job;
  }

  async getCompanyJobs(userId: string): Promise<any[]> {
    const memberships = await CompanyMemberModel.find({
      userId,
      status: "active",
    }).select("companyId");

    const companyIds = memberships.map((m) => m.companyId).filter(Boolean);

    const query: any = {
      $or: [
        { createdBy: userId },
        ...(companyIds.length > 0 ? [{ companyId: { $in: companyIds } }] : []),
      ],
    };

    const jobs = await this.jobRepository.findMany(query);
    if (!jobs || jobs.length === 0) {
      return [];
    }

    const jobIds = jobs.map((j) => j._id);
    const appCounts = await ApplicationModel.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(appCounts.map((c) => [c._id.toString(), c.count]));

    return jobs.map((j) => {
      const jobObj = typeof (j as any).toObject === "function" ? (j as any).toObject() : { ...j };
      return {
        ...jobObj,
        id: j._id.toString(),
        applicantsCount: countMap.get(j._id.toString()) || 0,
      };
    });
  }

  async updateJob(userId: string, jobId: string, data: any): Promise<IJob> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.JOB_NOT_FOUND);
    }

    if (data.title !== undefined) job.title = data.title;
    if (data.description !== undefined) job.description = data.description;
    if (data.department !== undefined) (job as any).department = data.department;
    if (data.employmentType !== undefined) job.employmentType = data.employmentType;
    if (data.workplaceType !== undefined) job.workplaceType = data.workplaceType;
    if (data.location !== undefined) {
      job.location = typeof data.location === "string" ? { raw: data.location } : data.location;
      job.rawLocation = typeof data.location === "string" ? data.location : (data.location?.raw || "Remote");
    }
    if (data.minExperienceYears !== undefined) {
      job.minExperienceYears = Number(data.minExperienceYears);
    }

    if (data.requiredSkills !== undefined) {
      const skills = Array.isArray(data.requiredSkills)
        ? data.requiredSkills.map((s: any) => {
            if (typeof s === "string") {
              return {
                name: s,
                requiredLevel: 3,
                importance: CompetencyImportance.CRITICAL,
              };
            }
            return {
              name: s.name,
              requiredLevel: s.requiredLevel || 3,
              importance: (s.importance || CompetencyImportance.CRITICAL).toLowerCase(),
              minYearsOfExperience: s.minYearsOfExperience,
            };
          })
        : [];
      job.requiredSkills = skills as any;
    }

    if (data.salary !== undefined || data.salaryMin !== undefined || data.salaryMax !== undefined) {
      const minSalary =
        data.salary?.min != null
          ? Number(data.salary.min)
          : data.salaryMin != null
          ? Number(data.salaryMin)
          : job.salary?.min || 0;

      const maxSalary =
        data.salary?.max != null
          ? Number(data.salary.max)
          : data.salaryMax != null
          ? Number(data.salaryMax)
          : job.salary?.max || 0;

      const currency = data.salary?.currency || data.currency || job.salary?.currency || "INR";
      const rawSalary =
        currency === "INR"
          ? `₹${minSalary.toLocaleString("en-IN")} – ₹${maxSalary.toLocaleString("en-IN")}`
          : `$${minSalary.toLocaleString("en-US")} – $${maxSalary.toLocaleString("en-US")}`;

      job.salary = {
        min: minSalary,
        max: maxSalary,
        currency,
        raw: rawSalary,
      };
      job.rawSalary = rawSalary;
    }

    if (data.status !== undefined) {
      job.status = data.status;
      if (data.status === JobStatus.CLOSED) {
        job.closesAt = new Date();
      }
    }

    await job.save();
    return job;
  }

  async updateJobStatus(userId: string, jobId: string, status: string): Promise<IJob> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.JOB_NOT_FOUND);
    }

    job.status = status as any;
    if (status === JobStatus.CLOSED) {
      job.closesAt = new Date();
    }
    await job.save();
    return job;
  }
}

