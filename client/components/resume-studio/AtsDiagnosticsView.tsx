'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Wand2, 
  RefreshCw, 
  UploadCloud, 
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { ResumeAnalysisData, AIResumeRecommendation, ResumeRecord } from '@/types/resume';
import { ResumeScoreResult } from '@/types/resume-scoring.types';
import { ResumeScoreCard } from '@/components/dashboard/resume-intelligence/ResumeScoreCard';
import { ATSCompatibility, AuditPillarType } from '@/components/dashboard/resume-intelligence/ATSCompatibility';
import { PillarDetailInspector } from '@/components/dashboard/resume-intelligence/PillarDetailInspector';
import { AIRecommendations } from '@/components/dashboard/resume-intelligence/AIRecommendations';
import { AtsPortfolioSection } from './AtsPortfolioSection';

const TARGET_ROLES = [
  'Full-Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Specialist',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
];

interface AtsDiagnosticsViewProps {
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  analysis: ResumeAnalysisData;
  activePillar: AuditPillarType;
  onSelectPillar: (pillar: AuditPillarType) => void;
  onOpenEditor: (resumeId?: string) => void;
  onUploadClick: () => void;
  isUploading: boolean;
  onOptimize: (rec: AIResumeRecommendation) => void;
  isOptimizing: boolean;
  optimizingRecId: string | null;
  scoreResult: ResumeScoreResult | null;
  prioritySection?: { id: string; title: string; score: number } | null;
  onSectionFixWithAi: (sectionId: string) => void;
  currentResume?: ResumeRecord | null;
  onDeleteClick?: () => void;
  selectedResumeId?: string | null;
  onSelectResume?: (resumeId: string) => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  portfolioVersion?: number;
}

export const AtsDiagnosticsView: React.FC<AtsDiagnosticsViewProps> = React.memo(({
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
  onDeleteClick: _onDeleteClick,
  selectedResumeId,
  onSelectResume,
  onDownloadPdf,
  isDownloadingPdf,
  portfolioVersion,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header with Title & Target Role Benchmarking */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Resume Intelligence Engine</span>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                AI Powered
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative ATS scoring, target role alignment, 4 audit pillars, and deep keyword inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target Role Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-xs text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Target Role:</span>
            <select
              value={targetRole}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Jump to Edit & Design */}
          <button
            onClick={() => onOpenEditor()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20 transition-all cursor-pointer"
            title="Open Edit & Design Workspace"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Open Edit & Design</span>
          </button>

          {/* Upload New Resume */}
          <button
            onClick={onUploadClick}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Upload New Resume for ATS Analysis"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{isUploading ? 'Analyzing...' : 'Upload Resume'}</span>
          </button>
        </div>
      </div>

      {/* Upload Callout if no resume analyzed yet */}
      {scoreResult === null && (
        <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload Your Master Resume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload your PDF to calculate your real ATS score, role keyword density, and bullet improvements.
              </p>
            </div>
          </div>
          <button
            onClick={onUploadClick}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Analyzing...' : 'Upload Resume'}</span>
          </button>
        </div>
      )}

      {/* Active Resume Information & Management Card */}
      {currentResume && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentResume.title || currentResume.originalFileName || currentResume.fileName || 'Active Master Resume'}
                </span>
                {currentResume.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentResume.fileSize ? `${Math.round(currentResume.fileSize / 1024)} KB • ` : ''}
                Uploaded {new Date(currentResume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => onOpenEditor()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer"
              title="Open and view resume in Visual Editor"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Resume</span>
            </button>

            {onDownloadPdf ? (
              <button
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                title="Download formatted resume as PDF"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingPdf ? 'Downloading...' : 'Download Resume'}</span>
              </button>
            ) : (currentResume?._id || currentResume?.id) ? (
              <a
                href={`/api/resumes/${currentResume._id || currentResume.id}/download`}
                download
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                title="Download resume file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Resume</span>
              </a>
            ) : null}
          </div>
        </div>
      )}

      {/* 2. Primary 3-Pillar Independent Score Header (ATS, Match, Content) */}
      <ResumeScoreCard
        atsScore={scoreResult ? analysis.atsScore : 0}
        matchScore={scoreResult ? (analysis.matchScore ?? 0) : 0}
        contentScore={scoreResult ? (analysis.contentScore ?? 0) : 0}
        targetRole={targetRole}
      />

      {/* 3. Resume Portfolio & Variants Cards Section */}
      <AtsPortfolioSection
        selectedResumeId={selectedResumeId}
        onSelectResume={onSelectResume}
        onOpenEditor={onOpenEditor}
        portfolioVersion={portfolioVersion}
      />

      {/* 4. Primary Action Layer: Prioritized Recommendations */}
      <div className="space-y-4">
        <AIRecommendations
          recommendations={analysis.recommendations}
          topAction={analysis.topAction}
          onOptimize={onOptimize}
          isOptimizing={isOptimizing}
          optimizingRecId={optimizingRecId}
        />
      </div>

      {/* 4. Secondary Layer: Diagnostic Deep-Dive Inspection (4 Pillars Tabs) */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Audit Pillars & Keyword Deep Dive
            </h3>
            <p className="text-xs text-slate-400">
              Select a pillar below to inspect keywords, impact formulas, formatting, and structural checks.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 self-start sm:self-auto">
            Role: {targetRole}
          </span>
        </div>

        <ATSCompatibility
          auditPillars={analysis.auditPillars}
          items={analysis.atsCompatibility}
          targetRole={targetRole}
          activePillar={activePillar}
          onSelectPillar={onSelectPillar}
        />

        <PillarDetailInspector
          activePillar={activePillar}
          analysis={analysis}
          targetRole={targetRole}
        />
      </div>
    </div>
  );
});

AtsDiagnosticsView.displayName = 'AtsDiagnosticsView';
