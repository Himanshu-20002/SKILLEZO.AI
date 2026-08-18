import { NormalizedExternalJob } from "./normalized-job.types";

export interface JobSourceQuery {
  keywords?: string;
  location?: string;
  radius?: string;
  salary?: number;
  page?: number;
  limit?: number;
  companySearch?: boolean;
}

export interface ExternalJobResult {
  totalCount: number;
  jobs: NormalizedExternalJob[];
}

export interface JobSourceProvider {
  readonly provider: string;
  searchJobs(query: JobSourceQuery): Promise<ExternalJobResult>;
}
