'use client';

import React from 'react';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { AIResumeRecommendation } from '@/types/resume';
import { toast } from 'sonner';

interface AIRecommendationsProps {
  recommendations: AIResumeRecommendation[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Optimization Recommendations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Prioritized steps to increase your ATS match score</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{rec.title}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{rec.impactScoreBoost}% ATS Score</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rec.description}</p>
            </div>

            <button
              onClick={() => toast.success(`Applied: ${rec.title}`)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              <span>{rec.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
