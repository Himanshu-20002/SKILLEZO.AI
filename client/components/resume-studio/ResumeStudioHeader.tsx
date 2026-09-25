'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ResumeRecord } from '@/types/resume';
import { StudioViewMode } from './ResumeStudioSidebar';
import { SaveStatus } from '@/hooks/useResumeStudio';

interface ResumeStudioHeaderProps {
  resumes: ResumeRecord[];
  selectedResumeId: string | null;
  currentResume: ResumeRecord | null;
  isCurrentResumeMaster: boolean;
  isMasterStale: boolean;
  isSyncingMaster: boolean;
  saveStatus: SaveStatus;
  viewMode: StudioViewMode;
  onViewModeChange?: (mode: StudioViewMode) => void;
  refreshing?: boolean;
  isDeletingResume?: boolean;
  isDownloadingPdf?: boolean;
  onSelectResume: (id: string) => void;
  onSyncMasterResume: () => void;
  onRefreshScore?: () => void;
  onDeleteClick?: () => void;
  onDownloadPdf?: () => void;
  onOpenMobileSidebar: () => void;
}

export const ResumeStudioHeader: React.FC<ResumeStudioHeaderProps> = ({
  resumes: _resumes,
  selectedResumeId: _selectedResumeId,
  currentResume,
  isCurrentResumeMaster,
  isMasterStale,
  isSyncingMaster,
  saveStatus,
  viewMode,
  onViewModeChange,
  onSyncMasterResume,
  onOpenMobileSidebar,
}) => {
  const isAudit = viewMode === 'audit' || viewMode === 'analysis';
  const isBuilder = viewMode === 'builder';
  const isEditor = !isAudit && !isBuilder;

  return (
    <header className="h-16 shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-3">
      {/* Left: Back Link, Title, Identity Badges */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open Workspace Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {viewMode !== 'audit' ? (
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

        {/* Current Resume Title & Type Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <h2
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[220px]"
            title={currentResume?.title || 'Master Resume'}
          >
            {currentResume?.title || 'Master Resume'}
          </h2>

          {isCurrentResumeMaster ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-xs shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <span>Master</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Variant</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Mode Switcher & Save State (Desktop/Tablet) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Workspace Mode Switcher */}
        {onViewModeChange && (
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => onViewModeChange('editor')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isEditor
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => onViewModeChange('builder')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isBuilder
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => onViewModeChange('audit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isAudit
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ATS & Score
            </button>
          </div>
        )}

        {/* Live Autosave Indicator */}
        <div className="flex items-center px-2.5 py-1 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
          {saveStatus === 'saving' && (
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Saved ✓</span>
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              <span>Save failed</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Master Sync Alert */}
      <div className="flex items-center gap-2">
        {/* Stale Master Sync Notification Button */}
        {isCurrentResumeMaster && isMasterStale && (
          <button
            onClick={onSyncMasterResume}
            disabled={isSyncingMaster}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Profile updated — click to synchronize career facts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMaster ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncingMaster ? 'Syncing...' : 'Sync Profile'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
