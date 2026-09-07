'use client';

import React from 'react';
import {
  FileText,
  Award,
  Calendar,
  ChevronRight,
  TrendingUp,
  User,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { RecruiterApplicationItem, ApplicationStage } from '@/services/recruiter.service';

interface ApplicantCardProps {
  application: RecruiterApplicationItem;
  onSelect: (app: RecruiterApplicationItem) => void;
  onQuickStatusChange?: (appId: string, nextStatus: ApplicationStage) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  application,
  onSelect,
  onQuickStatusChange,
}) => {
  const candidateName =
    application.candidate?.name ||
    (application.candidate?.email
      ? application.candidate.email.split('@')[0].replace(/[._]/g, ' ')
      : 'Candidate Applicant');

  const jobTitle = application.job?.title || 'Engineering Role';
  const appliedDate = application.appliedAt
    ? new Date(application.appliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  // Deterministic mock match score if not provided
  const matchScore =
    application.candidate?.employabilityScore ||
    Math.floor(82 + (application.id.charCodeAt(0) % 16));

  const candidateSkills = application.candidate?.skills || ['React', 'TypeScript', 'Node.js'];

  return (
    <div
      onClick={() => onSelect(application)}
      className="p-4 rounded-2xl bg-white dark:bg-[#111736] border border-slate-200/90 dark:border-slate-800 hover:border-[#3D5AFE]/50 dark:hover:border-[#3D5AFE]/50 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer space-y-3 group backdrop-blur-md relative"
    >
      {/* Top Row: Candidate Name & Match Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate group-hover:text-[#3D5AFE] dark:group-hover:text-[#8098FF] transition-colors">
            {candidateName}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {jobTitle}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold">
          <TrendingUp className="w-3 h-3" />
          <span>{matchScore}%</span>
        </div>
      </div>

      {/* Verified Skills Pill Row */}
      <div className="flex flex-wrap gap-1">
        {candidateSkills.slice(0, 3).map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-[#182046] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
            <span>{skill}</span>
          </span>
        ))}
        {candidateSkills.length > 3 && (
          <span className="text-[10px] text-slate-400 font-medium self-center">
            +{candidateSkills.length - 3}
          </span>
        )}
      </div>

      {/* Resume File Snippet */}
      {application.resume && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#182046] border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
          <FileText className="w-3.5 h-3.5 text-[#3D5AFE] shrink-0" />
          <span className="truncate font-mono font-medium">
            {application.resume.originalFileName || application.resume.title}
          </span>
        </div>
      )}

      {/* Footer Meta: Applied date & Review Action */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{appliedDate}</span>
        </div>

        <div className="flex items-center gap-1 text-[#3D5AFE] dark:text-[#8098FF] font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Review Drawer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
