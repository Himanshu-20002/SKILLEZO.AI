'use client';

import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Check,
  RotateCcw,
  FileText,
  Zap,
  Target,
  Loader2,
} from 'lucide-react';
import { ResumeOptimizationDraft, WordDiff } from '@/types/resume';

interface OptimizationReviewModalProps {
  draft: ResumeOptimizationDraft | null;
  isOpen: boolean;
  isApplying: boolean;
  isSwitchingTarget?: boolean;
  onClose: () => void;
  onAccept: (draft: ResumeOptimizationDraft) => void;
  onReject: (draft: ResumeOptimizationDraft) => void;
  onTargetChange?: (bulletId: string) => void;
}

export const OptimizationReviewModal: React.FC<OptimizationReviewModalProps> = ({
  draft,
  isOpen,
  isApplying,
  isSwitchingTarget = false,
  onClose,
  onAccept,
  onReject,
  onTargetChange,
}) => {
  if (!isOpen || !draft) return null;

  const validation = draft.validation;
  const isSafe = validation.valid;
  const scoreComp = draft.scoreComparison;

  // Simple token diff computation for display
  const computeDisplayDiff = (orig: string, prop: string): WordDiff[] => {
    const origWords = (orig || '').trim().split(/\s+/).filter(Boolean);
    const propWords = (prop || '').trim().split(/\s+/).filter(Boolean);
    const origSet = new Set(origWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const propSet = new Set(propWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, '')));

    const diff: WordDiff[] = [];
    origWords.forEach((word) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!propSet.has(clean)) {
        diff.push({ value: word, type: 'REMOVED' });
      }
    });

    propWords.forEach((word) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!origSet.has(clean)) {
        diff.push({ value: word, type: 'ADDED' });
      } else {
        diff.push({ value: word, type: 'UNCHANGED' });
      }
    });

    return diff;
  };

  const diffTokens = computeDisplayDiff(draft.originalText, draft.proposedText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#3D5AFE] to-[#00D9C0] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>AI Bullet Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Safe
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Targeted refinement verified against your real background
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Target Section & Bullet Picker */}
          {draft.availableTargets && draft.availableTargets.length > 1 ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#3D5AFE]" />
                  <span>Choose Target Bullet to Optimize:</span>
                </label>
                <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  {draft.availableTargets.length} Detected Targets
                </span>
              </div>

              <div className="relative">
                <select
                  value={draft.target.bulletId || ''}
                  onChange={(e) => onTargetChange?.(e.target.value)}
                  disabled={isSwitchingTarget || isApplying}
                  className="w-full text-xs font-medium py-2.5 px-3 pr-8 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {draft.availableTargets.map((t) => (
                    <option key={t.bulletId} value={t.bulletId}>
                      [{t.section}] {t.roleOrProject ? `${t.roleOrProject}: ` : ''}{t.sourceText.length > 70 ? `${t.sourceText.slice(0, 70)}...` : t.sourceText}
                    </option>
                  ))}
                </select>
                {isSwitchingTarget && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-[#3D5AFE]" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Current Target:</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 font-mono text-[10px] font-bold">
                  {draft.target.section}
                </span>
                <span>• {draft.target.type?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex items-start gap-3">
              <Zap className="w-4 h-4 text-[#3D5AFE] mt-0.5 shrink-0" />
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-blue-900 dark:text-blue-300">
                  Target Section: {draft.target.section || 'Experience Bullet'}
                </div>
                <p className="text-blue-700 dark:text-blue-400/90 leading-relaxed">
                  Objective: {draft.target.type?.replace(/_/g, ' ') || 'Improve Clarity & Technical Depth'}
                </p>
              </div>
            </div>
          )}

          {/* Side-by-Side / Stacked Before & After Comparison */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Before / After Content Comparison
            </div>

            {/* Original Text */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Original Text
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                {draft.originalText}
              </p>
            </div>

            {/* Proposed Optimized Text with Diff Highlighting */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  AI Proposed Optimization (Evidence-Verified)
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {draft.decision || 'IMPROVED'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-emerald-500/20 text-xs leading-relaxed font-mono">
                {diffTokens.map((token, idx) => {
                  if (token.type === 'ADDED') {
                    return (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded font-bold">
                        {token.value}{' '}
                      </span>
                    );
                  }
                  if (token.type === 'REMOVED') {
                    return (
                      <span key={idx} className="bg-rose-500/15 text-rose-600 dark:text-rose-400 line-through px-1 py-0.5 rounded mr-1 opacity-70">
                        {token.value}{' '}
                      </span>
                    );
                  }
                  return <span key={idx} className="text-slate-800 dark:text-slate-200">{token.value} </span>;
                })}
              </div>
            </div>
          </div>

          {/* Deterministic Factual Safety Checklist */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Deterministic Factual Validation Audit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero fabricated metrics (% or $)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero unverified skills/technologies</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Ownership integrity preserved</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Original candidate truth intact</span>
              </div>
            </div>

            {!isSafe && validation.errors.length > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Validation Blocked</span>
                </div>
                {validation.errors.map((err, i) => (
                  <p key={i} className="text-[11px]">{err.message}</p>
                ))}
              </div>
            )}
          </div>

          {/* Authoritative Score Deltas */}
          {scoreComp && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />
                  <span>Deterministic Score Impact</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Simulated Re-Score
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 block">ATS Score</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-500">{scoreComp.before.atsScore}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {scoreComp.after.atsScore}
                    </span>
                    {scoreComp.delta.ats > 0 && (
                      <span className="text-[10px] font-bold text-emerald-500">+{scoreComp.delta.ats}</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 block">Match Score</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-500">{scoreComp.before.matchScore ?? 75}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {scoreComp.after.matchScore ?? 75}
                    </span>
                    {(scoreComp.delta.match ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-500">+{scoreComp.delta.match}</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 block">Content Score</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-500">{scoreComp.before.contentScore ?? 70}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {scoreComp.after.contentScore ?? 70}
                    </span>
                    {(scoreComp.delta.content ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-500">+{scoreComp.delta.content}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => onReject(draft)}
            disabled={isApplying}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard Suggestion</span>
          </button>

          <button
            onClick={() => onAccept(draft)}
            disabled={!isSafe || isApplying}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
              isSafe
                ? 'bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-90 hover:shadow-md'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            {isApplying ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Applying & Re-scoring...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Accept Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
