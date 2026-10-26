'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { UserLearningStats } from '@/types/learning-hub';

interface LearningHubHeaderProps {
  stats: UserLearningStats;
  onExploreClick?: () => void;
}

export const LearningHubHeader: React.FC<LearningHubHeaderProps> = ({
  stats,
  onExploreClick,
}) => {
  const learningHours = Math.round((stats.totalLearningMinutes / 60) * 10) / 10;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl mb-8">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#3D5AFE]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#3D5AFE]/20 text-[#61DAFB] border border-[#3D5AFE]/40 mb-3.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Learning Hub • Phase 1 Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
            Level Up Your Engineering Competencies
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Curated, industry-aligned learning tracks designed to remediate your specific skill gaps,
            master architectural patterns, and boost your verified Employability Index.
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-500/20 text-[#61DAFB] flex items-center justify-center mb-1.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.enrolledTracksCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400">Enrolled Tracks</div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.completedResourcesCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400">Lessons Completed</div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {learningHours}h
            </div>
            <div className="text-[11px] font-medium text-slate-400">Learning Logged</div>
          </div>
        </div>
      </div>
    </div>
  );
};
