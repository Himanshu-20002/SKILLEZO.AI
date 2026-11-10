'use client';

import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Code,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import {
  InterviewSession,
  InterviewQuestion,
} from '@/types/interview-coach';

interface QuestionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: InterviewSession | null;
  questions: InterviewQuestion[];
}

export const QuestionPlanModal: React.FC<QuestionPlanModalProps> = ({
  isOpen,
  onClose,
  session,
  questions,
}) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3D5AFE] to-[#00D9C0] text-white flex items-center justify-center shadow-md shadow-[#3D5AFE]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {session.role} Interview Plan
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase border border-emerald-200 dark:border-emerald-800/50">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="capitalize font-semibold">{session.experienceLevel} Tier</span>
                <span>•</span>
                <span className="capitalize">{session.interviewType} Format</span>
                <span>•</span>
                <span>{session.totalQuestions} Questions ({session.durationMinutes} mins)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Callout */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 px-6 py-3 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0] shrink-0" />
            <span>
              Your customized question plan has been validated and persisted to your profile.
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#3D5AFE] dark:text-cyan-300 shrink-0">
            Phase 2 Engine Active
          </span>
        </div>

        {/* Scrollable Questions Itinerary */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {questions.map((q) => (
            <div
              key={q.sequence}
              className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850/60 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#3D5AFE] text-white font-black text-xs flex items-center justify-center">
                    {q.sequence}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {q.category}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                  {q.difficulty}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {q.questionText}
              </p>

              {q.expectedConcepts && q.expectedConcepts.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#3D5AFE]" />
                    Evaluates:
                  </span>
                  {q.expectedConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Questions: <strong className="text-slate-900 dark:text-white">{questions.length}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#3D5AFE] hover:bg-[#304FFE] px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span>Close Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};

