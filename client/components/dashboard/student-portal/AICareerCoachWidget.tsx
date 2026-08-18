'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const AICareerCoachWidget: React.FC = () => {
  const [query, setQuery] = useState('');

  const suggestedPrompts = [
    'How do I fix my React skill gap?',
    'Review my resume score for Full-Stack roles',
    'Prepare me for a system design interview',
  ];

  return (
    <div className="bg-white dark:bg-[#111736] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Career Coach Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask any career, resume, or technical question for instant AI guidance.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/ai-career-coach"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto"
        >
          Open Chat <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2 mb-3.5">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(prompt)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all border border-slate-200/60 dark:border-slate-700/50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Search / Ask Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your AI Career Coach..."
          className="w-full pl-4 pr-12 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        />
        <Link
          href={`/dashboard/ai-career-coach${query ? `?q=${encodeURIComponent(query)}` : ''}`}
          className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
