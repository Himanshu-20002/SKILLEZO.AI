'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  OrchestrationInsight,
  OrchestrationRecommendation,
  RecommendationPriority,
} from '@/services/coach.service';
import {
  ActionProposal,
  ActionResult,
} from '@/services/action.service';
import { ActionProposalModal, ActionResultBanner } from './actions';
import {
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileText,
  Target,
  Briefcase,
  Zap,
} from 'lucide-react';

interface InsightsRoadmapViewProps {
  insights: OrchestrationInsight[];
  recommendations: OrchestrationRecommendation[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export const InsightsRoadmapView: React.FC<InsightsRoadmapViewProps> = ({
  insights,
  recommendations,
  onSelectEvidence,
}) => {
  const [selectedProposal, setSelectedProposal] = useState<ActionProposal | null>(null);
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);

  const hasContent = insights.length > 0 || recommendations.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Compass className="w-10 h-10 opacity-30 mb-2 stroke-1" />
        <p className="text-xs font-medium">No insights or actions generated yet</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
          Ask for recommendations to generate prioritized career next steps.
        </p>
      </div>
    );
  }

  const priorityStyles: Record<
    RecommendationPriority,
    { badge: string; border: string; label: string }
  > = {
    HIGH: {
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
      border: 'border-l-rose-500',
      label: 'High Priority',
    },
    MEDIUM: {
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
      border: 'border-l-amber-500',
      label: 'Medium Priority',
    },
    LOW: {
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
      border: 'border-l-emerald-500',
      label: 'Low Priority',
    },
  };

  const handleOpenActionProposal = (rec: OrchestrationRecommendation) => {
    const lower = (rec.title + ' ' + rec.explanation).toLowerCase();
    const isResume =
      lower.includes('resume') ||
      lower.includes('bullet') ||
      lower.includes('experience') ||
      lower.includes('ats');

    const proposal: ActionProposal = {
      proposalId: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ownerId: 'authenticated_candidate',
      actionType: isResume ? 'RESUME_UPDATE' : 'PROFILE_UPDATE',
      status: 'PROPOSED',
      title: rec.title,
      description: rec.explanation,
      rationale: `Synthesized from verified AI Career Coach intelligence: "${rec.title}".`,
      evidenceIds: rec.evidenceIds || [],
      targetEntity: {
        type: isResume ? 'resume' : 'profile',
        id: isResume ? 'active_candidate_resume' : 'candidate_profile',
        version: 1,
      },
      preview: {
        before: isResume
          ? 'Current section phrasing lacking verified impact metrics.'
          : 'Current candidate profile headline & skill tags.',
        after: isResume
          ? 'Optimized statement with verified action verbs and quantified impact metrics.'
          : `Updated profile details aligned with target role competency benchmarks.`,
        diffSummary: 'Deterministic mutation requiring explicit candidate review & approval.',
      },
      payload: isResume
        ? {
            resumeId: 'active_candidate_resume',
            sectionId: 'experience',
            proposed: { text: rec.explanation },
            baseDocumentVersion: 1,
          }
        : {
            changes: {
              headline: rec.title,
            },
          },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSelectedProposal(proposal);
  };

  const handleActionComplete = (result: ActionResult) => {
    setActionResults((prev) => [result, ...prev]);
  };

  return (
    <div className="space-y-4">
      {/* 0. Live Verified Action Results Banner */}
      {actionResults.length > 0 && (
        <div className="space-y-2">
          {actionResults.map((res, i) => (
            <ActionResultBanner
              key={i}
              result={res}
              onDismiss={() => {
                setActionResults((prev) => prev.filter((_, idx) => idx !== i));
              }}
            />
          ))}
        </div>
      )}

      {/* 1. Prioritized Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recommended Next Steps ({recommendations.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec, idx) => {
              const priority = rec.priority || 'MEDIUM';
              const pStyle = priorityStyles[priority];

              // Contextual navigation helper based on recommendation keywords
              const lower = (rec.title + ' ' + rec.explanation).toLowerCase();
              let actionLink = '/dashboard/resume-studio';
              let actionLabel = 'Open Resume Studio';
              let actionIcon = <FileText className="w-3.5 h-3.5" />;

              if (lower.includes('skill') || lower.includes('gap')) {
                actionLink = '/dashboard/skill-gap-analysis';
                actionLabel = 'View Skill Gaps';
                actionIcon = <Target className="w-3.5 h-3.5" />;
              } else if (lower.includes('job') || lower.includes('apply')) {
                actionLink = '/dashboard/job-center';
                actionLabel = 'Explore Jobs';
                actionIcon = <Briefcase className="w-3.5 h-3.5" />;
              } else if (lower.includes('roadmap') || lower.includes('milestone')) {
                actionLink = '/dashboard/career-gps';
                actionLabel = 'View Career GPS';
                actionIcon = <Compass className="w-3.5 h-3.5" />;
              }

              const isActionable =
                lower.includes('bullet') ||
                lower.includes('resume') ||
                lower.includes('skill') ||
                lower.includes('profile') ||
                lower.includes('experience');

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs border-l-4 ${pStyle.border} space-y-2.5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                      {rec.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wide uppercase shrink-0 ${pStyle.badge}`}
                    >
                      {pStyle.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.explanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    {rec.evidenceIds && rec.evidenceIds.length > 0 ? (
                      <span className="text-[10px] text-slate-400">
                        Evidence:{' '}
                        {rec.evidenceIds.map((id, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => onSelectEvidence?.(id)}
                            className="font-mono text-indigo-500 hover:underline mr-1"
                          >
                            {id}
                          </button>
                        ))}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      {/* Phase 7 Approval-Gated Action CTA */}
                      {isActionable && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionProposal(rec)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-2xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Review Action Proposal</span>
                        </button>
                      )}

                      {/* Safe read-only navigation CTA */}
                      <Link
                        href={actionLink}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        {actionIcon}
                        <span>{actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AI Reasoning Insights */}
      {insights.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 px-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              AI Insights ({insights.length})
            </span>
          </div>

          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-1"
              >
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insight.explanation}
                </p>
                {insight.evidenceIds && insight.evidenceIds.length > 0 && (
                  <div className="text-[10px] text-slate-400 pt-1">
                    Based on:{' '}
                    {insight.evidenceIds.map((id, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onSelectEvidence?.(id)}
                        className="font-mono text-indigo-500 hover:underline mr-1"
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Action Proposal Modal Dialog */}
      {selectedProposal && (
        <ActionProposalModal
          proposal={selectedProposal}
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
};
