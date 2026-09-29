'use client';

import React from 'react';
import { X, Sparkles, ArrowRight, Building2, Briefcase } from 'lucide-react';
import { ComparisonViewMode } from '@/types/resume-comparison-view.types';
import { ResumeComparisonModeToggle } from './ResumeComparisonModeToggle';

export interface ResumeComparisonHeaderProps {
  targetRole?: string | null;
  targetCompany?: string | null;
  totalChanges: number;
  viewMode: ComparisonViewMode;
  onViewModeChange: (mode: ComparisonViewMode) => void;
  onClose: () => void;
}

export const ResumeComparisonHeader: React.FC<ResumeComparisonHeaderProps> = ({
  targetRole,
  targetCompany,
  totalChanges,
  viewMode,
  onViewModeChange,
  onClose,
}) => {
  return (
    <div
      data-testid="resume-comparison-header"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0"
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Master</span>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="text-indigo-600 dark:text-indigo-400">Tailored Resume</span>
          </h2>

          <span
            data-testid="comparison-change-count-badge"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>
              {totalChanges} {totalChanges === 1 ? 'Change' : 'Changes'}
            </span>
          </span>
        </div>

        {(targetRole || targetCompany) && (
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 truncate">
            {targetRole && (
              <span className="flex items-center gap-1 truncate" title={targetRole}>
                <Briefcase className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{targetRole}</span>
              </span>
            )}
            {targetCompany && (
              <span className="flex items-center gap-1 truncate" title={targetCompany}>
                <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{targetCompany}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <ResumeComparisonModeToggle mode={viewMode} onChange={onViewModeChange} />

        <button
          type="button"
          data-testid="comparison-dialog-close-btn"
          onClick={onClose}
          aria-label="Close comparison dialog"
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
