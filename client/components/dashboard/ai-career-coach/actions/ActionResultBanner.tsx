'use client';

import React from 'react';
import Link from 'next/link';
import { ActionResult } from '@/services/action.service';
import { CheckCircle2, TrendingUp, ExternalLink, ArrowRight } from 'lucide-react';

interface ActionResultBannerProps {
  result: ActionResult;
  onDismiss?: () => void;
}

export const ActionResultBanner: React.FC<ActionResultBannerProps> = ({
  result,
  onDismiss,
}) => {
  const isCompleted = result.status === 'COMPLETED';

  // Determine navigation link based on affected entity
  let entityLink = '/dashboard/resume-studio';
  let entityLabel = 'View in Resume Studio';

  if (result.affectedEntity.type === 'profile') {
    entityLink = '/dashboard/career-profile';
    entityLabel = 'View Career Profile';
  } else if (result.affectedEntity.type === 'career_plan') {
    entityLink = '/dashboard/career-gps';
    entityLabel = 'View Career GPS';
  }

  return (
    <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 backdrop-blur-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-full bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Deterministic Action Completed & Verified
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80">
              {result.summary}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Verified Metrics & Score Delta */}
      {result.verification?.metrics && result.verification.metrics.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
          {result.verification.metrics.map((m, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-[11px]"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {m.metric}:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {m.value}
              </span>
              {m.delta !== undefined && m.delta !== 0 && (
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{m.delta} pts
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Direct link to updated entity */}
      <div className="flex items-center justify-end pt-1">
        <Link
          href={entityLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <span>{entityLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
