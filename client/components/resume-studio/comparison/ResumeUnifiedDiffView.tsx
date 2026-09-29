'use client';

import React from 'react';
import { Minus, Plus, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { ComparisonChangeVM, ResumeComparisonViewModel } from '@/types/resume-comparison-view.types';

export interface ResumeUnifiedDiffViewProps {
  viewModel: ResumeComparisonViewModel;
  onOpenEvidence: (changeId: string) => void;
  onNavigateToResume: (change: ComparisonChangeVM) => void;
}

export const ResumeUnifiedDiffView: React.FC<ResumeUnifiedDiffViewProps> = ({
  viewModel,
  onOpenEvidence,
  onNavigateToResume,
}) => {
  return (
    <div data-testid="resume-unified-diff-view" className="flex flex-col gap-4">
      {viewModel.allChanges.map((change) => {
        const hasEvidence = change.evidence && change.evidence.length > 0;

        return (
          <div
            key={change.id}
            data-testid={`unified-diff-card-${change.id}`}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
          >
            {/* Diff Card Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {change.section}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {change.title}
                </span>
                <span className="text-xs text-slate-400">({change.changeType})</span>
              </div>

              <div className="flex items-center gap-2">
                {hasEvidence && (
                  <button
                    type="button"
                    onClick={() => onOpenEvidence(change.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Evidence</span>
                  </button>
                )}

                {change.canNavigateToResume && (
                  <button
                    type="button"
                    onClick={() => onNavigateToResume(change)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="View in Resume"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Unified Diff Content: Pure AST Stored Values */}
            <div className="p-3 font-mono text-xs space-y-1.5 overflow-x-auto bg-slate-900 text-slate-100 dark:bg-slate-950">
              {/* Deleted / Old Master Value */}
              {change.masterValueFormatted && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-900/40">
                  <Minus className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="whitespace-pre-wrap break-words leading-relaxed">
                    {change.masterValueFormatted}
                  </span>
                </div>
              )}

              {/* Added / New Tailored Value */}
              {change.tailoredValueFormatted && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-900/40">
                  <Plus className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="whitespace-pre-wrap break-words leading-relaxed font-semibold">
                    {change.tailoredValueFormatted}
                  </span>
                </div>
              )}
            </div>

            {/* Proposal Rationale Footer if available */}
            {change.reason && (
              <div className="p-3 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{change.reason}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
