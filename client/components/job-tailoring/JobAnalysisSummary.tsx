"use client";

import React, { useState } from "react";
import {
  JobProfile,
  JobRequirementItem,
  JobRequirementImportance,
} from "@/types/job-profile.types";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Building2,
  Briefcase,
  Layers,
  Quote,
  Clock,
  Cpu,
  GraduationCap,
  Calendar,
  Tag,
  Info,
} from "lucide-react";

interface JobAnalysisSummaryProps {
  jobProfile: JobProfile;
  onReanalyze: () => Promise<unknown>;
  onReset: () => void;
  onProceedToMatch?: () => void;
  reanalyzing?: boolean;
}

export const JobAnalysisSummary: React.FC<JobAnalysisSummaryProps> = ({
  jobProfile,
  onReanalyze,
  onReset,
  onProceedToMatch,
  reanalyzing = false,
}) => {
  const analysis = jobProfile.analysis;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleEvidence = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const requirements = analysis?.requirements || [];
  const requiredList = requirements.filter((r) => r.importance === "REQUIRED");
  const preferredList = requirements.filter((r) => r.importance === "PREFERRED");
  const unknownList = requirements.filter((r) => r.importance === "UNKNOWN");

  const renderRequirementGroup = (
    title: string,
    items: JobRequirementItem[],
    importance: JobRequirementImportance,
    badgeColor: string,
    emptyMessage: string
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {title}
            </h5>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}
            >
              {items.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {items.map((req, idx) => {
            const key = `${importance}-${req.normalizedName}-${idx}`;
            const isExpanded = Boolean(expandedItems[key]);

            return (
              <div
                key={key}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {req.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {req.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleEvidence(key)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title={isExpanded ? "Hide Evidence Quote" : "View Cited Source Evidence"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Evidence Accordion */}
                {isExpanded && req.evidence?.text && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                      <Quote className="w-3 h-3" />
                      <span>Grounded Source Evidence</span>
                      {req.evidence.section && (
                        <span className="text-slate-400 font-normal">
                          ({req.evidence.section})
                        </span>
                      )}
                    </div>
                    <p className="italic text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                      &ldquo;{req.evidence.text}&rdquo;
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Confidence: {Math.round(req.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Metadata Card */}
      <div className="p-4.5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900/60 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                {analysis?.seniority || "ROLE INTELLIGENCE"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                v{jobProfile.analysisVersion} Analyzed
              </span>
              {jobProfile.analysisMetadata?.provider && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {jobProfile.analysisMetadata.provider}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{analysis?.normalizedRoleTitle || jobProfile.jobTitle}</span>
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
              {jobProfile.company && (
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {jobProfile.company}
                </span>
              )}
              {analysis?.domain && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {analysis.domain}
                </span>
              )}
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(jobProfile.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReanalyze}
              disabled={reanalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? "animate-spin" : ""}`} />
              <span>{reanalyzing ? "Re-Analyzing..." : "Re-Analyze"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Structured Requirements (Required, Preferred, and UNKNOWN Additional) */}
      <div className="space-y-5">
        {/* Required Skills & Qualifications */}
        {renderRequirementGroup(
          "Required Qualifications & Skills",
          requiredList,
          "REQUIRED",
          "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60",
          "No required qualifications extracted."
        )}

        {/* Preferred / Nice-to-Have Skills */}
        {renderRequirementGroup(
          "Preferred & Nice-to-Have",
          preferredList,
          "PREFERRED",
          "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60",
          "No preferred qualifications specified."
        )}

        {/* Additional Requirements (UNKNOWN importance) — never dropped! */}
        {renderRequirementGroup(
          "Additional Requirements",
          unknownList,
          "UNKNOWN",
          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60",
          "No additional unclassified requirements."
        )}
      </div>

      {/* 3. Responsibilities & Scope */}
      {analysis?.responsibilities && analysis.responsibilities.length > 0 && (
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Key Responsibilities</span>
          </h5>
          <ul className="space-y-1.5 pl-2">
            {analysis.responsibilities.map((resp, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Experience & Education Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis?.experienceRequirements && analysis.experienceRequirements.length > 0 && (
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Experience Requirements</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
              {analysis.experienceRequirements.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis?.educationRequirements && analysis.educationRequirements.length > 0 && (
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Education Requirements</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
              {analysis.educationRequirements.map((edu, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. Keywords Tag Cloud */}
      {analysis?.keywords && analysis.keywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Extracted JD Keywords</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Footer / Next Phase Action Bar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Job Profile saved to your library. Master resume remains untouched.</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Analyze Another JD
          </button>

          <button
            type="button"
            onClick={onProceedToMatch}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proceed to Role Match (Phase 6B)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
