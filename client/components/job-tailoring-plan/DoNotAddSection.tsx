"use client";

import React from "react";
import { TailoringProposalDTO } from "@/types/tailoring-plan.types";
import { ShieldCheck, AlertOctagon, Info } from "lucide-react";

interface DoNotAddSectionProps {
  proposals: TailoringProposalDTO[];
}

export const DoNotAddSection: React.FC<DoNotAddSectionProps> = ({ proposals }) => {
  if (proposals.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>Anti-Hallucination & Shielded Exclusions</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {proposals.length} Protected
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            SKILLEZO enforces strict ground truth. The job description requested these competencies, but authentic candidate evidence is either absent or only adjacent. These claims are automatically excluded from your resume to prevent fabrication.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {proposals.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                <span>{item.title.replace(/^Protected Exclusion: Do Not Add "/, "").replace(/"$/, "")}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                DO_NOT_ADD
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {item.reason}
            </p>

            <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 pt-0.5">
              <Info className="w-3 h-3" />
              <span>Zero manual action needed. Protected by system.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
