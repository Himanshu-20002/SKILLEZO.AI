'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { MetricCard } from '@/components/dashboard/career/MetricCard';
import {
  Briefcase,
  Sparkles,
  Bookmark,
  Send,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { Job, JobFilterState, SortOption, JobApplication } from '@/types/job-center';
import { mockJobListings, mockJobApplications } from '@/mock/job-center';
import {
  JobSearch,
  JobFilters,
  JobCard,
  JobMatchBreakdown,
  JobDetailsDrawer,
  ApplyJobModal,
  SavedJobsTab,
  AppliedJobsTracker,
  JobEmptyState,
} from '@/components/dashboard/job-center';

type ActiveTab = 'recommended' | 'all' | 'saved' | 'applied';

export default function SmartJobCenterPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job-101', 'job-104']);
  const [applications, setApplications] = useState<JobApplication[]>(mockJobApplications);

  const [selectedJobForBreakdown, setSelectedJobForBreakdown] = useState<Job | null>(null);
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const [filters, setFilters] = useState<JobFilterState>({
    searchQuery: '',
    workMode: 'All',
    employmentType: 'All',
    experience: 'All',
    matchTier: 'All Jobs',
    salaryMin: 0,
    salaryMax: 30,
    location: 'All Locations',
    selectedSkills: [],
    sortBy: 'AI Match',
  });

  const appliedJobIds = useMemo(() => applications.map((a) => a.jobId), [applications]);

  const handleFilterChange = (updated: Partial<JobFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      workMode: 'All',
      employmentType: 'All',
      experience: 'All',
      matchTier: 'All Jobs',
      salaryMin: 0,
      salaryMax: 30,
      location: 'All Locations',
      selectedSkills: [],
      sortBy: 'AI Match',
    });
    setCurrentPage(1);
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleConfirmApply = (job: Job) => {
    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      workMode: job.workMode,
      salaryText: job.salaryText,
      appliedDate: new Date().toISOString().split('T')[0],
      matchScore: job.matchScore,
      status: 'Submitted',
      nextStep: 'Awaiting recruiter screening',
      resumeUsed: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
      atsScore: 91,
      timeline: [
        { title: 'Application Submitted', date: 'Just now', completed: true, isCurrent: true },
        { title: 'Resume Review', date: 'Pending', completed: false },
        { title: 'Recruiter Screening', date: 'Pending', completed: false },
      ],
    };

    setApplications((prev) => [newApp, ...prev]);
  };

  // Filtered & Sorted Jobs list
  const filteredJobs = useMemo(() => {
    return mockJobListings
      .filter((job) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(q);
          const matchesCompany = job.company.toLowerCase().includes(q);
          const matchesSkill = job.skills.some((s) => s.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCompany && !matchesSkill) return false;
        }

        // Work Mode
        if (filters.workMode !== 'All' && job.workMode !== filters.workMode) return false;

        // Employment Type
        if (filters.employmentType !== 'All' && job.employmentType !== filters.employmentType) return false;

        // Match Tier
        if (filters.matchTier === '85%+' && job.matchScore < 85) return false;
        if (filters.matchTier === '70–85%' && (job.matchScore < 70 || job.matchScore > 85)) return false;

        // Location
        if (filters.location !== 'All Locations' && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'Latest') {
          return b.postedDate.localeCompare(a.postedDate);
        }
        if (filters.sortBy === 'Salary: High to Low') {
          return b.salaryMax - a.salaryMax;
        }
        if (filters.sortBy === 'Salary: Low to High') {
          return a.salaryMin - b.salaryMin;
        }
        // Default: AI Match
        return b.matchScore - a.matchScore;
      });
  }, [filters]);

  const recommendedJobs = useMemo(
    () => mockJobListings.filter((j) => j.matchScore >= 88).slice(0, 3),
    []
  );

  const savedJobsList = useMemo(
    () => mockJobListings.filter((j) => savedJobIds.includes(j.id)),
    [savedJobIds]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    return filteredJobs.slice(start, start + jobsPerPage);
  }, [filteredJobs, currentPage]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Smart Job Center"
          description="Find jobs matched to your skills, experience, and career goals."
          badge="Module 28 • AI Career Matching"
        />

        {/* Compact Candidate Summary Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3D5AFE]/10 via-[#00D9C0]/10 to-transparent border border-[#3D5AFE]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#3D5AFE]" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Target Role:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">Full-Stack Engineer</span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-4">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Profile Readiness:</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">86% Ready</span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-4">
              <FileCheck className="w-4 h-4 text-[#3D5AFE]" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Resume Status:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                AI Resume Ready (ATS 91%)
              </span>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Updated today based on Module 20–23 data
          </span>
        </div>

        {/* 4 Portal Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Recommended Jobs"
            value="128"
            subtitle="AI matched listings"
            icon={Sparkles}
            color="text-[#3D5AFE]"
          />
          <MetricCard
            title="High Match Jobs"
            value="24"
            subtitle=">85% Match score"
            icon={TrendingUp}
            color="text-emerald-500"
          />
          <MetricCard
            title="Saved Jobs"
            value={savedJobIds.length.toString()}
            subtitle="Bookmarked for review"
            icon={Bookmark}
            color="text-amber-500"
          />
          <MetricCard
            title="Active Applications"
            value={applications.length.toString()}
            subtitle="Tracked submissions"
            icon={Send}
            color="text-purple-500"
          />
        </div>

        {/* Top AI Recommended Carousel Section */}
        {activeTab !== 'applied' && activeTab !== 'saved' && (
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    AI Recommended For You
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Top jobs selected based on your profile, resume ATS score, and skill gaps
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        {job.matchScore}% Match
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{job.postedTimeAgo}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{job.company} • {job.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                    <button
                      onClick={() => setSelectedJobForBreakdown(job)}
                      className="text-[11px] font-bold text-[#3D5AFE] dark:text-[#00D9C0] hover:underline cursor-pointer"
                    >
                      Why this matches
                    </button>
                    <button
                      onClick={() => setSelectedJobForDrawer(job)}
                      className="px-3 py-1 rounded-lg bg-[#3D5AFE] text-white text-[11px] font-semibold hover:bg-[#3D5AFE]/90 cursor-pointer shadow-sm"
                    >
                      View Role
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Controls & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Jobs', count: filteredJobs.length },
                { id: 'recommended', label: 'Top Recommended', count: recommendedJobs.length },
                { id: 'saved', label: 'Saved Jobs', count: savedJobIds.length },
                { id: 'applied', label: 'Applied Jobs', count: applications.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    activeTab === tab.id
                      ? 'bg-[#3D5AFE] text-white border-[#3D5AFE] shadow-sm font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort Control */}
            {activeTab !== 'applied' && (
              <div className="flex items-center gap-2 text-xs">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                >
                  <option value="AI Match">AI Match (High to Low)</option>
                  <option value="Latest">Latest Posted</option>
                  <option value="Salary: High to Low">Salary: High to Low</option>
                  <option value="Salary: Low to High">Salary: Low to High</option>
                </select>
              </div>
            )}
          </div>

          {/* Search & Filter Bar for Listings */}
          {activeTab !== 'applied' && activeTab !== 'saved' && (
            <div className="space-y-4">
              <JobSearch
                query={filters.searchQuery}
                onQueryChange={(q) => handleFilterChange({ searchQuery: q })}
                onClear={() => handleFilterChange({ searchQuery: '' })}
              />

              <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          )}
        </div>

        {/* Tab Contents */}
        {activeTab === 'saved' ? (
          <SavedJobsTab
            savedJobs={savedJobsList}
            appliedJobIds={appliedJobIds}
            onRemoveSaved={handleToggleSave}
            onViewDetails={(job) => setSelectedJobForDrawer(job)}
            onWhyMatches={(job) => setSelectedJobForBreakdown(job)}
            onApply={(job) => setSelectedJobForApply(job)}
            onExplore={() => setActiveTab('all')}
          />
        ) : activeTab === 'applied' ? (
          <AppliedJobsTracker applications={applications} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing {filteredJobs.length} matching jobs</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            {filteredJobs.length === 0 ? (
              <JobEmptyState onReset={handleResetFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    isApplied={appliedJobIds.includes(job.id)}
                    onSaveToggle={handleToggleSave}
                    onViewDetails={(j) => setSelectedJobForDrawer(j)}
                    onWhyMatches={(j) => setSelectedJobForBreakdown(j)}
                    onApply={(j) => setSelectedJobForApply(j)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 text-xs">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#3D5AFE] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modals & Drawers */}
        <JobMatchBreakdown
          job={selectedJobForBreakdown}
          isOpen={!!selectedJobForBreakdown}
          onClose={() => setSelectedJobForBreakdown(null)}
        />

        <JobDetailsDrawer
          job={selectedJobForDrawer}
          isOpen={!!selectedJobForDrawer}
          isSaved={selectedJobForDrawer ? savedJobIds.includes(selectedJobForDrawer.id) : false}
          isApplied={selectedJobForDrawer ? appliedJobIds.includes(selectedJobForDrawer.id) : false}
          onClose={() => setSelectedJobForDrawer(null)}
          onSaveToggle={handleToggleSave}
          onApply={(j) => setSelectedJobForApply(j)}
        />

        <ApplyJobModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onConfirmApply={handleConfirmApply}
        />
      </div>
    </DashboardLayout>
  );
}
