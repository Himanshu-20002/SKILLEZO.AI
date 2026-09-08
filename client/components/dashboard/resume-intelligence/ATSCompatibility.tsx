'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  FileCheck,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { ResumeAuditPillars, ATSCompatibilityItem } from '@/types/resume';

interface ATSCompatibilityProps {
  auditPillars?: ResumeAuditPillars;
  items?: ATSCompatibilityItem[];
  targetRole?: string;
}

export const ATSCompatibility: React.FC<ATSCompatibilityProps> = ({
  auditPillars,
  items,
  targetRole = 'Senior Full Stack Engineer',
}) => {
  // Fallback defaults if auditPillars is not yet populated
  const formatting = auditPillars?.formatting || {
    score: 92,
    status: 'Passed' as const,
    summary: 'Clean, single-column parsable structure with full contact info',
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
    summary: '3+ quantifiable metrics detected across experience bullets',
    tip: 'Great job using action verbs and measurable performance metrics.',
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
  const isKeywordsHigh = keywordAlignment.score >= 70;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 space-y-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] backdrop-blur-md">
      {/* Header with Clear Purpose */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#3D5AFE]/15 to-[#00D9C0]/15 dark:from-[#3D5AFE]/25 dark:to-[#00D9C0]/20 text-[#3D5AFE] dark:text-[#00D9C0] border border-[#3D5AFE]/20 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Resume Health & Recruiter Readiness Audit
              </h2>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              4 core checkpoints evaluated for maximum ATS parsing accuracy & recruiter impact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Target className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0]" />
          <span>Role Target: <strong className="text-slate-900 dark:text-white">{targetRole}</strong></span>
        </div>
      </div>

      {/* 4 Core Health Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pillar 1: ATS Formatting & Readability */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. ATS Formatting
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isFormattingPassed
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                }`}
              >
                {formatting.status}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
              {formatting.summary}
            </p>

            <ul className="space-y-1 pt-1">
              {formatting.details.slice(0, 3).map((detail, idx) => (
                <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Readability Score</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatting.score}%</span>
          </div>
        </div>

        {/* Pillar 2: Target Role Keyword Alignment */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-[#3D5AFE]/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-indigo-400">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Keyword Match
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isKeywordsHigh
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                }`}
              >
                {keywordAlignment.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {keywordAlignment.matchedCount} of {keywordAlignment.totalTargetCount} Skills Found
              </p>
              <span className="text-xs font-black text-[#3D5AFE] dark:text-[#00D9C0]">
                {keywordAlignment.score}%
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, keywordAlignment.score)}%` }}
              />
            </div>

            {keywordAlignment.missingCritical.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  Missing High-Priority:
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {keywordAlignment.missingCritical.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                    >
                      +{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Core Keyword Fit</span>
            <span className="font-bold text-[#3D5AFE] dark:text-indigo-400">{keywordAlignment.matchedCount} Active</span>
          </div>
        </div>

        {/* Pillar 3: Quantifiable Bullet Impact */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-[#00897B] dark:text-[#00D9C0]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Measurable Impact
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isImpactGood
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                }`}
              >
                {measurableImpact.status}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
              {measurableImpact.summary}
            </p>

            <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40">
              <p className="text-[11px] text-blue-900 dark:text-blue-200 font-medium leading-tight">
                💡 <span className="font-bold">Tip:</span> {measurableImpact.tip}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Quantified Bullets</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{measurableImpact.metricsCount} Metrics</span>
          </div>
        </div>

        {/* Pillar 4: Section Checklist & Length */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  4. Section Checklist
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                {sectionStructure.wordCountStatus}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['Contact Info', 'Experience', 'Skills', 'Education'].map((sec, i) => {
                const isDetected = sectionStructure.detectedSections.some((d) =>
                  d.toLowerCase().includes(sec.toLowerCase().split(' ')[0])
                );
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isDetected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {isDetected ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                    <span>{sec}</span>
                  </span>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Word Count: <strong className="text-slate-800 dark:text-slate-200">{sectionStructure.wordCount} words</strong> (Ideal: 450–850)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Structure Score</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{sectionStructure.score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
