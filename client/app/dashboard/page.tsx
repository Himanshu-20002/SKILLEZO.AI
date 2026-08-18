'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { RecentVerificationTable } from '@/components/dashboard/RecentVerificationTable';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

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
