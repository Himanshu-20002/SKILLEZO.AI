'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Award, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { profileService, CandidateProfile } from '@/services/profile.service';
import { verificationService } from '@/services/verification.service';
import { SkillVerificationRecord } from '@/types/verification';

export const DashboardSummary: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [records, setRecords] = useState<SkillVerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [profileData, recordsData] = await Promise.all([
          profileService.getMyProfile().catch(() => null),
          verificationService.getUserRecords().catch(() => []),
        ]);

        if (isMounted) {
          if (profileData) setProfile(profileData);
          if (recordsData) setRecords(recordsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Dynamic Target Role
  const targetRoleName =
    profile?.targetRole || profile?.headline || 'Senior Full Stack Engineer';
  const hasTargetRole = Boolean(profile?.targetRole);

  // 2. Dynamic Verified Credentials / Badges Count
  const verifiedSkillsFromProfile =
    profile?.skills?.filter((s) => s.verified)?.length || 0;
  const verifiedRecordsCount = records.filter(
    (r) => r.status === 'Passed' || (r.score && r.score >= 70)
  ).length;

  const totalCredentialsCount = Math.max(
    verifiedSkillsFromProfile,
    verifiedRecordsCount,
    records.length
  ) || (profile?.skills?.length ? Math.min(profile.skills.length, 3) : 0);

  // 3. Dynamic Verification Rate / Score
  let verificationPassRate = 0;
  let verificationBadgeTier = 'In Progress';

  if (records.length > 0) {
    const passedCount = records.filter(
      (r) => r.status === 'Passed' || (r.score && r.score >= 70)
    ).length;
    verificationPassRate = Math.round((passedCount / records.length) * 100);
    if (verificationPassRate >= 90) verificationBadgeTier = 'Top Tier';
    else if (verificationPassRate >= 75) verificationBadgeTier = 'Proficient';
    else verificationBadgeTier = 'Developing';
  } else {
    // Dynamic score from candidate profile completion
    verificationPassRate = profile?.completionPercentage || 88;
    verificationBadgeTier = verificationPassRate >= 80 ? 'Top Tier' : 'Active';
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Dynamic Target Role Card (Vibrant Blue Theme) */}
      <Link
        href="/dashboard/career-gps"
        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/50 dark:from-[#0c1938] dark:via-[#091126] dark:to-[#070c1e] border border-blue-200/90 dark:border-blue-900/70 shadow-[0_8px_24px_-6px_rgba(37,99,235,0.14)] dark:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] group hover:border-blue-500 hover:shadow-blue-500/20 dark:hover:border-blue-500 transition-all duration-300 block"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 dark:bg-blue-500/20 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 border border-blue-400/30 shrink-0 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] uppercase tracking-wider text-blue-900/70 dark:text-blue-300 font-bold">
                Target Role Match
              </p>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white dark:bg-blue-500/25 dark:text-blue-300 border border-blue-500/30 shadow-xs">
                {hasTargetRole ? 'Primary' : 'Auto Set'}
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5">
              {targetRoleName}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 shrink-0" />
        </div>
      </Link>

      {/* 2. Dynamic Total Credentials Card (Vibrant Teal Theme) */}
      <Link
        href="/dashboard/certifications"
        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/50 dark:from-[#062423] dark:via-[#051919] dark:to-[#031212] border border-teal-200/90 dark:border-teal-900/70 shadow-[0_8px_24px_-6px_rgba(13,148,136,0.14)] dark:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] group hover:border-teal-500 hover:shadow-teal-500/20 dark:hover:border-teal-500 transition-all duration-300 block"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 dark:bg-teal-500/20 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/30 border border-teal-300/30 shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] uppercase tracking-wider text-teal-900/70 dark:text-teal-300 font-bold">
                Total Credentials
              </p>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white dark:bg-teal-500/25 dark:text-teal-300 border border-teal-500/30 shadow-xs">
                {totalCredentialsCount > 0 ? `+${totalCredentialsCount} Active` : 'Earn Badge'}
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mt-0.5">
              {totalCredentialsCount > 0
                ? `${totalCredentialsCount} ${totalCredentialsCount === 1 ? 'Badge Earned' : 'Badges Earned'}`
                : '0 Badges Earned'}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 shrink-0" />
        </div>
      </Link>

      {/* 3. Dynamic Verification Rate Card (Vibrant Emerald Theme) */}
      <Link
        href="/dashboard/skill-verification"
        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-green-50/50 dark:from-[#082618] dark:via-[#061b11] dark:to-[#04130c] border border-emerald-200/90 dark:border-emerald-900/70 shadow-[0_8px_24px_-6px_rgba(16,185,129,0.14)] dark:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] group hover:border-emerald-500 hover:shadow-emerald-500/20 dark:hover:border-emerald-500 transition-all duration-300 block"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-300/30 shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300 font-bold">
                Verification Rate
              </p>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
                {verificationBadgeTier}
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-0.5">
              {records.length > 0
                ? `${verificationPassRate}% Pass Rate`
                : `${verificationPassRate}% Profile Score`}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 shrink-0" />
        </div>
      </Link>
    </div>
  );
};
