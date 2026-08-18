import {
  JobSourceType,
  JobSourceProvider,
  JobEmploymentType,
  WorkplaceType,
} from "@/core/constants/enums";

export interface JobSearchQueryDTO {
  keyword?: string;
  location?: string;
  sourceType?: JobSourceType;
  sourceProvider?: JobSourceProvider;
  employmentType?: JobEmploymentType;
  workplaceType?: WorkplaceType;
  companyId?: string;
  roleId?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface JobPaginationMetaDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedJobsResponseDTO {
  items: any[];
  pagination: JobPaginationMetaDTO;
}
