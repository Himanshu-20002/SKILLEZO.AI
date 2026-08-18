'use client';

import React from 'react';
import { Target, TrendingUp, ArrowRight } from 'lucide-react';
import { EmployabilityIndexData } from '@/types/career-intelligence';
import { toast } from 'sonner';

interface ActionListProps {
  actions: EmployabilityIndexData['actionList'];
}

export const ActionList: React.FC<ActionListProps> = ({ actions }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Prioritized Action List</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">High-impact tasks to reach Top 5% hiring readiness</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((act, idx) => (
          <div
            key={act.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 gap-4 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">{act.action}</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Estimated Impact: {act.estimatedImpact}
                </span>
              </div>
            </div>

            <button
              onClick={() => toast.success(`Started: ${act.action}`)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold cursor-pointer shrink-0 transition-colors"
            >
              <span>Execute Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
