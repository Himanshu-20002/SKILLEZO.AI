'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Code2,
  Copy,
  Check,
  Zap,
  BookOpen,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { ConvertedQuizResult, PdfQuizQuestion } from '@/types/learning-hub';
import { toast } from 'sonner';

interface PdfQuizConverterModalProps {
  quiz: ConvertedQuizResult | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onStartPractice?: (quiz: ConvertedQuizResult) => void;
}

export const PdfQuizConverterModal: React.FC<PdfQuizConverterModalProps> = ({
  quiz,
  isOpen,
  isLoading,
  onClose,
  onStartPractice,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
    // Automatically reveal explanation when an option is picked
    setRevealedExplanations((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  };

  const handleCopyQuestions = () => {
    if (!quiz) return;
    const text = quiz.questions
      .map(
        (q, idx) =>
          `Q${idx + 1}: ${q.question}\n` +
          (q.codeSnippet ? `\n\`\`\`\n${q.codeSnippet}\n\`\`\`\n` : '') +
          q.options.map((opt, oIdx) => `  ${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n') +
          `\nCorrect Answer: ${String.fromCharCode(65 + q.correctOptionIndex)}\nExplanation: ${q.explanation}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('All questions copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-[#3D5AFE]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Gemini AI Extraction Engine
                </span>
                {quiz && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {quiz.questionsCount} High-Signal MCQs
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {isLoading ? 'Synthesizing Interactive Quiz...' : quiz?.pdfTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3D5AFE] to-amber-400 animate-spin opacity-80" />
                <div className="absolute inset-1 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[#3D5AFE] animate-pulse" />
                </div>
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Parsing Document & Extracting Questions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gemini AI is reading technical sections, identifying edge-cases, and formulating deterministic multiple-choice questions with full rationale.
                </p>
              </div>
            </div>
          ) : quiz && quiz.questions.length > 0 ? (
            <div className="space-y-6">
              {/* Informative Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Test your knowledge! Select an option below to test yourself and unlock the engineering explanation.
                  </span>
                </div>
                <button
                  onClick={handleCopyQuestions}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{isCopied ? 'Copied!' : 'Copy Q&A'}</span>
                </button>
              </div>

              {/* Questions List */}
              {quiz.questions.map((q: PdfQuizQuestion, qIdx: number) => {
                const selectedOpt = selectedAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctOptionIndex;

                return (
                  <div
                    key={q.id || `q_${qIdx}`}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {q.question}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Optional Code Snippet */}
                    {q.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1.5 pb-1 border-b border-slate-800">
                          <Code2 className="w-3 h-3" />
                          <span>Code Snippet</span>
                        </div>
                        <pre className="whitespace-pre">{q.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Multiple-Choice Options */}
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => {
                        const isThisSelected = selectedOpt === optIdx;
                        const isThisCorrect = optIdx === q.correctOptionIndex;

                        let optionStyle =
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300';

                        if (isAnswered) {
                          if (isThisCorrect) {
                            optionStyle =
                              'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-medium';
                          } else if (isThisSelected && !isThisCorrect) {
                            optionStyle =
                              'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300';
                          } else {
                            optionStyle =
                              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{option}</span>
                            {isAnswered && isThisCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {revealedExplanations[qIdx] && (
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#3D5AFE] dark:text-[#536DFE]">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Technical Rationale:</span>
                        </div>
                        <p className="leading-relaxed pl-5">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              No questions extracted yet. Click "Extract AI Practice Quiz" to generate questions.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {quiz ? `Generated ${quiz.questionsCount} interactive questions` : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Done Reviewing
            </button>

            {onStartPractice && quiz && (
              <button
                onClick={() => onStartPractice(quiz)}
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#324bdf] text-white transition-colors flex items-center gap-1.5 shadow-md shadow-[#3D5AFE]/20"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch Full Practice Arena</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
