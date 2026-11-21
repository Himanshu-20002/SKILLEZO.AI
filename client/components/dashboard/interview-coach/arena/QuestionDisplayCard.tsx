'use client';

import React from 'react';
import { Tag, Sparkles, AlertCircle, CornerDownRight } from 'lucide-react';
import { InterviewQuestion } from '@/types/interview-coach';

interface QuestionDisplayCardProps {
  question: InterviewQuestion;
  totalQuestions: number;
  timerNode?: React.ReactNode;
}

export const QuestionDisplayCard: React.FC<QuestionDisplayCardProps> = ({
  question,
  totalQuestions,
  timerNode,
}) => {
  const isFollowUp = Boolean(question.parentQuestionId);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Meta Bar: Sequence, Category, Difficulty & Live Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {isFollowUp ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <CornerDownRight className="w-3.5 h-3.5" />
              Follow-Up Question
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              Question {question.sequence} of {totalQuestions}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Tag className="w-3 h-3 text-slate-400" />
            {question.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
              question.difficulty === 'hard'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                : question.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {question.difficulty}
          </span>
          {timerNode}
        </div>
      </div>

      {/* Question Prompt */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed tracking-tight mb-6">
        {question.questionText}
      </h2>

      {/* Evaluated Competency Guidance */}
      {question.expectedConcepts && question.expectedConcepts.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Key discussion dimensions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {question.expectedConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

