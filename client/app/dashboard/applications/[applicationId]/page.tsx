'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ArrowLeft,
  Building,
  MapPin,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  FileCheck,
  Lock,
  ShieldCheck,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  MessageSquare,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { applicationService } from '@/services/application.service';
import {
  ApplicationRecord,
  ApplicationStatus,
  getApplicationStatusLabel,
} from '@/types/application';
import { ApplicationSnapshotModal } from '@/components/applications/ApplicationSnapshotModal';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ applicationId: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.applicationId;
  const router = useRouter();

  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status mutation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionReason, setTransitionReason] = useState('');

  // Note state
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Snapshot modal state
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getApplicationById(applicationId);
      setApplication(data);
    } catch (err: any) {
      const msg = err.message || 'Failed to load application details';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  // Valid next status transitions according to state machine
  const validNextStatuses = useMemo<ApplicationStatus[]>(() => {
    if (!application) return [];
    const current = application.status?.toLowerCase() as ApplicationStatus;

    const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      draft: ['applied', 'withdrawn'],
      applied: ['under_review', 'interview', 'rejected', 'withdrawn'],
      under_review: ['shortlisted', 'interview', 'rejected', 'withdrawn'],
      shortlisted: ['interview', 'rejected', 'withdrawn'],
      interview: ['offered', 'rejected', 'withdrawn'],
      offered: ['hired', 'rejected', 'withdrawn'],
      hired: [],
      rejected: [],
      withdrawn: [],
    };

    return transitions[current] || [];
  }, [application]);

  const handleStatusChange = async (nextStatus: ApplicationStatus) => {
    if (!application) return;

    try {
      setIsTransitioning(true);
      const updated = await applicationService.updateApplicationStatus(
        application.id,
        nextStatus,
        transitionReason.trim() || undefined
      );
      setApplication(updated);
      setTransitionReason('');
      toast.success(`Application stage moved to ${getApplicationStatusLabel(nextStatus)}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !newNote.trim()) return;

    try {
      setIsAddingNote(true);
      const updated = await applicationService.addTimelineNote(application.id, newNote.trim());
      setApplication(updated);
      setNewNote('');
      toast.success('Note added to timeline');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;

    try {
      setIsDeleting(true);
      await applicationService.deleteApplication(application.id);
      toast.success('Application tracking record removed');
      router.push('/dashboard/applications');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete application');
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus | string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'applied':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'under_review':
      case 'shortlisted':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'interview':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'offered':
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'rejected':
      case 'withdrawn':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-24 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading application tracking record...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Application Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {error || 'This application record may have been removed or you do not have permission to view it.'}
          </p>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Applications</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const jobTitle =
    application.jobIdentity?.jobTitle || application.job?.title || 'Role not specified';
  const companyName =
    application.jobIdentity?.companyName || application.job?.companyName || 'Company not specified';
  const jobUrl = application.jobIdentity?.jobUrl || application.job?.jobUrl || null;
  const location = application.jobIdentity?.location || application.job?.location || null;

  const appliedDate = application.appliedAt
    ? new Date(application.appliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Back Link */}
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>

        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {jobTitle}
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                    application.status
                  )}`}
                >
                  {getApplicationStatusLabel(application.status)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{companyName}</span>
                </div>

                {location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{location}</span>
                  </div>
                )}

                {jobUrl && (
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    <span>External Job Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {application.resumeSnapshot && (
                <button
                  onClick={() => setIsSnapshotOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>View Resume Snapshot</span>
                </button>
              )}

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete Application Record"
                aria-label="Delete Application Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Progression Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {appliedDate ? (
                <span>Applied on <span className="font-semibold text-slate-700 dark:text-slate-300">{appliedDate}</span></span>
              ) : (
                <span>Status is currently in <span className="font-semibold text-slate-700 dark:text-slate-300">Draft</span> stage</span>
              )}
            </div>

            {/* Valid Transitions Selector */}
            <div className="flex items-center gap-2">
              {application.status === 'draft' && (
                <button
                  onClick={() => handleStatusChange('applied')}
                  disabled={isTransitioning}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Mark as Applied</span>
                </button>
              )}

              {validNextStatuses.length > 0 && (
                <div className="relative inline-flex items-center">
                  <select
                    disabled={isTransitioning}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleStatusChange(e.target.value as ApplicationStatus);
                    }}
                    className="pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none hover:bg-slate-200/80 transition-colors"
                  >
                    <option value="" disabled>
                      {isTransitioning ? 'Updating Stage...' : 'Advance Stage →'}
                    </option>
                    {validNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        {getApplicationStatusLabel(st)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Timeline & Notes (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Application Timeline
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {application.statusHistory.length} Event{application.statusHistory.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {application.statusHistory
                  .slice()
                  .reverse()
                  .map((evt, idx) => {
                    const evtDate = new Date(evt.changedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const isNote = evt.type === 'NOTE_ADDED';

                    return (
                      <div key={evt.id || idx} className="relative flex items-start gap-3 pl-1">
                        <div
                          className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            isNote
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {isNote ? <MessageSquare className="w-3 h-3" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {evt.type === 'CREATED' && 'Tracking Record Created'}
                              {evt.type === 'APPLIED' && 'Marked as Applied'}
                              {evt.type === 'STATUS_CHANGED' && (
                                <>
                                  Status Changed to{' '}
                                  <span className="text-indigo-600 dark:text-indigo-400">
                                    {getApplicationStatusLabel(evt.toStatus || evt.status)}
                                  </span>
                                </>
                              )}
                              {evt.type === 'NOTE_ADDED' && 'Candidate Note Added'}
                            </span>
                            <span className="text-[11px] text-slate-400">{evtDate}</span>
                          </div>

                          {evt.fromStatus && evt.toStatus && evt.type === 'STATUS_CHANGED' && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Transition: {getApplicationStatusLabel(evt.fromStatus)} → {getApplicationStatusLabel(evt.toStatus)}
                            </p>
                          )}

                          {evt.note && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 pt-0.5 leading-relaxed">
                              {evt.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Candidate Notes Input */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Add Personal Note
                </h3>
              </div>

              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record recruiter remarks, interview follow-ups, or notes..."
                  className="w-full p-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAddingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Resume Used & Provenance (1/3) */}
          <div className="space-y-6">
            {/* Resume Used Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Resume Used
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Document Title:</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {application.resumeSnapshot?.title || application.resume?.title || 'Tailored Resume'}
                  </div>
                </div>

                {application.resumeSnapshot?.capturedAt && (
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Snapshot Captured:</span>
                    <div className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                      {new Date(application.resumeSnapshot.capturedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}

                {application.resumeSnapshot?.snapshotHash && (
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Integrity Checksum:</span>
                    <div
                      className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all mt-0.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80"
                      title={application.resumeSnapshot.snapshotHash}
                    >
                      {application.resumeSnapshot.snapshotHash.substring(0, 16)}...
                    </div>
                  </div>
                )}

                {application.resumeSnapshot && (
                  <button
                    onClick={() => setIsSnapshotOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>View Historical Snapshot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Target Job Info Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Job Context
              </h3>

              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-[11px] text-slate-400">Role:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{jobTitle}</div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Company:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{companyName}</div>
                </div>

                {jobUrl && (
                  <div>
                    <span className="text-[11px] text-slate-400">Listing:</span>
                    <div>
                      <a
                        href={jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        <span>Open Posting</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Viewer Modal */}
      {application.resumeSnapshot && (
        <ApplicationSnapshotModal
          isOpen={isSnapshotOpen}
          onClose={() => setIsSnapshotOpen(false)}
          snapshot={application.resumeSnapshot}
          jobTitle={jobTitle}
          companyName={companyName}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Application Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will delete this application tracking record and timeline. Your Tailored Resume and Job Profile will remain intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
