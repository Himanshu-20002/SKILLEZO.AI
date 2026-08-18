'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { CareerGoalHeader } from '@/components/dashboard/career-gps/CareerGoalHeader';
import { RoadmapTimeline } from '@/components/dashboard/career-gps/RoadmapTimeline';
import { CurrentMilestoneWidget } from '@/components/dashboard/career-gps/CurrentMilestoneWidget';
import { SalaryProgressionChart } from '@/components/dashboard/career-gps/SalaryProgressionChart';

import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { CareerGPSData } from '@/types/career-intelligence';

export default function CareerGPSPage() {
  const [data] = useState<CareerGPSData>(mockCareerIntelligence.careerRoadmap);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Career GPS"
          description="Your personalized path from profile completion to job readiness."
          badge="Module 23 • Career GPS"
        />

        {/* Career Goal Header */}
        <CareerGoalHeader data={data} />

        {/* Current Milestone Highlight */}
        <CurrentMilestoneWidget milestone={data.currentMilestone} />

        {/* 7-Stage Roadmap Timeline */}
        <RoadmapTimeline stages={data.stages} />

        {/* Salary Progression Chart */}
        <SalaryProgressionChart items={data.salaryProgression} />
      </div>
    </DashboardLayout>
  );
}
