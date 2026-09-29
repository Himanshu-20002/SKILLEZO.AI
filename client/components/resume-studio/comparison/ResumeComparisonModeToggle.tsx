'use client';

import React from 'react';
import { Columns, GitCommit } from 'lucide-react';
import { ComparisonViewMode } from '@/types/resume-comparison-view.types';

export interface ResumeComparisonModeToggleProps {
  mode: ComparisonViewMode;
  onChange: (mode: ComparisonViewMode) => void;
}

export const ResumeComparisonModeToggle: React.FC<ResumeComparisonModeToggleProps> = ({
  mode,
  onChange,
}) => {
  return (
    <div
      role="group"
      aria-label="Comparison view mode"
      className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60"
    >
      <button
        type="button"
        data-testid="mode-toggle-side-by-side"
        aria-pressed={mode === 'SIDE_BY_SIDE'}
        onClick={() => onChange('SIDE_BY_SIDE')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          mode === 'SIDE_BY_SIDE'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Columns className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Side by Side</span>
      </button>

      <button
        type="button"
        data-testid="mode-toggle-unified"
        aria-pressed={mode === 'UNIFIED'}
        onClick={() => onChange('UNIFIED')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          mode === 'UNIFIED'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <GitCommit className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Unified Diff</span>
      </button>
    </div>
  );
};
