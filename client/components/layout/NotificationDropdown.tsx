'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Award, Cpu, ShieldAlert, Info, ArrowRight, Check } from 'lucide-react';
import { mockNotifications } from '@/mock/notifications';
import { NotificationItem } from '@/types/notification';

const iconCategoryMap: Record<string, React.ReactNode> = {
  verification: <Award className="w-4 h-4 text-[#3D5AFE]" />,
  assessment: <Cpu className="w-4 h-4 text-[#00D9C0]" />,
  security: <ShieldAlert className="w-4 h-4 text-amber-500" />,
  system: <Info className="w-4 h-4 text-indigo-500" />
};

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        title="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[#00D9C0] text-[9px] font-bold text-[#0B1130] ring-2 ring-white dark:ring-[#0B1130]">
            {unreadCount}
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
              {unreadCount > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30">
                {unreadCount} New
              </span>
            )}
          </div>

          {/* Notification Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                  !notification.read ? 'bg-slate-50/80 dark:bg-slate-900/80' : 'opacity-75'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shrink-0 mt-0.5">
                  {iconCategoryMap[notification.category] || <Info className="w-4 h-4 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{notification.title}</span>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D9C0] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{notification.message}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{notification.timestamp}</span>
                </div>

                <button
                  onClick={() => handleToggleRead(notification.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  title={notification.read ? 'Mark as unread' : 'Mark as read'}
                >
                  <Check className={`w-3.5 h-3.5 ${notification.read ? 'text-emerald-500' : ''}`} />
                </button>
              </div>
            ))}
          </div>

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
