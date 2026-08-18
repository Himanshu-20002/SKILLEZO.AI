'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { WorkMode, EmploymentType, ExperienceRange, MatchTier, JobFilterState } from '@/types/job-center';

interface JobFiltersProps {
  filters: JobFilterState;
  onFilterChange: (updated: Partial<JobFilterState>) => void;
  onReset: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const locations = ['All Locations', 'Bangalore', 'Remote', 'Hyderabad', 'Pune', 'Chennai', 'Delhi NCR'];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
          <Filter className="w-4 h-4 text-[#3D5AFE]" />
          <span>Filter Jobs</span>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Work Mode */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Work Mode</label>
          <select
            value={filters.workMode}
            onChange={(e) => onFilterChange({ workMode: e.target.value as WorkMode | 'All' })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="All">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Employment Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Employment Type</label>
          <select
            value={filters.employmentType}
            onChange={(e) => onFilterChange({ employmentType: e.target.value as EmploymentType | 'All' })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Experience */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Experience</label>
          <select
            value={filters.experience}
            onChange={(e) => onFilterChange({ experience: e.target.value as ExperienceRange | 'All' })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="All">All Experience</option>
            <option value="0–1 years">0–1 years</option>
            <option value="1–3 years">1–3 years</option>
            <option value="3–5 years">3–5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>

        {/* Match Score Tier */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">AI Match Score</label>
          <select
            value={filters.matchTier}
            onChange={(e) => onFilterChange({ matchTier: e.target.value as MatchTier })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="All Jobs">All Jobs</option>
            <option value="85%+">85%+ High Match</option>
            <option value="70–85%">70–85% Good Match</option>
          </select>
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Location</label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
