import { Request, Response } from "express";
import { NotificationService, notificationService } from "./notification.service";
import {
  GetNotificationsQuerySchema,
  BroadcastNotificationSchema,
} from "./notification.dto";
import { HTTP_STATUS } from "@/core/constants";

export class NotificationController {
  constructor(private readonly service: NotificationService = notificationService) {}

  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const validatedQuery = GetNotificationsQuerySchema.parse(req.query);

    const result = await this.service.getUserNotifications(userId, validatedQuery);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.service.getUnreadCount(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

    const notification = await this.service.markAsRead(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const result = await this.service.markAllAsRead(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
      message: "All notifications marked as read",
    });
  };

  broadcastAnnouncement = async (req: Request, res: Response): Promise<void> => {
    const adminUserId = req.user!.id;
    const validatedBody = BroadcastNotificationSchema.parse(req.body);

    const result = await this.service.broadcastAnnouncement(adminUserId, validatedBody);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: result,
      message: `Announcement broadcasted to ${result.sentCount} recipients`,
    });
  };
}

export const notificationController = new NotificationController();
