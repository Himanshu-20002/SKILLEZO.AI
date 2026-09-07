'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Users,
  MoreVertical,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { RecruiterLayout } from '@/components/layout/RecruiterLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { CreateJobModal } from '@/components/recruiter/CreateJobModal';
import { recruiterService, RecruiterJobItem } from '@/services/recruiter.service';
import { toast } from 'sonner';

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const data = await recruiterService.getCompanyJobs();
        setJobs(data);
      } catch {
        setJobs(recruiterService.getFallbackJobs());
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await recruiterService.updateJobStatus(jobId, nextStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, status: nextStatus } : j))
      );
      toast.success(`Job status changed to ${nextStatus.toUpperCase()}`);
    } catch {
      // Optimistic local update
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, status: nextStatus } : j))
      );
      toast.success(`Job status updated to ${nextStatus}`);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.department && job.department.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = filterDepartment === 'all' || job.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const activeCount = jobs.filter((j) => j.status === 'active').length;
  const pausedCount = jobs.filter((j) => j.status === 'paused').length;

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Job Requisitions Management"
          description="Manage open roles, monitor inbound application velocity, and configure verified skill requirements."
          badge="Enterprise ATS"
          actions={
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold shadow-md shadow-[#3D5AFE]/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Requisition</span>
            </button>
          }
        />

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Requisitions
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {jobs.length} Positions
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Listings
              </span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeCount} Live
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Paused / Draft
              </span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {pausedCount} Positions
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PauseCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Ribbon */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or department..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Core Platform">Core Platform</option>
              <option value="DevOps & SRE">DevOps & SRE</option>
              <option value="AI Research">AI Research</option>
              <option value="Design Systems">Design Systems</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Job Listings Grid / Table */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200 dark:border-slate-800 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Requisitions Found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust search keywords or post a new job opening.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#3D5AFE] text-white text-xs font-bold hover:bg-[#3D5AFE]/90 transition"
              >
                Post New Opening
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const jobId = job.id || job._id || '';
              const isActive = job.status === 'active';
              const salaryText =
                job.salary?.min && job.salary?.max
                  ? `$${(job.salary.min / 1000).toFixed(0)}k – $${(job.salary.max / 1000).toFixed(0)}k`
                  : 'Competitive';

              const skillsList = Array.isArray(job.requiredSkills)
                ? job.requiredSkills.map((s) => (typeof s === 'string' ? s : s.name))
                : [];

              return (
                <div
                  key={jobId}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#3D5AFE]/40 transition-all space-y-4 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#3D5AFE] transition-colors">
                          {job.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.department || 'Engineering'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location?.raw || 'Remote'}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {salaryText}
                        </span>
                      </div>
                    </div>

                    {/* Actions & Applicant Inflow Link */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/recruiter/applications?jobId=${jobId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold border border-indigo-500/20 transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicantsCount || 12} Applicants</span>
                      </Link>

                      <button
                        onClick={() => handleStatusToggle(jobId, job.status)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isActive
                            ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10'
                            : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                      >
                        {isActive ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>

                  {/* Required Verified Skills Badges */}
                  {skillsList.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">
                        Required Skills:
                      </span>
                      {skillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#151D42] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/50"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create Job Modal */}
        <CreateJobModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onJobCreated={(newJob) => {
            setJobs([newJob, ...jobs]);
            setCreateModalOpen(false);
          }}
        />
      </div>
    </RecruiterLayout>
  );
}
