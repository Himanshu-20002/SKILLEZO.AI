'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Wand2,
  AlertTriangle,
  Ban,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileEdit,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  TailoringInsightAction,
  TailoringInsightCategory,
  TailoringInsightItem,
  TailoringMatchState,
  StudioSectionKey,
} from '@/types/tailoring-insights.types';

export interface TailoringInsightCardProps {
  item: TailoringInsightItem;
  onNavigateToSection?: (
    category: TailoringInsightCategory,
    sectionKey: StudioSectionKey | null,
    entityId?: string
  ) => void;
  className?: string;
}

function getActionBadgeStyle(action: TailoringInsightAction): {
  classes: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  switch (action) {
    case 'PROMOTE':
      return {
        classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        label: 'PROMOTED SKILL',
        icon: Sparkles,
      };
    case 'REWRITE':
      return {
        classes: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
        label: 'REWRITTEN FOR ROLE',
        icon: Wand2,
      };
    case 'ADD_BULLET':
      return {
        classes: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        label: 'EMPHASIZED EVIDENCE',
        icon: CheckCircle2,
      };
    case 'DE_EMPHASIZE':
      return {
        classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        label: 'DE-EMPHASIZED',
        icon: AlertTriangle,
      };
    case 'DO_NOT_ADD':
      return {
        classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        label: 'INTENTIONALLY NOT ADDED',
        icon: Ban,
      };
    case 'USER_EDIT':
      return {
        classes: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
        label: 'CANDIDATE CUSTOMIZED',
        icon: FileEdit,
      };
    case 'UNATTRIBUTED':
    default:
      return {
        classes: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
        label: 'UNATTRIBUTED CHANGE',
        icon: HelpCircle,
      };
  }
}

function getMatchBadgeStyle(matchState: TailoringMatchState): {
  classes: string;
  label: string;
} {
  switch (matchState) {
    case 'PROVEN_RELEVANT':
      return {
        classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        label: 'Verified Match',
      };
    case 'PROVEN_UNDERREPRESENTED':
      return {
        classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        label: 'Underrepresented Evidence',
      };
    case 'PARTIAL_MATCH':
      return {
        classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        label: 'Partial Match',
      };
    case 'RELATED_EVIDENCE':
      return {
        classes: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        label: 'Related Evidence',
      };
    case 'MISSING':
    case 'INSUFFICIENT_EVIDENCE':
      return {
        classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        label: 'Missing Evidence in Profile',
      };
    case 'UNATTRIBUTED':
    default:
      return {
        classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        label: 'Direct Edit',
      };
  }
}

export const TailoringInsightCard: React.FC<TailoringInsightCardProps> = ({
  item,
  onNavigateToSection,
  className = '',
}) => {
  const [isDiffExpanded, setIsDiffExpanded] = useState(false);
  const actionBadge = getActionBadgeStyle(item.action);
  const matchBadge = getMatchBadgeStyle(item.matchState);
  const ActionIcon = actionBadge.icon;

  const hasDiffValues = Boolean(item.beforeValue || item.afterValue);

  const handleNavigate = () => {
    if (onNavigateToSection) {
      onNavigateToSection(item.category, item.targetSectionKey || null, item.targetEntityId);
    }
  };

  return (
    <div
      role="article"
      aria-label={`Tailoring insight for ${item.requirementName}`}
      className={`rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${className}`}
    >
      {/* Top Header: Action Badge & Match State */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${actionBadge.classes}`}
          >
            <ActionIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{actionBadge.label}</span>
          </span>

          {item.isUserEdited && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              <FileEdit className="w-2.5 h-2.5" aria-hidden="true" />
              <span>User Customized</span>
            </span>
          )}
        </div>

        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${matchBadge.classes}`}
        >
          {matchBadge.label}
        </span>
      </div>

      {/* Requirement Title and Category */}
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <span>{item.requirementName}</span>
          {item.requirementCategory && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {item.requirementCategory}
            </span>
          )}
        </h4>
      </div>

      {/* Rationale Body */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
        {item.rationale}
      </p>

      {/* Grounded Evidence Snippet if available */}
      {item.evidenceSnippet && (
        <div className="mb-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 p-2.5 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
            <span>Verified Career Evidence{item.evidenceSource ? ` · ${item.evidenceSource}` : ''}</span>
          </div>
          <p className="text-xs italic text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-emerald-500/30">
            "{item.evidenceSnippet}"
          </p>
        </div>
      )}

      {/* Before / After Diff Expansion */}
      {hasDiffValues && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setIsDiffExpanded(prev => !prev)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-hidden"
            aria-expanded={isDiffExpanded}
          >
            {isDiffExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Hide Content Comparison</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Show Content Comparison</span>
              </>
            )}
          </button>

          {isDiffExpanded && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-rose-500/5 border border-rose-500/20 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                  Master Resume
                </span>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.beforeValue || '(Empty or absent)'}</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Tailored Resume
                </span>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.afterValue || '(Removed or excluded)'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation: [View in Resume] button */}
      {item.targetSectionKey && onNavigateToSection && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleNavigate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          >
            <span>View in Resume</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
