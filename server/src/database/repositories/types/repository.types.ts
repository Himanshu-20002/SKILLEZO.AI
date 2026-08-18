import { ProjectionType, QueryOptions, ClientSession, PopulateOptions } from "mongoose";

export type MongooseFilterQuery<T> = Record<string, any>;

export type SortOrder = 1 | -1 | "asc" | "desc" | "ascending" | "descending";

export interface SortOptions {
  [key: string]: SortOrder;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: SortOptions | string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FindOptions<T> {
  filter?: MongooseFilterQuery<T>;
  projection?: ProjectionType<T>;
  sort?: SortOptions | string;
  skip?: number;
  limit?: number;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  lean?: boolean;
  session?: ClientSession;
}

export interface UpdateOptions {
  new?: boolean;
  runValidators?: boolean;
  session?: ClientSession;
}

export interface DeleteOptions {
  session?: ClientSession;
}
