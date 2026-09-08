'use client';

import React from 'react';
import { Award, CheckCircle2, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { StatMetric } from '@/types/dashboard';

interface IconConfig {
  icon: React.ReactNode;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  glowColor: string;
  progressPercent: number;
}

const metricConfigs: Record<string, IconConfig> = {
  'stat-1': {
    icon: <Award className="w-5 h-5" />,
    bgLight: 'bg-[#3D5AFE]/10',
    bgDark: 'dark:bg-[#3D5AFE]/20',
    textLight: 'text-[#3D5AFE]',
    textDark: 'dark:text-indigo-400',
    glowColor: 'group-hover:shadow-[0_8px_25px_rgba(61,90,254,0.15)]',
    progressPercent: 72
  },
  'stat-2': {
    icon: <CheckCircle2 className="w-5 h-5" />,
    bgLight: 'bg-[#00D9C0]/15',
    bgDark: 'dark:bg-[#00D9C0]/20',
    textLight: 'text-[#00897B]',
    textDark: 'dark:text-[#00D9C0]',
    glowColor: 'group-hover:shadow-[0_8px_25px_rgba(0,217,192,0.15)]',
    progressPercent: 86
  },
  'stat-3': {
    icon: <TrendingUp className="w-5 h-5" />,
    bgLight: 'bg-emerald-500/10',
    bgDark: 'dark:bg-emerald-500/20',
    textLight: 'text-emerald-600',
    textDark: 'dark:text-emerald-400',
    glowColor: 'group-hover:shadow-[0_8px_25px_rgba(16,185,129,0.15)]',
    progressPercent: 92
  },
  'stat-4': {
    icon: <ShieldCheck className="w-5 h-5" />,
    bgLight: 'bg-indigo-500/10',
    bgDark: 'dark:bg-indigo-500/20',
    textLight: 'text-indigo-600',
    textDark: 'dark:text-indigo-400',
    glowColor: 'group-hover:shadow-[0_8px_25px_rgba(99,102,241,0.15)]',
    progressPercent: 100
  }
};

const defaultIconConfig: IconConfig = {
  icon: <Award className="w-5 h-5" />,
  bgLight: 'bg-[#3D5AFE]/10',
  bgDark: 'dark:bg-[#3D5AFE]/20',
  textLight: 'text-[#3D5AFE]',
  textDark: 'dark:text-indigo-400',
  glowColor: 'group-hover:shadow-[0_8px_25px_rgba(61,90,254,0.15)]',
  progressPercent: 75
};

interface StatCardProps {
  metric: StatMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const isPositive = metric.changeType === 'increase';
  const isNeutral = metric.changeType === 'neutral' || metric.change === 0;
  const config = metricConfigs[metric.id] || defaultIconConfig;

  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md hover:border-slate-300 dark:hover:border-white/[0.2] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] ${config.glowColor} group hover:-translate-y-1`}>
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          {metric.title}
        </span>
        <div className={`p-2.5 rounded-xl ${config.bgLight} ${config.bgDark} ${config.textLight} ${config.textDark} border border-black/[0.04] dark:border-white/[0.08] shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          {config.icon}
        </div>
      </div>

      {/* Main Value & Trend Pill */}
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {metric.value}
        </span>
        
        {!isNeutral ? (
          <span
            className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {isPositive ? '+' : ''}
            {metric.change}%
          </span>
        ) : (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
            <Minus className="w-3 h-3 mr-0.5" /> Static
          </span>
        )}
      </div>

      {/* Micro Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] transition-all duration-700 ease-out"
          style={{ width: `${config.progressPercent}%` }}
        />
      </div>

      {/* Description / Subtext */}
      {metric.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center justify-between">
          <span>{metric.description}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{metric.timeframe}</span>
        </p>
      )}
    </div>
  );
};

