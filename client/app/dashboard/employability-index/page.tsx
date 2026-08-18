'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { EmployabilityGauge } from '@/components/dashboard/employability-index/EmployabilityGauge';
import { ScoreBreakdown } from '@/components/dashboard/employability-index/ScoreBreakdown';
import { StrengthsAndGaps } from '@/components/dashboard/employability-index/StrengthsAndGaps';
import { ActionList } from '@/components/dashboard/employability-index/ActionList';

import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { EmployabilityIndexData } from '@/types/career-intelligence';

export default function EmployabilityIndexPage() {
  const [data] = useState<EmployabilityIndexData>(mockCareerIntelligence.employabilityIndex);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Employability Index"
          description="Provide a consolidated career-readiness score and recruiter visibility evaluation."
          badge="Module 22 • Employability Index"
        />

        {/* Main Employability Gauge */}
        <EmployabilityGauge data={data} />

        {/* Score Breakdown Cards */}
        <ScoreBreakdown metrics={data.metrics} />

        {/* Strengths & Improvement Opportunities */}
        <StrengthsAndGaps strengths={data.strengths} improvementAreas={data.improvementAreas} />

        {/* Action List */}
        <ActionList actions={data.actionList} />
      </div>
    </DashboardLayout>
  );
}
