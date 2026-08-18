'use client';

import React from 'react';
import { Award, CheckCircle2, User, ShieldCheck, Activity } from 'lucide-react';
import { mockActivityTimeline } from '@/mock/dashboard';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

const activityIconMap: Record<string, React.ReactNode> = {
  Award: <Award className="w-4 h-4 text-[#3D5AFE]" />,
  CheckCircle2: <CheckCircle2 className="w-4 h-4 text-[#00D9C0]" />,
  User: <User className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
};

export const ActivityTimeline: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-md">
      <CardHeader
        title="Recent Activity"
        subtitle="Live audit trail & verification updates"
        icon={<Activity className="w-5 h-5 text-[#3D5AFE]" />}
      />

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {mockActivityTimeline.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4 group">
            {/* Timeline Bullet Badge */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#0B1130] border-2 border-slate-300 dark:border-slate-700 group-hover:border-[#3D5AFE] flex items-center justify-center transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3D5AFE]" />
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-2xl group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {activityIconMap[item.iconName]}
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
