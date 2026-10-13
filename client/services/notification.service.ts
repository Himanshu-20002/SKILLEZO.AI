import { apiFetch } from "@/lib/api";

export type NotificationCategory = "job_alert" | "application" | "verification" | "system";
export type NotificationPriority = "normal" | "high" | "urgent";

export interface NotificationItem {
  id: string;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  category?: string;
  unreadOnly?: boolean;
}

export interface PaginatedNotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  targetRole: "all" | "candidate" | "recruiter";
  actionUrl?: string | null;
  actionLabel?: string | null;
  priority?: NotificationPriority;
}

class NotificationService {
  /**
   * Fetch paginated list of notifications for the current authenticated user
   */
  async getNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotificationsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.category && params.category !== "all") searchParams.set("category", params.category);
    if (params.unreadOnly !== undefined) searchParams.set("unreadOnly", String(params.unreadOnly));

    const qs = searchParams.toString();
    const endpoint = `/api/notifications${qs ? `?${qs}` : ""}`;

    const res = await apiFetch<{ success: boolean; data: any }>(endpoint);
    const data = res.data;

    const notifications: NotificationItem[] = (data.notifications || []).map((n: any) => ({
      id: n._id ? n._id.toString() : n.id,
      userId: n.userId,
      category: n.category || "system",
      priority: n.priority || "normal",
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl || null,
      actionLabel: n.actionLabel || null,
      metadata: n.metadata || {},
      read: Boolean(n.read),
      readAt: n.readAt || null,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    return {
      notifications,
      total: data.total || 0,
      unreadCount: data.unreadCount || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: data.totalPages || 1,
    };
  }

  /**
   * Quick unread count query for the navbar bell badge
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const res = await apiFetch<{ success: boolean; data: { unreadCount: number } }>(
      "/api/notifications/unread-count"
    );
    return res.data;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<NotificationItem> {
    const res = await apiFetch<{ success: boolean; data: any }>(
      `/api/notifications/${id}/read`,
      { method: "PATCH" }
    );
    const n = res.data;
    return {
      id: n._id ? n._id.toString() : n.id,
      userId: n.userId,
      category: n.category || "system",
      priority: n.priority || "normal",
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl || null,
      actionLabel: n.actionLabel || null,
      metadata: n.metadata || {},
      read: true,
      readAt: n.readAt || new Date().toISOString(),
      createdAt: n.createdAt,
    };
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const res = await apiFetch<{ success: boolean; data: { updatedCount: number } }>(
      "/api/notifications/read-all",
      { method: "PATCH" }
    );
    return res.data;
  }

  /**
   * Admin broadcast announcement
   */
  async broadcastAnnouncement(payload: BroadcastNotificationPayload): Promise<{ sentCount: number }> {
    const res = await apiFetch<{ success: boolean; data: { sentCount: number } }>(
      "/api/notifications/broadcast",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  }
}

export const notificationService = new NotificationService();
