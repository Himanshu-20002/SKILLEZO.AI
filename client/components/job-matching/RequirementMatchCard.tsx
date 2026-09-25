"use client";

import React, { useState } from "react";
import { JobRequirementMatchDTO, MatchState } from "@/types/job-match.types";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  ShieldCheck,
  Info,
} from "lucide-react";

interface RequirementMatchCardProps {
  match: JobRequirementMatchDTO;
}

export const RequirementMatchCard: React.FC<RequirementMatchCardProps> = ({ match }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (state: MatchState) => {
    switch (state) {
      case "PROVEN_RELEVANT":
        return {
          icon: CheckCircle2,
          text: "Proven Relevant",
          className:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
          cardBorder: "border-slate-200/80 dark:border-slate-800/80",
        };
      case "PROVEN_UNDERREPRESENTED":
        return {
          icon: Layers,
          text: "Underrepresented",
          className:
            "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
          cardBorder: "border-blue-200/60 dark:border-blue-900/40",
        };
      case "RELATED_EVIDENCE":
        return {
          icon: AlertTriangle,
          text: "Related Evidence",
          className:
            "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          cardBorder: "border-amber-200/60 dark:border-amber-900/40",
        };
      case "PARTIAL_MATCH":
        return {
          icon: AlertTriangle,
          text: "Partial Match",
          className:
            "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          cardBorder: "border-amber-200/60 dark:border-amber-900/40",
        };
      case "INSUFFICIENT_EVIDENCE":
        return {
          icon: Info,
          text: "Insufficient Evidence",
          className:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
          cardBorder: "border-slate-200 dark:border-slate-800",
        };
      case "MISSING":
      default:
        return {
          icon: XCircle,
          text: "Missing",
          className:
            "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
          cardBorder: "border-slate-200/80 dark:border-slate-800/80",
        };
    }
  };

  const badge = getStatusBadge(match.matchState);
  const StatusIcon = badge.icon;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "EXPERIENCE":
        return Briefcase;
      case "PROJECT":
        return FolderGit2;
      case "EDUCATION":
        return GraduationCap;
      case "SKILL":
      default:
        return Wrench;
    }
  };

  return (
    <div
      className={`rounded-2xl border ${badge.cardBorder} bg-white dark:bg-slate-900/60 p-4 transition-all hover:shadow-xs`}
    >
      {/* 1. Header: Name, Category, Importance, Match Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {match.name}
            </h4>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
              {match.category}
            </span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                match.importance === "REQUIRED"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                  : match.importance === "PREFERRED"
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {match.importance}
            </span>
          </div>

          {match.explanation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {match.explanation}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${badge.className}`}
          >
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{badge.text}</span>
          </span>

          {match.evidence.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? "Hide Evidence Details" : "View Career Evidence"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Special Warning for RELATED_EVIDENCE */}
      {match.matchState === "RELATED_EVIDENCE" && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Boundary Guard:</strong> Adjacent competency found. Does not prove hands-on proficiency with {match.name}.
          </span>
        </div>
      )}

      {/* 3. Special Warning for MISSING */}
      {match.matchState === "MISSING" && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>No candidate evidence found. SKILLEZO will not add this claim to your resume.</span>
        </div>
      )}

      {/* 4. Expandable Authentic Career Evidence Drawer */}
      {isExpanded && match.evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Verified Career Evidence ({match.evidence.length})</span>
          </div>

          <div className="space-y-2">
            {match.evidence.map((ev, idx) => {
              const SourceIcon = getSourceIcon(ev.sourceType);
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                    <SourceIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{ev.label}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-auto">
                      {ev.sourceType}
                    </span>
                  </div>
                  {ev.excerpt && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pl-5 font-sans leading-relaxed">
                      &ldquo;{ev.excerpt}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
