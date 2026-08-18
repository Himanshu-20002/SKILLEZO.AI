import { JobSourceProvider, JobSourceQuery, ExternalJobResult } from "../../types/job-source.types";
import { JoobleClient } from "./jooble.client";
import { JoobleMapper } from "./jooble.mapper";

export class JoobleProvider implements JobSourceProvider {
  readonly provider = "jooble";
  private readonly client: JoobleClient;

  constructor(client?: JoobleClient) {
    this.client = client || new JoobleClient();
  }

  async searchJobs(query: JobSourceQuery): Promise<ExternalJobResult> {
    const rawResponse = await this.client.search(query);
    const validatedJobs = rawResponse.jobs || [];

    const normalizedJobs = validatedJobs.map((j) => JoobleMapper.toNormalized(j));

    return {
      totalCount: rawResponse.totalCount,
      jobs: normalizedJobs,
    };
  }
}
