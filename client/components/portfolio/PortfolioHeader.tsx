'use client';

import React from 'react';
import { Plus, Sparkles, FolderGit2 } from 'lucide-react';

interface PortfolioHeaderProps {
  onCreateClick: () => void;
  variantCount: number;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  onCreateClick,
  variantCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resume Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your canonical Master Resume and targeted role variants ({variantCount + 1} total).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Variant</span>
        </button>
      </div>
    </div>
  );
};
