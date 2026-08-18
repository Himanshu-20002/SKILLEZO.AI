'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CompetencyItem } from '@/types/career-intelligence';

interface CompetencyTableProps {
  competencies: CompetencyItem[];
  onAddToGap: (skill: string) => void;
}

export const CompetencyTable: React.FC<CompetencyTableProps> = ({
  competencies,
  onAddToGap,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Competency Match Breakdown</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Detailed skill matrix vs target role requirements</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="pb-3 px-2">Skill</th>
              <th className="pb-3 px-2">Category</th>
              <th className="pb-3 px-2">Current Level</th>
              <th className="pb-3 px-2">Required Level</th>
              <th className="pb-3 px-2 text-center">Priority</th>
              <th className="pb-3 px-2 text-center">Status</th>
              <th className="pb-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {competencies.map((comp) => (
              <tr key={comp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100">{comp.skill}</td>
                <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{comp.category}</td>
                <td className="py-3 px-2 font-semibold text-[#3D5AFE] dark:text-[#00D9C0]">{comp.currentLevel}</td>
                <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">{comp.requiredLevel}</td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      comp.priority === 'High'
                        ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                        : comp.priority === 'Medium'
                        ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {comp.priority}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  {comp.status === 'Matched' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Matched
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      <AlertCircle className="w-3 h-3" />
                      Gap Needed
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">
                  {comp.status === 'Gap' ? (
                    <button
                      onClick={() => onAddToGap(comp.skill)}
                      className="px-2.5 py-1 rounded-lg bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold text-[11px] cursor-pointer transition-colors"
                    >
                      Add to Gap
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
