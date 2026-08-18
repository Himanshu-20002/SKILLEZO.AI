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
    const limit = query.limit && query.limit > 0 ? Math.min(50, query.limit) : 20;

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
}
