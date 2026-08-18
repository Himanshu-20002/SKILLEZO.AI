'use client';

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface JobEmptyStateProps {
  onReset: () => void;
}

export const JobEmptyState: React.FC<JobEmptyStateProps> = ({ onReset }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
      <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
        <SearchX className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Jobs Match Your Current Filters</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Try expanding your search query, clearing salary boundaries, or selecting all work modes.
        </p>
      </div>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3D5AFE] text-white text-xs font-semibold hover:bg-[#3D5AFE]/90 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Clear All Filters</span>
      </button>
    </div>
  );
};
