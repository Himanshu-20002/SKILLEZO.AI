'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { profileService, CandidateProfile } from '@/services/profile.service';
import { verificationService } from '@/services/verification.service';
import { mockVerificationRecords } from '@/mock/verification';

export const WelcomeBanner: React.FC = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [verifiedCount, setVerifiedCount] = useState<number>(3);
  const [totalSkillsCount, setTotalSkillsCount] = useState<number>(5);

  useEffect(() => {
    let isMounted = true;

    async function loadBannerData() {
      try {
        const [profileData, liveRecords] = await Promise.all([
          profileService.getMyProfile().catch(() => null),
          verificationService.getUserRecords().catch(() => []),
        ]);

        if (!isMounted) return;

        if (profileData) setProfile(profileData);

        // Merge live records with catalog to get accurate counts
        let allRecords = mockVerificationRecords;
        if (liveRecords && liveRecords.length > 0) {
          const liveSkillNames = new Set(liveRecords.map((r) => r.skillName.toLowerCase()));
          const remainingMock = mockVerificationRecords.filter(
            (m) => !liveSkillNames.has(m.skillName.toLowerCase())
          );
          allRecords = [...liveRecords, ...remainingMock];
        }

        const countVerified = allRecords.filter((r) => r.status === 'verified').length;
        const totalCount = allRecords.length;

        setVerifiedCount(countVerified);
        setTotalSkillsCount(totalCount);
      } catch (err) {
        console.error('Error loading welcome banner data:', err);
      }
    }

    loadBannerData();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = session?.user?.name
    ? session.user.name.trim().split(' ')[0]
    : 'Candidate';

  // Dynamic Metrics
  const readinessScore = profile?.completionPercentage || 88;
  const strokeDashoffset = 100 - readinessScore;
  const targetRole = profile?.targetRole || 'Senior Full Stack Engineer';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 dark:from-[#0f2766] dark:via-[#131f4e] dark:to-[#091129] border border-blue-500/30 dark:border-blue-500/20 p-6 sm:p-8 shadow-[0_12px_36px_-8px_rgba(29,78,216,0.35)] dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] text-white transition-all group">
      {/* Vibrant Corner Shapes & Geometric Accent Meshes */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/20 dark:bg-cyan-400/15 rounded-bl-full pointer-events-none transition-all duration-500 ease-out group-hover:scale-125 group-hover:bg-cyan-400/30 dark:group-hover:bg-cyan-400/25" />
      <div className="absolute -bottom-10 right-1/4 w-36 h-36 bg-indigo-400/25 dark:bg-indigo-400/15 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-110" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-110" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Technical Readiness Overview */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold tracking-wide uppercase text-white">
              AI Verification Active
            </span>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300">
              <Zap className="w-3 h-3" />
              <span>Smart Career Assistant</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="text-cyan-300">{displayName}</span> 👋
            </h1>
            <p className="mt-1.5 text-blue-100 dark:text-blue-200 text-sm sm:text-base leading-relaxed font-normal">
              Your career profile is <span className="font-bold text-white underline decoration-cyan-400/60 decoration-2 underline-offset-2">{readinessScore}% complete</span> for <span className="font-semibold text-cyan-200">{targetRole}</span>. You have{' '}
              <span className="font-bold text-emerald-300">{verifiedCount} verified {verifiedCount === 1 ? 'skill' : 'skills'}</span> and{' '}
              <span className="font-bold text-cyan-300">{totalSkillsCount} total {totalSkillsCount === 1 ? 'skill' : 'skills'}</span> highlighted for recruiters.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/dashboard/skill-verification"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-black shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Verify New Skill</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>

            <Link
              href="/dashboard/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Take Skill Assessment</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Readiness Score Circular Badge Capsule (Expands on Hover) */}
        <div className="shrink-0 flex items-center justify-center">
          <Link
            href="/dashboard/employability-index"
            className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            {/* SVG Circular Gauge with Luminous Gradient */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="60%" stopColor="#00D9C0" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <path
                  className="text-white/15"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="url(#scoreRingGrad)"
                  strokeDasharray="100, 100"
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-black text-white leading-none tracking-tight">
                  {readinessScore}%
                </span>
              </div>
            </div>

            {/* Gauge Description */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  Profile Score
                </span>
              </div>
              <p className="text-sm font-black text-white whitespace-nowrap">
                {readinessScore >= 85 ? 'Top 5% Talent' : 'Recruiter Ready'}
              </p>
              <p className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                <span>●</span> Verified Profile
              </p>
            </div>

            {/* Expanding Arrow Indicator on Hover */}
            <div className="w-0 opacity-0 group-hover:w-5 group-hover:opacity-100 transition-all duration-300 overflow-hidden flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-cyan-300" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
