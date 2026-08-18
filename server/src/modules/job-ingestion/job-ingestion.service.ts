import { JobRepository } from "@/database/repositories/job/JobRepository";
import { ProviderRegistry } from "@/integrations/jobs/provider.registry";
import { IngestJobsDTO, IngestionSummaryResponse } from "./job-ingestion.dto";
import { JobSourceType, JobStatus } from "@/core/constants/enums";
import { IJob } from "@/database/models/Job.model";

export class JobIngestionService {
  private readonly jobRepository: JobRepository;
  private readonly providerRegistry: ProviderRegistry;

  constructor(
    jobRepository?: JobRepository,
    providerRegistry?: ProviderRegistry
  ) {
    this.jobRepository = jobRepository || new JobRepository();
    this.providerRegistry = providerRegistry || ProviderRegistry.getInstance();
  }

  async ingestJobs(dto: IngestJobsDTO): Promise<IngestionSummaryResponse> {
    const providerName = (dto.provider || "jooble").toLowerCase();
    const provider = this.providerRegistry.getProvider(providerName);

    const query = {
      keywords: dto.keywords || "software engineer",
      location: dto.location || "Delhi",
      radius: dto.radius || "40",
      page: dto.page || 1,
      limit: dto.limit || 20,
    };

    const externalResult = await provider.searchJobs(query);
    const normalizedJobs = externalResult.jobs || [];

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const nj of normalizedJobs) {
      if (!nj.externalId || !nj.title) {
        skippedCount++;
        continue;
      }

      try {
        const jobPayload: Partial<IJob> = {
          sourceType: JobSourceType.EXTERNAL,
          sourceProvider: nj.sourceProvider,
          externalId: nj.externalId,
          sourceUrl: nj.sourceUrl,
          sourceName: nj.sourceName,
          companyName: nj.companyName,
          title: nj.title,
          description: nj.description,
          rawLocation: nj.location.raw,
          location: {
            raw: nj.location.raw,
          },
          rawSalary: nj.salary?.raw || null,
          salary: nj.salary ? { raw: nj.salary.raw } : null,
          employmentType: nj.employmentType || null,
          sourceUpdatedAt: nj.sourceUpdatedAt || null,
          importedAt: new Date(),
          status: JobStatus.ACTIVE,
        };

        const { isNew } = await this.jobRepository.upsertExternalJob(jobPayload);
        if (isNew) {
          createdCount++;
        } else {
          updatedCount++;
        }
      } catch (err) {
        console.error(`Failed to upsert job ${nj.externalId}:`, err);
        failedCount++;
      }
    }

    return {
      provider: providerName,
      requested: query.limit,
      received: normalizedJobs.length,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: failedCount,
    };
  }
}
