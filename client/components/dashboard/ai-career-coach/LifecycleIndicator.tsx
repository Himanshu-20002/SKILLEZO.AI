'use client';

import React, { memo } from 'react';
import { LifecycleStatus } from '@/services/coach.service';
import { Sparkles, Cpu, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react';

interface LifecycleIndicatorProps {
  status: LifecycleStatus;
}

interface StepInfo {
  key: LifecycleStatus;
  stepNum: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const STEPS: StepInfo[] = [
  {
    key: 'thinking',
    stepNum: 1,
    title: 'Intent Classification',
    desc: 'Mapping question to verified career taxonomy...',
    icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
  },
  {
    key: 'executing_tools',
    stepNum: 2,
    title: 'Diagnostic Inspection',
    desc: 'Scanning MongoDB profile, active resume & ATS...',
    icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
  },
  {
    key: 'synthesizing',
    stepNum: 3,
    title: 'Intelligence Synthesis',
    desc: 'Formulating structured metrics & safe next steps...',
    icon: <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />,
  },
];

export const LifecycleIndicator: React.FC<LifecycleIndicatorProps> = memo(({
  status,
}) => {
  const statusOrder: Record<LifecycleStatus, number> = {
    thinking: 1,
    executing_tools: 2,
    synthesizing: 3,
  };

  const currentStep = statusOrder[status] || 1;
  const activeStepInfo = STEPS.find((s) => s.key === status) || STEPS[0];

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-3.5 sm:p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-white/95 via-indigo-50/40 to-white/95 dark:from-[#0c1236]/95 dark:via-indigo-950/30 dark:to-[#0c1236]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(61,90,254,0.08)] space-y-3 will-change-transform"
    >
      {/* 3-Stage Progress Pipeline */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isDone = currentStep > step.stepNum;
          const isActive = currentStep === step.stepNum;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#3D5AFE] text-white shadow-[0_0_10px_rgba(61,90,254,0.5)] animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3 h-3 stroke-[3]" /> : step.stepNum}
                </div>
                <span
                  className={`hidden sm:inline text-[11px] font-semibold truncate transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-cyan-400'
                      : isDone
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] rounded-full transition-all duration-200 ${
                    currentStep > step.stepNum
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Stage Details & Telemetry Pulse */}
      <div className="flex items-start gap-2.5 pt-1">
        <div className="p-1.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 shrink-0 mt-0.5">
          {activeStepInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 tracking-wide uppercase">
              {activeStepInfo.title}
            </span>
            <Loader2 className="w-3 h-3 text-[#3D5AFE] dark:text-[#00D9C0] animate-spin shrink-0" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {activeStepInfo.desc}
          </p>
        </div>
      </div>
    </div>
  );
});

LifecycleIndicator.displayName = 'LifecycleIndicator';
