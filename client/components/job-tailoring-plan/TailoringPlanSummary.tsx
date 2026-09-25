"use client";

import React from "react";
import { TailoringPlanSummary as ITailoringPlanSummary } from "@/types/tailoring-plan.types";
import {
  CheckCircle2,
  Clock,
  Edit3,
  XCircle,
  ShieldAlert,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface TailoringPlanSummaryProps {
  summary: ITailoringPlanSummary;
  onAcceptAll: () => void;
  onResetAll: () => void;
  disabled?: boolean;
}

export const TailoringPlanSummary: React.FC<TailoringPlanSummaryProps> = ({
  summary,
  onAcceptAll,
  onResetAll,
  disabled = false,
}) => {
  const actionableTotal = summary.totalProposals - summary.protectedCount;
  const reviewedCount = summary.acceptedCount + summary.editedCount + summary.rejectedCount;
  const progressPercent = actionableTotal > 0 ? Math.round((reviewedCount / actionableTotal) * 100) : 100;

  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
      {/* Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>Tailoring Review Status</span>
            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
              ({reviewedCount}/{actionableTotal} decided)
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Review every proposal before finalizing. Your resume will only reflect approved changes.
          </p>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2">
          {summary.pendingCount > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={onAcceptAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept All Pending ({summary.pendingCount})</span>
            </button>
          )}

          {reviewedCount > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={onResetAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              title="Reset all non-protected decisions to Pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <span>Review Completion</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {/* Pending */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Pending</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {summary.pendingCount}
          </div>
        </div>

        {/* Accepted */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Accepted</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {summary.acceptedCount}
          </div>
        </div>

        {/* Edited */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Custom Edit</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {summary.editedCount}
          </div>
        </div>

        {/* Rejected */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Rejected</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {summary.rejectedCount}
          </div>
        </div>

        {/* Protected Shields */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-medium">Protected Shields</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {summary.protectedCount}
          </div>
        </div>
      </div>
    </div>
  );
};
