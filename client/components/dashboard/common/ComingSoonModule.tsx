'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { Sparkles, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonModuleProps {
  title: string;
  moduleNumber: string;
  description: string;
}

export const ComingSoonModule: React.FC<ComingSoonModuleProps> = ({
  title,
  moduleNumber,
  description,
}) => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={description}
          badge={`Module ${moduleNumber} • Coming Soon`}
        />

        <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto my-8 shadow-sm">
          <div className="inline-flex p-4 rounded-2xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Module {moduleNumber} is scheduled in the upcoming phase. The Career Intelligence foundation (Modules 20–23) is active.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/30">
            <Clock className="w-4 h-4" />
            <span>Scheduled for Next Phase</span>
          </div>

          <div className="pt-4">
            <Link
              href="/dashboard/student-portal"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D5AFE] text-white hover:bg-[#3D5AFE]/90 text-xs font-semibold transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Student Portal Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
