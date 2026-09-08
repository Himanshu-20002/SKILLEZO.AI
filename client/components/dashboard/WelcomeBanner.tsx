'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { mockDashboardSummary } from '@/mock/dashboard';
import { useSession } from '@/lib/auth-client';

export const WelcomeBanner: React.FC = () => {
  const { data: session } = useSession();

  const displayName = session?.user?.name
    ? session.user.name.trim().split(' ')[0]
    : 'Candidate';

  const readinessScore = mockDashboardSummary.completionRate || 88;
  const strokeDashoffset = 100 - readinessScore;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/30 dark:from-[#0c1228] dark:via-[#090d20] dark:to-[#070a18] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_10px_30px_-10px_rgba(61,90,254,0.08)] dark:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all">
      {/* Dynamic Aurora & Grid Overlays */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#3D5AFE]/15 via-[#00D9C0]/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#3D5AFE_1px,transparent_1px)] [background-size:16px_16px]" 
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Technical Readiness Overview */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/90 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.12] shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-wide uppercase text-slate-700 dark:text-slate-300">
              AI Verification Engine Online
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#3D5AFE] dark:text-[#00D9C0]">
              <Zap className="w-3 h-3" />
              <span>Multi-Model AI Active</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-[#3D5AFE] via-indigo-600 to-[#00D9C0] dark:from-indigo-400 dark:via-[#00D9C0] dark:to-cyan-300 bg-clip-text text-transparent">{displayName}</span> 👋
            </h1>
            <p className="mt-1.5 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Your cryptographic technical profile is <span className="font-bold text-slate-900 dark:text-white">{readinessScore}% optimized</span> for enterprise engineering roles. You have{' '}
              <span className="font-semibold text-[#3D5AFE] dark:text-[#00D9C0]">{mockDashboardSummary.activeVerificationsCount} live audits</span> and{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mockDashboardSummary.passedAssessmentsCount} verified credentials</span>.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/dashboard/skill-verification"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#253fdf] hover:from-[#354fef] hover:to-[#1c35cc] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(61,90,254,0.35)] hover:shadow-[0_6px_20px_rgba(61,90,254,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit New Skill</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Take AI Assessment</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Readiness Score Circular Badge Capsule */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
            {/* SVG Circular Gauge */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#3D5AFE] dark:text-[#00D9C0] transition-all duration-1000 ease-out"
                  strokeDasharray="100, 100"
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
                  {readinessScore}%
                </span>
              </div>
            </div>

            {/* Gauge Description */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Profile Rank
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                Top 5% Talent
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>●</span> Recruiter Ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

