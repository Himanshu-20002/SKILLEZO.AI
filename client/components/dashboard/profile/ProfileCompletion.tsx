'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface ProfileCompletionProps {
  percentage?: number;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ percentage = 92 }) => {
  const displayScore = Math.max(Math.min(percentage || 92, 100), 0);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white backdrop-blur-xl space-y-5 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-xl relative overflow-hidden transition-all">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D9C0]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Profile Completion</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete steps to unlock enterprise recruiter visibility</p>
      </div>

      {/* Readiness Score Progress Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">Readiness Score</span>
          <span className="text-[#3D5AFE] dark:text-[#00D9C0] font-black text-sm">{displayScore}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3D5AFE] via-[#06B6D4] to-[#00D9C0] transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
            style={{ width: `${displayScore}%` }}
          />
        </div>
      </div>

      {/* Dynamic Actionable Checklist */}
      <div className="space-y-2.5 pt-1 text-xs relative z-10">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Basic information & avatar verified</span>
        </div>
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Core skills & certifications attached</span>
        </div>
        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Add 2 additional project GitHub repository URLs (+8%)</span>
        </div>
      </div>
    </div>
  );
};
