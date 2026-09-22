'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ResumeSyncBannerProps {
  isCurrentResumeMaster: boolean;
  isMasterStale: boolean;
  isSyncingMaster: boolean;
  onSyncMasterResume: () => void;
}

export const ResumeSyncBanner: React.FC<ResumeSyncBannerProps> = ({
  isCurrentResumeMaster,
  isMasterStale,
  isSyncingMaster,
  onSyncMasterResume,
}) => {
  if (!isCurrentResumeMaster || !isMasterStale) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="truncate">
          <strong>Career Profile Updated:</strong> New career facts are available. Sync your Master Resume to reflect the latest profile data while preserving all your formatting customizations.
        </span>
      </div>
      <button
        onClick={onSyncMasterResume}
        disabled={isSyncingMaster}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMaster ? 'animate-spin' : ''}`} />
        <span>{isSyncingMaster ? 'Syncing...' : 'Sync Master Resume'}</span>
      </button>
    </div>
  );
};
