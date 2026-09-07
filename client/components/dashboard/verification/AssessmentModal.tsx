'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { AssessmentQuiz, AssessmentResult } from '@/types/verification';
import { verificationService } from '@/services/verification.service';
import { toast } from 'sonner';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: AssessmentQuiz | null;
  onAssessmentCompleted?: (result: AssessmentResult) => void;
  onViewCertificate?: (certificate: {
    skillName: string;
    category?: string;
    candidateName?: string;
    score: number;
    proficiency?: string;
    credentialHash: string;
    issueDate?: string;
  }) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onAssessmentCompleted,
  onViewCertificate,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Initialize quiz timer and state
  useEffect(() => {
    if (quiz && isOpen) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setResult(null);
      setSecondsRemaining(quiz.track.durationMinutes * 60);
    }
  }, [quiz, isOpen]);

  // Timer countdown hook
  useEffect(() => {
    if (!isOpen || result || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, result, secondsRemaining]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions;
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (result) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    try {
      setSubmitting(true);
      const res = await verificationService.submitAssessment(quiz.track.id, answers);
      setResult(res);
      if (res.verified) {
        toast.success(`Congratulations! You passed ${quiz.track.skillName} Assessment with ${res.score}%!`);
      } else {
        toast.error(`Assessment complete. You scored ${res.score}%. Minimum required is ${quiz.track.passingScore}%.`);
      }
      if (onAssessmentCompleted) {
        onAssessmentCompleted(res);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit assessment answers');
    } finally {
      setSubmitting(false);
    }
  };

  const isLowTime = secondsRemaining > 0 && secondsRemaining < 120;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D5AFE]/10 flex items-center justify-center text-[#3D5AFE]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {quiz.track.title}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {quiz.track.category} • Passing Threshold: {quiz.track.passingScore}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  isLowTime
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {!result ? (
            /* Active Quiz Interface */
            <>
              {/* Question Navigation Dots */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#3D5AFE] text-white shadow-md shadow-[#3D5AFE]/30 scale-105'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Header & Title */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                      currentQ.difficulty === 'advanced'
                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        : currentQ.difficulty === 'intermediate'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h4>
              </div>

              {/* Code Snippet Box (if available) */}
              {currentQ.codeSnippet && (
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#3D5AFE]/10 border-[#3D5AFE] text-slate-900 dark:text-white shadow-sm ring-1 ring-[#3D5AFE]'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#3D5AFE] text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {optionLetter}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Quiz Evaluation & Results View */
            <div className="space-y-6">
              {/* Result Overview Banner */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border text-center space-y-3 relative overflow-hidden ${
                  result.verified
                    ? 'bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30'
                    : 'bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30'
                }`}
              >
                <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-slate-900 border shadow-md">
                  {result.verified ? (
                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                  )}
                </div>

                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {result.verified ? 'Skill Verification Passed!' : 'Assessment Incomplete'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {result.verified
                      ? `Congratulations! You unlocked the verified ${result.proficiency} badge for ${result.skillName}.`
                      : `You scored ${result.score}%. You need at least ${result.passingScore}% to earn the verified badge.`}
                  </p>
                </div>

                {/* Score Big Display */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Your Score</span>
                    <span
                      className={`text-3xl font-black ${
                        result.verified ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {result.score}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-700" />
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Correct Answers</span>
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-200">
                      {result.correctAnswers}/{result.totalQuestions}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-700" />
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Proficiency</span>
                    <span className="text-xl font-extrabold text-[#3D5AFE] dark:text-[#8098FF]">
                      {result.proficiency}
                    </span>
                  </div>
                </div>

                {result.verified && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (onViewCertificate) {
                          onViewCertificate({
                            skillName: result.skillName,
                            category: result.category,
                            score: result.score,
                            proficiency: result.proficiency,
                            credentialHash: result.credentialHash,
                            issueDate: result.issueDate,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:opacity-95 cursor-pointer transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>View Credential Certificate</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Detailed Breakdown Section */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#3D5AFE]" />
                  Question Review & Technical Explanations
                </h5>

                <div className="space-y-3">
                  {result.evaluations.map((ev, idx) => (
                    <div
                      key={ev.questionId}
                      className={`p-4 rounded-2xl border ${
                        ev.isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20'
                          : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {ev.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1.5 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                            {idx + 1}. {ev.question}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            <strong>Explanation:</strong> {ev.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          {!result ? (
            <>
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {answeredCount}/{totalQuestions} Answered
              </div>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D5AFE] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 cursor-pointer transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-50 cursor-pointer transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'Evaluating...' : 'Submit Assessment'}</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-end gap-3">
              {!result.verified && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setSecondsRemaining(quiz.track.durationMinutes * 60);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#3D5AFE] text-white text-xs sm:text-sm font-semibold hover:opacity-95 cursor-pointer transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
