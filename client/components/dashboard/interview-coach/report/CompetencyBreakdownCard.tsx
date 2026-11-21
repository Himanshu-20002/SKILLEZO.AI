'use client';

import React from 'react';
import {
  Code2,
  Cpu,
  FileText,
  BookOpen,
  MessageSquare,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { DimensionScores } from '@/types/interview-coach';

export interface CompetencyBreakdownCardProps {
  scores: DimensionScores;
  benchmarkScore?: number;
}

interface DimensionMeta {
  key: keyof DimensionScores;
  label: string;
  weight: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DIMENSIONS: DimensionMeta[] = [
  {
    key: 'technicalAccuracy',
    label: 'Technical Accuracy',
    weight: '30% Weight',
    description: 'Precision of technical definitions, algorithmic correctness, and architecture principles.',
    icon: Code2,
  },
  {
    key: 'problemSolvingDepth',
    label: 'Problem-Solving Depth',
    weight: '25% Weight',
    description: 'Systematic problem breakdown, edge-case handling, and architectural trade-off evaluation.',
    icon: Cpu,
  },
  {
    key: 'answerStructure',
    label: 'Answer Structure',
    weight: '15% Weight',
    description: 'Logical narrative progression, structured frameworks (e.g., STAR), and concise delivery.',
    icon: FileText,
  },
  {
    key: 'conceptCoverage',
    label: 'Concept & Domain Coverage',
    weight: '15% Weight',
    description: 'Explicit usage of industry-standard patterns, domain keywords, and ecosystem tools.',
    icon: BookOpen,
  },
  {
    key: 'communicationTone',
    label: 'Communication & Fluency',
    weight: '15% Weight',
    description: 'Verbal confidence, executive tone, clarity, and minimal filler-word interference.',
    icon: MessageSquare,
  },
];

export const CompetencyBreakdownCard: React.FC<CompetencyBreakdownCardProps> = ({
  scores,
  benchmarkScore = 75,
}) => {
  const getScoreColor = (value: number) => {
    if (value >= 85) return 'from-emerald-500 to-teal-400';
    if (value >= 70) return 'from-indigo-500 to-blue-500';
    if (value >= 60) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-500';
  };

  const getScoreBadge = (value: number) => {
    if (value >= benchmarkScore + 10) {
      return {
        label: 'Exceeds Benchmark',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        icon: CheckCircle,
      };
    }
    if (value >= benchmarkScore) {
      return {
        label: 'Meets Expectations',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        icon: CheckCircle,
      };
    }
    return {
      label: 'Focus Area',
      color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: AlertCircle,
    };
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            5-Dimension Competency Scorecard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted assessment calibrated against target seniority expectations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span>Target Benchmark: {benchmarkScore}/100</span>
        </div>
      </div>

      {/* Competency Bars List */}
      <div className="space-y-6">
        {DIMENSIONS.map((dim) => {
          const rawScore = scores[dim.key] ?? 0;
          const score = Math.round(rawScore);
          const Icon = dim.icon;
          const badge = getScoreBadge(score);
          const BadgeIcon = badge.icon;
          const gradientClass = getScoreColor(score);

          return (
            <div
              key={dim.key}
              data-testid={`competency-row-${dim.key}`}
              className="space-y-2"
            >
              {/* Top row: Label, Weight, and Score Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {dim.label}
                  </span>
                  <span className="hidden sm:inline text-[11px] font-medium text-slate-400">
                    ({dim.weight})
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.color}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    <span>{badge.label}</span>
                  </span>

                  <span
                    data-testid={`score-${dim.key}`}
                    className="text-base font-black text-slate-900 dark:text-slate-100 min-w-[50px] text-right"
                  >
                    {score}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                {/* Target Benchmark Marker */}
                <div
                  className="absolute top-0 bottom-0 z-10 w-0.5 bg-slate-400/50 dark:bg-slate-500/50"
                  style={{ left: `${benchmarkScore}%` }}
                  title={`Benchmark: ${benchmarkScore}%`}
                />

                {/* Animated Fill Bar */}
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
