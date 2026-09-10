'use client';

import React from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Info,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { AIResumeRecommendation } from '@/types/resume';

interface AIRecommendationsProps {
  recommendations: AIResumeRecommendation[];
  topAction?: AIResumeRecommendation;
  onOptimize: (rec: AIResumeRecommendation) => void;
  isOptimizing?: boolean;
  optimizingRecId?: string | null;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  topAction,
  onOptimize,
  isOptimizing = false,
  optimizingRecId = null,
}) => {
  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return { label: 'Critical', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400' };
      case 'HIGH':
        return { label: 'High Priority', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400' };
      case 'MEDIUM':
        return { label: 'Medium', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400' };
      default:
        return { label: 'Low', bg: 'bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-400' };
    }
  };

  const getActionabilityMeta = (actionability?: string) => {
    switch (actionability) {
      case 'REQUIRES_NEW_EVIDENCE':
        return {
          label: 'Requires Evidence',
          isRewritable: false,
          note: 'This requires adding genuine projects or experience before optimizing.',
        };
      case 'STRENGTHEN_EVIDENCE':
        return {
          label: 'Strengthen Phrasing',
          isRewritable: true,
          note: 'Refine existing experience to highlight depth.',
        };
      case 'FIX_NOW':
      default:
        return {
          label: 'Direct AI Fix',
          isRewritable: true,
          note: 'Ready for one-click controlled AI optimization.',
        };
    }
  };

  const displayedTopAction = topAction || (recommendations.length > 0 ? recommendations[0] : null);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#3D5AFE] to-[#00D9C0] text-white">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>High-Impact Recommendations</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Action Items
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized AI suggestions to improve bullet impact and ATS keyword coverage
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-start sm:self-center">
          {recommendations.length} Actionable Steps Available
        </div>
      </div>

      {/* Hero Top Action Banner */}
      {displayedTopAction && (
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-[#3D5AFE]/10 to-teal-500/10 border border-[#3D5AFE]/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3D5AFE] dark:text-[#00D9C0]">
                #1 Top Recommended Action
              </span>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-[#3D5AFE] dark:text-[#00D9C0] border border-blue-500/30">
              Highest Score Delta
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {displayedTopAction.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {displayedTopAction.summary || displayedTopAction.problem || displayedTopAction.description}
            </p>
            {displayedTopAction.whyItMatters && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Why it matters: {displayedTopAction.whyItMatters}
              </p>
            )}
          </div>

          <div className="pt-1 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{displayedTopAction.suggestedAction || 'Ready for one-click optimization'}</span>
            </div>

            <button
              onClick={() => onOptimize(displayedTopAction)}
              disabled={isOptimizing && optimizingRecId === displayedTopAction.id}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-95 text-white text-xs font-bold shrink-0 cursor-pointer shadow-sm transition-all"
            >
              {isOptimizing && optimizingRecId === displayedTopAction.id ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Improve Bullet Impact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Prioritized Recommendation Cards List */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const badge = getPriorityBadge(rec.priority);
          const meta = getActionabilityMeta(rec.actionability);
          const isCurrentOptimizing = isOptimizing && optimizingRecId === rec.id;

          return (
            <div
              key={rec.id || index}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {rec.category || 'IMPACT'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {rec.title}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rec.summary || rec.problem || rec.description}
                </p>

                {rec.whyItMatters && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Impact:</span> {rec.whyItMatters}
                  </p>
                )}
              </div>

              {/* Action Button / Badge */}
              <div className="shrink-0 flex items-center gap-2">
                {meta.isRewritable ? (
                  <button
                    onClick={() => onOptimize(rec)}
                    disabled={isCurrentOptimizing}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#3D5AFE] hover:text-white dark:hover:bg-[#3D5AFE] text-[#3D5AFE] dark:text-[#00D9C0] border border-[#3D5AFE]/30 hover:border-transparent text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-all group"
                  >
                    {isCurrentOptimizing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Validating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0] group-hover:text-white transition-colors" />
                        <span>Improve Bullet</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires Evidence</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
