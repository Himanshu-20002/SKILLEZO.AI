'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface JobMatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const JobMatchScore: React.FC<JobMatchScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  let badgeStyle = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  let tierLabel = 'Excellent Match';

  if (score < 70) {
    badgeStyle = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    tierLabel = 'Potential Match';
  } else if (score < 85) {
    badgeStyle = 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
    tierLabel = 'Good Match';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-extrabold',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${badgeStyle} ${sizeClasses}`}>
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{score}% SKILL MATCH</span>
      {showLabel && size !== 'sm' && <span className="opacity-80 font-normal">({tierLabel})</span>}
    </div>
  );
};
