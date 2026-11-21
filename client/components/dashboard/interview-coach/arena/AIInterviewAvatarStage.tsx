'use client';

import React from 'react';
import { Volume2, Square, RotateCcw, Bot, Sparkles, Mic, Activity } from 'lucide-react';

export type AIStageStatus = 'speaking' | 'listening' | 'analyzing' | 'idle';

export interface AIInterviewAvatarStageProps {
  status?: AIStageStatus;
  isSpeaking?: boolean;
  onReplayQuestion?: () => void;
  onStopAudio?: () => void;
  interviewerName?: string;
  interviewerTitle?: string;
  roleTitle?: string;
  className?: string;
}

export const AIInterviewAvatarStage: React.FC<AIInterviewAvatarStageProps> = ({
  status = 'idle',
  isSpeaking = false,
  onReplayQuestion,
  onStopAudio,
  interviewerName = 'SKILLEZO AI Interviewer',
  interviewerTitle = 'Senior Technical Evaluator',
  roleTitle,
  className = '',
}) => {
  const currentStatus: AIStageStatus = isSpeaking ? 'speaking' : status;

  return (
    <div className={`relative h-full min-h-[280px] flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white shadow-md flex flex-col justify-between ${className}`}>
      {/* Background Ambient Glow */}
      <div
        className={`pointer-events-none absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl transition-all duration-700 ${
          currentStatus === 'speaking'
            ? 'bg-blue-500/30'
            : currentStatus === 'listening'
            ? 'bg-emerald-500/25'
            : currentStatus === 'analyzing'
            ? 'bg-purple-500/30'
            : 'bg-indigo-500/15'
        }`}
      />

      {/* Header Bar (h-11 for exact symmetry) */}
      <div className="relative z-10 flex h-11 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xs">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs font-semibold tracking-tight text-white truncate">{interviewerName}</h3>
            <span className="hidden sm:inline text-[11px] text-slate-400">• {roleTitle || interviewerTitle}</span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div>
          {currentStatus === 'speaking' && (
            <span
              data-testid="status-speaking"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-medium text-blue-300 shadow-xs"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              </span>
              Speaking question...
            </span>
          )}

          {currentStatus === 'listening' && (
            <span
              data-testid="status-listening"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 shadow-xs"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Listening to you...
            </span>
          )}

          {currentStatus === 'analyzing' && (
            <span
              data-testid="status-analyzing"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-medium text-purple-300 shadow-xs"
            >
              <Sparkles className="h-3 w-3 animate-spin text-purple-400" />
              Analyzing response...
            </span>
          )}

          {currentStatus === 'idle' && (
            <span
              data-testid="status-idle"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300"
            >
              <Activity className="h-3 w-3 text-slate-400" />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Main Avatar Stage & Waveform (flex-1 for exact symmetry) */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-3">
        {/* Animated Avatar Orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ripple Wave on Speaking */}
          {currentStatus === 'speaking' && (
            <>
              <div className="absolute h-28 w-28 animate-ping rounded-full border border-blue-500/30 opacity-40 duration-1000" />
              <div className="absolute h-36 w-36 animate-pulse rounded-full border border-indigo-500/20" />
            </>
          )}

          {/* Outer Listening Ripple */}
          {currentStatus === 'listening' && (
            <div className="absolute h-28 w-28 animate-pulse rounded-full border border-emerald-500/30 duration-700" />
          )}

          {/* Core Interactive Orb */}
          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition-all duration-500 ${
              currentStatus === 'speaking'
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-blue-500/40 ring-4 ring-blue-400/40'
                : currentStatus === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-emerald-500/40 ring-4 ring-emerald-400/40'
                : currentStatus === 'analyzing'
                ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-purple-500/40 ring-4 ring-purple-400/40'
                : 'bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 shadow-slate-900/50 ring-2 ring-slate-700'
            }`}
          >
            {currentStatus === 'speaking' && (
              <Volume2 className="h-8 w-8 animate-bounce text-white drop-shadow" />
            )}
            {currentStatus === 'listening' && (
              <Mic className="h-8 w-8 animate-pulse text-white drop-shadow" />
            )}
            {currentStatus === 'analyzing' && (
              <Sparkles className="h-8 w-8 animate-spin text-white drop-shadow" />
            )}
            {currentStatus === 'idle' && (
              <Bot className="h-8 w-8 text-slate-300 drop-shadow" />
            )}
          </div>
        </div>

        {/* 7-Bar Dynamic Soundwave Equalizer */}
        <div className="mt-3 flex h-6 items-end gap-1" aria-label="Audio Visualizer">
          {[35, 75, 50, 95, 65, 80, 40].map((heightPct, idx) => {
            const isSpeakingActive = currentStatus === 'speaking';
            return (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isSpeakingActive
                    ? 'bg-gradient-to-t from-blue-500 to-cyan-300'
                    : currentStatus === 'listening'
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                    : 'bg-slate-700'
                }`}
                style={{
                  height: isSpeakingActive ? `${heightPct}%` : '20%',
                  animation: isSpeakingActive ? `bounce 0.8s ease-in-out infinite ${idx * 0.1}s` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Audio Playback Controls Footer (h-12 for exact symmetry) */}
      <div className="relative z-10 flex h-12 items-center justify-between border-t border-slate-800/80 bg-slate-900/90 px-4">
        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
          {currentStatus === 'speaking'
            ? 'Interviewer audio is playing...'
            : currentStatus === 'listening'
            ? 'Listening to candidate...'
            : 'AI Voice ready'}
        </p>

        <div className="flex items-center gap-2">
          {isSpeaking && onStopAudio && (
            <button
              type="button"
              onClick={onStopAudio}
              data-testid="btn-stop-audio"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 active:scale-95"
            >
              <Square className="h-3 w-3 fill-current" />
              Stop
            </button>
          )}

          {onReplayQuestion && (
            <button
              type="button"
              onClick={onReplayQuestion}
              data-testid="btn-replay-audio"
              disabled={currentStatus === 'analyzing'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-slate-200 shadow-xs transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
              Replay Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
