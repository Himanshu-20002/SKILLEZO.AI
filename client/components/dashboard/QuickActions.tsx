'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Cpu, UserCheck, Settings, ArrowUpRight } from 'lucide-react';
import { mockQuickActions } from '@/mock/dashboard';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

const actionIcons: Record<string, React.ReactNode> = {
  CheckSquare: <CheckSquare className="w-5 h-5 text-[#3D5AFE]" />,
  Cpu: <Cpu className="w-5 h-5 text-[#00D9C0]" />,
  UserCheck: <UserCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  Settings: <Settings className="w-5 h-5 text-amber-500 dark:text-amber-400" />
};

export const QuickActions: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-md">
      <CardHeader title="Quick Actions" subtitle="Accelerate your career verification flow" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockQuickActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-[#3D5AFE]/50 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all duration-200 group"
          >
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
              {actionIcons[action.iconName] || <CheckSquare className="w-5 h-5 text-[#3D5AFE]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3D5AFE] transition-colors truncate">
                  {action.label}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
