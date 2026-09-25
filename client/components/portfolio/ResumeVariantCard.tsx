'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  Briefcase,
  Building2,
  Calendar,
  ArrowUpRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ResumePortfolioItem } from '@/types/resume';

interface ResumeVariantCardProps {
  variant: ResumePortfolioItem;
  onRenameClick: (variant: ResumePortfolioItem) => void;
  onDeleteClick: (variant: ResumePortfolioItem) => void;
  isActive?: boolean;
  onSelect?: () => void;
  onOpenEditor?: (resumeId?: string) => void;
}

export const ResumeVariantCard: React.FC<ResumeVariantCardProps> = ({
  variant,
  onRenameClick,
  onDeleteClick,
  isActive,
  onSelect,
  onOpenEditor,
}) => {
  const formattedDate = variant.updatedAt
    ? new Date(variant.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border transition-all p-5 ${
        isActive
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md'
          : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700/80 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top: Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {variant.isUploaded ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
                <UploadCloud className="w-3 h-3 text-sky-500 shrink-0" />
                <span>Uploaded</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Variant</span>
              </span>
            )}

            {isActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active in Studio
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onRenameClick(variant)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Rename resume"
              aria-label={`Rename ${variant.displayName}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteClick(variant)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete resume variant"
              aria-label={`Delete ${variant.displayName}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {variant.displayName}
        </h3>

        {/* Target Meta */}
        <div className="mt-2.5 space-y-1.5">
          {variant.targetJobTitle ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{variant.targetJobTitle}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>General engineering variant</span>
            </div>
          )}

          {variant.targetCompany && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{variant.targetCompany}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Date and Open in Studio CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>

        {isActive ? (
          <button
            onClick={() => onOpenEditor?.(variant.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span>Edit in Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            {onSelect && (
              <button
                onClick={onSelect}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Select variant to view ATS diagnostics"
              >
                Select
              </button>
            )}
            <button
              onClick={() => onOpenEditor?.(variant.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 transition-all cursor-pointer active:scale-95"
              title="Open and edit this resume in Visual Editor"
            >
              <span>Edit in Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
