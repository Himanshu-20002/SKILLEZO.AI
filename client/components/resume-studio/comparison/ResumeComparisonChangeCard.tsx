'use client';

import React from 'react';
import {
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { ComparisonChangeVM } from '@/types/resume-comparison-view.types';

export interface ResumeComparisonChangeCardProps {
  change: ComparisonChangeVM;
  onOpenEvidence: (changeId: string) => void;
  onNavigateToResume: (change: ComparisonChangeVM) => void;
}

export const ResumeComparisonChangeCard: React.FC<ResumeComparisonChangeCardProps> = ({
  change,
  onOpenEvidence,
  onNavigateToResume,
}) => {
  const getChangeTypeBadge = () => {
    switch (change.changeType) {
      case 'PROMOTED':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'REWRITTEN':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'EDITED':
      case 'USER_EDIT':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'EXCLUDED':
      case 'REMOVED':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'ADDED':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const hasEvidence = change.evidence && change.evidence.length > 0;

  return (
    <div
      data-testid={`comparison-change-card-${change.id}`}
      className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-3.5"
    >
      {/* Top Header: Section, Change Type & Provenance */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {change.section}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getChangeTypeBadge()}`}
          >
            {change.changeType}
          </span>

          {change.isCandidateCustomized && (
            <span
              data-testid="candidate-customized-badge"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
            >
              <UserCheck className="w-3 h-3" aria-hidden="true" />
              <span>Customized by Candidate</span>
            </span>
          )}

          {change.source === 'UNATTRIBUTED' && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Unattributed Change
            </span>
          )}
        </div>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
          {change.title}
        </span>
      </div>

      {/* Side-by-Side Value Comparison Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Master Value */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Master Resume</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed break-words">
            {change.masterValueFormatted || <span className="italic text-slate-400">None</span>}
          </div>
        </div>

        {/* Tailored Value */}
        <div className="p-3 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <span>Tailored Variant</span>
          </div>
          <div className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-mono leading-relaxed break-words font-medium">
            {change.tailoredValueFormatted || <span className="italic text-slate-400">None</span>}
          </div>
        </div>
      </div>

      {/* Strategic Rationale & Linked Requirement */}
      {(change.proposalTitle || change.reason || change.requirementName) && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-1.5 text-xs">
          {change.proposalTitle && (
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
              <span>{change.proposalTitle}</span>
            </div>
          )}

          {change.reason && (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
              {change.reason}
            </p>
          )}

          {change.requirementName && (
            <div className="flex items-center gap-2 pt-1 pl-5 flex-wrap">
              <span className="text-slate-400 text-[11px]">Requirement:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                <span>{change.requirementName}</span>
              </span>
              {change.matchState && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {change.matchState}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions: View Evidence & View in Resume */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          {hasEvidence ? (
            <button
              type="button"
              data-testid={`view-evidence-btn-${change.id}`}
              onClick={() => onOpenEvidence(change.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View Evidence ({change.evidence.length})</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 italic">No evidence attached</span>
          )}
        </div>

        {change.canNavigateToResume && (
          <button
            type="button"
            data-testid={`view-in-resume-btn-${change.id}`}
            onClick={() => onNavigateToResume(change)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>View in Resume</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
