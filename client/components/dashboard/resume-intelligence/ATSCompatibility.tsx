'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  FileCheck2,
  Layers,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
} from 'lucide-react';
import { ResumeAuditPillars, ATSCompatibilityItem } from '@/types/resume';

export type AuditPillarType = 'formatting' | 'keywords' | 'impact' | 'structure';

interface ATSCompatibilityProps {
  auditPillars?: ResumeAuditPillars;
  items?: ATSCompatibilityItem[];
  targetRole?: string;
  activePillar?: AuditPillarType;
  onSelectPillar?: (pillar: AuditPillarType) => void;
}

export const ATSCompatibility: React.FC<ATSCompatibilityProps> = ({
  auditPillars,
  items,
  targetRole = 'Senior Full Stack Engineer',
  activePillar = 'impact',
  onSelectPillar,
}) => {
  // Fallback defaults if auditPillars is not yet populated
  const formatting = auditPillars?.formatting || {
    score: 92,
    status: 'Passed' as const,
    summary: 'Clean single-column parsable structure',
    details: ['Full candidate name verified', 'Contact email detected', 'Single-column layout compliant'],
  };

  const keywordAlignment = auditPillars?.keywordAlignment || {
    score: 84,
    matchedCount: 14,
    totalTargetCount: 18,
    status: 'High Alignment' as const,
    topMatched: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL'],
    missingCritical: ['CI/CD Pipelines', 'Docker'],
  };

  const measurableImpact = auditPillars?.measurableImpact || {
    score: 80,
    metricsCount: 3,
    status: 'Strong Impact' as const,
    summary: '3+ quantifiable metrics across experience',
    tip: "Add metrics like 'reduced latency by 30%' or 'served 10k+ users'",
  };

  const sectionStructure = auditPillars?.sectionStructure || {
    score: 95,
    detectedSections: ['Contact Information', 'Work Experience', 'Technical Skills', 'Education', 'Projects / Summary'],
    missingSections: [],
    wordCount: 580,
    wordCountStatus: 'Optimal (1 Page)' as const,
  };

  const isFormattingPassed = formatting.status === 'Passed';
  const isImpactGood = measurableImpact.metricsCount >= 2;
  const isKeywordsHigh = keywordAlignment.score >= 75;

  // Shorten status strings so badges never wrap awkwardly
  const getKeywordStatusText = (status: string, score: number) => {
    if (score >= 80) return 'Strong Fit';
    if (score >= 60) return 'Moderate Fit';
    return 'Low Match';
  };

  const getImpactStatusText = (status: string, count: number) => {
    if (count >= 3) return 'High Impact';
    if (count >= 1) return 'Needs Metrics';
    return 'No Metrics';
  };

  const getSectionStatusText = (status: string) => {
    if (status.includes('Optimal')) return 'Optimal Length';
    if (status.includes('Long')) return 'Slightly Long';
    return 'Incomplete';
  };

  const handleCardClick = (pillar: AuditPillarType) => {
    if (onSelectPillar) {
      onSelectPillar(pillar);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Resume Health & Recruiter Readiness Audit
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any pillar below to inspect detailed diagnostics and AI action recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300">
          <Target className="w-3.5 h-3.5 text-[#3D5AFE]" />
          <span>Target: <strong className="text-slate-900 dark:text-white font-semibold">{targetRole}</strong></span>
        </div>
      </div>

      {/* 4 Clean Interactive Pillar Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5 pt-6">
        {/* Pillar 1: ATS Formatting */}
        <button
          type="button"
          onClick={() => handleCardClick('formatting')}
          className={`group text-left rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            activePillar === 'formatting'
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-500 shadow-sm ring-2 ring-emerald-500/10'
              : 'bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-850'
          }`}
        >
          <div className="space-y-3.5 w-full">
            {/* Top row: Label + Badge */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                activePillar === 'formatting' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                1. Formatting
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isFormattingPassed
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                  }`}
                >
                  {formatting.status}
                </span>
                {activePillar === 'formatting' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                    Viewing
                  </span>
                )}
              </div>
            </div>

            {/* Title / Summary */}
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
              {formatting.summary}
            </p>

            {/* Clean Checklist */}
            <div className="space-y-2 pt-1">
              {formatting.details.slice(0, 3).map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span className="truncate">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Metric Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Readability Score
              <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {formatting.score}%
            </span>
          </div>
        </button>

        {/* Pillar 2: Keyword Match */}
        <button
          type="button"
          onClick={() => handleCardClick('keywords')}
          className={`group text-left rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            activePillar === 'keywords'
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-2 border-[#3D5AFE] dark:border-indigo-500 shadow-sm ring-2 ring-[#3D5AFE]/10'
              : 'bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-850'
          }`}
        >
          <div className="space-y-3.5 w-full">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                activePillar === 'keywords' ? 'text-[#3D5AFE] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                2. Keyword Match
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    isKeywordsHigh
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
                  }`}
                >
                  {getKeywordStatusText(keywordAlignment.status, keywordAlignment.score)}
                </span>
                {activePillar === 'keywords' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3D5AFE] dark:bg-indigo-600 text-white shadow-2xs">
                    Viewing
                  </span>
                )}
              </div>
            </div>

            {/* Score & Progress */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {keywordAlignment.matchedCount} of {keywordAlignment.totalTargetCount} Skills
                </span>
                <span className="text-xs font-bold text-[#3D5AFE] dark:text-indigo-400">
                  {keywordAlignment.score}%
                </span>
              </div>
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3D5AFE] dark:bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, keywordAlignment.score)}%` }}
                />
              </div>
            </div>

            {/* Missing Critical */}
            {keywordAlignment.missingCritical.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                  Missing Skills:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywordAlignment.missingCritical.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60"
                    >
                      +{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clean Metric Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Active Keywords
              <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {keywordAlignment.matchedCount} Found
            </span>
          </div>
        </button>

        {/* Pillar 3: Measurable Impact */}
        <button
          type="button"
          onClick={() => handleCardClick('impact')}
          className={`group text-left rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            activePillar === 'impact'
              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-400 shadow-sm ring-2 ring-amber-500/10'
              : 'bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-850'
          }`}
        >
          <div className="space-y-3.5 w-full">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                activePillar === 'impact' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                3. Measurable Impact
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    isImpactGood
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                  }`}
                >
                  {getImpactStatusText(measurableImpact.status, measurableImpact.metricsCount)}
                </span>
                {activePillar === 'impact' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white shadow-2xs">
                    Viewing
                  </span>
                )}
              </div>
            </div>

            {/* Title / Summary */}
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
              {measurableImpact.summary}
            </p>

            {/* Clean, subtle tip note */}
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-100/60 dark:bg-slate-800/60 rounded-lg p-2.5 border border-slate-200/50 dark:border-slate-700/50">
              <span className="font-semibold text-slate-900 dark:text-slate-200">💡 Tip: </span>
              {measurableImpact.tip}
            </div>
          </div>

          {/* Clean Metric Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Quantified Bullets
              <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {measurableImpact.metricsCount} Detected
            </span>
          </div>
        </button>

        {/* Pillar 4: Section Checklist */}
        <button
          type="button"
          onClick={() => handleCardClick('structure')}
          className={`group text-left rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            activePillar === 'structure'
              ? 'bg-purple-50/40 dark:bg-purple-950/20 border-2 border-purple-500 dark:border-purple-400 shadow-sm ring-2 ring-purple-500/10'
              : 'bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-850'
          }`}
        >
          <div className="space-y-3.5 w-full">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                activePillar === 'structure' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                4. Section Structure
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 whitespace-nowrap">
                  {getSectionStatusText(sectionStructure.wordCountStatus)}
                </span>
                {activePillar === 'structure' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white shadow-2xs">
                    Viewing
                  </span>
                )}
              </div>
            </div>

            {/* Checklist Chips in a clean single row / wrap */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {['Contact Info', 'Experience', 'Skills', 'Education'].map((sec, i) => {
                const isDetected = sectionStructure.detectedSections.some((d) =>
                  d.toLowerCase().includes(sec.toLowerCase().split(' ')[0])
                );
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    {isDetected ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate">{sec}</span>
                  </div>
                );
              })}
            </div>

            {/* Word Count */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Length: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{sectionStructure.wordCount} words</strong>{' '}
              <span className="text-[10px] text-slate-400 dark:text-slate-500">(250–800 ideal)</span>
            </div>
          </div>

          {/* Clean Metric Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Structure Score
              <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {sectionStructure.score}%
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
