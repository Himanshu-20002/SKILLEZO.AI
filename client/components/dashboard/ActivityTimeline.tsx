'use client';

import React from 'react';
import { Award, CheckCircle2, User, ShieldCheck, Activity, Clock } from 'lucide-react';
import { mockActivityTimeline } from '@/mock/dashboard';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface TimelineMeta {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  tag: string;
  tagColor: string;
}

const timelineMetaMap: Record<string, TimelineMeta> = {
  'act-1': {
    icon: <Award className="w-4 h-4" />,
    iconBg: 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20',
    iconColor: 'text-[#3D5AFE] dark:text-indigo-400',
    tag: 'Score 96%',
    tagColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
  },
  'act-2': {
    icon: <CheckCircle2 className="w-4 h-4" />,
    iconBg: 'bg-[#00D9C0]/15 dark:bg-[#00D9C0]/20',
    iconColor: 'text-[#00897B] dark:text-[#00D9C0]',
    tag: 'Passed',
    tagColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
  },
  'act-3': {
    icon: <User className="w-4 h-4" />,
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    tag: 'Updated',
    tagColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
  },
  'act-4': {
    icon: <ShieldCheck className="w-4 h-4" />,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tag: 'Security',
    tagColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
  }
};

export const ActivityTimeline: React.FC = () => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      <div>
        <CardHeader
          title="Recent Activity"
          subtitle="Live audit trail & verification updates"
          icon={<Activity className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />}
        />

        <div className="space-y-3 mt-2">
          {mockActivityTimeline.map((item, idx) => {
            const meta = timelineMetaMap[item.id] || timelineMetaMap['act-1'];
            const isLast = idx === mockActivityTimeline.length - 1;

            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] hover:bg-white dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Clean Squircle Icon */}
                <div
                  className={`w-10 h-10 rounded-xl ${meta.iconBg} ${meta.iconColor} border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200`}
                >
                  {meta.icon}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#3D5AFE] dark:group-hover:text-[#00D9C0] transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.tagColor}`}
                      >
                        {meta.tag}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.description}
                    </p>
                    <span className="sm:hidden text-[10px] text-slate-400 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


