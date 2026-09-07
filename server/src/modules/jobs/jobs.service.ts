import { JobRepository } from "@/database/repositories/job/JobRepository";
import { JobSearchQueryDTO, PaginatedJobsResponseDTO } from "./jobs.dto";
import { IJob } from "@/database/models/Job.model";
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
      ? data.requiredSkills.map((s: any) =>
          typeof s === "string"
            ? { name: s, requiredLevel: 4, importance: "mandatory" }
            : s
        )
      : [];

    const job = await this.jobRepository.create({
      title: data.title,
      description: data.description,
      companyName: data.companyName || "SKILLEZO Enterprise Hiring",
      department: data.department || "Engineering",
      employmentType: data.employmentType || "full_time",
      workplaceType: data.workplaceType || "remote",
      location: data.location || { city: "Remote", country: "Global" },
      rawLocation: typeof data.location === "string" ? data.location : "Remote",
      requiredSkills: skills,
      minExperienceYears: data.minExperienceYears || 2,
      salary: data.salary || { min: 90000, max: 140000, currency: "USD" },
      status: data.status || JobStatus.ACTIVE,
      sourceType: JobSourceType.INTERNAL,
      createdBy: userId,
      publishedAt: new Date(),
    } as any);

    return job;
  }

  async getCompanyJobs(userId: string): Promise<any[]> {
    const jobs = await this.jobRepository.findMany({
      $or: [
        { createdBy: userId },
        { sourceType: JobSourceType.INTERNAL },
        { status: JobStatus.ACTIVE },
      ],
    });

    return jobs;
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

