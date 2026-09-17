'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Target, 
  FileText, 
  Code2, 
  Award, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { CandidateProfile } from '@/services/profile.service';

interface ProfileCompletionGuideProps {
  profile: CandidateProfile | null;
  resumesCount?: number;
  verifiedSkillsCount?: number;
}

export const ProfileCompletionGuide: React.FC<ProfileCompletionGuideProps> = ({
  profile,
  resumesCount = 0,
  verifiedSkillsCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasTargetRole = Boolean(profile?.targetRole && profile.targetRole.trim().length > 0);
  const hasResume = resumesCount > 0;
  const hasSkills = (profile?.skills?.length || 0) >= 3;
  const hasVerifiedSkill = verifiedSkillsCount > 0 || (profile?.skills?.some((s) => s.verified) ?? false);

  const steps = [
    {
      id: 'target-role',
      title: 'Set Target Career Role',
      description: 'Define the engineering role you want recruiters and AI benchmarks to match.',
      completed: hasTargetRole,
      badge: '+15%',
      icon: Target,
      href: '/dashboard/profile',
      actionLabel: 'Set Role',
    },
    {
      id: 'resume',
      title: 'Upload Master Resume',
      description: 'Unlock deterministic ATS audit, role alignment score, and live editor.',
      completed: hasResume,
      badge: '+35%',
      icon: FileText,
      href: '/dashboard/resume-studio',
      actionLabel: 'Upload Resume',
    },
    {
      id: 'skills',
      title: 'Add Top Technical Skills',
      description: 'Add at least 3 core technologies or frameworks to your candidate profile.',
      completed: hasSkills,
      badge: '+25%',
      icon: Code2,
      href: '/dashboard/profile',
      actionLabel: 'Add Skills',
    },
    {
      id: 'verification',
      title: 'Verify Your First Skill',
      description: 'Pass a 5-minute technical assessment to earn an on-chain SHA-256 verified badge.',
      completed: hasVerifiedSkill,
      badge: '+25%',
      icon: Award,
      href: '/dashboard/assessments',
      actionLabel: 'Take Quiz',
    },
  ];

  const completedStepsCount = steps.filter((s) => s.completed).length;
  const completionPercentage = profile?.completionPercentage ?? Math.round((completedStepsCount / steps.length) * 100);

  if (completionPercentage >= 100) {
    return null; // Automatically clean up once profile is fully completed
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white/90 via-indigo-50/40 to-white/90 dark:from-slate-900/80 dark:via-indigo-950/20 dark:to-slate-900/80 border border-indigo-100 dark:border-indigo-900/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-7 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Complete Your Career Profile
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {completedStepsCount} of {steps.length} Steps
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Finish onboarding to unlock higher recruiter visibility, verified credentials, and personalized job matches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-slate-400">Profile Readiness</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {completionPercentage}%
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand Guide" : "Collapse Guide"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(completionPercentage, 8)}%` }}
        />
      </div>

      {/* Actionable Steps Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6">
          {steps.map((step) => {
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                  step.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/[0.06] hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${step.completed ? 'text-slate-700 dark:text-slate-300 line-through opacity-75' : 'text-slate-900 dark:text-white'}`}>
                        {step.title}
                      </span>
                      {!step.completed && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>

                {!step.completed && (
                  <Link
                    href={step.href}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionGuide;
