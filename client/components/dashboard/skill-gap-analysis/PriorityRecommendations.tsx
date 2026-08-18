'use client';

import React from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface PriorityRecommendationItem {
  skill: string;
  currentLevel: string;
  requiredLevel: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  suggestedAction: string;
}

interface PriorityRecommendationsProps {
  recommendations: PriorityRecommendationItem[];
}

export const PriorityRecommendations: React.FC<PriorityRecommendationsProps> = ({
  recommendations,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Priority Learning Recommendations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Actionable steps to close high-priority skill gaps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-3 text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rec.skill}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rec.priority === 'High'
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : rec.priority === 'Medium'
                      ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Current: <strong className="text-slate-700 dark:text-slate-300">{rec.currentLevel}</strong></span>
                <span>→</span>
                <span>Target: <strong className="text-[#3D5AFE] dark:text-[#00D9C0]">{rec.requiredLevel}</strong></span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">{rec.reason}</p>
            </div>

            <button
              onClick={() => toast.success(`Added ${rec.skill} action to Learning Hub roadmap`)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <span>{rec.suggestedAction}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
