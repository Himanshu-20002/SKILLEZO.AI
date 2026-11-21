'use client';

import React from 'react';
import { Sparkles, Bot, Zap, ArrowRight, Lightbulb } from 'lucide-react';

export interface ReadyCountdownOverlayProps {
  countdown: number; // 3, 2, 1, 0
  role: string;
  onSkip?: () => void;
}

export const ReadyCountdownOverlay: React.FC<ReadyCountdownOverlayProps> = ({
  countdown,
  role,
  onSkip,
}) => {
  const isGo = countdown === 0;

  return (
    <div
      data-testid="ready-countdown-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Interview preparation countdown"
    >
      {/* Background ambient radial glow */}
      <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl shadow-indigo-950/50 flex flex-col items-center text-center space-y-6">
        {/* Header pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#00D9C0] animate-pulse" />
          <span>Get Ready • Mock Interview Starting</span>
        </div>

        {/* Role title */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {role}
          </h2>
          <p className="text-xs text-slate-400">
            {isGo
              ? 'Starting live evaluation now!'
              : 'The AI interviewer will ask your first question shortly.'}
          </p>
        </div>

        {/* Animated Countdown Circle */}
        <div className="relative flex items-center justify-center my-2">
          {/* Glowing pulse rings */}
          <div
            className={`absolute w-36 h-36 rounded-full transition-all duration-700 pointer-events-none ${
              isGo
                ? 'bg-emerald-500/30 scale-125 blur-xl'
                : 'bg-gradient-to-tr from-[#3D5AFE]/30 via-indigo-500/20 to-[#00D9C0]/30 scale-110 blur-lg animate-pulse'
            }`}
          />

          <div
            className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-xl ${
              isGo
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/40 scale-105'
                : countdown === 1
                ? 'border-amber-400/90 bg-amber-500/10 text-amber-300 shadow-amber-500/30'
                : countdown === 2
                ? 'border-cyan-400/90 bg-cyan-500/10 text-cyan-300 shadow-cyan-500/30'
                : 'border-[#3D5AFE] bg-indigo-500/10 text-indigo-300 shadow-indigo-500/30'
            }`}
          >
            <span
              data-testid="countdown-number"
              key={countdown}
              className={`font-black tracking-tight animate-scaleIn transition-transform ${
                isGo ? 'text-xl sm:text-2xl text-emerald-300' : 'text-5xl text-white'
              }`}
            >
              {isGo ? "Let's Go!" : countdown}
            </span>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {[3, 2, 1].map((step) => {
            const isCompleted = countdown < step;
            const isCurrent = countdown === step;
            return (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-8 bg-cyan-400'
                    : isCompleted
                    ? 'w-2 bg-indigo-500'
                    : 'w-2 bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Helpful coaching reminder */}
        <div className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block font-semibold">Ready Checklist:</strong>
            Speak clearly at a steady pace and structure your answer with concrete context.
          </div>
        </div>

        {/* Optional Skip Countdown CTA */}
        {onSkip && !isGo && (
          <button
            type="button"
            data-testid="btn-skip-countdown"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-white/5"
          >
            <span>Skip timer and start immediately</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
