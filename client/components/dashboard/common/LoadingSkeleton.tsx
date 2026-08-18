'use client';

import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'profile' | 'stat';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const items = Array.from({ length: count });

  if (variant === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-800 rounded-md" />
              <div className="w-9 h-9 bg-slate-800 rounded-xl" />
            </div>
            <div className="h-7 w-20 bg-slate-800 rounded-lg" />
            <div className="h-3 w-32 bg-slate-800/80 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`w-full rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden ${className}`}>
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex gap-4">
          <div className="h-4 w-1/4 bg-slate-800 rounded" />
          <div className="h-4 w-1/4 bg-slate-800 rounded" />
          <div className="h-4 w-1/4 bg-slate-800 rounded" />
          <div className="h-4 w-1/4 bg-slate-800 rounded" />
        </div>
        {items.map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-800/60 flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="h-4 w-1/3 bg-slate-800 rounded" />
            <div className="h-4 w-1/6 bg-slate-800 rounded" />
            <div className="h-4 w-1/4 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
          <div className="h-5 w-1/3 bg-slate-800 rounded-md" />
          <div className="h-4 w-3/4 bg-slate-800/70 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-800/50 rounded-md" />
        </div>
      ))}
    </div>
  );
};
