'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Job } from '@/types/job-center';
import { toast } from 'sonner';

interface ApplyJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApply: (job: Job) => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmApply,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmApply(job);
      onClose();
      toast.success(`Application submitted to ${job.company}! Tracker updated.`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE]">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Application Confirmation</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-slate-500 block font-medium">Applying for:</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">{job.title}</span>
            <span className="text-slate-600 dark:text-slate-400 block">{job.company} • {job.location}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#3D5AFE]" />
              Attached AI Resume Profile
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-700 dark:text-slate-300">Alex_Rivera_Resume_2026.pdf</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">ATS Score: 91/100</span>
            </div>
          </div>

          <div className="space-y-1.5 pl-1 pt-1">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Skill Profile Matched ({job.matchScore}%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold block">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Candidate Credentials</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
