'use client';

import React from 'react';
import { Award, Hash, ExternalLink } from 'lucide-react';
import { SkillVerificationRecord } from '@/types/verification';
import { DataTable, Column } from '@/components/dashboard/common/DataTable';
import { VerificationStatusBadge } from './VerificationStatusBadge';

interface VerificationTableProps {
  records: SkillVerificationRecord[];
  onSelectRecord?: (record: SkillVerificationRecord) => void;
}

export const VerificationTable: React.FC<VerificationTableProps> = ({ records, onSelectRecord }) => {
  const columns: Column<SkillVerificationRecord>[] = [
    {
      header: 'Skill & Category',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#3D5AFE]/10 dark:bg-slate-800 text-[#3D5AFE] dark:text-[#8098FF] border border-[#3D5AFE]/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{row.skillName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{row.category}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Assessor / Engine',
      cell: (row) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{row.assessor}</span>
    },
    {
      header: 'Audit Score',
      cell: (row) => (
        <div>
          {row.score > 0 ? (
            <span className={`font-bold ${row.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {row.score}/{row.maxScore}
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">Pending</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      cell: (row) => <VerificationStatusBadge status={row.status} />
    },
    {
      header: 'Credential Hash',
      cell: (row) => (
        <div className="font-mono text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Hash className="w-3.5 h-3.5 text-[#00897B] dark:text-[#00D9C0]" />
          <span className="font-medium">{row.credentialHash || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => onSelectRecord && onSelectRecord(row)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D5AFE] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="View details"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      keyExtractor={(row) => row.id}
      emptyText="No skill verification records found."
    />
  );
};

