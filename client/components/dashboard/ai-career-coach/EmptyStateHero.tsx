'use client';

import React from 'react';
import {
  Sparkles,
  FileCheck,
  Target,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

interface EmptyStateHeroProps {
  onSelectPrompt: (prompt: string) => void;
  targetRole?: string;
}

export const EmptyStateHero: React.FC<EmptyStateHeroProps> = ({
  onSelectPrompt,
  targetRole,
}) => {
  const quickPrompts = [
    {
      title: 'Analyze My Resume ATS Score',
      desc: 'Check keyword match, formatting, and structural deductions',
      prompt: 'Can you analyze my active resume and give me my ATS compatibility score?',
      icon: <FileCheck className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: 'Identify Top Skill Gaps',
      desc: targetRole
        ? `Benchmark my skills against ${targetRole}`
        : 'Benchmark my verified skills against market requirements',
      prompt: targetRole
        ? `What are my top skill gaps for ${targetRole}?`
        : 'What are my top skill gaps and what skills should I learn next?',
      icon: <Target className="w-4 h-4 text-purple-500" />,
    },
    {
      title: 'Evaluate Employability Score',
      desc: 'Check overall readiness across 5 deterministic pillars',
      prompt: 'What is my current Employability Index and how can I boost it?',
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    },
    {
      title: 'Recommend Matching Jobs',
      desc: 'Discover live opportunities matching my skills and score',
      prompt: 'What live job openings best match my profile right now?',
      icon: <Briefcase className="w-4 h-4 text-blue-500" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 mb-4">
        <div className="w-full h-full bg-white dark:bg-[#0c1236] rounded-[14px] flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        SKILLEZO AI Career Coach
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
        Verified career intelligence grounded in deterministic data. Ask about resume optimization, skill gaps, or employability.
      </p>

      {targetRole && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-700 dark:text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Benchmarking against: <strong>{targetRole}</strong></span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-6 text-left">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {item.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-8">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
