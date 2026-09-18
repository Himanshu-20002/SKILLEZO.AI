'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCareerCoach } from '@/hooks/useCareerCoach';
import { MessageBubble } from './MessageBubble';
import { LifecycleIndicator } from './LifecycleIndicator';
import {
  Bot,
  Sparkles,
  X,
  Maximize2,
  Send,
  Square,
  Trash2,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Analyze my active resume & ATS score',
  'What are my missing skill gaps?',
  'What is my employability score?',
  'Recommend matching jobs for me',
];

export const CoachFloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessagesCountRef = useRef(0);

  const {
    messages,
    status,
    isGenerating,
    sendMessage,
    cancelRequest,
    retryLastMessage,
    clearConversation,
  } = useCareerCoach();

  // Hide the floating widget if user is already on the dedicated AI Career Coach workbench page
  const isDedicatedCoachPage = pathname === '/dashboard/ai-career-coach';

  // Smart auto-scroll inside widget
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      isNearBottomRef.current = true;
    }
  }, []);

  useEffect(() => {
    const isNew = messages.length > prevMessagesCountRef.current;
    prevMessagesCountRef.current = messages.length;

    if (isNew) {
      scrollToBottom();
    } else if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, scrollToBottom]);

  // Scroll to bottom when opening drawer
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen, scrollToBottom]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isDedicatedCoachPage) {
    return null;
  }

  const isLifecycleStatus =
    status === 'thinking' ||
    status === 'executing_tools' ||
    status === 'synthesizing';

  return (
    <>
      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="SKILLEZO AI Career Coach Assistant"
          className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-7rem)] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl shadow-indigo-900/20 dark:shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    AI Career Coach
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Real-time career intelligence & advice
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearConversation}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/ai-career-coach');
                }}
                title="Expand to Full Workbench"
                aria-label="Expand to full career coach workbench"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                aria-label="Close assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 overscroll-contain"
          >
            {messages.length === 0 ? (
              <div className="py-6 px-2 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    How can I accelerate your career today?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Ask anything about resume diagnostics, ATS scores, skill gaps, or jobs.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Suggested Questions
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        className="text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-indigo-50/80 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRetry={retryLastMessage}
                  onOpenWorkbenchTab={() => {
                    setIsOpen(false);
                    router.push('/dashboard/ai-career-coach');
                  }}
                />
              ))
            )}

            {isLifecycleStatus && (
              <div className="max-w-md mr-auto pl-11 mb-2">
                <LifecycleIndicator status={status} />
              </div>
            )}
          </div>

          {/* Bottom Composer */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder={
                  isGenerating ? 'AI Coach is analyzing...' : 'Ask AI Coach anything...'
                }
                aria-label="Ask SKILLEZO AI Coach"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />

              {isGenerating ? (
                <button
                  type="button"
                  onClick={cancelRequest}
                  aria-label="Stop response"
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 transition-colors cursor-pointer shrink-0"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Icon Button (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close AI Career Coach' : 'Open AI Career Coach'}
          title="Open AI Career Coach"
          className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-900/30 rotate-90'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white hover:scale-108 hover:shadow-indigo-500/40 shadow-indigo-500/30'
          }`}
        >
          {/* Subtle Ambient Pulse Ring when closed */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-sm group-hover:opacity-60 transition-opacity animate-pulse pointer-events-none" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              {/* Emerald Active Status Dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
          )}
        </button>
      </div>
    </>
  );
};
