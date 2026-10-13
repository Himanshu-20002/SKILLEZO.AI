import { apiFetch } from "@/lib/api";

export interface InterviewDetails {
  roundTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone?: string;
  meetingPlatform: "google_meet" | "zoom" | "teams" | "phone" | "other";
  meetingLink: string;
  interviewerName: string;
  instructions?: string;
  status: "scheduled" | "completed" | "rescheduled" | "cancelled";
}

export interface ChatMessage {
  _id?: string;
  id?: string;
  conversationId: string;
  senderId: string;
  senderRole: "recruiter" | "candidate" | "system";
  type: "text" | "interview_invite" | "status_change" | "system";
  content: string;
  interviewDetails?: InterviewDetails | null;
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationSummary {
  id: string;
  applicationId: string;
  applicationStatus: string;
  interviewSchedule?: InterviewDetails | null;
  job: {
    id: string;
    title: string;
    companyName: string;
  };
  company: {
    id: string;
    name: string;
    slug?: string;
    logoUrl?: string;
  };
  candidate: {
    id: string;
    name: string;
    email?: string;
    headline?: string;
    score?: number;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    senderRole: "recruiter" | "candidate" | "system";
    sentAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface PaginatedConversations {
  items: ConversationSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConversationThreadResponse {
  conversation: {
    id: string;
    applicationId: string;
    applicationStatus: string;
    interviewSchedule?: InterviewDetails | null;
    job: any;
    company: any;
    candidateId: string;
    recruiterId: string;
    isCandidate: boolean;
  };
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScheduleInterviewPayload {
  roundTitle: string;
  scheduledAt: string;
  durationMinutes?: number;
  timezone?: string;
  meetingPlatform?: "google_meet" | "zoom" | "teams" | "phone" | "other";
  meetingLink: string;
  interviewerName: string;
  instructions?: string;
  message?: string;
}

export const messageService = {
  async getConversations(params?: { page?: number; limit?: number }): Promise<PaginatedConversations> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const res = await apiFetch<{ success: boolean; data: PaginatedConversations }>(
      `/api/messages/conversations${qs ? `?${qs}` : ""}`
    );
    return res.data;
  },

  async getConversationMessages(
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ConversationThreadResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const res = await apiFetch<{ success: boolean; data: ConversationThreadResponse }>(
      `/api/messages/conversations/${conversationId}${qs ? `?${qs}` : ""}`
    );
    return res.data;
  },

  async sendMessage(
    conversationId: string,
    content: string,
    type: "text" | "interview_invite" | "status_change" | "system" = "text",
    interviewDetails?: InterviewDetails
  ): Promise<ChatMessage> {
    const res = await apiFetch<{ success: boolean; data: ChatMessage }>(
      `/api/messages/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content, type, interviewDetails }),
      }
    );
    return res.data;
  },

  async scheduleInterview(
    applicationId: string,
    payload: ScheduleInterviewPayload
  ): Promise<{ application: any; message: ChatMessage }> {
    const res = await apiFetch<{
      success: boolean;
      message: string;
      data: { application: any; message: ChatMessage };
    }>(`/api/messages/applications/${applicationId}/schedule-interview`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
