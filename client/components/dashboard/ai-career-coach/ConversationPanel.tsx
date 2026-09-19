'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { CoachChatMessage, CoachStatus } from '@/hooks/useCareerCoach';
import { EmptyStateHero } from './EmptyStateHero';
import { MessageBubble } from './MessageBubble';
import { LifecycleIndicator } from './LifecycleIndicator';
import { MessageComposer } from './MessageComposer';
import { Trash2, Bot, Target } from 'lucide-react';

interface ConversationPanelProps {
  messages: CoachChatMessage[];
  status: CoachStatus;
  isGenerating: boolean;
  targetRole?: string;
  onSendMessage: (text: string) => void;
  onCancel: () => void;
  onRetry: () => void;
  onClear: () => void;
  onSelectEvidence?: (evidenceId: string) => void;
  onOpenWorkbenchTab?: (tab: 'metrics' | 'evidence' | 'actions') => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  status,
  isGenerating,
  targetRole,
  onSendMessage,
  onCancel,
  onRetry,
  onClear,
  onSelectEvidence,
  onOpenWorkbenchTab,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessagesCountRef = useRef(messages.length);
  const [showJumpBottom, setShowJumpBottom] = React.useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNear = distanceFromBottom < 100;
    isNearBottomRef.current = isNear;
    setShowJumpBottom(!isNear && messages.length > 1);
  }, [messages.length]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
      isNearBottomRef.current = true;
      setShowJumpBottom(false);
    }
  }, []);

  // Smart auto-scroll: scroll down on new messages or if already following at the bottom
  useEffect(() => {
    const isNewMessageAdded = messages.length > prevMessagesCountRef.current;
    prevMessagesCountRef.current = messages.length;

    if (isNewMessageAdded) {
      scrollToBottom('smooth');
    } else if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, scrollToBottom]);

  // Derive current lifecycle status if active
  const isLifecycleStatus =
    status === 'thinking' ||
    status === 'executing_tools' ||
    status === 'synthesizing';

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-gradient-to-b from-white/95 via-slate-50/50 to-white/95 dark:from-[#0c1236]/95 dark:via-[#090e2a]/80 dark:to-[#0c1236]/95 backdrop-blur-xl border border-slate-200/90 dark:border-indigo-500/20 rounded-2xl overflow-hidden shadow-xs will-change-transform">
      {/* 120 FPS GPU Shimmer Progress Bar across the top when AI is thinking */}
      {isGenerating && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-indigo-100/50 dark:bg-indigo-950/50 overflow-hidden z-20 pointer-events-none">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#3D5AFE] to-[#00D9C0] animate-ai-shimmer" />
        </div>
      )}

      {/* 1. Executive Production Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1236]/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3D5AFE] via-indigo-600 to-[#00D9C0] flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1236]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                AI Career Coach
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Co-Pilot
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Autonomous Career Intelligence • Grounded in Profile Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {targetRole && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 px-2.5 py-1 rounded-lg">
              <Target className="w-3 h-3 text-indigo-500" />
              <span className="text-slate-400">Target:</span>
              <strong className="text-slate-800 dark:text-slate-100">{targetRole}</strong>
            </span>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              disabled={isGenerating}
              title="Clear conversation"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Messages Viewport */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain"
      >
        {messages.length === 0 ? (
          <EmptyStateHero
            onSelectPrompt={onSendMessage}
            targetRole={targetRole}
          />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onRetry={onRetry}
              onSelectEvidence={onSelectEvidence}
              onOpenWorkbenchTab={onOpenWorkbenchTab}
            />
          ))
        )}

        {/* Real-time Authentic Lifecycle Progress Indicator */}
        {isLifecycleStatus && (
          <div className="max-w-xl mr-auto pl-11 mb-3">
            <LifecycleIndicator status={status} />
          </div>
        )}
      </div>

      {/* Floating Jump-to-Bottom button */}
      {showJumpBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          aria-label="Jump to latest message"
          className="absolute bottom-24 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200 active:scale-95"
        >
          <span>Latest message</span>
          <span className="text-xs">↓</span>
        </button>
      )}

      {/* 3. Bottom Composer */}
      <div className="shrink-0">
        <MessageComposer
          onSendMessage={onSendMessage}
          onCancel={onCancel}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};
