'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, ExternalLink, Code2 } from 'lucide-react';
import { mockVerificationRecords } from '@/mock/verification';
import { DataTable, Column } from '@/components/dashboard/common/DataTable';
import { StatusBadge } from '@/components/dashboard/common/StatusBadge';
import { SkillVerificationRecord } from '@/types/verification';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

export const RecentVerificationTable: React.FC = () => {
  const recentRecords = mockVerificationRecords.slice(0, 4);

  const columns: Column<SkillVerificationRecord>[] = [
    {
      header: 'Skill & Category',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3D5AFE]/15 to-[#00D9C0]/15 dark:from-[#3D5AFE]/25 dark:to-[#00D9C0]/20 border border-[#3D5AFE]/20 flex items-center justify-center text-[#3D5AFE] dark:text-[#00D9C0] shrink-0 font-bold text-xs shadow-inner">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
              <span>{row.skillName}</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400">
                v2.4
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{row.category}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Audit Score',
      cell: (row) => {
        const hasScore = row.status === 'verified' || row.status === 'failed';
        const scorePercent = hasScore ? Math.round((row.score / row.maxScore) * 100) : 0;
        const isHigh = scorePercent >= 75;

        return (
          <div className="space-y-1 min-w-[120px]">
            <div className="flex items-center justify-between text-xs font-bold">
              {hasScore ? (
                <>
                  <span className={isHigh ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {row.score}/{row.maxScore}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {scorePercent}%
                  </span>
                </>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic font-normal">Processing...</span>
              )}
            </div>

            {hasScore && (
              <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-rose-500 to-amber-400'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Verification Status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Submitted',
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {row.submittedDate}
        </span>
      )
    },
    {
      header: 'Audit Proof',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/dashboard/skill-verification`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all group"
          >
            <span>Audit Proof</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
      <CardHeader
        title="Recent Skill Verifications"
        subtitle="Cryptographically sealed AI evaluations & real-time audits"
        icon={<Shield className="w-4 h-4 text-[#00897B] dark:text-[#00D9C0]" />}
        action={
          <Link
            href="/dashboard/skill-verification"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-bold text-[#3D5AFE] dark:text-[#00D9C0] border border-slate-200/60 dark:border-white/[0.08] transition-all shadow-sm"
          >
            <span>View All Verifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="mt-2">
        <DataTable
          columns={columns}
          data={recentRecords}
          keyExtractor={(row) => row.id}
        />
      </div>
    </div>
  );
};

