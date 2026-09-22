'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus } from 'lucide-react';

interface PortfolioEmptyStateProps {
  masterId?: string;
  onCreateVariant?: () => void;
  onCreateClick?: () => void;
  hasMaster?: boolean;
}

export const PortfolioEmptyState: React.FC<PortfolioEmptyStateProps> = ({
  masterId,
  onCreateVariant,
  onCreateClick,
}) => {
  const handleCreate = onCreateVariant || onCreateClick;
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
        <Sparkles className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        No Role Variants Created Yet
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
        Your canonical Master Resume is ready. Create targeted resume versions for specific roles (e.g. Frontend, DevOps, or Full-Stack) while keeping your Career Profile as the sole source of truth.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {masterId && (
          <Link
            href={`/dashboard/resume-studio?resumeId=${masterId}`}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            Open Master Resume
          </Link>
        )}
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Resume Variant</span>
        </button>
      </div>
    </div>
  );
};
