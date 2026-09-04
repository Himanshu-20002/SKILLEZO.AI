'use client';

import React from 'react';
import { Award, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="rounded-3xl bg-white/70 dark:bg-[#0c1427]/80 backdrop-blur-2xl border border-white/90 dark:border-slate-800/80 p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-300">
      {/* Dynamic Glassmorphic Ambient Luminous Glows */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-[#00D9C0]/25 via-sky-400/20 to-transparent dark:from-[#00D9C0]/15 dark:via-sky-500/10 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-gradient-to-tr from-[#3D5AFE]/20 via-indigo-500/15 to-transparent dark:from-[#3D5AFE]/20 dark:via-indigo-600/10 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/20 dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.02] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 relative z-10 pb-2">
        <div className="space-y-0.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE REPORT
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {candidateName ? `${candidateName}'s dashboard` : "Employability Index"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isJobReady ? "Job-ready" : `${data.tierStatus} Candidate`}</span>
          </span>
        </div>
      </div>

      {/* Main Content: Circular Radial Gauge + Tier Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 relative z-10">
        {/* Left: Circular Radial Gauge with Glassmorphic Ring */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center p-2 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800/40 shadow-inner">
            <svg className="w-44 h-44 sm:w-48 sm:h-48 -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Track Circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-200/80 dark:stroke-slate-800/90"
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
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none drop-shadow-sm">
                {data.overallScore}
              </span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1.5">
                / 100 SCORE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Frosted Glass Tier Progress & Benchmark Progression */}
        <div className="lg:col-span-7 space-y-4 bg-white/60 dark:bg-slate-900/60 border border-white/80 dark:border-slate-800/70 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Tier: <strong className="text-[#3D5AFE] dark:text-[#00D9C0] font-bold">{data.tierStatus}</strong>
            </span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Target Tier: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{data.targetTier}</strong>
            </span>
          </div>

          {/* Tier Progress Bar with Glass Track */}
          <div className="w-full h-3.5 rounded-full bg-slate-200/80 dark:bg-slate-800/90 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/40">
            <div
              className="h-full bg-gradient-to-r from-[#3D5AFE] via-[#06B6D4] to-[#00D9C0] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              style={{ width: `${clampedScore}%` }}
            />
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
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
