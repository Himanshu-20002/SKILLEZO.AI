'use client';

import React from 'react';
import { Award, CheckCircle2, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatMetric } from '@/types/dashboard';

const iconMap: Record<string, React.ReactNode> = {
  Award: <Award className="w-5 h-5 text-[#3D5AFE]" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5 text-[#00D9C0]" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
};

interface StatCardProps {
  metric: StatMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const isPositive = metric.changeType === 'increase';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 shadow-sm dark:shadow-md group">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">{metric.title}</span>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 group-hover:scale-105 transition-transform">
          {iconMap[metric.iconName] || <Award className="w-5 h-5 text-[#3D5AFE]" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{metric.value}</span>
        {metric.change !== 0 && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              isPositive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {isPositive ? '+' : ''}
            {metric.change}%
          </span>
        )}
      </div>

      {metric.description && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{metric.description}</p>}
    </div>
  );
};
