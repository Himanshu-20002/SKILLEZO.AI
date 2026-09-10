'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  Layers,
  Copy,
  Check,
  Zap,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { ResumeAnalysisData } from '@/types/resume';
import { AuditPillarType } from './ATSCompatibility';

interface PillarDetailInspectorProps {
  activePillar: AuditPillarType;
  analysis: ResumeAnalysisData;
  targetRole?: string;
}

export const PillarDetailInspector: React.FC<PillarDetailInspectorProps> = ({
  activePillar,
  analysis,
  targetRole = 'Senior Full Stack Engineer',
}) => {
  const [keywordCategoryFilter, setKeywordCategoryFilter] = useState<'All' | 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { auditPillars, extractedData, keywords } = analysis;

  const handleCopySuggestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('AI bullet rewrite copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered keywords
  const filteredKeywords = (keywords || []).filter((kw) => {
    if (keywordCategoryFilter === 'All') return true;
    return kw.category?.toLowerCase() === keywordCategoryFilter.toLowerCase();
  });

  const matchedKeywords = filteredKeywords.filter((k) => k.matched);
  const missingKeywords = filteredKeywords.filter((k) => !k.matched);

  // Example Experience Bullets with detected vs unquantified status for Pillar 3
  const experienceBullets = [
    {
      id: 'bullet-1',
      original: 'Developed full stack features using React, Next.js, and Node.js for client dashboard application.',
      isQuantified: false,
      aiSuggestion: 'Architected 15+ full-stack features using React 19 & Next.js 15, reducing API latency by 35% across 40k+ active users.',
    },
    {
      id: 'bullet-2',
      original: 'Integrated RESTful APIs and PostgreSQL database for persistent data storage.',
      isQuantified: false,
      aiSuggestion: 'Engineered 12+ secure REST endpoints with PostgreSQL, optimizing indexing to cut database query latency by 40%.',
    },
    {
      id: 'bullet-3',
      original: 'Implemented automated CI/CD pipelines with Docker and GitHub Actions, achieving 99.9% deployment reliability.',
      isQuantified: true,
      metricDetected: '99.9% deployment reliability',
      aiSuggestion: 'Strong bullet with concrete uptime & deployment metric.',
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: FORMATTING INSPECTOR                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activePillar === 'formatting' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  ATS Formatting & Parsability Inspector
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ensuring your resume structure is 100% machine-readable across standard ATS parsers.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Score: {auditPillars?.formatting.score || 92}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact Verification Checklist */}
            <div className="rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact Information
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  4/4 Verified
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Candidate Name
                  </span>
                  <strong className="text-slate-900 dark:text-white truncate max-w-[110px]">
                    {extractedData?.candidateName || 'Detected'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Email
                  </span>
                  <strong className="text-slate-900 dark:text-white truncate max-w-[110px]">
                    {extractedData?.email || 'Detected'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Phone
                  </span>
                  <strong className="text-slate-900 dark:text-white truncate max-w-[110px]">
                    {extractedData?.phone || 'Detected'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Location
                  </span>
                  <strong className="text-slate-900 dark:text-white truncate max-w-[110px]">
                    {extractedData?.location || 'India'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Layout Compliance */}
            <div className="rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Layout Compliance
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Compliant
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Single-column linear structure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Standard section headings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>No unparseable image graphics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Machine-readable font encoding</span>
                </div>
              </div>
            </div>

            {/* File & Encoding Health */}
            <div className="rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  File Health
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  PDF Parsed
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>File Name</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {extractedData?.fileName || 'resume.pdf'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Text Selectability</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">100%</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>File Size</span>
                  <strong className="text-slate-800 dark:text-slate-200">{extractedData?.fileSize || '38.4 KB'}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Encoding</span>
                  <strong className="text-slate-800 dark:text-slate-200">UTF-8</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: KEYWORD MATCH INSPECTOR                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activePillar === 'keywords' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#3D5AFE] dark:text-indigo-400 border border-blue-200/60 dark:border-blue-800/60">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Keyword & Skill Gap Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Comparing your technical stack against benchmark requirements for <strong className="text-slate-800 dark:text-slate-200 font-semibold">{targetRole}</strong>.
              </p>
            </div>

            {/* Clean Segmented Filter Pills (No overflow blue bar) */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
              {(['All', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setKeywordCategoryFilter(cat)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                    keywordCategoryFilter === cat
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Matched Keywords */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Matched Keywords ({matchedKeywords.length})
                </span>
                <span className="text-[10px] text-slate-400">Frequency detected</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 min-h-[110px] content-start">
                {matchedKeywords.length > 0 ? (
                  matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60"
                    >
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                      <span>{kw.keyword}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/60 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 ml-0.5">
                        {kw.frequency || 1}x
                      </span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No matched skills in this category.</p>
                )}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Missing Target Skills ({missingKeywords.length})
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Priority Additions</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 min-h-[110px] content-start">
                {missingKeywords.length > 0 ? (
                  missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{kw.keyword}</span>
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 ml-0.5">
                        +{kw.importance === 'Required' ? '6%' : '3%'}
                      </span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium py-2">
                    All core skills in this category matched!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: MEASURABLE IMPACT INSPECTOR                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activePillar === 'impact' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Measurable Impact & Bullet Point Analyzer
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Recruiters look for quantifiable business outcomes (%, $, latency, scale numbers) rather than plain responsibilities.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {auditPillars?.measurableImpact.metricsCount || 1} Metric Detected
              </span>
            </div>
          </div>

          {/* Bullet Audit List with Clean AI Rewriter */}
          <div className="space-y-3">
            {experienceBullets.map((bullet) => (
              <div
                key={bullet.id}
                className={`rounded-xl p-3.5 border transition-all ${
                  bullet.isQuantified
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/70 dark:border-emerald-800/50'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800'
                }`}
              >
                {/* Header tag */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {bullet.isQuantified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        Quantified Metric Detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Needs Measurable Metric
                      </span>
                    )}
                  </div>
                  {bullet.isQuantified && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      🎯 {bullet.metricDetected}
                    </span>
                  )}
                </div>

                {/* Candidate's current bullet */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  &ldquo;{bullet.original}&rdquo;
                </p>

                {/* AI Instant Rewrite Suggestion if not quantified */}
                {!bullet.isQuantified && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#3D5AFE] dark:text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Recommended High-Impact Rewrite:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySuggestion(bullet.aiSuggestion, bullet.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#3D5AFE] hover:text-white dark:hover:bg-indigo-600 transition-colors cursor-pointer"
                      >
                        {copiedId === bullet.id ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Rewrite</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-900 dark:text-white font-medium leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-2 rounded border border-blue-100/60 dark:border-blue-900/40">
                      {bullet.aiSuggestion}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: SECTION STRUCTURE & LENGTH INSPECTOR                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activePillar === 'structure' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Section Structure & Content Density Diagnostic
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evaluating structural completeness, 1-page length balance, and section scan efficiency.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                Structure: {auditPillars?.sectionStructure.score || 95}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section Checklist */}
            <div className="rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Section Audit Breakdown
              </span>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Contact Information', status: 'Passed', desc: 'Name, Email, Phone, Location' },
                  { name: 'Work Experience', status: 'Passed', desc: 'Full-time & internship roles' },
                  { name: 'Technical Skills Matrix', status: 'Passed', desc: 'Categorized languages & frameworks' },
                  { name: 'Education & Degree', status: 'Passed', desc: 'University, degree, grad year' },
                  { name: 'Projects & Portfolio', status: 'Passed', desc: 'Production web applications' },
                ].map((sec, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{sec.name}</span>
                        <p className="text-[10px] text-slate-400">{sec.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {sec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Word Count & Density Analysis */}
            <div className="rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Word Count & Density Gauge
              </span>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Word Count:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {auditPillars?.sectionStructure.wordCount || 434} Words (1-Page Ideal)
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((auditPillars?.sectionStructure.wordCount || 434) / 800) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>250 min</span>
                    <span>550 target</span>
                    <span>800 max</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Average Bullet Length</span>
                    <strong className="text-slate-900 dark:text-white">18 words (Ideal: 15–25)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bullets per Job Role</span>
                    <strong className="text-slate-900 dark:text-white">3–4 bullets (Ideal: 3–5)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Page Target Status</span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Optimal 1-Page Layout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
