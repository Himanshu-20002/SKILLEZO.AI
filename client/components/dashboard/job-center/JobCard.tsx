'use client';

import React from 'react';
import {
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Job } from '@/types/job-center';
import { JobMatchScore } from './JobMatchScore';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  isApplied?: boolean;
  onSaveToggle: (id: string) => void;
  onViewDetails: (job: Job) => void;
  onWhyMatches: (job: Job) => void;
  onApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  isApplied = false,
  onSaveToggle,
  onViewDetails,
  onWhyMatches,
  onApply,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm hover:border-[#3D5AFE]/40 dark:hover:border-[#3D5AFE]/40 transition-all duration-300 group">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#3D5AFE]/20 to-[#00D9C0]/20 text-[#3D5AFE] dark:text-[#00D9C0] flex items-center justify-center font-bold text-lg shrink-0 border border-[#3D5AFE]/20">
            {job.company.substring(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-[#3D5AFE] dark:group-hover:text-[#00D9C0] transition-colors">
                {job.title}
              </h3>
              {job.verified && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                  Verified Employer
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              {job.company} • <span className="text-slate-500 dark:text-slate-400">{job.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <JobMatchScore score={job.matchScore} />
          <button
            onClick={() => onWhyMatches(job)}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#3D5AFE] dark:hover:text-[#00D9C0] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Why this job matches your profile"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attributes Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/60 dark:border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          {job.location} ({job.workMode})
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/60 dark:border-slate-700">
          <Briefcase className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          {job.experienceText} • {job.employmentType}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-extrabold border border-emerald-500/30">
          {job.salaryText}
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-auto">
          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-400" />
          {job.postedTimeAgo}
        </span>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Skills Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {job.skills.map((skill, idx) => {
          const isMatched = job.matchBreakdown.matchedSkills.includes(skill);
          return (
            <span
              key={idx}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                isMatched
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              {isMatched ? `✓ ${skill}` : skill}
            </span>
          );
        })}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/60 gap-3">
        <button
          onClick={() => onSaveToggle(job.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isSaved
              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" /> : <Bookmark className="w-4 h-4 text-slate-500" />}
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(job)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => onApply(job)}
            disabled={isApplied}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isApplied
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-sm'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isApplied ? 'Applied ✓' : 'Apply with AI Resume'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
