'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Cpu, ShieldAlert, Info, ArrowRight, Check } from 'lucide-react';
import { NotificationItem } from '@/types/notification';

interface NotificationCardProps {
  notification: NotificationItem;
  onToggleRead: (id: string) => void;
}

const iconCategoryMap: Record<string, React.ReactNode> = {
  verification: <Award className="w-5 h-5 text-[#3D5AFE]" />,
  assessment: <Cpu className="w-5 h-5 text-[#00D9C0]" />,
  security: <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  system: <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onToggleRead
}) => {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 backdrop-blur-md flex items-start gap-4 ${
        !notification.read
          ? 'bg-white dark:bg-slate-900/80 border-[#3D5AFE]/40 shadow-sm dark:shadow-md shadow-[#3D5AFE]/5'
          : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-80'
      }`}
    >
      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shrink-0">
        {iconCategoryMap[notification.category] || <Info className="w-5 h-5 text-slate-400" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{notification.title}</h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#00D9C0] shrink-0" title="Unread notification" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">{notification.timestamp}</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notification.message}</p>

        {notification.actionUrl && notification.actionLabel && (
          <div className="pt-2">
            <Link
              href={notification.actionUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D5AFE] hover:text-[#00D9C0] transition-colors"
            >
              <span>{notification.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      <button
        onClick={() => onToggleRead(notification.id)}
        className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        title={notification.read ? 'Mark as unread' : 'Mark as read'}
      >
        <Check className={`w-4 h-4 ${notification.read ? 'text-emerald-500' : ''}`} />
      </button>
    </div>
  );
};
