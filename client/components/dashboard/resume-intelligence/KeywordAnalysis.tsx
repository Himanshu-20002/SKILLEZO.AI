'use client';

import React, { useState } from 'react';
import { Tag, CheckCircle2, XCircle } from 'lucide-react';
import { KeywordMatchItem } from '@/types/resume';

interface KeywordAnalysisProps {
  keywords: KeywordMatchItem[];
  targetRole?: string;
}

export const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({
  keywords,
  targetRole = 'Full-Stack Engineer',
}) => {
  const [filter, setFilter] = useState<'All' | 'Matched' | 'Missing'>('All');

  const filteredKeywords = keywords.filter((k) => {
    if (filter === 'Matched') return k.matched;
    if (filter === 'Missing') return !k.matched;
    return true;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Keyword & Skill Matrix</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                {targetRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keywords matched against {targetRole} requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          {(['All', 'Matched', 'Missing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {filteredKeywords.map((item, idx) => (
          <div
            key={idx}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
              item.matched
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
            }`}
          >
            {item.matched ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>{item.keyword}</span>
            {item.matched && item.frequency > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                {item.frequency}x
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
