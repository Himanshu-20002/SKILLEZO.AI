'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { mockDashboardSummary } from '@/mock/dashboard';
import { useSession } from '@/lib/auth-client';

export const WelcomeBanner: React.FC = () => {
  const { data: session } = useSession();

  const displayName = session?.user?.name
    ? session.user.name.trim().split(' ')[0]
    : 'Candidate';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-white to-cyan-50 dark:from-[#3D5AFE]/25 dark:via-[#0B1130] dark:to-[#00D9C0]/15 border border-blue-200 dark:border-[#3D5AFE]/30 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:shadow-2xl">
      {/* Background Glow Orbs */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/10 dark:bg-[#3D5AFE]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-400/10 dark:bg-[#00D9C0]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0] border border-[#3D5AFE]/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Verification Engine Online</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {displayName} 👋
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Your technical profile readiness is at{' '}
            <span className="font-bold text-[#3D5AFE] dark:text-[#00D9C0]">{mockDashboardSummary.completionRate}%</span>. You have{' '}
            <span className="font-bold text-slate-900 dark:text-white">{mockDashboardSummary.activeVerificationsCount} active skill audits</span>{' '}
            and <span className="font-bold text-slate-900 dark:text-white">{mockDashboardSummary.passedAssessmentsCount} verified credentials</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/dashboard/skill-verification"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#2A44E8] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#3D5AFE]/25 hover:opacity-95 transition-all transform hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit New Skill</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
