'use client';

import React from 'react';
import { Award } from 'lucide-react';

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
    if (score >= 90) return { label: 'Top 5% Resume', color: 'text-emerald-500', bg: 'bg-emerald-500/15 border-emerald-500/30' };
    if (score >= 80) return { label: 'Strong Resume', color: 'text-cyan-500', bg: 'bg-cyan-500/15 border-cyan-500/30' };
    if (score >= 70) return { label: 'Good Resume', color: 'text-amber-500', bg: 'bg-amber-500/15 border-amber-500/30' };
    return { label: 'Needs Improvement', color: 'text-rose-500', bg: 'bg-rose-500/15 border-rose-500/30' };
  };

  const rating = getRating(overallScore);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Resume Quality Score</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI structural & content evaluation</p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${rating.bg} ${rating.color}`}>
          {rating.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-4xl font-extrabold text-[#3D5AFE] dark:text-[#00D9C0]">{overallScore}</span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Overall Score</span>
        </div>

        <div className="sm:col-span-3 grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium block">ATS Match</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block">{atsScore}%</span>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${atsScore}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium block">Impact Statements</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block">{impactScore}%</span>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-[#3D5AFE] rounded-full" style={{ width: `${impactScore}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium block">Brevity & Style</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block">{brevityScore}%</span>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${brevityScore}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
