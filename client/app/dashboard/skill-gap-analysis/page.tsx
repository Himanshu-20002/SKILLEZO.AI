'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { MetricCard } from '@/components/dashboard/career/MetricCard';
import { RoleSelector } from '@/components/dashboard/skill-gap-analysis/RoleSelector';
import { SkillRadarChart } from '@/components/dashboard/skill-gap-analysis/SkillRadarChart';
import { CompetencyTable } from '@/components/dashboard/skill-gap-analysis/CompetencyTable';
import { PriorityRecommendations } from '@/components/dashboard/skill-gap-analysis/PriorityRecommendations';

import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { SkillGapAnalysisData } from '@/types/career-intelligence';
import { Target, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillGapAnalysisPage() {
  const [data, setData] = useState<SkillGapAnalysisData>(mockCareerIntelligence.skillGapAnalysis);

  const handleSelectRole = (role: string) => {
    setData((prev) => ({
      ...prev,
      targetRole: role,
      overallMatchScore: role === 'Full-Stack Engineer' ? 72 : role === 'AI/ML Specialist' ? 65 : 68,
    }));
    toast.info(`Updated skill gap analysis for target role: ${role}`);
  };

  const handleAddToGap = (skillName: string) => {
    toast.success(`Added ${skillName} to active learning roadmap`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Skill Gap Analysis"
          description="Understand what skills you need to become job-ready for your target role."
          badge="Module 21 • Skill Gap Analysis"
        />

        {/* Role Selector Header */}
        <RoleSelector
          selectedRole={data.targetRole}
          roles={data.availableRoles}
          onSelectRole={handleSelectRole}
        />

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Role Match"
            value={`${data.overallMatchScore}%`}
            subtitle="Target Role Alignment"
            icon={Target}
            badge="Role Ready (72%)"
            trend="+4% this month"
          />
          <MetricCard
            title="Skills Acquired"
            value={data.skillsAcquiredCount}
            subtitle="Verified & self-reported"
            icon={CheckCircle2}
            color="text-emerald-500"
          />
          <MetricCard
            title="Skills Required"
            value={data.skillsRequiredCount}
            subtitle="Industry standards"
            icon={Cpu}
            color="text-[#3D5AFE]"
          />
          <MetricCard
            title="Skills Missing"
            value={data.skillsMissingCount}
            subtitle="Gaps to close"
            icon={AlertCircle}
            color="text-amber-500"
          />
        </div>

        {/* Radar / Category Proficiency Overview */}
        <SkillRadarChart categories={data.radarCategories} />

        {/* Competency Match Table */}
        <CompetencyTable competencies={data.competencies} onAddToGap={handleAddToGap} />

        {/* Priority Recommendations */}
        <PriorityRecommendations recommendations={data.priorityRecommendations} />
      </div>
    </DashboardLayout>
  );
}
