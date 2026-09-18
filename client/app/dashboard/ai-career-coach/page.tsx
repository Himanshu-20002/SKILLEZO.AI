'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CareerCoachWorkbench } from '@/components/dashboard/ai-career-coach';

export default function AICareerCoachPage() {
  return (
    <DashboardLayout>
      <CareerCoachWorkbench />
    </DashboardLayout>
  );
}
