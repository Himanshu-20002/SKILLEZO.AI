'use client';

import React from 'react';
import { StructuredMetricItem } from '@/services/coach.service';
import { TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';

interface MetricsSummaryViewProps {
  metrics: StructuredMetricItem[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export const MetricsSummaryView: React.FC<MetricsSummaryViewProps> = ({
  metrics,
  onSelectEvidence,
}) => {
  if (metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <TrendingUp className="w-10 h-10 opacity-30 mb-2 stroke-1" />
        <p className="text-xs font-medium">No verified metrics recorded yet</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
          Ask the AI Coach to analyze your resume, skill gaps, or employability to compute deterministic scores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Deterministic Scores ({metrics.length})
        </span>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Truth
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {metrics.map((item, idx) => {
          // Normalize score to percentage if <= 100
          const percentage = Math.min(100, Math.max(0, item.value));
          const isHigh = percentage >= 75;
          const isMedium = percentage >= 50 && percentage < 75;

          const colorClass = isHigh
            ? 'text-emerald-600 dark:text-emerald-400 from-emerald-500 to-teal-500'
            : isMedium
            ? 'text-indigo-600 dark:text-indigo-400 from-indigo-500 to-purple-500'
            : 'text-amber-600 dark:text-amber-400 from-amber-500 to-orange-500';

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
                <span className={`text-base font-bold font-mono ${colorClass.split(' ')[0]}`}>
                  {item.value}
                  <span className="text-[10px] text-slate-400 font-normal">/100</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorClass.split(' ')[2]} ${colorClass.split(' ')[3]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Evidence Provenance Footer */}
              {item.evidenceId && (
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Backed by evidence:
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectEvidence?.(item.evidenceId)}
                    className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {item.evidenceId}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
