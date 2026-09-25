"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TailoringPlanDTO } from "@/types/tailoring-plan.types";
import { useTailoredResume } from "@/hooks/useTailoredResume";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Loader2,
  FileCheck,
  RefreshCw,
} from "lucide-react";

interface TailoringReviewModalProps {
  isOpen: boolean;
  plan: TailoringPlanDTO;
  onClose: () => void;
}

export const TailoringReviewModal: React.FC<TailoringReviewModalProps> = ({
  isOpen,
  plan,
  onClose,
}) => {
  const router = useRouter();
  const { summary } = plan;
  const totalApproved = summary.acceptedCount + summary.editedCount;
  const hasPending = summary.pendingCount > 0;

  const {
    generating,
    error,
    errorCode,
    requiresConfirmation,
    tailoredResume,
    generate,
    resetError,
  } = useTailoredResume({
    jobProfileId: plan.jobProfileId,
    autoFetch: true,
  });

  const [generationSuccess, setGenerationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (force: boolean = false) => {
    const result = await generate(force);
    if (result?.success) {
      setGenerationSuccess(true);
    }
  };

  const handleOpenStudio = () => {
    const resumeId = tailoredResume?.id;
    if (resumeId) {
      router.push(`/dashboard/resume-studio?resumeId=${resumeId}`);
    } else {
      router.push("/dashboard/resume-studio");
    }
  };

  const isAppliedOrGenerated = Boolean(
    tailoredResume || generationSuccess || plan.status === "APPLIED"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isAppliedOrGenerated
                ? "Tailored Resume Variant"
                : "Tailoring Plan Review Summary"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intensity: <strong>{plan.intensity}</strong> · Plan Version: v{plan.planVersion}
            </p>
          </div>
        </div>

        {/* Decisions Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 text-center">
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
              {summary.acceptedCount}
            </div>
            <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
              Accepted
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-center">
            <div className="text-base font-bold text-blue-700 dark:text-blue-400">
              {summary.editedCount}
            </div>
            <div className="text-[10px] font-medium text-blue-800 dark:text-blue-300">
              Custom Edited
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-center">
            <div className="text-base font-bold text-rose-700 dark:text-rose-400">
              {summary.rejectedCount}
            </div>
            <div className="text-[10px] font-medium text-rose-800 dark:text-rose-300">
              Rejected
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-base font-bold text-slate-700 dark:text-slate-300">
              {summary.protectedCount}
            </div>
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
              Protected Shields
            </div>
          </div>
        </div>

        {/* Existing Variant / Success State */}
        {isAppliedOrGenerated ? (
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/70 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Tailored Resume Variant Materialized</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
              Your tailored variant incorporates your approved proposals with complete factual grounding. Your <strong>Master Resume remains 100% untouched</strong>.
            </p>
            {tailoredResume && (
              <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400">
                <span>Version: v{tailoredResume.version}</span>
                <span>Job: {tailoredResume.targetCompany || "Target Role"}</span>
              </div>
            )}
          </div>
        ) : (
          /* User Authority Disclaimer */
          <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>100% User Authority & Evidence Grounding</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Your Master Resume canonical facts remain completely untouched. Generation will materialize an isolated tailored variant containing only your <strong>{totalApproved} approved proposals</strong>.
            </p>
          </div>
        )}

        {/* Pending Proposals Warning */}
        {hasPending && !isAppliedOrGenerated && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              You have <strong>{summary.pendingCount} pending proposal(s)</strong>. Review all proposals before generating the tailored variant.
            </span>
          </div>
        )}

        {/* Overwrite Confirmation Alert */}
        {requiresConfirmation && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Existing Customizations Detected</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              An existing tailored resume variant for this job contains manual edits. Confirming will overwrite the variant with the current tailoring plan.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={resetError}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={generating}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
              >
                Confirm Overwrite & Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !requiresConfirmation && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>Generation Failed</span>
              <button
                type="button"
                onClick={resetError}
                className="text-[10px] underline hover:no-underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px]">{error}</p>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          {isAppliedOrGenerated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={generating}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleOpenStudio}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Open in Resume Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={generating || hasPending || totalApproved === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Materializing Variant...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Tailored Resume (Phase 6D)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
