export type NotificationCategory =
  | 'job_alert'
  | 'application'
  | 'verification'
  | 'assessment'
  | 'system'
  | 'security';

export type NotificationPriority = 'normal' | 'high' | 'urgent';

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  read: boolean;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: Record<string, any>;
}
