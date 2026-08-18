'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CareerGPSData } from '@/types/career-intelligence';
import { toast } from 'sonner';

interface CurrentMilestoneWidgetProps {
  milestone: CareerGPSData['currentMilestone'];
}

export const CurrentMilestoneWidget: React.FC<CurrentMilestoneWidgetProps> = ({ milestone }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Current Milestone Focus</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Highest-priority task to unlock next stage</p>
          </div>
        </div>

        <span className="text-lg font-extrabold text-[#3D5AFE] dark:text-[#00D9C0]">
          {milestone.progressPercentage}% Completed
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{milestone.focusTitle}</h3>

        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] rounded-full"
            style={{ width: `${milestone.progressPercentage}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Next Immediate Action: <strong>{milestone.nextAction}</strong>
          </span>

          <button
            onClick={() => toast.success(`Executing milestone: ${milestone.nextAction}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold text-xs cursor-pointer transition-colors"
          >
            <span>Execute Milestone</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
