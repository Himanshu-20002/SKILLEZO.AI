'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { ProfileCompletionGuide } from '@/components/dashboard/ProfileCompletionGuide';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { RecentVerificationTable } from '@/components/dashboard/RecentVerificationTable';
import { profileService, CandidateProfile } from '@/services/profile.service';
import { resumeService } from '@/services/resume.service';
import { verificationService } from '@/services/verification.service';

export default function DashboardPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumesCount, setResumesCount] = useState<number>(0);
  const [verifiedSkillsCount, setVerifiedSkillsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [profileData, userResumes, records] = await Promise.all([
          profileService.getMyProfile().catch(() => null),
          resumeService.getUserResumes().catch(() => []),
          verificationService.getUserRecords().catch(() => []),
        ]);

        if (!isMounted) return;

        if (profileData) setProfile(profileData);
        setResumesCount(userResumes?.length || 0);
        const verified = (records || []).filter((r) => r.status === 'verified').length;
        setVerifiedSkillsCount(verified);
      } catch (err) {
        console.error('Error loading dashboard onboarding data:', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Profile Completion Onboarding Guide */}
        <ProfileCompletionGuide
          profile={profile}
          resumesCount={resumesCount}
          verifiedSkillsCount={verifiedSkillsCount}
        />

        {/* Top Summary Metrics */}
        <DashboardSummary />

        {/* 4 Core Stat Cards */}
        <StatsGrid />

        {/* Middle Section: Quick Actions & Live Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          <ActivityTimeline />
        </div>

        {/* Bottom Section: Recent Verification Table */}
        <RecentVerificationTable />
      </div>
    </DashboardLayout>
  );
}
