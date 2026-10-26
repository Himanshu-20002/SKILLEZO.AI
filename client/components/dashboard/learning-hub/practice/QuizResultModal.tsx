'use client';

import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { QuizSubmissionResult } from '@/types/learning-hub';

interface QuizResultModalProps {
  isOpen: boolean;
  result: QuizSubmissionResult | null;
  onClose: () => void;
  onRetake: () => void;
  onGoToVerification?: () => void;
}

export function QuizResultModal({
  isOpen,
  result,
  onClose,
  onRetake,
  onGoToVerification,
}: QuizResultModalProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const passed = result.passed;
  const optionLetters = ['A', 'B', 'C', 'D'];

  const toggleExpand = (qId: string) => {
    setExpandedQuestionId((prev) => (prev === qId ? null : qId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Drill Results & Analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {result.resourceTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6">
          {/* Score Hero Card */}
          <div
            className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
              passed
                ? 'bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30'
                : 'bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30'
            }`}
          >
            {/* Score Ring */}
            <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 mb-3 bg-white dark:bg-slate-900 shadow-inner">
              <span
                className={`text-2xl font-black ${
                  passed ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {result.score}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                {result.correctAnswersCount}/{result.totalQuestions} Correct
              </span>
            </div>

            {/* Banner Status */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                {passed ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Target Benchmark Achieved (Passed ≥ 70%)
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Passing Threshold is 70% — Keep Practicing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {passed
                  ? 'Strong technical comprehension demonstrated. Review your answers below or proceed to the verification assessment.'
                  : 'Review the detailed concept rationales below for missed questions and retake the blitz to achieve mastery.'}
              </p>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Question Breakdown & Rationales
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Click any question to view full rationale
              </span>
            </div>

            <div className="space-y-2">
              {result.results.map((item, idx) => {
                const isExpanded = expandedQuestionId === item.questionId;
                return (
                  <div
                    key={item.questionId}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-colors"
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.questionId)}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-400 shrink-0">
                          Q{idx + 1}.
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.question}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                          }`}
                        >
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
                        {/* Question Text */}
                        <div className="text-slate-800 dark:text-slate-200 font-medium pt-1">
                          {item.question}
                        </div>

                        {/* Code Snippet if present */}
                        {item.codeSnippet && (
                          <div className="rounded-xl bg-[#0B1120] p-3 font-mono text-[11px] text-sky-300 overflow-x-auto">
                            <code>{item.codeSnippet}</code>
                          </div>
                        )}

                        {/* Options Answer Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              item.isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">
                              Your Selected Choice:
                            </span>
                            <span className="font-semibold">
                              {item.selectedOptionIndex >= 0
                                ? `Option ${optionLetters[item.selectedOptionIndex]}`
                                : 'No answer selected'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                            <span className="block text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">
                              Correct Choice:
                            </span>
                            <span className="font-semibold">
                              Option {optionLetters[item.correctOptionIndex]}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Rationale */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Educational Rationale:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Drill</span>
          </button>

          <div className="flex items-center gap-2">
            {passed && onGoToVerification && (
              <button
                onClick={onGoToVerification}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Skill Certificate</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white hover:bg-[#324bdf] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
