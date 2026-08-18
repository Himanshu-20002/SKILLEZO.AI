'use client';

import React from 'react';
import { Award, Hash, Calendar } from 'lucide-react';
import { SkillVerificationRecord } from '@/types/verification';
import { VerificationStatusBadge } from './VerificationStatusBadge';

interface VerificationCardProps {
  record: SkillVerificationRecord;
  onSelect?: (record: SkillVerificationRecord) => void;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ record, onSelect }) => {
  return (
    <div
      onClick={() => onSelect && onSelect(record)}
      className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#3D5AFE]/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer backdrop-blur-md space-y-3 shadow-sm dark:shadow-md group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[#3D5AFE] border border-slate-200 dark:border-slate-700/50 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3D5AFE] transition-colors">
              {record.skillName}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">{record.category}</span>
          </div>
        </div>
        <VerificationStatusBadge status={record.status} />
      </div>

      {record.details && <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{record.details}</p>}

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{record.submittedDate}</span>
        </div>

        {record.score > 0 && (
          <div className="font-bold text-slate-900 dark:text-slate-200">
            Score:{' '}
            <span className={record.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {record.score}/{record.maxScore}
            </span>
          </div>
        )}

        {record.credentialHash && (
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <Hash className="w-3 h-3 text-[#00897B] dark:text-[#00D9C0]" />
            <span>{record.credentialHash.substring(0, 8)}...</span>
          </div>
        )}
      </div>
    </div>
  );
};
