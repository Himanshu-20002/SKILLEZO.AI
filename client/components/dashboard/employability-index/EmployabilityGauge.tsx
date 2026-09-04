'use client';

import React from 'react';
import { Award, TrendingUp, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { EmployabilityIndexData } from '@/types/career-intelligence';

interface EmployabilityGaugeProps {
  data: EmployabilityIndexData;
  candidateName?: string;
}

export const EmployabilityGauge: React.FC<EmployabilityGaugeProps> = ({ data, candidateName }) => {
  // Circular gauge calculations
  const radius = 54;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(data.overallScore || 0, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const isJobReady = clampedScore >= 75;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-[0_12px_35px_-8px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-300 backdrop-blur-xl">
      {/* Dynamic Ambient Refraction Glows */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#00D9C0]/15 via-sky-400/10 to-transparent dark:from-[#00D9C0]/10 dark:via-sky-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-[#3D5AFE]/15 via-indigo-500/10 to-transparent dark:from-[#3D5AFE]/15 dark:via-indigo-600/5 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE REPORT
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {candidateName ? `${candidateName}'s Dashboard` : "Employability Index"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isJobReady ? "Job-ready" : `${data.tierStatus} Candidate`}</span>
          </span>
        </div>
      </div>

      {/* Main Content: Circular Radial Gauge + Tier Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 relative z-10">
        {/* Left: Circular Radial Gauge on Crisp Polished Pedestal */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center p-3 sm:p-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-750 shadow-[0_8px_25px_-6px_rgba(61,90,254,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)] dark:shadow-[0_8px_25px_-6px_rgba(0,0,0,0.5)]">
            <svg className="w-44 h-44 sm:w-48 sm:h-48 -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Track Circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800/90"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Glowing Dynamic Progress Arc */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="url(#employabilityGaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />

              <defs>
                <linearGradient id="employabilityGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3D5AFE" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#00D9C0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {data.overallScore}
              </span>
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 tracking-wider uppercase mt-1.5">
                / 100 SCORE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Crisp Polished Tier Progress & Benchmark Progression */}
        <div className="lg:col-span-7 space-y-4 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Tier: <strong className="text-[#3D5AFE] dark:text-[#00D9C0] font-black">{data.tierStatus}</strong>
            </span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Target Tier: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{data.targetTier}</strong>
            </span>
          </div>

          {/* Tier Progress Bar with Defined Borders */}
          <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-[#3D5AFE] via-[#06B6D4] to-[#00D9C0] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.35)]"
              style={{ width: `${clampedScore}%` }}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <p className="leading-relaxed">
              Complete <strong className="text-slate-900 dark:text-white font-bold">2 high-impact actions</strong> below to accelerate into the <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{data.targetTier}</strong> candidate pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
