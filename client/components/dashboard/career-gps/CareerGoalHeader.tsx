'use client';

import React from 'react';
import { Compass, Target, DollarSign, Calendar } from 'lucide-react';
import { CareerGPSData } from '@/types/career-intelligence';

interface CareerGoalHeaderProps {
  data: CareerGPSData;
}

export const CareerGoalHeader: React.FC<CareerGoalHeaderProps> = ({ data }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#3D5AFE]/10 via-slate-900/5 to-[#00D9C0]/10 dark:from-slate-900/80 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0]">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Career GPS Goal & Horizon</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Target role progression & salary trajectory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1 backdrop-blur-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#3D5AFE]" />
            Target Role
          </span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{data.targetRole}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1 backdrop-blur-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Target Salary
          </span>
          <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{data.targetSalary}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1 backdrop-blur-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
            Target Timeline
          </span>
          <p className="font-extrabold text-cyan-600 dark:text-cyan-400 text-base">{data.targetTimeline}</p>
        </div>
      </div>
    </div>
  );
};
