'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface StrengthsAndGapsProps {
  strengths: string[];
  improvementAreas: string[];
}

export const StrengthsAndGaps: React.FC<StrengthsAndGapsProps> = ({
  strengths,
  improvementAreas,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Key Profile Strengths</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Competitive advantages verified by AI</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {strengths.map((str, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{str}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Improvement Opportunities</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recommended areas to elevate rank</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {improvementAreas.map((area, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
