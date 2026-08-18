import { UpdateQuery } from "mongoose";
import { FindOptions, MongooseFilterQuery, PaginationOptions, PaginationResult } from "../types";

export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | any, options?: FindOptions<T>): Promise<T | null>;
  findOne(filter: MongooseFilterQuery<T>, options?: FindOptions<T>): Promise<T | null>;
  findMany(filter?: MongooseFilterQuery<T>, options?: FindOptions<T>): Promise<T[]>;
  updateById(id: string | any, updateData: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string | any): Promise<boolean>;
  exists(filter: MongooseFilterQuery<T>): Promise<boolean>;
  count(filter?: MongooseFilterQuery<T>): Promise<number>;
  paginate(filter: MongooseFilterQuery<T>, options: PaginationOptions): Promise<PaginationResult<T>>;
  aggregate<R = any>(pipeline: any[]): Promise<R[]>;
  bulkInsert(docs: Partial<T>[]): Promise<T[]>;
}
