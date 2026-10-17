'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Sparkles,
  FileText,
  Ban,
  Video,
  MessageSquare,
  ExternalLink,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/types/job-center';
import { getApplicationStatusLabel, HistoricalResumeSnapshot } from '@/types/application';
import { ApplicationTimeline } from './ApplicationTimeline';
import { ApplicationSnapshotModal } from '@/components/applications/ApplicationSnapshotModal';
import { applicationService } from '@/services/application.service';
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
  const [snapshotModalApp, setSnapshotModalApp] = useState<JobApplication | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<HistoricalResumeSnapshot | null>(null);
  const [loadingSnapshotId, setLoadingSnapshotId] = useState<string | null>(null);

  const handleOpenSnapshot = async (app: JobApplication) => {
    if (app.resumeSnapshot) {
      setActiveSnapshot(app.resumeSnapshot);
      setSnapshotModalApp(app);
      return;
    }

    try {
      setLoadingSnapshotId(app.id);
      const fullRecord = await applicationService.getApplicationById(app.id);
      if (fullRecord?.resumeSnapshot) {
        setActiveSnapshot(fullRecord.resumeSnapshot);
        setSnapshotModalApp(app);
      } else {
        toast.info('No frozen resume document found for this application.');
      }
    } catch (err: any) {
      console.error('[AppliedJobsTracker] Failed to load application snapshot:', err);
      toast.error(err.message || 'Could not load resume snapshot.');
    } finally {
      setLoadingSnapshotId(null);
    }
  };

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
            const isWithdrawn = statusLower === 'withdrawn';
            const isWithdrawable = !['withdrawn', 'rejected', 'hired', 'offered'].includes(statusLower);
            const displayStatus = getApplicationStatusLabel(app.status);

            return (
              <div
                key={app.id}
                className={`rounded-2xl p-5 space-y-3 transition-all shadow-sm ${
                  isWithdrawn
                    ? 'bg-slate-50/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isWithdrawn
                          ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          : 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/20 dark:border-[#3D5AFE]/30'
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {app.jobTitle}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        <span>{app.company} • Applied on {app.appliedDate}</span>
                        {app.resumeUsed && (
                          <button
                            type="button"
                            onClick={() => handleOpenSnapshot(app)}
                            disabled={loadingSnapshotId === app.id}
                            title="Click to view submitted resume snapshot"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                              isWithdrawn
                                ? 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80'
                                : 'bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <FileText className={`w-3 h-3 ${isWithdrawn ? 'text-slate-500' : 'text-[#3D5AFE]'}`} />
                            <span>{loadingSnapshotId === app.id ? 'Loading...' : app.resumeUsed}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isWithdrawn
                          ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          : 'bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/20'
                      }`}
                    >
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

                {/* Job Offer Extended Banner */}
                {app.status === 'offered' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Official Job Offer Extended! 🎉</span>
                          {app.offerDetails?.annualCompensation && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                              {app.offerDetails.annualCompensation}
                            </span>
                          )}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {app.offerDetails?.decisionDeadline
                            ? `Decision requested by ${new Date(app.offerDetails.decisionDeadline).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}`
                            : 'Review the offer details, compensation, and respond directly in Messages'}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/messages?appId=${app.id}`}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Review & Respond to Offer</span>
                    </Link>
                  </div>
                )}

                {/* Hired Banner */}
                {app.status === 'hired' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-emerald-700 dark:text-emerald-300">
                          Hired & Onboarded! 🎉
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          You accepted the offer for this role. Welcome aboard!
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/messages?appId=${app.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Link>
                  </div>
                )}

                {/* Interview Action Banner */}
                {app.status === 'interview' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{app.interviewSchedule?.roundTitle || 'Interview Scheduled'}</span>
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {app.interviewSchedule?.scheduledAt
                            ? `Scheduled: ${new Date(app.interviewSchedule.scheduledAt).toLocaleString([], {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : 'Date & Time scheduled by hiring team'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.interviewSchedule?.meetingLink && (
                        <a
                          href={app.interviewSchedule.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                        </a>
                      )}

                      <Link
                        href={`/dashboard/messages?appId=${app.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#3D5AFE]/10 hover:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] font-bold text-xs flex items-center gap-1.5 border border-[#3D5AFE]/20 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>View Chat</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Shortlisted Banner */}
                {app.status === 'shortlisted' && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>You were shortlisted! The hiring team opened a message thread with you.</span>
                    </span>
                    <Link
                      href={`/dashboard/messages?appId=${app.id}`}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs shrink-0"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Open Chat</span>
                    </Link>
                  </div>
                )}

                {/* Next Step & Action Row */}
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    isWithdrawn
                      ? 'bg-slate-100/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60'
                  }`}
                >
                  <span className={`font-semibold flex items-center gap-1.5 ${isWithdrawn ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                    <Clock className={`w-3.5 h-3.5 ${isWithdrawn ? 'text-slate-500' : 'text-[#3D5AFE]'}`} />
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
                      type="button"
                      onClick={() => handleOpenSnapshot(app)}
                      disabled={loadingSnapshotId === app.id}
                      className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{loadingSnapshotId === app.id ? 'Loading...' : 'View Resume Snapshot'}</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(app.id)}
                      className={`font-bold text-[11px] hover:underline cursor-pointer ${
                        isWithdrawn
                          ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          : 'text-[#3D5AFE] dark:text-[#00D9C0]'
                      }`}
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

      {/* Historical Resume Snapshot Modal */}
      <ApplicationSnapshotModal
        isOpen={!!snapshotModalApp && !!activeSnapshot}
        onClose={() => {
          setSnapshotModalApp(null);
          setActiveSnapshot(null);
        }}
        snapshot={activeSnapshot}
        jobTitle={snapshotModalApp?.jobTitle}
        companyName={snapshotModalApp?.company}
      />
    </div>
  );
};
