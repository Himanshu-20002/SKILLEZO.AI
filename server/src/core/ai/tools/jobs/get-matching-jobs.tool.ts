import { AITool, AIToolContext } from "../types";
import {
  GetMatchingJobsInput,
  GetMatchingJobsInputSchema,
  GetMatchingJobsOutput,
  GetMatchingJobsOutputSchema,
} from "../schemas/job-tool.schemas";
import { JobsService } from "@/modules/jobs/jobs.service";
import { AIToolOwnershipError, AIToolExecutionError } from "../tool-errors";

export class GetMatchingJobsTool
  implements AITool<GetMatchingJobsInput, GetMatchingJobsOutput>
{
  public readonly name = "getMatchingJobs";
  public readonly description =
    "Search and retrieve matching active job listings for the candidate based on target role and optional location. Reuses authoritative job ingestion service.";
  public readonly inputSchema = GetMatchingJobsInputSchema;
  public readonly outputSchema = GetMatchingJobsOutputSchema;

  constructor(private readonly jobsService: JobsService = new JobsService()) {}

  public async execute(
    params: GetMatchingJobsInput,
    context: AIToolContext
  ): Promise<GetMatchingJobsOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to query matching jobs.");
    }

    try {
      const searchResult = await this.jobsService.searchJobs({
        keyword: params.targetRole,
        location: params.location,
        limit: params.limit,
      });

      const items = (searchResult.items || []).map((job: any) => {
        const requiredSkills = Array.isArray(job.requiredSkills)
          ? job.requiredSkills.map((s: any) => (typeof s === "string" ? s : s.name))
          : [];

        return {
          id: job._id ? job._id.toString() : job.id,
          title: job.title || "Job Listing",
          companyName: job.companyName || "Skillezo Hiring Partner",
          location: job.location || undefined,
          workplaceType: job.workplaceType || undefined,
          type: job.type || undefined,
          requiredSkills,
          salaryMin: typeof job.salaryMin === "number" ? job.salaryMin : null,
          salaryMax: typeof job.salaryMax === "number" ? job.salaryMax : null,
          currency: job.currency || null,
          sourceUrl: job.sourceUrl || undefined,
        };
      });

      return {
        totalMatches: searchResult.pagination.total,
        limit: params.limit,
        jobs: items,
      };
    } catch (err: any) {
      throw new AIToolExecutionError(
        "getMatchingJobs",
        err?.message || "Failed to retrieve matching jobs"
      );
    }
  }
}
