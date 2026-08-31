'use client';

import React from 'react';
import {
  X,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Send,
  Building2,
  GraduationCap,
  ShieldCheck,
  ExternalLink,
  Globe,
  Building,
} from 'lucide-react';
import { Job } from '@/types/job-center';
import { JobMatchScore } from './JobMatchScore';

interface JobDetailsDrawerProps {
  job: Job | null;
  isOpen: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  onClose: () => void;
  onSaveToggle: (id: string) => void;
  onApply: (job: Job) => void;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({
  job,
  isOpen,
  isSaved = false,
  isApplied = false,
  onClose,
  onSaveToggle,
  onApply,
}) => {
  if (!isOpen || !job) return null;

  const isExternal = job.sourceType === 'EXTERNAL';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border ${
              isExternal
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-gradient-to-tr from-[#3D5AFE]/20 to-[#00D9C0]/20 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/20'
            }`}>
              {job.company.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{job.title}</h2>
                {isExternal ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    Aggregated via {job.sourceName || 'Jooble'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0] border border-[#3D5AFE]/30">
                    <Building className="w-3.5 h-3.5" />
                    Direct Platform Job
                  </span>
                )}
                {job.verified && !isExternal && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                    Verified Employer
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {job.company} • {job.department}
              </p>
              <div className="pt-1">
                <JobMatchScore score={job.matchScore} size="lg" />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-xs">
          {/* Quick Details Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#3D5AFE]" /> Location & Mode
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">{job.location} ({job.workMode})</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" /> Compensation
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">{job.salaryText}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Experience
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">{job.experienceText}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#3D5AFE]" />
              Role Description
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{job.description}</p>

            {job.sourceType === "EXTERNAL" && job.sourceUrl && (
              <div className="p-3.5 mt-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Aggregated Job Summary Preview
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    This posting is indexed from {job.sourceProvider || "Jooble"}. The full comprehensive job specification, salary breakdown, and direct application form are hosted on the employer&apos;s career site.
                  </p>
                  <a
                    href={`/api/jobs/${job.id}/redirect`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline pt-0.5"
                  >
                    <span>View full posting on {job.sourceProvider || "original site"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Key Responsibilities */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Key Responsibilities</h3>
            <ul className="space-y-1.5 pl-2">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="text-[#3D5AFE] font-bold">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Required Skills & Candidate Match</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill, idx) => {
                const isMatched = job.matchBreakdown.matchedSkills.some(
                  (s) => s.toLowerCase() === skill.toLowerCase()
                );
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      isMatched
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isMatched ? `✓ ${skill} (Matched)` : `⚠ ${skill} (Missing)`}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Education & Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#3D5AFE]" />
                Education Requirement
              </span>
              <p className="text-slate-600 dark:text-slate-300">{job.education}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Company Perks
              </span>
              <div className="flex flex-wrap gap-1">
                {job.perks.map((perk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div className="p-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => onSaveToggle(job.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSaved
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? 'Saved Job' : 'Save Job'}</span>
          </button>

          <div className="flex items-center gap-2">
            {job.sourceUrl && (
              <a
                href={`/api/jobs/${job.id}/redirect`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Verify and open original external posting"
              >
                <span>Original Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => {
                onClose();
                onApply(job);
              }}
              disabled={isApplied}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer ${
                isApplied
                  ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 cursor-default'
                  : 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isApplied ? 'Application Submitted ✓' : 'Apply with AI Resume'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
