import { ApplicationRepository } from "@/database/repositories/application/ApplicationRepository";
import { CompanyMemberRepository } from "@/database/repositories/companyMember/CompanyMemberRepository";
import { JobRepository } from "@/database/repositories/job/JobRepository";
import { ApplicationStatus, CompanyMemberRole, CompanyMemberStatus, CompanyVerificationStatus } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { IResumeStorageService, resumeStorageService } from "@/core/storage/storage.service";
import { CompanyModel } from "@/database/models/Company.model";
import { CompanyMemberModel } from "@/database/models/CompanyMember.model";
import { JobModel } from "@/database/models/Job.model";
import { UserModel } from "@/database/models/User.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { Readable } from "stream";
import { Types } from "mongoose";
import { ResumeModel } from "@/database/models/Resume.model";
import { notificationService } from "@/modules/notifications";
import { messagesService } from "@/modules/messages";
import {
  UpdateRecruiterApplicationStatusDTO,
  PaginatedRecruiterApplicationsResponseDTO,
  RecruiterApplicationDetailsDTO,
  RecruiterApplicationListItemDTO,
} from "./recruiter-application.dto";

export class RecruiterApplicationService {
  private readonly applicationRepository: ApplicationRepository;
  private readonly companyMemberRepository: CompanyMemberRepository;
  private readonly jobRepository: JobRepository;
  private readonly storageService: IResumeStorageService;

  constructor(
    applicationRepository?: ApplicationRepository,
    companyMemberRepository?: CompanyMemberRepository,
    jobRepository?: JobRepository,
    storageService?: IResumeStorageService
  ) {
    this.applicationRepository = applicationRepository || new ApplicationRepository();
    this.companyMemberRepository = companyMemberRepository || new CompanyMemberRepository();
    this.jobRepository = jobRepository || new JobRepository();
    this.storageService = storageService || resumeStorageService;
  }

  private async assertRecruiterAuthorization(userId: string): Promise<{ companyIds: string[]; companyJobIds: string[] }> {
    let memberships = await this.companyMemberRepository.findMembershipsByUser(userId);
    const allowedRoles: string[] = [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN, CompanyMemberRole.RECRUITER];
    let activeMemberships = memberships.filter(
      (m) =>
        m.status === CompanyMemberStatus.ACTIVE &&
        allowedRoles.includes(m.role)
    );

    if (activeMemberships.length === 0) {
      // Auto-provision enterprise recruiter workspace
      let company = await CompanyModel.findOne({ slug: "skillezo-enterprise-hiring" });
      if (!company) {
        company = await CompanyModel.create({
          name: "SKILLEZO Enterprise Talent Network",
          slug: "skillezo-enterprise-hiring",
          description: "Global AI and Software Engineering Hiring Pipeline",
          industry: "Technology & Software",
          verificationStatus: CompanyVerificationStatus.VERIFIED,
          createdBy: userId,
        });
      }

      await CompanyMemberModel.findOneAndUpdate(
        { userId, companyId: company._id },
        {
          userId,
          companyId: company._id,
          role: CompanyMemberRole.OWNER,
          status: CompanyMemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
        { upsert: true, returnDocument: "after" }
      );

      memberships = await this.companyMemberRepository.findMembershipsByUser(userId);
      activeMemberships = memberships.filter(
        (m) =>
          m.status === CompanyMemberStatus.ACTIVE &&
          allowedRoles.includes(m.role)
      );
    }

    const companyIds = activeMemberships.map((m) => m.companyId.toString());
    const customCompanyIds = companyIds.filter(
      (cid) => cid.toString() !== "6ac33e72bce5333c78d5e58d"
    );

    // Find only jobs created by this recruiter or within their dedicated company
    const jobs = await this.jobRepository.findMany({
      createdBy: { $ne: null },
      $or: [
        { createdBy: userId },
        ...(customCompanyIds.length > 0 ? [{ companyId: { $in: customCompanyIds } }] : []),
      ],
    });
    const companyJobIds = jobs.map((j) => j._id.toString());

    return { companyIds, companyJobIds };
  }


  async getCompanyApplications(
    userId: string,
    query: { page?: number; limit?: number; jobId?: string; status?: string; search?: string }
  ): Promise<PaginatedRecruiterApplicationsResponseDTO> {
    const { companyJobIds } = await this.assertRecruiterAuthorization(userId);
    const page = query.page || 1;
    const limit = query.limit || 20;

    if (companyJobIds.length === 0) {
      return {
        items: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const result = await this.applicationRepository.findCompanyApplications(companyJobIds, query);

    const userIds = [...new Set(result.items.map((app) => app.userId).filter(Boolean))];
    const userObjectIds = userIds
      .map((id) => {
        try {
          return new Types.ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const [users, profiles] = await Promise.all([
      UserModel.collection
        .find({ _id: { $in: userObjectIds as any[] } }, { projection: { name: 1, email: 1 } })
        .toArray(),
      ProfileModel.find({ userId: { $in: userIds } })
        .select("userId name headline employabilityScore skills targetRole")
        .lean(),
    ]);

    const userMap = new Map(users.map((u: any) => [u._id ? u._id.toString() : "", u]));
    const profileMap = new Map(profiles.map((p: any) => [p.userId, p]));

    const items: RecruiterApplicationListItemDTO[] = result.items.map((app) => {
      const jobDoc = app.jobId as any;
      const resumeDoc = app.resumeId as any;
      const userDoc = userMap.get(app.userId);
      const profileDoc = profileMap.get(app.userId) as any;

      const candidateName =
        userDoc?.name ||
        (userDoc?.email ? userDoc.email.split("@")[0].replace(/[._]/g, " ") : "Candidate Applicant");

      const candidateSkills = (profileDoc?.skills || []).map((s: any) => (typeof s === "string" ? s : s.name));

      return {
        id: app._id.toString(),
        status: app.status,
        job: jobDoc && typeof jobDoc === "object" && jobDoc.title
          ? {
            id: jobDoc._id ? jobDoc._id.toString() : (app.jobId as any)?.toString(),
            title: jobDoc.title,
            companyName: jobDoc.companyName || null,
          }
          : null,
        candidate: {
          id: app.userId,
          name: candidateName,
          email: userDoc?.email,
          headline: profileDoc?.headline || profileDoc?.targetRole || undefined,
          employabilityScore: profileDoc?.profileCompleteness?.score || undefined,
          skills: candidateSkills,
        },
        conversationId: (app as any).conversationId ? (app as any).conversationId.toString() : null,
        interviewSchedule: (app as any).interviewSchedule || null,
        resume: resumeDoc && typeof resumeDoc === "object" && resumeDoc.fileName
          ? {
            id: resumeDoc._id.toString(),
            title: resumeDoc.title || resumeDoc.fileName,
            originalFileName: resumeDoc.originalFileName || resumeDoc.fileName,
            version: resumeDoc.version || 1,
          }
          : null,
        appliedAt: app.appliedAt || app.createdAt,
        updatedAt: app.updatedAt,
      };
    });

    return {
      items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    };
  }

  async getCompanyApplicationDetails(
    userId: string,
    applicationId: string
  ): Promise<RecruiterApplicationDetailsDTO> {
    const { companyJobIds } = await this.assertRecruiterAuthorization(userId);

    const application = await this.applicationRepository.findCompanyApplicationById(
      applicationId,
      companyJobIds
    );

    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    const jobDoc = application.jobId as any;
    const resumeDoc = application.resumeId as any;

    let resumeSnapshot: any = null;
    if (application.resumeSnapshot) {
      resumeSnapshot = {
        resumeId: application.resumeSnapshot.resumeId
          ? application.resumeSnapshot.resumeId.toString()
          : application.resumeId
            ? (application.resumeId as any).toString()
            : null,
        title: application.resumeSnapshot.title,
        originalFileName: application.resumeSnapshot.originalFileName,
        storageKey: application.resumeSnapshot.storageKey,
        mimeType: application.resumeSnapshot.mimeType,
        fileSize: application.resumeSnapshot.fileSize,
        version: application.resumeSnapshot.version,
        submittedAt: application.resumeSnapshot.submittedAt,
        resumeDocument:
          application.resumeSnapshot.resumeDocument ||
          (resumeDoc && resumeDoc.resumeDocument) ||
          null,
        builderConfig:
          application.resumeSnapshot.builderConfig ||
          (resumeDoc && resumeDoc.builderConfig) ||
          null,
      };
    } else if (resumeDoc) {
      resumeSnapshot = {
        resumeId: resumeDoc._id.toString(),
        title: resumeDoc.title,
        originalFileName: resumeDoc.originalFileName || resumeDoc.fileName,
        storageKey: resumeDoc.storageKey,
        mimeType: resumeDoc.mimeType,
        fileSize: resumeDoc.fileSize,
        version: resumeDoc.version,
        submittedAt: resumeDoc.createdAt,
        resumeDocument: resumeDoc.resumeDocument || null,
        builderConfig: resumeDoc.builderConfig || null,
      };
    }

    let userObjId: any = null;
    try {
      userObjId = new Types.ObjectId(application.userId);
    } catch {}

    const [userDoc, profileDoc] = await Promise.all([
      userObjId
        ? UserModel.collection.findOne({ _id: userObjId }, { projection: { name: 1, email: 1 } })
        : null,
      ProfileModel.findOne({ userId: application.userId }).lean(),
    ]);

    const candidateName =
      userDoc?.name ||
      (userDoc?.email ? userDoc.email.split("@")[0].replace(/[._]/g, " ") : "Candidate Applicant");

    const locationStr = profileDoc?.location
      ? [profileDoc.location.city, profileDoc.location.country].filter(Boolean).join(", ")
      : undefined;

    const verifiedSkillsList = (profileDoc?.skills || [])
      .filter((s) => s.verified)
      .map((s) => ({
        name: s.name,
        proficiency: s.proficiency || "Intermediate",
        score: s.score || (s.level ? s.level * 20 : 80),
      }));

    return {
      id: application._id.toString(),
      userId: application.userId,
      status: application.status,
      conversationId: application.conversationId ? application.conversationId.toString() : null,
      interviewSchedule: application.interviewSchedule || null,
      offerDetails: application.offerDetails || null,
      job: jobDoc && typeof jobDoc === "object" && jobDoc.title
        ? {
          id: jobDoc._id.toString(),
          title: jobDoc.title,
          companyName: jobDoc.companyName || null,
          location: jobDoc.location || null,
          workplaceType: jobDoc.workplaceType || null,
          employmentType: jobDoc.employmentType || null,
        }
        : null,
      candidate: {
        id: application.userId,
        name: candidateName,
        email: userDoc?.email,
        headline: profileDoc?.headline || profileDoc?.targetRole || undefined,
        phone: profileDoc?.phone || undefined,
        location: locationStr,
        bio: profileDoc?.bio || undefined,
        employabilityScore: (profileDoc as any)?.profileCompleteness?.score || undefined,
        verifiedSkills: verifiedSkillsList,
      },
      resume: resumeDoc && typeof resumeDoc === "object" && resumeDoc.fileName
        ? {
          id: resumeDoc._id.toString(),
          title: resumeDoc.title || resumeDoc.fileName,
        }
        : null,
      resumeSnapshot,
      statusHistory: (application.statusHistory || []).map((h) => ({
        status: h.status,
        changedAt: h.changedAt,
        changedBy: h.changedBy || null,
        reason: h.reason || null,
      })),
      appliedAt: application.appliedAt || application.createdAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  async getApplicationStatusHistory(userId: string, applicationId: string) {
    const details = await this.getCompanyApplicationDetails(userId, applicationId);
    return details.statusHistory;
  }

  async streamApplicationResume(
    userId: string,
    applicationId: string
  ): Promise<{ stream: Readable; fileName: string; mimeType: string; fileSize: number }> {
    const details = await this.getCompanyApplicationDetails(userId, applicationId);

    const storageKey = details.resumeSnapshot?.storageKey;
    const exists = storageKey ? await this.storageService.exists(storageKey) : false;

    if (!exists || !storageKey) {
      throw new AppError(
        "Application resume binary file is not stored on server storage. Candidate profile is available in the vector resume viewer.",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_RESUME_FILE_NOT_FOUND
      );
    }

    const stream = await this.storageService.getStream(storageKey);
    return {
      stream,
      fileName: details.resumeSnapshot?.originalFileName || "resume.pdf",
      mimeType: details.resumeSnapshot?.mimeType || "application/pdf",
      fileSize: details.resumeSnapshot?.fileSize || 0,
    };
  }

  async getDashboardStats(userId: string) {
    const { companyJobIds, companyIds } = await this.assertRecruiterAuthorization(userId);

    const emptyStats = {
      totalCandidates: 0,
      activeJobsCount: 0,
      underReviewCount: 0,
      interviewCount: 0,
      offerCount: 0,
      hiredCount: 0,
      stageCounts: {
        applied: 0,
        under_review: 0,
        shortlisted: 0,
        interview: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
      },
      recentApplications: [],
    };

    if (companyJobIds.length === 0) {
      return emptyStats;
    }
    
    // Aggregation of applications across statuses
    const apps = await this.applicationRepository.findCompanyApplications(companyJobIds, { limit: 500 });
    const allItems = apps.items || [];
    
    const stageCounts: Record<string, number> = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };
    
    allItems.forEach((app) => {
      const st = app.status || "applied";
      if (stageCounts[st] !== undefined) {
        stageCounts[st]++;
      } else {
        stageCounts[st] = 1;
      }
    });

    const activeJobs = await this.jobRepository.findMany({ 
      _id: { $in: companyJobIds },
      status: "active",
    });

    const recentCandidateIds = [...new Set(allItems.slice(0, 5).map((app) => app.userId).filter(Boolean))];
    const candidateUsers = recentCandidateIds.length > 0
      ? await UserModel.find({ _id: { $in: recentCandidateIds } }).lean()
      : [];
    const candidateMap = new Map(candidateUsers.map((u: any) => [u._id.toString(), u.name || u.email]));

    const recentApplications = allItems.slice(0, 5).map((app) => ({
      id: app._id.toString(),
      status: app.status,
      jobTitle: (app.jobId as any)?.title || "Position",
      candidateName: candidateMap.get(app.userId) || "Applicant",
      appliedAt: app.appliedAt || app.createdAt,
    }));

    return {
      totalCandidates: allItems.length,
      activeJobsCount: activeJobs.length,
      underReviewCount: stageCounts.under_review,
      interviewCount: stageCounts.interview,
      offerCount: stageCounts.offered,
      hiredCount: stageCounts.hired,
      stageCounts,
      recentApplications,
    };
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    dto: UpdateRecruiterApplicationStatusDTO
  ): Promise<RecruiterApplicationDetailsDTO> {
    const { companyJobIds } = await this.assertRecruiterAuthorization(userId);

    const application = await this.applicationRepository.findCompanyApplicationById(
      applicationId,
      companyJobIds
    );

    if (!application) {
      throw new AppError(
        "Application not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.APPLICATION_NOT_FOUND
      );
    }

    // Terminal status protection
    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new AppError(
        "Cannot modify status of a WITHDRAWN application",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION
      );
    }

    // State machine transition validation
    const allowedTransitions: Record<string, string[]> = {
      [ApplicationStatus.APPLIED]: [
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.UNDER_REVIEW]: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.SHORTLISTED]: [
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.INTERVIEW]: [
        ApplicationStatus.OFFERED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.OFFERED]: [
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.HIRED]: [], // Terminal
      [ApplicationStatus.REJECTED]: [], // Terminal
    };

    const allowed = allowedTransitions[application.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new AppError(
        `Invalid status transition from '${application.status}' to '${dto.status}'`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION
      );
    }

    application.status = dto.status;
    application.statusHistory.push({
      status: dto.status,
      changedAt: new Date(),
      changedBy: userId,
      reason: dto.reason || `Status updated to ${dto.status} by recruiter`,
    });

    await application.save();

    // When status advances to SHORTLISTED, auto-provision 2-way conversation channel
    if (dto.status === ApplicationStatus.SHORTLISTED) {
      messagesService
        .getOrCreateConversation(
          application._id.toString(),
          userId,
          dto.reason || "Congratulations! Your profile has been shortlisted. We'd love to connect regarding this opportunity."
        )
        .catch((err) => {
          console.error("[RecruiterApplicationService] Failed to auto-provision conversation on shortlist:", err);
        });
    }

    // Asynchronously notify candidate of status update (In-App + Email)
    const jobDoc = application.jobId as any;
    const jobTitle = jobDoc && typeof jobDoc === "object" && jobDoc.title ? jobDoc.title : "Application";
    const companyName = jobDoc && typeof jobDoc === "object" && jobDoc.companyName ? jobDoc.companyName : "Hiring Team";

    notificationService
      .notifyApplicationStatusChange({
        candidateUserId: application.userId,
        jobTitle,
        companyName,
        newStatus: dto.status,
        applicationId: application._id.toString(),
      })
      .catch((err) => {
        console.error("[RecruiterApplicationService] Failed to notify candidate on status update:", err);
      });

    return await this.getCompanyApplicationDetails(userId, applicationId);
  }

  async getTalentPool(
    userId: string,
    query: { search?: string; skill?: string; minScore?: number }
  ) {
    await this.assertRecruiterAuthorization(userId);

    // Fetch real candidates from database
    const candidateUsers = await UserModel.find({ role: "candidate" }).lean();
    const candidateIds = candidateUsers.map((u: any) => u._id.toString());

    const profiles = await ProfileModel.find({ userId: { $in: candidateIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    let talentList = candidateUsers.map((user: any) => {
      const profile = profileMap.get(user._id.toString());
      const rawSkills = profile?.skills || [];
      const verifiedSkills = rawSkills.map((s: any) => ({
        name: s.name,
        proficiency: s.level >= 4 ? "Expert" : s.level === 3 ? "Advanced" : "Intermediate",
        score: s.score || (s.level ? s.level * 20 : 85),
        credentialHash: s.verified ? `SKZ-V${s.score || 90}-${s.name.slice(0, 3).toUpperCase()}` : undefined,
      }));

      // Calculate employability match index
      const hasHeadline = Boolean(profile?.headline);
      const hasBio = Boolean(profile?.bio);
      const skillCount = verifiedSkills.length;
      let employabilityScore = 78;
      if (hasHeadline) employabilityScore += 8;
      if (hasBio) employabilityScore += 4;
      if (skillCount >= 3) employabilityScore += 8;
      else if (skillCount > 0) employabilityScore += 4;
      employabilityScore = Math.min(99, employabilityScore);

      const locationStr = profile?.location?.city
        ? `${profile.location.city}${profile.location.country ? `, ${profile.location.country}` : ""}`
        : "Remote";

      return {
        id: user._id.toString(),
        name: user.name || user.email.split("@")[0],
        headline: profile?.headline || `${profile?.targetRole || "Software Engineer"} Candidate`,
        location: locationStr,
        employabilityScore,
        verifiedSkills,
        targetRole: profile?.targetRole || undefined,
        bio: profile?.bio || undefined,
        socialLinks: profile?.links
          ? {
              github: profile.links.github || undefined,
              linkedin: profile.links.linkedin || undefined,
              portfolio: profile.links.portfolio || undefined,
            }
          : undefined,
      };
    });

    if (query.search) {
      const s = query.search.toLowerCase();
      talentList = talentList.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.headline.toLowerCase().includes(s) ||
          t.location.toLowerCase().includes(s)
      );
    }

    if (query.skill && query.skill !== "All Skills") {
      const sk = query.skill.toLowerCase();
      talentList = talentList.filter((t) =>
        t.verifiedSkills.some((s: any) => s.name.toLowerCase().includes(sk))
      );
    }

    if (query.minScore) {
      talentList = talentList.filter((t) => t.employabilityScore >= Number(query.minScore));
    }

    return talentList;
  }
}
