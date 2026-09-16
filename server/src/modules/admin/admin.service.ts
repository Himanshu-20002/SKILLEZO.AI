import mongoose from "mongoose";
import { JobModel } from "@/database/models/Job.model";
import { ResumeModel } from "@/database/models/Resume.model";
import { ApplicationModel } from "@/database/models/Application.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { VerificationModel } from "@/database/models/Verification.model";
import { JobIngestionCron } from "@/modules/job-ingestion/job-ingestion.cron";
import { UserRole, AccountStatus, JobStatus, JobSourceType } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { SUPER_ADMIN_EMAIL } from "@/core/auth/middleware/requireRole";
import {
  AdminUserQuery,
  AdminJobQuery,
  AdminResumeQuery,
} from "./admin.dto";

export class AdminService {
  private static getUserCollection() {
    if (!mongoose.connection.db) {
      throw new Error("Database connection is not established.");
    }
    return mongoose.connection.db.collection("user");
  }

  /**
   * Helper to build a robust MongoDB query matching string id or BSON ObjectId
   */
  public static getUserQuery(userId: string) {
    const queries: any[] = [{ id: userId }, { _id: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queries.push({ _id: new mongoose.Types.ObjectId(userId) });
    }
    return { $or: queries };
  }

  /**
   * System & Platform live metrics aggregator
   */
  public static async getPlatformMetrics() {
    const userColl = this.getUserCollection();

    // 1. User metrics
    const [totalUsers, candidates, recruiters, admins, activeUsers, suspendedUsers] =
      await Promise.all([
        userColl.countDocuments(),
        userColl.countDocuments({ role: UserRole.CANDIDATE }),
        userColl.countDocuments({ role: UserRole.RECRUITER }),
        userColl.countDocuments({ $or: [{ role: UserRole.ADMIN }, { email: SUPER_ADMIN_EMAIL }] }),
        userColl.countDocuments({ accountStatus: { $ne: AccountStatus.SUSPENDED } }),
        userColl.countDocuments({ accountStatus: AccountStatus.SUSPENDED }),
      ]);

    // 2. Job metrics
    const [totalJobs, activeJobs, closedJobs, externalJobs, platformJobs] =
      await Promise.all([
        JobModel.countDocuments(),
        JobModel.countDocuments({ status: JobStatus.ACTIVE }),
        JobModel.countDocuments({ status: JobStatus.CLOSED }),
        JobModel.countDocuments({ sourceType: JobSourceType.EXTERNAL }),
        JobModel.countDocuments({ sourceType: JobSourceType.PLATFORM }),
      ]);

    // 3. Resume & Intelligence metrics
    const [totalResumes, parsedResumes, failedResumes] = await Promise.all([
      ResumeModel.countDocuments(),
      ResumeModel.countDocuments({ status: "parsed" }),
      ResumeModel.countDocuments({ status: "failed" }),
    ]);

    // Calculate average ATS score across parsed resumes
    const scoreAgg = await ResumeModel.aggregate([
      { $match: { "analysis.atsScore": { $exists: true, $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: "$analysis.atsScore" } } },
    ]);
    const avgAtsScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avgScore) : 74;

    // 4. Job Applications & Skill Verifications
    const [totalApplications, totalVerifications] = await Promise.all([
      ApplicationModel.countDocuments(),
      VerificationModel.countDocuments({ score: { $gte: 70 } }),
    ]);

    return {
      users: {
        total: totalUsers,
        candidates,
        recruiters,
        admins: Math.max(admins, 1),
        active: activeUsers,
        suspended: suspendedUsers,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        closed: closedJobs,
        external: externalJobs,
        platform: platformJobs,
      },
      resumes: {
        total: totalResumes,
        parsed: parsedResumes,
        failed: failedResumes,
        avgAtsScore,
      },
      activity: {
        applications: totalApplications,
        verifications: totalVerifications,
      },
      system: {
        uptime: process.uptime(),
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    };
  }

  /**
   * Paginated user directory with search & filters
   */
  public static async listUsers(query: AdminUserQuery) {
    const userColl = this.getUserCollection();
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.status) {
      filter.accountStatus = query.status;
    }

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), "i");
      filter.$or = [{ email: regex }, { name: regex }];
    }

    const [total, rawUsers] = await Promise.all([
      userColl.countDocuments(filter),
      userColl
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const users = rawUsers.map((u: any) => ({
      id: u.id || u._id?.toString(),
      email: u.email,
      name: u.name || u.email?.split("@")[0] || "User",
      role: u.email?.toLowerCase() === SUPER_ADMIN_EMAIL ? UserRole.ADMIN : (u.role || UserRole.CANDIDATE),
      accountStatus: u.accountStatus || AccountStatus.ACTIVE,
      emailVerified: Boolean(u.emailVerified),
      createdAt: u.createdAt || new Date(),
      lastLoginAt: u.lastLoginAt || null,
      image: u.image || null,
    }));

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update role of a specific user
   */
  public static async updateUserRole(userId: string, newRole: UserRole) {
    const userColl = this.getUserCollection();
    const query = this.getUserQuery(userId);

    const targetUser = await userColl.findOne(query);

    if (!targetUser) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (targetUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL && newRole !== UserRole.ADMIN) {
      throw new AppError(
        "Super Admin account role cannot be changed",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    await userColl.updateOne(
      query,
      { $set: { role: newRole, updatedAt: new Date() } }
    );

    return {
      id: userId,
      email: targetUser.email,
      role: newRole,
      updated: true,
    };
  }

  /**
   * Update account status of a user (suspend / activate)
   */
  public static async updateUserStatus(userId: string, newStatus: AccountStatus) {
    const userColl = this.getUserCollection();
    const query = this.getUserQuery(userId);

    const targetUser = await userColl.findOne(query);

    if (!targetUser) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (targetUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL && newStatus !== AccountStatus.ACTIVE) {
      throw new AppError(
        "Super Admin account cannot be suspended or deactivated",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    await userColl.updateOne(
      query,
      { $set: { accountStatus: newStatus, updatedAt: new Date() } }
    );

    // Revoke active sessions if account is suspended or deactivated
    if (newStatus !== AccountStatus.ACTIVE && mongoose.connection.db) {
      try {
        const sessionColl = mongoose.connection.db.collection("session");
        const sessionQueries: any[] = [
          { userId },
          { userId: targetUser._id?.toString() },
          { userId: targetUser._id },
        ];
        if (targetUser.id) {
          sessionQueries.push({ userId: targetUser.id });
        }
        if (mongoose.Types.ObjectId.isValid(userId)) {
          sessionQueries.push({ userId: new mongoose.Types.ObjectId(userId) });
        }
        await sessionColl.deleteMany({ $or: sessionQueries });
      } catch (err) {
        console.warn("[AdminService] Could not clear sessions for suspended user:", err);
      }
    }

    return {
      id: userId,
      email: targetUser.email,
      accountStatus: newStatus,
      updated: true,
    };
  }

  /**
   * Permanently delete a user and cascade cleanup associated records
   */
  public static async deleteUser(userId: string) {
    const userColl = this.getUserCollection();
    const query = this.getUserQuery(userId);

    const targetUser = await userColl.findOne(query);
    if (!targetUser) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (targetUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
      throw new AppError(
        "Super Admin account cannot be deleted",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // 1. Delete user from user collection
    await userColl.deleteOne(query);

    // 2. Cascade delete from better-auth session and account collections if connected
    if (mongoose.connection.db) {
      try {
        const sessionColl = mongoose.connection.db.collection("session");
        const accountColl = mongoose.connection.db.collection("account");
        const idQueries: any[] = [{ userId }];
        if (mongoose.Types.ObjectId.isValid(userId)) {
          idQueries.push({ userId: new mongoose.Types.ObjectId(userId) });
        }
        await Promise.all([
          sessionColl.deleteMany({ $or: idQueries }),
          accountColl.deleteMany({ $or: idQueries }),
        ]);
      } catch (err) {
        console.warn("[AdminService] Failed to clean up auth sessions/accounts:", err);
      }
    }

    // 3. Cascade delete associated candidate profile, resumes, and applications
    try {
      await Promise.all([
        ProfileModel.deleteMany({ userId }),
        ResumeModel.deleteMany({ userId }),
        ApplicationModel.deleteMany({ userId }),
      ]);
    } catch (err) {
      console.warn("[AdminService] Non-fatal cascade cleanup error:", err);
    }

    return {
      id: userId,
      email: targetUser.email,
      deleted: true,
    };
  }

  /**
   * List jobs with pagination, source, and moderation filters
   */
  public static async listJobs(query: AdminJobQuery) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.source) {
      filter.sourceType = query.source;
    }

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), "i");
      filter.$or = [{ title: regex }, { companyName: regex }, { "location.raw": regex }];
    }

    const [total, rawJobs] = await Promise.all([
      JobModel.countDocuments(filter),
      JobModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const jobs = rawJobs.map((j: any) => ({
      id: j._id.toString(),
      title: j.title,
      companyName: j.companyName || "Confidential",
      sourceType: j.sourceType,
      sourceProvider: j.sourceProvider || null,
      sourceUrl: j.sourceUrl || null,
      status: j.status,
      location: j.location?.raw || j.rawLocation || "Remote",
      employmentType: j.employmentType || "full_time",
      createdAt: j.createdAt,
    }));

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update status of a job
   */
  public static async updateJobStatus(jobId: string, status: JobStatus) {
    const job = await JobModel.findByIdAndUpdate(
      jobId,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!job) {
      throw new AppError("Job not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    return {
      id: job._id.toString(),
      status: job.status,
      updated: true,
    };
  }

  /**
   * Delete a job posting
   */
  public static async deleteJob(jobId: string) {
    const deleted = await JobModel.findByIdAndDelete(jobId);
    if (!deleted) {
      throw new AppError("Job not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return { id: jobId, deleted: true };
  }

  /**
   * Manually trigger external job ingestion cron cycle
   */
  public static async triggerJobIngestion() {
    const cronService = new JobIngestionCron();
    const result = await cronService.runCycle();
    return {
      message: "External job synchronization completed successfully",
      ...result,
    };
  }

  /**
   * List candidate resumes with ATS scores and parsing status
   */
  public static async listResumes(query: AdminResumeQuery) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), "i");
      filter.$or = [
        { originalName: regex },
        { targetRole: regex },
        { "parsedData.personalInfo.name": regex },
        { "parsedData.personalInfo.email": regex },
      ];
    }

    const [total, rawResumes] = await Promise.all([
      ResumeModel.countDocuments(filter),
      ResumeModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const resumes = rawResumes.map((r: any) => ({
      id: r._id.toString(),
      userId: r.userId,
      originalName: r.originalName,
      targetRole: r.targetRole || r.parsedData?.personalInfo?.targetRole || "General Candidate",
      candidateName: r.parsedData?.personalInfo?.name || "Candidate",
      candidateEmail: r.parsedData?.personalInfo?.email || "N/A",
      fileSize: r.fileSize,
      status: r.status,
      atsScore: r.analysis?.atsScore ?? 70,
      skillsCount: r.parsedData?.skills?.length || 0,
      projectsCount: r.parsedData?.projects?.length || 0,
      createdAt: r.createdAt,
    }));

    return {
      resumes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
