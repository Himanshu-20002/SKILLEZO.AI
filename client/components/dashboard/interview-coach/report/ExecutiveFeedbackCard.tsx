'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, Compass, Sparkles } from 'lucide-react';

export interface ExecutiveFeedbackCardProps {
  strengths: string[];
  improvementAreas: string[];
  recommendations?: string[];
}

export const ExecutiveFeedbackCard: React.FC<ExecutiveFeedbackCardProps> = ({
  strengths = [],
  improvementAreas = [],
  recommendations = [],
}) => {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <span>Executive Coaching Feedback</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synthesized AI evaluation of your demonstrated proficiencies and highest-leverage improvement targets.
        </p>
      </div>

      {/* Dual Column Grid: Strengths vs Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Strengths */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Demonstrated Strengths
            </h3>
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((str, idx) => (
                <li
                  key={idx}
                  data-testid="feedback-strength-item"
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific strengths recorded.</p>
          )}
        </div>

        {/* Right Column: Growth Opportunities */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Priority Focus Areas
            </h3>
          </div>

          {improvementAreas.length > 0 ? (
            <ul className="space-y-3">
              {improvementAreas.map((area, idx) => (
                <li
                  key={idx}
                  data-testid="feedback-improvement-item"
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No critical improvement areas identified.</p>
          )}
        </div>
      </div>

      {/* Strategic Preparation Roadmap / Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Actionable Preparation Roadmap
            </h3>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                <Lightbulb className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
