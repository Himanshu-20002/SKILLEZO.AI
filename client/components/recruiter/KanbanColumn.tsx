'use client';

import React from 'react';
import {
  Clock,
  Search,
  UserCheck,
  Video,
  Gift,
  CheckCircle2,
  XCircle,
  LucideIcon,
} from 'lucide-react';
import { RecruiterApplicationItem, ApplicationStage } from '@/services/recruiter.service';
import { ApplicantCard } from './ApplicantCard';

interface StageConfig {
  key: ApplicationStage;
  label: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const STAGE_CONFIGS: Record<ApplicationStage, StageConfig> = {
  applied: {
    key: 'applied',
    label: 'New Applied',
    icon: Clock,
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    badgeBorder: 'border-blue-500/20',
  },
  under_review: {
    key: 'under_review',
    label: 'Under Review',
    icon: Search,
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-600 dark:text-amber-400',
    badgeBorder: 'border-amber-500/20',
  },
  shortlisted: {
    key: 'shortlisted',
    label: 'Shortlisted',
    icon: UserCheck,
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-600 dark:text-purple-400',
    badgeBorder: 'border-purple-500/20',
  },
  interview: {
    key: 'interview',
    label: 'Interviewing',
    icon: Video,
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    badgeBorder: 'border-indigo-500/20',
  },
  offered: {
    key: 'offered',
    label: 'Offer Sent',
    icon: Gift,
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
  },
  hired: {
    key: 'hired',
    label: 'Hired',
    icon: CheckCircle2,
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-600 dark:text-teal-400',
    badgeBorder: 'border-teal-500/20',
  },
  rejected: {
    key: 'rejected',
    label: 'Rejected',
    icon: XCircle,
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeBorder: 'border-rose-500/20',
  },
  withdrawn: {
    key: 'withdrawn',
    label: 'Withdrawn',
    icon: XCircle,
    badgeBg: 'bg-slate-500/10',
    badgeText: 'text-slate-600 dark:text-slate-400',
    badgeBorder: 'border-slate-500/20',
  },
};

interface KanbanColumnProps {
  stage: ApplicationStage;
  applications: RecruiterApplicationItem[];
  onSelectApplication: (app: RecruiterApplicationItem) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  applications,
  onSelectApplication,
}) => {
  const config = STAGE_CONFIGS[stage] || STAGE_CONFIGS.applied;
  const Icon = config.icon;

  return (
    <div className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-[#0E1535]/80 border border-slate-200/90 dark:border-slate-800/80 p-3 min-w-[280px] w-full max-w-[340px] shrink-0 space-y-3 shadow-2xs">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 pt-1">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {config.label}
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
          {applications.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
        {applications.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 text-slate-400 text-xs font-medium">
            No applicants in this stage
          </div>
        ) : (
          applications.map((app) => (
            <ApplicantCard
              key={app.id}
              application={app}
              onSelect={onSelectApplication}
            />
          ))
        )}
      </div>
    </div>
  );
};
