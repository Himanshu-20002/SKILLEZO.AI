"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTailoringPlan, ProposalFilterSection } from "@/hooks/useTailoringPlan";
import { useTailoredResume } from "@/hooks/useTailoredResume";
import { TailoringIntensitySelector } from "./TailoringIntensitySelector";
import { TailoringPlanSummary } from "./TailoringPlanSummary";
import { ProposalCard } from "./ProposalCard";
import { DoNotAddSection } from "./DoNotAddSection";
import { ConfirmRegenerateModal } from "./ConfirmRegenerateModal";
import { TailoringReviewModal } from "./TailoringReviewModal";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Layers,
  FileText,
  Cpu,
  Briefcase,
  FolderGit2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Loader2,
} from "lucide-react";

interface TailoringPlanViewProps {
  jobProfileId: string;
  jobTitle: string;
  company?: string | null;
  onBack: () => void;
}

export const TailoringPlanView: React.FC<TailoringPlanViewProps> = ({
  jobProfileId,
  jobTitle,
  company,
  onBack,
}) => {
  const {
    plan,
    loading,
    regenerating,
    updatingProposalId,
    error,
    activeSection,
    setActiveSection,
    confirmRegenModalOpen,
    setConfirmRegenModalOpen,
    pendingIntensity,
    setPendingIntensity,
    reviewModalOpen,
    setReviewModalOpen,
    loadPlan,
    regeneratePlan,
    acceptProposal,
    rejectProposal,
    editProposal,
    batchAcceptAll,
    batchResetAll,
    filteredProposals,
    doNotAddProposals,
    isFullyReviewed,
  } = useTailoringPlan(jobProfileId);

  const router = useRouter();
  const { tailoredResume } = useTailoredResume({ jobProfileId, autoFetch: true });

  useEffect(() => {
    loadPlan(jobProfileId);
  }, [jobProfileId, loadPlan]);

  // Section tabs metadata
  const tabs: Array<{
    key: ProposalFilterSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    {
      key: "ALL",
      label: "Actionable Proposals",
      icon: Layers,
      count: plan && plan.summary ? (plan.summary.totalProposals || 0) - (plan.summary.protectedCount || 0) : 0,
    },
    {
      key: "SUMMARY",
      label: "Summary",
      icon: FileText,
      count: plan?.summary?.sectionBreakdown?.["SUMMARY"] || 0,
    },
    {
      key: "SKILLS",
      label: "Skills",
      icon: Cpu,
      count: Math.max(0, (plan?.summary?.sectionBreakdown?.["SKILLS"] || 0) - (doNotAddProposals.length || 0)),
    },
    {
      key: "EXPERIENCE",
      label: "Experience",
      icon: Briefcase,
      count: plan?.summary?.sectionBreakdown?.["EXPERIENCE"] || 0,
    },
    {
      key: "PROJECTS",
      label: "Projects",
      icon: FolderGit2,
      count: plan?.summary?.sectionBreakdown?.["PROJECTS"] || 0,
    },
    {
      key: "SECTION_ORDER",
      label: "Layout & Order",
      icon: Sliders,
      count: plan?.summary?.sectionBreakdown?.["SECTION_ORDER"] || 0,
    },
    {
      key: "DO_NOT_ADD",
      label: "Shielded Exclusions",
      icon: ShieldCheck,
      count: doNotAddProposals.length,
    },
  ];

  if (loading && !plan) {
    return (
      <div className="py-20 text-center max-w-sm mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Synthesizing Tailoring Plan
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Grounding resume proposals against verified career evidence for {jobTitle}...
        </p>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="py-12 text-center max-w-sm mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Tailoring Plan Error
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{error}</p>
        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Back to Match
          </button>
          <button
            type="button"
            onClick={() => loadPlan(jobProfileId)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Job Context & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Career Evidence Matching</span>
          </button>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Tailoring Plan & User Review</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Phase 6C
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailoring proposals for <strong>{jobTitle}</strong>
            {company ? ` at ${company}` : ""}
          </p>
        </div>

        {plan && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={regenerating}
              onClick={() => regeneratePlan(plan.intensity, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerate tailoring proposals"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              <span>Refresh Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Active Tailored Variant Banner */}
      {(tailoredResume || plan?.status === "APPLIED") && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Tailored Resume Variant Materialized
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Independent variant ready for this job profile. Master Resume remains 100% untouched.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push(
                tailoredResume
                  ? `/dashboard/resume-studio?resumeId=${tailoredResume.id}`
                  : "/dashboard/resume-studio"
              )
            }
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Open Tailored Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Staleness Warning Banner */}
      {plan?.isStale && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-900/60 flex items-start justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Tailoring Plan is Stale
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                {plan.stalenessReason ||
                  "Underlying Career Profile or Job Analysis was updated. Please refresh the plan to keep all proposals aligned."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => regeneratePlan(plan.intensity, true)}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer"
          >
            Refresh Now
          </button>
        </div>
      )}

      {/* 3. Intensity Level Selector */}
      {plan && (
        <TailoringIntensitySelector
          value={plan.intensity}
          onChange={(newIntensity) => regeneratePlan(newIntensity, false)}
          disabled={regenerating}
        />
      )}

      {/* 4. Plan Summary & Progress Bar */}
      {plan && (
        <TailoringPlanSummary
          summary={plan.summary}
          onAcceptAll={batchAcceptAll}
          onResetAll={batchResetAll}
          disabled={loading || regenerating}
        />
      )}

      {/* 5. Section Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 6. Proposals Card List */}
      <div className="space-y-3">
        {activeSection === "DO_NOT_ADD" ? (
          <DoNotAddSection proposals={doNotAddProposals} />
        ) : filteredProposals.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No actionable proposals in this section for the current intensity.
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onAccept={acceptProposal}
              onReject={rejectProposal}
              onEdit={editProposal}
              isUpdating={updatingProposalId === proposal.id}
            />
          ))
        )}
      </div>

      {/* 7. Bottom Ground Truth Advisory (Shown in main list) */}
      {activeSection === "ALL" && doNotAddProposals.length > 0 && (
        <DoNotAddSection proposals={doNotAddProposals} />
      )}

      {/* 8. Sticky Footer Review & Navigation */}
      {plan && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {plan.summary.acceptedCount + plan.summary.editedCount} of{" "}
            {plan.summary.totalProposals - plan.summary.protectedCount} proposals approved.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Back to Career Match
            </button>

            {tailoredResume && (
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/resume-studio?resumeId=${tailoredResume.id}`)
                }
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Open in Studio</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tailoredResume ? "Review Plan" : "Review & Generate"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. Modals */}
      <ConfirmRegenerateModal
        isOpen={confirmRegenModalOpen}
        targetIntensity={pendingIntensity}
        onConfirm={() => regeneratePlan(pendingIntensity, true)}
        onCancel={() => setConfirmRegenModalOpen(false)}
        loading={regenerating}
      />

      {plan && (
        <TailoringReviewModal
          isOpen={reviewModalOpen}
          plan={plan}
          onClose={() => setReviewModalOpen(false)}
        />
      )}
    </div>
  );
};
