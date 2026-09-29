'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  RefreshCw,
  ArrowLeft,
  GitCompare,
  Target,
  ChevronDown,
  Download,
  Loader2,
} from 'lucide-react';
import { ResumeRecord } from '@/types/resume';
import { ResumeComparisonResult } from '@/types/resume-comparison.types';
import { StudioViewMode } from './ResumeStudioSidebar';
import { SaveStatus } from '@/hooks/useResumeStudio';
import { ResumeVariantSwitcher } from './ResumeVariantSwitcher';
import { TARGET_ROLES } from './AtsDiagnosticsView';

export interface ResumeStudioHeaderProps {
  resumes: ResumeRecord[];
  selectedResumeId: string | null;
  activeResumeId?: string | null;
  currentResume: ResumeRecord | null;
  isCurrentResumeMaster: boolean;
  isMaster?: boolean;
  isTailored?: boolean;
  isMasterStale: boolean;
  isSyncingMaster: boolean;
  saveStatus?: SaveStatus;
  viewMode: StudioViewMode;
  onViewModeChange?: (mode: StudioViewMode) => void;
  refreshing?: boolean;
  isDeletingResume?: boolean;
  isDownloadingPdf?: boolean;
  diffSummary?: ResumeComparisonResult | null;
  onSelectResume: (id: string) => void;
  onSyncMasterResume: () => void;
  onRefreshScore?: () => void;
  onDeleteClick?: () => void;
  onDownloadPdf?: () => void;
  onOpenComparison?: () => void;
  onOpenMobileSidebar: () => void;
  targetRole?: string;
  onTargetRoleChange?: (role: string) => void;
}

export const ResumeStudioHeader: React.FC<ResumeStudioHeaderProps> = ({
  resumes,
  selectedResumeId,
  activeResumeId,
  currentResume,
  isCurrentResumeMaster,
  isMaster: propIsMaster,
  isTailored: propIsTailored,
  isMasterStale,
  isSyncingMaster,
  viewMode,
  onViewModeChange,
  diffSummary,
  onSelectResume,
  onSyncMasterResume,
  onOpenComparison,
  onOpenMobileSidebar,
  isDownloadingPdf = false,
  onDownloadPdf,
  targetRole,
  onTargetRoleChange,
}) => {
  const isAudit = viewMode === 'audit' || viewMode === 'analysis';

  const activeId = activeResumeId || selectedResumeId;
  const isMaster = propIsMaster !== undefined ? propIsMaster : (currentResume?.variantType === 'MASTER' || isCurrentResumeMaster);
  const isTailored = propIsTailored !== undefined ? propIsTailored : currentResume?.variantType === 'TAILORED';

  return (
    <header className="h-16 shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-3">
      {/* Left: Back Link, Title, Identity Badges, Switcher, Target Job Context */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          aria-label="Open Workspace Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {!isAudit ? (
          <button
            onClick={() => onViewModeChange?.('audit')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Return to ATS Scores & Portfolio"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ATS & Scores</span>
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        )}

        <span className="text-slate-200 dark:text-slate-700 hidden sm:inline">/</span>

        {/* Variant Switcher Dropdown */}
        <ResumeVariantSwitcher
          resumes={resumes}
          activeResumeId={activeId}
          onSelectResume={onSelectResume}
        />

        {/* Target Role Selector beside Resume Selector */}
        {onTargetRoleChange && (
          <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors shrink-0">
            <Target className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden xl:inline">Role:</span>
            <select
              value={targetRole || TARGET_ROLES[0]}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs pr-1 appearance-none hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Target Role for ATS Benchmarking"
              aria-label="Select Target Role"
            >
              {TARGET_ROLES.map((role) => (
                <option
                  key={role}
                  value={role}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium py-1"
                >
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0" />
          </div>
        )}
      </div>

      {/* Right: Master Sync Alert & Comparison Launcher */}
      <div className="flex items-center gap-2">
        {/* Compare with Master Button: ALWAYS visible on Tailored variants, completely hidden on Master */}
        {isTailored && onOpenComparison && (
          <button
            type="button"
            data-testid="header-compare-with-master-btn"
            onClick={onOpenComparison}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-xs shrink-0"
            title="Compare with Master Resume"
          >
            <GitCompare className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Compare with Master</span>
            <span className="sm:hidden">Compare</span>
            {diffSummary && diffSummary.totalChanges > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
                {diffSummary.totalChanges}
              </span>
            )}
          </button>
        )}

        {/* Download PDF Button: Downloads currently opened resume in canvas */}
        {onDownloadPdf && (
          <button
            type="button"
            data-testid="header-download-pdf-btn"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download this resume as high-fidelity vector PDF"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            <span className="sm:hidden">{isDownloadingPdf ? 'PDF...' : 'PDF'}</span>
          </button>
        )}


        {/* Stale Master Sync Notification Button */}
        {isMaster && isMasterStale && (
          <button
            onClick={onSyncMasterResume}
            disabled={isSyncingMaster}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Profile updated — click to update your resume"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMaster ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncingMaster ? 'Syncing...' : 'Sync Profile'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
