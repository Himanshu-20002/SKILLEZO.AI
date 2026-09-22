'use client';

import React from 'react';

export const PortfolioSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="w-36 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="w-64 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="w-32 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Master Card Skeleton */}
      <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800" />

      {/* Variants Section Skeleton */}
      <div className="space-y-4">
        <div className="w-48 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
};
