'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ResumeAnalysisData, ResumeRecord, AIResumeRecommendation } from '@/types/resume';
import { ResumeScoreResult } from '@/types/resume-scoring.types';
import { AuditPillarType } from '@/components/dashboard/resume-intelligence/ATSCompatibility';

// Code-split heavy ATS diagnostics view for snappy initial paints
const AtsDiagnosticsView = dynamic(
  () => import('./AtsDiagnosticsView').then((mod) => mod.AtsDiagnosticsView),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6" />
        <div className="h-44 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6" />
      </div>
    ),
  }
);

interface ResumeInsightsPanelProps {
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  analysis: ResumeAnalysisData;
  activePillar: AuditPillarType;
  onSelectPillar: (pillar: AuditPillarType) => void;
  onOpenEditor: () => void;
  onUploadClick: () => void;
  isUploading: boolean;
  onOptimize: (rec: AIResumeRecommendation) => void;
  isOptimizing: boolean;
  optimizingRecId: string | null;
  scoreResult: ResumeScoreResult | null;
  prioritySection: { id: keyof ResumeScoreResult['sections']; title: string; score: number } | null;
  onSectionFixWithAi: (sectionId: string) => void;
  currentResume: ResumeRecord | null;
  onDeleteClick: () => void;
  selectedResumeId?: string | null;
  onSelectResume?: (resumeId: string) => void;
}

export const ResumeInsightsPanel: React.FC<ResumeInsightsPanelProps> = ({
  targetRole,
  onTargetRoleChange,
  analysis,
  activePillar,
  onSelectPillar,
  onOpenEditor,
  onUploadClick,
  isUploading,
  onOptimize,
  isOptimizing,
  optimizingRecId,
  scoreResult,
  prioritySection,
  onSectionFixWithAi,
  currentResume,
  onDeleteClick,
  selectedResumeId,
  onSelectResume,
}) => {
  return (
    <div className="w-full">
      <AtsDiagnosticsView
        targetRole={targetRole}
        onTargetRoleChange={onTargetRoleChange}
        analysis={analysis}
        activePillar={activePillar}
        onSelectPillar={onSelectPillar}
        onOpenEditor={onOpenEditor}
        onUploadClick={onUploadClick}
        isUploading={isUploading}
        onOptimize={onOptimize}
        isOptimizing={isOptimizing}
        optimizingRecId={optimizingRecId}
        scoreResult={scoreResult}
        prioritySection={prioritySection as any}
        onSectionFixWithAi={onSectionFixWithAi}
        currentResume={currentResume}
        onDeleteClick={onDeleteClick}
        selectedResumeId={selectedResumeId}
        onSelectResume={onSelectResume}
      />
    </div>
  );
};
