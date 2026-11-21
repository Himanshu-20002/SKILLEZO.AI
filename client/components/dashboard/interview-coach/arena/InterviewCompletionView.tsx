'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Award, Clock, ArrowRight, BarChart3, RotateCcw, Loader2 } from 'lucide-react';
import { InterviewSession } from '@/types/interview-coach';

interface InterviewCompletionViewProps {
  session: InterviewSession;
  totalQuestions: number;
  totalAnswers: number;
}

export const InterviewCompletionView: React.FC<InterviewCompletionViewProps> = ({
  session,
  totalQuestions,
  totalAnswers,
}) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleViewReport = () => {
    setIsRedirecting(true);
    router.push(`/dashboard/interview-coach/report/${session._id}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        Mock Interview Completed!
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8">
        {totalAnswers === 0 ? (
          <>
            Your practice session for <span className="font-semibold text-slate-800 dark:text-slate-200">{session.role}</span> has been concluded.
          </>
        ) : (
          <>
            Congratulations! You have completed questions for your <span className="font-semibold text-slate-800 dark:text-slate-200">{session.role}</span> practice session.
          </>
        )}
      </p>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Questions</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalAnswers} / {totalQuestions}
          </div>
          <p className="text-[11px] text-slate-400">
            {totalAnswers >= totalQuestions ? 'All answered' : totalAnswers === 0 ? 'Concluded early' : 'Partially answered'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Allocated</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {session.durationMinutes}m
          </div>
          <p className="text-[11px] text-slate-400">Target duration</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Difficulty</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 capitalize">
            {session.difficulty}
          </div>
          <p className="text-[11px] text-slate-400">{session.experienceLevel} tier</p>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => router.push('/dashboard/interview-coach')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={handleViewReport}
          disabled={isRedirecting}
          data-testid="btn-view-detailed-feedback"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-75 cursor-pointer"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Opening Evaluation...</span>
            </>
          ) : (
            <>
              <span>View Detailed Feedback</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

