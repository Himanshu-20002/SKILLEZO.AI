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
          <span className="text-[10px] text-slate-400 mt-1 px-1">
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
          /* Natural Language Reasoning */
          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 whitespace-pre-wrap break-words">
            {message.content}
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
