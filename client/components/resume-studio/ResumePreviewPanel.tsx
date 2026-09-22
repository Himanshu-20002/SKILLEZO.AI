'use client';

import React from 'react';
import { Wand2 } from 'lucide-react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { LiveResumeCanvas } from './LiveResumeCanvas';
import { SECTION_CONFIGS } from './ResumeEditorPanel';
import { StudioViewMode } from './ResumeStudioSidebar';

interface ResumePreviewPanelProps {
  document: ResumeDocument | null;
  config: ResumeBuilderConfig;
  highlightSectionId?: string | null;
  onSectionClick?: (sectionId: string) => void;
  onJumpToImprove?: (sectionId: string) => void;
  isVisibleOnMobile?: boolean;
  viewMode?: StudioViewMode;
  onViewModeChange?: (mode: StudioViewMode) => void;
  className?: string;
}

export const ResumePreviewPanel: React.FC<ResumePreviewPanelProps> = ({
  document,
  config,
  highlightSectionId,
  onSectionClick,
  onJumpToImprove,
  isVisibleOnMobile = false,
  viewMode,
  onViewModeChange,
  className = '',
}) => {
  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Quick Section Jump Navigation Bar */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5 no-scrollbar">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider px-1 shrink-0">Jump:</span>
          {SECTION_CONFIGS.map((s) => {
            const isSelected = highlightSectionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSectionClick?.(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {onJumpToImprove && (
          <button
            onClick={() => onJumpToImprove(highlightSectionId || 'experience')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Improve in AI</span>
          </button>
        )}
      </div>

      {/* Live Resume Canvas View with Zoom Controls */}
      <LiveResumeCanvas
        document={document}
        config={config}
        highlightSectionId={highlightSectionId}
        onSectionClick={onSectionClick}
        isVisibleOnMobile={isVisibleOnMobile}
      />
    </div>
  );
};

