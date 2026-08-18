'use client';

import React from 'react';
import { CheckCircle2, Clock, Lock, ArrowRight, Route } from 'lucide-react';
import { RoadmapStage } from '@/types/career-intelligence';
import { toast } from 'sonner';

interface RoadmapTimelineProps {
  stages: RoadmapStage[];
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ stages }) => {
  const getStatusBadge = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'Completed':
        return { icon: CheckCircle2, text: 'Completed', style: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
      case 'In Progress':
        return { icon: Clock, text: 'In Progress', style: 'bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/30' };
      case 'Pending':
        return { icon: Clock, text: 'Pending', style: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
      case 'Locked':
      default:
        return { icon: Lock, text: 'Locked', style: 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700' };
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <Route className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">7-Stage Career Path Roadmap</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sequential milestones to achieve target employment</p>
        </div>
      </div>

      {/* Horizontal on Desktop, Vertical on Mobile */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const badge = getStatusBadge(stage.status);
          const Icon = badge.icon;

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                stage.status === 'In Progress'
                  ? 'bg-[#3D5AFE]/5 dark:bg-slate-800/60 border-[#3D5AFE]/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  {stage.stageNumber}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{stage.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.style}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.text}</span>
                    </span>
                    {stage.completionPercentage > 0 && (
                      <span className="text-[11px] font-bold text-[#3D5AFE] dark:text-[#00D9C0]">
                        {stage.completionPercentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{stage.description}</p>
                </div>
              </div>

              <button
                onClick={() => toast.info(`Navigating to ${stage.title}`)}
                disabled={stage.status === 'Locked'}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  stage.status === 'Locked'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white cursor-pointer'
                }`}
              >
                <span>{stage.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
