'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { StatMetric } from '@/types/dashboard';
import { profileService } from '@/services/profile.service';
import { verificationService } from '@/services/verification.service';

export const StatsGrid: React.FC = () => {
  const [metrics, setMetrics] = useState<StatMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const [profile, records] = await Promise.all([
          profileService.getMyProfile().catch(() => null),
          verificationService.getUserRecords().catch(() => []),
        ]);

        if (!isMounted) return;

        const verifiedRecords = (records || []).filter((r) => r.status === 'verified');
        const verifiedCount = verifiedRecords.length;
        const passedAssessmentsCount = (records || []).filter((r) => r.status === 'verified' || (r.score && r.score >= 70)).length;
        const readiness = profile?.completionPercentage ?? 10;

        const liveMetrics: StatMetric[] = [
          {
            id: 'stat-1',
            title: 'Verified Skills',
            value: verifiedCount,
            change: verifiedCount > 0 ? 100 : 0,
            changeType: verifiedCount > 0 ? 'increase' : 'neutral',
            timeframe: verifiedCount > 0 ? `${verifiedCount} skills verified` : 'Take quiz to verify',
            iconName: 'Award',
            description: verifiedCount > 0 ? `${verifiedCount} skills verified` : 'No skills verified yet',
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
          },
        ];

        setMetrics(liveMetrics);
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
  }, []);

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
