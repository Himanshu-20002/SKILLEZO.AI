"use client";

import React, { useState } from "react";
import { useJobIntake } from "@/hooks/useJobIntake";
import { JobIntakeForm } from "./JobIntakeForm";
import { JobAnalysisProgress } from "./JobAnalysisProgress";
import { JobAnalysisSummary } from "./JobAnalysisSummary";
import { CareerMatchView } from "@/components/job-matching";
import { TailoringPlanView } from "@/components/job-tailoring-plan";
import { X, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface JobTailoringWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobTailoringWorkspace: React.FC<JobTailoringWorkspaceProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<"ANALYSIS" | "MATCH" | "TAILORING_PLAN">("ANALYSIS");

  const {
    jobProfile,
    status,
    error,
    progressStep,
    submitJob,
    reanalyzeJob,
    reset,
  } = useJobIntake();

  if (!isOpen) return null;

  const handleClose = () => {
    if (status !== "analyzing") {
      onClose();
    }
  };

  const getStepMeta = () => {
    switch (activeStep) {
      case "MATCH":
        return {
          title: "Career Evidence Matching",
          badge: "Phase 6B",
          subtitle: "Evaluate verified Career Profile proof against job requirements.",
        };
      case "TAILORING_PLAN":
        return {
          title: "Tailoring Plan + User Review",
          badge: "Phase 6C",
          subtitle: "Ground truth resume adaptation proposals with complete user control.",
        };
      default:
        return {
          title: "Job Intake & JD Intelligence",
          badge: "Phase 6A",
          subtitle: "Transform any job description into normalized, grounded role requirements.",
        };
    }
  };

  const stepMeta = getStepMeta();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{stepMeta.title}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {stepMeta.badge}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stepMeta.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={status === "analyzing"}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {status === "analyzing" && (
            <JobAnalysisProgress currentStep={progressStep} />
          )}

          {status === "error" && (
            <div className="py-8 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Analysis Failed
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {error?.message || "An unexpected error occurred while analyzing the job description."}
                </p>
                {error?.code && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Code: {error.code}
                  </span>
                )}
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Edit Input
                </button>
              </div>
            </div>
          )}

          {status === "success" && jobProfile && activeStep === "TAILORING_PLAN" && (
            <TailoringPlanView
              jobProfileId={jobProfile.id}
              jobTitle={jobProfile.jobTitle}
              company={jobProfile.company}
              onBack={() => setActiveStep("MATCH")}
            />
          )}

          {status === "success" && jobProfile && activeStep === "MATCH" && (
            <CareerMatchView
              jobProfileId={jobProfile.id}
              jobTitle={jobProfile.jobTitle}
              company={jobProfile.company}
              onBack={() => setActiveStep("ANALYSIS")}
              onProceedToTailoring={() => setActiveStep("TAILORING_PLAN")}
            />
          )}

          {status === "success" && jobProfile && activeStep === "ANALYSIS" && (
            <JobAnalysisSummary
              jobProfile={jobProfile}
              onReanalyze={() => reanalyzeJob(jobProfile.id)}
              onReset={() => {
                setActiveStep("ANALYSIS");
                reset();
              }}
              onProceedToMatch={() => setActiveStep("MATCH")}
            />
          )}

          {status === "idle" && (
            <JobIntakeForm onSubmit={submitJob} loading={false} />
          )}
        </div>
      </div>
    </div>
  );
};
