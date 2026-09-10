'use client';

import React, { useState } from 'react';
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
  ArrowUpRight 
} from 'lucide-react';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';
import { ResumeDocument } from '@/types/resume-document';

export default function ResumeStudioPage() {
  const [resumeDoc] = useState<ResumeDocument>(SAMPLE_RESUME_DOCUMENT_FIXTURE);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'contact',
      title: 'Contact Information',
      icon: UserCheck,
      count: resumeDoc.contact.fullName ? `${resumeDoc.contact.links.length} Links` : 'Incomplete',
      score: resumeDoc.scores?.sections.contact.score ?? 100,
      status: resumeDoc.scores?.sections.contact.status ?? 'OPTIMIZED',
      itemsCount: 1,
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      icon: FileText,
      count: `${resumeDoc.summary.yearsOfExperience ?? 3}+ Years Exp`,
      score: resumeDoc.scores?.sections.summary.score ?? 88,
      status: resumeDoc.scores?.sections.summary.status ?? 'OPTIMIZED',
      itemsCount: 1,
    },
    {
      id: 'skills',
      title: 'Technical Skills',
      icon: Code2,
      count: `${resumeDoc.skills.length} Skills`,
      score: resumeDoc.scores?.sections.skills.score ?? 92,
      status: resumeDoc.scores?.sections.skills.status ?? 'OPTIMIZED',
      itemsCount: resumeDoc.skills.length,
    },
    {
      id: 'experience',
      title: 'Work Experience',
      icon: Briefcase,
      count: `${resumeDoc.experience.length} Positions`,
      score: resumeDoc.scores?.sections.experience.score ?? 82,
      status: resumeDoc.scores?.sections.experience.status ?? 'OPTIMIZED',
      itemsCount: resumeDoc.experience.reduce((acc, e) => acc + e.bullets.length, 0),
    },
    {
      id: 'projects',
      title: 'Featured Projects',
      icon: FolderGit2,
      count: `${resumeDoc.projects.length} Projects`,
      score: resumeDoc.scores?.sections.projects.score ?? 86,
      status: resumeDoc.scores?.sections.projects.status ?? 'OPTIMIZED',
      itemsCount: resumeDoc.projects.length,
    },
    {
      id: 'education',
      title: 'Education & Academics',
      icon: GraduationCap,
      count: `${resumeDoc.education.length} Degree`,
      score: resumeDoc.scores?.sections.education.score ?? 95,
      status: resumeDoc.scores?.sections.education.status ?? 'OPTIMIZED',
      itemsCount: resumeDoc.education.length,
    },
    {
      id: 'achievements',
      title: 'Achievements & Certifications',
      icon: Award,
      count: `${resumeDoc.achievements.length} Verified Items`,
      score: resumeDoc.scores?.sections.achievements.score ?? 85,
      status: resumeDoc.scores?.sections.achievements.status ?? 'OPTIMIZED',
      itemsCount: resumeDoc.achievements.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Phase 0 Foundation
            </span>
            <span className="text-xs text-slate-400">Single Source of Truth</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Skillezo Resume Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {resumeDoc.contact.fullName} • <span className="font-semibold text-slate-700 dark:text-slate-300">{resumeDoc.targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/resume-studio/dev"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View JSON Fixture</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {resumeDoc.scores?.overall.overallScore ?? 84} <span className="text-xs text-slate-400">/ 100</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D5AFE] to-[#00D9C0] flex items-center justify-center text-white font-black text-sm shadow-sm">
              84
            </div>
          </div>
        </div>
      </div>

      {/* 4-Pillar Score Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ATS Readiness</span>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {resumeDoc.scores?.overall.atsReadiness ?? 91}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '91%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Match</span>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {resumeDoc.scores?.overall.jobMatch ?? 82}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Content Quality</span>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {resumeDoc.scores?.overall.contentQuality ?? 80}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '80%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Impact Score</span>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {resumeDoc.scores?.overall.impactScore ?? 78}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '78%' }} />
          </div>
        </div>
      </div>

      {/* 7 Section Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>7 Canonical Resume Sections</span>
            <span className="text-xs font-normal text-slate-500">(Independently Addressable)</span>
          </h2>
          <span className="text-xs text-slate-500">ResumeDocument Model v1.0.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isSelected = selectedSection === sec.id;

            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSection(isSelected ? null : sec.id)}
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sec.count}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      {sec.score}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {sec.itemsCount} {sec.itemsCount === 1 ? 'item' : 'items'} detected
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-[#3D5AFE] dark:text-[#00D9C0] group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
