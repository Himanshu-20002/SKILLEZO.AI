'use client';

import React, { useEffect } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Calendar,
  Building,
  Briefcase,
  Hash,
  Download,
  FileText,
} from 'lucide-react';
import { HistoricalResumeSnapshot } from '@/types/application';
import { ResumeRenderer } from '@/components/resume-studio/renderer/ResumeRenderer';

interface ApplicationSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot?: HistoricalResumeSnapshot | null;
  jobTitle?: string | null;
  companyName?: string | null;
}

export const ApplicationSnapshotModal: React.FC<ApplicationSnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  jobTitle,
  companyName,
}) => {
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

  if (!isOpen || !snapshot) return null;

  const capturedDate = snapshot.capturedAt
    ? new Date(snapshot.capturedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown Date';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snapshot-modal-title"
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="snapshot-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Historical Resume Snapshot
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  READ ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exact resume state captured at the time this application was recorded
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Captured: {capturedDate}</span>
            </div>

            {companyName && (
              <div className="flex items-center gap-1.5 font-medium">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{companyName}</span>
              </div>
            )}

            {jobTitle && (
              <div className="flex items-center gap-1.5 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{jobTitle}</span>
              </div>
            )}
          </div>

          {snapshot.snapshotHash && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400"
              title={`SHA-256 Checksum: ${snapshot.snapshotHash}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>sha256:{snapshot.snapshotHash.substring(0, 10)}...</span>
            </div>
          )}
        </div>

        {/* Resume Preview Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/40 dark:bg-slate-950/40 flex justify-center">
          {snapshot.resumeDocument ? (
            <div className="w-full max-w-[800px] bg-white rounded-xl shadow-xl overflow-hidden pointer-events-none select-none">
              <ResumeRenderer
                document={snapshot.resumeDocument}
                config={snapshot.builderConfig}
                interactive={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Legacy File Resume Snapshot
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                This application used an uploaded file ({snapshot.fileName || snapshot.originalFileName || 'resume'}). No interactive AST document is available.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 dark:text-slate-500">
            🔒 Snapshot is immutable and completely isolated from active Studio edits.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
