'use client';

import React from 'react';
import { Zap, Clock, CheckCircle2, Award, Sparkles, BookOpen } from 'lucide-react';
import { PracticeDrillItem } from '@/types/learning-hub';

interface DrillCardProps {
  drill: PracticeDrillItem;
  onStart: (drill: PracticeDrillItem) => void;
}

export function DrillCard({ drill, onStart }: DrillCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'advanced':
        return 'text-purple-600 bg-purple-500/10 border-purple-500/20';
      case 'intermediate':
      default:
        return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'frontend':
        return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
      case 'backend':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'database':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'devops':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'system design':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-[#3D5AFE]/40 transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(
                drill.category
              )}`}
            >
              {drill.category}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getDifficultyColor(
                drill.difficulty
              )}`}
            >
              {drill.difficulty}
            </span>
            {drill.source === 'gemini_generated' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI Blitz
              </span>
            )}
          </div>

          {drill.userPassed ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Passed ({drill.bestScore}%)
            </span>
          ) : drill.bestScore !== undefined ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Best: {drill.bestScore}%
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3D5AFE] transition-colors leading-snug mb-2 line-clamp-2">
          {drill.title}
        </h3>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {drill.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
            >
              {skill}
            </span>
          ))}
          {drill.skills.length > 3 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-500">
              +{drill.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <strong className="text-slate-700 dark:text-slate-300 font-semibold">
              {drill.questionsCount}
            </strong>{' '}
            Questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {drill.estimatedMinutes}m
          </span>
        </div>

        <button
          onClick={() => onStart(drill)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white hover:bg-[#324bdf] transition-all flex items-center gap-1.5 shadow-sm shadow-[#3D5AFE]/20 group-hover:shadow-md"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{drill.userPassed ? 'Retake' : 'Start Drill'}</span>
        </button>
      </div>
    </div>
  );
}
