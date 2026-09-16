'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  Activity,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronRight,
  Database,
  Cpu,
  Layers,
  Award,
  Filter,
  Eye,
  ArrowUpRight,
  UserCheck,
  UserX,
  Server,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSession } from '@/lib/auth-client';
import {
  adminService,
  PlatformMetrics,
  AdminUserItem,
  AdminJobItem,
  AdminResumeItem,
} from '@/services/admin.service';
import { API_BASE_URL } from '@/lib/api';

type AdminTab = 'overview' | 'users' | 'jobs' | 'resumes';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTab | null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabParam && ['overview', 'users', 'jobs', 'resumes'].includes(tabParam) ? tabParam : 'overview'
  );

  useEffect(() => {
    if (tabParam && ['overview', 'users', 'jobs', 'resumes'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [tabParam]);

  // Metrics State
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Users Tab State
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Jobs Tab State
  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobSourceFilter, setJobSourceFilter] = useState<string>('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('');
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSyncing, setJobSyncing] = useState(false);
  const [jobPage, setJobPage] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);

  // Resumes Tab State
  const [resumes, setResumes] = useState<AdminResumeItem[]>([]);
  const [resumeSearch, setResumeSearch] = useState('');
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumePage, setResumePage] = useState(1);
  const [resumeTotalPages, setResumeTotalPages] = useState(1);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Check if current user is admin or super-admin
  const isAdmin =
    (session?.user as any)?.role === 'admin' ||
    session?.user?.email?.toLowerCase() === 'admin@gmail.com';

  // 1. Fetch Metrics
  const loadMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const data = await adminService.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load platform metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // 2. Fetch Users
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await adminService.getUsers({
        page: userPage,
        limit: 15,
        search: userSearch,
        role: userRoleFilter || undefined,
        status: userStatusFilter || undefined,
      });
      setUsers(res.users);
      setUserTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userSearch, userRoleFilter, userStatusFilter]);

  // 3. Fetch Jobs
  const loadJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      const res = await adminService.getJobs({
        page: jobPage,
        limit: 15,
        search: jobSearch,
        source: jobSourceFilter || undefined,
        status: jobStatusFilter || undefined,
      });
      setJobs(res.jobs);
      setJobTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  }, [jobPage, jobSearch, jobSourceFilter, jobStatusFilter]);

  // 4. Fetch Resumes
  const loadResumes = useCallback(async () => {
    try {
      setResumesLoading(true);
      const res = await adminService.getResumes({
        page: resumePage,
        limit: 15,
        search: resumeSearch,
      });
      setResumes(res.resumes);
      setResumeTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      console.error('Failed to load resumes:', err);
    } finally {
      setResumesLoading(false);
    }
  }, [resumePage, resumeSearch]);

  // Initial Load
  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin, loadMetrics]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'jobs') loadJobs();
    if (activeTab === 'resumes') loadResumes();
  }, [activeTab, isAdmin, loadUsers, loadJobs, loadResumes]);

  // Actions
  const handleUserDelete = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete user "${userEmail}"?\n\nThis will remove their profile, uploaded resumes, and application records. This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      showFeedback('success', `User "${userEmail}" permanently deleted`);
      loadUsers();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete user');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(userId, newStatus);
      showFeedback('success', `User account ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      loadUsers();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update account status');
    }
  };

  const handleJobStatusToggle = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await adminService.updateJobStatus(jobId, newStatus);
      showFeedback('success', `Job status updated to ${newStatus}`);
      loadJobs();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update job status');
    }
  };

  const handleJobDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await adminService.deleteJob(jobId);
      showFeedback('success', 'Job posting removed');
      loadJobs();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete job');
    }
  };

  const handleTriggerSync = async () => {
    try {
      setJobSyncing(true);
      const res = await adminService.triggerJobSync();
      showFeedback('success', `External sync completed: ${res.ingested || 0} jobs processed`);
      loadJobs();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to sync external jobs');
    } finally {
      setJobSyncing(false);
    }
  };

  // Fallback state if user is unauthenticated or not an administrator
  if (!sessionPending && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Administrator Privileges Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8">
            Access to the SKILLEZO Command Center is restricted to authorized platform administrators. Please sign in with your administrator account.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#4F46E5] text-white font-semibold text-sm shadow-lg shadow-[#3D5AFE]/25 hover:from-[#324ad8] hover:to-[#4338ca] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign In to Admin Portal
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium text-sm transition-all text-center"
            >
              Return to Candidate Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0B1130] to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3D5AFE]/20 border border-[#3D5AFE]/40 flex items-center justify-center text-[#00D9C0]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Command Center</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Hub
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complete oversight of platform users, external job feeds, resumes, and system telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                loadMetrics();
                if (activeTab === 'users') loadUsers();
                if (activeTab === 'jobs') loadJobs();
                if (activeTab === 'resumes') loadResumes();
                showFeedback('success', 'Telemetry data refreshed');
              }}
              disabled={metricsLoading}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={jobSyncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-95 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${jobSyncing ? 'animate-spin' : ''}`} />
              {jobSyncing ? 'Syncing External Jobs...' : 'Sync External Jobs'}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fadeIn shadow-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              &times;
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics?.users.total || 0}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-500 font-semibold">{metrics?.users.candidates || 0} Candidates</span>
                  <span>•</span>
                  <span className="text-violet-500 font-semibold">{metrics?.users.recruiters || 0} Recruiters</span>
                </div>
              </div>

              {/* Total Jobs */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live Jobs</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics?.jobs.total || 0}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-500 font-semibold">{metrics?.jobs.active || 0} Active</span>
                  <span>•</span>
                  <span>{metrics?.jobs.external || 0} Ingested</span>
                </div>
              </div>

              {/* Resumes Processed */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Resumes Processed</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics?.resumes.total || 0}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-purple-500 font-semibold">{metrics?.resumes.avgAtsScore || 74}% Avg ATS</span>
                  <span>•</span>
                  <span>{metrics?.resumes.parsed || 0} Parsed</span>
                </div>
              </div>

              {/* Total Applications */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Applications</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics?.activity.applications || 0}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-500 font-semibold">{metrics?.activity.verifications || 0} Verified Skills</span>
                </div>
              </div>
            </div>

            {/* System Health & Telemetry Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-[#3D5AFE]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    System Architecture & Telemetry
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Railway Free Tier (512MB RAM Guard) Active
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 block mb-1">Heap Memory Used</span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                    {metrics ? `${metrics.system.memoryUsageMB} MB / 512 MB` : '--'}
                  </span>
                  <span className="text-[10px] text-emerald-500 block mt-0.5">Optimized (0MB AdminJS bloat)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 block mb-1">Uptime</span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                    {metrics ? `${Math.floor(metrics.system.uptime / 3600)}h ${Math.floor((metrics.system.uptime % 3600) / 60)}m` : '--'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Continuous execution</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 block mb-1">Node Runtime</span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                    {metrics?.system.nodeVersion || '--'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">ESM Modules</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 block mb-1">Environment</span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white uppercase" suppressHydrationWarning>
                    {metrics?.system.environment || 'development'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Express + MongoDB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-semibold">User</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Registered</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          Loading user directory...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3D5AFE] to-[#00D9C0] text-white font-bold flex items-center justify-center text-xs">
                                {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {u.name}
                                  {u.email.toLowerCase() === 'admin@gmail.com' && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      SUPER ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                  : u.role === 'recruiter'
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                u.accountStatus === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}
                            >
                              {u.accountStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {u.email.toLowerCase() === 'admin@gmail.com' ? (
                              <span className="text-[11px] text-slate-400 italic">Protected</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleStatusToggle(u.id, u.accountStatus)}
                                  title={u.accountStatus === 'active' ? 'Suspend user access' : 'Reactivate user account'}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                                    u.accountStatus === 'active'
                                      ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
                                      : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                  }`}
                                >
                                  {u.accountStatus === 'active' ? (
                                    <>
                                      <UserX className="w-3 h-3" />
                                      Suspend
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      Reactivate
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleUserDelete(u.id, u.email)}
                                  title="Permanently delete user"
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JOB INVENTORY & INGESTION */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search job title or company..."
                  value={jobSearch}
                  onChange={(e) => {
                    setJobSearch(e.target.value);
                    setJobPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={jobSourceFilter}
                  onChange={(e) => {
                    setJobSourceFilter(e.target.value);
                    setJobPage(1);
                  }}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">All Sources</option>
                  <option value="platform">Platform Direct</option>
                  <option value="external">External Feed</option>
                </select>

                <select
                  value={jobStatusFilter}
                  onChange={(e) => {
                    setJobStatusFilter(e.target.value);
                    setJobPage(1);
                  }}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Job Title & Company</th>
                      <th className="px-5 py-3 font-semibold">Source</th>
                      <th className="px-5 py-3 font-semibold">Location</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {jobsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          Loading job catalog...
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          No jobs found.
                        </td>
                      </tr>
                    ) : (
                      jobs.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">{j.title}</div>
                            <div className="text-[11px] text-slate-500">{j.companyName}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                j.sourceType === 'platform'
                                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                  : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                              }`}
                            >
                              {j.sourceProvider || j.sourceType}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{j.location}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                j.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                              }`}
                            >
                              {j.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleJobStatusToggle(j.id, j.status)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                {j.status === 'active' ? 'Close' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleJobDelete(j.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Delete job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESUME INTELLIGENCE */}
        {activeTab === 'resumes' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate name, role, or email..."
                  value={resumeSearch}
                  onChange={(e) => {
                    setResumeSearch(e.target.value);
                    setResumePage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE]"
                />
              </div>
            </div>

            {/* Resumes Table */}
            <div className="bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Candidate</th>
                      <th className="px-5 py-3 font-semibold">Target Role</th>
                      <th className="px-5 py-3 font-semibold">ATS Score</th>
                      <th className="px-5 py-3 font-semibold">Extraction</th>
                      <th className="px-5 py-3 font-semibold">Uploaded</th>
                      <th className="px-5 py-3 font-semibold text-right">View PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {resumesLoading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                          Loading candidate resumes...
                        </td>
                      </tr>
                    ) : resumes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                          No candidate resumes found.
                        </td>
                      </tr>
                    ) : (
                      resumes.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">{r.candidateName}</div>
                            <div className="text-[11px] text-slate-500">{r.candidateEmail}</div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {r.targetRole}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                r.atsScore >= 80
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : r.atsScore >= 65
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}
                            >
                              {r.atsScore}%
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] text-slate-600 dark:text-slate-400">
                              {r.skillsCount} Skills • {r.projectsCount} Projects
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <a
                              href={`${API_BASE_URL.replace(/\/+$/, '')}/api/resumes/${r.id}/download?view=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D5AFE]/10 hover:bg-[#3D5AFE]/20 text-[#3D5AFE] font-medium text-xs transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
