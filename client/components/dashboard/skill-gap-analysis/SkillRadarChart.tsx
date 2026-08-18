'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { SkillRadarCategory } from '@/types/career-intelligence';

interface SkillRadarChartProps {
  categories: SkillRadarCategory[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ categories }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Category Proficiency Radar</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current candidate capabilities vs industry benchmarks</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3D5AFE]" />
            <span className="text-slate-600 dark:text-slate-400">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-slate-600 dark:text-slate-400">Required</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const isGap = cat.currentScore < cat.requiredScore;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">{cat.category}</span>
                <span className={`font-bold ${isGap ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {cat.currentScore}% / {cat.requiredScore}%
                </span>
              </div>

              {/* Progress Meters */}
              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                  {/* Current Score Bar */}
                  <div
                    className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] rounded-full"
                    style={{ width: `${cat.currentScore}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Gap: {Math.max(0, cat.requiredScore - cat.currentScore)}%</span>
                <span className={`font-semibold ${isGap ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isGap ? 'Action Needed' : 'Target Met'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
