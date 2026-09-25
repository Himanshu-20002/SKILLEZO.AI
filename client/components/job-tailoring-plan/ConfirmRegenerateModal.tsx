"use client";

import React from "react";
import { TailoringIntensity } from "@/types/tailoring-plan.types";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ConfirmRegenerateModalProps {
  isOpen: boolean;
  targetIntensity: TailoringIntensity;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmRegenerateModal: React.FC<ConfirmRegenerateModalProps> = ({
  isOpen,
  targetIntensity,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Regenerate Tailoring Plan?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switching to <strong>{targetIntensity}</strong> mode
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          You have already accepted or customized proposals in the current plan. Regenerating will generate a fresh set of tailoring proposals tailored for <strong>{targetIntensity}</strong> intensity.
        </p>

        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
          <strong>Important:</strong> Your current decisions will be reset to fresh draft proposals.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Keep Current Plan
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Regenerate Fresh Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
