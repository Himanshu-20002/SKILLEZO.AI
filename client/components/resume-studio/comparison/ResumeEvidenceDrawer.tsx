'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  Quote,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ComparisonEvidenceDrawerVM } from '@/types/resume-comparison-view.types';

export interface ResumeEvidenceDrawerProps {
  isOpen: boolean;
  drawerVM: ComparisonEvidenceDrawerVM | null;
  onClose: () => void;
  onNavigateToResume?: () => void;
}

export const ResumeEvidenceDrawer: React.FC<ResumeEvidenceDrawerProps> = ({
  isOpen,
  drawerVM,
  onClose,
  onNavigateToResume,
}) => {
  if (!isOpen) return null;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return <FolderGit2 className="w-4 h-4 text-indigo-500" aria-hidden="true" />;
      case 'EDUCATION':
        return <GraduationCap className="w-4 h-4 text-emerald-500" aria-hidden="true" />;
      case 'SKILL':
      case 'CERTIFICATION':
        return <Award className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      case 'EXPERIENCE':
      default:
        return <Briefcase className="w-4 h-4 text-blue-500" aria-hidden="true" />;
    }
  };

  const hasEvidence = drawerVM?.evidence && drawerVM.evidence.length > 0;

  return (
    <div
      data-testid="resume-evidence-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Verified Evidence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
              {drawerVM?.title || 'Selected Change'}
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="evidence-drawer-close-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close evidence drawer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Anti-Hallucination Disclaimer */}
        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <Info className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            Verified evidence from your Career Profile. SKILLEZO refuses to hallucinate ungrounded
            claims.
          </p>
        </div>

        {/* Change Context */}
        {drawerVM && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Change Rationale
            </div>
            {drawerVM.proposalTitle && (
              <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                {drawerVM.proposalTitle}
              </div>
            )}
            {drawerVM.reason && (
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {drawerVM.reason}
              </div>
            )}
            {drawerVM.requirementName && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Requirement:</span>
                <span className="px-2 py-0.5 rounded font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {drawerVM.requirementName}
                </span>
                {drawerVM.matchState && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {drawerVM.matchState}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Evidence Items */}
        {hasEvidence ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Supporting Career Proof ({drawerVM.evidence.length})
            </div>

            {drawerVM.evidence.map((ev, index) => (
              <div
                key={`${ev.sourceId}-${index}`}
                data-testid={`evidence-item-${index}`}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(ev.sourceType)}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {ev.label}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {ev.sourceType}
                  </span>
                </div>

                {ev.excerpt ? (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-2 leading-relaxed">
                    <Quote className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
                    <span>&ldquo;{ev.excerpt}&rdquo;</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No excerpt available</span>
                )}

                <div className="text-[10px] text-slate-400 font-mono">
                  Evidence ID: {ev.sourceId}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            data-testid="evidence-drawer-empty"
            className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Details unavailable
            </p>
            <p className="text-xs text-slate-400 mt-1">
              No verified career profile evidence is linked to this change.
            </p>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      {drawerVM?.canNavigateToResume && onNavigateToResume && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            type="button"
            data-testid="evidence-drawer-view-in-resume-btn"
            onClick={onNavigateToResume}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <span>View in Resume Studio</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
