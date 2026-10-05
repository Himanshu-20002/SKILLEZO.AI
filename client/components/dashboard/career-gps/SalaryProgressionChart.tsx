'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { SalaryProgressionItem } from '@/types/career-intelligence';

interface SalaryProgressionChartProps {
  items: SalaryProgressionItem[];
}

export const SalaryProgressionChart: React.FC<SalaryProgressionChartProps> = ({ items }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Salary Progression Projection</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Estimated compensation growth upon milestone completion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const isInitialTarget = idx === 0;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-1.5 text-xs text-center transition-all ${
                isInitialTarget
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60 ring-1 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                {isInitialTarget && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Your Target
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block tracking-tight">
                {item.salaryText}
              </span>
              <span className="text-[11px] font-semibold text-[#3D5AFE] dark:text-[#00D9C0] inline-block px-2 py-0.5 rounded-full bg-[#3D5AFE]/10 dark:bg-[#00D9C0]/10">
                {item.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
