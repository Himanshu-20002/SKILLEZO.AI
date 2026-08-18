import { Model, Document, UpdateQuery, Types } from "mongoose";
import { IRepository } from "./IRepository";
import { FindOptions, MongooseFilterQuery, PaginationOptions, PaginationResult, UpdateOptions } from "../types";
import { DatabaseOperationError, DuplicateEntityError } from "../errors/RepositoryError";

export abstract class BaseRepository<T extends Document<any, any, any>> implements IRepository<T> {
  protected readonly model: Model<T>;
  protected readonly entityName: string;

  constructor(model: Model<T>, entityName: string) {
    this.model = model;
    this.entityName = entityName;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const doc = new this.model(data);
      return await doc.save();
    } catch (error: any) {
      if (error.code === 11000) {
        const key = Object.keys(error.keyPattern || {})[0];
        const val = error.keyValue ? error.keyValue[key] : undefined;
        throw new DuplicateEntityError(this.entityName, key, val);
      }
      throw new DatabaseOperationError(`create ${this.entityName}`, error);
    }
  }

  async findById(id: string | Types.ObjectId, options?: FindOptions<T>): Promise<T | null> {
    try {
      const query = this.model.findById(id);
      if (options?.projection) query.select(options.projection);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.lean) query.lean();
      if (options?.session) query.session(options.session);

      return (await query.exec()) as T | null;
    } catch (error: any) {
      throw new DatabaseOperationError(`findById ${this.entityName}`, error);
    }
  }

  async findOne(filter: MongooseFilterQuery<T>, options?: FindOptions<T>): Promise<T | null> {
    try {
      const query = this.model.findOne(filter);
      if (options?.projection) query.select(options.projection);
      if (options?.sort) query.sort(options.sort);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.lean) query.lean();
      if (options?.session) query.session(options.session);

      return (await query.exec()) as T | null;
    } catch (error: any) {
      throw new DatabaseOperationError(`findOne ${this.entityName}`, error);
    }
  }

  async findMany(filter: MongooseFilterQuery<T> = {}, options?: FindOptions<T>): Promise<T[]> {
    try {
      const query = this.model.find(filter);
      if (options?.projection) query.select(options.projection);
      if (options?.sort) query.sort(options.sort);
      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.limit !== undefined) query.limit(options.limit);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.lean) query.lean();
      if (options?.session) query.session(options.session);

      return (await query.exec()) as T[];
    } catch (error: any) {
      throw new DatabaseOperationError(`findMany ${this.entityName}`, error);
    }
  }

  async updateById(id: string | Types.ObjectId, updateData: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    try {
      const updated = await this.model
        .findByIdAndUpdate(id, updateData, {
          new: options?.new !== undefined ? options.new : true,
          runValidators: options?.runValidators !== undefined ? options.runValidators : true,
          session: options?.session,
        })
        .exec();

      return updated as T | null;
    } catch (error: any) {
      if (error.code === 11000) {
        const key = Object.keys(error.keyPattern || {})[0];
        const val = error.keyValue ? error.keyValue[key] : undefined;
        throw new DuplicateEntityError(this.entityName, key, val);
      }
      throw new DatabaseOperationError(`updateById ${this.entityName}`, error);
    }
  }

  async deleteById(id: string | Types.ObjectId): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error: any) {
      throw new DatabaseOperationError(`deleteById ${this.entityName}`, error);
    }
  }

  async exists(filter: MongooseFilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).exec();
      return count > 0;
    } catch (error: any) {
      throw new DatabaseOperationError(`exists ${this.entityName}`, error);
    }
  }

  async count(filter: MongooseFilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error: any) {
      throw new DatabaseOperationError(`count ${this.entityName}`, error);
    }
  }

  async paginate(filter: MongooseFilterQuery<T> = {}, options: PaginationOptions = {}): Promise<PaginationResult<T>> {
    try {
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, Math.min(100, options.limit || 10));
      const skip = (page - 1) * limit;

      const query = this.model.find(filter).skip(skip).limit(limit);
      if (options.sort) query.sort(options.sort);

      const [data, total] = await Promise.all([query.exec(), this.model.countDocuments(filter).exec()]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: data as T[],
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error: any) {
      throw new DatabaseOperationError(`paginate ${this.entityName}`, error);
    }
  }

  async aggregate<R = any>(pipeline: any[]): Promise<R[]> {
    try {
      return await this.model.aggregate(pipeline).exec();
    } catch (error: any) {
      throw new DatabaseOperationError(`aggregate ${this.entityName}`, error);
    }
  }

  async bulkInsert(docs: Partial<T>[]): Promise<T[]> {
    try {
      return (await this.model.insertMany(docs)) as unknown as T[];
    } catch (error: any) {
      throw new DatabaseOperationError(`bulkInsert ${this.entityName}`, error);
    }
  }
}
