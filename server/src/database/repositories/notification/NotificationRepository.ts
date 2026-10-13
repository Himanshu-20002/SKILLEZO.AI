import { BaseRepository } from "../base";
import { NotificationModel, INotification } from "@/database/models/Notification.model";
import { NotificationCategory } from "@/core/constants/enums";

export interface FindUserNotificationsOptions {
  page?: number;
  limit?: number;
  category?: NotificationCategory | string;
  unreadOnly?: boolean;
}

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(NotificationModel, "Notification");
  }

  async findByUserId(
    userId: string,
    options: FindUserNotificationsOptions = {}
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { userId };

    if (options.category && options.category !== "all") {
      filter.category = options.category;
    }

    if (options.unreadOnly) {
      filter.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as Promise<INotification[]>,
      this.model.countDocuments(filter),
      this.model.countDocuments({ userId, read: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.model.countDocuments({ userId, read: false });
  }

  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    return await this.model
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { read: true, readAt: new Date() } },
        { new: true }
      )
      .lean()
      .exec() as INotification | null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.model.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    return result.modifiedCount || 0;
  }

  async createMany(dataList: Partial<INotification>[]): Promise<number> {
    if (!dataList || dataList.length === 0) return 0;
    const inserted = await this.model.insertMany(dataList, { ordered: false });
    return inserted.length;
  }

  async getRecentJobAlertsCount(userId: string, hours = 24): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await this.model.countDocuments({
      userId,
      category: NotificationCategory.JOB_ALERT,
      createdAt: { $gte: since },
    });
  }
}

export const notificationRepository = new NotificationRepository();
