'use client';

import React, { useState } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Sparkles,
  FileText,
  Ban,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/types/job-center';
import { getApplicationStatusLabel } from '@/types/application';
import { ApplicationTimeline } from './ApplicationTimeline';
import { toast } from 'sonner';

interface AppliedJobsTrackerProps {
  applications: JobApplication[];
  onWithdraw?: (applicationId: string, jobId: string) => Promise<void>;
}

export const AppliedJobsTracker: React.FC<AppliedJobsTrackerProps> = ({
  applications,
  onWithdraw,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    if (filterStatus === 'All') return true;
    const label = getApplicationStatusLabel(app.status);
    return app.status === filterStatus || label === filterStatus;
  });

  const getStatusBadge = (status: ApplicationStatus | string) => {
    const key = status?.toLowerCase();
    switch (key) {
      case 'offer':
      case 'offered':
      case 'hired':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'interview scheduled':
      case 'interview':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'shortlisted':
        return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
      case 'under review':
      case 'under_review':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'rejected':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'withdrawn':
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAppId((prev) => (prev === id ? null : id));
  };

  const handleWithdraw = async (applicationId: string, jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      return;
    }

    try {
      setWithdrawingId(applicationId);
      if (onWithdraw) {
        await onWithdraw(applicationId, jobId);
      }
    } catch (err: any) {
      console.error('[AppliedTracker] Failed to withdraw application:', err);
      toast.error(err.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
        {(['All', 'Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected', 'Withdrawn'] as const).map(
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
            const statusLower = (app.status || '').toLowerCase();
            const isWithdrawable = !['withdrawn', 'rejected', 'hired', 'offered'].includes(statusLower);
            const displayStatus = getApplicationStatusLabel(app.status);

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
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{app.company} • Applied on {app.appliedDate}</span>
                        {app.resumeUsed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <FileText className="w-3 h-3 text-[#3D5AFE]" />
                            {app.resumeUsed}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
                      <Sparkles className="w-3 h-3" />
                      {app.matchScore}% Match
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                      {displayStatus}
                    </span>

                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Next Step & Action Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#3D5AFE]" />
                    Next Step: {app.nextStep}
                  </span>

                  <div className="flex items-center gap-3">
                    {isWithdrawable && onWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id, app.jobId, app.jobTitle)}
                        disabled={withdrawingId === app.id}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="text-[#3D5AFE] dark:text-[#00D9C0] font-bold text-[11px] hover:underline cursor-pointer"
                    >
                      {isExpanded ? 'Hide Timeline' : 'View Timeline'}
                    </button>
                  </div>
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
