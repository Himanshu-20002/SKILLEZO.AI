'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';

export interface ResumeTargetJobContextProps {
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  variantType?: 'MASTER' | 'TAILORED';
  className?: string;
}

export const ResumeTargetJobContext: React.FC<ResumeTargetJobContextProps> = ({
  targetJobTitle,
  targetCompany,
  variantType = 'TAILORED',
  className = '',
}) => {
  // Master Resume is job-agnostic and never displays target job context
  if (variantType === 'MASTER') {
    return null;
  }

  const cleanTitle = targetJobTitle?.trim();
  const cleanCompany = targetCompany?.trim();

  let displayText = 'Job-specific variant';
  if (cleanTitle && cleanCompany) {
    displayText = `${cleanTitle} · ${cleanCompany}`;
  } else if (cleanTitle) {
    displayText = cleanTitle;
  }

  return (
    <div
      role="region"
      aria-label={`Target Role: ${displayText}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 max-w-[220px] sm:max-w-[320px] truncate select-none ${className}`}
      title={displayText}
    >
      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
      <span className="truncate">{displayText}</span>
    </div>
  );
};
