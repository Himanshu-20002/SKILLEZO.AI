'use client';

import React, { useState } from 'react';
import {
  ActionProposal,
  ActionResult,
  actionService,
} from '@/services/action.service';
import { ActionResultBanner } from './ActionResultBanner';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileCheck2,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

interface ActionProposalModalProps {
  proposal: ActionProposal;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: (result: ActionResult) => void;
}

export const ActionProposalModal: React.FC<ActionProposalModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onActionComplete,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<ActionResult | null>(
    proposal.result || null
  );

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    try {
      const result = await actionService.approveProposal(proposal.proposalId);
      setCompletedResult(result);
      onActionComplete?.(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to approve and execute action.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    setError(null);
    try {
      await actionService.rejectProposal(proposal.proposalId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject action proposal.');
    } finally {
      setIsRejecting(false);
    }
  };

  const renderContentComparison = () => {
    const before = proposal.preview?.before;
    const after = proposal.preview?.after;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Proposed Change Preview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* BEFORE */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Before (Current)
              </span>
              {proposal.targetEntity.version !== undefined && (
                <span className="text-[10px] font-mono text-slate-400">
                  v{proposal.targetEntity.version}
                </span>
              )}
            </div>
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-wrap break-words">
              {typeof before === 'string'
                ? before
                : JSON.stringify(before, null, 2)}
            </div>
          </div>

          {/* AFTER */}
          <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                After (Proposed)
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                Verified Change
              </span>
            </div>
            <div className="text-slate-900 dark:text-slate-100 leading-relaxed font-mono text-[11px] whitespace-pre-wrap break-words">
              {typeof after === 'string'
                ? after
                : JSON.stringify(after, null, 2)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {proposal.title}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {proposal.actionType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {proposal.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Completed Banner if already approved */}
          {completedResult ? (
            <ActionResultBanner
              result={completedResult}
              onDismiss={onClose}
            />
          ) : (
            <>
              {/* Rationale & Evidence */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rationale & Grounding
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {proposal.rationale}
                </p>

                {proposal.evidenceIds && proposal.evidenceIds.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400">
                      Supporting Evidence:
                    </span>
                    {proposal.evidenceIds.map((id, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-indigo-500"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Before vs After comparison */}
              {renderContentComparison()}

              {/* Strict Approval Boundary Advisory */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Explicit User Approval Required:</strong> AI provides reasoning and proposes changes. No database mutation will occur without your explicit approval.
                </p>
              </div>

              {/* Error Message if action execution fails */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Action Execution Blocked</p>
                    <p className="text-[11px] mt-0.5">{error}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        {!completedResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={handleReject}
              disabled={isApproving || isRejecting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isRejecting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Rejecting...
                </span>
              ) : (
                'Reject Proposal'
              )}
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Executing Mutation...
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  Approve Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
