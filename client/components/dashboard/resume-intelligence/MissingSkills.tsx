'use client';

import React from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { MissingSkillItem } from '@/types/resume';

interface MissingSkillsProps {
  missingSkills: MissingSkillItem[];
}

export const MissingSkills: React.FC<MissingSkillsProps> = ({ missingSkills }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Critical Skill Gaps Detected</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">High-impact skills missing for Full-Stack Engineer roles</p>
        </div>
      </div>

      <div className="space-y-3">
        {missingSkills.map((item, idx) => {
          const skillTitle = item.skill || (item as any).keyword || 'Target Skill';
          const impactLevel = item.impactLevel || (item as any).priority || 'Medium';

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{skillTitle}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    impactLevel === 'High'
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                  }`}
                >
                  {impactLevel} Impact Gap
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{item.recommendation}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
