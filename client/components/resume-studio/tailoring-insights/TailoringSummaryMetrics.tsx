'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { TailoringInsightsSummary } from '@/types/tailoring-insights.types';

export interface TailoringSummaryMetricsProps {
  summary: TailoringInsightsSummary;
  className?: string;
}

export const TailoringSummaryMetrics: React.FC<TailoringSummaryMetricsProps> = ({
  summary,
  className = '',
}) => {
  const cards = [
    {
      id: 'metric-applied',
      label: 'Changes Applied',
      value: summary.totalAppliedChanges,
      description: 'AST modifications',
      icon: Sparkles,
      colorClasses: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'metric-matched',
      label: 'Job Alignment',
      value: summary.matchedRequirements,
      description: 'Requirements matched',
      icon: CheckCircle2,
      colorClasses: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'metric-promoted',
      label: 'Skills Elevated',
      value: summary.promotedRequirements,
      description: 'Promoted in rank',
      icon: ArrowUpRight,
      colorClasses: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'metric-not-added',
      label: 'Trust Protection',
      value: summary.notAddedRequirements,
      description: 'Ungrounded claims blocked',
      icon: ShieldCheck,
      colorClasses: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div
      role="region"
      aria-label="Tailoring Summary Metrics"
      className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${className}`}
    >
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </span>
              <div className={`p-1 rounded-md border ${card.colorClasses}`}>
                <Icon className={`w-3 h-3 ${card.iconColor}`} aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {card.value}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {card.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
