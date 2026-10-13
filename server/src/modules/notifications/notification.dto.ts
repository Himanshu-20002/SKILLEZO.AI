import { z } from "zod";
import { NotificationCategory, NotificationPriority } from "@/core/constants/enums";

export const GetNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  category: z.string().optional(),
  unreadOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val.toLowerCase() === "true";
      return Boolean(val);
    }),
});

export type GetNotificationsQueryDTO = z.infer<typeof GetNotificationsQuerySchema>;

export const BroadcastNotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  message: z.string().min(5, "Message must be at least 5 characters").max(500),
  targetRole: z.enum(["all", "candidate", "recruiter"]).default("all"),
  actionUrl: z.string().url().or(z.string().startsWith("/")).nullable().optional(),
  actionLabel: z.string().max(40).nullable().optional(),
  priority: z
    .enum([NotificationPriority.NORMAL, NotificationPriority.HIGH, NotificationPriority.URGENT])
    .default(NotificationPriority.NORMAL),
});

export type BroadcastNotificationDTO = z.infer<typeof BroadcastNotificationSchema>;
