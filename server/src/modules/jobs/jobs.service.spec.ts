import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobsService } from "./jobs.service";
import { JobRepository } from "@/database/repositories/job/JobRepository";
import { AppError } from "@/core/utils/AppError";

describe("JobsService", () => {
  let jobsService: JobsService;
  let mockJobRepo: Partial<JobRepository>;

  beforeEach(() => {
    mockJobRepo = {
      findPublicJobs: vi.fn(),
      findPublicJobById: vi.fn(),
      markJobClosed: vi.fn(),
    };
    jobsService = new JobsService(mockJobRepo as JobRepository);
  });

  describe("searchJobs", () => {
    it("should return paginated job items and calculate pagination metadata", async () => {
      const mockResult = {
        jobs: [
          { _id: "6a953d483e952c596034c491", title: "Frontend Engineer" },
          { _id: "6a953d483e952c596034c492", title: "Backend Engineer" },
        ] as any,
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
      };

      (mockJobRepo.findPublicJobs as any).mockResolvedValue(mockResult);

      const response = await jobsService.searchJobs({ page: 1, limit: 2 });

      expect(response.items).toHaveLength(2);
      expect(response.pagination.total).toBe(10);
      expect(response.pagination.totalPages).toBe(5);
      expect(response.pagination.hasNextPage).toBe(true);
      expect(response.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe("getJobById", () => {
    it("should throw AppError 404 when job does not exist", async () => {
      (mockJobRepo.findPublicJobById as any).mockResolvedValue(null);

      await expect(jobsService.getJobById("nonexistent-id")).rejects.toThrow(AppError);
    });

    it("should return job when found", async () => {
      const mockJob = { _id: "6a953d483e952c596034c491", title: "AI Engineer" } as any;
      (mockJobRepo.findPublicJobById as any).mockResolvedValue(mockJob);

      const job = await jobsService.getJobById("6a953d483e952c596034c491");
      expect(job.title).toBe("AI Engineer");
    });
  });
});
