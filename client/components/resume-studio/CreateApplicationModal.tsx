'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Briefcase,
  Building,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Loader2,
  Info,
} from 'lucide-react';
import { applicationService } from '@/services/application.service';
import { ApplicationStatus } from '@/types/application';
import { toast } from 'sonner';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeTitle: string;
  targetJobId: string;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  targetJobUrl?: string | null;
}

export const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
  targetJobId,
  targetJobTitle,
  targetCompany,
  targetJobUrl,
}) => {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJobId || !resumeId) {
      toast.error('Missing target job or resume context');
      return;
    }

    try {
      setIsSubmitting(true);
      const app = await applicationService.applyToJobProfile({
        jobProfileId: targetJobId,
        resumeId: resumeId,
        status: selectedStatus,
      });

      toast.success(
        selectedStatus === 'applied'
          ? 'Application recorded as applied!'
          : 'Application draft saved!'
      );
      onClose();
      router.push('/dashboard/job-center?tab=applied');
    } catch (err: any) {
      toast.error(err.message || 'Failed to record application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-headline" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Track Application
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save a historical tracking record with your current tailored resume
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Disclaimer Banner */}
          <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Personal Application Tracking:</span> SKILLEZO AI does not automatically apply or submit forms to external employer websites. This tool records your application progress and preserves an immutable snapshot of your tailored resume.
            </div>
          </div>

          {/* Job Target Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {targetJobTitle || 'Role not specified'}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{targetCompany || 'Company not specified'}</span>
                </div>
              </div>

              {targetJobUrl && (
                <a
                  href={targetJobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  <span>Job Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Frozen Resume:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[240px]">
                {resumeTitle}
              </span>
            </div>
          </div>

          {/* Explicit Status Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Initial Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Draft Option */}
              <label
                className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedStatus === 'draft'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Draft Record</span>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={selectedStatus === 'draft'}
                    onChange={() => setSelectedStatus('draft')}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Save a tracking record for later. You haven't submitted this to the company yet.
                </p>
              </label>

              {/* Applied Option */}
              <label
                className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedStatus === 'applied'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Already Submitted</span>
                  <input
                    type="radio"
                    name="status"
                    value="applied"
                    checked={selectedStatus === 'applied'}
                    onChange={() => setSelectedStatus('applied')}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Record that you already submitted externally. Sets your application date to today.
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                selectedStatus === 'applied'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {selectedStatus === 'applied' ? 'Save & Mark as Applied' : 'Save Draft Record'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
