'use client';

import React from 'react';
import { ShieldCheck, Ban, Info } from 'lucide-react';
import { TailoringInsightItem } from '@/types/tailoring-insights.types';

export interface TailoringNotAddedSectionProps {
  items: TailoringInsightItem[];
  className?: string;
}

export const TailoringNotAddedSection: React.FC<TailoringNotAddedSectionProps> = ({
  items,
  className = '',
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Intentionally Not Added Requirements"
      className={`rounded-xl border border-rose-500/20 bg-rose-500/[0.03] dark:bg-rose-500/[0.05] p-4 ${className}`}
    >
      {/* Header Banner */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Intentionally Not Added ({items.length})</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
              TRUST GUARANTEE
            </span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            SKILLEZO strictly refuses to hallucinate ungrounded qualifications. These requirements were demanded by the job description, but because verified candidate evidence was not found, they were deliberately omitted.
          </p>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2.5 mt-3">
        {items.map(item => (
          <div
            key={item.id}
            className="rounded-lg bg-white dark:bg-slate-900 border border-rose-500/20 p-3 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                <span>{item.requirementName}</span>
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Omitted
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
