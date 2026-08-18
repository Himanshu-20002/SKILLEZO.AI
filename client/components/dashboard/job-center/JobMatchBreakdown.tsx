'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Job } from '@/types/job-center';

interface JobMatchBreakdownProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobMatchBreakdown: React.FC<JobMatchBreakdownProps> = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  const { matchBreakdown } = job;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Match Score Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{job.title} at {job.company}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breakdown Metric Sub-scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Overall Match</span>
            <span className="text-xl font-extrabold text-[#3D5AFE] dark:text-[#00D9C0] block">
              {matchBreakdown.overallScore}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Skill Match</span>
            <span className="text-xl font-extrabold text-emerald-500 block">
              {matchBreakdown.skillMatchScore}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Experience</span>
            <span className="text-xl font-extrabold text-cyan-500 block">
              {matchBreakdown.experienceMatchScore}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Location Match</span>
            <span className="text-xl font-extrabold text-purple-500 block">
              {matchBreakdown.locationMatchScore}%
            </span>
          </div>
        </div>

        {/* Matched & Missing Skills */}
        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Matched Technical Skills ({matchBreakdown.matchedSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchBreakdown.matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {matchBreakdown.missingSkills.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Missing / Recommended Gaps ({matchBreakdown.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchBreakdown.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30"
                  >
                    ⚠ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI Recommendation
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {matchBreakdown.recommendation}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
