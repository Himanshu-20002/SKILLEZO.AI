'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { ProfileCompletionGuide } from '@/components/dashboard/ProfileCompletionGuide';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { RecentVerificationTable } from '@/components/dashboard/RecentVerificationTable';
import {
  useFtuxState,
  FtuxWelcomeModal,
  DashboardSpotlightTour,
  FloatingOnboardingDock,
} from '@/components/dashboard/ftux';
import { useSession } from '@/lib/auth-client';
import { profileService, CandidateProfile } from '@/services/profile.service';
import { resumeService } from '@/services/resume.service';
import { verificationService } from '@/services/verification.service';

export default function DashboardPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumesCount, setResumesCount] = useState<number>(0);
  const [records, setRecords] = useState<any[]>([]);
  const [verifiedSkillsCount, setVerifiedSkillsCount] = useState<number>(0);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const ftux = useFtuxState(profile?.userId || session?.user?.id);

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

  const candidateSkills = useMemo(() => {
    if (!profile?.skills || !Array.isArray(profile.skills)) return [];
    return profile.skills.map((s) => s.name).filter(Boolean);
  }, [profile]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <QuickActions />
          <ActivityTimeline userSkills={candidateSkills} isLoading={isLoading} />
        </div>

        {/* Bottom Section: Recent Verification Table */}
        <RecentVerificationTable records={records} isLoading={isLoading} />

        {/* First-Time User Experience (FTUX) Guides */}
        <FtuxWelcomeModal
          isOpen={ftux.showWelcomeModal}
          userName={session?.user?.name || 'Candidate'}
          onStartTour={ftux.startTour}
          onDismiss={ftux.dismissWelcome}
        />

        <DashboardSpotlightTour
          isActive={ftux.isTourActive}
          currentStep={ftux.currentStep}
          currentStepIndex={ftux.currentStepIndex}
          totalSteps={ftux.totalSteps}
          onNext={ftux.nextTourStep}
          onPrev={ftux.prevTourStep}
          onSkip={ftux.skipTour}
        />

        <FloatingOnboardingDock
          isTourActive={ftux.isTourActive}
          resumesCount={resumesCount}
          verifiedSkillsCount={verifiedSkillsCount}
          hasProfileGoal={Boolean(profile?.targetRole || profile?.headline)}
          onReplayTour={ftux.replayTour}
          onOpenWelcome={ftux.openWelcomeModal}
        />
      </div>
    </DashboardLayout>
  );
}
