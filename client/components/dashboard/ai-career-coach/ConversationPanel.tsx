'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { CoachChatMessage, CoachStatus } from '@/hooks/useCareerCoach';
import { EmptyStateHero } from './EmptyStateHero';
import { MessageBubble } from './MessageBubble';
import { LifecycleIndicator } from './LifecycleIndicator';
import { MessageComposer } from './MessageComposer';
import { Trash2, Bot, Sparkles } from 'lucide-react';

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
      // Force scroll on new user message or initial response card
      scrollToBottom('smooth');
    } else if (isNearBottomRef.current && scrollRef.current) {
      // Keep glued to bottom during streaming ONLY if user hasn't scrolled up
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, scrollToBottom]);

  // Derive current lifecycle status if active
  const isLifecycleStatus =
    status === 'thinking' ||
    status === 'executing_tools' ||
    status === 'synthesizing';

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
      {/* 1. Conversation Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                AI Career Coach
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                <Sparkles className="w-2.5 h-2.5" />
                Phase 6 Workbench
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Deterministic truth + structured AI reasoning
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            disabled={isGenerating}
            title="Clear conversation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* 2. Messages Viewport */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 overscroll-contain"
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

      {/* Floating Jump-to-Bottom button when reading earlier messages */}
      {showJumpBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          aria-label="Jump to latest message"
          className="absolute bottom-20 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200"
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
