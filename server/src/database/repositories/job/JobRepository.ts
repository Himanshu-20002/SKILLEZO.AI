import { BaseRepository } from "../base";
import { JobModel, IJob } from "@/database/models/Job.model";
import { JobSourceType, JobStatus } from "@/core/constants/enums";
import { Types } from "mongoose";

export interface PublicJobSearchOptions {
  keyword?: string;
  location?: string;
  sourceType?: string;
  sourceProvider?: string;
  employmentType?: string;
  workplaceType?: string;
  companyId?: string;
  roleId?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface PublicJobSearchResult {
  jobs: IJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class JobRepository extends BaseRepository<IJob> {
  constructor() {
    super(JobModel, "Job");
  }

  async findByExternalIdentity(
    sourceProvider: string,
    externalId: string
  ): Promise<IJob | null> {
    return await this.findOne({
      sourceProvider,
      externalId,
    });
  }

  async upsertExternalJob(
    data: Partial<IJob>
  ): Promise<{ job: IJob; isNew: boolean }> {
    if (!data.sourceProvider || !data.externalId) {
      throw new Error("Cannot upsert external job without sourceProvider and externalId");
    }

    const existing = await this.findByExternalIdentity(
      data.sourceProvider,
      data.externalId
    );

    if (existing) {
      const updated = await this.model
        .findOneAndUpdate(
          { _id: existing._id },
          { $set: data },
          { new: true, runValidators: true }
        )
        .exec();
      return { job: updated || existing, isNew: false };
    } else {
      const created = await this.create({
        ...data,
        sourceType: JobSourceType.EXTERNAL,
        importedAt: data.importedAt || new Date(),
      });
      return { job: created, isNew: true };
    }
  }

  async findExternalJobs(filter: Record<string, any> = {}): Promise<IJob[]> {
    return await this.findMany({
      sourceType: JobSourceType.EXTERNAL,
      ...filter,
    });
  }

  async findJobsByProvider(provider: string): Promise<IJob[]> {
    return await this.findMany({
      sourceType: JobSourceType.EXTERNAL,
      sourceProvider: provider,
    });
  }

  async findPublicJobs(options: PublicJobSearchOptions): Promise<PublicJobSearchResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      status: JobStatus.ACTIVE,
    };

    if (options.sourceType) {
      filter.sourceType = options.sourceType;
    }

    if (options.sourceProvider) {
      filter.sourceProvider = options.sourceProvider;
    }

    if (options.employmentType) {
      filter.employmentType = options.employmentType;
    }

    if (options.workplaceType) {
      filter.workplaceType = options.workplaceType;
    }

    if (options.companyId && Types.ObjectId.isValid(options.companyId)) {
      filter.companyId = new Types.ObjectId(options.companyId);
    }

    if (options.roleId && Types.ObjectId.isValid(options.roleId)) {
      filter.roleId = new Types.ObjectId(options.roleId);
    }

    if (options.location) {
      const locRegex = new RegExp(options.location, "i");
      filter.$or = [
        { "location.city": locRegex },
        { "location.state": locRegex },
        { "location.country": locRegex },
        { rawLocation: locRegex },
      ];
    }

    if (options.keyword) {
      filter.$text = { $search: options.keyword };
    }

    const sortOption: Record<string, 1 | -1> =
      options.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [jobs, total] = await Promise.all([
      this.model.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      jobs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findPublicJobById(jobId: string): Promise<IJob | null> {
    if (!Types.ObjectId.isValid(jobId)) {
      return null;
    }
    return await this.model
      .findOne({
        _id: jobId,
        status: JobStatus.ACTIVE,
      })
      .exec();
  }

  async markJobClosed(jobId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(jobId)) {
      return false;
    }
    const result = await this.model.updateOne(
      { _id: new Types.ObjectId(jobId) },
      { $set: { status: JobStatus.CLOSED, closesAt: new Date() } }
    ).exec();
    return result.modifiedCount > 0;
  }

  async cleanupStaleExternalJobs(days: number = 14): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.model.updateMany(
      {
        sourceType: JobSourceType.EXTERNAL,
        status: JobStatus.ACTIVE,
        $or: [
          { importedAt: { $lt: cutoffDate } },
          { sourceUpdatedAt: { $lt: cutoffDate } },
        ],
      },
      {
        $set: { status: JobStatus.CLOSED, closesAt: new Date() },
      }
    ).exec();
    return result.modifiedCount;
  }
}
