'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentPortalHeader } from '@/components/dashboard/student-portal/StudentPortalHeader';
import { AICareerCoachWidget } from '@/components/dashboard/student-portal/AICareerCoachWidget';
import { StudentPortalGrid } from '@/components/dashboard/student-portal/StudentPortalGrid';

export default function StudentPortalDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Student Portal Hero Header */}
        <StudentPortalHeader />

        {/* AI Career Coach Quick Prompt Launcher */}
        <AICareerCoachWidget />

        {/* Full Feature Modules Grid */}
        <StudentPortalGrid />
      </div>
    </DashboardLayout>
  );
}
