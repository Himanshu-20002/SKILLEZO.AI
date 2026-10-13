import {
  NotificationRepository,
  notificationRepository,
  FindUserNotificationsOptions,
} from "@/database/repositories/notification/NotificationRepository";
import { INotification } from "@/database/models/Notification.model";
import { UserModel } from "@/database/models/User.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { NotificationCategory, NotificationPriority, UserRole } from "@/core/constants/enums";
import { sendApplicationStatusEmail } from "@/core/email/email.service";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS, ERROR_CODES } from "@/core/constants";
import { BroadcastNotificationDTO, GetNotificationsQueryDTO } from "./notification.dto";

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository = notificationRepository) {}

  /**
   * Get paginated notifications for an authenticated user
   */
  async getUserNotifications(
    userId: string,
    query: Partial<GetNotificationsQueryDTO> = {}
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { notifications, total, unreadCount } = await this.notificationRepo.findByUserId(
      userId,
      {
        page,
        limit,
        category: query.category,
        unreadOnly: query.unreadOnly,
      }
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fast count of unread notifications for navbar bell badge
   */
  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepo.getUnreadCount(userId);
    return { unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string, userId: string): Promise<INotification> {
    const updated = await this.notificationRepo.markAsRead(id, userId);
    if (!updated) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return updated;
  }

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const updatedCount = await this.notificationRepo.markAllAsRead(userId);
    return { updatedCount };
  }

  /**
   * Triggered when recruiter updates candidate application status
   */
  async notifyApplicationStatusChange(options: {
    candidateUserId: string;
    jobTitle: string;
    companyName: string;
    newStatus: string;
    applicationId: string;
    candidateEmail?: string;
    candidateName?: string;
  }): Promise<INotification | null> {
    const {
      candidateUserId,
      jobTitle,
      companyName,
      newStatus,
      applicationId,
    } = options;

    const formattedStatus = newStatus.replace(/_/g, " ").toUpperCase();
    const title = `Application Status: ${formattedStatus}`;
    const message = `Your application for ${jobTitle} at ${companyName} has been moved to ${formattedStatus}.`;

    const notification = await this.notificationRepo.create({
      userId: candidateUserId,
      category: NotificationCategory.APPLICATION,
      priority: NotificationPriority.HIGH,
      title,
      message,
      actionUrl: "/dashboard/applications",
      actionLabel: "View Application",
      metadata: { applicationId, newStatus, jobTitle, companyName },
      read: false,
    });

    // Asynchronously dispatch transactional email
    let email = options.candidateEmail;
    let name = options.candidateName || "Candidate";

    if (!email) {
      const user = await UserModel.findById(candidateUserId).select("email name").lean();
      if (user) {
        email = user.email;
        name = user.name || name;
      }
    }

    if (email) {
      sendApplicationStatusEmail({
        to: email,
        name,
        jobTitle,
        companyName,
        status: newStatus,
      }).catch((err) => {
        console.error(`[NotificationService] Failed to send status email to ${email}:`, err);
      });
    }

    return notification;
  }

  /**
   * Triggered when a new job is ingested or posted.
   * Matches candidate profiles by skills and sends in-app job alert with anti-spam throttle.
   */
  async notifyJobMatches(options: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    requiredSkills?: string[];
  }): Promise<number> {
    const { jobId, jobTitle, companyName, requiredSkills = [] } = options;

    if (!jobId || !jobTitle) return 0;

    // Build skill matching query (case-insensitive)
    const skillTerms = requiredSkills
      .map((s) => s.trim())
      .filter((s) => s.length > 1);

    let candidateUserIds: string[] = [];

    if (skillTerms.length > 0) {
      const regexes = skillTerms.slice(0, 5).map((term) => new RegExp(term, "i"));
      const matchingProfiles = await ProfileModel.find({
        "skills.name": { $in: regexes },
      })
        .select("userId")
        .limit(30)
        .lean();

      candidateUserIds = matchingProfiles
        .map((p) => p.userId?.toString())
        .filter((uid): uid is string => Boolean(uid));
    }

    // Fallback: If no direct skill matches found, alert recent candidates
    if (candidateUserIds.length === 0) {
      const recentUsers = await UserModel.find({
        role: UserRole.CANDIDATE,
        accountStatus: "active",
      })
        .select("_id")
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();

      candidateUserIds = recentUsers.map((u) => u._id.toString());
    }

    // Deduplicate candidate IDs
    const uniqueCandidateIds = Array.from(new Set(candidateUserIds));
    if (uniqueCandidateIds.length === 0) return 0;

    // Parallelize throttle checks concurrently across the candidate set
    const candidateThrottleChecks = await Promise.all(
      uniqueCandidateIds.map(async (userId) => {
        const count = await this.notificationRepo.getRecentJobAlertsCount(userId, 24);
        return { userId, isAllowed: count < 3 };
      })
    );

    const notificationsToCreate: Partial<INotification>[] = candidateThrottleChecks
      .filter((check) => check.isAllowed)
      .map(({ userId }) => ({
        userId,
        category: NotificationCategory.JOB_ALERT,
        priority: NotificationPriority.NORMAL,
        title: `⚡ New Job Match: ${jobTitle}`,
        message: `${companyName || "A hiring company"} is looking for candidates matching your profile for ${jobTitle}.`,
        actionUrl: `/dashboard/job-center?jobId=${jobId}`,
        actionLabel: "View Job",
        metadata: { jobId, jobTitle, companyName },
        read: false,
      }));

    if (notificationsToCreate.length === 0) return 0;

    return await this.notificationRepo.createMany(notificationsToCreate);
  }

  /**
   * Admin Broadcast announcement to target audiences
   */
  async broadcastAnnouncement(
    adminUserId: string,
    dto: BroadcastNotificationDTO
  ): Promise<{ sentCount: number }> {
    const filter: Record<string, any> = { accountStatus: "active" };

    if (dto.targetRole === "candidate") {
      filter.role = UserRole.CANDIDATE;
    } else if (dto.targetRole === "recruiter") {
      filter.role = UserRole.RECRUITER;
    }

    const targetUsers = await UserModel.find(filter).select("_id").lean();

    if (!targetUsers || targetUsers.length === 0) {
      return { sentCount: 0 };
    }

    const payloadList: Partial<INotification>[] = targetUsers.map((user) => ({
      userId: user._id.toString(),
      category: NotificationCategory.SYSTEM,
      priority: dto.priority || NotificationPriority.NORMAL,
      title: dto.title,
      message: dto.message,
      actionUrl: dto.actionUrl || null,
      actionLabel: dto.actionLabel || (dto.actionUrl ? "View Details" : null),
      metadata: { broadcastBy: adminUserId, targetRole: dto.targetRole },
      read: false,
    }));

    const sentCount = await this.notificationRepo.createMany(payloadList);
    return { sentCount };
  }
}

export const notificationService = new NotificationService();
