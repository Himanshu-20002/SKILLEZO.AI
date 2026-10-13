'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCheck, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { NotificationSearch } from '@/components/dashboard/notifications/NotificationSearch';
import { NotificationFilter } from '@/components/dashboard/notifications/NotificationFilter';
import { NotificationList } from '@/components/dashboard/notifications/NotificationList';
import { NotificationItem } from '@/types/notification';
import { notificationService } from '@/services/notification.service';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchNotifications = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) setIsRefreshing(true);
    try {
      const data = await notificationService.getNotifications({ limit: 50 });
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredItems = items.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'read' ? n.read : !n.read);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleRead = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    // Optimistic update
    const nextRead = !target.read;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: nextRead } : item))
    );
    setUnreadCount((prev) => (nextRead ? Math.max(0, prev - 1) : prev + 1));

    if (nextRead) {
      try {
        await notificationService.markAsRead(id);
      } catch {
        // Rollback on failure
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, read: !nextRead } : item))
        );
        setUnreadCount((prev) => prev + 1);
        toast.error('Failed to mark notification as read');
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notification Center"
          description="Stay updated with new job matches, recruiter application statuses, and system announcements."
          badge={unreadCount > 0 ? `${unreadCount} Unread` : 'Up to Date'}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00D9C0]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00D9C0]/10 border border-[#00D9C0]/30 text-[#00897B] dark:text-[#00D9C0] hover:bg-[#00D9C0]/20 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All as Read</span>
                </button>
              )}
            </div>
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
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-[#00D9C0] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading notification center...</p>
          </div>
        ) : (
          <NotificationList notifications={filteredItems} onToggleRead={handleToggleRead} />
        )}
      </div>
    </DashboardLayout>
  );
}
