'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Bot,
  UserCheck,
  Shield,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export interface OnboardingMilestone {
  id: string;
  label: string;
  description: string;
  href: string;
  isCompleted: boolean;
  iconName: 'FileText' | 'Bot' | 'UserCheck' | 'Shield';
}

interface FloatingOnboardingDockProps {
  isTourActive?: boolean;
  resumesCount?: number;
  verifiedSkillsCount?: number;
  hasProfileGoal?: boolean;
  onReplayTour: () => void;
  onOpenWelcome: () => void;
}

export function FloatingOnboardingDock({
  isTourActive = false,
  resumesCount = 0,
  verifiedSkillsCount = 0,
  hasProfileGoal = false,
  onReplayTour,
  onOpenWelcome,
}: FloatingOnboardingDockProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Compute live milestones based on user real profile state
  const milestones: OnboardingMilestone[] = [
    {
      id: 'm-resume',
      label: 'Upload Master Resume',
      description: 'Unlock ATS scoring & automated bullet point tailoring',
      href: '/dashboard/resume-studio',
      isCompleted: resumesCount > 0,
      iconName: 'FileText',
    },
    {
      id: 'm-profile',
      label: 'Complete Target Role Profile',
      description: 'Set your target title & industry benchmarks',
      href: '/dashboard/profile',
      isCompleted: hasProfileGoal,
      iconName: 'UserCheck',
    },
    {
      id: 'm-interview',
      label: 'Practice Voice Mock Interview',
      description: 'Get speech cadence & STAR rubric evaluation',
      href: '/dashboard/interview-coach',
      isCompleted: false, // will update when session logged
      iconName: 'Bot',
    },
    {
      id: 'm-verification',
      label: 'Verify Core Skill Credential',
      description: 'Earn tamper-proof employability badge',
      href: '/dashboard/career-gps',
      isCompleted: verifiedSkillsCount > 0,
      iconName: 'Shield',
    },
  ];

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  // Hide dock while spotlight tour modal is actively guiding
  if (isTourActive) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 select-none"
      data-testid="floating-onboarding-dock"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-3 w-80 sm:w-96 rounded-2xl bg-[#0D153A]/95 border border-[#3D5AFE]/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 text-white overflow-hidden"
            data-testid="onboarding-dock-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#3D5AFE]/20 text-[#3D5AFE]">
                  <Compass className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Onboarding Guide
                  </h4>
                  <p className="text-[11px] text-white/50">
                    {completedCount} of {milestones.length} milestones unlocked
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Collapse onboarding guide"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="my-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/60">Readiness Progress</span>
                <span className="font-mono-num font-bold text-[#00D9C0]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#3D5AFE] via-[#00D9C0] to-emerald-400"
                />
              </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {milestones.map((milestone) => (
                <Link
                  key={milestone.id}
                  href={milestone.href}
                  className="group flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="mt-0.5 shrink-0">
                    {milestone.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold truncate ${
                          milestone.isCompleted
                            ? 'line-through text-white/50'
                            : 'text-white group-hover:text-[#00D9C0] transition-colors'
                        }`}
                      >
                        {milestone.label}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-white/30 group-hover:text-white transition-colors shrink-0 ml-1" />
                    </div>
                    <p className="text-[10px] text-white/50 truncate mt-0.5">
                      {milestone.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Actions: Replay Tour & Welcome Modal */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onReplayTour();
                }}
                data-testid="dock-replay-tour-btn"
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white hover:underline transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#00D9C0]" />
                <span>Replay Tour</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenWelcome();
                }}
                data-testid="dock-open-welcome-btn"
                className="inline-flex items-center gap-1 text-[#3D5AFE] hover:text-[#3D5AFE]/80 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Superpowers</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button Pill */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid="dock-trigger-btn"
        className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0D153A]/90 hover:bg-[#0D153A] border border-[#3D5AFE]/40 hover:border-[#00D9C0]/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] text-white backdrop-blur-xl transition-all cursor-pointer group"
      >
        {/* Subtle breathing glow ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#3D5AFE]/20 to-[#00D9C0]/20 blur-sm pointer-events-none group-hover:opacity-100 transition-opacity" />

        <div className="relative flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#3D5AFE]/20 text-[#3D5AFE]">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          </span>

          <span className="text-xs font-bold tracking-tight">
            Guide
          </span>

          <span className="px-1.5 py-0.5 rounded-md bg-[#00D9C0]/15 text-[#00D9C0] text-[10px] font-mono-num font-bold">
            {progressPercent}%
          </span>

          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/50" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-white/50" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
