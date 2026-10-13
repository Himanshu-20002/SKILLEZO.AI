import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "@/modules/notifications/notification.service";
import { NotificationRepository } from "@/database/repositories/notification/NotificationRepository";
import { NotificationCategory, NotificationPriority } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockNotificationRepo: Partial<NotificationRepository>;

  beforeEach(() => {
    mockNotificationRepo = {
      findByUserId: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      getRecentJobAlertsCount: vi.fn(),
    };
    notificationService = new NotificationService(mockNotificationRepo as NotificationRepository);
  });

  describe("getUserNotifications", () => {
    it("should return paginated user notifications with calculated totalPages", async () => {
      const mockResult = {
        notifications: [
          {
            _id: "notif-1",
            userId: "user-123",
            title: "Application Shortlisted",
            message: "You have been shortlisted!",
            category: NotificationCategory.APPLICATION,
            read: false,
          },
        ] as any,
        total: 15,
        unreadCount: 3,
      };

      (mockNotificationRepo.findByUserId as any).mockResolvedValue(mockResult);

      const response = await notificationService.getUserNotifications("user-123", {
        page: 1,
        limit: 10,
      });

      expect(response.notifications).toHaveLength(1);
      expect(response.total).toBe(15);
      expect(response.unreadCount).toBe(3);
      expect(response.totalPages).toBe(2);
      expect(response.page).toBe(1);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count for user", async () => {
      (mockNotificationRepo.getUnreadCount as any).mockResolvedValue(4);

      const response = await notificationService.getUnreadCount("user-123");

      expect(response.unreadCount).toBe(4);
      expect(mockNotificationRepo.getUnreadCount).toHaveBeenCalledWith("user-123");
    });
  });

  describe("markAsRead", () => {
    it("should mark a single notification as read", async () => {
      const updatedNotif = {
        _id: "notif-1",
        userId: "user-123",
        read: true,
        readAt: new Date(),
      } as any;

      (mockNotificationRepo.markAsRead as any).mockResolvedValue(updatedNotif);

      const response = await notificationService.markAsRead("notif-1", "user-123");

      expect(response.read).toBe(true);
      expect(mockNotificationRepo.markAsRead).toHaveBeenCalledWith("notif-1", "user-123");
    });

    it("should throw 404 AppError if notification does not exist or access denied", async () => {
      (mockNotificationRepo.markAsRead as any).mockResolvedValue(null);

      await expect(
        notificationService.markAsRead("invalid-id", "user-123")
      ).rejects.toThrow(AppError);
    });
  });

  describe("markAllAsRead", () => {
    it("should update all unread notifications to read", async () => {
      (mockNotificationRepo.markAllAsRead as any).mockResolvedValue(5);

      const response = await notificationService.markAllAsRead("user-123");

      expect(response.updatedCount).toBe(5);
      expect(mockNotificationRepo.markAllAsRead).toHaveBeenCalledWith("user-123");
    });
  });

  describe("notifyApplicationStatusChange", () => {
    it("should create an in-app notification when application status changes", async () => {
      const mockCreated = {
        _id: "notif-status-1",
        userId: "cand-1",
        category: NotificationCategory.APPLICATION,
        priority: NotificationPriority.HIGH,
        title: "Application Status: SHORTLISTED",
        read: false,
      } as any;

      (mockNotificationRepo.create as any).mockResolvedValue(mockCreated);

      const result = await notificationService.notifyApplicationStatusChange({
        candidateUserId: "cand-1",
        jobTitle: "Fullstack Engineer",
        companyName: "Acme Corp",
        newStatus: "shortlisted",
        applicationId: "app-123",
        candidateEmail: "candidate@example.com",
        candidateName: "Jane Doe",
      });

      expect(result).toBeDefined();
      expect(mockNotificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "cand-1",
          category: NotificationCategory.APPLICATION,
          actionUrl: "/dashboard/applications",
        })
      );
    });
  });
});
