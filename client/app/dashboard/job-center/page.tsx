'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Loader2,
  RefreshCw,
  AlertCircle,
  Globe,
  Building,
} from 'lucide-react';
import { Job, JobFilterState, SortOption, JobApplication } from '@/types/job-center';
import { jobService, mapBackendJobToUiJob, BackendJob } from '@/services/job.service';
import { profileService } from '@/services/profile.service';
import { applicationService } from '@/services/application.service';
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
import { toast } from 'sonner';

type ActiveTab = 'all' | 'platform' | 'external' | 'recommended' | 'saved' | 'applied';

export default function SmartJobCenterPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [selectedJobForBreakdown, setSelectedJobForBreakdown] = useState<Job | null>(null);
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  // Live Data State
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [targetRoleTitle, setTargetRoleTitle] = useState<string>('Full-Stack Engineer');
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const jobsPerPage = 6;

  const [filters, setFilters] = useState<JobFilterState>({
    searchQuery: '',
    workMode: 'All',
    employmentType: 'All',
    experience: 'All',
    matchTier: 'All Jobs',
    salaryMin: 0,
    salaryMax: 60,
    location: 'All Locations',
    selectedSkills: [],
    sortBy: 'AI Match',
  });

  // Load candidate profile skills for live matching
  useEffect(() => {
    async function loadCandidateProfile() {
      try {
        const profile = await profileService.getMyProfile();
        if (profile?.skills && Array.isArray(profile.skills)) {
          const names = profile.skills.map((s) => s.name).filter(Boolean);
          setUserSkills(names);
        }
        if (profile?.experience?.[0]?.jobTitle) {
          setTargetRoleTitle(profile.experience[0].jobTitle);
        }
      } catch (err) {
        // Candidate not logged in or profile empty
        setUserSkills([]);
      }
    }
    loadCandidateProfile();
  }, []);

  // Fetch live jobs from backend API
  const fetchLiveJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    setJobsError(null);

    try {
      // Map UI filters to backend query params
      const queryParams: Record<string, any> = {
        page: 1,
        limit: 100, // Fetch broader dataset to allow fast client-side tab switching & sorting
      };

      if (filters.searchQuery.trim()) {
        queryParams.keyword = filters.searchQuery.trim();
      }

      if (filters.location !== 'All Locations') {
        queryParams.location = filters.location;
      }

      if (filters.workMode !== 'All') {
        const wm = filters.workMode.toLowerCase();
        if (wm === 'remote') queryParams.workplaceType = 'remote';
        else if (wm === 'hybrid') queryParams.workplaceType = 'hybrid';
        else if (wm === 'on-site') queryParams.workplaceType = 'onsite';
      }

      if (filters.employmentType !== 'All') {
        const et = filters.employmentType.toLowerCase();
        if (et === 'full-time') queryParams.employmentType = 'full_time';
        else if (et === 'part-time') queryParams.employmentType = 'part_time';
        else if (et === 'contract') queryParams.employmentType = 'contract';
        else if (et === 'internship') queryParams.employmentType = 'internship';
      }

      const res = await jobService.searchJobs(queryParams);
      const mapped = (res.items || []).map((backendJob: BackendJob) =>
        mapBackendJobToUiJob(backendJob, userSkills)
      );

      setLiveJobs(mapped);
      setTotalJobsCount(res.pagination?.total || mapped.length);
    } catch (err: any) {
      console.error('[JobCenter] Failed to fetch live jobs:', err);
      setJobsError(err?.message || 'Unable to connect to live Jobs API. Please make sure the backend is running.');
      toast.error('Failed to load live jobs from server');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [filters.searchQuery, filters.location, filters.workMode, filters.employmentType, userSkills]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLiveJobs]);

  // Lightweight cache of applied job IDs (set for O(1) lookup)
  const [appliedJobIdSet, setAppliedJobIdSet] = useState<Set<string>>(new Set());

  // Fetch applied job IDs from backend (BE-203)
  const fetchAppliedJobIds = useCallback(async () => {
    try {
      const ids = await applicationService.getAppliedJobIds();
      setAppliedJobIdSet(new Set(ids));
    } catch (err) {
      console.error('[JobCenter] Failed to load applied job IDs:', err);
    }
  }, []);

  // Load applied IDs on mount
  useEffect(() => {
    fetchAppliedJobIds();
  }, []);

  // Helper to check if a job is applied
  const isJobApplied = (jobId: string) => appliedJobIdSet.has(jobId);

  // Preserve existing applications state for the Applied tab
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
      salaryMax: 60,
      location: 'All Locations',
      selectedSkills: [],
      sortBy: 'AI Match',
    });
    setCurrentPage(1);
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(jobId);
      if (isSaved) {
        toast.info('Job removed from saved list');
        return prev.filter((id) => id !== jobId);
      } else {
        toast.success('Job saved to your bookmarks');
        return [...prev, jobId];
      }
    });
  };

  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  // Load candidate's live submitted applications from MongoDB
  const fetchMyApplications = useCallback(async () => {
    try {
      const res = await applicationService.getMyApplications({ limit: 50 });
      if (res && res.items && res.items.length > 0) {
        const mappedApps: JobApplication[] = res.items.map((app) => ({
          id: app.id,
          jobId: app.jobId,
          jobTitle: app.job?.title || 'Job Application',
          company: app.job?.companyName || 'Company',
          location: app.job?.location || 'Remote',
          workMode: (app.job?.workplaceType as any) || 'Remote',
          salaryText: 'Competitive',
          appliedDate: app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          matchScore: 85,
          status: (app.status === 'applied' ? 'Submitted' : app.status.charAt(0).toUpperCase() + app.status.slice(1).replace(/_/g, ' ')) as any,
          nextStep: 'Awaiting recruiter review',
          resumeUsed: app.resumeSnapshot?.originalFileName || app.resumeSnapshot?.title || 'Attached Resume',
          atsScore: 85,
          timeline: (app.statusHistory || []).map((h) => ({
            title: h.status.replace(/_/g, ' ').toUpperCase(),
            date: new Date(h.changedAt).toLocaleDateString(),
            completed: true,
          })),
        }));
        setApplications(mappedApps);
        setAppliedJobIdSet((prev) => {
          const next = new Set(prev);
          res.items.forEach((item) => {
            if (item.jobId) next.add(item.jobId);
          });
          return next;
        });
      }
    } catch (err) {
      console.error('[JobCenter] Failed to load candidate applications:', err);
    }
  }, []);

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  const handleConfirmApply = async (job: Job, resumeId?: string, coverLetter?: string) => {
    const isExternal = (job.sourceType || '').toUpperCase() === 'EXTERNAL';

    if (isExternal) {
      const newApp: JobApplication = {
        id: `ext-app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        salaryText: job.salaryText,
        appliedDate: new Date().toISOString().split('T')[0],
        matchScore: job.matchScore,
        status: 'applied',
        nextStep: `Redirected to ${job.sourceName || 'Partner'}`,
        resumeUsed: resumeId ? 'Selected Resume' : 'Profile AI Resume',
        atsScore: job.matchScore,
        timeline: [
          { title: 'Application Started via Partner', date: 'Just now', completed: true, isCurrent: true },
        ],
      };

      setApplications((prev) => [newApp, ...prev.filter((a) => a.jobId !== job.id)]);
      setAppliedJobIdSet((prev) => new Set([...prev, job.id]));
      toast.success(`Application recorded for ${job.title}!`);
      setSelectedJobForApply(null);
      return;
    }

    try {
      setIsSubmittingApplication(true);
      const appRecord = await applicationService.applyToJob({
        jobId: job.id,
        resumeId: resumeId || undefined,
        coverLetter: coverLetter || undefined,
      });

      const newApp: JobApplication = {
        id: (appRecord as any).id || `app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        salaryText: job.salaryText,
        appliedDate: new Date().toISOString().split('T')[0],
        matchScore: job.matchScore,
        status: 'applied',
        nextStep: 'Awaiting recruiter screening',
        resumeUsed: (appRecord as any).resumeSnapshot?.originalFileName || (appRecord as any).resumeSnapshot?.fileName || 'Attached AI Resume',
        atsScore: job.matchScore,
        timeline: [
          { title: 'Application Submitted', date: 'Just now', completed: true, isCurrent: true },
          { title: 'Resume Review', date: 'Pending', completed: false },
          { title: 'Recruiter Screening', date: 'Pending', completed: false },
        ],
      };

      setApplications((prev) => [newApp, ...prev.filter((a) => a.jobId !== job.id)]);
      setAppliedJobIdSet((prev) => new Set([...prev, job.id]));
      toast.success(`Application successfully submitted to ${job.company}!`);
      setSelectedJobForApply(null);
    } catch (err: any) {
      console.error('[JobCenter] Failed to submit application:', err);
      if (err.code === 'APPLICATION_ALREADY_EXISTS' || err.code === 'DUPLICATE_APPLICATION') {
        toast.info(`You have already applied for ${job.title}.`);
        setAppliedJobIdSet((prev) => new Set([...prev, job.id]));
        if (!applications.some((a) => a.jobId === job.id)) {
          setApplications((prev) => [
            {
              id: `existing-${job.id}`,
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              location: job.location,
              workMode: job.workMode,
              salaryText: job.salaryText,
              appliedDate: new Date().toISOString().split('T')[0],
              matchScore: job.matchScore,
              status: 'applied',
              nextStep: 'Under review',
              resumeUsed: 'Uploaded Resume',
              atsScore: job.matchScore,
              timeline: [{ title: 'Application Submitted', date: 'Previously', completed: true }],
            },
            ...prev,
          ]);
        }
        setSelectedJobForApply(null);
      } else if (err.code === 'APPLICATION_RESUME_NOT_FOUND') {
        toast.error('Please upload a resume first before applying.');
      } else {
        toast.error(err.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string, jobId: string) => {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(applicationId);
      if (isObjectId) {
        await applicationService.withdrawApplication(applicationId);
      }
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: 'withdrawn',
                nextStep: 'Application withdrawn by candidate',
                timeline: [
                  ...app.timeline,
                  { title: 'Application Withdrawn', date: 'Just now', completed: true },
                ],
              }
            : app
        )
      );
      setAppliedJobIdSet((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      toast.success('Application successfully withdrawn');
    } catch (err: any) {
      console.error('[JobCenter] Failed to withdraw application:', err);
      toast.error(err?.message || 'Failed to withdraw application');
      throw err;
    }
  };

  // Client-side Sort & Filter refinements on live jobs
  const filteredJobs = useMemo(() => {
    return liveJobs
      .filter((job) => {
        // Tab Source Filter
        if (activeTab === 'platform' && job.sourceType !== 'PLATFORM') return false;
        if (activeTab === 'external' && job.sourceType !== 'EXTERNAL') return false;
        if (activeTab === 'recommended' && job.matchScore < 75) return false;

        // Experience filter
        if (filters.experience !== 'All') {
          if (filters.experience === '0–1 years' && job.experienceMin > 1) return false;
          if (filters.experience === '1–3 years' && (job.experienceMin < 1 || job.experienceMin > 3)) return false;
          if (filters.experience === '3–5 years' && (job.experienceMin < 3 || job.experienceMin > 5)) return false;
          if (filters.experience === '5+ years' && job.experienceMin < 5) return false;
        }

        // Match Tier
        if (filters.matchTier === '85%+' && job.matchScore < 85) return false;
        if (filters.matchTier === '70–85%' && (job.matchScore < 70 || job.matchScore > 85)) return false;

        // Selected Skills Filter
        if (filters.selectedSkills.length > 0) {
          const hasSkill = filters.selectedSkills.some((skill) =>
            job.skills.some((js) => js.toLowerCase() === skill.toLowerCase())
          );
          if (!hasSkill) return false;
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
  }, [liveJobs, filters, activeTab]);

  // Top AI Recommended jobs (Top 3 highest match score)
  const recommendedJobs = useMemo(() => {
    return [...liveJobs].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }, [liveJobs]);

  const savedJobsList = useMemo(() => {
    return liveJobs.filter((j) => savedJobIds.includes(j.id));
  }, [liveJobs, savedJobIds]);

  const platformJobsCount = useMemo(() => {
    return liveJobs.filter((j) => (j.sourceType || '').toUpperCase() === 'PLATFORM').length;
  }, [liveJobs]);

  const externalJobsCount = useMemo(() => {
    return liveJobs.filter((j) => (j.sourceType || '').toUpperCase() === 'EXTERNAL').length;
  }, [liveJobs]);

  // Dynamic pagination calculation
  const calculatedTotalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    return filteredJobs.slice(start, start + jobsPerPage);
  }, [filteredJobs, currentPage]);

  const highMatchJobsCount = useMemo(() => {
    return liveJobs.filter((j) => j.matchScore >= 80).length;
  }, [liveJobs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Smart Job Center"
            description="Find real jobs matched to your skills, experience, and career goals across Direct Platform Employers and Jooble Aggregated Listings."
            badge="Live MongoDB Database • Real-Time AI Matching"
          />
          <button
            onClick={fetchLiveJobs}
            disabled={isLoadingJobs}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-sm disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingJobs ? 'animate-spin text-[#3D5AFE]' : ''}`} />
            <span>Refresh Jobs</span>
          </button>
        </div>

        {/* Candidate Summary Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3D5AFE]/10 via-[#00D9C0]/10 to-transparent border border-[#3D5AFE]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#3D5AFE]" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Target Role:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{targetRoleTitle}</span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-4">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Profile Skills:</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                {userSkills.length > 0 ? `${userSkills.length} Skills Active` : 'General Profile'}
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-4">
              <FileCheck className="w-4 h-4 text-[#3D5AFE]" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Data Pipeline:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                Direct Platform + Jooble API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 text-[#3D5AFE]">
              <Building className="w-3.5 h-3.5" /> {platformJobsCount} Platform
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Globe className="w-3.5 h-3.5" /> {externalJobsCount} Jooble
            </span>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Opportunities"
            value={totalJobsCount.toString()}
            subtitle={`${platformJobsCount} Platform • ${externalJobsCount} Jooble`}
            icon={Briefcase}
            color="text-[#3D5AFE]"
          />
          <MetricCard
            title="Direct Platform Jobs"
            value={platformJobsCount.toString()}
            subtitle="Verified Direct Employers"
            icon={Building}
            color="text-indigo-500"
          />
          <MetricCard
            title="Jooble External Jobs"
            value={externalJobsCount.toString()}
            subtitle="Aggregated Tech Roles"
            icon={Globe}
            color="text-amber-500"
          />
          <MetricCard
            title="High Match (≥80%)"
            value={highMatchJobsCount.toString()}
            subtitle="Top AI Fit for Profile"
            icon={TrendingUp}
            color="text-emerald-500"
          />
        </div>

        {/* Top AI Recommended Carousel Section */}
        {activeTab !== 'applied' && activeTab !== 'saved' && recommendedJobs.length > 0 && (
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
                    Top opportunities scored against your active skills and experience
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
                      {job.sourceType === 'EXTERNAL' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <Globe className="w-3 h-3" /> Jooble
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#3D5AFE] font-bold">
                          <Building className="w-3 h-3" /> Platform
                        </span>
                      )}
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
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Jobs', count: liveJobs.length },
                { id: 'platform', label: '🏢 Direct Platform', count: platformJobsCount },
                { id: 'external', label: '🌐 Jooble Aggregated', count: externalJobsCount },
                { id: 'recommended', label: '✨ Top Match', count: highMatchJobsCount },
                { id: 'saved', label: 'Saved', count: savedJobIds.length },
                { id: 'applied', label: 'Applied', count: applications.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ActiveTab);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${activeTab === tab.id
                      ? 'bg-[#3D5AFE] text-white border-[#3D5AFE] shadow-sm font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
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

        {/* Error Notification banner if backend connection fails */}
        {jobsError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jobsError}</span>
            </div>
            <button
              onClick={fetchLiveJobs}
              className="px-3 py-1 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

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
          <AppliedJobsTracker
            applications={applications}
            onWithdraw={handleWithdrawApplication}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Showing {filteredJobs.length} {activeTab === 'platform' ? 'Platform' : activeTab === 'external' ? 'Jooble' : 'live'} opportunities
              </span>
              <span>Page {currentPage} of {calculatedTotalPages}</span>
            </div>

            {isLoadingJobs ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 text-[#3D5AFE] animate-spin" />
                <p className="text-xs font-semibold">Fetching live job postings from database...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <JobEmptyState onReset={handleResetFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    isApplied={isJobApplied(job.id)}
                    onSaveToggle={handleToggleSave}
                    onViewDetails={(j) => setSelectedJobForDrawer(j)}
                    onWhyMatches={(j) => setSelectedJobForBreakdown(j)}
                    onApply={(j) => setSelectedJobForApply(j)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {calculatedTotalPages > 1 && (
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
                  {Array.from({ length: Math.min(10, calculatedTotalPages) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${currentPage === pageNum
                          ? 'bg-[#3D5AFE] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, calculatedTotalPages))}
                  disabled={currentPage === calculatedTotalPages}
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
          isApplied={selectedJobForDrawer ? isJobApplied(selectedJobForDrawer.id) : false}
          application={selectedJobForDrawer ? applications.find((a) => a.jobId === selectedJobForDrawer.id) : null}
          onClose={() => setSelectedJobForDrawer(null)}
          onSaveToggle={handleToggleSave}
          onApply={(j) => setSelectedJobForApply(j)}
        />

        <ApplyJobModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onConfirmApply={handleConfirmApply}
          isSubmitting={isSubmittingApplication}
        />
      </div>
    </DashboardLayout>
  );
}
