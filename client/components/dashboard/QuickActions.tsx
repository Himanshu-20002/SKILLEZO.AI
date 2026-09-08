'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, Compass, Briefcase, Target, ArrowUpRight, Zap } from 'lucide-react';
import { mockQuickActions } from '@/mock/dashboard';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface ActionMetadata {
  icon: React.ReactNode;
  badgeColor: string;
  iconBg: string;
  hoverBorder: string;
}

const actionMetadataMap: Record<string, ActionMetadata> = {
  'qa-1': {
    icon: <BarChart3 className="w-5 h-5 text-[#3D5AFE] dark:text-indigo-400" />,
    badgeColor: 'bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-indigo-300 border-[#3D5AFE]/20',
    iconBg: 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20',
    hoverBorder: 'hover:border-[#3D5AFE]/50 dark:hover:border-[#3D5AFE]/40'
  },
  'qa-2': {
    icon: <Compass className="w-5 h-5 text-[#00897B] dark:text-[#00D9C0]" />,
    badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    iconBg: 'bg-[#00D9C0]/15 dark:bg-[#00D9C0]/20',
    hoverBorder: 'hover:border-[#00D9C0]/50 dark:hover:border-[#00D9C0]/40'
  },
  'qa-3': {
    icon: <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/40'
  },
  'qa-4': {
    icon: <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50 dark:hover:border-purple-500/40'
  }
};

export const QuickActions: React.FC = () => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      <div>
        <CardHeader
          title="Career Acceleration Hub"
          subtitle="Direct access to AI career intelligence & job portals"
          icon={<Zap className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
          {mockQuickActions.map((action) => {
            const meta = actionMetadataMap[action.id] || actionMetadataMap['qa-1'];
            return (
              <Link
                key={action.id}
                href={action.href}
                className={`relative group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] ${meta.hoverBorder} hover:bg-white dark:hover:bg-white/[0.06] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`p-2.5 rounded-xl ${meta.iconBg} border border-black/[0.04] dark:border-white/[0.08] group-hover:scale-110 transition-transform duration-300`}>
                      {meta.icon}
                    </div>

                    <div className="flex items-center gap-2">
                      {action.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                          {action.badge}
                        </span>
                      )}
                      <div className="p-1 rounded-lg bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-white/[0.1] transition-colors">
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#3D5AFE] dark:group-hover:text-[#00D9C0] transition-colors">
                    {action.label}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};


