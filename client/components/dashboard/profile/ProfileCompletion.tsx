'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface ProfileCompletionProps {
  percentage: number;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ percentage }) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md space-y-4">
      <CardHeader title="Profile Completion" subtitle="Complete steps to unlock enterprise recruiter visibility" />

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-300">Readiness Score</span>
          <span className="text-[#00D9C0] font-bold text-sm">{percentage}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Basic information & avatar verified</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Core skills & certifications attached</span>
        </div>
        <div className="flex items-center gap-2 text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Add 2 additional project GitHub repository URLs (+8%)</span>
        </div>
      </div>
    </div>
  );
};
