'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, AlertCircle } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (message: string) => void;
  onCancel: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
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

  const isOverLimit = input.length > MAX_CHARS;

  return (
    <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-b-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xs">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || disabled}
            placeholder={
              isGenerating
                ? 'AI Coach is analyzing...'
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
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 transition-colors text-xs font-semibold cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isOverLimit || disabled}
                aria-label="Send message"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-400">
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono text-[10px]">Shift+Enter</kbd> for newline
          </span>
          <span
            className={`ml-auto font-mono ${
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
};
