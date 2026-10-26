'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { PdfQuizQuestion } from '@/types/learning-hub';

interface QuizRunnerModalProps {
  isOpen: boolean;
  title: string;
  category?: string;
  questions: PdfQuizQuestion[];
  estimatedMinutes?: number;
  onClose: () => void;
  onSubmit: (selectedAnswers: Record<string, number>, timeSpentSeconds: number) => Promise<void>;
  isSubmitting?: boolean;
}

export function QuizRunnerModal({
  isOpen,
  title,
  category = 'Technical Drill',
  questions,
  estimatedMinutes = 10,
  onClose,
  onSubmit,
  isSubmitting = false,
}: QuizRunnerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(estimatedMinutes * 60);
  const [timeSpent, setTimeSpent] = useState(0);

  // Reset state when modal opens or questions change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowExplanation(false);
      setTimeLeft(estimatedMinutes * 60);
      setTimeSpent(0);
    }
  }, [isOpen, questions, estimatedMinutes]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, questions.length]);

  if (!isOpen || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const selectedOptionIndex = selectedAnswers[currentQuestion.id];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const answeredCount = Object.keys(selectedAnswers).length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIndex,
    }));
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmit = async () => {
    await onSubmit(selectedAnswers, timeSpent);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar Top */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="bg-[#3D5AFE] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] uppercase tracking-wider">
                {category}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                timeLeft <= 60
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                if (answeredCount > 0) {
                  if (confirm('Are you sure you want to exit? Your progress in this drill will be discarded.')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1">
          {/* Question Prompt */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Prompt
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Optional Code Snippet */}
          {currentQuestion.codeSnippet && (
            <div className="relative rounded-2xl bg-[#0B1120] border border-slate-800 p-4 font-mono text-xs overflow-x-auto group">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
                <span className="font-semibold text-slate-300">Code Inspection Snippet</span>
                <button
                  onClick={() => handleCopySnippet(currentQuestion.codeSnippet!)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-sky-300 leading-relaxed overflow-x-auto scrollbar-thin">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* 4 Option Tiles */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select One Option
            </div>
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedOptionIndex === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                    isSelected
                      ? 'bg-[#3D5AFE]/10 border-[#3D5AFE] dark:bg-[#3D5AFE]/20 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Letter Badge */}
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#3D5AFE] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}
                  >
                    {optionLetters[optIdx]}
                  </span>

                  {/* Option Text */}
                  <span
                    className={`text-xs md:text-sm font-medium leading-relaxed pt-0.5 ${
                      isSelected
                        ? 'text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Educational Rationale Peek */}
          {selectedOptionIndex !== undefined && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs font-semibold text-[#3D5AFE] hover:text-[#324bdf] flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showExplanation ? 'Hide Answer Rationale' : 'Peek Educational Rationale'}</span>
              </button>

              {showExplanation && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-150">
                  <div className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Official Concept Rationale</span>
                  </div>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Stepper Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'w-6 bg-[#3D5AFE]'
                      : isAnswered
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white hover:bg-[#324bdf] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#3D5AFE]/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Grading Answers...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Submit & Grade Drill</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
