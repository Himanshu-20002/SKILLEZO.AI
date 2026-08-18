'use client';

import React, { useState } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/types/job-center';
import { ApplicationTimeline } from './ApplicationTimeline';

interface AppliedJobsTrackerProps {
  applications: JobApplication[];
}

export const AppliedJobsTracker: React.FC<AppliedJobsTrackerProps> = ({ applications }) => {
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const filtered = applications.filter(
    (app) => filterStatus === 'All' || app.status === filterStatus
  );

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'Interview Scheduled':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'Shortlisted':
        return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
      case 'Under Review':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAppId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
        {(['All', 'Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Application Cards List */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          No applications match the selected status filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const isExpanded = expandedAppId === app.id;
            return (
              <div
                key={app.id}
                className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#3D5AFE] flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{app.jobTitle}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {app.company} • Applied on {app.appliedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
                      <Sparkles className="w-3 h-3" />
                      {app.matchScore}% Match
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>

                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Next Step Info */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#3D5AFE]" />
                    Next Step: {app.nextStep}
                  </span>

                  <button
                    onClick={() => toggleExpand(app.id)}
                    className="text-[#3D5AFE] dark:text-[#00D9C0] font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    {isExpanded ? 'Hide Timeline' : 'View Timeline'}
                  </button>
                </div>

                {/* Timeline Dropdown */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <ApplicationTimeline timeline={app.timeline} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
