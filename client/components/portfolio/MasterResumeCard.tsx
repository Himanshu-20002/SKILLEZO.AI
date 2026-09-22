'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  Check,
  AlertCircle,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { ResumePortfolioItem } from '@/types/resume';

interface MasterResumeCardProps {
  master: ResumePortfolioItem;
  onSync: () => void;
  syncing: boolean;
  isActive?: boolean;
  onSelect?: () => void;
  onOpenEditor?: () => void;
}

export const MasterResumeCard: React.FC<MasterResumeCardProps> = ({
  master,
  onSync,
  syncing,
  isActive,
  onSelect,
  onOpenEditor,
}) => {
  const isStale = Boolean(master.isMasterStale);
  const formattedDate = master.updatedAt
    ? new Date(master.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border transition-all p-5 shadow-xs relative overflow-hidden ${
        isActive
          ? 'border-orange-500/90 ring-2 ring-orange-500/25 bg-gradient-to-br from-amber-50/95 via-orange-50/50 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 shadow-md'
          : 'border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/50 via-orange-50/20 to-white dark:from-amber-950/25 dark:via-orange-950/15 dark:to-slate-900 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md'
      }`}
    >
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 dark:bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Top: Badges & Sync Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
              ⭐ Master Resume
            </span>

            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active in Studio
              </span>
            )}

            {isStale ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/80">
                <AlertCircle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                Needs Sync
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60">
                <Check className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                Synced
              </span>
            )}
          </div>

          {/* Sync Button if Stale */}
          {isStale && (
            <button
              onClick={onSync}
              disabled={syncing}
              className="p-1.5 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
              title="Sync career profile changes to Master Resume"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {master.displayName || 'Master Resume'}
        </h3>

        {/* Description / Baseline facts */}
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          The canonical presentation view of your career facts. All tailored role variants branch from this Master Resume.
        </p>

        {/* Meta info */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-800/80 dark:text-amber-400/80 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span>Protected canonical baseline</span>
          {master.sourceProfileVersion && (
            <span className="text-slate-400 dark:text-slate-500">• v{master.sourceProfileVersion}</span>
          )}
        </div>
      </div>

      {/* Bottom: Date and Open in Studio CTA */}
      <div className="mt-5 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Calendar className="w-3 h-3 text-orange-400" />
          {formattedDate}
        </span>

        {isActive ? (
          <button
            onClick={onOpenEditor}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>Edit in Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : onSelect ? (
          <button
            onClick={onSelect}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
          >
            <span>Switch to Master</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            href={`/dashboard/resume-studio?resumeId=${master.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors"
          >
            <span>Open</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
