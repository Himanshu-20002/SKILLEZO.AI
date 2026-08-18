'use client';

import React from 'react';
import { Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { EmployabilityIndexData } from '@/types/career-intelligence';

interface EmployabilityGaugeProps {
  data: EmployabilityIndexData;
}

export const EmployabilityGauge: React.FC<EmployabilityGaugeProps> = ({ data }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#3D5AFE]/10 via-slate-900/5 to-[#00D9C0]/10 dark:from-slate-900/80 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Employability Index</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Consolidated career-readiness & recruiter benchmark</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>{data.tierStatus} Candidate</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score Ring */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-center space-y-2 backdrop-blur-md">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0]">
            {data.overallScore}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Out of 100 Points</span>
        </div>

        {/* Tier Progress Indicator */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Tier: <strong className="text-[#3D5AFE] dark:text-[#00D9C0]">{data.tierStatus}</strong>
            </span>
            <span className="font-semibold text-slate-500">
              Target Tier: <strong className="text-emerald-500">{data.targetTier}</strong>
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3D5AFE] via-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${data.overallScore}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Complete 2 high-impact actions below to enter the {data.targetTier} candidate pool.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
