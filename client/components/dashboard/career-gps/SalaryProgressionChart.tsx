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
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs text-center"
          >
            <span className="text-slate-500 dark:text-slate-400 font-medium block">{item.label}</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {item.salaryText}
            </span>
            <span className="text-[11px] font-semibold text-[#3D5AFE] dark:text-[#00D9C0]">
              {item.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
