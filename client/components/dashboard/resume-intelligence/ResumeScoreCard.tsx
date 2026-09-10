'use client';

import React from 'react';
import { CheckCircle2, Target, Zap, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface ResumeScoreCardProps {
  atsScore: number;
  matchScore?: number;
  contentScore?: number;
  targetRole?: string;
  hasJobDescription?: boolean;
}

export const ResumeScoreCard: React.FC<ResumeScoreCardProps> = ({
  atsScore,
  matchScore = 75,
  contentScore = 70,
  targetRole = 'Full-Stack Engineer',
  hasJobDescription = false,
}) => {
  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: 'Optimal', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 70) return { label: 'Competitive', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    if (score >= 55) return { label: 'Fair', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Needs Polish', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const atsBadge = getScoreBadge(atsScore);
  const matchBadge = getScoreBadge(matchScore);
  const contentBadge = getScoreBadge(contentScore);

  // Circular progress helper
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Authoritative Intelligence Scores</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                3 Independent Pillars
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated deterministically against {targetRole} standards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic AI Scoring</span>
        </div>
      </div>

      {/* 3 Pillars Scoreboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Pillar 1: ATS Compatibility */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-between text-center space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>ATS Score</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${atsBadge.bg} ${atsBadge.color}`}>
              {atsBadge.label}
            </span>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-200/80 dark:text-slate-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#10B981"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (atsScore / 100) * circumference}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{atsScore}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
            Formatting, contact checklist & keyword density
          </p>
        </div>

        {/* Pillar 2: Role & JD Match */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-between text-center space-y-2 relative overflow-hidden group hover:border-[#3D5AFE]/40 transition-colors">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Target className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />
              <span>Match Score</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${matchBadge.bg} ${matchBadge.color}`}>
              {matchBadge.label}
            </span>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-200/80 dark:text-slate-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#3D5AFE"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (matchScore / 100) * circumference}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{matchScore}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
            {hasJobDescription ? 'Target JD & Role profile alignment' : `${targetRole} benchmark skill coverage`}
          </p>
        </div>

        {/* Pillar 3: Impact & Content */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-between text-center space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Content Score</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${contentBadge.bg} ${contentBadge.color}`}>
              {contentBadge.label}
            </span>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-200/80 dark:text-slate-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#A855F7"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (contentScore / 100) * circumference}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{contentScore}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
            Action power verbs, quantified metrics & outcomes
          </p>
        </div>
      </div>
    </div>
  );
};
