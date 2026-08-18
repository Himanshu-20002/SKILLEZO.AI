export interface IngestJobsDTO {
  provider?: string;
  keywords?: string;
  location?: string;
  radius?: string;
  page?: number;
  limit?: number;
}

export interface IngestionSummaryResponse {
  provider: string;
  requested: number;
  received: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}
