'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertCircle,
  RefreshCw,
  Lock,
  Sparkles,
  UploadCloud,
  Check,
  Trash2,
} from 'lucide-react';
import { useResumeStudio } from '@/hooks/useResumeStudio';
import {
  ResumeStudioSidebar,
  ResumeStudioHeader,
  ResumeSyncBanner,
  ResumeEditorPanel,
  ResumePreviewPanel,
  ResumeInsightsPanel,
  ResumeSectionNavigator,
  ResumeStudioWorkspace,
} from '@/components/resume-studio';

// Code-split optimization review modal (only loaded when user triggers optimization)
const OptimizationReviewModal = dynamic(
  () =>
    import('@/components/dashboard/resume-intelligence/OptimizationReviewModal').then(
      (mod) => mod.OptimizationReviewModal
    ),
  { ssr: false }
);

export default function ResumeStudioPage() {
  const [initialResumeId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('resumeId');
    }
    return null;
  });
  const studio = useResumeStudio(initialResumeId);
  const [isDragging, setIsDragging] = useState(false);

  // Sync viewMode and resumeId from URL query parameters (e.g. ?view=audit, ?view=editor, or ?resumeId=xyz)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('tab');
      if (viewParam) {
        if (viewParam === 'audit' || viewParam === 'analysis') {
          studio.setViewMode('audit');
        } else if (viewParam === 'builder' || viewParam === 'design') {
          studio.setViewMode('builder');
        } else if (['editor', 'split', 'visual', 'content'].includes(viewParam)) {
          studio.setViewMode('editor');
        }
      }
      const resumeIdParam = params.get('resumeId');
      if (resumeIdParam && studio.resumes.length > 0 && studio.selectedResumeId !== resumeIdParam) {
        const targetResume = studio.resumes.find((r) => r._id === resumeIdParam);
        if (targetResume) {
          studio.handleSelectResume(resumeIdParam);
        }
      }
    }
  }, [studio.setViewMode, studio.resumes, studio.selectedResumeId, studio.handleSelectResume]);

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

  // Handle Drag & Drop File Upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      studio.handleFileUpload(file);
    }
  };

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
            onClick={() => studio.selectedResumeId && studio.fetchScore(studio.selectedResumeId)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const isLocked = !studio.loading && studio.resumes.length === 0;

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 overflow-x-hidden">
      {/* Background Dashboard & Studio Workspace (Blurred when locked) */}
      <div
        className={`flex flex-col lg:flex-row flex-1 min-w-0 transition-all duration-500 ${isLocked
          ? 'filter blur-[7px] opacity-40 dark:opacity-30 pointer-events-none select-none scale-[0.995] origin-top'
          : ''
          }`}
      >
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
            currentResume={studio.currentResume}
            isCurrentResumeMaster={studio.isCurrentResumeMaster}
            isMasterStale={studio.isMasterStale}
            isSyncingMaster={studio.isSyncingMaster}
            saveStatus={studio.saveStatus}
            viewMode={studio.viewMode}
            onViewModeChange={studio.setViewMode}
            refreshing={studio.refreshing}
            isDeletingResume={studio.isDeletingResume}
            isDownloadingPdf={studio.isDownloadingPdf}
            onSelectResume={studio.handleSelectResume}
            onSyncMasterResume={studio.handleSyncMasterResume}
            onRefreshScore={() => studio.selectedResumeId && studio.fetchScore(studio.selectedResumeId)}
            onDeleteClick={() => studio.handleDeleteClick()}
            onDownloadPdf={studio.handleDownloadPDF}
            onOpenMobileSidebar={() => studio.setIsMobileSidebarOpen(true)}
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
              }
              editorPanel={
                <ResumeEditorPanel
                  viewMode={studio.viewMode}
                  onViewModeChange={studio.setViewMode}
                  activeView={studio.activeView}
                  onActiveViewChange={studio.setActiveView}
                  activeSectionKey={studio.activeSectionKey}
                  onSelectSection={(secId) => {
                    studio.setActiveSectionKey(secId);
                    studio.setPreviewHighlightSection(secId);
                  }}
                  scoreResult={studio.scoreResult}
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
                  fileInputRef={studio.fileInputRef}
                  onFileInputChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) studio.handleFileUpload(file);
                  }}
                />
              }
              previewPanel={
                <ResumePreviewPanel
                  document={studio.resumeDoc}
                  config={studio.builderConfig}
                  highlightSectionId={studio.previewHighlightSection}
                  onSectionClick={(secId) => {
                    studio.setPreviewHighlightSection(secId);
                    studio.setActiveSectionKey(secId as any);
                  }}
                  onJumpToImprove={(secId) => {
                    studio.setActiveSectionKey(secId as any);
                    studio.setPreviewHighlightSection(secId);
                    studio.setActiveView('detail');
                    studio.setViewMode('editor');
                    studio.setMobileEditorView('editor');
                  }}
                  isVisibleOnMobile={studio.mobileEditorView === 'preview'}
                />
              }
              insightsPanel={
                <ResumeInsightsPanel
                  targetRole={studio.targetRole}
                  onTargetRoleChange={studio.handleTargetRoleChange}
                  analysis={studio.analysis}
                  activePillar={studio.activePillar}
                  onSelectPillar={studio.setActivePillar}
                  onOpenEditor={() => {
                    studio.setViewMode('editor');
                    studio.setMobileEditorView('editor');
                  }}
                  onUploadClick={() => studio.fileInputRef.current?.click()}
                  isUploading={studio.isUploading}
                  onOptimize={studio.handleLaunchOptimization}
                  isOptimizing={studio.isOptimizing}
                  optimizingRecId={studio.optimizingRecId}
                  scoreResult={studio.scoreResult}
                  prioritySection={prioritySection}
                  onSectionFixWithAi={(secId) => {
                    studio.setActiveSectionKey(secId as any);
                    studio.setPreviewHighlightSection(secId);
                    studio.setActiveView('detail');
                    studio.setViewMode('editor');
                    studio.setMobileEditorView('editor');
                  }}
                  currentResume={studio.currentResume}
                  onDeleteClick={() => studio.handleDeleteClick()}
                  selectedResumeId={studio.selectedResumeId}
                  onSelectResume={studio.handleSelectResume}
                />
              }
            />
          </main>
        </div>
      </div>

      {/* 3. LOCKED EMPTY STATE OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/20 dark:bg-slate-950/40 backdrop-blur-xs">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-lg w-full rounded-3xl p-8 sm:p-10 bg-white/75 dark:bg-[#0c1236]/85 backdrop-blur-2xl border border-white/60 dark:border-indigo-500/30 shadow-2xl text-center space-y-6 overflow-hidden">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-600/20 dark:from-indigo-900/50 dark:via-purple-900/30 dark:to-indigo-800/50 border border-indigo-500/30 dark:border-indigo-400/40 flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Resume Studio is Ready
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Upload your resume or build your Career Profile to unlock real-time ATS scoring, section-by-section AI diagnostics, and the interactive live editor.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => studio.fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`group relative z-10 p-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-300/80 dark:border-slate-700/80 hover:border-indigo-500/70 dark:hover:border-indigo-400/70 bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/60'
                }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                {studio.isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {studio.isUploading ? 'Analyzing and parsing resume...' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Supports PDF or DOCX (Max 5MB)
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => studio.fileInputRef.current?.click()}
                disabled={studio.isUploading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {studio.isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Resume to Begin</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative z-10 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> ATS Scoring
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> AI Diagnostics
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Live Editor
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODALS & DIALOGS */}
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
    </div>
  );
}
