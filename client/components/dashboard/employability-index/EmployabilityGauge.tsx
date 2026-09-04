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
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(data.overallScore || 0, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const isJobReady = clampedScore >= 75;

  return (
    <div className="rounded-3xl bg-[#0d1527] border border-slate-800/80 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden backdrop-blur-xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D9C0]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#3D5AFE]/15 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 relative z-10 pb-2">
        <div className="space-y-0.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE REPORT
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {candidateName ? `${candidateName}'s dashboard` : "Employability Index"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isJobReady ? "Job-ready" : `${data.tierStatus} Candidate`}</span>
          </span>
        </div>
      </div>

      {/* Main Content: Circular Radial Gauge + Tier Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 relative z-10">
        {/* Left / Center: Circular Radial Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 sm:w-48 sm:h-48 -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Track Circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-slate-800/90"
                strokeWidth={strokeWidth}
                stroke="currentColor"
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
                  <stop offset="50%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#00D9C0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
                {data.overallScore}
              </span>
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-1.5">
                / 100 SCORE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tier Progress & Benchmark Progression */}
        <div className="lg:col-span-7 space-y-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-slate-300">
              Current Tier: <strong className="text-[#00D9C0] font-bold">{data.tierStatus}</strong>
            </span>
            <span className="font-medium text-slate-400">
              Target Tier: <strong className="text-emerald-400 font-bold">{data.targetTier}</strong>
            </span>
          </div>

          {/* Tier Progress Bar */}
          <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-750">
            <div
              className="h-full bg-gradient-to-r from-[#3D5AFE] via-[#38BDF8] to-[#00D9C0] rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/50"
              style={{ width: `${clampedScore}%` }}
            />
          </div>

          <div className="pt-1 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <p className="leading-relaxed text-slate-300">
              Complete <strong className="text-white">2 high-impact actions</strong> below to accelerate into the <strong className="text-emerald-400">{data.targetTier}</strong> candidate pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
