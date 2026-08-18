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
          <div className="p-2 rounded-xl bg-slate-800 text-[#3D5AFE]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100">{row.skillName}</div>
            <div className="text-xs text-slate-400">{row.category}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Assessor / Engine',
      cell: (row) => <span className="text-xs text-slate-300">{row.assessor}</span>
    },
    {
      header: 'Audit Score',
      cell: (row) => (
        <div>
          {row.score > 0 ? (
            <span className={`font-bold ${row.score >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {row.score}/{row.maxScore}
            </span>
          ) : (
            <span className="text-xs text-slate-500 italic">Pending</span>
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
        <div className="font-mono text-xs text-slate-400 flex items-center gap-1">
          <Hash className="w-3 h-3 text-[#00D9C0]" />
          <span>{row.credentialHash || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => onSelectRecord && onSelectRecord(row)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
