'use client';

import React from 'react';
import { CoachChatMessage } from '@/hooks/useCareerCoach';
import {
  Sparkles,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Layers,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

interface MessageBubbleProps {
  message: CoachChatMessage;
  onRetry?: () => void;
  onSelectEvidence?: (evidenceId: string) => void;
  onOpenWorkbenchTab?: (tab: 'metrics' | 'evidence' | 'actions') => void;
}

function renderInlineFormatting(
  text: string,
  onSelectEvidence?: (evidenceId: string) => void
): React.ReactNode[] {
  const regex = /(\[ID:\s*[a-zA-Z0-9_\-]+\]|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    const idMatch = part.match(/\[ID:\s*([a-zA-Z0-9_\-]+)\]/);
    if (idMatch) {
      const evidenceId = idMatch[1];
      return (
        <button
          key={index}
          type="button"
          onClick={() => onSelectEvidence?.(evidenceId)}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 transition-colors cursor-pointer align-baseline"
          title={`Click to inspect verified evidence #${evidenceId}`}
        >
          <span>ID: {evidenceId}</span>
        </button>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong
          key={index}
          className="font-semibold text-slate-900 dark:text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function FormattedMessageContent({
  content,
  onSelectEvidence,
}: {
  content: string;
  onSelectEvidence?: (evidenceId: string) => void;
}) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <div key={`list-${listKey++}`} className="space-y-1 my-2 pl-1">
          {currentList}
        </div>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings: ### or ## or #
    if (trimmed.startsWith('#')) {
      flushList();
      const headingText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <div
          key={`h-${i}`}
          className="flex items-center gap-2 pt-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1"
        >
          <span className="w-1.5 h-3.5 rounded-full bg-indigo-600 shrink-0" />
          <span>{headingText}</span>
        </div>
      );
      continue;
    }

    // Bullet points: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      currentList.push(
        <div
          key={`b-${i}`}
          className="flex items-start gap-2.5 py-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            {renderInlineFormatting(bulletText, onSelectEvidence)}
          </div>
        </div>
      );
      continue;
    }

    // Numbered items: 1. or 2.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const text = numMatch[2];
      currentList.push(
        <div
          key={`num-${i}`}
          className="flex items-start gap-2.5 py-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1 min-w-0">
            {renderInlineFormatting(text, onSelectEvidence)}
          </div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed my-1"
      >
        {renderInlineFormatting(trimmed, onSelectEvidence)}
      </p>
    );
  }

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  onSelectEvidence,
  onOpenWorkbenchTab,
}) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 max-w-2xl ml-auto mb-4">
        <div className="flex flex-col items-end">
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white text-xs sm:text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span suppressHydrationWarning className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Message Card
  const result = message.result;
  const metrics = result?.metrics || [];
  const evidence = result?.evidence || [];
  const recommendations = result?.recommendations || [];
  const limitations = result?.limitations || [];

  return (
    <div className="flex justify-start gap-3 max-w-3xl mr-auto mb-5 w-full">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/90 rounded-2xl rounded-tl-xs p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">
              SKILLEZO AI Coach
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <ShieldCheck className="w-3 h-3" />
              Verified Truth
            </span>
          </div>

          {result?.confidence && (
            <span className="text-[10px] font-medium text-slate-400">
              Confidence: <strong className="text-slate-600 dark:text-slate-300">{result.confidence}</strong>
            </span>
          )}
        </div>

        {/* Error State */}
        {message.error ? (
          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Response Generation Failed</span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-300">
              {message.error}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Question</span>
              </button>
            )}
          </div>
        ) : (
          /* Rich Structured Natural Language Reasoning */
          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <FormattedMessageContent
              content={message.content}
              onSelectEvidence={onSelectEvidence}
            />
          </div>
        )}

        {/* Action Items Cards Preview */}
        {recommendations.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                Top Priority Action Items ({recommendations.length})
              </span>
              <button
                type="button"
                onClick={() => onOpenWorkbenchTab?.('actions')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                View Full Roadmap →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recommendations.slice(0, 2).map((rec, idx) => {
                const priorityStyles =
                  rec.priority === 'HIGH'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40'
                    : rec.priority === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {rec.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${priorityStyles}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inline Structured Intelligence Chips */}
        {result && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-2">
            {/* Metrics pills */}
            {metrics.map((m, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onOpenWorkbenchTab?.('metrics')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
              >
                <TrendingUp className="w-3 h-3 text-indigo-500" />
                <span>{m.label}:</span>
                <strong className="font-bold">{m.value}</strong>
              </button>
            ))}

            {/* Recommendations Pill */}
            {recommendations.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenWorkbenchTab?.('actions')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/50 text-[11px] font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
              >
                <FileCheck className="w-3 h-3 text-purple-500" />
                <span>{recommendations.length} Action Items</span>
              </button>
            )}

            {/* Evidence Link */}
            {evidence.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenWorkbenchTab?.('evidence')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ml-auto"
              >
                <Layers className="w-3 h-3" />
                <span>{evidence.length} Evidence Items</span>
              </button>
            )}
          </div>
        )}

        {/* Limitations Callout Banner */}
        {limitations.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Context Limitations: </span>
              <span>{limitations.join(' ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
