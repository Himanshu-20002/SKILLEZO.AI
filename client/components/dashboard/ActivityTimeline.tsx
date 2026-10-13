'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  Briefcase,
  ChevronRight,
  MapPin,
  Globe,
} from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';
import { jobService, mapBackendJobToUiJob } from '@/services/job.service';
import { Job } from '@/types/job-center';
import { JobMatchScore } from '@/components/dashboard/job-center/JobMatchScore';

interface ActivityTimelineProps {
  userSkills?: string[];
  isLoading?: boolean;
  records?: any[]; // Kept optional for backward compatibility
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  userSkills = [],
  isLoading: isLoadingProp = false,
}) => {
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);

  // Memoize skillsKey to avoid re-triggering effect on every render due to array reference instability
  const skillsKey = useMemo(() => {
    return (userSkills || []).slice().sort().join(',');
  }, [userSkills]);

  // Load latest jobs and calculate skill match against userSkills
  useEffect(() => {
    const controller = new AbortController();

    async function loadMatchedJobs() {
      try {
        setLoadingJobs(true);
        const res = await jobService
          .searchJobs({ limit: 8, sort: 'newest' }, { signal: controller.signal })
          .catch((err) => {
            if (err?.name === 'AbortError') return null;
            return null;
          });

        if (controller.signal.aborted) return;

        if (res?.items && Array.isArray(res.items)) {
          const mapped = res.items.map((item) => mapBackendJobToUiJob(item, userSkills));
          // Rank highest match score first, with newest as secondary sort
          mapped.sort(
            (a, b) =>
              (b.matchScore || b.matchBreakdown?.skillMatchScore || 0) -
              (a.matchScore || a.matchBreakdown?.skillMatchScore || 0)
          );
          setMatchedJobs(mapped.slice(0, 5));
        } else {
          setMatchedJobs([]);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Error loading matched jobs in ActivityTimeline:', err);
        }
        if (!controller.signal.aborted) setMatchedJobs([]);
      } finally {
        if (!controller.signal.aborted) setLoadingJobs(false);
      }
    }

    loadMatchedJobs();
    return () => {
      controller.abort();
    };
  }, [skillsKey]);

  const isLoading = isLoadingProp || loadingJobs;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      <div>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest job postings tailored to your skills"
          icon={<Briefcase className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />}
          action={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Matches</span>
            </div>
          }
        />

        <div className="space-y-3 mt-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.03] animate-pulse"
                />
              ))}
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#3D5AFE] dark:text-[#00D9C0] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No active job matches found
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore available positions in the Job Center or update your profile skills to view personalized match ratings.
                </p>
              </div>
              <Link
                href="/dashboard/job-center"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Browse Job Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {matchedJobs.map((job) => {
                const isExternal = job.sourceType === 'EXTERNAL';
                const matchScore = job.matchScore || job.matchBreakdown?.skillMatchScore || 0;
                const matchedSkills = job.matchBreakdown?.matchedSkills || [];

                return (
                  <Link
                    key={job.id}
                    href="/dashboard/job-center"
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] hover:bg-white dark:hover:bg-white/[0.05] hover:border-[#3D5AFE]/40 dark:hover:border-[#00D9C0]/40 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Company Avatar */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                          isExternal
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-gradient-to-tr from-[#3D5AFE]/20 to-[#00D9C0]/20 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/20'
                        }`}
                      >
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Title, Company & Tags */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#3D5AFE] dark:group-hover:text-[#00D9C0] transition-colors">
                            {job.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {job.company}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-medium text-[11px]">
                            {job.workMode === 'Remote' ? (
                              <Globe className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <MapPin className="w-3 h-3 text-slate-400" />
                            )}
                            {job.workMode}
                          </span>

                          {matchedSkills.length > 0 && (
                            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
                              Matches {matchedSkills.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Meta & Match Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/[0.04]">
                      <JobMatchScore score={matchScore} size="sm" showLabel={false} />

                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        {job.postedTimeAgo}
                      </span>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3D5AFE] dark:group-hover:text-[#00D9C0] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}

              {/* Footer link to Job Center */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {userSkills.length > 0
                    ? `Personalized match for ${userSkills.length} profile skills`
                    : 'Add skills to profile for verified match precision'}
                </span>
                <Link
                  href="/dashboard/job-center"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3D5AFE] dark:text-[#00D9C0] hover:underline cursor-pointer"
                >
                  <span>View all matching jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
