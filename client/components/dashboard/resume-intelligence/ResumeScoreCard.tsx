'use client';

import React from 'react';
import { Award, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';

interface ResumeScoreCardProps {
  overallScore: number;
  atsScore: number;
  impactScore: number;
  brevityScore: number;
}

export const ResumeScoreCard: React.FC<ResumeScoreCardProps> = ({
  overallScore,
  atsScore,
  impactScore,
  brevityScore,
}) => {
  const getRating = (score: number) => {
    if (score >= 90) return { label: 'Top 5% Resume', badge: 'Job-Ready', color: 'text-emerald-500', bg: 'bg-emerald-500/15 border-emerald-500/30' };
    if (score >= 80) return { label: 'Strong Resume', badge: 'High Match', color: 'text-cyan-500', bg: 'bg-cyan-500/15 border-cyan-500/30' };
    if (score >= 70) return { label: 'Good Resume', badge: 'Optimized', color: 'text-amber-500', bg: 'bg-amber-500/15 border-amber-500/30' };
    return { label: 'Needs Polish', badge: 'Needs Work', color: 'text-rose-500', bg: 'bg-rose-500/15 border-rose-500/30' };
  };

  const rating = getRating(overallScore);

  // Circular gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Resume Quality Score
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI structural & ATS keyword evaluation
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${rating.bg} ${rating.color} flex items-center gap-1`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {rating.label}
        </span>
      </div>

      {/* Center Circular Progress Gauge */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-100 dark:text-slate-800/80"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Gradient Progress Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#resumeScoreGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="resumeScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3D5AFE" />
                <stop offset="60%" stopColor="#00D9C0" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              {overallScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mt-1">
              / 100 Score
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Metrics Cards Grid (3 Columns) */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Metric 1: ATS Match */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>ATS Match</span>
          </div>
          <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 block">
            {atsScore}%
          </span>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${atsScore}%` }} />
          </div>
        </div>

        {/* Metric 2: Impact */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0]" />
            <span>Impact</span>
          </div>
          <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 block">
            {impactScore}%
          </span>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] rounded-full transition-all duration-700" style={{ width: `${impactScore}%` }} />
          </div>
        </div>

        {/* Metric 3: Brevity */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Brevity</span>
          </div>
          <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 block">
            {brevityScore}%
          </span>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: `${brevityScore}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
