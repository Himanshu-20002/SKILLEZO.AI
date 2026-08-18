'use client';

import React from 'react';
import { Cpu, FileText, FolderGit2, Target, Eye } from 'lucide-react';
import { EmployabilityIndexData } from '@/types/career-intelligence';

interface ScoreBreakdownProps {
  metrics: EmployabilityIndexData['metrics'];
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ metrics }) => {
  const items = [
    { label: 'Technical Readiness', score: metrics.technicalReadiness, icon: Cpu, color: 'text-[#3D5AFE]' },
    { label: 'Resume Strength', score: metrics.resumeStrength, icon: FileText, color: 'text-cyan-500' },
    { label: 'Project Strength', score: metrics.projectStrength, icon: FolderGit2, color: 'text-purple-500' },
    { label: 'Skill Alignment', score: metrics.skillAlignment, icon: Target, color: 'text-emerald-500' },
    { label: 'Recruiter Visibility', score: metrics.recruiterVisibility, icon: Eye, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</span>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>

          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 block">
            {item.score}%
          </span>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] rounded-full" style={{ width: `${item.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
