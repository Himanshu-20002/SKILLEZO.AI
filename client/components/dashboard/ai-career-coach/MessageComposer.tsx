'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Send, Square, AlertCircle, Sparkles, Target, TrendingUp, Briefcase } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (message: string) => void;
  onCancel: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

interface CommandChip {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const COMMAND_CHIPS: CommandChip[] = [
  {
    id: 'ats',
    label: '⚡ /ats-score',
    prompt: 'Analyze my active resume ATS score and identify deductions',
    icon: <Sparkles className="w-3 h-3 text-indigo-400" />,
  },
  {
    id: 'gaps',
    label: '🎯 /skill-gaps',
    prompt: 'What are my top technical skill gaps for my target role?',
    icon: <Target className="w-3 h-3 text-purple-400" />,
  },
  {
    id: 'employability',
    label: '📈 /employability',
    prompt: 'Evaluate my current Employability Score across all 5 pillars',
    icon: <TrendingUp className="w-3 h-3 text-emerald-400" />,
  },
  {
    id: 'jobs',
    label: '💼 /matching-jobs',
    prompt: 'Recommend live job openings that match my verified skills',
    icon: <Briefcase className="w-3 h-3 text-cyan-400" />,
  },
];

export const MessageComposer: React.FC<MessageComposerProps> = memo(({
  onSendMessage,
  onCancel,
  isGenerating,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 4000;

  // Auto-resize textarea height up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (prompt: string) => {
    if (isGenerating || disabled) return;
    onSendMessage(prompt);
  };

  const isOverLimit = input.length > MAX_CHARS;
  const hasText = input.trim().length > 0;

  return (
    <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 bg-white/90 dark:bg-[#0c1236]/90 backdrop-blur-md rounded-b-2xl will-change-transform">
      {/* 120 FPS Instant Command Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-1 no-scrollbar text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 select-none mr-1">
          Quick Commands:
        </span>
        {COMMAND_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleChipClick(chip.prompt)}
            disabled={isGenerating || disabled}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-cyan-500/40 transition-all duration-150 shrink-0 font-medium text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {chip.icon}
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Main Composer Dock */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/80 focus-within:border-indigo-500/80 dark:focus-within:border-cyan-400/70 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:ring-cyan-500/20 transition-all shadow-xs">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || disabled}
            placeholder={
              isGenerating
                ? 'AI Coach is analyzing career intelligence...'
                : 'Ask about ATS score, skill gaps, job matches, or career advice... (Enter to send)'
            }
            rows={1}
            aria-label="Ask SKILLEZO AI Career Coach"
            className="flex-1 max-h-40 min-h-[44px] p-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none outline-none leading-relaxed"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-1">
            {isGenerating ? (
              <button
                type="button"
                onClick={onCancel}
                aria-label="Stop generation"
                title="Cancel request"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 transition-colors text-xs font-semibold cursor-pointer active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!hasText || isOverLimit || disabled}
                aria-label="Send message"
                className={`flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all duration-200 cursor-pointer shrink-0 active:scale-95 ${
                  hasText && !isOverLimit && !disabled
                    ? 'bg-gradient-to-tr from-[#3D5AFE] via-indigo-600 to-[#00D9C0] shadow-[0_0_18px_rgba(61,90,254,0.45)] hover:scale-105'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-400">
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Shift+Enter</kbd> for newline
          </span>
          <span
            className={`ml-auto font-mono text-[11px] ${
              isOverLimit
                ? 'text-rose-500 font-bold flex items-center gap-1'
                : 'text-slate-400'
            }`}
          >
            {isOverLimit && <AlertCircle className="w-3 h-3" />}
            {input.length}/{MAX_CHARS}
          </span>
        </div>
      </form>
    </div>
  );
});

MessageComposer.displayName = 'MessageComposer';
