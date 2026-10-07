'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { StatMetric } from '@/types/dashboard';
import { profileService } from '@/services/profile.service';
import { verificationService } from '@/services/verification.service';

interface StatsGridProps {
  profile?: import('@/services/profile.service').CandidateProfile | null;
  records?: import('@/types/verification').SkillVerificationRecord[];
  isLoading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  profile: profileProp,
  records: recordsProp,
  isLoading: isLoadingProp,
}) => {
  const [metrics, setMetrics] = useState<StatMetric[]>([]);
  const [loading, setLoading] = useState(isLoadingProp !== undefined ? isLoadingProp : !profileProp);

  const computeMetrics = (
    profile: import('@/services/profile.service').CandidateProfile | null,
    records: import('@/types/verification').SkillVerificationRecord[]
  ): StatMetric[] => {
    const verifiedRecords = (records || []).filter((r) => r.status === 'verified');
    const verifiedCount = verifiedRecords.length;
    const passedAssessmentsCount = (records || []).filter(
      (r) => r.status === 'verified' || (r.score && r.score >= 70)
    ).length;
    const totalSkills = profile?.skills?.length || 0;
    const readiness = profile?.completionPercentage ?? 10;

    const verifiedProgress = totalSkills > 0 ? Math.min(100, Math.round((verifiedCount / totalSkills) * 100)) : (verifiedCount > 0 ? 100 : 0);
    const assessmentProgress = (records || []).length > 0 ? Math.min(100, Math.round((passedAssessmentsCount / Math.max((records || []).length, 1)) * 100)) : 0;
    const certProgress = verifiedCount > 0 ? Math.min(100, verifiedCount * 25) : 0;

    return [
      {
        id: 'stat-1',
        title: 'Verified Skills',
        value: verifiedCount,
        change: verifiedCount > 0 ? 100 : 0,
        changeType: verifiedCount > 0 ? 'increase' : 'neutral',
        timeframe: verifiedCount > 0 ? `${verifiedCount} of ${totalSkills || verifiedCount} verified` : 'Take quiz to verify',
        iconName: 'Award',
        description: verifiedCount > 0 ? `${verifiedCount} skills verified` : 'No skills verified yet',
        progress: verifiedProgress,
        badgeText: verifiedCount > 0 ? 'Verified' : 'Pending',
      },
      {
        id: 'stat-2',
        title: 'Assessments Passed',
        value: passedAssessmentsCount,
        change: passedAssessmentsCount > 0 ? 100 : 0,
        changeType: passedAssessmentsCount > 0 ? 'increase' : 'neutral',
        timeframe: passedAssessmentsCount > 0 ? 'Verified skill tests' : 'No tests taken',
        iconName: 'CheckCircle2',
        description: passedAssessmentsCount > 0 ? `${passedAssessmentsCount} assessments passed` : 'Start with your first quiz',
        progress: assessmentProgress,
        badgeText: passedAssessmentsCount > 0 ? 'Passed' : 'Quiz Ready',
      },
      {
        id: 'stat-3',
        title: 'Profile Readiness',
        value: `${readiness}%`,
        change: readiness >= 60 ? 15 : 0,
        changeType: readiness >= 60 ? 'increase' : 'neutral',
        timeframe: readiness >= 80 ? 'Enterprise recruiter ready' : 'In onboarding',
        iconName: 'TrendingUp',
        description: readiness >= 80 ? 'High recruiter visibility' : 'Complete profile steps',
        progress: readiness,
        badgeText: readiness >= 80 ? 'Optimal' : 'Active',
      },
      {
        id: 'stat-4',
        title: 'Certifications',
        value: verifiedCount,
        change: 0,
        changeType: 'neutral',
        timeframe: verifiedCount > 0 ? 'Badges active' : 'None yet',
        iconName: 'ShieldCheck',
        description: verifiedCount > 0 ? `${verifiedCount} SHA-256 credentials` : 'Earn first credential badge',
        progress: certProgress,
        badgeText: verifiedCount > 0 ? `${verifiedCount} Active` : 'Earn Badge',
      },
    ];
  };

  useEffect(() => {
    if (profileProp !== undefined && recordsProp !== undefined) {
      setMetrics(computeMetrics(profileProp, recordsProp));
      if (isLoadingProp !== undefined) setLoading(isLoadingProp);
      else setLoading(false);
    }
  }, [profileProp, recordsProp, isLoadingProp]);

  useEffect(() => {
    if (profileProp !== undefined && recordsProp !== undefined) return;

    let isMounted = true;

    async function loadStats() {
      try {
        const [profile, records] = await Promise.all([
          profileService.getMyProfile().catch(() => null),
          verificationService.getUserRecords().catch(() => []),
        ]);

        if (!isMounted) return;

        setMetrics(computeMetrics(profile, records || []));
      } catch (err) {
        console.error('Error loading stats metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [profileProp, recordsProp]);

  if (loading && metrics.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div
            key={id}
            className="h-32 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <StatCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
};
