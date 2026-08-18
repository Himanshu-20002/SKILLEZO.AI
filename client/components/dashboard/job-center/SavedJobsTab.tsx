'use client';

import React from 'react';
import { BookmarkCheck, Search } from 'lucide-react';
import { Job } from '@/types/job-center';
import { JobCard } from './JobCard';

interface SavedJobsTabProps {
  savedJobs: Job[];
  appliedJobIds: string[];
  onRemoveSaved: (id: string) => void;
  onViewDetails: (job: Job) => void;
  onWhyMatches: (job: Job) => void;
  onApply: (job: Job) => void;
  onExplore: () => void;
}

export const SavedJobsTab: React.FC<SavedJobsTabProps> = ({
  savedJobs,
  appliedJobIds,
  onRemoveSaved,
  onViewDetails,
  onWhyMatches,
  onApply,
  onExplore,
}) => {
  if (savedJobs.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
        <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-500">
          <BookmarkCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Saved Jobs Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Bookmark interesting jobs while searching to compare salary, skills, and application deadlines later.
          </p>
        </div>
        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3D5AFE] text-white text-xs font-semibold hover:bg-[#3D5AFE]/90 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Explore Recommended Jobs</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Bookmarked Jobs ({savedJobs.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {savedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={true}
            isApplied={appliedJobIds.includes(job.id)}
            onSaveToggle={onRemoveSaved}
            onViewDetails={onViewDetails}
            onWhyMatches={onWhyMatches}
            onApply={onApply}
          />
        ))}
      </div>
    </div>
  );
};
