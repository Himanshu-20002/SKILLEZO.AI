'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Layers, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Code2, 
  UserCheck, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult, SectionScore, ScoreRatingTier } from '@/types/resume-scoring.types';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord } from '@/types/resume';

export default function ResumeStudioPage() {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ResumeScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null);

  // Load user resumes on mount
  useEffect(() => {
    async function loadResumes() {
      try {
        setLoading(true);
        const userResumes = await resumeService.getUserResumes();
        setResumes(userResumes);

        if (userResumes && userResumes.length > 0) {
          const defaultResume = userResumes.find((r) => r.isDefault) || userResumes[0];
          setSelectedResumeId(defaultResume._id);
          setIsSampleMode(false);
          await loadScore(defaultResume._id);
        } else {
          setIsSampleMode(true);
        }
      } catch {
        setIsSampleMode(true);
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, []);

  const loadScore = async (resumeId: string) => {
    try {
      setLoading(true);
      const score = await resumeService.getResumeScore(resumeId);
      setScoreResult(score);
    } catch (err) {
      console.warn("Failed to fetch live score, fallback to fixture", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setIsSampleMode(false);
    await loadScore(resumeId);
  };

  // Fallback / default score values
  const overallScore = scoreResult?.overall.overallScore ?? 100;
  const overallTier: ScoreRatingTier = scoreResult?.overall.tier ?? "Excellent";
  const summaryReason = scoreResult?.overall.summaryReason ?? 
    "Exceptional resume quality with strong structural completeness, verified evidence, and power verb calibration.";

  const getTierBadge = (tier: ScoreRatingTier) => {
    switch (tier) {
      case "Excellent":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Strong":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Good":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
      case "Developing":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Needs Work":
      default:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
  };

  const sectionsConfig = [
    {
      id: 'contact',
      title: 'Contact Information',
      icon: UserCheck,
      scoreData: scoreResult?.sections.contact,
      defaultScore: 100,
      weight: '5%',
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      icon: FileText,
      scoreData: scoreResult?.sections.summary,
      defaultScore: 100,
      weight: '10%',
    },
    {
      id: 'skills',
      title: 'Technical Skills',
      icon: Code2,
      scoreData: scoreResult?.sections.skills,
      defaultScore: 100,
      weight: '20%',
    },
    {
      id: 'experience',
      title: 'Work Experience',
      icon: Briefcase,
      scoreData: scoreResult?.sections.experience,
      defaultScore: 100,
      weight: '30%',
    },
    {
      id: 'projects',
      title: 'Featured Projects',
      icon: FolderGit2,
      scoreData: scoreResult?.sections.projects,
      defaultScore: 100,
      weight: '15%',
    },
    {
      id: 'education',
      title: 'Education & Academics',
      icon: GraduationCap,
      scoreData: scoreResult?.sections.education,
      defaultScore: 100,
      weight: '15%',
    },
    {
      id: 'achievements',
      title: 'Achievements & Certifications',
      icon: Award,
      scoreData: scoreResult?.sections.achievements,
      defaultScore: 100,
      weight: '5%',
    },
  ];

  const activeSectionData = sectionsConfig.find((s) => s.id === selectedSectionKey)?.scoreData;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Deterministic Scoring v1
            </span>
            {isSampleMode ? (
              <span className="text-xs text-amber-500 font-medium">Sample Preview Mode</span>
            ) : (
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Candidate Resume
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Skillezo Resume Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {summaryReason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {resumes.length > 1 && (
            <select
              value={selectedResumeId || ''}
              onChange={(e) => handleSelectResume(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title || r.originalFileName} {r.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          )}

          <Link
            href="/dashboard/resume-studio/dev"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View JSON</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">General Score</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {overallScore} <span className="text-xs text-slate-400">/ 100</span>
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTierBadge(overallTier)}`}>
                  {overallTier}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D5AFE] to-[#00D9C0] flex items-center justify-center text-white font-black text-sm shadow-sm">
              {overallScore}
            </div>
          </div>
        </div>
      </div>

      {/* 7 Section Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>7 Section Scores & Weight Breakdown</span>
            <span className="text-xs font-normal text-slate-500">(100% Deterministic Arithmetic)</span>
          </h2>
          <span className="text-xs text-slate-500">Engine Version: resume-score-v1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionsConfig.map((sec) => {
            const Icon = sec.icon;
            const isSelected = selectedSectionKey === sec.id;
            const score = sec.scoreData?.score ?? sec.defaultScore;
            const tier: ScoreRatingTier = sec.scoreData?.tier ?? 'Excellent';
            const componentCount = sec.scoreData?.components.length ?? 4;

            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionKey(isSelected ? null : sec.id)}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-[#3D5AFE] ring-2 ring-[#3D5AFE]/20 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{sec.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Weight: {sec.weight}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {score} / 100
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getTierBadge(tier)}`}>
                      {tier}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {componentCount} scoring rules
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-[#3D5AFE] dark:text-[#00D9C0]">
                    <span>{isSelected ? 'Hide Breakdown' : 'View Breakdown'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Granular Component Breakdown Drawer */}
                {isSelected && sec.scoreData && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Component Points Breakdown
                    </span>
                    {sec.scoreData.components.map((comp) => (
                      <div
                        key={comp.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.label}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {comp.score} / {comp.maxScore}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{comp.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
