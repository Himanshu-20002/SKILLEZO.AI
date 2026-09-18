'use client';

import React, { useRef, useEffect } from 'react';
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

  // Auto-scroll to bottom on message updates or lifecycle stage changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Derive current lifecycle status if active
  const isLifecycleStatus =
    status === 'thinking' ||
    status === 'executing_tools' ||
    status === 'synthesizing';

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
      {/* 1. Conversation Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
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
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 scroll-smooth"
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

      {/* 3. Bottom Composer */}
      <MessageComposer
        onSendMessage={onSendMessage}
        onCancel={onCancel}
        isGenerating={isGenerating}
      />
    </div>
  );
};
