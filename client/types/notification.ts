export type NotificationCategory = 'verification' | 'assessment' | 'system' | 'security';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}
