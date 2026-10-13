import { Schema, model, Document } from "mongoose";
import { NotificationCategory, NotificationPriority } from "@/core/constants/enums";

export interface INotification extends Document {
  _id: any;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: Date | null;
  emailSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(NotificationCategory),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    actionLabel: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "notification",
  }
);

// High-speed compound indexes for unread badge queries and user feed
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });

export const NotificationModel = model<INotification>("Notification", notificationSchema);
