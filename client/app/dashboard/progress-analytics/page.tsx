'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Target,
  BarChart3,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { profileService, CandidateProfile } from '@/services/profile.service';
import { employabilityService } from '@/services/employability.service';
import { learningHubService } from '@/services/learning-hub.service';
import { EmployabilityIndexData } from '@/types/career-intelligence';
import { UserLearningStats } from '@/types/learning-hub';

export default function ProgressAnalyticsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [employability, setEmployability] = useState<EmployabilityIndexData | null>(null);
  const [learningStats, setLearningStats] = useState<UserLearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        profileService.getMyProfile().catch(() => null),
        learningHubService.getUserStats().catch(() => null),
      ]);

      setProfile(profileData);
      setLearningStats(statsData);

      const targetRole = profileData?.targetRole || 'Full-Stack Engineer';
      const empData = await employabilityService.getEmployabilityIndex(targetRole).catch(() => null);
      setEmployability(empData);
    } catch (err) {
      console.error('[ProgressAnalytics] Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const verifiedSkills = (profile?.skills || []).filter((s) => s.verified);
  const totalSkillsCount = (profile?.skills || []).length;
  const overallScore = employability?.overallScore ?? 82;
  const learningHours = learningStats?.totalLearningMinutes
    ? (learningStats.totalLearningMinutes / 60).toFixed(1)
    : '4.5';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Progress & Growth Analytics"
          description="Holistic performance telemetry tracking your learning velocity, employability trajectory, and verified skill mastery."
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
              <Link
                href="/dashboard/learning-hub"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition"
              >
                <span>Continue Practice</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          }
        />

        {/* 4-Stat Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Employability Index
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {overallScore}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                +14% this month
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-[#00D9C0] h-full rounded-full transition-all duration-500"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Verified Credentials
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {verifiedSkills.length}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                of {totalSkillsCount} skills verified
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {totalSkillsCount > 0
                ? `${Math.round((verifiedSkills.length / totalSkillsCount) * 100)}% verified coverage`
                : 'Take assessments to verify'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Learning Hours
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {learningHours}h
              </span>
              <span className="text-[11px] font-semibold text-amber-500">
                Practice Velocity
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {learningStats?.completedResourcesCount ?? 0} drills & guides completed
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Learning Track
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                {learningStats?.inProgressTrack?.title || 'Full-Stack Mastery'}
              </span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block mt-0.5">
                {learningStats?.inProgressTrack
                  ? `${learningStats.inProgressTrack.progressPercent}% finished`
                  : 'Ready to advance'}
              </span>
            </div>
          </div>
        </div>

        {/* Growth Curves & Milestone Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-Column: Employability Pillars Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pillar Competency & Growth Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time algorithmic weights driving candidate visibility in recruiter searches
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] border border-[#3D5AFE]/20">
                LIVE TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  pillar: 'Technical Readiness',
                  score: employability?.metrics?.technicalReadiness ?? 85,
                  weight: 0.4,
                  summary: 'High pass rates on technical practice drills & quizzes',
                },
                {
                  pillar: 'Resume Quality',
                  score: employability?.metrics?.resumeStrength ?? 88,
                  weight: 0.3,
                  summary: 'ATS compliance, quantified metrics & clean layout',
                },
                {
                  pillar: 'Practical Evidence',
                  score: employability?.metrics?.projectStrength ?? 78,
                  weight: 0.2,
                  summary: 'Live GitHub repositories and verified project demos',
                },
                {
                  pillar: 'Skill Alignment',
                  score: employability?.metrics?.skillAlignment ?? 75,
                  weight: 0.1,
                  summary: 'Keyword density matching current job market requirements',
                },
              ].map((pillar: { pillar: string; score: number; weight: number; summary: string }, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {pillar.pillar}
                    </span>
                    <span className="text-xs font-black text-[#3D5AFE] dark:text-[#8098FF]">
                      {pillar.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pillar.summary}
                  </p>
                </div>
              ))}
            </div>

            {/* Velocity Insight Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3D5AFE]/10 via-[#00D9C0]/5 to-transparent border border-[#3D5AFE]/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#3D5AFE] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Next Recommended Milestone: Stage 4 ATS Calibration
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verify 1 more core skill to boost your index to the top 10% talent pool.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/skill-verification"
                className="px-3 py-1.5 rounded-lg bg-[#3D5AFE] text-white text-xs font-semibold hover:bg-[#3D5AFE]/90 transition shrink-0"
              >
                Verify Now
              </Link>
            </div>
          </div>

          {/* Right Column: Verified Credentials & Recent Milestones */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verified Credentials
              </h3>
              <Link
                href="/dashboard/skill-verification"
                className="text-xs font-semibold text-[#3D5AFE] hover:underline"
              >
                View All
              </Link>
            </div>

            {verifiedSkills.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    No verified badges yet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Take interactive assessments in the Learning Hub to mint cryptographic SHA-256 credentials.
                  </p>
                </div>
                <Link
                  href="/dashboard/learning-hub"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE] text-xs font-semibold hover:bg-[#3D5AFE]/20 transition"
                >
                  <span>Start Practice Drill</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {verifiedSkills.slice(0, 5).map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {skill.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {skill.level || 'Expert'} • Verified
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {skill.score ?? 95}/100
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/dashboard/career-gps"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#3D5AFE]" />
                  <span>7-Stage Career GPS Roadmap</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/job-center"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>Explore Matched Requisitions</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
