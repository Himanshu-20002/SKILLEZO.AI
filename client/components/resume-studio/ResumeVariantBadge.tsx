'use client';

import React from 'react';
import { Sparkles, Target } from 'lucide-react';

export interface ResumeVariantBadgeProps {
  variantType?: 'MASTER' | 'TAILORED';
  compact?: boolean;
  className?: string;
}

export const ResumeVariantBadge: React.FC<ResumeVariantBadgeProps> = ({
  variantType = 'MASTER',
  compact = false,
  className = '',
}) => {
  const isMaster = variantType === 'MASTER';

  if (isMaster) {
    return (
      <span
        role="status"
        aria-label="Master Resume"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shadow-xs shrink-0 select-none ${className}`}
      >
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" aria-hidden="true" />
        <span>{compact ? 'MASTER' : '⭐ MASTER RESUME'}</span>
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label="Tailored Resume Variant"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 shadow-xs shrink-0 select-none ${className}`}
    >
      <Target className="w-3 h-3 text-indigo-500 shrink-0" aria-hidden="true" />
      <span>{compact ? 'TAILORED' : '🎯 TAILORED RESUME'}</span>
    </span>
  );
};
