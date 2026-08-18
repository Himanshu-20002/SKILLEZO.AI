'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
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
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.skillName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{row.category}</div>
        </div>
      )
    },
    {
      header: 'Score',
      cell: (row) => (
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          {row.status === 'verified' || row.status === 'failed' ? (
            <span className={row.score >= 75 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {row.score}/{row.maxScore}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs italic">N/A</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Submitted',
      cell: (row) => <span className="text-xs text-slate-500 dark:text-slate-400">{row.submittedDate}</span>
    }
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-md">
      <CardHeader
        title="Recent Skill Verifications"
        subtitle="Latest cryptographic & automated AI skill audits"
        icon={<Shield className="w-5 h-5 text-[#00D9C0]" />}
        action={
          <Link
            href="/dashboard/skill-verification"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D5AFE] hover:text-[#00D9C0] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={recentRecords}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
};
