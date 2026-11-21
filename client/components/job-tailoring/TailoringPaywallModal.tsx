"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Lock, CheckCircle2, Zap, X } from "lucide-react";

interface TailoringPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TailoringPaywallModal: React.FC<TailoringPaywallModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-testid="tailoring-paywall-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          data-testid="btn-close-paywall-modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Gradient Icon Badge */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Pro & Sprint Pass Feature</span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Unlock 1-Click AI Resume Tailoring
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Your free plan includes 1 Master Resume & 1 Basic ATS match check. Upgrade to generate customized resumes tailored to match specific job descriptions.
            </p>
          </div>
        </div>

        {/* Feature Highlights Card */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Included with Pro & Sprint Pass:
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Unlimited Tailored Resumes:</strong> Customize your resume for 20+ different job postings with 1 click.</span>
            </div>

            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>ATS Keyword Gap Elimination:</strong> Automatically align your verified career evidence with role requirements.</span>
            </div>

            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>All Senior Model Answers:</strong> Unlimited practice sessions and staff engineer model answers in Mock Interview Coach.</span>
            </div>
          </div>
        </div>

        {/* Pricing Options & CTAs */}
        <div className="space-y-2.5 pt-1">
          <Link
            href="/dashboard/plan"
            data-testid="btn-get-sprint-pass"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block font-black">7-Day Job Hunt & Interview Sprint Pass</span>
                <span className="block text-[10px] text-indigo-100 font-normal">One-time payment • No auto-renewal</span>
              </div>
            </div>
            <span className="text-sm font-black bg-white/20 px-2.5 py-1 rounded-xl">₹199</span>
          </Link>

          <Link
            href="/dashboard/plan"
            data-testid="btn-get-pro-monthly"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            <div className="text-left">
              <span className="block font-bold">SKILLEZO Pro (Monthly)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Continuous career growth & portfolio hosting</span>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">₹499/mo</span>
          </Link>
        </div>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
          Instant activation • 100% money-back guarantee if not satisfied
        </p>
      </div>
    </div>
  );
};
