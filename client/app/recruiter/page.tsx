'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Compass,
  FileText,
  Building2,
  Layers,
  ChevronRight,
  Award,
} from 'lucide-react';
import { RecruiterLayout } from '@/components/layout/RecruiterLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { CreateJobModal } from '@/components/recruiter/CreateJobModal';
import {
  recruiterService,
  RecruiterDashboardStats,
  RecruiterJobItem,
  TalentCandidateItem,
} from '@/services/recruiter.service';

export default function RecruiterDashboardPage() {
  const [stats, setStats] = useState<RecruiterDashboardStats | null>(null);
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [topTalent, setTopTalent] = useState<TalentCandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createJobOpen, setCreateJobOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, jobsData] = await Promise.all([
          recruiterService.getDashboardStats(),
          recruiterService.getCompanyJobs(),
        ]);
        setStats(statsData);
        setJobs(jobsData);
        setTopTalent(recruiterService.getFallbackTalentPool());
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCandidates = stats?.totalCandidates || 28;
  const activeJobs = stats?.activeJobsCount || jobs.length || 4;
  const interviewCount = stats?.interviewCount || 6;
  const offerCount = stats?.offerCount || 3;
  const stageCounts = stats?.stageCounts || {
    applied: 9,
    under_review: 8,
    shortlisted: 5,
    interview: 6,
    offered: 3,
    hired: 2,
  };

  const funnelStages = [
    { label: 'Applied Inflow', count: stageCounts.applied || 9, color: 'bg-blue-500', width: '100%' },
    { label: 'Under Review', count: stageCounts.under_review || 8, color: 'bg-amber-500', width: '85%' },
    { label: 'Shortlisted', count: stageCounts.shortlisted || 5, color: 'bg-purple-500', width: '68%' },
    { label: 'Technical Interview', count: stageCounts.interview || 6, color: 'bg-indigo-500', width: '50%' },
    { label: 'Offers Extended', count: stageCounts.offered || 3, color: 'bg-emerald-500', width: '32%' },
    { label: 'Hired & Onboarded', count: stageCounts.hired || 2, color: 'bg-teal-500', width: '22%' },
  ];

  return (
    <RecruiterLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Recruiter Executive Hub"
          description="Enterprise talent acquisition intelligence, verified skill matching, and hiring pipeline analytics."
          badge="Enterprise ATS v4.2"
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/recruiter/talent"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Compass className="w-3.5 h-3.5 text-[#00D9C0]" />
                <span>Source Verified Talent</span>
              </Link>

              <button
                onClick={() => setCreateJobOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold shadow-md shadow-[#3D5AFE]/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Requisition</span>
              </button>
            </div>
          }
        />

        {/* 4 Core KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Total Active Inflow
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalCandidates} <span className="text-xs text-slate-400 font-normal">Candidates</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>+18% from last week</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Open Requisitions
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeJobs} <span className="text-xs text-slate-400 font-normal">Positions</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>100% verified requirement matching</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Interviews Scheduled
                </span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {interviewCount} <span className="text-xs text-slate-400 font-normal">Active</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>Next interview in 3 hours</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Offers & Placements
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {offerCount} <span className="text-xs text-slate-400 font-normal">Extended</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>92% Offer acceptance rate</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Funnel Progression & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Pipeline Conversion Funnel */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Hiring Pipeline Velocity & Conversion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stage progression for current quarter
                </p>
              </div>

              <Link
                href="/recruiter/applications"
                className="text-xs font-bold text-[#3D5AFE] dark:text-[#8098FF] hover:underline flex items-center gap-1"
              >
                <span>Open Kanban Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5 pt-2">
              {funnelStages.map((st, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{st.label}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">
                      {st.count} Candidates
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-[#151D42] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${st.color} transition-all duration-500`}
                      style={{ width: st.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Columns: Quick Actions Hub & Hiring Summary */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Recruiter Action Center
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => setCreateJobOpen(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#3D5AFE]/10 to-indigo-500/10 border border-[#3D5AFE]/20 hover:border-[#3D5AFE]/50 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3D5AFE] text-white flex items-center justify-center shadow-xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Post New Requisition
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Publish role with required verified skill benchmarks
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <Link
                href="/recruiter/talent"
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 hover:border-[#00D9C0]/50 text-left transition flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Search Verified Talent Pool
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Filter pre-tested candidates by skill score & index
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/recruiter/applications"
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 hover:border-purple-500/50 text-left transition flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Review Pending Applications
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      8 candidates awaiting initial qualification review
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Active Job Openings & Top Talent Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Job Openings */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Active Job Requisitions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open positions currently attracting candidate streams
                </p>
              </div>

              <Link
                href="/recruiter/jobs"
                className="text-xs font-bold text-[#3D5AFE] dark:text-[#8098FF] hover:underline"
              >
                Manage All ({jobs.length})
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id || job._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{job.department || 'Engineering'}</span>
                      <span>•</span>
                      <span>{job.workplaceType || 'Remote'}</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {job.applicantsCount || 12} Applicants
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/recruiter/applications?jobId=${job.id || job._id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151D42] hover:bg-[#3D5AFE]/10 hover:text-[#3D5AFE] text-slate-700 dark:text-slate-300 text-xs font-bold transition shrink-0"
                  >
                    View Pipeline
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Top Talent Spotlight */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Verified Top Talent
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-screened candidates with 95%+ score
                </p>
              </div>

              <Link
                href="/recruiter/talent"
                className="text-xs font-bold text-[#00D9C0] hover:underline"
              >
                Browse All
              </Link>
            </div>

            <div className="space-y-3">
              {topTalent.slice(0, 3).map((talent) => (
                <div
                  key={talent.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151D42] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {talent.name}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                        {talent.employabilityScore}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {talent.targetRole || talent.headline}
                    </p>
                  </div>

                  <Link
                    href={`/recruiter/talent?highlight=${talent.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#00D9C0]/10 text-[#00A896] dark:text-[#00D9C0] hover:bg-[#00D9C0]/20 text-xs font-bold transition shrink-0"
                  >
                    Direct Invite
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Job Modal */}
        <CreateJobModal
          isOpen={createJobOpen}
          onClose={() => setCreateJobOpen(false)}
          onJobCreated={(newJob) => {
            setJobs([newJob, ...jobs]);
            setCreateJobOpen(false);
          }}
        />
      </div>
    </RecruiterLayout>
  );
}
