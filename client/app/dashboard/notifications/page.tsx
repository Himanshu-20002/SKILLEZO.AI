'use client';

import React, { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { NotificationSearch } from '@/components/dashboard/notifications/NotificationSearch';
import { NotificationFilter } from '@/components/dashboard/notifications/NotificationFilter';
import { NotificationList } from '@/components/dashboard/notifications/NotificationList';
import { mockNotifications } from '@/mock/notifications';
import { NotificationItem } from '@/types/notification';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredItems = items.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'read' ? n.read : !n.read);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    );
  };

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notification Center"
          description="Stay updated with live skill verification reports, AI assessment invites, and security logs."
          badge={unreadCount > 0 ? `${unreadCount} Unread` : 'Up to Date'}
          actions={
            unreadCount > 0 ? (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />
                <span>Mark All as Read</span>
              </button>
            ) : undefined
          }
        />

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-md">
          <div className="flex-1 max-w-md">
            <NotificationSearch value={search} onChange={setSearch} />
          </div>

          <NotificationFilter
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>

        {/* Notifications Feed */}
        <NotificationList notifications={filteredItems} onToggleRead={handleToggleRead} />
      </div>
    </DashboardLayout>
  );
}
