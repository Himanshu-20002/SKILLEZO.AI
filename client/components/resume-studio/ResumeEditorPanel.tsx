'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  Wand2,
  Sliders,
  ChevronRight,
  ArrowLeft,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  FileText,
  Code2,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Plus,
} from 'lucide-react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult, SectionScore } from '@/types/resume-scoring.types';
import { SectionImprovementSuggestion } from '@/types/resume-editor.types';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { ResumeAnalysisData } from '@/types/resume';
import { SectionAiWorkspace } from './SectionAiWorkspace';
import { StudioViewMode } from './ResumeStudioSidebar';
import {
  Sparkles,
  Gauge,
  Target,
  Zap,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

import { useTailoringInsights } from '@/hooks/useTailoringInsights';
import { TailoringInsightsPanel } from './tailoring-insights';
import { ResumeRecord } from '@/types/resume';
import { ResumeComparisonResult } from '@/types/resume-comparison.types';
import { TailoringInsightCategory, StudioSectionKey } from '@/types/tailoring-insights.types';

// Code-split builder controls for optimal performance
const ResumeBuilderControls = dynamic(
  () => import('./builder').then((mod) => mod.ResumeBuilderControls),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-96 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
      </div>
    ),
  }
);

export interface SectionConfigItem {
  id: keyof ResumeScoreResult['sections'];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SECTION_CONFIGS: SectionConfigItem[] = [
  { id: 'contact', title: 'Contact Information', icon: UserCheck },
  { id: 'summary', title: 'Professional Summary', icon: FileText },
  { id: 'skills', title: 'Technical Skills', icon: Code2 },
  { id: 'experience', title: 'Work Experience', icon: Briefcase },
  { id: 'projects', title: 'Projects', icon: FolderGit2 },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'achievements', title: 'Achievements & Certifications', icon: Award },
];

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-blue-600 dark:text-blue-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

interface ResumeEditorPanelProps {
  viewMode: StudioViewMode;
  onViewModeChange: (mode: StudioViewMode) => void;
  activeView: 'overview' | 'detail';
  onActiveViewChange: (view: 'overview' | 'detail') => void;
  activeSectionKey: keyof ResumeScoreResult['sections'];
  onSelectSection: (key: keyof ResumeScoreResult['sections']) => void;
  scoreResult: ResumeScoreResult | null;
  analysis?: ResumeAnalysisData;
  targetRole?: string;
  builderConfig: ResumeBuilderConfig;
  onBuilderConfigChange: (config: ResumeBuilderConfig) => void;
  isGenerating: boolean;
  isApplying: boolean;
  currentSuggestion: SectionImprovementSuggestion | null;
  scoreDeltaNotice: { section: string; from: number; to: number } | null;
  onGenerateSuggestion: (instruction?: string) => void;
  onApproveSuggestion: () => void;
  onRejectSuggestion: () => void;
  onTriggerUpload: () => void;
  isUploading: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onFileInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentResume?: ResumeRecord | null;
  diffResult?: ResumeComparisonResult | null;
  onOpenComparison?: () => void;
  onNavigateToSection?: (
    category: TailoringInsightCategory,
    sectionKey: StudioSectionKey | null,
    entityId?: string
  ) => void;
  document?: ResumeDocument | null;
  onAddSectionToCanvas?: (key: keyof ResumeScoreResult['sections']) => void;
}

export const ResumeEditorPanel: React.FC<ResumeEditorPanelProps> = ({
  viewMode,
  onViewModeChange,
  activeView,
  onActiveViewChange,
  activeSectionKey,
  onSelectSection,
  scoreResult,
  analysis,
  targetRole = 'Full-Stack Engineer',
  builderConfig,
  onBuilderConfigChange,
  isGenerating,
  isApplying,
  currentSuggestion,
  scoreDeltaNotice,
  onGenerateSuggestion,
  onApproveSuggestion,
  onRejectSuggestion,
  onTriggerUpload,
  isUploading,
  fileInputRef: _fileInputRef,
  onFileInputChange: _onFileInputChange,
  currentResume,
  diffResult,
  onOpenComparison,
  onNavigateToSection,
  document,
  onAddSectionToCanvas,
}) => {
  const isTailored = currentResume?.variantType === 'TAILORED';
  const [overviewTab, setOverviewTab] = React.useState<'insights' | 'health'>('health');

  const isSectionMissing = React.useMemo(() => {
    if (!document) return false;
    if (activeSectionKey === 'experience') return !document.experience || document.experience.length === 0;
    if (activeSectionKey === 'projects') return !document.projects || document.projects.length === 0;
    if (activeSectionKey === 'skills') return !document.skills || document.skills.length === 0;
    if (activeSectionKey === 'education') return !document.education || document.education.length === 0;
    if (activeSectionKey === 'summary') return !document.summary?.text || document.summary.text.trim().length === 0;
    if (activeSectionKey === 'achievements') return !document.achievements || document.achievements.length === 0;
    return false;
  }, [document, activeSectionKey]);

  // Fetch tailoring insights only for Tailored variants (0 network calls on Master)
  const {
    viewModel: tailoringInsights,
    isLoading: isInsightsLoading,
    error: insightsError,
    refetch: refetchInsights,
  } = useTailoringInsights(
    currentResume?._id,
    currentResume?.targetJobId,
    currentResume?.variantType,
    diffResult
  );

  const handleNavigateFromInsights = (
    category: TailoringInsightCategory,
    sectionKey: StudioSectionKey | null,
    entityId?: string
  ) => {
    if (onNavigateToSection) {
      onNavigateToSection(category, sectionKey, entityId);
    } else if (sectionKey) {
      onSelectSection(sectionKey as any);
      onActiveViewChange('detail');
      onViewModeChange('editor');
    }
  };

  const selectedSectionData: SectionScore | undefined = scoreResult?.sections[activeSectionKey];
  const selectedConfig = SECTION_CONFIGS.find((s) => s.id === activeSectionKey);

  // Exact explainable scores
  const atsScore = analysis?.atsScore ?? scoreResult?.overall?.overallScore ?? 78;
  const roleMatchScore = analysis?.matchScore ?? 75;
  const impactScore = analysis?.impactScore ?? 72;
  const brevityScore = analysis?.brevityScore ?? 80;

  // Filter prioritized actionable improvement items
  const recommendations = analysis?.recommendations || [];

  return (
    <div className="space-y-4">
      {/* Sub-Switch: Content vs Design Settings */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => onViewModeChange('editor')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode !== 'builder'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Workspace</span>
          </button>

          <button
            onClick={() => onViewModeChange('builder')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'builder'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Design Settings</span>
          </button>
        </div>

        {/* Upload Button */}
        {viewMode !== 'builder' && (
          <button
            onClick={onTriggerUpload}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Upload New Resume for ATS Analysis"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{isUploading ? 'Analyzing...' : 'Upload'}</span>
          </button>
        )}
      </div>

      {/* CONTEXT 1: Design Controls (viewMode === 'builder') */}
      {viewMode === 'builder' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Visual Presentation & Typography
            </h3>
            <span className="text-[11px] text-slate-400">Auto-saved to Resume</span>
          </div>
          <ResumeBuilderControls
            config={builderConfig}
            onChange={onBuilderConfigChange}
          />
        </div>
      ) : (
        /* CONTEXT 2: AI Workspace — Score ALWAYS visible at top, Section Analysis ALWAYS below it */
        <div className="space-y-4">
          {/* A. RESUME HEALTH & EXPLAINABLE SCORING (ALWAYS PRESENT) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Resume Health &amp; Explainable Scoring
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Role: {targetRole}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">ATS Score</span>
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{atsScore}</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Role Match</span>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{roleMatchScore}%</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Impact</span>
                <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{impactScore}%</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Brevity</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{brevityScore}%</p>
              </div>
            </div>

            <button
              onClick={() => onViewModeChange('audit')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>View Full ATS Diagnostics &amp; Breakdown</span>
            </button>
          </div>

          {/* B. Sub-tab toggle strictly for Tailored variants */}
          {isTailored && (
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOverviewTab('health')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  overviewTab === 'health'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Section AI &amp; Health</span>
              </button>

              <button
                type="button"
                onClick={() => setOverviewTab('insights')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  overviewTab === 'insights'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tailoring Insights</span>
              </button>
            </div>
          )}

          {isTailored && overviewTab === 'insights' ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <TailoringInsightsPanel
                viewModel={tailoringInsights}
                isLoading={isInsightsLoading}
                error={insightsError}
                onRefetch={refetchInsights}
                onOpenComparison={onOpenComparison}
                onNavigateToSection={handleNavigateFromInsights}
              />
            </div>
          ) : (
            <>
              {/* Score Delta Notification Banner */}
              {scoreDeltaNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      <strong>{scoreDeltaNotice.section}</strong> score updated from {scoreDeltaNotice.from} → {scoreDeltaNotice.to}!
                    </span>
                  </div>
                </div>
              )}


              {/* Add to Canvas Prompt Card if Section is Missing from Resume */}
              {isSectionMissing && onAddSectionToCanvas && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      {selectedConfig?.title || 'This section'} is not on your resume canvas
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Add this section with a starter template to start editing directly on the live A4 canvas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddSectionToCanvas(activeSectionKey)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Canvas</span>
                  </button>
                </div>
              )}

              {/* Section AI Workspace */}
              {selectedSectionData && selectedConfig ? (
                <SectionAiWorkspace
                  sectionData={selectedSectionData}
                  icon={selectedConfig.icon}
                  isGenerating={isGenerating}
                  isApplying={isApplying}
                  currentSuggestion={currentSuggestion}
                  onGenerate={onGenerateSuggestion}
                  onApply={onApproveSuggestion}
                  onDismissSuggestion={onRejectSuggestion}
                />
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              )}

              {/* Prioritized Improvements */}
              {recommendations.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Prioritized Improvements
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {recommendations.length} items
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {recommendations.slice(0, 4).map((rec, idx) => {
                      const sec = (rec.targetSection || '').toLowerCase();
                      const targetSecKey: keyof ResumeScoreResult['sections'] =
                        sec.includes('experience') || sec.includes('work')
                          ? 'experience'
                          : sec.includes('skill')
                          ? 'skills'
                          : sec.includes('project')
                          ? 'projects'
                          : sec.includes('education')
                          ? 'education'
                          : sec.includes('contact')
                          ? 'contact'
                          : 'summary';

                      return (
                        <div
                          key={rec.id || idx}
                          className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                              {rec.category || 'Content'}
                            </span>
                            {rec.impactScoreBoost && (
                              <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                +{rec.impactScoreBoost} ATS pts
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {rec.problem || rec.description || rec.summary || rec.title}
                          </p>

                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                onSelectSection(targetSecKey);
                                onActiveViewChange('detail');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                            >
                              <span>Review in AI</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
