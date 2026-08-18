'use client';

import React from 'react';
import { NotificationItem } from '@/types/notification';
import { NotificationCard } from './NotificationCard';
import { EmptyState } from '@/components/dashboard/common/EmptyState';
import { BellOff } from 'lucide-react';

interface NotificationListProps {
  notifications: NotificationItem[];
  onToggleRead: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onToggleRead
}) => {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No Notifications Found"
        description="All caught up! There are no unread or matched notification alerts."
        icon={<BellOff className="w-7 h-7 text-slate-400" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationCard key={n.id} notification={n} onToggleRead={onToggleRead} />
      ))}
    </div>
  );
};
