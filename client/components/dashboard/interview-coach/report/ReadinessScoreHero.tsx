'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Calendar,
  Clock,
  Printer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { InterviewReport, InterviewSession, ReadinessLevel } from '@/types/interview-coach';

export interface ReadinessScoreHeroProps {
  session: InterviewSession;
  report: InterviewReport;
  totalQuestions?: number;
  totalAnswers?: number;
  onPracticeAgain?: () => void;
}

interface ReadinessBadgeConfig {
  label: string;
  headline: string;
  badgeClass: string;
  ringClass: string;
  textClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const READINESS_CONFIG: Record<ReadinessLevel, ReadinessBadgeConfig> = {
  role_model: {
    label: 'Role Model',
    headline: 'Exceptional Performance',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    ringClass: 'text-emerald-500 stroke-emerald-500',
    textClass: 'text-emerald-400',
    icon: Sparkles,
    description: 'Consistently demonstrates senior-level architectural thinking, precision, and executive communication.',
  },
  interview_ready: {
    label: 'Interview Ready',
    headline: 'Strong Candidate Profile',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    ringClass: 'text-indigo-500 stroke-indigo-500',
    textClass: 'text-indigo-400',
    icon: CheckCircle2,
    description: 'Demonstrates solid technical foundations and structured problem-solving capable of clearing real interviews.',
  },
  developing: {
    label: 'Developing',
    headline: 'Promising with Key Gaps',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ringClass: 'text-amber-500 stroke-amber-500',
    textClass: 'text-amber-400',
    icon: TrendingUp,
    description: 'Good understanding of core principles, but requires deeper trade-off analysis and sharper answer structure.',
  },
  needs_practice: {
    label: 'Needs Practice',
    headline: 'Fundamentals Need Reinforcement',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    ringClass: 'text-rose-500 stroke-rose-500',
    textClass: 'text-rose-400',
    icon: AlertTriangle,
    description: 'Practice articulating technical concepts with structured frameworks like STAR and explicit industry terminology.',
  },
};

export const ReadinessScoreHero: React.FC<ReadinessScoreHeroProps> = ({
  session,
  report,
  totalQuestions = session.totalQuestions || 3,
  totalAnswers = session.totalQuestions || 3,
  onPracticeAgain,
}) => {
  const router = useRouter();
  const config = READINESS_CONFIG[report.readinessLevel] || READINESS_CONFIG.interview_ready;
  const BadgeIcon = config.icon;

  const score = Math.round(report.overallScore);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleRestart = () => {
    if (onPracticeAgain) {
      onPracticeAgain();
    } else {
      router.push('/dashboard/interview-coach');
    }
  };

  const formattedDate = report.generatedAt
    ? new Date(report.generatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      {/* Decorative celestial background glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Overall Score Gauge & Readiness Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Circular SVG Gauge */}
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128">
              {/* Background Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`${config.ringClass} transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Score Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                data-testid="overall-score-number"
                className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                {score}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                / 100 Score
              </span>
            </div>
          </div>

          {/* Readiness Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="readiness-level-badge"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.badgeClass}`}
              >
                <BadgeIcon className="h-3.5 w-3.5" />
                <span>{config.label}</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize">
                <Layers className="h-3 w-3" />
                {session.experienceLevel} Tier
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {session.role} Interview Assessment
            </h1>

            <p className="max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right: Session Meta Pill & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t border-slate-100 dark:border-slate-800 lg:border-t-0">
          {/* Metadata badges grid */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium border border-slate-200/60 dark:bg-slate-800/60 dark:border-slate-700/60">
              <Award className="h-3.5 w-3.5 text-indigo-500" />
              <span>{totalAnswers}/{totalQuestions} Questions</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium border border-slate-200/60 dark:bg-slate-800/60 dark:border-slate-700/60">
              <Clock className="h-3.5 w-3.5 text-purple-500" />
              <span>{session.durationMinutes}m target</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium border border-slate-200/60 dark:bg-slate-800/60 dark:border-slate-700/60">
              <Calendar className="h-3.5 w-3.5 text-emerald-500" />
              <span>{formattedDate}</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              data-testid="btn-print-report"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Report</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              data-testid="btn-practice-again"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Practice Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
