'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flag, Sparkles, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { InterviewSession } from '@/types/interview-coach';

export interface InterviewArenaHeaderProps {
  session: InterviewSession;
  currentSequence: number;
  totalQuestions: number;
  onEndEarly: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const InterviewArenaHeader: React.FC<InterviewArenaHeaderProps> = ({
  session,
  currentSequence,
  totalQuestions,
  onEndEarly,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const router = useRouter();
  const progressPercent = Math.min(
    100,
    Math.round(((currentSequence - 1) / Math.max(1, totalQuestions)) * 100)
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Back / Role Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/dashboard/interview-coach')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Return to Interview Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                {session.role}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 capitalize">
                {session.experienceLevel}
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                {session.interviewType}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>AI Interactive Coach</span>
              <span>•</span>
              <span>{session.durationMinutes} min practice</span>
            </p>
          </div>
        </div>

        {/* Center: Live Question Stepper & Progress */}
        <div className="hidden sm:flex flex-col items-center justify-center min-w-[200px]">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Question {currentSequence} of {totalQuestions}
          </span>
          <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Fullscreen & End Session Early CTA */}
        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Focus' : 'Focus Mode'}</span>
            </button>
          )}

          <button
            onClick={onEndEarly}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/40"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Conclude</span>
          </button>
        </div>
      </div>
    </header>
  );
};

