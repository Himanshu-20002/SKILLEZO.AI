import { Types } from "mongoose";
import { ConversationModel, IConversation } from "@/database/models/Conversation.model";
import { MessageModel, IMessage } from "@/database/models/Message.model";
import { ApplicationModel } from "@/database/models/Application.model";
import { JobModel } from "@/database/models/Job.model";
import { CompanyModel } from "@/database/models/Company.model";
import { CompanyMemberModel } from "@/database/models/CompanyMember.model";
import { UserModel } from "@/database/models/User.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { ApplicationStatus, CompanyMemberRole, CompanyMemberStatus } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS, ERROR_CODES } from "@/core/constants";
import { notificationService } from "@/modules/notifications";
import {
  SendMessageDTO,
  ScheduleInterviewDTO,
  GetConversationsQueryDTO,
  GetMessagesQueryDTO,
} from "./messages.dto";

export class MessagesService {
  /**
   * Helper to verify if user has recruiter access to a company
   */
  private async isCompanyRecruiter(userId: string, companyId: Types.ObjectId | string): Promise<boolean> {
    const membership = await CompanyMemberModel.findOne({
      userId,
      companyId: new Types.ObjectId(companyId),
      status: CompanyMemberStatus.ACTIVE,
      role: { $in: [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN, CompanyMemberRole.RECRUITER] },
    });
    return !!membership;
  }

  /**
   * Automatically initializes or retrieves conversation for an application (e.g. when shortlisted)
   */
  async getOrCreateConversation(
    applicationId: string,
    recruiterUserId: string,
    initialMessageText?: string
  ): Promise<{ conversation: IConversation; message?: IMessage }> {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError("Application not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    let conversation = await ConversationModel.findOne({ applicationId: application._id });

    if (!conversation) {
      const job = await JobModel.findById(application.jobId);
      if (!job) {
        throw new AppError("Associated Job not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      let companyId = job.companyId;
      if (!companyId) {
        // Fallback to enterprise network company
        const enterprise = await CompanyModel.findOne({ slug: "skillezo-enterprise-hiring" });
        if (enterprise) {
          companyId = enterprise._id;
        } else {
          throw new AppError("Job company not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
        }
      }

      conversation = await ConversationModel.create({
        applicationId: application._id,
        jobId: job._id,
        companyId,
        candidateId: application.userId,
        recruiterId: recruiterUserId,
        status: "active",
        unreadCountCandidate: 0,
        unreadCountRecruiter: 0,
      });

      // Link to application
      application.conversationId = conversation._id;
      await application.save();
    }

    let createdMessage: IMessage | undefined = undefined;

    if (initialMessageText && initialMessageText.trim()) {
      createdMessage = await MessageModel.create({
        conversationId: conversation._id,
        senderId: recruiterUserId,
        senderRole: "recruiter",
        type: "text",
        content: initialMessageText.trim(),
        readBy: [recruiterUserId],
      });

      conversation.lastMessage = {
        content: createdMessage.content,
        senderId: recruiterUserId,
        senderRole: "recruiter",
        sentAt: createdMessage.createdAt,
      };
      conversation.unreadCountCandidate += 1;
      await conversation.save();

      // Trigger candidate notification
      const jobDoc = await JobModel.findById(conversation.jobId).select("title companyName").lean();
      const jobTitle = jobDoc?.title || "Job Application";
      const companyName = jobDoc?.companyName || "Hiring Team";

      notificationService
        .notifyApplicationStatusChange({
          candidateUserId: conversation.candidateId,
          jobTitle,
          companyName,
          newStatus: "shortlisted",
          applicationId: application._id.toString(),
        })
        .catch((err) => {
          console.error("[MessagesService] Failed to notify candidate of shortlist message:", err);
        });
    }

    return { conversation, message: createdMessage };
  }

  /**
   * Retrieve list of conversations for either candidate or recruiter
   */
  async getUserConversations(
    userId: string,
    query: GetConversationsQueryDTO
  ): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Check recruiter active company memberships
    const memberships = await CompanyMemberModel.find({
      userId,
      status: CompanyMemberStatus.ACTIVE,
      role: { $in: [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN, CompanyMemberRole.RECRUITER] },
    });

    const companyIds = memberships.map((m) => m.companyId);

    // Candidate sees conversations where candidateId === userId
    // Recruiter sees conversations where companyId in companyIds or recruiterId === userId
    const filter: any = {
      $or: [
        { candidateId: userId },
        ...(companyIds.length > 0 ? [{ companyId: { $in: companyIds } }] : []),
        { recruiterId: userId },
      ],
      status: { $ne: "archived" },
    };

    const [conversations, total] = await Promise.all([
      ConversationModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("jobId", "title department location workMode companyName")
        .populate("companyId", "name slug logoUrl industry")
        .populate("applicationId", "status appliedAt interviewSchedule")
        .lean(),
      ConversationModel.countDocuments(filter),
    ]);

    // Hydrate candidate details for recruiter view
    const candidateIds = [...new Set(conversations.map((c: any) => c.candidateId))];
    const candidateObjectIds = candidateIds
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
        .find({ _id: { $in: candidateObjectIds as any[] } }, { projection: { name: 1, email: 1 } })
        .toArray(),
      ProfileModel.find({ userId: { $in: candidateIds } })
        .select("userId name headline profileCompleteness targetRole")
        .lean(),
    ]);

    const userMap = new Map(users.map((u: any) => [u._id ? u._id.toString() : "", u]));
    const profileMap = new Map(profiles.map((p: any) => [p.userId, p]));

    const items = conversations.map((conv: any) => {
      const u = userMap.get(conv.candidateId);
      const p = profileMap.get(conv.candidateId) as any;
      const candidateName =
        u?.name || (u?.email ? u.email.split("@")[0].replace(/[._]/g, " ") : "Candidate");

      const isCandidate = conv.candidateId === userId;

      return {
        id: conv._id.toString(),
        applicationId: conv.applicationId?._id?.toString() || conv.applicationId,
        applicationStatus: conv.applicationId?.status || "applied",
        interviewSchedule: conv.applicationId?.interviewSchedule || null,
        job: {
          id: conv.jobId?._id?.toString() || conv.jobId,
          title: conv.jobId?.title || "Job Position",
          companyName: conv.companyId?.name || conv.jobId?.companyName || "Company",
        },
        company: {
          id: conv.companyId?._id?.toString() || conv.companyId,
          name: conv.companyId?.name || "Company",
          slug: conv.companyId?.slug,
          logoUrl: conv.companyId?.logoUrl,
        },
        candidate: {
          id: conv.candidateId,
          name: candidateName,
          email: u?.email,
          headline: p?.headline || p?.targetRole || undefined,
          score: p?.profileCompleteness?.score || 85,
        },
        lastMessage: conv.lastMessage,
        unreadCount: isCandidate ? conv.unreadCountCandidate : conv.unreadCountRecruiter,
        updatedAt: conv.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get messages inside a conversation with security check
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    query: GetMessagesQueryDTO
  ): Promise<{
    conversation: any;
    messages: IMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const conversation = await ConversationModel.findById(conversationId)
      .populate("jobId", "title department location companyName")
      .populate("companyId", "name slug logoUrl industry")
      .populate("applicationId", "status appliedAt interviewSchedule")
      .lean();

    if (!conversation) {
      throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    // Security check: must be the candidate or an authorized recruiter of the company
    const isCandidate = (conversation as any).candidateId === userId;
    const isRecruiter =
      (conversation as any).recruiterId === userId ||
      (await this.isCompanyRecruiter(userId, (conversation as any).companyId._id || (conversation as any).companyId));

    if (!isCandidate && !isRecruiter) {
      throw new AppError("Unauthorized access to this conversation", HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      MessageModel.find({ conversationId: new Types.ObjectId(conversationId) })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments({ conversationId: new Types.ObjectId(conversationId) }),
    ]);

    // Automatically mark as read for the requesting party
    if (isCandidate && (conversation as any).unreadCountCandidate > 0) {
      await ConversationModel.updateOne({ _id: conversation._id }, { $set: { unreadCountCandidate: 0 } });
    } else if (isRecruiter && (conversation as any).unreadCountRecruiter > 0) {
      await ConversationModel.updateOne({ _id: conversation._id }, { $set: { unreadCountRecruiter: 0 } });
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      conversation: {
        id: (conversation as any)._id.toString(),
        applicationId: (conversation as any).applicationId?._id?.toString(),
        applicationStatus: (conversation as any).applicationId?.status,
        interviewSchedule: (conversation as any).applicationId?.interviewSchedule,
        job: (conversation as any).jobId,
        company: (conversation as any).companyId,
        candidateId: (conversation as any).candidateId,
        recruiterId: (conversation as any).recruiterId,
        isCandidate,
      },
      messages: messages as any[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDTO
  ): Promise<IMessage> {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const isCandidate = conversation.candidateId === senderId;
    const isRecruiter =
      conversation.recruiterId === senderId ||
      (await this.isCompanyRecruiter(senderId, conversation.companyId));

    if (!isCandidate && !isRecruiter) {
      throw new AppError("Unauthorized to send message in this conversation", HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
    }

    const senderRole = isCandidate ? "candidate" : "recruiter";

    const message = await MessageModel.create({
      conversationId: conversation._id,
      senderId,
      senderRole,
      type: dto.type || "text",
      content: dto.content,
      interviewDetails: dto.interviewDetails
        ? {
            ...dto.interviewDetails,
            scheduledAt: new Date(dto.interviewDetails.scheduledAt),
          }
        : null,
      readBy: [senderId],
    });

    conversation.lastMessage = {
      content: dto.content,
      senderId,
      senderRole,
      sentAt: message.createdAt,
    };

    if (isCandidate) {
      conversation.unreadCountRecruiter += 1;
    } else {
      conversation.unreadCountCandidate += 1;
    }

    await conversation.save();

    return message;
  }

  /**
   * Schedule interview directly from ATS Review Drawer or Chat
   */
  async scheduleInterview(
    applicationId: string,
    recruiterUserId: string,
    dto: ScheduleInterviewDTO
  ): Promise<{ application: any; message: IMessage }> {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError("Application not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const job = await JobModel.findById(application.jobId);
    if (!job) {
      throw new AppError("Associated Job not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const interviewDetails = {
      roundTitle: dto.roundTitle,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes || 45,
      timezone: dto.timezone || "Asia/Kolkata (IST)",
      meetingPlatform: dto.meetingPlatform || "google_meet",
      meetingLink: dto.meetingLink,
      interviewerName: dto.interviewerName,
      instructions: dto.instructions || "",
      status: "scheduled" as const,
    };

    // Update Application
    application.status = ApplicationStatus.INTERVIEW;
    application.interviewSchedule = interviewDetails;
    application.statusHistory.push({
      status: ApplicationStatus.INTERVIEW,
      changedAt: new Date(),
      changedBy: recruiterUserId,
      reason: `Interview scheduled: ${dto.roundTitle} on ${interviewDetails.scheduledAt.toLocaleDateString()}`,
    } as any);

    await application.save();

    // Ensure conversation exists
    const { conversation } = await this.getOrCreateConversation(applicationId, recruiterUserId);

    // Create rich interview invite message in the conversation
    const inviteContent =
      dto.message ||
      `🎉 You've been invited to an interview for ${job.title}! Please join on ${interviewDetails.scheduledAt.toLocaleString(
        "en-IN"
      )} via ${dto.meetingPlatform.replace("_", " ").toUpperCase()}.`;

    const message = await MessageModel.create({
      conversationId: conversation._id,
      senderId: recruiterUserId,
      senderRole: "recruiter",
      type: "interview_invite",
      content: inviteContent,
      interviewDetails,
      readBy: [recruiterUserId],
    });

    conversation.lastMessage = {
      content: `📅 Interview Scheduled: ${dto.roundTitle}`,
      senderId: recruiterUserId,
      senderRole: "recruiter",
      sentAt: message.createdAt,
    };
    conversation.unreadCountCandidate += 1;
    await conversation.save();

    // Notify Candidate
    notificationService
      .notifyApplicationStatusChange({
        candidateUserId: application.userId,
        jobTitle: job.title,
        companyName: job.companyName || "Hiring Team",
        newStatus: "interview",
        applicationId: application._id.toString(),
      })
      .catch((err) => {
        console.error("[MessagesService] Failed to notify candidate of interview schedule:", err);
      });

    return { application, message };
  }
}

export const messagesService = new MessagesService();
