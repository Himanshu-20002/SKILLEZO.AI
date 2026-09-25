"use client";

import React from "react";
import { CheckCircle2, Loader2, Sparkles, Hash, ShieldCheck, Cpu } from "lucide-react";

interface JobAnalysisProgressProps {
  currentStep: number;
}

const PIPELINE_STEPS = [
  {
    step: 1,
    title: "Normalizing & Fingerprinting",
    description: "Cleaning formatting, stripping boilerplate & checking for existing profiles.",
    icon: Hash,
  },
  {
    step: 2,
    title: "Extracting Requirements & Skills",
    description: "Identifying required qualifications, tech stack, and seniority levels.",
    icon: Cpu,
  },
  {
    step: 3,
    title: "Grounding Evidence Citations",
    description: "Verifying all extracted items originate from explicit source text in the JD.",
    icon: ShieldCheck,
  },
  {
    step: 4,
    title: "Finalizing Job Intelligence",
    description: "Structuring canonical requirements and audit metadata.",
    icon: Sparkles,
  },
];

export const JobAnalysisProgress: React.FC<JobAnalysisProgressProps> = ({ currentStep }) => {
  return (
    <div className="py-8 px-4 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Analyzing Job Description
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Our grounded intelligence engine is processing role requirements with cited evidence.
        </p>
      </div>

      <div className="space-y-4">
        {PIPELINE_STEPS.map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const isPending = currentStep < item.step;
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-xs"
                  : isDone
                  ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60"
                  : "opacity-40 border-dashed border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                    {item.step}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isDone
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}
                  />
                  <h5
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-indigo-900 dark:text-indigo-200"
                        : isDone
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {item.title}
                  </h5>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
