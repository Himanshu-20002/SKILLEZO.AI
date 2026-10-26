'use client';

import React from 'react';
import {
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Atom,
  Server,
  Database,
  Box,
  Cpu,
  GraduationCap,
} from 'lucide-react';
import { TrackCatalogItem } from '@/types/learning-hub';

interface TrackCardProps {
  track: TrackCatalogItem;
  onViewSyllabus: (track: TrackCatalogItem) => void;
  onEnroll: (track: TrackCatalogItem) => void;
  enrolling?: boolean;
}

// Icon mapper for tracks
const getTrackIcon = (iconName: string, className: string = 'w-5 h-5') => {
  switch (iconName?.toLowerCase()) {
    case 'atom':
      return <Atom className={className} />;
    case 'server':
      return <Server className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'box':
      return <Box className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    default:
      return <GraduationCap className={className} />;
  }
};

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Beginner
        </span>
      );
    case 'intermediate':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          Intermediate
        </span>
      );
    case 'advanced':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          Advanced
        </span>
      );
    default:
      return null;
  }
};

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onViewSyllabus,
  onEnroll,
  enrolling = false,
}) => {
  const isCompleted = track.enrolled && track.progressPercent === 100;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              backgroundColor: `${track.accentColor}18`,
              color: track.accentColor,
            }}
          >
            {getTrackIcon(track.iconName, 'w-5 h-5')}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {track.category}
            </span>
            {getDifficultyBadge(track.difficulty)}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-[#3D5AFE] transition-colors leading-snug">
          {track.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {track.description}
        </p>

        {/* Target Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {track.targetSkills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
            >
              {skill}
            </span>
          ))}
          {track.targetSkills.length > 4 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              +{track.targetSkills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Progress & Metadata Footer */}
      <div>
        {/* Progress Bar (If Enrolled) */}
        {track.enrolled && (
          <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Completed
                  </>
                ) : (
                  'Progress'
                )}
              </span>
              <span className="font-bold text-[#3D5AFE]">
                {track.progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3D5AFE] rounded-full transition-all duration-500"
                style={{ width: `${track.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta info row */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pt-2">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {track.totalModules} Modules • {track.totalResources} Lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {track.estimatedMinutes}m
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewSyllabus(track)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {!track.enrolled && (
            <button
              onClick={() => onEnroll(track)}
              disabled={enrolling}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#324bdf] text-white transition-colors disabled:opacity-50 shadow-sm shadow-[#3D5AFE]/30"
            >
              Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
