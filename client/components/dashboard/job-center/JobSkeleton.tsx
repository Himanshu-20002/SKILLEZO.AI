'use client';

import React from 'react';

export const JobSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2">
                <div className="w-48 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="w-32 h-3 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="w-full h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
};
