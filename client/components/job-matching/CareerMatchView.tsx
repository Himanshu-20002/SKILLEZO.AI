"use client";

import React, { useEffect } from "react";
import { useJobMatch, MatchFilterTab } from "@/hooks/useJobMatch";
import { CareerMatchSummary } from "./CareerMatchSummary";
import { RequirementMatchCard } from "./RequirementMatchCard";
import {
  ArrowLeft,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface CareerMatchViewProps {
  jobProfileId: string;
  jobTitle: string;
  company?: string | null;
  onBack: () => void;
  onProceedToTailoring?: () => void;
}

export const CareerMatchView: React.FC<CareerMatchViewProps> = ({
  jobProfileId,
  jobTitle,
  company,
  onBack,
  onProceedToTailoring,
}) => {
  const {
    matchResult,
    loading,
    error,
    filter,
    setFilter,
    requiredOnly,
    setRequiredOnly,
    searchQuery,
    setSearchQuery,
    filteredMatches,
    loadMatch,
    runMatch,
  } = useJobMatch(jobProfileId);

  useEffect(() => {
    loadMatch(jobProfileId);
  }, [jobProfileId, loadMatch]);

  const tabs: Array<{ key: MatchFilterTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: "ALL", label: "All Requirements", icon: Filter },
    { key: "PROVEN", label: "Proven", icon: CheckCircle2 },
    { key: "UNDERREPRESENTED", label: "Underrepresented", icon: Layers },
    { key: "RELATED", label: "Related", icon: AlertTriangle },
    { key: "MISSING", label: "Missing", icon: XCircle },
  ];

  if (loading && !matchResult) {
    return (
      <div className="py-16 text-center max-w-sm mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Matching Career Evidence
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Evaluating your verified Career Profile against the {jobTitle} requirements...
        </p>
      </div>
    );
  }

  if (error && !matchResult) {
    return (
      <div className="py-12 text-center max-w-sm mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Matching Failed
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error}
        </p>
        <button
          type="button"
          onClick={() => runMatch(jobProfileId)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Back to Job Intelligence Summary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Phase 6B Evidence Match
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {jobTitle} {company ? `— ${company}` : ""}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => runMatch(jobProfileId)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Matching..." : "Re-Run Match"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Match Summary Cards */}
      {matchResult && (
        <CareerMatchSummary
          matchResult={matchResult}
          onRefresh={() => runMatch(jobProfileId)}
          refreshing={loading}
        />
      )}

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Required Only Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={requiredOnly}
              onChange={(e) => setRequiredOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Required Only</span>
          </label>

          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requirements..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Requirement Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No requirements match the active filter or search criteria.
          </div>
        ) : (
          filteredMatches.map((match) => (
            <RequirementMatchCard key={match.requirementId} match={match} />
          ))
        )}
      </div>

      {/* 5. Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredMatches.length} of {matchResult?.summary.totalRequirements || 0} requirements.
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Back to JD Analysis
          </button>

          <button
            type="button"
            onClick={onProceedToTailoring}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Tailoring Plan (Phase 6C) →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
