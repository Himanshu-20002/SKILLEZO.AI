'use client';

import React from 'react';
import { Target, Award, CheckCircle2, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { mockDashboardSummary } from '@/mock/dashboard';

export const DashboardSummary: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Target Role Card */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] backdrop-blur-md group hover:border-[#3D5AFE]/40 dark:hover:border-[#3D5AFE]/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3D5AFE]/5 dark:bg-[#3D5AFE]/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#3D5AFE]/15 to-[#3D5AFE]/5 dark:from-[#3D5AFE]/25 dark:to-[#3D5AFE]/10 text-[#3D5AFE] dark:text-indigo-400 border border-[#3D5AFE]/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Target Role Match</p>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-indigo-300">
                Primary
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
              Senior Full-Stack
            </p>
          </div>
        </div>
      </div>

      {/* Total Credentials Card */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] backdrop-blur-md group hover:border-[#00D9C0]/40 dark:hover:border-[#00D9C0]/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D9C0]/5 dark:bg-[#00D9C0]/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00D9C0]/20 to-[#00D9C0]/5 dark:from-[#00D9C0]/25 dark:to-[#00D9C0]/10 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Total Credentials</p>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300">
                +2 New
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
              {mockDashboardSummary.passedAssessmentsCount} Badges Earned
            </p>
          </div>
        </div>
      </div>

      {/* Verification Rate Card */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] backdrop-blur-md group hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/25 dark:to-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Verification Rate</p>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Top Tier
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
              94.2% Pass Rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

