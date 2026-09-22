'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Code2,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  UserCheck,
  ChevronRight,
  Plus,
  ArrowLeftRight,
  FileCheck,
  Layers,
} from 'lucide-react';
import { ResumeRecord } from '@/types/resume';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult } from '@/types/resume-scoring.types';

export interface DynamicSectionItem {
  key: keyof ResumeScoreResult['sections'];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isPresent: boolean;
  score?: number;
  ratingTier?: string;
  isOptimal: boolean;
  issueCount: number;
}

const SECTION_METADATA_MAP: Record<
  keyof ResumeScoreResult['sections'],
  { defaultTitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  contact: { defaultTitle: 'Contact Information', icon: UserCheck },
  summary: { defaultTitle: 'Professional Summary', icon: FileText },
  skills: { defaultTitle: 'Technical Skills', icon: Code2 },
  experience: { defaultTitle: 'Work Experience', icon: Briefcase },
  projects: { defaultTitle: 'Projects', icon: FolderGit2 },
  education: { defaultTitle: 'Education', icon: GraduationCap },
  achievements: { defaultTitle: 'Achievements & Certifications', icon: Award },
};

interface ResumeSectionNavigatorProps {
  currentResume: ResumeRecord | null;
  isCurrentResumeMaster?: boolean;
  document: ResumeDocument | null;
  scoreResult: ResumeScoreResult | null;
  activeSectionKey: keyof ResumeScoreResult['sections'];
  onSelectSection: (key: keyof ResumeScoreResult['sections']) => void;
  resumes?: ResumeRecord[];
  onSelectResume?: (id: string) => void;
  onViewAtsAndPortfolio?: () => void;
  className?: string;
}

export const ResumeSectionNavigator: React.FC<ResumeSectionNavigatorProps> = ({
  currentResume,
  isCurrentResumeMaster = false,
  document,
  scoreResult,
  activeSectionKey,
  onSelectSection,
  resumes = [],
  onSelectResume,
  onViewAtsAndPortfolio,
  className = '',
}) => {
  // Dynamically derive section items based on active document and existing scoreResult
  const dynamicSections = useMemo<DynamicSectionItem[]>(() => {
    const keys: (keyof ResumeScoreResult['sections'])[] = [
      'contact',
      'summary',
      'experience',
      'skills',
      'projects',
      'education',
      'achievements',
    ];

    return keys.map((key) => {
      const meta = SECTION_METADATA_MAP[key];
      const sectionScore = scoreResult?.sections?.[key];

      // Check existence in document AST
      let isPresent = false;
      if (document) {
        if (key === 'contact') isPresent = Boolean(document.contact?.fullName || document.contact?.email);
        else if (key === 'summary') isPresent = Boolean(document.summary?.text && document.summary.text.trim().length > 0);
        else if (key === 'experience') isPresent = Boolean(document.experience && document.experience.length > 0);
        else if (key === 'skills') isPresent = Boolean(document.skills && document.skills.length > 0);
        else if (key === 'projects') isPresent = Boolean(document.projects && document.projects.length > 0);
        else if (key === 'education') isPresent = Boolean(document.education && document.education.length > 0);
        else if (key === 'achievements') isPresent = Boolean(document.achievements && document.achievements.length > 0);
      } else {
        isPresent = true;
      }

      const ratingTier = sectionScore?.tier;
      const issues = [...(sectionScore?.weaknesses || []), ...(sectionScore?.deductions || [])];
      const isOptimal = (ratingTier === 'Excellent' || ratingTier === 'Strong' || ratingTier === 'Good') && issues.length === 0;

      return {
        key,
        title: sectionScore?.title || meta.defaultTitle,
        icon: meta.icon,
        isPresent,
        score: sectionScore?.score,
        ratingTier,
        isOptimal,
        issueCount: issues.length,
      };
    });
  }, [document, scoreResult]);

  // Compute document stats
  const documentStats = useMemo(() => {
    if (!document) return { wordCount: 0, pageEstimate: 1 };
    let text = '';
    if (document.summary?.text) text += document.summary.text + ' ';
    if (document.experience) {
      document.experience.forEach((e) => {
        const bulletTexts = (e.bullets || []).map((b: any) => typeof b === 'string' ? b : b.text || '').join(' ');
        text += `${e.jobTitle || ''} ${e.companyName || ''} ${bulletTexts} `;
      });
    }
    if (document.projects) {
      document.projects.forEach((p) => {
        text += `${p.title || ''} ${p.description || ''} ${(p.bullets || []).join(' ')} `;
      });
    }
    if (document.skills) {
      document.skills.forEach((s) => {
        text += `${s.name || ''} `;
      });
    }
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const pageEstimate = words > 480 ? 2 : 1;
    return { wordCount: words, pageEstimate };
  }, [document]);

  return (
    <aside
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 shadow-xs ${className}`}
      aria-label="Resume Structure and Navigation"
    >
      {/* 1. Resume Identity Block */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Active Resume
          </span>
          {isCurrentResumeMaster ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <span>Master</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Variant</span>
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={currentResume?.title || 'Master Resume'}>
          {currentResume?.title || 'Master Resume'}
        </h3>

        {!isCurrentResumeMaster && (currentResume?.targetJobTitle || currentResume?.targetCompany) && (
          <div className="flex flex-wrap gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            {currentResume.targetJobTitle && <span>Target: {currentResume.targetJobTitle}</span>}
            {currentResume.targetCompany && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">@ {currentResume.targetCompany}</span>
            )}
          </div>
        )}

        {/* Quick Switcher Dropdown if multiple resumes exist */}
        {resumes.length > 1 && (
          <div className="pt-1">
            <select
              value={currentResume?._id || ''}
              onChange={(e) => onSelectResume && onSelectResume(e.target.value)}
              className="w-full text-xs py-1 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
              aria-label="Switch Active Resume"
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.variantType === 'MASTER' ? '⭐ ' : '🎯 '}
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Section Checklist Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Resume Sections
          </span>
          <span className="text-[11px] text-slate-400">
            {dynamicSections.filter((s) => s.isOptimal).length}/{dynamicSections.length} Optimal
          </span>
        </div>

        {/* Section List Items */}
        <nav className="space-y-1" aria-label="Section List">
          {dynamicSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSectionKey === section.key;

            return (
              <button
                key={section.key}
                onClick={() => onSelectSection(section.key)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isActive
                          ? 'text-indigo-950 dark:text-indigo-200'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {section.title}
                    </p>
                  </div>
                </div>

                {/* Health Status Indicator (derived from ScoreRatingTier & issues) */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {section.isOptimal ? (
                    <span
                      title="Section is well-structured and optimal"
                      className="text-emerald-500 dark:text-emerald-400 p-0.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span
                      title={`${section.issueCount || 1} item(s) need attention`}
                      className="text-amber-500 dark:text-amber-400 p-0.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {section.score !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        section.isOptimal
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {section.score}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                        : 'text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Document Metrics Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pages</span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {documentStats.pageEstimate} {documentStats.pageEstimate === 1 ? 'Page' : 'Pages'}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Words</span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {documentStats.wordCount || '~450'}
            </p>
          </div>
        </div>

        {/* Link to Resume Portfolio & ATS View */}
        {onViewAtsAndPortfolio ? (
          <button
            onClick={onViewAtsAndPortfolio}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View All Resumes & Scores</span>
          </button>
        ) : (
          <Link
            href="/dashboard/resume-studio?view=audit"
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View All Resumes & Scores</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
