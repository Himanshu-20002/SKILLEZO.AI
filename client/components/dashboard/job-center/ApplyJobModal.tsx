'use client';

import React, { useEffect } from 'react';
import {
  X,
  Send,
  Building,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Job } from '@/types/job-center';

interface ApplyJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApply: (job: Job) => void;
  children?: React.ReactNode;
  isSubmitting?: boolean;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmApply,
  children,
  isSubmitting = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const isExternal = (job.sourceType || '').toUpperCase() === 'EXTERNAL';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE]">
              {isExternal ? <ExternalLink className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isExternal ? 'External Job Application' : 'Apply for Position'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isExternal ? 'Apply on partner website' : 'Direct platform submission with AI Resume'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close apply dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Job Summary Card Header */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border ${
                  isExternal
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-gradient-to-tr from-[#3D5AFE]/20 to-[#00D9C0]/20 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/20'
                }`}
              >
                {job.company ? job.company.substring(0, 2).toUpperCase() : 'SK'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {job.title}
                  </h4>

                  {isExternal ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <Globe className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {job.sourceName || 'Jooble'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0] border border-[#3D5AFE]/30">
                      <Building className="w-3 h-3" />
                      Direct Platform
                    </span>
                  )}

                  {job.verified && !isExternal && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  {job.company} • {job.department || 'Engineering'}
                </p>
              </div>
            </div>

            {/* Pill Attributes Grid */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                <MapPin className="w-3 h-3 text-slate-400" />
                {job.location}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {job.workMode} • {job.employmentType}
              </span>

              {job.salaryText && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
                  <DollarSign className="w-3 h-3" />
                  {job.salaryText}
                </span>
              )}
            </div>
          </div>

          {/* External Job Notice */}
          {isExternal && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Partner Job Listing Notice
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                This job is aggregated from <strong>{job.sourceName || 'Jooble'}</strong>. Clicking continue will open the official job posting in a new tab where you can submit your application directly.
              </p>
            </div>
          )}

          {/* Injected Content Slot (Resume selector / cover letter / preview) */}
          {children}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {isExternal ? (
            <a
              href={job.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onConfirmApply(job);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Continue to {job.sourceName || 'Job Listing'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmApply(job)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Confirm & Apply'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
