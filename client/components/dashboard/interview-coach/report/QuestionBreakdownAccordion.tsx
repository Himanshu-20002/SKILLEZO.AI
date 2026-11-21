'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Tag,
  CornerDownRight,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Quote,
  Lightbulb,
  Lock,
} from 'lucide-react';
import {
  InterviewQuestion,
  InterviewAnswer,
  InterviewEvaluation,
} from '@/types/interview-coach';

export interface QuestionEvaluationItem {
  question: InterviewQuestion;
  answer?: InterviewAnswer;
  evaluation?: InterviewEvaluation;
}

export interface QuestionBreakdownAccordionProps {
  items: QuestionEvaluationItem[];
  isPro?: boolean;
}

export const QuestionBreakdownAccordion: React.FC<QuestionBreakdownAccordionProps> = ({
  items = [],
  isPro = true,
}) => {
  // Default open the first question
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({
    0: true,
  });

  // Ensure the first question is open whenever items are loaded/changed
  useEffect(() => {
    if (items.length > 0) {
      setExpandedIndices((prev) => {
        if (Object.keys(prev).length === 0) {
          return { 0: true };
        }
        return prev;
      });
    }
  }, [items.length]);

  const toggleIndex = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const next: Record<number, boolean> = {};
    items.forEach((_, idx) => {
      next[idx] = true;
    });
    setExpandedIndices(next);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      {/* Header Bar with Expand / Collapse Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            <span>Question-by-Question Deep Dive</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review your spoken responses, dimension ratings, AI critique, and senior model answers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold print:hidden">
          <button
            type="button"
            onClick={expandAll}
            disabled={items.length === 0}
            data-testid="btn-expand-all"
            className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={collapseAll}
            disabled={items.length === 0}
            data-testid="btn-collapse-all"
            className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-6 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Questions Recorded for This Session
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              This session was completed or ended before questions could be populated. Start a new mock interview session to practice questions and receive detailed evaluation.
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const isExpanded = Boolean(expandedIndices[idx]);
          const q = item.question;
          const ans = item.answer;
          const ev = item.evaluation;

          // Compute average score for this specific question if available
          const scores = ev?.scores;
          let questionAvgScore: number | null = null;
          if (scores) {
            const vals = Object.values(scores).filter((v) => typeof v === 'number');
            if (vals.length > 0) {
              questionAvgScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            }
          }

          const isFollowUp = Boolean(q.parentQuestionId);

          return (
            <div
              key={q._id || idx}
              data-testid={`question-accordion-item-${q.sequence}`}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 transition-all"
            >
              {/* Collapsible Header */}
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                data-testid={`btn-toggle-question-${q.sequence}`}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0 pr-4">
                  {/* Sequence pill */}
                  {isFollowUp ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                      <CornerDownRight className="h-3 w-3" />
                      Follow-Up
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60">
                      Question {q.sequence}
                    </span>
                  )}

                  {/* Category */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span>{q.category}</span>
                  </span>

                  {/* Question Short Text Preview */}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                    {q.questionText}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {questionAvgScore !== null && (
                    <span
                      data-testid={`question-score-${q.sequence}`}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        questionAvgScore >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : questionAvgScore >= 65
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {questionAvgScore}/100
                    </span>
                  )}

                  <div className="p-1 rounded-lg text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content Body */}
              {isExpanded && (
                <div className="p-5 pt-0 space-y-5 border-t border-slate-200/60 dark:border-slate-800/60">
                  {/* Full Question Text */}
                  <div className="pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {q.questionText}
                    </h3>
                    {q.expectedConcepts && q.expectedConcepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.expectedConcepts.map((c, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Candidate's Submitted Response */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Your Response</span>
                    </div>

                    <p
                      data-testid={`candidate-answer-text-${q.sequence}`}
                      className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap"
                    >
                      {ans?.answerText || ans?.transcriptText || (
                        <span className="italic text-slate-400">
                          No response was submitted for this question (skipped).
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Question-Level Dimension Scores */}
                  {scores && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900 p-2 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(scores.technicalAccuracy)}%</span>
                      </div>
                      <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900 p-2 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Depth</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(scores.problemSolvingDepth)}%</span>
                      </div>
                      <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900 p-2 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Structure</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(scores.answerStructure)}%</span>
                      </div>
                      <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900 p-2 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Coverage</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(scores.conceptCoverage)}%</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-100/80 dark:bg-slate-900 p-2 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Fluency</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(scores.communicationTone)}%</span>
                      </div>
                    </div>
                  )}

                  {/* AI Critique & Highlighted Evidence */}
                  {ev && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Question Strengths */}
                      {ev.strengths && ev.strengths.length > 0 && (
                        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5">
                          <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>What Worked</span>
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {ev.strengths.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5 leading-relaxed">
                                <span className="mt-1 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Question Improvements */}
                      {ev.improvementAreas && ev.improvementAreas.length > 0 && (
                        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3.5">
                          <span className="block text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            <span>Recommended Tweaks</span>
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {ev.improvementAreas.map((imp, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-1.5 leading-relaxed">
                                <span className="mt-1 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quoted Candidate Evidence */}
                  {ev?.evidence && ev.evidence.length > 0 && (
                    <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/70 p-3.5 border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Quote className="h-3 w-3 text-slate-400" />
                        <span>Evaluated Candidate Quotes</span>
                      </span>
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 italic">
                        {ev.evidence.map((quote, qIdx) => (
                          <p key={qIdx} className="leading-relaxed">
                            "{quote}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Senior Engineer Model Answer */}
                  {ev?.modelAnswerSuggestion && (
                    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white p-4.5 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Senior Engineer Model Answer (Gold Standard)
                          </h4>
                        </div>
                        {!isPro && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                            <Lock className="h-2.5 w-2.5" />
                            PRO ONLY
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <p
                          data-testid={`model-answer-${q.sequence}`}
                          className={`text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap pl-1 transition-all ${
                            !isPro ? 'select-none filter blur-[5px] opacity-30 pointer-events-none' : ''
                          }`}
                        >
                          {ev.modelAnswerSuggestion}
                        </p>

                        {/* Paywall Overlay for Free Tier */}
                        {!isPro && (
                          <div
                            data-testid={`paywall-teaser-${q.sequence}`}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 rounded-xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-xs border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md mb-2">
                              <Lock className="h-4.5 w-4.5" />
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                              Unlock Staff Engineer Model Answer
                            </h5>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm mb-3">
                              See how Senior & Principal engineers structure their responses with architectural trade-offs and edge-case handling.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <Link
                                href="/dashboard/billing"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Get 7-Day Sprint Pass (₹199)</span>
                              </Link>
                              <Link
                                href="/dashboard/billing"
                                className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                              >
                                <span>Pro (₹499/mo)</span>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
};
