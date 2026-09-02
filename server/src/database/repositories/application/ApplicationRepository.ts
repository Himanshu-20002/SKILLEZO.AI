import { BaseRepository } from "../base";
import { ApplicationModel, IApplication } from "@/database/models/Application.model";

export interface FindApplicationsPaginatedOptions {
  page?: number;
  limit?: number;
  status?: string;
}

export class ApplicationRepository extends BaseRepository<IApplication> {
  constructor() {
    super(ApplicationModel, "Application");
  }

  async findByIdAndUserId(applicationId: string, userId: string): Promise<IApplication | null> {
    return await this.model
      .findOne({ _id: applicationId, userId })
      .populate("jobId")
      .populate("resumeId")
      .exec();
  }

  async findByUserAndJob(userId: string, jobId: string): Promise<IApplication | null> {
    return await this.model.findOne({ userId, jobId }).exec();
  }

  async findAppliedJobIdsByUserId(userId: string): Promise<string[]> {
    const apps = await this.model
      .find({ userId })
      .select("jobId")
      .exec();
    return apps.map((a: any) => a.jobId?.toString()).filter(Boolean);
  }

  async findPaginatedByUserId(
    userId: string,
    options: FindApplicationsPaginatedOptions = {}
  ): Promise<{ items: IApplication[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (options.status) {
      query.status = options.status;
    }

    const [items, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("jobId")
        .populate("resumeId")
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findCompanyApplications(
    companyJobIds: string[],
    options: { page?: number; limit?: number; jobId?: string; status?: string } = {}
  ): Promise<{ items: IApplication[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const stringJobIds = companyJobIds.map((id) => id.toString());
    const query: any = {};

    if (options.jobId) {
      if (stringJobIds.includes(options.jobId.toString())) {
        query.jobId = options.jobId;
      } else {
        query.jobId = { $in: [] }; // Force empty
      }
    } else {
      query.jobId = { $in: companyJobIds };
    }

    if (options.status) {
      query.status = options.status;
    }

    const [items, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("jobId")
        .populate("resumeId")
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findCompanyApplicationById(
    applicationId: string,
    companyJobIds: string[]
  ): Promise<IApplication | null> {
    return await this.model
      .findOne({ _id: applicationId, jobId: { $in: companyJobIds } })
      .populate("jobId")
      .populate("resumeId")
      .exec();
  }
}

