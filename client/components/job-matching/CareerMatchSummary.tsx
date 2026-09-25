"use client";

import React from "react";
import { JobMatchResultDTO } from "@/types/job-match.types";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  XCircle,
  HelpCircle,
  Clock,
} from "lucide-react";

interface CareerMatchSummaryProps {
  matchResult: JobMatchResultDTO;
  onRefresh: () => Promise<unknown>;
  refreshing?: boolean;
}

export const CareerMatchSummary: React.FC<CareerMatchSummaryProps> = ({
  matchResult,
  onRefresh,
  refreshing = false,
}) => {
  const { summary, isStale, overallMatch, updatedAt } = matchResult;

  const requiredCoveragePct =
    summary.requiredTotal > 0
      ? Math.round((summary.requiredProven / summary.requiredTotal) * 100)
      : 100;

  return (
    <div className="space-y-4">
      {/* 1. Stale Invalidation Warning Banner */}
      {isStale && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Match Results are Outdated
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Your Career Profile or Job Description has changed since this match was evaluated.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Match"}</span>
          </button>
        </div>
      )}

      {/* 2. Top-Level Explainable Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Primary Truthful Required Coverage Ratio */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Required Coverage
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              {requiredCoveragePct}% Met
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {summary.requiredProven}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {summary.requiredTotal} Required
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Verified authentic evidence establishes these essential qualifications.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${requiredCoveragePct}%` }}
            />
          </div>
        </div>

        {/* Card 2: Overall Qualifications Coverage */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Qualifications
            </span>
            {overallMatch && (
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{overallMatch.label}</span>
              </span>
            )}
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {summary.proven + summary.underrepresented}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {summary.totalRequirements} Total
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Includes both Required and Preferred skills found in your profile.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
              Evaluated {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Card 3: Categorized Breakdown Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Evidence Distribution
          </span>

          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {summary.proven}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Proven</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {summary.underrepresented}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Underrepresented</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {summary.related + summary.partial}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Related / Partial</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {summary.missing}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Missing</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Zero inferred skills. Unproven skills remain explicitly missing.
          </p>
        </div>
      </div>
    </div>
  );
};
