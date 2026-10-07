'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  RefreshCw,
  Trash2,
  Check,
} from 'lucide-react';
import { useResumeStudio } from '@/hooks/useResumeStudio';
import { useResumeComparison } from '@/hooks/useResumeComparison';
import { ComparisonChangeVM } from '@/types/resume-comparison-view.types';
import {
  ResumeStudioSidebar,
  ResumeStudioHeader,
  ResumeSyncBanner,
  ResumeEditorPanel,
  ResumePreviewPanel,
  ResumeInsightsPanel,
  ResumeSectionNavigator,
  ResumeStudioWorkspace,
  ResumeSwitchConfirmDialog,
  ResumeStudioUploadGateway,
} from '@/components/resume-studio';

// Code-split heavy comparison dialog to reduce initial bundle footprint
const ResumeComparisonDialog = dynamic(
  () =>
    import('@/components/resume-studio/comparison/ResumeComparisonDialog').then(
      (mod) => mod.ResumeComparisonDialog
    ),
  { ssr: false }
);

// Code-split optimization review modal (only loaded when user triggers optimization)
const OptimizationReviewModal = dynamic(
  () =>
    import('@/components/dashboard/resume-intelligence/OptimizationReviewModal').then(
      (mod) => mod.OptimizationReviewModal
    ),
  { ssr: false }
);

interface ProgrammaticNavigationToken {
  id: string;
  requestId: number;
}

function ResumeStudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [initialResumeId] = useState<string | null>(() => {
    return searchParams.get('resumeId');
  });

  const studio = useResumeStudio(initialResumeId);

  // Programmatic navigation tracking ref to eliminate search-param loops
  const programmaticNavigationTokenRef = useRef<ProgrammaticNavigationToken | null>(null);
  const initialReconciledRef = useRef(false);

  // User variant switch handler (triggers USER_VARIANT_SWITCH)
  const handleSelectVariant = useCallback((targetResumeId: string) => {
    studio.switchResumeVariant(targetResumeId, 'USER_VARIANT_SWITCH', (committedId, requestId) => {
      programmaticNavigationTokenRef.current = { id: committedId, requestId };
      router.push(`/dashboard/resume-studio?resumeId=${committedId}`, { scroll: false });
    });
  }, [studio.switchResumeVariant, router]);

  // Dirty switch confirmation handler
  const handleConfirmSwitch = useCallback(() => {
    studio.confirmSwitchVariant((committedId, requestId) => {
      programmaticNavigationTokenRef.current = { id: committedId, requestId };
      router.push(`/dashboard/resume-studio?resumeId=${committedId}`, { scroll: false });
    });
  }, [studio.confirmSwitchVariant, router]);

  // Cancel switch handler (restore URL if triggered by browser history navigation)
  const handleCancelSwitch = useCallback(() => {
    studio.cancelSwitchVariant();
    if (studio.activeResumeId) {
      router.replace(`/dashboard/resume-studio?resumeId=${studio.activeResumeId}`, { scroll: false });
    }
  }, [studio.cancelSwitchVariant, studio.activeResumeId, router]);

  // Master resume resolution for comparison baseline
  const masterResume = useMemo(
    () => studio.resumes.find((r) => r.variantType === 'MASTER'),
    [studio.resumes]
  );

  // Phase 6E.4: Concurrency-guarded comparison hook
  const comparison = useResumeComparison({
    activeResumeId: studio.activeResumeId,
    masterResumeId: masterResume?.id || '',
    variantType: studio.currentResume?.variantType,
    targetJobId: studio.currentResume?.targetJobId,
    diffResult: studio.diffSummary,
  });

  // Canonical Studio navigation handler from comparison card/drawer
  const handleNavigateFromComparison = useCallback(
    (change: ComparisonChangeVM) => {
      comparison.closeComparison();
      const sectionMap: Record<string, string> = {
        summary: 'summary',
        skills: 'skills',
        experience: 'experience',
        projects: 'projects',
        education: 'education',
        layout: 'summary',
      };
      const targetSection = sectionMap[change.section] || 'summary';
      studio.setActiveSectionKey(targetSection as any);
      studio.setPreviewHighlightSection(targetSection);
      studio.setActiveView('detail');
      studio.setViewMode('editor');
      studio.setMobileEditorView('editor');
    },
    [comparison, studio]
  );

  // Sync viewMode and handle browser Back/Forward navigation from URL searchParams
  useEffect(() => {
    const viewParam = searchParams.get('view') || searchParams.get('tab');
    if (viewParam) {
      if (viewParam === 'audit' || viewParam === 'analysis') {
        studio.setViewMode('audit');
      } else if (viewParam === 'builder' || viewParam === 'design') {
        studio.setViewMode('builder');
      } else if (['editor', 'split', 'visual', 'content'].includes(viewParam)) {
        studio.setViewMode('editor');
      }
    }

    const resumeIdParam = searchParams.get('resumeId');
    const token = programmaticNavigationTokenRef.current;

    // If this URL change matches our active programmatic switch token, ignore:
    if (token && token.id === resumeIdParam) {
      programmaticNavigationTokenRef.current = null;
      return;
    }

    // Legitimate browser Back/Forward navigation:
    if (resumeIdParam && studio.activeResumeId && resumeIdParam !== studio.activeResumeId && !studio.loading) {
      studio.switchResumeVariant(resumeIdParam, 'BROWSER_HISTORY_NAVIGATION');
    }
  }, [searchParams, studio.setViewMode, studio.activeResumeId, studio.loading, studio.switchResumeVariant]);

  // Reconcile invalid/fallback deep links: URL only updates after fallback commits
  useEffect(() => {
    if (!studio.loading && studio.activeResumeId && !initialReconciledRef.current) {
      initialReconciledRef.current = true;
      const urlResumeId = searchParams.get('resumeId');
      if (urlResumeId && urlResumeId !== studio.activeResumeId) {
        // Deep link failed to load or fell back to default/master
        router.replace(`/dashboard/resume-studio?resumeId=${studio.activeResumeId}`, { scroll: false });
      }
    }
  }, [studio.loading, studio.activeResumeId, searchParams, router]);

  // Load initial data on mount
  useEffect(() => {
    studio.loadInitialData();
  }, [studio.loadInitialData]);

  // Priority section calculation for ATS attention
  const prioritySection = useMemo(() => {
    if (!studio.scoreResult) return null;
    const entries = Object.entries(studio.scoreResult.sections).map(([id, sec]) => ({
      id: id as any,
      title: sec.title,
      score: sec.score,
    }));
    return entries.sort((a, b) => a.score - b.score)[0] || null;
  }, [studio.scoreResult]);

  // 1. LOADING SKELETON
  if (studio.loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse font-sans">
        <div className="h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
        <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  // 2. ERROR STATE
  if (studio.error && !studio.scoreResult && studio.resumes.length > 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resume analysis unavailable</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{studio.error}</p>
          </div>
          <button
            onClick={() => studio.activeResumeId && studio.fetchScore(studio.activeResumeId)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. ZERO RESUMES GATEWAY (Lightweight, instant initial load for new users without a resume)
  if (!studio.loading && studio.resumes.length === 0) {
    return (
      <ResumeStudioUploadGateway
        onFileUpload={studio.handleFileUpload}
        isUploading={studio.isUploading}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 overflow-x-hidden">
      {/* Background Dashboard & Studio Workspace */}
      <div className="flex flex-col lg:flex-row flex-1 min-w-0 transition-all duration-500">
        {/* 1. Mobile Slide-Over Sidebar Drawer (< lg) */}
        <ResumeStudioSidebar
          className="lg:hidden"
          viewMode={studio.viewMode}
          onViewModeChange={studio.setViewMode}
          activeSectionKey={studio.previewHighlightSection || (studio.activeView === 'detail' ? studio.activeSectionKey : undefined)}
          onSectionClick={(secId) => {
            studio.setPreviewHighlightSection(secId);
            studio.setActiveSectionKey(secId as any);
            studio.setActiveView('detail');
            studio.setViewMode('editor');
            studio.setMobileEditorView('editor');
          }}
          overallScore={studio.scoreResult?.overall.overallScore}
          scoreTier={studio.scoreResult?.overall.tier}
          templateId={studio.builderConfig.templateId}
          isOpen={studio.isMobileSidebarOpen}
          onClose={() => studio.setIsMobileSidebarOpen(false)}
        />

        {/* 2. Main Studio Workspace Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
          {/* Top Action & Status Bar */}
          <ResumeStudioHeader
            resumes={studio.resumes}
            selectedResumeId={studio.selectedResumeId}
            activeResumeId={studio.activeResumeId}
            currentResume={studio.currentResume}
            isCurrentResumeMaster={studio.isCurrentResumeMaster}
            isMaster={studio.isMaster}
            isTailored={studio.isTailored}
            isMasterStale={studio.isMasterStale}
            isSyncingMaster={studio.isSyncingMaster}
            saveStatus={studio.saveStatus}
            viewMode={studio.viewMode}
            onViewModeChange={studio.setViewMode}
            refreshing={studio.refreshing}
            isDeletingResume={studio.isDeletingResume}
            isDownloadingPdf={studio.isDownloadingPdf}
            diffSummary={studio.diffSummary}
            onSelectResume={handleSelectVariant}
            onSyncMasterResume={studio.handleSyncMasterResume}
            onRefreshScore={() => studio.activeResumeId && studio.fetchScore(studio.activeResumeId)}
            onDeleteClick={() => studio.handleDeleteClick()}
            onDownloadPdf={studio.handleDownloadPDF}
            onOpenComparison={comparison.openComparison}
            onOpenMobileSidebar={() => studio.setIsMobileSidebarOpen(true)}
            targetRole={studio.targetRole}
            onTargetRoleChange={studio.handleTargetRoleChange}
          />

          {/* Master Resume Stale Banner Alert */}
          <ResumeSyncBanner
            isCurrentResumeMaster={studio.isCurrentResumeMaster}
            isMasterStale={studio.isMasterStale}
            isSyncingMaster={studio.isSyncingMaster}
            onSyncMasterResume={studio.handleSyncMasterResume}
          />

          {/* Studio Workspace Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            <ResumeStudioWorkspace
              viewMode={studio.viewMode}
              mobileView={studio.mobileEditorView}
              onMobileViewChange={studio.setMobileEditorView}
              navigationPanel={
                studio.viewMode !== 'audit' && studio.viewMode !== 'analysis' ? (
                  <ResumeSectionNavigator
                    document={studio.resumeDoc}
                    scoreResult={studio.scoreResult}
                    currentResume={studio.currentResume}
                    activeSectionKey={studio.activeSectionKey}
                    onSelectSection={(secId) => {
                      studio.setActiveSectionKey(secId as any);
                      studio.setPreviewHighlightSection(secId);
                      studio.setActiveView('detail');
                      studio.setViewMode('editor');
                      studio.setMobileEditorView('editor');
                    }}
                    onViewAtsAndPortfolio={() => studio.setViewMode('audit')}
                  />
                ) : undefined
              }
              editorPanel={
                studio.viewMode !== 'audit' && studio.viewMode !== 'analysis' ? (
                  <ResumeEditorPanel
                    viewMode={studio.viewMode}
                    onViewModeChange={studio.setViewMode}
                    activeView={studio.activeView}
                    onActiveViewChange={studio.setActiveView}
                    activeSectionKey={studio.activeSectionKey}
                    onSelectSection={(key: keyof import('@/types/resume-scoring.types').ResumeScoreResult['sections']) => studio.setActiveSectionKey(key)}
                    scoreResult={studio.scoreResult}
                    analysis={studio.analysis}
                    builderConfig={studio.builderConfig}
                    onBuilderConfigChange={studio.handleBuilderConfigChange}
                    isGenerating={studio.isGenerating}
                    isApplying={studio.isApplying}
                    currentSuggestion={studio.currentSuggestion}
                    scoreDeltaNotice={studio.scoreDeltaNotice}
                    onGenerateSuggestion={studio.handleGenerateSuggestion}
                    onApproveSuggestion={studio.handleApproveSuggestion}
                    onRejectSuggestion={studio.handleRejectSuggestion}
                    onTriggerUpload={() => studio.fileInputRef.current?.click()}
                    isUploading={studio.isUploading}
                    currentResume={studio.currentResume}
                    diffResult={studio.diffSummary}
                    onOpenComparison={comparison.openComparison}
                    onNavigateToSection={(_category, sectionKey) => {
                      if (sectionKey) {
                        studio.setActiveSectionKey(sectionKey as any);
                        studio.setPreviewHighlightSection(sectionKey);
                        studio.setActiveView('detail');
                        studio.setViewMode('editor');
                        studio.setMobileEditorView('editor');
                      }
                    }}
                  />
                ) : undefined
              }
              previewPanel={
                studio.viewMode !== 'audit' && studio.viewMode !== 'analysis' ? (
                  <ResumePreviewPanel
                    document={studio.resumeDoc}
                    config={studio.builderConfig}
                    highlightSectionId={studio.previewHighlightSection}
                    onSectionClick={(secId: string) => {
                      studio.setActiveSectionKey(secId as any);
                      studio.setPreviewHighlightSection(secId);
                      studio.setActiveView('detail');
                      studio.setViewMode('editor');
                      studio.setMobileEditorView('editor');
                    }}
                  />
                ) : undefined
              }
              insightsPanel={
                <ResumeInsightsPanel
                  targetRole={studio.targetRole}
                  onTargetRoleChange={studio.handleTargetRoleChange}
                  analysis={studio.analysis}
                  activePillar={studio.activePillar}
                  onSelectPillar={studio.setActivePillar}
                  onOpenEditor={(resumeId) => {
                    if (resumeId) studio.handleSelectResume(resumeId);
                    studio.setViewMode('editor');
                  }}
                  onUploadClick={() => studio.fileInputRef.current?.click()}
                  isUploading={studio.isUploading}
                  onOptimize={studio.handleLaunchOptimization}
                  isOptimizing={studio.isOptimizing}
                  optimizingRecId={studio.optimizingRecId}
                  scoreResult={studio.scoreResult}
                  prioritySection={prioritySection}
                  onSectionFixWithAi={(secId: string) => {
                    studio.setActiveSectionKey(secId as any);
                    studio.setPreviewHighlightSection(secId);
                    studio.setActiveView('detail');
                    studio.setViewMode('editor');
                    studio.setMobileEditorView('editor');
                  }}
                  currentResume={studio.currentResume}
                  onDeleteClick={studio.handleDeleteClick}
                  selectedResumeId={studio.selectedResumeId}
                  onSelectResume={handleSelectVariant}
                  onDownloadPdf={studio.handleDownloadPDF}
                  isDownloadingPdf={studio.isDownloadingPdf}
                  portfolioVersion={studio.portfolioVersion}
                />
              }
            />
          </main>
        </div>
      </div>

      {/* 3. MODALS & DIALOGS */}

      <OptimizationReviewModal
        draft={studio.selectedDraft}
        isOpen={studio.isOptimizationModalOpen}
        isApplying={studio.isApplyingOptimization}
        isSwitchingTarget={studio.isSwitchingTarget}
        onClose={() => studio.setIsOptimizationModalOpen(false)}
        onAccept={studio.handleAcceptOptimization}
        onReject={studio.handleRejectOptimization}
        onTargetChange={() => { }}
      />

      {/* Variant Switch Dirty Confirmation Dialog */}
      <ResumeSwitchConfirmDialog
        isOpen={studio.isSwitchConfirmOpen}
        onStay={handleCancelSwitch}
        onConfirmSwitch={handleConfirmSwitch}
      />

      {/* Delete Resume Confirmation Modal */}
      {studio.isDeleteDialogOpen && studio.resumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Delete Resume Document?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{studio.resumeToDelete.title || studio.resumeToDelete.originalFileName || 'Resume'}"</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <p className="font-medium text-slate-700 dark:text-slate-300">This will permanently remove:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                <li>Parsed resume content & sections</li>
                <li>Calculated ATS scores & role alignment</li>
                <li>AI bullet suggestions & optimization drafts</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  studio.setIsDeleteDialogOpen(false);
                }}
                disabled={studio.isDeletingResume}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={studio.handleConfirmDeleteResume}
                disabled={studio.isDeletingResume}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {studio.isDeletingResume ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 6E.4: Resume Comparison & Evidence Dialog */}
      <ResumeComparisonDialog
        isOpen={comparison.isDialogOpen}
        onClose={comparison.closeComparison}
        viewModel={comparison.viewModel}
        isLoading={comparison.isLoading}
        error={comparison.error}
        viewMode={comparison.viewMode}
        onViewModeChange={comparison.setViewMode}
        selectedChangeId={comparison.selectedChangeId}
        isEvidenceDrawerOpen={comparison.isEvidenceDrawerOpen}
        onOpenEvidence={comparison.openEvidenceDrawer}
        onCloseEvidence={comparison.closeEvidenceDrawer}
        selectedEvidenceDrawerVM={comparison.selectedEvidenceDrawerVM}
        onNavigateToResume={handleNavigateFromComparison}
      />

      {/* Global Hidden PDF File Input for Studio */}
      <input
        type="file"
        ref={studio.fileInputRef}
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            studio.handleFileUpload(file);
          }
          // Reset so selecting the same file triggers onChange
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function ResumeStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse font-sans">
          <div className="h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
          <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        </div>
      }
    >
      <ResumeStudioPageContent />
    </Suspense>
  );
}
