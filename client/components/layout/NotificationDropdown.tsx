'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Award, Cpu, ShieldAlert, Info, ArrowRight, Check, Briefcase, FileText, CheckCheck } from 'lucide-react';
import { NotificationItem } from '@/types/notification';
import { notificationService } from '@/services/notification.service';
import { toast } from 'sonner';

const iconCategoryMap: Record<string, React.ReactNode> = {
  job_alert: <Briefcase className="w-4 h-4 text-emerald-500" />,
  application: <FileText className="w-4 h-4 text-[#3D5AFE]" />,
  verification: <Award className="w-4 h-4 text-[#3D5AFE]" />,
  assessment: <Cpu className="w-4 h-4 text-[#00D9C0]" />,
  security: <ShieldAlert className="w-4 h-4 text-amber-500" />,
  system: <Info className="w-4 h-4 text-indigo-500" />,
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count for the bell badge (pauses when tab is hidden to save battery & network)
  const refreshUnreadCount = useCallback(async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch {
      // Gracefully ignore if unauthenticated or network drop
    }
  }, []);

  // Fetch latest notifications when dropdown opens
  const fetchRecentNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 5 });
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Gracefully handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and periodic heartbeat polling (every 60s, pauses on hidden tabs, resumes on focus/visibility)
  useEffect(() => {
    refreshUnreadCount();

    const interval = setInterval(refreshUnreadCount, 60000);
    const handleSync = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        refreshUnreadCount();
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [refreshUnreadCount]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger dropdown open
  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchRecentNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={handleToggleOpen}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        title="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-[#00D9C0] text-[9px] font-bold text-[#0B1130] ring-2 ring-white dark:ring-[#0B1130] animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0F172A]/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
              ) : (
                <p className="text-[11px] text-slate-400">All caught up</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30 hover:bg-[#00D9C0]/25 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notification Items */}
          {isLoading ? (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-5 h-5 border-2 border-[#00D9C0] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-slate-400">Loading notifications...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 mb-2.5">
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No notifications yet</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mt-0.5">
                You&apos;re all caught up with your latest job alerts and application updates.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-slate-50/80 dark:bg-slate-900/80' : 'opacity-75'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shrink-0 mt-0.5">
                    {iconCategoryMap[notification.category] || <Info className="w-4 h-4 text-slate-400" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D9C0] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatRelativeTime(notification.createdAt || notification.timestamp)}
                    </span>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer - View All */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-[#3D5AFE] dark:text-[#00D9C0] transition-colors"
            >
              <span>View All Notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
