'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { ResumePortfolioItem } from '@/types/resume';

interface DeleteVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ResumePortfolioItem | null;
  onConfirm: (resumeId: string) => Promise<boolean>;
  loading: boolean;
}

export const DeleteVariantModal: React.FC<DeleteVariantModalProps> = ({
  isOpen,
  onClose,
  variant,
  onConfirm,
  loading,
}) => {
  if (!isOpen || !variant) return null;

  const handleConfirm = async () => {
    const success = await onConfirm(variant.id);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-variant-title"
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-variant-title" className="text-base font-bold text-slate-900 dark:text-white">
                Delete Resume Variant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 dark:text-white">"{variant.displayName}"</strong>?
            Your canonical Master Resume and Career Profile data will not be affected.
          </p>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Deleting...' : 'Delete Variant'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
