'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ATSCompatibilityItem } from '@/types/resume';

interface ATSCompatibilityProps {
  items: ATSCompatibilityItem[];
}

export const ATSCompatibility: React.FC<ATSCompatibilityProps> = ({ items }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">ATS Parsing Engine Compatibility</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tested against major enterprise recruitment software</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100">{item.system}</span>
              <span className="font-extrabold text-[#3D5AFE] dark:text-[#00D9C0]">{item.compatibilityScore}%</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] rounded-full"
                style={{ width: `${item.compatibilityScore}%` }}
              />
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
