'use client';

import React, { memo } from 'react';
import {
  Sparkles,
  FileCheck2,
  Target,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface EmptyStateHeroProps {
  onSelectPrompt: (prompt: string) => void;
  targetRole?: string;
}

interface PromptCardData {
  id: string;
  category: string;
  roiTag: string;
  title: string;
  desc: string;
  prompt: string;
  icon: React.ReactNode;
  accentClass: string;
}

const PromptCard = memo(({
  item,
  onSelect,
}: {
  item: PromptCardData;
  onSelect: (prompt: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(item.prompt)}
    className="group relative flex flex-col justify-between p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/90 hover:border-indigo-500/50 dark:hover:border-cyan-500/40 transition-all duration-200 shadow-xs hover:shadow-[0_8px_30px_rgba(61,90,254,0.12)] cursor-pointer text-left overflow-hidden will-change-transform active:scale-[0.99]"
  >
    {/* Ambient micro-glow in corner on hover */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 via-cyan-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

    <div>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${item.accentClass} transition-transform duration-200 group-hover:scale-105`}>
            {item.icon}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {item.category}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
          {item.roiTag}
        </span>
      </div>

      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
        {item.title}
      </h3>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
        {item.desc}
      </p>
    </div>

    <div className="flex items-center gap-1.5 mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-semibold text-indigo-600 dark:text-cyan-400">
      <span>Ask Coach</span>
      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
    </div>
  </button>
));

PromptCard.displayName = 'PromptCard';

export const EmptyStateHero: React.FC<EmptyStateHeroProps> = memo(({
  onSelectPrompt,
  targetRole = 'Full-Stack Engineer',
}) => {
  const quickPrompts: PromptCardData[] = [
    {
      id: 'ats-analysis',
      category: 'ATS Engine • 19.1',
      roiTag: '+15 pts potential',
      title: 'Analyze My Resume ATS Score',
      desc: 'Check keyword density, formatting structure, and section deductions against market standards.',
      prompt: 'Can you analyze my active resume and give me my ATS compatibility score?',
      icon: <FileCheck2 className="w-4 h-4 text-indigo-500" />,
      accentClass: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-800/40',
    },
    {
      id: 'skill-gap',
      category: 'Competencies • 19.2',
      roiTag: '6-Axis Matrix',
      title: 'Identify Top Skill Gaps',
      desc: `Benchmark technical competencies against ${targetRole} market requirements.`,
      prompt: `What are my top skill gaps for ${targetRole} and what skills should I prioritize learning next?`,
      icon: <Target className="w-4 h-4 text-purple-500" />,
      accentClass: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/50 dark:border-purple-800/40',
    },
    {
      id: 'employability',
      category: 'Hiring Index • 19.3',
      roiTag: 'Top 5% Target',
      title: 'Evaluate Employability Score',
      desc: 'Calculate overall candidate readiness across 5 deterministic mathematical pillars.',
      prompt: 'What is my current Employability Index and how can I boost it to reach the Top 5% tier?',
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      accentClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/40',
    },
    {
      id: 'matching-jobs',
      category: 'Smart Job Center',
      roiTag: 'Live Opportunities',
      title: 'Recommend Matching Jobs',
      desc: 'Discover vetted job openings specifically matching your verified skills and resume profile.',
      prompt: 'What live job openings best match my profile and verified credentials right now?',
      icon: <Briefcase className="w-4 h-4 text-cyan-500" />,
      accentClass: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/50 dark:border-cyan-800/40',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 px-4 max-w-2xl mx-auto will-change-transform">
      {/* 120 FPS Holographic AI Reactor Core */}
      <div className="relative flex items-center justify-center mb-5">
        {/* GPU Ambient Breathing Aura */}
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-cyan-400/20 blur-xl animate-ai-breathe pointer-events-none" />

        {/* Lightweight SVG Rotating Ring */}
        <div className="absolute w-20 h-20 animate-ai-spin-slow pointer-events-none opacity-40 dark:opacity-60">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              className="text-indigo-400 dark:text-cyan-400"
            />
          </svg>
        </div>

        {/* Central Reactor Orb */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3D5AFE] via-indigo-500 to-[#00D9C0] p-[2px] shadow-[0_0_24px_rgba(61,90,254,0.35)]">
          <div className="w-full h-full bg-white dark:bg-[#0c1236] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#3D5AFE] dark:text-[#00D9C0]" />
          </div>
        </div>
      </div>

      {/* Live Status Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs mb-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
          Autonomous Career Co-Pilot • Synchronized
        </span>
      </div>

      {/* Title & Ground-Truth Tagline */}
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
        SKILLEZO AI Career Coach
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg leading-relaxed">
        Verified career intelligence grounded in deterministic data. Ask about resume ATS optimization, skill gap roadmaps, or hiring readiness.
      </p>

      {/* Live Context Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
        <button
          type="button"
          onClick={() => onSelectPrompt(`How does my profile measure against ${targetRole}?`)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
        >
          <Target className="w-3 h-3 text-indigo-500" />
          <span>Target: <strong>{targetRole}</strong></span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>MongoDB Profile Linked</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Zero Hallucinations Guard</span>
        </div>
      </div>

      {/* 4 Interactive Prompt Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6 text-left">
        {quickPrompts.map((item) => (
          <PromptCard key={item.id} item={item} onSelect={onSelectPrompt} />
        ))}
      </div>
    </div>
  );
});

EmptyStateHero.displayName = 'EmptyStateHero';
