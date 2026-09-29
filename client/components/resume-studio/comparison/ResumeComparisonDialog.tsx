'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  ComparisonViewMode,
  ComparisonChangeVM,
  ComparisonEvidenceDrawerVM,
  ResumeComparisonViewModel,
} from '@/types/resume-comparison-view.types';
import { ResumeComparisonHeader } from './ResumeComparisonHeader';
import { ResumeComparisonEmptyState } from './ResumeComparisonEmptyState';
import { ResumeSideBySideView } from './ResumeSideBySideView';
import { ResumeUnifiedDiffView } from './ResumeUnifiedDiffView';
import { ResumeEvidenceDrawer } from './ResumeEvidenceDrawer';

export interface ResumeComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  viewModel: ResumeComparisonViewModel | null;
  isLoading?: boolean;
  error?: string | null;
  viewMode: ComparisonViewMode;
  onViewModeChange: (mode: ComparisonViewMode) => void;
  selectedChangeId: string | null;
  isEvidenceDrawerOpen: boolean;
  onOpenEvidence: (changeId: string) => void;
  onCloseEvidence: () => void;
  selectedEvidenceDrawerVM: ComparisonEvidenceDrawerVM | null;
  onNavigateToResume: (change: ComparisonChangeVM) => void;
}

export const ResumeComparisonDialog: React.FC<ResumeComparisonDialogProps> = ({
  isOpen,
  onClose,
  viewModel,
  isLoading = false,
  error = null,
  viewMode,
  onViewModeChange,
  isEvidenceDrawerOpen,
  onOpenEvidence,
  onCloseEvidence,
  selectedEvidenceDrawerVM,
  onNavigateToResume,
}) => {
  const handleNavigateFromDrawer = () => {
    if (!selectedEvidenceDrawerVM) return;
    const targetChange = viewModel?.allChanges.find(
      (c) => c.id === selectedEvidenceDrawerVM.changeId
    );
    if (targetChange) {
      onCloseEvidence();
      onNavigateToResume(targetChange);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-testid="comparison-dialog-overlay"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        <Dialog.Content
          data-testid="resume-comparison-dialog-content"
          className="fixed left-[50%] top-[50%] z-50 flex flex-col w-[95vw] max-w-6xl h-[90vh] translate-x-[-50%] translate-y-[-50%] border border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden focus:outline-hidden"
          aria-describedby="resume-comparison-dialog-description"
        >
          {/* Accessible Dialog Title & Description */}
          <Dialog.Title className="sr-only">Master to Tailored Resume Comparison</Dialog.Title>
          <Dialog.Description id="resume-comparison-dialog-description" className="sr-only">
            Inspect exact stored differences between Master and Tailored Resume variants, along with
            verified career evidence.
          </Dialog.Description>

          {/* Header */}
          <ResumeComparisonHeader
            targetRole={viewModel?.targetRole}
            targetCompany={viewModel?.targetCompany}
            totalChanges={viewModel?.totalChanges ?? 0}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onClose={onClose}
          />

          {/* Body Content */}
          <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
            {isLoading ? (
              <div
                data-testid="comparison-loading-state"
                className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-slate-500"
              >
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-sm font-medium">Loading comparison data...</span>
              </div>
            ) : error ? (
              <div
                data-testid="comparison-error-state"
                className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center max-w-md mx-auto"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Failed to Load Comparison
                </h3>
                <p className="text-xs text-slate-500">{error}</p>
              </div>
            ) : !viewModel || viewModel.totalChanges === 0 ? (
              <ResumeComparisonEmptyState />
            ) : viewMode === 'SIDE_BY_SIDE' ? (
              <ResumeSideBySideView
                viewModel={viewModel}
                onOpenEvidence={onOpenEvidence}
                onNavigateToResume={onNavigateToResume}
              />
            ) : (
              <ResumeUnifiedDiffView
                viewModel={viewModel}
                onOpenEvidence={onOpenEvidence}
                onNavigateToResume={onNavigateToResume}
              />
            )}

            {/* Slide-over Evidence Drawer */}
            <ResumeEvidenceDrawer
              isOpen={isEvidenceDrawerOpen}
              drawerVM={selectedEvidenceDrawerVM}
              onClose={onCloseEvidence}
              onNavigateToResume={handleNavigateFromDrawer}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
