'use client';

import React from 'react';
import { LifecycleStatus } from '@/services/coach.service';
import { Sparkles, Cpu, Lightbulb, Loader2 } from 'lucide-react';

interface LifecycleIndicatorProps {
  status: LifecycleStatus;
}

export const LifecycleIndicator: React.FC<LifecycleIndicatorProps> = ({
  status,
}) => {
  const steps: Record<
    LifecycleStatus,
    { title: string; desc: string; icon: React.ReactNode; color: string }
  > = {
    thinking: {
      title: 'Analyzing Inquiry',
      desc: 'Classifying intent and mapping career requirements...',
      icon: <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />,
      color: 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300',
    },
    executing_tools: {
      title: 'Executing Deterministic Diagnostics',
      desc: 'Checking profile, active resume, skill gaps, and verified evidence...',
      icon: <Cpu className="w-4 h-4 animate-pulse text-purple-500" />,
      color: 'border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
    },
    synthesizing: {
      title: 'Synthesizing Ground-Truth Guidance',
      desc: 'Validating metrics and formulating actionable recommendations...',
      icon: <Lightbulb className="w-4 h-4 animate-bounce text-amber-500" />,
      color: 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    },
  };

  const current = steps[status] || steps.thinking;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-sm ${current.color}`}
    >
      <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 shadow-xs border border-current/10 shrink-0">
        {current.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-wide uppercase">
            {current.title}
          </span>
          <Loader2 className="w-3 h-3 animate-spin opacity-70" />
        </div>
        <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
          {current.desc}
        </p>
      </div>
    </div>
  );
};
