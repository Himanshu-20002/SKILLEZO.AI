'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const ResumeComparisonEmptyState: React.FC = () => {
  return (
    <div
      data-testid="resume-comparison-empty-state"
      className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
        <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
        No Changes Detected
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        Your tailored variant is currently identical to your Master Resume. As you apply tailoring
        proposals or make adjustments, your exact stored changes and verified career evidence will
        appear here.
      </p>
    </div>
  );
};
