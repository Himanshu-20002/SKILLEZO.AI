'use client';

import React from 'react';
import { Target, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { TrackCatalogItem } from '@/types/learning-hub';

interface SkillGapRecommendationBannerProps {
  targetRole: string;
  missingSkillsCovered: string[];
  recommendedTracks: TrackCatalogItem[];
  onSelectTrack: (track: TrackCatalogItem) => void;
}

export const SkillGapRecommendationBanner: React.FC<SkillGapRecommendationBannerProps> = ({
  targetRole,
  missingSkillsCovered,
  recommendedTracks,
  onSelectTrack,
}) => {
  if (!recommendedTracks || recommendedTracks.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#61DAFB] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recommended for Target Role: {targetRole}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Skill Gap Aligned
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identified by your active Career Plan & Resume ATS benchmark
            </p>
          </div>
        </div>

        {missingSkillsCovered.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Remediates:
            </span>
            {missingSkillsCovered.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Track Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recommendedTracks.slice(0, 3).map((track) => (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track)}
            className="group cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#3D5AFE]/50 rounded-xl p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {track.category}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {track.estimatedMinutes}m
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3D5AFE] transition-colors line-clamp-1">
                {track.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {track.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="font-semibold text-[#3D5AFE] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Start Track <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] text-slate-400">
                {track.totalModules} Modules
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
