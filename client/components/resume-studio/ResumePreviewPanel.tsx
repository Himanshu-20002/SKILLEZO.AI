'use client';

import React from 'react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { LiveResumeCanvas } from './LiveResumeCanvas';
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

