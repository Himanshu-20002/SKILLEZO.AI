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
  const [records, setRecords] = useState<any[]>([]);
  const [verifiedSkillsCount, setVerifiedSkillsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [profileData, userResumes, recordsData] = await Promise.all([
          profileService.getMyProfile().catch(() => null),
          resumeService.getUserResumes().catch(() => []),
          verificationService.getUserRecords().catch(() => []),
        ]);

        if (!isMounted) return;

        if (profileData) setProfile(profileData);
        setResumesCount(userResumes?.length || 0);
        setRecords(recordsData || []);
        const verified = (recordsData || []).filter((r: any) => r.status === 'verified').length;
        setVerifiedSkillsCount(verified);
      } catch (err) {
        console.error('Error loading dashboard onboarding data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
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
        <WelcomeBanner
          profile={profile}
          records={records}
          isLoading={isLoading}
          resumesCount={resumesCount}
        />

        {/* Profile Completion Onboarding Guide */}
        <ProfileCompletionGuide
          profile={profile}
          resumesCount={resumesCount}
          verifiedSkillsCount={verifiedSkillsCount}
        />

        {/* Top Summary Metrics */}
        <DashboardSummary profile={profile} records={records} isLoading={isLoading} />

        {/* 4 Core Stat Cards */}
        <StatsGrid profile={profile} records={records} isLoading={isLoading} />

        {/* Middle Section: Quick Actions & Live Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          <ActivityTimeline records={records} isLoading={isLoading} />
        </div>

        {/* Bottom Section: Recent Verification Table */}
        <RecentVerificationTable records={records} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
