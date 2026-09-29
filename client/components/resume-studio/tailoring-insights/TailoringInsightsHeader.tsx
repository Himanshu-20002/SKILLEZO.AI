'use client';

import React from 'react';
import { Target, Sparkles, Briefcase, GitCompare } from 'lucide-react';
import { ResumeVariantBadge } from '../ResumeVariantBadge';

export interface TailoringInsightsHeaderProps {
  targetRole: string;
  targetCompany: string;
  totalChanges: number;
  onOpenComparison?: () => void;
  className?: string;
}

export const TailoringInsightsHeader: React.FC<TailoringInsightsHeaderProps> = ({
  targetRole,
  targetCompany,
  totalChanges,
  onOpenComparison,
  className = '',
}) => {
  return (
    <div
      role="banner"
      aria-label="Tailoring Insights Header"
      className={`rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <ResumeVariantBadge variantType="TAILORED" compact />
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
            STRATEGIC ALIGNMENT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3 h-3 text-indigo-500" aria-hidden="true" />
            <span>{totalChanges} AST Changes Applied</span>
          </div>

          {onOpenComparison && (
            <button
              type="button"
              data-testid="insights-compare-with-master-btn"
              onClick={onOpenComparison}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer shadow-xs"
              title="Compare with Master Resume"
            >
              <GitCompare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Compare with Master</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
          <span>{targetRole}</span>
        </h3>
        {targetCompany && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            at {targetCompany}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
        This tailored variant was generated to maximize candidate relevance against the target job description. Review every applied change, approved rationale, and verified career evidence below.
      </p>
    </div>
  );
};
