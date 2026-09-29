'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Briefcase,
  Search,
  Filter,
  Calendar,
  Building,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Inbox,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { ApplicationListItem, ApplicationStatus, getApplicationStatusLabel } from '@/types/application';

export default function ApplicationsPage() {
  const router = useRouter();
  const {
    applications,
    total,
    loading,
    error,
    filters,
    setStatusFilter,
    setSearchQuery,
    refresh,
  } = useApplications();

  // Calculate Metrics from applications
  const metrics = useMemo(() => {
    let draft = 0;
    let applied = 0;
    let screening = 0;
    let interview = 0;
    let offer = 0;
    let closed = 0;

    applications.forEach((app) => {
      const s = app.status?.toLowerCase();
      if (s === 'draft') draft++;
      else if (s === 'applied') applied++;
      else if (s === 'under_review' || s === 'shortlisted') screening++;
      else if (s === 'interview') interview++;
      else if (s === 'offered' || s === 'hired') offer++;
      else if (s === 'rejected' || s === 'withdrawn') closed++;
    });

    return {
      total: applications.length,
      draft,
      applied,
      screening,
      interview,
      offer,
      closed,
      active: applications.length - closed,
    };
  }, [applications]);

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Drafts' },
    { key: 'applied', label: 'Applied' },
    { key: 'interview', label: 'Interview' },
    { key: 'offered', label: 'Offers' },
    { key: 'withdrawn', label: 'Closed' },
  ];

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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Applications
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your job applications and the exact tailored resume version used for each.
            </p>
          </div>

          <Link
            href="/dashboard/resume-studio"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Resume Studio</span>
          </Link>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tracked</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.total}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Applied</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.applied}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Interviewing</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.interview}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Offers</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.offer}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Drafts</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.draft}
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filters.status === tab.key
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={filters.search}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Applications List Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading tracked applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No applications tracked yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When you tailor a resume for an analyzed job profile, you can save a historical tracking record with an immutable snapshot.
              </p>
            </div>
            <Link
              href="/dashboard/resume-studio"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <span>Go to Resume Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => {
              const appliedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              const createdDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={app.id}
                  onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Status badge & source badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {getApplicationStatusLabel(app.status)}
                      </span>

                      {app.source === 'job_intelligence' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Intelligence</span>
                        </span>
                      )}
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {app.jobTitle || 'Role not specified'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{app.companyName || 'Company not specified'}</span>
                      </div>
                      {app.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{app.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Tailored Resume Tag */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Resume:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[170px]">
                        {app.resumeTitle || 'Tailored Resume'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Dates & Arrow */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{appliedDate ? `Applied: ${appliedDate}` : `Drafted: ${createdDate}`}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
